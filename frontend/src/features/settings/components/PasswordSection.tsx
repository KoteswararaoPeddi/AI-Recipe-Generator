"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@components/ui/button"
import { Field } from "@components/ui/field"
import { Input } from "@components/ui/input"

import { passwordSchema, type PasswordValues } from "../schemas/settings.schema"
import { SettingsCard } from "./SettingsCard"

export function PasswordSection() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  })

  const onSubmit = async (_values: PasswordValues) => {
    const id = toast.loading("Updating password...")
    // Mock: the change-password endpoint doesn't exist yet (Phase 3 backend).
    await new Promise((resolve) => setTimeout(resolve, 600))
    toast.success("Password updated", { id })
    reset()
  }

  return (
    <SettingsCard title="Change Password" icon={Lock} iconTone="info">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <Field
          label="Current Password"
          htmlFor="currentPassword"
          error={errors.currentPassword?.message}
        >
          <Input id="currentPassword" type="password" {...register("currentPassword")} />
        </Field>
        <Field label="New Password" htmlFor="newPassword" error={errors.newPassword?.message}>
          <Input id="newPassword" type="password" {...register("newPassword")} />
        </Field>
        <Field
          label="Confirm New Password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input id="confirmPassword" type="password" {...register("confirmPassword")} />
        </Field>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-fit bg-info text-info-fg hover:bg-info-hover"
        >
          <Lock className="size-4" />
          {isSubmitting ? "Updating..." : "Change Password"}
        </Button>
      </form>
    </SettingsCard>
  )
}
