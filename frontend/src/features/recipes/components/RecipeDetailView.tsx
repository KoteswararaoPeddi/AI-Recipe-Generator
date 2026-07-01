"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Minus, Plus, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@lib/get-error-message"
import { confirm } from "@shared/stores/confirm.store"
import { Button } from "@components/ui/button"
import { Card } from "@components/ui/card"
import { Typography } from "@components/ui/typography"

import { deleteRecipe } from "../api/recipes.service"
import type { Recipe } from "../types/recipe.types"
import { scaleAmount } from "../lib/scale-amount"
import { RecipeTags } from "./RecipeTags"

function NutritionBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg bg-muted p-3 text-center">
      <Typography variant="h5" weight="bold" className="text-foreground">
        {value}
      </Typography>
      <Typography variant="body-sm" className="text-muted-foreground">
        {label}
      </Typography>
    </div>
  )
}

export function RecipeDetailView({ recipe }: { recipe: Recipe }) {
  const router = useRouter()
  const [servings, setServings] = useState(recipe.servings)
  const [deleting, setDeleting] = useState(false)

  const factor = servings / recipe.servings

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete recipe?",
      description: `"${recipe.title}" will be permanently removed.`,
      confirmLabel: "Delete",
    })
    if (!ok) return
    setDeleting(true)
    const id = toast.loading("Removing recipe...")
    try {
      await deleteRecipe(recipe.id)
      toast.success("Recipe removed", { id })
      router.push("/recipes")
    } catch (error) {
      toast.error(getErrorMessage(error), { id })
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Link
        href="/recipes"
        className="inline-flex items-center gap-2 text-body-base font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to Recipes
      </Link>

      <Card className="p-8 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <Typography variant="h1" weight="bold" className="text-foreground">
            {recipe.title}
          </Typography>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete recipe"
            onClick={handleDelete}
            disabled={deleting}
            className="shrink-0 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-5" />
          </Button>
        </div>

        <Typography variant="body-lg" className="mt-3 text-muted-foreground">
          {recipe.description}
        </Typography>

        <div className="mt-5">
          <RecipeTags recipe={recipe} />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
          <span className="flex items-center gap-2">
            <Clock className="size-5" />
            <Typography as="span" variant="body-base" weight="medium" className="text-foreground">
              {recipe.minutes} minutes
            </Typography>
          </span>
          {recipe.prepMinutes != null && (
            <Typography as="span" variant="body-base">
              Prep: {recipe.prepMinutes} min
            </Typography>
          )}
          {recipe.cookMinutes != null && (
            <Typography as="span" variant="body-base">
              Cook: {recipe.cookMinutes} min
            </Typography>
          )}
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 shadow-sm lg:col-span-1">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <Typography variant="h4" weight="semibold" className="text-foreground">
              Ingredients
            </Typography>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Users className="size-4" />
                <Typography as="span" variant="body-sm">
                  Servings:
                </Typography>
              </span>
              <Button
                variant="outline"
                size="icon"
                aria-label="Decrease servings"
                disabled={servings <= 1}
                onClick={() => setServings((s) => Math.max(1, s - 1))}
              >
                <Minus className="size-4" />
              </Button>
              <Typography
                variant="body-lg"
                weight="semibold"
                className="w-6 text-center text-foreground"
              >
                {servings}
              </Typography>
              <Button
                variant="outline"
                size="icon"
                aria-label="Increase servings"
                onClick={() => setServings((s) => s + 1)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
          </div>

          <ul className="mt-5 space-y-2.5">
            {recipe.ingredients.map((ing, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <Typography as="span" variant="body-base" className="text-foreground">
                  {scaleAmount(ing.amount, factor)} {ing.name}
                </Typography>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6 shadow-sm lg:col-span-2">
          <Typography variant="h4" weight="semibold" className="text-foreground">
            Instructions
          </Typography>
          <ol className="mt-4 space-y-4">
            {recipe.steps.map((step, i) => (
              <li key={i} className="flex gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-label-sm font-semibold text-primary-foreground">
                  {i + 1}
                </span>
                <Typography as="span" variant="body-base" className="text-muted-foreground">
                  {step}
                </Typography>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <Card className="p-6 shadow-sm">
        <Typography variant="h4" weight="semibold" className="text-foreground">
          Nutrition (per serving)
        </Typography>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <NutritionBox value={`${recipe.nutrition.calories}kcal`} label="Calories" />
          <NutritionBox value={`${recipe.nutrition.protein}g`} label="Protein" />
          <NutritionBox value={`${recipe.nutrition.carbs}g`} label="Carbs" />
          <NutritionBox value={`${recipe.nutrition.fats}g`} label="Fats" />
          <NutritionBox value={`${recipe.nutrition.fiber}g`} label="Fiber" />
        </div>
      </Card>

      {recipe.tips.length > 0 && (
        <Card className="bg-primary-subtle p-6 shadow-sm">
          <Typography variant="body-lg" weight="semibold" className="text-foreground">
            💡 Cooking Tips
          </Typography>
          <ul className="mt-3 space-y-2">
            {recipe.tips.map((tip, i) => (
              <li key={i}>
                <Typography as="span" variant="body-base" className="text-foreground">
                  • {tip}
                </Typography>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}
