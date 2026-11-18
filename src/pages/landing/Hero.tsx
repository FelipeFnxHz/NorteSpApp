import { ArrowRight, Gamepad2 } from "lucide-react"
import { Link } from "@/components/ui/link"
import { buttonVariants } from "@/components/ui/button"
import { DiscordIcon } from "@/components/ui/brand-icons"
import { cn } from "@/lib/utils"
import { DashboardPreview } from "./DashboardPreview"
import { DISCORD_URL, FIVEM_URL } from "./constants"

const HIGHLIGHTS = ["Whitelist organizada", "Economia própria", "Corporações e facções", "Eventos toda semana"]

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="bg-grid absolute inset-0 -z-10" />
      <div className="bg-primary/[0.14] absolute -top-40 left-1/2 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-[120px]" />
      <div className="bg-accent/[0.08] absolute top-40 -right-40 -z-10 h-[420px] w-[420px] rounded-full blur-[120px]" />

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-12 pb-20 sm:gap-16 sm:px-6 sm:pt-16 sm:pb-24 lg:grid-cols-[1.05fr_1fr] lg:pt-24 lg:pb-32">
        <div>
          <span className="animate-fade-up glass inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-2 text-xs font-medium">
            <span className="bg-accent/15 grid size-5 place-items-center rounded-full">
              <span className="bg-accent animate-pulse-ring size-2 rounded-full" />
            </span>
            Servidor de FiveM Roleplay
          </span>

          <h1
            className="animate-fade-up mt-6 text-[2.5rem] leading-[1.05] font-bold text-balance sm:mt-7 sm:text-5xl md:text-[68px]"
            style={{ animationDelay: "80ms" }}
          >
            Uma cidade viva,
            <br />
            feita para <span className="text-gradient">contar histórias.</span>
          </h1>

          <p
            className="animate-fade-up text-muted-foreground mt-5 max-w-xl text-base leading-relaxed text-pretty sm:mt-6 sm:text-lg"
            style={{ animationDelay: "160ms" }}
          >
            A NorteSp reúne economia própria, corporações, facções e eventos semanais — com um bot no Discord e uma
            dashboard que mantêm tudo organizado e transparente.
          </p>

          <div className="animate-fade-up mt-8 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap" style={{ animationDelay: "240ms" }}>
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "discord", size: "xl" }), "w-full sm:w-auto")}>
              <DiscordIcon />
              Entrar no Discord
            </a>
            <Link to="/login" className={cn(buttonVariants({ variant: "outline", size: "xl" }), "w-full sm:w-auto")}>
              Acessar Dashboard
              <ArrowRight />
            </Link>
            <a href={FIVEM_URL} className={cn(buttonVariants({ variant: "ghost", size: "xl" }), "hidden sm:inline-flex")}>
              <Gamepad2 />
              Conectar
            </a>
          </div>

          <ul
            className="animate-fade-up text-muted-foreground mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm sm:mt-10 sm:gap-x-6"
            style={{ animationDelay: "320ms" }}
          >
            {HIGHLIGHTS.map(item => (
              <li key={item} className="flex items-center gap-2">
                <span className="bg-primary size-1 rounded-full" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-fade-up" style={{ animationDelay: "200ms" }}>
          <DashboardPreview />
        </div>
      </div>
    </section>
  )
}
