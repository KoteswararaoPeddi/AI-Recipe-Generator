"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@components/ui/button"
import { useAuthStore } from "@shared/stores/auth.store"

import { logout } from "../api/auth.service"

export function SignOutButton() {
  const router = useRouter()
  const clearUser = useAuthStore((s) => s.clearUser)
  const [loading, setLoading] = useState(false)

  const onSignOut = async () => {
    setLoading(true)
    try {
      await logout()
    } finally {
      clearUser()
      router.push("/login")
      router.refresh()
    }
  }

  return (
    <Button variant="outline" onClick={onSignOut} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  )
}
