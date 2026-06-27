import * as React from "react"

import { cn } from "@lib/utils"
import { Label } from "@components/ui/label"

type FieldProps = React.ComponentProps<"div"> & {
  label?: string
  htmlFor?: string
  error?: string
  /** Optional muted hint shown after the label (e.g. "(Optional)"). */
  hint?: string
}

// Label + control + error wrapper. Compose any control as children; pass `error`
// (e.g. from react-hook-form) to render the message in danger tone.
function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
  ...props
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)} {...props}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
          {hint && <span className="ml-1 font-normal text-muted-foreground">{hint}</span>}
        </Label>
      )}
      {children}
      {error && <p className="text-body-sm text-danger">{error}</p>}
    </div>
  )
}

export { Field }
