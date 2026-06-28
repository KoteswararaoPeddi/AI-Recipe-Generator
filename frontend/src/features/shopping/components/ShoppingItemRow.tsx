"use client"

import { cn } from "@lib/utils"
import { Checkbox } from "@components/ui/checkbox"
import { Typography } from "@components/ui/typography"

import type { ShoppingItem } from "../types/shopping.types"

type Props = {
  item: ShoppingItem
  onToggle: (id: string) => void
}

export function ShoppingItemRow({ item, onToggle }: Props) {
  return (
    <label className="flex cursor-pointer items-center gap-4 px-5 py-4">
      <Checkbox
        checked={item.checked}
        onCheckedChange={() => onToggle(item.id)}
        className="size-5"
        aria-label={`Mark ${item.name} as bought`}
      />
      <div className="min-w-0">
        <Typography
          variant="body-lg"
          weight="medium"
          className={cn(
            "truncate",
            item.checked ? "text-muted-foreground line-through" : "text-foreground"
          )}
        >
          {item.name}
        </Typography>
        <Typography variant="body-sm" className="text-muted-foreground">
          {item.quantity}
        </Typography>
      </div>
    </label>
  )
}
