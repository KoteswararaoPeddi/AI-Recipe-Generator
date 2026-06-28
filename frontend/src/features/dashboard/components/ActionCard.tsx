import Link from "next/link"
import type { LucideIcon } from "lucide-react"

import { cn } from "@lib/utils"
import { Card } from "@components/ui/card"

type ActionCardProps = {
  title: string
  description: string
  icon: LucideIcon
  href: string
  highlighted?: boolean
}

export function ActionCard({ title, description, icon: Icon, href, highlighted }: ActionCardProps) {
  return (
    <Link href={href} className="group block">
      <Card
        className={cn(
          "p-6 shadow-sm transition-colors group-hover:border-primary/40",
          highlighted && "border-primary/30 bg-primary-subtle"
        )}
      >
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="size-6" />
          </span>
          <div>
            <p className="text-h5 font-semibold text-foreground">{title}</p>
            <p className="text-body-base text-muted-foreground">{description}</p>
          </div>
        </div>
      </Card>
    </Link>
  )
}
