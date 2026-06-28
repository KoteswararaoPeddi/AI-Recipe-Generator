import type { LucideIcon } from "lucide-react"

import { cn } from "@lib/utils"
import { Card } from "@components/ui/card"

export type StatTone = "primary" | "info" | "purple"

const TONE: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  info: "bg-info/10 text-info",
  purple: "bg-purple-500/10 text-purple-500",
}

type StatCardProps = {
  label: string
  value: string | number
  icon: LucideIcon
  tone: StatTone
}

export function StatCard({ label, value, icon: Icon, tone }: StatCardProps) {
  return (
    <Card className="p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-xl", TONE[tone])}>
          <Icon className="size-6" />
        </span>
        <div>
          <p className="text-body-base text-muted-foreground">{label}</p>
          <p className="text-h1 font-bold text-foreground">{value}</p>
        </div>
      </div>
    </Card>
  )
}
