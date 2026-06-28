"use client"

import { useMemo, useState } from "react"
import { Plus, ShoppingCart, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@components/ui/button"
import { Card } from "@components/ui/card"
import { Typography } from "@components/ui/typography"

import { AddShoppingItemDialog } from "./AddShoppingItemDialog"
import { ShoppingItemRow } from "./ShoppingItemRow"
import type { ShoppingItem } from "../types/shopping.types"

export function ShoppingView({ items: initial }: { items: ShoppingItem[] }) {
  const [items, setItems] = useState(initial)
  const [adding, setAdding] = useState(false)

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

  const add = (item: ShoppingItem) => setItems((prev) => [...prev, item])
  const toggle = (id: string) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, checked: !i.checked } : i)))
  const clearChecked = () => setItems((prev) => prev.filter((i) => !i.checked))
  const addCheckedToPantry = () => {
    if (checkedCount === 0) return
    setItems((prev) => prev.filter((i) => !i.checked))
    toast.success(`${checkedCount} ${checkedCount === 1 ? "item" : "items"} added to pantry`)
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

      {total === 0 ? (
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
