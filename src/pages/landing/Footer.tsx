import { Gamepad2 } from "lucide-react"
import { Link } from "@/components/ui/link"
import { BrandMark } from "@/components/ui/brand"
import { DiscordIcon } from "@/components/ui/brand-icons"
import { DISCORD_URL, FIVEM_URL, NAV_LINKS } from "./constants"

const linkClass = "text-muted-foreground hover:text-foreground py-0.5 text-sm transition-colors"

export function Footer() {
  return (
    <footer className="border-border/70 border-t bg-black/20">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-10 px-5 py-12 sm:px-6 sm:py-16 md:grid-cols-[1.4fr_1fr_1fr_1fr] md:gap-12">
        <div className="col-span-2 md:col-span-1">
          <BrandMark to="/" />
          <p className="text-muted-foreground mt-5 max-w-xs text-sm leading-relaxed">
            Servidor de FiveM roleplay. Uma cidade construída pela comunidade, para a comunidade.
          </p>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer"
            className="bg-discord/12 text-discord hover:bg-discord/20 mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
          >
            <DiscordIcon className="size-4" />
            Entrar no Discord
          </a>
        </div>

        <nav className="col-span-1 flex flex-col gap-3" aria-label="Navegação">
          <strong className="text-foreground/90 mb-1 text-xs font-semibold tracking-[0.14em] uppercase">Navegação</strong>
          {NAV_LINKS.map(link => (
            <a key={link.href} href={link.href} className={linkClass}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <strong className="text-foreground/90 mb-1 text-xs font-semibold tracking-[0.14em] uppercase">Acesso</strong>
          <Link to="/login" className={linkClass}>
            Dashboard
          </Link>
          <a href={FIVEM_URL} className={`${linkClass} flex items-center gap-2`}>
            <Gamepad2 className="size-4" />
            Conectar ao servidor
          </a>
        </div>

        <div className="flex flex-col gap-3">
          <strong className="text-foreground/90 mb-1 text-xs font-semibold tracking-[0.14em] uppercase">Legal</strong>
          <Link to="/termos-de-uso" className={linkClass}>
            Termos de Uso
          </Link>
          <Link to="/politica-de-privacidade" className={linkClass}>
            Política de Privacidade
          </Link>
        </div>
      </div>

      <div className="border-border/70 border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-2 px-5 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-xs sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-6">
          <span>© {new Date().getFullYear()} NorteSp Roleplay. Todos os direitos reservados.</span>
          <span>Não afiliado à Rockstar Games, Cfx.re ou Discord.</span>
        </div>
      </div>
    </footer>
  )
}
