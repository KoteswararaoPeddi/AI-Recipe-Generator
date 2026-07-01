"use client"

import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { getErrorMessage } from "@lib/get-error-message"
import { Button } from "@components/ui/button"
import { Checkbox } from "@components/ui/checkbox"
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

import type { NewPantryItem } from "../api/pantry.service"
import { addPantryItemSchema, type AddPantryItemValues } from "../schemas/pantry.schema"
import { PANTRY_CATEGORIES, PANTRY_UNITS } from "../types/pantry.types"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (input: NewPantryItem) => Promise<void> | void
}

export function AddItemDialog({ open, onOpenChange, onAdd }: Props) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddPantryItemValues>({
    resolver: zodResolver(addPantryItemSchema),
    defaultValues: {
      name: "",
      quantity: 1,
      unit: "Pieces",
      category: "Other",
      expiryDate: "",
      runningLow: false,
    },
  })

  const onSubmit = async (values: AddPantryItemValues) => {
    try {
      await onAdd({
        name: values.name,
        category: values.category,
        quantity: values.quantity,
        unit: values.unit,
        expiryDate: values.expiryDate || undefined,
        runningLow: values.runningLow,
      })
      reset()
      onOpenChange(false)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            <Typography as="span" variant="h4" weight="semibold" className="text-foreground">
              Add Pantry Item
            </Typography>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Field label="Name" htmlFor="name" error={errors.name?.message}>
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
                      {PANTRY_UNITS.map((unit) => (
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
                    {PANTRY_CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>

          <Field label="Expiry Date (Optional)" htmlFor="expiryDate">
            <Input id="expiryDate" type="date" {...register("expiryDate")} />
          </Field>

          <label className="flex items-center gap-2">
            <Controller
              name="runningLow"
              control={control}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
              )}
            />
            <Typography as="span" variant="body-base" className="text-foreground">
              Mark as running low
            </Typography>
          </label>

          <DialogFooter className="mx-0 mb-0 border-t-0 bg-transparent p-0 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
