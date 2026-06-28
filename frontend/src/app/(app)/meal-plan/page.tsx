import type { Metadata } from "next"

import { Typography } from "@components/ui/typography"
import { MealPlannerView } from "@features/meal-planner/components/MealPlannerView"
import { SAVED_RECIPES } from "@features/recipes/data/recipes.data"

export const metadata: Metadata = { title: "Meal Plan | PantryChef" }

export default function MealPlanPage() {
  return (
    <div className="space-y-8">
      <div>
        <Typography variant="display-lg" weight="bold" className="text-foreground">
          Meal Planner
        </Typography>
        <Typography variant="body-lg" className="text-muted-foreground">
          Plan your meals for the week ahead
        </Typography>
      </div>

      <MealPlannerView recipes={SAVED_RECIPES} />
    </div>
  )
}
