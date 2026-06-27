// Render-driving navigation data for the portfolio chrome (navbar + footer).
// The portfolio is a single page; section links resolve to in-page anchors.

export type NavLink = {
  label: string
  href: string
}

export type SocialLink = {
  label: string
  href: string
  icon: "github" | "linkedin" | "x"
}

// Primary nav links (shown in the navbar). Single page, so these are in-page
// anchors that match each section's `id`.
export const navlinks: NavLink[] = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Experience", href: "#experience" },
  { label: "Contact", href: "#contact" },
]

// Social links shown in the footer.
export const socials: SocialLink[] = [
  { label: "GitHub", href: "#", icon: "github" },
  { label: "LinkedIn", href: "#", icon: "linkedin" },
  { label: "X", href: "#", icon: "x" },
]

export const footerContent = {
  tagline:
    "Crafting modern, scalable web experiences with clean code and thoughtful design.",
  copyrightName: "Portfolio",
  year: 2026,
}
