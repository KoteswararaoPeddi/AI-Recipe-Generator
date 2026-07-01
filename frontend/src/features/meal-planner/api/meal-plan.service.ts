import axiosInstance from "@lib/axios.config"
import type { ApiResponse } from "@shared/types/api-response"
import type { Recipe } from "@features/recipes/types/recipe.types"

// A planned meal: the slot + full recipe so the grid can render it directly.
export type MealEntry = {
  id: string
  date: string
  slot: string
  recipe: Recipe
}

export async function listMealPlan(weekStart: string, weekEnd: string): Promise<MealEntry[]> {
  const res = await axiosInstance.get<ApiResponse<MealEntry[]>>("/meal-plan", {
    params: { weekStart, weekEnd },
  })
  return res.data.data
}

export async function assignMeal(input: {
  date: string
  slot: string
  recipeId: string
}): Promise<MealEntry> {
  const res = await axiosInstance.post<ApiResponse<MealEntry>>("/meal-plan", input)
  return res.data.data
}

export async function removeMeal(id: string): Promise<void> {
  await axiosInstance.delete(`/meal-plan/${id}`)
}
