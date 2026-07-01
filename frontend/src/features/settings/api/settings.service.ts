import axiosInstance from "@lib/axios.config"
import type { ApiResponse } from "@shared/types/api-response"
import type { AuthUser } from "@shared/types/auth.types"

// Preferences view returned by the API (enums rendered as labels).
export type Preferences = {
  dietaryRestrictions: string[]
  allergies: string
  preferredCuisine: string
  defaultServings: number
  measurementUnit: string
}

export async function updateProfile(input: {
  name?: string
  email?: string
}): Promise<AuthUser> {
  const res = await axiosInstance.patch<ApiResponse<AuthUser>>("/users/me", input)
  return res.data.data
}

export async function changePassword(input: {
  currentPassword: string
  newPassword: string
}): Promise<void> {
  await axiosInstance.post("/users/me/password", input)
}

export async function getPreferences(): Promise<Preferences> {
  const res = await axiosInstance.get<ApiResponse<Preferences>>("/preferences")
  return res.data.data
}

export async function updatePreferences(input: Preferences): Promise<Preferences> {
  const res = await axiosInstance.put<ApiResponse<Preferences>>("/preferences", input)
  return res.data.data
}
