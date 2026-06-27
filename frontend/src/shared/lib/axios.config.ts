import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from "axios"

let isRefreshing = false
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }[] = []

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error)
    } else {
      p.resolve(undefined)
    }
  })
  failedQueue = []
}

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
})

// Hits the refresh endpoint; the server rotates the httpOnly cookie.
// Excluded from the 401-retry logic below via the isAuthEndpoint check.
const refreshAccessToken = async (): Promise<void> => {
  await axiosInstance.post("/auth/refresh")
}

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    const isAuthEndpoint = originalRequest?.url?.includes("/auth/refresh")

    if (status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        await refreshAccessToken()
        processQueue(null)
        return axiosInstance(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError as AxiosError)
        window.location.href = "/login"
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    if (status === 403) {
      console.error("Forbidden")
    }

    if (status === 500) {
      console.error("Internal Server Error")
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
