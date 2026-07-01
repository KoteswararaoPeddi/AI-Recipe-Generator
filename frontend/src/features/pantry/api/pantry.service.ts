import axiosInstance from "@lib/axios.config"
import type { ApiResponse } from "@shared/types/api-response"
import type { PantryItem } from "../types/pantry.types"

// Create payload — the server assigns the id.
export type NewPantryItem = Omit<PantryItem, "id">

export async function listPantry(): Promise<PantryItem[]> {
  const res = await axiosInstance.get<ApiResponse<PantryItem[]>>("/pantry")
  return res.data.data
}

export async function createPantryItem(input: NewPantryItem): Promise<PantryItem> {
  const res = await axiosInstance.post<ApiResponse<PantryItem>>("/pantry", input)
  return res.data.data
}

export async function deletePantryItem(id: string): Promise<void> {
  await axiosInstance.delete(`/pantry/${id}`)
}
