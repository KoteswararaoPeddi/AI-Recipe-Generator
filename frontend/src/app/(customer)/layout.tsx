import { Toaster } from "sonner"

import { Footer } from "@/shared/components/Footer"
import { Navbar } from "@components/Navbar"

export default function CustomerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <Toaster position="top-center" richColors theme="dark" />
    </div>
  )
}
