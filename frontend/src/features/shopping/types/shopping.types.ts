export const SHOPPING_CATEGORIES = [
  "Produce",
  "Meat",
  "Dairy",
  "Bakery",
  "Pantry",
  "Frozen",
  "Other",
] as const

export type ShoppingCategory = (typeof SHOPPING_CATEGORIES)[number]

export type ShoppingItem = {
  id: string
  name: string
  category: ShoppingCategory
  quantity: number
  unit: string
  checked: boolean
}
