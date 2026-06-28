import Link from "next/link"
import { ChefHat, Clock, Flame, Trash2 } from "lucide-react"

import { cn } from "@lib/utils"
import { buttonVariants } from "@components/ui/button"
import { Button } from "@components/ui/button"
import { Card } from "@components/ui/card"
import { Separator } from "@components/ui/separator"
import { Typography } from "@components/ui/typography"

import type { Recipe } from "../types/recipe.types"
import { RecipeTags } from "./RecipeTags"

type Props = {
  recipe: Recipe
  onDelete: (id: string) => void
}

export function RecipeCard({ recipe, onDelete }: Props) {
  const href = `/recipes/${recipe.id}`

  return (
    <Card className="flex flex-col overflow-hidden shadow-sm transition-shadow hover:shadow-md">
      <Link
        href={href}
        aria-label={recipe.title}
        className="flex h-44 items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5"
      >
        <ChefHat className="size-16 text-primary" />
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Link href={href}>
          <Typography variant="h5" weight="semibold" className="text-primary hover:underline">
            {recipe.title}
          </Typography>
        </Link>

        <Typography variant="body-sm" className="line-clamp-2 text-muted-foreground">
          {recipe.description}
        </Typography>

        <RecipeTags recipe={recipe} />

        <div className="mt-auto flex items-center justify-between text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Clock className="size-4" />
            <Typography as="span" variant="body-sm">
              {recipe.minutes} mins
            </Typography>
          </span>
          <span className="flex items-center gap-1.5">
            <Flame className="size-4" />
            <Typography as="span" variant="body-sm">
              {recipe.nutrition.calories} cal
            </Typography>
          </span>
        </div>

        <Separator />

        <div className="flex items-center gap-3">
          <Link href={href} className={cn(buttonVariants(), "flex-1")}>
            View Recipe
          </Link>
          <Button
            variant="outline"
            size="icon"
            aria-label={`Delete ${recipe.title}`}
            onClick={() => onDelete(recipe.id)}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
