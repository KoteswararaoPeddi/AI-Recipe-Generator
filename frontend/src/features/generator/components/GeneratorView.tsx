"use client"

import { useState } from "react"
import { ChefHat, TriangleAlert } from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@lib/get-error-message"
import { Card } from "@components/ui/card"
import { Typography } from "@components/ui/typography"
import { listPantry } from "@features/pantry/api/pantry.service"
import { generateRecipe, saveRecipe } from "@features/recipes/api/recipes.service"
import { RecipeResult } from "@features/recipes/components/RecipeResult"
import type { Recipe } from "@features/recipes/types/recipe.types"

import { GeneratorForm, type GenerateParams } from "./GeneratorForm"

export function GeneratorView() {
  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastParams, setLastParams] = useState<GenerateParams | null>(null)

  const handleGenerate = async (params: GenerateParams) => {
    setLastParams(params)
    setSaved(false)
    setError(null)

    // Nothing typed → make sure there's something to cook with before generating.
    if (params.ingredients.length === 0) {
      if (!params.usePantry) {
        setError(
          'Add at least one ingredient (or enable "Use ingredients from my pantry") before generating a recipe.'
        )
        return
      }
      try {
        const pantry = await listPantry()
        if (pantry.length === 0) {
          setError(
            "There are no ingredients in your pantry. Add some ingredients to your pantry, or type a few ingredients, before generating a recipe."
          )
          return
        }
      } catch (err) {
        setError(getErrorMessage(err))
        return
      }
    }

    setLoading(true)
    setRecipe(null)
    try {
      const result = await generateRecipe(params)
      setRecipe(result)
    } catch (err) {
      // Surface the message in the result panel (not just a toast).
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  // "New Recipe" regenerates with the same inputs (Gemini varies each run), falling back to a
  // clear if nothing was generated yet.
  const handleNew = () => {
    if (lastParams) {
      void handleGenerate(lastParams)
    } else {
      setRecipe(null)
    }
  }

  const handleSave = async () => {
    if (!recipe || saving || saved) return
    setSaving(true)
    const id = toast.loading("Saving recipe...")
    try {
      await saveRecipe(recipe)
      setSaved(true)
      toast.success("Recipe saved to your collection", { id })
    } catch (error) {
      toast.error(getErrorMessage(error), { id })
    } finally {
      setSaving(false)
    }
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
            onSave={handleSave}
            onNew={handleNew}
            saving={saving}
            saved={saved}
          />
        ) : error ? (
          <div className="flex min-h-96 flex-col items-center justify-center gap-3 px-6 text-center">
            <TriangleAlert className="size-12 text-destructive" />
            <Typography variant="body-lg" className="max-w-sm text-foreground">
              {error}
            </Typography>
          </div>
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
