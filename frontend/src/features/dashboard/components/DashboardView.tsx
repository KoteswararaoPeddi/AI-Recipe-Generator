"use client"

import { useEffect, useState } from "react"
import { CalendarDays, ChefHat, UtensilsCrossed } from "lucide-react"
import { toast } from "sonner"

import { getErrorMessage } from "@lib/get-error-message"
import { Card } from "@components/ui/card"
import { Skeleton } from "@components/ui/skeleton"
import { listPantry } from "@features/pantry/api/pantry.service"
import { listRecipes } from "@features/recipes/api/recipes.service"
import { listMealPlan } from "@features/meal-planner/api/meal-plan.service"
import { getWeek } from "@features/meal-planner/lib/week"

import type { RecentRecipe, UpcomingMeal } from "../types/dashboard.types"
import { ActionCard } from "./ActionCard"
import { RecentRecipes } from "./RecentRecipes"
import { StatCard } from "./StatCard"
import { UpcomingMeals } from "./UpcomingMeals"

export function DashboardView() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ recipes: 0, pantry: 0, meals: 0 })
  const [recent, setRecent] = useState<RecentRecipe[]>([])
  const [upcoming, setUpcoming] = useState<UpcomingMeal[]>([])

  useEffect(() => {
    let active = true
    const week = getWeek(0)
    Promise.all([listRecipes(), listPantry(), listMealPlan(week[0].iso, week[6].iso)])
      .then(([recipes, pantry, meals]) => {
        if (!active) return
        setStats({ recipes: recipes.length, pantry: pantry.length, meals: meals.length })
        setRecent(
          recipes.slice(0, 3).map((r) => ({ id: r.id, title: r.title, minutes: r.minutes }))
        )
        setUpcoming(
          meals.slice(0, 3).map((m) => ({ id: m.id, title: m.recipe.title, slot: m.slot }))
        )
      })
      .catch((error) => active && toast.error(getErrorMessage(error)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <Skeleton className="size-12 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-12" />
                </div>
              </div>
            </Card>
          ))
        ) : (
          <>
            <StatCard label="Total Recipes" value={stats.recipes} icon={ChefHat} tone="primary" />
            <StatCard
              label="Pantry Items"
              value={stats.pantry}
              icon={UtensilsCrossed}
              tone="info"
            />
            <StatCard
              label="Meals This Week"
              value={stats.meals}
              icon={CalendarDays}
              tone="purple"
            />
          </>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ActionCard
          title="Generate Recipe"
          description="Create AI-powered recipes"
          icon={ChefHat}
          href="/generate"
          highlighted
        />
        <ActionCard
          title="Manage Pantry"
          description="Add and track ingredients"
          icon={UtensilsCrossed}
          href="/pantry"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex flex-col gap-1">
                {Array.from({ length: 3 }).map((_, r) => (
                  <div key={r} className="flex items-center gap-3 p-2">
                    <Skeleton className="size-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))
        ) : (
          <>
            <RecentRecipes recipes={recent} />
            <UpcomingMeals meals={upcoming} />
          </>
        )}
      </div>
    </>
  )
}
