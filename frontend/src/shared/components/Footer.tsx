import { Logo } from "./Logo"
import { Separator } from "./ui/separator"
import { Typography } from "./ui/typography"
import { GithubIcon, LinkedinIcon, XIcon } from "./icons/SocialIcons"
import { footerContent, socials } from "../config/navigation.config"

// Render-driving map: social icon key -> brand glyph component.
const SOCIAL_ICONS = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  x: XIcon,
} as const

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative z-10 mx-auto w-[90%] max-w-6xl space-y-10 py-14">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:items-start md:justify-between md:text-left">
          <div className="max-w-xs space-y-3">
            <div className="flex justify-center md:justify-start">
              <Logo />
            </div>
            <Typography variant="body-base" className="text-muted-foreground">
              {footerContent.tagline}
            </Typography>
          </div>

          <div className="flex items-center gap-4">
            {socials.map((social) => {
              const Icon = SOCIAL_ICONS[social.icon]
              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex size-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-all hover:border-primary hover:text-primary"
                >
                  <Icon className="size-5" />
                </a>
              )
            })}
          </div>
        </div>

        <div className="text-center">
          <Separator className="mb-6" />
          <Typography as="span" variant="body-base" className="text-muted-foreground">
            © {footerContent.year} {footerContent.copyrightName}. All rights reserved.
          </Typography>
        </div>
      </div>
    </footer>
  )
}
