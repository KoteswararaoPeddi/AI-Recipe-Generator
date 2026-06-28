import type { LucideIcon } from "lucide-react"

import { cn } from "@lib/utils"
import { Card } from "@components/ui/card"
import { Typography } from "@components/ui/typography"

const ICON_TONE = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
} as const

type Props = {
  title: string
  icon?: LucideIcon
  iconTone?: keyof typeof ICON_TONE
  children: React.ReactNode
}

/** A titled settings panel — optional coloured icon well + heading, matching the mock. */
export function SettingsCard({ title, icon: Icon, iconTone = "primary", children }: Props) {
  return (
    <Card className="p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center gap-3">
        {Icon && (
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              ICON_TONE[iconTone]
            )}
          >
            <Icon className="size-5" />
          </span>
        )}
        <Typography variant="h4" weight="semibold" className="text-foreground">
          {title}
        </Typography>
      </div>
      {children}
    </Card>
  )
}
