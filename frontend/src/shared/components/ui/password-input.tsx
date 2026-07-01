"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import { Input } from "./input"

type Props = Omit<React.ComponentProps<typeof Input>, "type">

/** Text input with a show/hide eye toggle. Forwards all Input props (incl. RHF `register()`). */
function PasswordInput({ className, ...props }: Props) {
  const [visible, setVisible] = React.useState(false)

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-10", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        className="absolute top-1/2 right-3 -translate-y-1/2 rounded text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

export { PasswordInput }
