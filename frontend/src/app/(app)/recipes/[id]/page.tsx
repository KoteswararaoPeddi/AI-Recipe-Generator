import type { Metadata } from "next"

import { RecipeDetail } from "@features/recipes/components/RecipeDetail"

export const metadata: Metadata = { title: "Recipe | PantryChef" }

type Params = { params: Promise<{ id: string }> }

export default async function RecipeDetailPage({ params }: Params) {
  const { id } = await params
  return <RecipeDetail id={id} />
}
