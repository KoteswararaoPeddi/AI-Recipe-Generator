import axiosInstance from "@lib/axios.config"
import type { ApiResponse } from "@shared/types/api-response"
import type { GenerateParams } from "@features/generator/components/GeneratorForm"

import type { Recipe } from "../types/recipe.types"

export async function generateRecipe(params: GenerateParams): Promise<Recipe> {
  const res = await axiosInstance.post<ApiResponse<Recipe>>("/recipes/generate", params)
  return res.data.data
}

export async function listRecipes(): Promise<Recipe[]> {
  const res = await axiosInstance.get<ApiResponse<Recipe[]>>("/recipes")
  return res.data.data
}

export async function getRecipe(id: string): Promise<Recipe> {
  const res = await axiosInstance.get<ApiResponse<Recipe>>(`/recipes/${id}`)
  return res.data.data
}

export async function saveRecipe(recipe: Recipe): Promise<Recipe> {
  // The server assigns the id — send the content only.
  const { id: _id, ...content } = recipe
  const res = await axiosInstance.post<ApiResponse<Recipe>>("/recipes", content)
  return res.data.data
}

export async function deleteRecipe(id: string): Promise<void> {
  await axiosInstance.delete(`/recipes/${id}`)
}
