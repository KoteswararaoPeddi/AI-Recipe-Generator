import {
  BookOpen,
  CalendarDays,
  ChefHat,
  Home,
  ShoppingCart,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
}

// Top-nav items for the authenticated app shell. Order matches the design.
export const APP_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "Pantry", href: "/pantry", icon: UtensilsCrossed },
  { label: "Generate", href: "/generate", icon: ChefHat },
  { label: "Recipes", href: "/recipes", icon: BookOpen },
  { label: "Meal Plan", href: "/meal-plan", icon: CalendarDays },
  { label: "Shopping", href: "/shopping", icon: ShoppingCart },
]
