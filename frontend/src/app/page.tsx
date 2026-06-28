import { redirect } from "next/navigation"

// No public landing — entry point is the auth flow.
export default function HomePage() {
  redirect("/login")
}
