import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { GenerateRecipeDto } from "./dto/generate-recipe.dto";
import { SaveRecipeDto } from "./dto/save-recipe.dto";
import { RecipesService } from "./recipes.service";

@ApiTags("Recipes")
@ApiCookieAuth("access_token")
@Controller("recipes")
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}

  @ApiOperation({ summary: "List saved recipes" })
  @ApiResponse({ status: 200, description: "Saved recipes" })
  @Get()
  async list(@CurrentUser("id") userId: string) {
    return { message: "Saved recipes", data: await this.recipes.list(userId) };
  }

  @ApiOperation({ summary: "Generate a recipe", description: "Calls Gemini with the filters (+ pantry). Not persisted." })
  @ApiResponse({ status: 201, description: "Recipe generated" })
  @ApiResponse({ status: 503, description: "AI temporarily unavailable" })
  @Post("generate")
  async generate(@CurrentUser("id") userId: string, @Body() dto: GenerateRecipeDto) {
    return { message: "Recipe generated", data: await this.recipes.generate(userId, dto) };
  }

  @ApiOperation({ summary: "Get a saved recipe" })
  @ApiResponse({ status: 200, description: "Recipe" })
  @ApiResponse({ status: 404, description: "Recipe not found" })
  @Get(":id")
  async get(@CurrentUser("id") userId: string, @Param("id") id: string) {
    return { message: "Recipe", data: await this.recipes.get(userId, id) };
  }

  @ApiOperation({ summary: "Save a recipe" })
  @ApiResponse({ status: 201, description: "Recipe saved" })
  @Post()
  async save(@CurrentUser("id") userId: string, @Body() dto: SaveRecipeDto) {
    return { message: "Recipe saved", data: await this.recipes.save(userId, dto) };
  }

  @ApiOperation({ summary: "Delete a saved recipe" })
  @ApiResponse({ status: 200, description: "Recipe deleted" })
  @ApiResponse({ status: 404, description: "Recipe not found" })
  @HttpCode(HttpStatus.OK)
  @Delete(":id")
  async remove(@CurrentUser("id") userId: string, @Param("id") id: string) {
    await this.recipes.remove(userId, id);
    return { message: "Recipe deleted", data: null };
  }
}
