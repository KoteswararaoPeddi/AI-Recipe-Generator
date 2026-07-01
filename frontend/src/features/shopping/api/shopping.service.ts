import axiosInstance from "@lib/axios.config"
import type { ApiResponse } from "@shared/types/api-response"
import type { ShoppingItem } from "../types/shopping.types"

// Create payload — the server assigns the id and defaults `checked` to false.
export type NewShoppingItem = Omit<ShoppingItem, "id" | "checked">

export async function listShopping(): Promise<ShoppingItem[]> {
  const res = await axiosInstance.get<ApiResponse<ShoppingItem[]>>("/shopping")
  return res.data.data
}

export async function createShoppingItem(input: NewShoppingItem): Promise<ShoppingItem> {
  const res = await axiosInstance.post<ApiResponse<ShoppingItem>>("/shopping", input)
  return res.data.data
}

export async function updateShoppingItem(
  id: string,
  input: Partial<NewShoppingItem & { checked: boolean }>
): Promise<ShoppingItem> {
  const res = await axiosInstance.patch<ApiResponse<ShoppingItem>>(`/shopping/${id}`, input)
  return res.data.data
}

export async function deleteShoppingItem(id: string): Promise<void> {
  await axiosInstance.delete(`/shopping/${id}`)
}

export async function promoteToPantry(id: string): Promise<void> {
  await axiosInstance.post(`/shopping/${id}/to-pantry`)
}
