"use client"

import { useEffect, useState } from "react"
import { Plus, Sparkles, X } from "lucide-react"

import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import { Card } from "@components/ui/card"
import { Checkbox } from "@components/ui/checkbox"
import { Input } from "@components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select"
import { Skeleton } from "@components/ui/skeleton"
import { Slider } from "@components/ui/slider"
import { Typography } from "@components/ui/typography"

import { getPreferences } from "@features/settings/api/settings.service"

import { COOKING_TIMES, CUISINES, DIETS } from "../constants"

export type GenerateParams = {
  ingredients: string[]
  usePantry: boolean
  cuisine: string
  diets: string[]
  servings: number
  cookingTime: string
}

type Props = {
  onGenerate: (params: GenerateParams) => void
  loading: boolean
}

const pill = (active: boolean) =>
  cn(
    "rounded-lg px-3 py-1.5 text-body-base font-medium transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground hover:bg-surface-raised hover:text-foreground"
  )

export function GeneratorForm({ onGenerate, loading }: Props) {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [input, setInput] = useState("")
  const [usePantry, setUsePantry] = useState(true)
  const [cuisine, setCuisine] = useState("Mexican")
  const [diets, setDiets] = useState<string[]>(["Vegetarian"])
  const [servings, setServings] = useState(4)
  const [cookingTime, setCookingTime] = useState("medium")
  const [prefsLoading, setPrefsLoading] = useState(true)

  // Pre-fill the filters from the user's saved preferences (Settings page). The hardcoded values
  // above are the fallback used only if the fetch fails; while it's in flight we render skeletons
  // (see prefsLoading) instead of flashing those defaults and then swapping them for real values.
  useEffect(() => {
    let active = true
    getPreferences()
      .then((prefs) => {
        if (!active) return
        setCuisine(prefs.preferredCuisine || "Any")
        setDiets(prefs.dietaryRestrictions)
        setServings(Math.min(12, Math.max(1, prefs.defaultServings || 4)))
      })
      .catch(() => {
        // Keep the defaults if preferences can't be loaded.
      })
      .finally(() => {
        if (active) setPrefsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const addIngredient = () => {
    const value = input.trim()
    if (value && !ingredients.includes(value)) setIngredients((prev) => [...prev, value])
    setInput("")
  }

  const toggleDiet = (diet: string) =>
    setDiets((prev) => (prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]))

  return (
    <div className="space-y-6">
      <Card className="p-6 shadow-sm">
        <Typography variant="h5" weight="semibold" className="text-foreground">
          Ingredients
        </Typography>

        <label className="mt-4 flex items-center gap-2 rounded-lg bg-primary-subtle px-3 py-3">
          <Checkbox checked={usePantry} onCheckedChange={(c) => setUsePantry(c === true)} />
          <Typography as="span" variant="body-base" className="text-foreground">
            Use ingredients from my pantry
          </Typography>
        </label>

        <div className="mt-4 flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                addIngredient()
              }
            }}
            placeholder="Add ingredient (e.g., tomatoes)"
          />
          <Button type="button" size="icon" onClick={addIngredient} aria-label="Add ingredient">
            <Plus className="size-4" />
          </Button>
        </div>

        {ingredients.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <button
                key={ing}
                type="button"
                onClick={() => setIngredients((prev) => prev.filter((i) => i !== ing))}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-body-sm text-foreground transition-colors hover:bg-surface-raised"
              >
                {ing}
                <X className="size-3" />
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="space-y-4 p-6 shadow-sm">
        <Typography variant="h5" weight="semibold" className="text-foreground">
          Preferences
        </Typography>

        <div>
          <Typography as="div" variant="label-lg" weight="medium" className="mb-1.5 text-foreground">
            Cuisine Type
          </Typography>
          {prefsLoading ? (
            <Skeleton className="h-9 w-full" />
          ) : (
            <Select value={cuisine} onValueChange={(v) => v && setCuisine(v)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CUISINES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div>
          <Typography as="div" variant="label-lg" weight="medium" className="mb-2 text-foreground">
            Dietary Restrictions
          </Typography>
          {prefsLoading ? (
            <div className="flex flex-wrap gap-2">
              {DIETS.map((diet) => (
                <Skeleton key={diet} className="h-8 w-20 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {DIETS.map((diet) => (
                <button
                  key={diet}
                  type="button"
                  onClick={() => toggleDiet(diet)}
                  className={pill(diets.includes(diet))}
                >
                  {diet}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <Typography as="div" variant="label-lg" weight="medium" className="mb-3 text-foreground">
            Servings: {prefsLoading ? "" : servings}
          </Typography>
          {prefsLoading ? (
            <Skeleton className="h-5 w-full" />
          ) : (
            <>
              <Slider
                value={[servings]}
                min={1}
                max={12}
                step={1}
                onValueChange={(v) => setServings((Array.isArray(v) ? v[0] : v) as number)}
              />
              <div className="mt-1 flex justify-between">
                <Typography as="span" variant="body-sm" className="text-muted-foreground">
                  1
                </Typography>
                <Typography as="span" variant="body-sm" className="text-muted-foreground">
                  12
                </Typography>
              </div>
            </>
          )}
        </div>

        <div>
          <Typography as="div" variant="label-lg" weight="medium" className="mb-2 text-foreground">
            Cooking Time
          </Typography>
          <div className="grid grid-cols-3 gap-2">
            {COOKING_TIMES.map((time) => (
              <button
                key={time.value}
                type="button"
                onClick={() => setCookingTime(time.value)}
                className={cn(pill(cookingTime === time.value), "py-2 text-body-sm")}
              >
                {time.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <Button
        size="lg"
        className="w-full"
        disabled={loading}
        onClick={() => onGenerate({ ingredients, usePantry, cuisine, diets, servings, cookingTime })}
      >
        <Sparkles className="size-4" />
        {loading ? "Generating..." : "Generate Recipe"}
      </Button>
    </div>
  )
}
