"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronDown } from "lucide-react"

import { useAuthStore } from "@shared/stores/auth.store"

import { logout } from "../api/auth.service"

export function UserMenu() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)
  const [open, setOpen] = useState(false)

  const initial = user?.email?.[0]?.toUpperCase() ?? "?"

  const onSignOut = async () => {
    try {
      await logout()
    } finally {
      clearUser()
      router.push("/login")
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted"
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-primary text-label-base font-semibold text-primary-foreground">
          {initial}
        </span>
        <span className="hidden max-w-[16ch] truncate text-body-base font-medium text-foreground sm:inline">
          {user?.email}
        </span>
        <ChevronDown className="size-4 text-muted-foreground" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-border bg-popover p-1 shadow-md">
            <div className="truncate px-3 py-2 text-body-sm text-muted-foreground">
              {user?.email}
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="w-full rounded-md px-3 py-2 text-left text-body-base text-foreground transition-colors hover:bg-muted"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  )
}
