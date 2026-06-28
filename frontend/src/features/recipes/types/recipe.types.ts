export type RecipeIngredient = { amount: string; name: string }

export type RecipeNutrition = {
  calories: number
  protein: number
  carbs: number
  fats: number
  fiber: number
}

export type Recipe = {
  id: string
  title: string
  description: string
  cuisine: string
  difficulty: string
  diet: string
  minutes: number
  servings: number
  ingredients: RecipeIngredient[]
  steps: string[]
  nutrition: RecipeNutrition
  tips: string[]
  /** Dietary / attribute chips for cards + detail (e.g. "Gluten-Free", "High Protein").
   *  Falls back to `[diet]` when omitted. */
  dietTags?: string[]
  /** Optional prep/cook split shown on the detail page; `minutes` is the total. */
  prepMinutes?: number
  cookMinutes?: number
}
