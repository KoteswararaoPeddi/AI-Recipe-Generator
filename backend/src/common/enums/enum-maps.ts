import { Cuisine, Diet, Difficulty, MealSlot } from "@prisma/client";

/**
 * Bidirectional maps between the Prisma enums (DB) and the human-readable labels the
 * frontend uses. Labels match the frontend constants exactly (CUISINES / DIETS / difficulty
 * chips / meal slots). Reverse lookups are case-insensitive and fall back to a default so a
 * stray value from the AI or an old client never throws.
 */

export const CUISINE_TO_LABEL: Record<Cuisine, string> = {
  ANY: "Any",
  ITALIAN: "Italian",
  MEXICAN: "Mexican",
  INDIAN: "Indian",
  CHINESE: "Chinese",
  THAI: "Thai",
  JAPANESE: "Japanese",
  MEDITERRANEAN: "Mediterranean",
  AMERICAN: "American",
  FRENCH: "French",
  GREEK: "Greek",
  SPANISH: "Spanish",
  KOREAN: "Korean",
};

export const DIFFICULTY_TO_LABEL: Record<Difficulty, string> = {
  EASY: "Easy",
  MEDIUM: "Medium",
  HARD: "Hard",
};

export const DIET_TO_LABEL: Record<Diet, string> = {
  NONE: "None",
  VEGETARIAN: "Vegetarian",
  VEGAN: "Vegan",
  KETO: "Keto",
  PALEO: "Paleo",
  GLUTEN_FREE: "Gluten-Free",
};

export const SLOT_TO_LABEL: Record<MealSlot, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

function reverseLookup<T extends string>(
  map: Record<T, string>,
  label: string | null | undefined,
  fallback: T,
): T {
  if (!label) return fallback;
  const needle = label.trim().toLowerCase();
  const match = (Object.entries(map) as [T, string][]).find(
    ([, value]) => value.toLowerCase() === needle,
  );
  return match ? match[0] : fallback;
}

export const labelToCuisine = (label?: string | null): Cuisine =>
  reverseLookup(CUISINE_TO_LABEL, label, Cuisine.ANY);

export const labelToDifficulty = (label?: string | null): Difficulty =>
  reverseLookup(DIFFICULTY_TO_LABEL, label, Difficulty.MEDIUM);

export const labelToDiet = (label?: string | null): Diet =>
  reverseLookup(DIET_TO_LABEL, label, Diet.NONE);

export const labelToSlot = (label?: string | null): MealSlot =>
  reverseLookup(SLOT_TO_LABEL, label, MealSlot.BREAKFAST);
