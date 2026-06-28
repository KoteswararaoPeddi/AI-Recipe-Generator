"use client"

import { useState } from "react"
import { ChefHat } from "lucide-react"
import { toast } from "sonner"

import { Card } from "@components/ui/card"
import { Typography } from "@components/ui/typography"
import { RecipeResult } from "@features/recipes/components/RecipeResult"
import { SAMPLE_RECIPE } from "@features/recipes/data/recipes.data"
import type { Recipe } from "@features/recipes/types/recipe.types"

import { GeneratorForm, type GenerateParams } from "./GeneratorForm"

export function GeneratorView() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(false)

  const handleGenerate = (_params: GenerateParams) => {
    // Mock: the Gemini backend doesn't exist yet, so return the sample recipe.
    setLoading(true)
    setRecipe(null)
    setTimeout(() => {
      setRecipe(SAMPLE_RECIPE)
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <GeneratorForm onGenerate={handleGenerate} loading={loading} />

      <Card className="p-6 shadow-sm">
        {loading ? (
          <div className="flex min-h-96 flex-col items-center justify-center gap-3 text-center">
            <ChefHat className="size-12 animate-pulse text-primary" />
            <Typography variant="body-lg" className="text-muted-foreground">
              Cooking up your recipe...
            </Typography>
          </div>
        ) : recipe ? (
          <RecipeResult
            recipe={recipe}
            onSave={() => toast.success("Recipe saved")}
            onNew={() => setRecipe(null)}
          />
        ) : (
          <div className="flex min-h-96 flex-col items-center justify-center gap-3 text-center">
            <ChefHat className="size-12 text-muted-foreground/40" />
            <Typography variant="body-lg" className="text-muted-foreground">
              Your generated recipe will appear here
            </Typography>
          </div>
        )}
      </Card>
    </div>
  )
}
