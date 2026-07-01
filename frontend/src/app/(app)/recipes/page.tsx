import type { Metadata } from "next"

import { Typography } from "@components/ui/typography"
import { RecipesView } from "@features/recipes/components/RecipesView"

export const metadata: Metadata = { title: "Recipes | PantryChef" }

export default function RecipesPage() {
  return (
    <div className="space-y-8">
      <div>
        <Typography variant="display-lg" weight="bold" className="text-foreground">
          My Recipes
        </Typography>
        <Typography variant="body-lg" className="text-muted-foreground">
          Your collection of saved recipes
        </Typography>
      </div>

      <RecipesView />
    </div>
  )
}
