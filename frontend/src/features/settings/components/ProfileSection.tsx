"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save, User } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@components/ui/button"
import { Field } from "@components/ui/field"
import { Input } from "@components/ui/input"
import { useAuthStore } from "@shared/stores/auth.store"

import { profileSchema, type ProfileValues } from "../schemas/settings.schema"
import { SettingsCard } from "./SettingsCard"

// No `name` field exists on the user yet — derive a sensible default from the email local-part.
function nameFromEmail(email?: string): string {
  if (!email) return ""
  const local = email.split("@")[0]
  return local.charAt(0).toUpperCase() + local.slice(1)
}

export function ProfileSection() {
  const user = useAuthStore((s) => s.user)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    // `values` keeps the form in sync once the user hydrates (direct visit / refresh).
    values: { name: nameFromEmail(user?.email), email: user?.email ?? "" },
  })

  const onSubmit = async (_values: ProfileValues) => {
    const id = toast.loading("Saving profile...")
    // Mock: the users/profile endpoint doesn't exist yet (Phase 3 backend).
    await new Promise((resolve) => setTimeout(resolve, 600))
    toast.success("Profile saved", { id })
  }

  return (
    <SettingsCard title="Profile Information" icon={User} iconTone="primary">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </Field>
        <Button type="submit" disabled={isSubmitting} className="mt-2 w-fit">
          <Save className="size-4" />
          {isSubmitting ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </SettingsCard>
  )
}
