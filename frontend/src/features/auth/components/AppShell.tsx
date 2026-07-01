"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChefHat, Settings } from "lucide-react"

import { cn } from "@lib/utils"
import { APP_NAV } from "@shared/config/app-nav"
import { useAuthStore } from "@shared/stores/auth.store"

import { getMe } from "../api/auth.service"
import { UserMenu } from "./UserMenu"

/**
 * Client session guard + app chrome (top nav). Hydrates the auth store from GET /auth/me
 * on mount when not already hydrated; on failure redirects to /login. `children` pass
 * through, so page content stays a Server Component.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const status = useAuthStore((s) => s.status)
  const setUser = useAuthStore((s) => s.setUser)
  const clearUser = useAuthStore((s) => s.clearUser)

  useEffect(() => {
    if (status !== "loading") return
    getMe()
      .then(setUser)
      .catch(() => {
        clearUser()
        router.replace("/login")
      })
  }, [status, setUser, clearUser, router])

  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-body-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-surface">
        <div className="relative mx-auto flex h-16 max-w-7xl items-center px-6">
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ChefHat className="size-5" />
            </span>
            <span className="text-h6 font-bold text-foreground">AI Recipe Generator</span>
          </Link>

          <nav className="absolute left-1/2 hidden w-max -translate-x-1/2 items-center gap-1 lg:flex">
            {APP_NAV.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-body-base font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/settings"
              aria-label="Settings"
              className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Settings className="size-5" />
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-6 py-8">{children}</main>
    </div>
  )
}
