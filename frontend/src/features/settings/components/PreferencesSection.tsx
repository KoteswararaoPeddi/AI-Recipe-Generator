"use client"

import { useEffect, useState } from "react"
import { Save } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Skeleton } from "@components/ui/skeleton"
import { Slider } from "@components/ui/slider"
import { Typography } from "@components/ui/typography"
import { getErrorMessage } from "@lib/get-error-message"
import { CUISINES, DIETS } from "@features/generator/constants"

import { getPreferences, updatePreferences } from "../api/settings.service"
import { SettingsCard } from "./SettingsCard"

const pill = (active: boolean) =>
  cn(
    "rounded-lg px-4 py-2 text-body-base font-medium transition-colors",
    active
      ? "bg-primary text-primary-foreground"
      : "bg-muted text-muted-foreground hover:bg-surface-raised hover:text-foreground"
  )

const MEASUREMENT_UNITS = [
  { value: "metric", label: "Metric (kg, L)" },
  { value: "imperial", label: "Imperial (lb, gal)" },
] as const

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Typography as="div" variant="label-lg" weight="medium" className="mb-2 text-foreground">
      {children}
    </Typography>
  )
}

export function PreferencesSection() {
  const [restrictions, setRestrictions] = useState<string[]>([])
  const [allergies, setAllergies] = useState("")
  const [cuisine, setCuisine] = useState("Any")
  const [servings, setServings] = useState(4)
  const [unit, setUnit] = useState<string>("metric")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let active = true
    getPreferences()
      .then((prefs) => {
        if (!active) return
        setRestrictions(prefs.dietaryRestrictions)
        setAllergies(prefs.allergies)
        setCuisine(prefs.preferredCuisine)
        setServings(prefs.defaultServings)
        setUnit(prefs.measurementUnit)
      })
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const toggleRestriction = (diet: string) =>
    setRestrictions((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    )

  const save = async () => {
    setSaving(true)
    const id = toast.loading("Saving preferences...")
    try {
      await updatePreferences({
        dietaryRestrictions: restrictions,
        allergies,
        preferredCuisine: cuisine,
        defaultServings: servings,
        measurementUnit: unit,
      })
      toast.success("Preferences saved", { id })
    } catch (error) {
      toast.error(getErrorMessage(error), { id })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SettingsCard title="Dietary Preferences">
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-36" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-24 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-20 rounded-lg" />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-12 rounded-lg" />
            <Skeleton className="h-12 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-40 rounded-lg" />
        </div>
      </SettingsCard>
    )
  }

  return (
    <SettingsCard title="Dietary Preferences">
      <div className="space-y-6">
        <div>
          <FieldLabel>Dietary Restrictions</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {DIETS.map((diet) => (
              <button
                key={diet}
                type="button"
                onClick={() => toggleRestriction(diet)}
                className={pill(restrictions.includes(diet))}
              >
                {diet}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Allergies (comma-separated)</FieldLabel>
          <Input
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
            placeholder="e.g., peanuts, shellfish, soy"
          />
        </div>

        <div>
          <FieldLabel>Preferred Cuisines</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {CUISINES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCuisine(c)}
                className={pill(cuisine === c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div>
          <FieldLabel>Default Servings: {servings}</FieldLabel>
          <Slider
            value={[servings]}
            min={1}
            max={12}
            step={1}
            onValueChange={(v) => setServings((Array.isArray(v) ? v[0] : v) as number)}
          />
          <div className="mt-1 flex justify-between">
            <Typography as="span" variant="body-sm" className="text-muted-foreground">
              1
            </Typography>
            <Typography as="span" variant="body-sm" className="text-muted-foreground">
              12
            </Typography>
          </div>
        </div>

        <div>
          <FieldLabel>Measurement Unit</FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            {MEASUREMENT_UNITS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setUnit(option.value)}
                className={cn(
                  "rounded-lg px-4 py-3 text-body-base font-medium transition-colors",
                  unit === option.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-surface-raised hover:text-foreground"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={save} disabled={saving} className="w-fit">
          <Save className="size-4" />
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </SettingsCard>
  )
}
