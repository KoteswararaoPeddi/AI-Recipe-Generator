import { create } from "zustand"

import type { AuthUser } from "@shared/types/auth.types"

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"

type AuthState = {
  user: AuthUser | null
  status: AuthStatus
  setUser: (user: AuthUser) => void
  clearUser: () => void
}

/**
 * Cross-cutting auth state. Hydrated once by the app shell (from GET /auth/me) and read
 * anywhere via a narrow selector, e.g. `useAuthStore((s) => s.user)`.
 * Client-side and UX-only — the backend remains the authorization source of truth.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: "loading",
  setUser: (user) => set({ user, status: "authenticated" }),
  clearUser: () => set({ user: null, status: "unauthenticated" }),
}))
