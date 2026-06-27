import Link from "next/link"
import { CodeXml } from "lucide-react"
import { cn } from "../lib/utils"


type Props = {
  className?: string
  href?: string
}

export function Logo({ className, href = "/" }: Props) {
  return (
    <Link
      href={href}
      aria-label="Portfolio home"
      className={cn(
        "group inline-flex items-center gap-3 text-h2 font-extrabold tracking-tight text-primary",
        className
      )}
    >
      <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center border border-border shadow-sm group-hover:scale-105 group-hover:border-primary transition-all duration-300">
        <CodeXml className="w-5 h-5" />
      </div>

      <p className="hidden sm:block font-bold text-lg md:text-xl tracking-wide text-foreground group-hover:text-primary transform-colors duration-300">
        Portfolio
      </p>

    </Link>
  )
}
