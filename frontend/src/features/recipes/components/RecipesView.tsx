"use client"

import { useEffect, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@lib/get-error-message"
import { confirm } from "@shared/stores/confirm.store"
import { Card } from "@components/ui/card"
import { Input } from "@components/ui/input"
import { Skeleton } from "@components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select"
import { Typography } from "@components/ui/typography"

import { deleteRecipe, listRecipes } from "../api/recipes.service"
import type { Recipe } from "../types/recipe.types"
import { RecipeCard } from "./RecipeCard"

const ALL_CUISINES = "All Cuisines"
const ALL_DIFFICULTIES = "All Difficulties"

export function RecipesView() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [cuisine, setCuisine] = useState(ALL_CUISINES)
  const [difficulty, setDifficulty] = useState(ALL_DIFFICULTIES)

  useEffect(() => {
    let active = true
    listRecipes()
      .then((data) => active && setRecipes(data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

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

  // Confirm, then optimistic delete — revert if the request fails.
  const handleDelete = async (id: string) => {
    const recipe = recipes.find((r) => r.id === id)
    const ok = await confirm({
      title: "Delete recipe?",
      description: `"${recipe?.title ?? "This recipe"}" will be permanently removed.`,
      confirmLabel: "Delete",
    })
    if (!ok) return
    const previous = recipes
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== id))
    try {
      await deleteRecipe(id)
      toast.success("Recipe removed")
    } catch (error) {
      setRecipes(previous)
      toast.error(getErrorMessage(error))
    }
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

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="flex flex-col overflow-hidden shadow-sm">
              <Skeleton className="h-44 rounded-none" />
              <div className="flex flex-1 flex-col gap-3 p-5">
                <Skeleton className="h-5 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-px w-full" />
                <div className="flex gap-3">
                  <Skeleton className="h-8 flex-1 rounded-lg" />
                  <Skeleton className="size-8 rounded-lg" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <Typography variant="body-sm" className="text-muted-foreground">
            Showing {filtered.length} of {recipes.length} recipes
          </Typography>

          {recipes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
              <Typography variant="body-lg" className="text-muted-foreground">
                You haven&apos;t saved any recipes yet. Generate one to get started.
              </Typography>
            </div>
          ) : filtered.length > 0 ? (
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
        </>
      )}
    </div>
  )
}
