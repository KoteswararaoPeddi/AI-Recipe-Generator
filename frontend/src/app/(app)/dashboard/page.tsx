import type { Metadata } from "next"

import { DashboardView } from "@features/dashboard/components/DashboardView"

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

      <DashboardView />
    </div>
  )
}
