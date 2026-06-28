"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Clock, Minus, Plus, Trash2, Users } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import { Card } from "@components/ui/card"
import { Checkbox } from "@components/ui/checkbox"
import { Typography } from "@components/ui/typography"

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
  const [checked, setChecked] = useState<Set<number>>(new Set())

  const factor = servings / recipe.servings

  const toggle = (index: number) =>
    setChecked((prev) => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })

  const handleDelete = () => {
    toast.success("Recipe removed")
    router.push("/recipes")
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
          <div className="flex items-center justify-between">
            <Typography variant="h4" weight="semibold" className="text-foreground">
              Ingredients
            </Typography>
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="size-4" />
              <Typography as="span" variant="body-sm">
                Servings:
              </Typography>
            </span>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              aria-label="Decrease servings"
              disabled={servings <= 1}
              onClick={() => setServings((s) => Math.max(1, s - 1))}
            >
              <Minus className="size-4" />
            </Button>
            <Typography variant="h4" weight="semibold" className="w-8 text-center text-foreground">
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

          <ul className="mt-5 space-y-3">
            {recipe.ingredients.map((ing, i) => (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox
                    checked={checked.has(i)}
                    onCheckedChange={() => toggle(i)}
                    className="mt-0.5"
                  />
                  <Typography
                    as="span"
                    variant="body-base"
                    className={cn(
                      checked.has(i)
                        ? "text-muted-foreground line-through"
                        : "text-foreground"
                    )}
                  >
                    {scaleAmount(ing.amount, factor)} {ing.name}
                  </Typography>
                </label>
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
