import { Coffee, Moon, Sun, type LucideIcon } from "lucide-react"

// The three meal slots mirror the backend `MealSlot` enum (Breakfast/Lunch/Dinner).
export type MealSlot = "Breakfast" | "Lunch" | "Dinner"

export const MEAL_SLOTS: { slot: MealSlot; icon: LucideIcon }[] = [
  { slot: "Breakfast", icon: Coffee },
  { slot: "Lunch", icon: Sun },
  { slot: "Dinner", icon: Moon },
]

/** Stable key for a planned cell: ISO date + slot. */
export function slotKey(iso: string, slot: MealSlot): string {
  return `${iso}-${slot}`
}
