export const PANTRY_CATEGORIES = [
  "Vegetables",
  "Fruits",
  "Dairy",
  "Meat",
  "Grains",
  "Spices",
  "Other",
] as const

export type PantryCategory = (typeof PANTRY_CATEGORIES)[number]

// Units are shared across forms — see shared/constants/units.ts (single source of truth).
export { MEASUREMENT_UNITS as PANTRY_UNITS } from "@shared/constants/units"
export type { MeasurementUnit as PantryUnit } from "@shared/constants/units"

export type PantryItem = {
  id: string
  name: string
  category: PantryCategory
  quantity: number
  unit: string
  expiryDate?: string // ISO yyyy-mm-dd
  runningLow: boolean
}
