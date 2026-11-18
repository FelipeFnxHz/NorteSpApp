import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"
import { Link } from "@/components/ui/link"
import { buttonVariants } from "@/components/ui/button"
import { DiscordIcon } from "@/components/ui/brand-icons"
import { DISCORD_URL } from "./constants"

export function CtaSection() {
  return (
    <section className="px-5 pb-16 sm:pb-24">
      <div className="border-border relative mx-auto max-w-6xl overflow-hidden rounded-3xl border bg-white/[0.02] px-5 py-12 text-center sm:px-8 sm:py-16 md:py-20">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="bg-primary/[0.16] absolute -top-32 left-1/2 h-72 w-[640px] -translate-x-1/2 rounded-full blur-[100px]" />

        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl leading-[1.08] font-bold text-balance md:text-[46px]">
            Sua história na NorteSp começa <span className="text-gradient">agora.</span>
          </h2>
          <p className="text-muted-foreground mx-auto mt-5 max-w-lg text-base">
            Entre no Discord, faça a whitelist e conecte. A dashboard acompanha você depois.
          </p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row sm:items-center">
            <a href={DISCORD_URL} target="_blank" rel="noreferrer" className={cn(buttonVariants({ variant: "discord", size: "xl" }), "sm:w-auto")}>
              <DiscordIcon />
              Entrar no Discord
            </a>
            <Link to="/login" className={buttonVariants({ variant: "outline", size: "xl" })}>
              Acessar Dashboard
              <ArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
