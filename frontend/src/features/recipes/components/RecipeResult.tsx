import { Clock, Users } from "lucide-react"

import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import { Typography } from "@components/ui/typography"

import type { Recipe } from "../types/recipe.types"

type TagTone = "cuisine" | "difficulty" | "diet"

const TAG_TONE: Record<TagTone, string> = {
  cuisine: "bg-primary/10 text-primary",
  difficulty: "bg-info/10 text-info",
  diet: "bg-purple-500/10 text-purple-500",
}

function Tag({ tone, children }: { tone: TagTone; children: React.ReactNode }) {
  return (
    <Typography
      as="span"
      variant="body-sm"
      weight="medium"
      className={cn("rounded-full px-2.5 py-0.5", TAG_TONE[tone])}
    >
      {children}
    </Typography>
  )
}

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

type Props = {
  recipe: Recipe
  onSave?: () => void
  onNew?: () => void
}

export function RecipeResult({ recipe, onSave, onNew }: Props) {
  return (
    <div className="space-y-5">
      <Typography variant="h2" weight="bold" className="text-foreground">
        {recipe.title}
      </Typography>
      <Typography variant="body-base" className="text-muted-foreground">
        {recipe.description}
      </Typography>

      <div className="flex flex-wrap gap-2">
        <Tag tone="cuisine">{recipe.cuisine}</Tag>
        <Tag tone="difficulty">{recipe.difficulty}</Tag>
        <Tag tone="diet">{recipe.diet}</Tag>
      </div>

      <div className="flex flex-wrap items-center gap-5 text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" />
          <Typography as="span" variant="body-base">
            {recipe.minutes} mins
          </Typography>
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="size-4" />
          <Typography as="span" variant="body-base">
            {recipe.servings} servings
          </Typography>
        </span>
      </div>

      <section>
        <Typography variant="h5" weight="semibold" className="mb-2 text-foreground">
          Ingredients
        </Typography>
        <ul className="space-y-1.5">
          {recipe.ingredients.map((ing, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <Typography as="span" variant="body-base" className="text-foreground">
                {ing.amount} {ing.name}
              </Typography>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <Typography variant="h5" weight="semibold" className="mb-3 text-foreground">
          Instructions
        </Typography>
        <ol className="space-y-3">
          {recipe.steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-label-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <Typography as="span" variant="body-base" className="text-muted-foreground">
                {step}
              </Typography>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <Typography variant="h5" weight="semibold" className="mb-2 text-foreground">
          Nutrition (per serving)
        </Typography>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <NutritionBox value={`${recipe.nutrition.calories}kcal`} label="Calories" />
          <NutritionBox value={`${recipe.nutrition.protein}g`} label="Protein" />
          <NutritionBox value={`${recipe.nutrition.carbs}g`} label="Carbs" />
          <NutritionBox value={`${recipe.nutrition.fats}g`} label="Fats" />
          <NutritionBox value={`${recipe.nutrition.fiber}g`} label="Fiber" />
        </div>
      </section>

      {recipe.tips.length > 0 && (
        <section className="rounded-xl bg-primary-subtle p-4">
          <Typography variant="body-lg" weight="semibold" className="mb-2 text-foreground">
            💡 Cooking Tips
          </Typography>
          <ul className="space-y-2">
            {recipe.tips.map((tip, i) => (
              <li key={i}>
                <Typography as="span" variant="body-base" className="text-foreground">
                  • {tip}
                </Typography>
              </li>
            ))}
          </ul>
        </section>
      )}

      {(onSave || onNew) && (
        <div className="flex gap-3 border-t border-border pt-4">
          {onSave && (
            <Button className="flex-1" onClick={onSave}>
              Save Recipe
            </Button>
          )}
          {onNew && (
            <Button variant="outline" onClick={onNew}>
              New Recipe
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
