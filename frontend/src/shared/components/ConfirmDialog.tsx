"use client"

import { Button } from "@components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog"
import { Typography } from "@components/ui/typography"
import { useConfirmStore } from "@shared/stores/confirm.store"

/**
 * The single confirmation dialog, mounted once globally. Driven imperatively by the
 * confirm store — call `confirm({ ... })` anywhere and await the boolean result.
 */
export function ConfirmDialogHost() {
  const open = useConfirmStore((s) => s.open)
  const options = useConfirmStore((s) => s.options)
  const settle = useConfirmStore((s) => s.settle)

  const destructive = options?.destructive ?? true

  return (
    <Dialog open={open} onOpenChange={(next) => !next && settle(false)}>
      <DialogContent showCloseButton={false} className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>
            <Typography as="span" variant="h4" weight="semibold" className="text-foreground">
              {options?.title}
            </Typography>
          </DialogTitle>
          {options?.description && (
            <Typography variant="body-sm" className="text-muted-foreground">
              {options.description}
            </Typography>
          )}
        </DialogHeader>

        <DialogFooter className="mx-0 mb-0 border-t-0 bg-transparent p-0 pt-2">
          <Button type="button" variant="outline" onClick={() => settle(false)}>
            {options?.cancelLabel ?? "Cancel"}
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={() => settle(true)}
          >
            {options?.confirmLabel ?? "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
