"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { isAxiosError } from "axios"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@lib/get-error-message"
import { Card } from "@components/ui/card"
import { Skeleton } from "@components/ui/skeleton"
import { Typography } from "@components/ui/typography"

import { getRecipe } from "../api/recipes.service"
import type { Recipe } from "../types/recipe.types"
import { RecipeDetailView } from "./RecipeDetailView"

type Status = "loading" | "ready" | "not-found" | "error"

export function RecipeDetail({ id }: { id: string }) {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [status, setStatus] = useState<Status>("loading")

  useEffect(() => {
    let active = true
    getRecipe(id)
      .then((data) => {
        if (!active) return
        setRecipe(data)
        setStatus("ready")
      })
      .catch((error) => {
        if (!active) return
        if (isAxiosError(error) && error.response?.status === 404) {
          setStatus("not-found")
        } else {
          setStatus("error")
          toast.error(getErrorMessage(error))
        }
      })
    return () => {
      active = false
    }
  }, [id])

  if (status === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-5 w-32" />

        <Card className="p-8 shadow-sm">
          <Skeleton className="h-8 w-2/3" />
          <div className="mt-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="mt-6 flex gap-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="p-6 shadow-sm lg:col-span-1">
            <Skeleton className="h-6 w-28" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </Card>
          <Card className="p-6 shadow-sm lg:col-span-2">
            <Skeleton className="h-6 w-32" />
            <div className="mt-4 space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="size-7 shrink-0 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (status !== "ready" || !recipe) {
    return (
      <div className="space-y-6">
        <Link
          href="/recipes"
          className="inline-flex items-center gap-2 text-body-base font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Recipes
        </Link>
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <Typography variant="body-lg" className="text-muted-foreground">
            {status === "not-found"
              ? "This recipe doesn't exist or was removed."
              : "We couldn't load this recipe. Please try again."}
          </Typography>
        </div>
      </div>
    )
  }

  return <RecipeDetailView recipe={recipe} />
}
