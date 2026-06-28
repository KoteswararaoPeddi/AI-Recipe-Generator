// Mock content for the dashboard until the pantry/recipes/meal-plan APIs exist.
// Pure content only (no icons/JSX) — those live in the components.

export type RecentRecipe = { id: string; title: string; minutes: number }

export const RECENT_RECIPES: RecentRecipe[] = [
  { id: "1", title: "Quick Chicken Fajita Skillet", minutes: 16 },
  { id: "2", title: "Quick Tofu & Vegetable Donburi", minutes: 15 },
  { id: "3", title: "Speedy Mexican Beef & Quinoa Bowls with Fresh Strawberries", minutes: 20 },
]

export type UpcomingMeal = { id: string; title: string; slot: string }

export const UPCOMING_MEALS: UpcomingMeal[] = [
  { id: "1", title: "Italian Stuffed Bell Peppers with Quinoa & Chickpeas", slot: "Breakfast" },
  { id: "2", title: "Quick Chicken Fajita Skillet", slot: "Breakfast" },
  { id: "3", title: "Italian Stuffed Bell Peppers with Quinoa & Chickpeas", slot: "Breakfast" },
]
