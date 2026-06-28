import type { Metadata } from "next"
import { CalendarDays, ChefHat, UtensilsCrossed } from "lucide-react"

import { ActionCard } from "@features/dashboard/components/ActionCard"
import { RecentRecipes } from "@features/dashboard/components/RecentRecipes"
import { StatCard } from "@features/dashboard/components/StatCard"
import { UpcomingMeals } from "@features/dashboard/components/UpcomingMeals"
import { RECENT_RECIPES, UPCOMING_MEALS } from "@features/dashboard/data/dashboard.data"

export const metadata: Metadata = {
  title: "Dashboard | PantryChef",
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-display-lg font-bold text-foreground">Dashboard</h1>
        <p className="text-body-lg text-muted-foreground">
          Welcome back! Here&apos;s your cooking overview
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total Recipes" value={4} icon={ChefHat} tone="primary" />
        <StatCard label="Pantry Items" value={37} icon={UtensilsCrossed} tone="info" />
        <StatCard label="Meals This Week" value={3} icon={CalendarDays} tone="purple" />
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
        <RecentRecipes recipes={RECENT_RECIPES} />
        <UpcomingMeals meals={UPCOMING_MEALS} />
      </div>
    </div>
  )
}
