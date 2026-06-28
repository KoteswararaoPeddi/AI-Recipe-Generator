"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"

import { Input } from "@components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select"
import { Typography } from "@components/ui/typography"

import type { Recipe } from "../types/recipe.types"
import { RecipeCard } from "./RecipeCard"

const ALL_CUISINES = "All Cuisines"
const ALL_DIFFICULTIES = "All Difficulties"

export function RecipesView({ recipes: initial }: { recipes: Recipe[] }) {
  const [recipes, setRecipes] = useState(initial)
  const [query, setQuery] = useState("")
  const [cuisine, setCuisine] = useState(ALL_CUISINES)
  const [difficulty, setDifficulty] = useState(ALL_DIFFICULTIES)

  const cuisines = useMemo(
    () => [ALL_CUISINES, ...Array.from(new Set(recipes.map((r) => r.cuisine)))],
    [recipes]
  )
  const difficulties = useMemo(
    () => [ALL_DIFFICULTIES, ...Array.from(new Set(recipes.map((r) => r.difficulty)))],
    [recipes]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return recipes.filter((recipe) => {
      const matchesQuery =
        !q ||
        recipe.title.toLowerCase().includes(q) ||
        recipe.description.toLowerCase().includes(q)
      const matchesCuisine = cuisine === ALL_CUISINES || recipe.cuisine === cuisine
      const matchesDifficulty =
        difficulty === ALL_DIFFICULTIES || recipe.difficulty === difficulty
      return matchesQuery && matchesCuisine && matchesDifficulty
    })
  }, [recipes, query, cuisine, difficulty])

  const handleDelete = (id: string) => {
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== id))
    toast.success("Recipe removed")
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes..."
              className="pl-9"
            />
          </div>
          <Select value={cuisine} onValueChange={(v) => setCuisine(v ?? ALL_CUISINES)}>
            <SelectTrigger className="lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cuisines.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={(v) => setDifficulty(v ?? ALL_DIFFICULTIES)}>
            <SelectTrigger className="lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {difficulties.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Typography variant="body-sm" className="text-muted-foreground">
        Showing {filtered.length} of {recipes.length} recipes
      </Typography>

      {filtered.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <Typography variant="body-lg" className="text-muted-foreground">
            No recipes match your filters.
          </Typography>
        </div>
      )}
    </div>
  )
}
