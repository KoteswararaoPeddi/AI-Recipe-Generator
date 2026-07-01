import { Prisma, Recipe } from "@prisma/client";

import {
  CUISINE_TO_LABEL,
  DIET_TO_LABEL,
  DIFFICULTY_TO_LABEL,
  labelToCuisine,
  labelToDiet,
  labelToDifficulty,
} from "../../common/enums/enum-maps";

export interface RecipeIngredientView {
  amount: string;
  name: string;
}

export interface RecipeNutritionView {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
}

/** Client-facing recipe shape — matches the frontend `Recipe` type (enums as labels). */
export interface RecipeView {
  id: string;
  title: string;
  description: string;
  cuisine: string;
  difficulty: string;
  diet: string;
  dietTags: string[];
  minutes: number;
  prepMinutes?: number;
  cookMinutes?: number;
  servings: number;
  ingredients: RecipeIngredientView[];
  steps: string[];
  nutrition: RecipeNutritionView;
  tips: string[];
}

/** The recipe content the AI produces / the client saves (everything except identity). */
export type RecipeContent = Omit<RecipeView, "id">;

export function recipeToView(recipe: Recipe): RecipeView {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    cuisine: CUISINE_TO_LABEL[recipe.cuisine],
    difficulty: DIFFICULTY_TO_LABEL[recipe.difficulty],
    diet: DIET_TO_LABEL[recipe.diet],
    dietTags: recipe.dietTags,
    minutes: recipe.totalMinutes,
    prepMinutes: recipe.prepMinutes ?? undefined,
    cookMinutes: recipe.cookMinutes ?? undefined,
    servings: recipe.servings,
    ingredients: recipe.ingredients as unknown as RecipeIngredientView[],
    steps: recipe.steps as unknown as string[],
    nutrition: recipe.nutrition as unknown as RecipeNutritionView,
    tips: recipe.tips as unknown as string[],
  };
}

/** Builds the Prisma create payload from saved recipe content (labels → enums). */
export function contentToCreateData(
  userId: string,
  content: RecipeContent,
): Prisma.RecipeUncheckedCreateInput {
  return {
    userId,
    title: content.title,
    description: content.description,
    cuisine: labelToCuisine(content.cuisine),
    diet: labelToDiet(content.diet),
    dietTags: content.dietTags ?? [],
    difficulty: labelToDifficulty(content.difficulty),
    servings: content.servings,
    totalMinutes: content.minutes,
    prepMinutes: content.prepMinutes ?? null,
    cookMinutes: content.cookMinutes ?? null,
    ingredients: content.ingredients as unknown as Prisma.InputJsonValue,
    steps: content.steps as unknown as Prisma.InputJsonValue,
    nutrition: content.nutrition as unknown as Prisma.InputJsonValue,
    tips: content.tips as unknown as Prisma.InputJsonValue,
    source: "AI",
  };
}
