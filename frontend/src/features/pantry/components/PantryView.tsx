"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@components/ui/button"
import { Card } from "@components/ui/card"
import { Skeleton } from "@components/ui/skeleton"
import { Typography } from "@components/ui/typography"
import { getErrorMessage } from "@lib/get-error-message"
import { confirm } from "@shared/stores/confirm.store"

import { createPantryItem, deletePantryItem, listPantry, type NewPantryItem } from "../api/pantry.service"
import { getExpiryStatus } from "../lib/expiry"
import type { PantryItem } from "../types/pantry.types"
import { AddItemDialog } from "./AddItemDialog"
import { ExpiringAlert } from "./ExpiringAlert"
import { PantryFilters } from "./PantryFilters"
import { PantryItemCard } from "./PantryItemCard"

export function PantryView() {
  const [items, setItems] = useState<PantryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("All")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    let active = true
    listPantry()
      .then((data) => active && setItems(data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

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

  // Throws on failure so the dialog can surface the error and stay open.
  const handleAdd = async (input: NewPantryItem) => {
    const created = await createPantryItem(input)
    setItems((prev) => [created, ...prev])
  }

  // Confirm, then optimistic delete — revert if the request fails.
  const handleDelete = async (id: string) => {
    const item = items.find((i) => i.id === id)
    const ok = await confirm({
      title: "Delete item?",
      description: `Remove ${item?.name ?? "this item"} from your pantry?`,
      confirmLabel: "Delete",
    })
    if (!ok) return
    const previous = items
    setItems((prev) => prev.filter((item) => item.id !== id))
    try {
      await deletePantryItem(id)
    } catch (error) {
      setItems(previous)
      toast.error(getErrorMessage(error))
    }
  }

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

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="size-4 rounded" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="mt-3 h-3 w-24" />
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
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
