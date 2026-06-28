"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@components/ui/dialog"
import { Field } from "@components/ui/field"
import { Input } from "@components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@components/ui/select"
import { Typography } from "@components/ui/typography"

import { MEASUREMENT_UNITS } from "@shared/constants/units"

import { addShoppingItemSchema, type AddShoppingItemValues } from "../schemas/shopping.schema"
import { SHOPPING_CATEGORIES, type ShoppingItem } from "../types/shopping.types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (item: ShoppingItem) => void
}

export function AddShoppingItemDialog({ open, onOpenChange, onAdd }: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddShoppingItemValues>({
    resolver: zodResolver(addShoppingItemSchema),
    defaultValues: { name: "", quantity: 1, unit: "Pieces", category: "Other" },
  })

  const onSubmit = (values: AddShoppingItemValues) => {
    onAdd({
      id: crypto.randomUUID(),
      name: values.name,
      quantity: `${values.quantity} ${values.unit}`,
      category: values.category,
      checked: false,
    })
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Typography as="span" variant="h4" weight="semibold" className="text-foreground">
              Add Item
            </Typography>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Field label="Item Name" htmlFor="name" error={errors.name?.message}>
            <Input id="name" autoFocus {...register("name")} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Quantity" htmlFor="quantity" error={errors.quantity?.message}>
              <Input
                id="quantity"
                type="number"
                step="any"
                min="0"
                {...register("quantity", { valueAsNumber: true })}
              />
            </Field>
            <Field label="Unit" error={errors.unit?.message}>
              <Controller
                name="unit"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEASUREMENT_UNITS.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <Field label="Category" error={errors.category?.message}>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SHOPPING_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <DialogFooter className="mx-0 mb-0 border-t-0 bg-transparent p-0 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
