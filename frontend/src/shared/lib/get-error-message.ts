import { isAxiosError } from "axios"
import type { ApiResponse } from "@shared/types/api-response"

// Unwraps a human-readable message from the backend error envelope
// ({ success: false, message }). Distinguishes "server unreachable" (no response)
// from a server-side error, so the UI never shows a misleading generic message.
export function getErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (isAxiosError(error)) {
    // No response object = network/connection failure (server down, CORS, offline,
    // request timed out) — the request never got an answer.
    if (!error.response) {
      return "We couldn't connect to the server. Please check your connection and try again."
    }
    const data = error.response.data as ApiResponse<unknown> | undefined
    if (data?.message) return data.message
  }
  return fallback
}
