import Link from "next/link";
import { navlinks } from "../config/navigation.config";
import { Logo } from "./Logo";
import { Button } from "./ui/button";
import { Download } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full z-30 transparent">
      <div className="w-[95%] lg:w-[90%] mx-auto h-16 flex items-center justify-between">
        {/* logo */}
        <Logo />

        {/* desktop nav */}
        <ul className="hidden lg:flex items-center gap-1 py-2.5 px-1 rounded-full bg-surface/60 backdrop-blur-xl border border-border">
          {navlinks.map((link, index) => (
            <li key={index}>
              <Link href={link.href} className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:text-primary hover:bg-surface">{link.label}</Link>
            </li>
          ))}
        </ul>

        
        <a href="/KoteswararaoPeddiResume.pdf" download="Koteswararao-Peddi-Resume.pdf">
          <Button>
            <Download className="h-5 w-5" />
            <span className="text-sm font-medium">Download CV</span>
          </Button>
        </a>

      </div>
    </nav>
  )
}
