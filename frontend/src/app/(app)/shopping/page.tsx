import type { Metadata } from "next"

import { ShoppingView } from "@features/shopping/components/ShoppingView"
import { SHOPPING_ITEMS } from "@features/shopping/data/shopping.data"

export const metadata: Metadata = { title: "Shopping | PantryChef" }

export default function ShoppingPage() {
  return <ShoppingView items={SHOPPING_ITEMS} />
}
