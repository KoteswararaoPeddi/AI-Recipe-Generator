"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Clock, Plus, X } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@lib/utils"
import { getErrorMessage } from "@lib/get-error-message"
import { confirm } from "@shared/stores/confirm.store"
import { Button } from "@components/ui/button"
import { Typography } from "@components/ui/typography"
import { listRecipes } from "@features/recipes/api/recipes.service"
import type { Recipe } from "@features/recipes/types/recipe.types"

import { assignMeal, listMealPlan, removeMeal, type MealEntry } from "../api/meal-plan.service"
import { MEAL_SLOTS, slotKey, type MealSlot } from "../constants"
import { formatWeekRange, getWeek, type WeekDay } from "../lib/week"
import { RecipePickerDialog } from "./RecipePickerDialog"

type Plan = Record<string, MealEntry>
type Target = { day: WeekDay; slot: MealSlot }

export function MealPlannerView() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [plan, setPlan] = useState<Plan>({})
  const [target, setTarget] = useState<Target | null>(null)
  const [recipes, setRecipes] = useState<Recipe[]>([])

  const week = useMemo(() => getWeek(weekOffset), [weekOffset])
  const range = formatWeekRange(week)
  const plannedCount = Object.keys(plan).length

  // Saved-recipe pool for the picker — fetched once.
  useEffect(() => {
    let active = true
    listRecipes()
      .then((data) => active && setRecipes(data))
      .catch((error) => active && toast.error(getErrorMessage(error)))
    return () => {
      active = false
    }
  }, [])

  // Week entries — refetched whenever the visible week changes.
  useEffect(() => {
    let active = true
    listMealPlan(week[0].iso, week[6].iso)
      .then((entries) => {
        if (!active) return
        const next: Plan = {}
        for (const entry of entries) {
          next[slotKey(entry.date, entry.slot as MealSlot)] = entry
        }
        setPlan(next)
      })
      .catch((error) => active && toast.error(getErrorMessage(error)))
    return () => {
      active = false
    }
  }, [week])

  const assign = async (recipe: Recipe) => {
    if (!target) return
    const { day, slot } = target
    try {
      const entry = await assignMeal({ date: day.iso, slot, recipeId: recipe.id })
      setPlan((prev) => ({ ...prev, [slotKey(entry.date, entry.slot as MealSlot)]: entry }))
      setTarget(null)
      toast.success(`Added to ${day.label} · ${slot}`)
    } catch (error) {
      toast.error(getErrorMessage(error))
    }
  }

  // Confirm, then optimistic remove — revert if the request fails.
  const clear = async (iso: string, slot: MealSlot) => {
    const key = slotKey(iso, slot)
    const entry = plan[key]
    if (!entry) return
    const ok = await confirm({
      title: "Remove meal?",
      description: `Remove "${entry.recipe.title}" from ${slot}?`,
      confirmLabel: "Remove",
    })
    if (!ok) return
    const previous = plan
    setPlan((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    try {
      await removeMeal(entry.id)
    } catch (error) {
      setPlan(previous)
      toast.error(getErrorMessage(error))
    }
  }

  return (
    <div className="space-y-6">
      {/* Week navigation */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Typography variant="h4" weight="semibold" className="text-foreground">
            {range}
          </Typography>
          <Typography variant="body-sm" className="text-muted-foreground">
            {plannedCount} {plannedCount === 1 ? "meal" : "meals"} planned this week
          </Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Previous week"
            onClick={() => setWeekOffset((w) => w - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant={weekOffset === 0 ? "default" : "outline"}
            size="sm"
            onClick={() => setWeekOffset(0)}
          >
            This Week
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Next week"
            onClick={() => setWeekOffset((w) => w + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* 7-day × 3-slot grid — stacks to 1/2 columns on smaller screens */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {week.map((day) => (
          <div key={day.iso} className="rounded-xl border border-border bg-surface p-3 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <Typography variant="body-base" weight="semibold" className="text-foreground">
                {day.label}
              </Typography>
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-label-sm font-semibold",
                  day.isToday
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {day.dayNum}
              </span>
            </div>

            <div className="space-y-2">
              {MEAL_SLOTS.map(({ slot, icon: Icon }) => {
                const recipe = plan[slotKey(day.iso, slot)]?.recipe
                return (
                  <div key={slot}>
                    <span className="mb-1 flex items-center gap-1.5 text-muted-foreground">
                      <Icon className="size-3.5" />
                      <Typography as="span" variant="caption" weight="medium">
                        {slot}
                      </Typography>
                    </span>

                    {recipe ? (
                      <div className="group relative rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                        <Typography
                          variant="body-sm"
                          weight="medium"
                          className="line-clamp-2 pr-5 text-foreground"
                        >
                          {recipe.title}
                        </Typography>
                        <span className="mt-1 flex items-center gap-1 text-muted-foreground">
                          <Clock className="size-3" />
                          <Typography as="span" variant="caption">
                            {recipe.minutes} mins
                          </Typography>
                        </span>
                        <button
                          type="button"
                          aria-label={`Remove ${recipe.title}`}
                          onClick={() => clear(day.iso, slot)}
                          className="absolute top-1.5 right-1.5 text-muted-foreground transition-colors hover:text-destructive"
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTarget({ day, slot })}
                        className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-border py-3 text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
                      >
                        <Plus className="size-3.5" />
                        <Typography as="span" variant="caption" weight="medium">
                          Add
                        </Typography>
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <RecipePickerDialog
        open={target !== null}
        onOpenChange={(next) => !next && setTarget(null)}
        recipes={recipes}
        context={target ? `${target.day.label} ${target.day.dayNum} · ${target.slot}` : null}
        onSelect={assign}
      />
    </div>
  )
}
