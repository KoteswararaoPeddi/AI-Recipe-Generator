import { Search } from "lucide-react"

import { cn } from "@lib/utils"
import { Input } from "@components/ui/input"
import { PANTRY_CATEGORIES } from "../types/pantry.types"

type Props = {
  query: string
  onQuery: (value: string) => void
  active: string
  onCategory: (value: string) => void
}

const FILTERS = ["All", ...PANTRY_CATEGORIES] as const

export function PantryFilters({ query, onQuery, active, onCategory }: Props) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search ingredients..."
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategory(category)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-body-base font-medium transition-colors",
                active === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-surface-raised hover:text-foreground"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
