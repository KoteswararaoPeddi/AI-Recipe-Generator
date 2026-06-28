import { AppShell } from "@features/auth/components"

// Server layout: wraps the authenticated app chrome (client) around server-rendered pages.
export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <AppShell>{children}</AppShell>
}
