"use client"

import { useState } from "react"
import { Save } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@lib/utils"
import { Button } from "@components/ui/button"
import { Input } from "@components/ui/input"
import { Slider } from "@components/ui/slider"
import { Typography } from "@components/ui/typography"
import { CUISINES, DIETS } from "@features/generator/constants"

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
  const [restrictions, setRestrictions] = useState<string[]>(["Vegetarian"])
  const [allergies, setAllergies] = useState("")
  const [cuisine, setCuisine] = useState("Mexican")
  const [servings, setServings] = useState(4)
  const [unit, setUnit] = useState<string>("metric")

  const toggleRestriction = (diet: string) =>
    setRestrictions((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    )

  const save = () => toast.success("Preferences saved")

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

        <Button onClick={save} className="w-fit">
          <Save className="size-4" />
          Save Preferences
        </Button>
      </div>
    </SettingsCard>
  )
}
