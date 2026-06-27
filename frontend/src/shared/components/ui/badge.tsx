import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@lib/utils"

// Chip used for section eyebrows (pill), tech tags (tag) and the hero
// availability pill (status).
const badgeVariants = cva("inline-flex items-center border border-border", {
  variants: {
    variant: {
      pill: "rounded-full px-4 py-1.5 text-body-base bg-primary/10 text-primary",
      tag: "rounded-md px-2.5 py-1 text-body-sm bg-primary/10 text-primary",
      status: "rounded-full px-4 py-1.5 text-body-base gap-2 bg-surface text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "pill",
  },
})

function Badge({
  className,
  variant,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
