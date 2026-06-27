// Mirrors the backend response envelope ({ success, message, data }) so callers
// unwrap `res.data.data` consistently. Errors share the shape with `data: null`.
export type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}
