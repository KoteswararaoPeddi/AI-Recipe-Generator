export const CUISINES = [
  "Any",
  "Italian",
  "Mexican",
  "Indian",
  "Chinese",
  "Thai",
  "Japanese",
  "Mediterranean",
  "American",
  "French",
  "Greek",
] as const

export const DIETS = [
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Dairy-Free",
  "Keto",
  "Paleo",
] as const

export const COOKING_TIMES = [
  { label: "Quick (<30 min)", value: "quick" },
  { label: "Medium (30-60 min)", value: "medium" },
  { label: "Long (>60 min)", value: "long" },
] as const
