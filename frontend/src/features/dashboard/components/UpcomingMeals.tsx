import Link from "next/link"
import { CalendarDays } from "lucide-react"

import { Card } from "@components/ui/card"
import type { UpcomingMeal } from "../types/dashboard.types"

export function UpcomingMeals({ meals }: { meals: UpcomingMeal[] }) {
  return (
    <Card className="p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-h4 font-semibold text-foreground">Upcoming Meals</h2>
        <Link href="/meal-plan" className="text-body-base font-medium text-primary hover:underline">
          View calendar
        </Link>
      </div>

      {meals.length === 0 ? (
        <p className="py-6 text-center text-body-base text-muted-foreground">
          No meals planned this week.
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {meals.map((meal) => (
            <li key={meal.id}>
              <Link
                href="/meal-plan"
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-purple-500/10 text-purple-500">
                  <CalendarDays className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-body-lg font-medium text-foreground">{meal.title}</p>
                  <p className="text-body-sm text-muted-foreground">{meal.slot}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
