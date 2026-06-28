import axiosInstance from "@lib/axios.config"
import type { ApiResponse } from "@shared/types/api-response"
import type { AuthUser } from "@shared/types/auth.types"

type Credentials = { email: string; password: string }

// All calls ride the shared axios instance (withCredentials → httpOnly cookies).
// Services return unwrapped, typed domain data.

export async function register(input: Credentials): Promise<AuthUser> {
  const res = await axiosInstance.post<ApiResponse<AuthUser>>("/auth/register", input)
  return res.data.data
}

export async function login(input: Credentials): Promise<AuthUser> {
  const res = await axiosInstance.post<ApiResponse<AuthUser>>("/auth/login", input)
  return res.data.data
}

export async function logout(): Promise<void> {
  await axiosInstance.post("/auth/logout")
}

export async function getMe(): Promise<AuthUser> {
  const res = await axiosInstance.get<ApiResponse<AuthUser>>("/auth/me")
  return res.data.data
}
