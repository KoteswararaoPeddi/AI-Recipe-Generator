import type { Metadata } from "next"

import { PantryView } from "@features/pantry/components/PantryView"

export const metadata: Metadata = { title: "Pantry | PantryChef" }

export default function PantryPage() {
  return <PantryView />
}
