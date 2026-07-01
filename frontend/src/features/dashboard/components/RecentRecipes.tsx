import Link from "next/link"
import { ChefHat, Clock } from "lucide-react"

import { Card } from "@components/ui/card"
import type { RecentRecipe } from "../types/dashboard.types"

export function RecentRecipes({ recipes }: { recipes: RecentRecipe[] }) {
  return (
    <Card className="p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-h4 font-semibold text-foreground">Recent Recipes</h2>
        <Link href="/recipes" className="text-body-base font-medium text-primary hover:underline">
          View all
        </Link>
      </div>

      {recipes.length === 0 ? (
        <p className="py-6 text-center text-body-base text-muted-foreground">
          No saved recipes yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {recipes.map((recipe) => (
          <li key={recipe.id}>
            <Link
              href={`/recipes/${recipe.id}`}
              className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ChefHat className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-body-lg font-medium text-foreground">{recipe.title}</p>
                <p className="flex items-center gap-1 text-body-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  {recipe.minutes} mins
                </p>
              </div>
            </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
