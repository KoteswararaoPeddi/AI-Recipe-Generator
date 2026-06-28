import Link from "next/link"
import type { Metadata } from "next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/ui/card"
import { LoginForm } from "@features/auth/components"

export const metadata: Metadata = {
  title: "Sign in | PantryChef",
}

export default function LoginPage() {
  return (
    <Card className="w-full max-w-sm shadow-md">
      <CardHeader className="text-center">
        <CardTitle className="text-h3 text-foreground">Welcome back</CardTitle>
        <CardDescription>Sign in to your PantryChef account</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <LoginForm />
        <p className="text-center text-body-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
