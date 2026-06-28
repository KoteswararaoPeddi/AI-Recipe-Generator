"use client"

import { useMemo, useState } from "react"
import { Clock, Search } from "lucide-react"

import { Input } from "@components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog"
import { Typography } from "@components/ui/typography"
import type { Recipe } from "@features/recipes/types/recipe.types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipes: Recipe[]
  /** Heading context, e.g. "Mon · Breakfast". */
  context: string | null
  onSelect: (recipe: Recipe) => void
}

export function RecipePickerDialog({ open, onOpenChange, recipes, context, onSelect }: Props) {
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return recipes
    return recipes.filter((r) => r.title.toLowerCase().includes(q))
  }, [recipes, query])

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setQuery("")
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            <Typography as="span" variant="h4" weight="semibold" className="text-foreground">
              Add a recipe
            </Typography>
          </DialogTitle>
          {context && (
            <Typography variant="body-sm" className="text-muted-foreground">
              {context}
            </Typography>
          )}
        </DialogHeader>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your recipes..."
            className="pl-9"
            autoFocus
          />
        </div>

        <ul className="-mx-1 max-h-80 space-y-1 overflow-y-auto px-1">
          {filtered.map((recipe) => (
            <li key={recipe.id}>
              <button
                type="button"
                onClick={() => onSelect(recipe)}
                className="flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5"
              >
                <span className="min-w-0">
                  <Typography variant="body-base" weight="medium" className="truncate text-foreground">
                    {recipe.title}
                  </Typography>
                  <Typography variant="body-sm" className="text-muted-foreground">
                    {recipe.cuisine} · {recipe.difficulty}
                  </Typography>
                </span>
                <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground">
                  <Clock className="size-4" />
                  <Typography as="span" variant="body-sm">
                    {recipe.minutes}m
                  </Typography>
                </span>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="py-8 text-center">
              <Typography variant="body-base" className="text-muted-foreground">
                No recipes found.
              </Typography>
            </li>
          )}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
