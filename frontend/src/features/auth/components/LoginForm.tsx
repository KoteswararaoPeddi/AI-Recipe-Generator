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

import { login } from "../api/auth.service"
import { loginSchema, type LoginValues } from "../schemas/auth.schema"

export function LoginForm() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onBlur",
  })

  const onSubmit = async (values: LoginValues) => {
    const toastId = toast.loading("Signing in...")
    try {
      const user = await login(values)
      setUser(user)
      toast.success("Signed in", { id: toastId })
      router.push("/dashboard")
    } catch (error) {
      toast.error(getErrorMessage(error, "Invalid email or password."), { id: toastId })
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
          autoComplete="current-password"
          placeholder="Your password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
      </Field>

      <Button type="submit" disabled={isSubmitting} className="mt-2 w-full">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}
