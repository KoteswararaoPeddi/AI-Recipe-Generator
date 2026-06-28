import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { RecipeDetailView } from "@features/recipes/components/RecipeDetailView"
import { getSavedRecipe } from "@features/recipes/data/recipes.data"

type Params = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { id } = await params
  const recipe = getSavedRecipe(id)
  return { title: recipe ? `${recipe.title} | PantryChef` : "Recipe | PantryChef" }
}

export default async function RecipeDetailPage({ params }: Params) {
  const { id } = await params
  const recipe = getSavedRecipe(id)
  if (!recipe) notFound()

  return <RecipeDetailView recipe={recipe} />
}
