import type { PantryItem } from "../types/pantry.types"

// Mock pantry until the backend /pantry API exists (Phase 2). Replace with the service then.
export const MOCK_PANTRY: PantryItem[] = [
  { id: "1", name: "Strawberries", category: "Fruits", quantity: 250, unit: "grams", expiryDate: "2026-02-05", runningLow: true },
  { id: "2", name: "Coconut Milk", category: "Other", quantity: 400, unit: "ml", expiryDate: "2026-09-01", runningLow: false },
  { id: "3", name: "Chickpeas", category: "Grains", quantity: 1, unit: "cans", expiryDate: "2027-02-01", runningLow: false },
  { id: "4", name: "Canned Tomatoes", category: "Vegetables", quantity: 2, unit: "cans", expiryDate: "2027-01-01", runningLow: false },
  { id: "5", name: "Mayonnaise", category: "Other", quantity: 300, unit: "ml", expiryDate: "2026-03-15", runningLow: false },
  { id: "6", name: "Ketchup", category: "Other", quantity: 400, unit: "ml", expiryDate: "2026-06-01", runningLow: false },
  { id: "7", name: "Chicken Breast", category: "Meat", quantity: 500, unit: "grams", expiryDate: "2026-07-02", runningLow: false },
  { id: "8", name: "Milk", category: "Dairy", quantity: 1, unit: "liters", expiryDate: "2026-07-05", runningLow: true },
  { id: "9", name: "Cumin", category: "Spices", quantity: 50, unit: "grams", runningLow: false },
]
