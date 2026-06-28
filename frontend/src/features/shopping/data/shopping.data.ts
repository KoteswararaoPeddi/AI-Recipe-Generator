import type { ShoppingItem } from "../types/shopping.types"

// Mock list until the `/shopping` API (Phase 8) exists. In the real app this is seeded from a
// recipe's missing ingredients and persisted per-user.
export const SHOPPING_ITEMS: ShoppingItem[] = [
  { id: "s1", name: "Milk", quantity: "1 l", category: "Dairy", checked: false },
  { id: "s2", name: "Curd", quantity: "1 l", category: "Dairy", checked: false },
  { id: "s3", name: "Chicken", quantity: "2 kg", category: "Meat", checked: false },
  { id: "s4", name: "Strawberries", quantity: "10 pieces", category: "Produce", checked: false },
  { id: "s5", name: "Tomatoes", quantity: "1 kg", category: "Produce", checked: false },
  { id: "s6", name: "Spinach", quantity: "1 bunch", category: "Produce", checked: false },
  { id: "s7", name: "Onions", quantity: "500 g", category: "Produce", checked: false },
]
