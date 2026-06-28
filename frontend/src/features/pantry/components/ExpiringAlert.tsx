import { AlertCircle } from "lucide-react"

import { Typography } from "@components/ui/typography"

export function ExpiringAlert({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
      <AlertCircle className="mt-0.5 size-5 shrink-0 text-warning" />
      <div>
        <Typography variant="body-lg" weight="semibold" className="text-foreground">
          Items Expiring Soon
        </Typography>
        <Typography variant="body-base" className="text-warning">
          {count} {count === 1 ? "item" : "items"} expiring within 7 days
        </Typography>
      </div>
    </div>
  )
}
