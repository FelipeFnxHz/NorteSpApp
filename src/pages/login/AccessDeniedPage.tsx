import { ArrowLeft, LockKeyhole, RefreshCw } from "lucide-react"
import { discordLoginUrl } from "@/api/client"
import { BrandMark } from "@/components/ui/brand"
import { DiscordIcon } from "@/components/ui/brand-icons"
import { buttonVariants } from "@/components/ui/button"
import { Link } from "@/components/ui/link"
import { DISCORD_URL } from "@/pages/landing/constants"

const STEPS = [
  { title: "Entre no servidor", text: "Use o botão abaixo para abrir o convite oficial." },
  { title: "Aceite as regras", text: "Conclua a verificação do Discord, se ela aparecer." },
  { title: "Volte e entre de novo", text: "Clique em “Já entrei” e a Dashboard libera na hora." },
]

export function AccessDeniedPage() {
  return (
    <section className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16">
      {/* Camadas decorativas: -z-10 + pointer-events-none para nunca engolirem cliques. */}
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <div className="bg-destructive/[0.10] pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px]" />

      <div className="absolute top-0 right-0 left-0 flex items-center justify-between px-6 py-6 sm:px-10">
        <BrandMark to="/" />
        <Link to="/login" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors">
          <ArrowLeft className="size-4" />
          Voltar ao login
        </Link>
      </div>

      <div className="flex w-full max-w-md flex-col items-center text-center">
        <div className="bg-destructive/10 ring-destructive/20 grid size-20 place-items-center rounded-3xl ring-1 ring-inset">
          <LockKeyhole className="text-destructive size-9" />
        </div>

        <span className="text-destructive mt-7 text-xs font-semibold tracking-[0.18em] uppercase">Acesso restrito</span>
        <h1 className="mt-3 text-3xl leading-tight font-bold text-balance sm:text-4xl">Você ainda não está no servidor</h1>
        <p className="text-muted-foreground mt-4 max-w-sm text-[15px] leading-relaxed text-balance">
          Você Precisa fazer parte do servidor oficial do NorteSp Roleplay no Discord para ter acesso à dashboard.
        </p>

        <div className="mt-9 flex w-full flex-col gap-3">
          <a href={DISCORD_URL} target="_blank" rel="noreferrer" className={`${buttonVariants({ variant: "discord", size: "xl" })} h-14 w-full text-base`}>
            <DiscordIcon className="size-5" />
            Entrar no servidor do Discord
          </a>
          <a href={discordLoginUrl()} data-in-app className={`${buttonVariants({ variant: "outline", size: "xl" })} h-12 w-full`}>
            <RefreshCw />
            Já entrei, tentar login novamente
          </a>
        </div>

        <ol className="border-border mt-9 flex w-full flex-col gap-4 rounded-2xl border bg-white/[0.02] p-5 text-left">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex items-start gap-3.5">
              <span className="bg-primary/12 text-primary ring-primary/20 grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ring-1 ring-inset">{index + 1}</span>
              <div>
                <p className="text-sm font-semibold">{step.title}</p>
                <p className="text-muted-foreground text-[13px] leading-relaxed">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
