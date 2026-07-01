"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, ShoppingCart, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@lib/get-error-message"
import { confirm } from "@shared/stores/confirm.store"
import { Button } from "@components/ui/button"
import { Card } from "@components/ui/card"
import { Skeleton } from "@components/ui/skeleton"
import { Typography } from "@components/ui/typography"

import {
  createShoppingItem,
  deleteShoppingItem,
  listShopping,
  promoteToPantry,
  updateShoppingItem,
  type NewShoppingItem,
} from "../api/shopping.service"
import { AddShoppingItemDialog } from "./AddShoppingItemDialog"
import { ShoppingItemRow } from "./ShoppingItemRow"
import type { ShoppingItem } from "../types/shopping.types"

export function ShoppingView() {
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    let active = true
    listShopping()
      .then((data) => active && setItems(data))
      .catch((error) => active && toast.error(getErrorMessage(error)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const checkedCount = items.filter((i) => i.checked).length
  const total = items.length

  // Group by category (only non-empty groups), ordered alphabetically by category name.
  const grouped = useMemo(() => {
    const categories = Array.from(new Set(items.map((i) => i.category))).sort()
    return categories.map((category) => ({
      category,
      items: items.filter((i) => i.category === category),
    }))
  }, [items])

  // Throws on failure so the dialog can surface the error and stay open.
  const add = async (input: NewShoppingItem) => {
    const created = await createShoppingItem(input)
    setItems((prev) => [created, ...prev])
  }

  // Optimistic check toggle — revert if the request fails.
  const toggle = async (id: string) => {
    const target = items.find((i) => i.id === id)
    if (!target) return
    const nextChecked = !target.checked
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: nextChecked } : i)))
    try {
      await updateShoppingItem(id, { checked: nextChecked })
    } catch (error) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: target.checked } : i)))
      toast.error(getErrorMessage(error))
    }
  }

  const clearChecked = async () => {
    const checked = items.filter((i) => i.checked)
    if (checked.length === 0) return
    const ok = await confirm({
      title: "Clear checked items?",
      description: `${checked.length} ${checked.length === 1 ? "item" : "items"} will be removed from your list.`,
      confirmLabel: "Clear",
    })
    if (!ok) return
    const previous = items
    setItems((prev) => prev.filter((i) => !i.checked))
    try {
      await Promise.all(checked.map((i) => deleteShoppingItem(i.id)))
    } catch (error) {
      setItems(previous)
      toast.error(getErrorMessage(error))
    }
  }

  const addCheckedToPantry = async () => {
    const checked = items.filter((i) => i.checked)
    if (checked.length === 0) return
    const previous = items
    setItems((prev) => prev.filter((i) => !i.checked))
    try {
      await Promise.all(checked.map((i) => promoteToPantry(i.id)))
      toast.success(`${checked.length} ${checked.length === 1 ? "item" : "items"} added to pantry`)
    } catch (error) {
      setItems(previous)
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Typography variant="display-lg" weight="bold" className="text-foreground">
          Shopping List
        </Typography>
        <Typography variant="body-lg" className="text-muted-foreground">
          {checkedCount} of {total} {total === 1 ? "item" : "items"} checked
        </Typography>
      </div>

      {/* Action toolbar — bulk actions appear once something is checked */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setAdding(true)}>
          <Plus className="size-4" />
          Add Item
        </Button>
        {checkedCount > 0 && (
          <Button
            onClick={addCheckedToPantry}
            className="bg-info text-info-fg hover:bg-info-hover"
          >
            <ShoppingCart className="size-4" />
            Add to Pantry ({checkedCount})
          </Button>
        )}
        {checkedCount > 0 && (
          <Button variant="outline" onClick={clearChecked}>
            <Trash2 className="size-4" />
            Clear Checked
          </Button>
        )}
      </div>

      {loading ? (
        // Content-shaped skeleton — mirrors a category card (header + rows of checkbox + name/qty).
        <Card className="overflow-hidden shadow-sm">
          <div className="border-b border-border bg-muted/40 px-5 py-3">
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="divide-y divide-border">
            {Array.from({ length: 4 }).map((_, r) => (
              <div key={r} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="size-5 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : total === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <ShoppingCart className="size-10 text-muted-foreground/40" />
          <Typography variant="body-lg" className="text-muted-foreground">
            Your shopping list is empty.
          </Typography>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ category, items: groupItems }) => (
            <Card key={category} className="overflow-hidden shadow-sm">
              <div className="border-b border-border bg-muted/40 px-5 py-3">
                <Typography variant="h5" weight="semibold" className="text-foreground">
                  {category}
                </Typography>
              </div>
              <div className="divide-y divide-border">
                {groupItems.map((item) => (
                  <ShoppingItemRow key={item.id} item={item} onToggle={toggle} />
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      <AddShoppingItemDialog open={adding} onOpenChange={setAdding} onAdd={add} />
    </div>
  )
}
