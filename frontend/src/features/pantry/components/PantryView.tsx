"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"

import { Button } from "@components/ui/button"
import { Typography } from "@components/ui/typography"

import { MOCK_PANTRY } from "../data/pantry.data"
import { getExpiryStatus } from "../lib/expiry"
import type { PantryItem } from "../types/pantry.types"
import { AddItemDialog } from "./AddItemDialog"
import { ExpiringAlert } from "./ExpiringAlert"
import { PantryFilters } from "./PantryFilters"
import { PantryItemCard } from "./PantryItemCard"

export function PantryView() {
  const [items, setItems] = useState<PantryItem[]>(MOCK_PANTRY)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [dialogOpen, setDialogOpen] = useState(false)

  const expiringCount = useMemo(
    () => items.filter((item) => getExpiryStatus(item.expiryDate) === "soon").length,
    [items]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return items.filter((item) => {
      const matchesQuery = item.name.toLowerCase().includes(q)
      const matchesCategory = category === "All" || item.category === category
      return matchesQuery && matchesCategory
    })
  }, [items, query, category])

  const handleAdd = (item: PantryItem) => setItems((prev) => [item, ...prev])
  const handleDelete = (id: string) => setItems((prev) => prev.filter((item) => item.id !== id))

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Typography variant="display-lg" weight="bold" className="text-foreground">
            Pantry
          </Typography>
          <Typography variant="body-lg" className="text-muted-foreground">
            Manage your ingredients and track expiry dates
          </Typography>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="size-4" />
          Add Item
        </Button>
      </div>

      <ExpiringAlert count={expiringCount} />

      <PantryFilters query={query} onQuery={setQuery} active={category} onCategory={setCategory} />

      {filtered.length === 0 ? (
        <Typography variant="body-base" className="py-12 text-center text-muted-foreground">
          No ingredients found.
        </Typography>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <PantryItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}
        </div>
      )}

      <AddItemDialog open={dialogOpen} onOpenChange={setDialogOpen} onAdd={handleAdd} />
    </div>
  )
}
