import type { Metadata } from "next"

import { ShoppingView } from "@features/shopping/components/ShoppingView"

export const metadata: Metadata = { title: "Shopping | PantryChef" }

export default function ShoppingPage() {
  return <ShoppingView />
}
