import { z } from "zod"

import { PANTRY_CATEGORIES, PANTRY_UNITS } from "../types/pantry.types"

export const addPantryItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z
    .number({ message: "Enter a valid quantity" })
    .min(0, "Quantity must be 0 or more"),
  unit: z.enum(PANTRY_UNITS),
  category: z.enum(PANTRY_CATEGORIES),
  expiryDate: z.string().optional(),
  runningLow: z.boolean(),
})

export type AddPantryItemValues = z.infer<typeof addPantryItemSchema>
