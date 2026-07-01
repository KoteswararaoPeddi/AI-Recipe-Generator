import { GenerateRecipeDto } from "../dto/generate-recipe.dto";

const COOKING_TIME_HINT: Record<string, string> = {
  quick: "under 30 minutes total",
  medium: "between 30 and 60 minutes total",
  long: "over 60 minutes is acceptable",
};

/**
 * Builds the chef prompt from the generator filters + (optionally) the user's pantry.
 * `existingTitles` are the user's already-saved recipes — the model is told to avoid repeating them
 * so generation doesn't return a recipe the user already has.
 */
export function buildRecipePrompt(
  dto: GenerateRecipeDto,
  pantryItems: string[],
  existingTitles: string[] = [],
): string {
  const available = [...dto.ingredients];
  if (dto.usePantry && pantryItems.length) {
    available.push(...pantryItems);
  }
  const ingredientList = available.length ? available.join(", ") : "common pantry staples";
  const cuisine = dto.cuisine && dto.cuisine.toLowerCase() !== "any" ? dto.cuisine : "any";
  const diets = dto.diets.length ? dto.diets.join(", ") : "no specific dietary restrictions";
  const time = COOKING_TIME_HINT[dto.cookingTime] ?? "a reasonable time";

  // Cap the list so the prompt stays small even with a large collection.
  const avoidList = existingTitles.slice(0, 40);
  const avoidBlock = avoidList.length
    ? `\n\nThe user ALREADY has these saved recipes — create something genuinely DIFFERENT (a different dish with a different title); do NOT repeat or lightly reword any of them:\n${avoidList
        .map((t) => `- ${t}`)
        .join("\n")}\n`
    : "";

  return `You are a professional chef. Create ONE delicious recipe that uses ONLY these ingredients: ${ingredientList}.
You may additionally assume basic pantry staples (oil, butter, salt, pepper, water, and common dried herbs/spices),
but do NOT introduce any other main ingredients the user did not provide.
${avoidBlock}
Constraints:
- Cuisine: ${cuisine}
- Dietary restrictions to respect: ${diets}
- Servings: ${dto.servings}
- Total cooking time should be ${time}.

Respond with JSON ONLY (no markdown, no commentary) describing the recipe:
- title: short, appetizing name
- description: 1-2 sentence summary
- cuisine: e.g. "Italian"
- difficulty: one of "Easy", "Medium", "Hard"
- diet: the primary dietary tag, or "None"
- dietTags: short attribute chips, e.g. ["High Protein", "Gluten-Free"]
- minutes: total time in minutes (integer)
- prepMinutes and cookMinutes: integers that sum to roughly minutes
- servings: ${dto.servings}
- ingredients: array of { amount: e.g. "1.5 pounds", name: e.g. "Chicken breast" }
- steps: ordered array of instruction strings
- nutrition: per serving { calories, protein, carbs, fats, fiber } as numbers (grams except calories)
- tips: 2-3 short cooking tips`;
}
