import { useEffect, useState } from "react"
import { LayoutDashboard, Menu, X } from "lucide-react"
import { Link } from "@/components/ui/link"
import { BrandMark } from "@/components/ui/brand"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { NAV_LINKS } from "./constants"

export function LandingNavbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b pt-[env(safe-area-inset-top)] transition-colors duration-300",
        scrolled || open ? "bg-background/80 border-border backdrop-blur-xl" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
        <BrandMark to="/" />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Seções">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/[0.05]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <Link to="/login" className={buttonVariants({ size: "default" })}>
            <LayoutDashboard />
            Entrar na Dashboard
          </Link>
        </div>

        <button
          type="button"
          className="border-border grid size-11 place-items-center rounded-lg border md:hidden"
          onClick={() => setOpen(value => !value)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      {open && (
        <div className="border-border flex max-h-[calc(100dvh-4rem)] flex-col gap-1 overflow-y-auto border-t px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden">
          {NAV_LINKS.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="text-muted-foreground hover:text-foreground rounded-lg px-3 py-3 text-[15px] font-medium hover:bg-white/[0.05]"
            >
              {link.label}
            </a>
          ))}
          <Link to="/login" onClick={() => setOpen(false)} className={cn(buttonVariants({ size: "lg" }), "mt-2 w-full")}>
            Entrar na Dashboard
          </Link>
        </div>
      )}
    </header>
  )
}
