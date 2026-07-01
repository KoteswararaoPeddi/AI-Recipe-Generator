"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Lock } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@components/ui/button"
import { Field } from "@components/ui/field"
import { Input } from "@components/ui/input"
import { getErrorMessage } from "@lib/get-error-message"

import { changePassword } from "../api/settings.service"
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

  const onSubmit = async (values: PasswordValues) => {
    const id = toast.loading("Updating password...")
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      toast.success("Password updated", { id })
      reset()
    } catch (error) {
      toast.error(getErrorMessage(error), { id })
    }
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
