import type { Metadata } from "next"
import { Sparkles } from "lucide-react"

import { Typography } from "@components/ui/typography"
import { GeneratorView } from "@features/generator/components/GeneratorView"

export const metadata: Metadata = { title: "Generate | PantryChef" }

export default function GeneratePage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center">
        <span className="flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sparkles className="size-8" />
        </span>
        <Typography variant="display-lg" weight="bold" className="mt-4 text-foreground">
          AI Recipe Generator
        </Typography>
        <Typography variant="body-lg" className="text-muted-foreground">
          Let AI create delicious recipes based on your ingredients
        </Typography>
      </div>

      <GeneratorView />
    </div>
  )
}
