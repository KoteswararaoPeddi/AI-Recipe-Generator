// Canonical measurement units shared by the pantry and shopping-list forms.
// Single source of truth — features re-use this rather than redefining their own list.
export const MEASUREMENT_UNITS = [
  "Pieces",
  "grams",
  "kg",
  "ml",
  "liters",
  "cans",
  "cups",
  "tbsp",
  "tsp",
] as const

export type MeasurementUnit = (typeof MEASUREMENT_UNITS)[number]
