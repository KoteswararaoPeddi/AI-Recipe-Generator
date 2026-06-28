import { z } from "zod"

import { MEASUREMENT_UNITS } from "@shared/constants/units"
import { SHOPPING_CATEGORIES } from "../types/shopping.types"

export const addShoppingItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z
    .number({ message: "Enter a valid quantity" })
    .min(0, "Quantity must be 0 or more"),
  unit: z.enum(MEASUREMENT_UNITS),
  category: z.enum(SHOPPING_CATEGORIES),
})

export type AddShoppingItemValues = z.infer<typeof addShoppingItemSchema>
