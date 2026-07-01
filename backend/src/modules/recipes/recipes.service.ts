import { Injectable, NotFoundException } from "@nestjs/common";

import { PrismaService } from "../../prisma/prisma.service";
import { PantryService } from "../pantry/pantry.service";
import { GeminiService } from "./ai/gemini.service";
import { buildRecipePrompt } from "./ai/recipe-prompt";
import { GenerateRecipeDto } from "./dto/generate-recipe.dto";
import { SaveRecipeDto } from "./dto/save-recipe.dto";
import { contentToCreateData, recipeToView, RecipeContent, RecipeView } from "./recipe.mapper";

@Injectable()
export class RecipesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gemini: GeminiService,
    private readonly pantry: PantryService,
  ) {}

  /** Generates a recipe via Gemini. Not persisted — the client saves it explicitly. */
  async generate(userId: string, dto: GenerateRecipeDto): Promise<RecipeView> {
    const [pantryNames, savedTitles] = await Promise.all([
      dto.usePantry ? this.pantry.list(userId).then((items) => items.map((i) => i.name)) : [],
      this.prisma.recipe
        .findMany({ where: { userId }, select: { title: true }, orderBy: { createdAt: "desc" } })
        .then((rows) => rows.map((r) => r.title)),
    ]);

    // Pass the user's saved titles so the AI avoids regenerating a recipe they already have.
    const prompt = buildRecipePrompt(dto, pantryNames, savedTitles);
    const content = await this.gemini.generateRecipe(prompt);
    // id is empty until the user saves it.
    return { id: "", ...content };
  }

  async list(userId: string): Promise<RecipeView[]> {
    const recipes = await this.prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return recipes.map(recipeToView);
  }

  async get(userId: string, id: string): Promise<RecipeView> {
    const recipe = await this.prisma.recipe.findFirst({ where: { id, userId } });
    if (!recipe) {
      throw new NotFoundException("Recipe not found.");
    }
    return recipeToView(recipe);
  }

  async save(userId: string, dto: SaveRecipeDto): Promise<RecipeView> {
    const recipe = await this.prisma.recipe.create({
      data: contentToCreateData(userId, dto as unknown as RecipeContent),
    });
    return recipeToView(recipe);
  }

  async remove(userId: string, id: string): Promise<void> {
    const { count } = await this.prisma.recipe.deleteMany({ where: { id, userId } });
    if (count === 0) {
      throw new NotFoundException("Recipe not found.");
    }
  }
}
