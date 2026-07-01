"use client"

import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@components/ui/button"
import { Field } from "@components/ui/field"
import { Input } from "@components/ui/input"
import { PasswordInput } from "@components/ui/password-input"
import { getErrorMessage } from "@lib/get-error-message"
import { useAuthStore } from "@shared/stores/auth.store"

import { register as registerUser } from "../api/auth.service"
import { signupSchema, type SignupValues } from "../schemas/auth.schema"

export function SignupForm() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
    mode: "onBlur",
  })

  const onSubmit = async (values: SignupValues) => {
    const toastId = toast.loading("Creating your account...")
    try {
      const user = await registerUser({ email: values.email, password: values.password })
      setUser(user)
      toast.success("Account created", { id: toastId })
      router.push("/dashboard")
    } catch (error) {
      toast.error(getErrorMessage(error, "Could not create your account."), { id: toastId })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Field label="Email" htmlFor="email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </Field>

      <Field label="Password" htmlFor="password" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="At least 8 characters"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      <Field
        label="Confirm password"
        htmlFor="confirmPassword"
        error={errors.confirmPassword?.message}
      >
        <PasswordInput
          id="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
      </Field>

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
    </form>
  )
}
