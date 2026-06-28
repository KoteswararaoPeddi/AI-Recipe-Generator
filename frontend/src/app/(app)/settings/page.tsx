import type { Metadata } from "next"

import { Typography } from "@components/ui/typography"
import { PasswordSection } from "@features/settings/components/PasswordSection"
import { PreferencesSection } from "@features/settings/components/PreferencesSection"
import { ProfileSection } from "@features/settings/components/ProfileSection"

export const metadata: Metadata = { title: "Settings | PantryChef" }

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <Typography variant="display-lg" weight="bold" className="text-foreground">
          Settings
        </Typography>
        <Typography variant="body-lg" className="text-muted-foreground">
          Manage your account and preferences
        </Typography>
      </div>

      <ProfileSection />
      <PasswordSection />
      <PreferencesSection />
    </div>
  )
}
