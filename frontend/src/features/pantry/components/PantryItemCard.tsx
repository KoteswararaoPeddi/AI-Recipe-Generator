import { Calendar, X } from "lucide-react"

import { cn } from "@lib/utils"
import { Card } from "@components/ui/card"
import { Typography } from "@components/ui/typography"

import { formatExpiry, getExpiryStatus } from "../lib/expiry"
import type { PantryItem } from "../types/pantry.types"

type Props = {
  item: PantryItem
  onDelete: (id: string) => void
}

export function PantryItemCard({ item, onDelete }: Props) {
  const status = getExpiryStatus(item.expiryDate)
  const expired = status === "expired"

  return (
    <Card className="p-5 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <Typography variant="h6" weight="semibold" className="truncate text-foreground">
            {item.name}
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground">
            {item.category}
          </Typography>
        </div>
        <button
          type="button"
          onClick={() => onDelete(item.id)}
          aria-label={`Remove ${item.name}`}
          className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Typography variant="body-base" className="text-muted-foreground">
          Quantity:
        </Typography>
        <Typography variant="body-base" weight="medium" className="text-foreground">
          {item.quantity.toFixed(2)} {item.unit}
        </Typography>
      </div>

      {item.expiryDate && (
        <div className="mt-2 flex items-center gap-1.5">
          <Calendar className={cn("size-4", expired ? "text-destructive" : "text-muted-foreground")} />
          <Typography
            variant="body-sm"
            weight={expired ? "semibold" : "normal"}
            className={expired ? "text-destructive" : "text-muted-foreground"}
          >
            {expired ? "Expired" : "Expires"}: {formatExpiry(item.expiryDate)}
          </Typography>
        </div>
      )}

      {item.runningLow && (
        <Typography
          as="span"
          variant="label-sm"
          weight="medium"
          className="mt-3 inline-flex rounded-md bg-warning/15 px-2 py-0.5 text-warning"
        >
          Running Low
        </Typography>
      )}
    </Card>
  )
}
