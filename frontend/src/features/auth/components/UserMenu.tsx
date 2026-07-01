"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { useAuthStore } from "@shared/stores/auth.store"
import { Avatar, AvatarFallback } from "@components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu"
import { Typography } from "@components/ui/typography"

import { logout } from "../api/auth.service"

export function UserMenu() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)
  const clearUser = useAuthStore((s) => s.clearUser)

  const displayName = user?.name?.trim() || user?.email?.split("@")[0] || "Account"
  const initial = displayName[0]?.toUpperCase() ?? "?"

  const onSignOut = async () => {
    try {
      await logout()
    } finally {
      clearUser()
      router.push("/login")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full outline-none">
        <Avatar className="after:hidden">
          <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
            {initial}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-64 p-0">
        <div className="flex items-center gap-3 p-3">
          <Avatar size="lg" className="after:hidden">
            <AvatarFallback className="bg-primary font-semibold text-primary-foreground">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <Typography variant="body-base" weight="semibold" className="truncate text-foreground">
              {displayName}
            </Typography>
            <Typography variant="body-sm" className="truncate text-muted-foreground">
              {user?.email}
            </Typography>
          </div>
        </div>

        <DropdownMenuSeparator className="mx-0 my-0" />

        <div className="p-1">
          <DropdownMenuItem
            variant="destructive"
            onClick={onSignOut}
            className="gap-2 px-3 py-2"
          >
            <LogOut className="size-4" />
            <Typography as="span" variant="body-base" weight="medium">
              Logout
            </Typography>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
