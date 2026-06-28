import { cn } from "@lib/utils"
import { Typography } from "@components/ui/typography"

import type { Recipe } from "../types/recipe.types"

// Difficulty is coloured by level (Easy → success, Medium → warning, Hard → danger);
// cuisine uses the brand tone and dietary chips use the decorative purple accent.
function difficultyTone(difficulty: string): string {
  switch (difficulty.toLowerCase()) {
    case "easy":
      return "bg-success/10 text-success"
    case "hard":
      return "bg-danger/10 text-danger"
    default:
      return "bg-warning/10 text-warning"
  }
}

function Tag({ tone, children }: { tone: string; children: React.ReactNode }) {
  return (
    <Typography
      as="span"
      variant="body-sm"
      weight="medium"
      className={cn("rounded-full px-2.5 py-0.5", tone)}
    >
      {children}
    </Typography>
  )
}

/** Returns the diet/attribute chips for a recipe, falling back to the single `diet`. */
function dietTagsOf(recipe: Recipe): string[] {
  return recipe.dietTags ?? [recipe.diet]
}

export function RecipeTags({ recipe }: { recipe: Recipe }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Tag tone="bg-primary/10 text-primary">{recipe.cuisine}</Tag>
      <Tag tone={difficultyTone(recipe.difficulty)}>{recipe.difficulty}</Tag>
      {dietTagsOf(recipe).map((tag) => (
        <Tag key={tag} tone="bg-purple-500/10 text-purple-500">
          {tag}
        </Tag>
      ))}
    </div>
  )
}
