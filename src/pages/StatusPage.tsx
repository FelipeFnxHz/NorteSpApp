import { useEffect, useState } from "react"
import { ArrowLeft, CalendarClock, RefreshCw, Signal, Wrench } from "lucide-react"
import { BrandMark } from "@/components/ui/brand"
import { DiscordIcon } from "@/components/ui/brand-icons"
import { Link } from "@/components/ui/link"
import { useAuth } from "@/contexts/AuthContext"
import { formatCountdown, formatReturnAt } from "@/lib/return-time"

const DISCORD_URL = "https://discord.gg/HtuHRPb4Pb"

const COPY = {
  maintenance: {
    icon: Wrench,
    eyebrow: "Ajustes em andamento",
    title: "Voltamos já, já.",
    text: "Estamos fazendo melhorias na Dashboard para deixar tudo ainda mais rápido e estável. Isso não deve demorar.",
    tone: "primary" as const,
  },
  offline: {
    icon: Signal,
    eyebrow: "Fora do ar",
    title: "A Dashboard está indisponível.",
    text: "Estamos com uma instabilidade no momento e nossa equipe já foi avisada. Tente novamente em alguns minutos.",
    tone: "destructive" as const,
  },
}

export function StatusPage({ kind }: { kind: "maintenance" | "offline" }) {
  const copy = COPY[kind]
  const { dashboardConfig } = useAuth()
  const notice = dashboardConfig.statusMessage?.trim()
  const [checking, setChecking] = useState(false)
  const [dots, setDots] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const returnAt = dashboardConfig.returnAt ?? null
  const inviteUrl = dashboardConfig.inviteUrl || DISCORD_URL

  useEffect(() => {
    const id = setInterval(() => setDots(value => (value + 1) % 4), 500)
    return () => clearInterval(id)
  }, [])

  // Atualiza a contagem regressiva sem recarregar a página.
  useEffect(() => {
    if (!returnAt) return
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [returnAt])

  function handleRetry() {
    setChecking(true)
    window.location.reload()
  }

  const toneClass =
    copy.tone === "destructive"
      ? { ring: "ring-destructive/20", border: "border-destructive/25", bg: "bg-destructive/10", text: "text-destructive", glow: "bg-destructive/[0.12]" }
      : { ring: "ring-primary/20", border: "border-primary/25", bg: "bg-primary/10", text: "text-primary", glow: "bg-primary/[0.14]" }

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-16 text-center">
      <div className="bg-grid pointer-events-none absolute inset-0 -z-10" />
      <div
        className={`pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[130px] ${toneClass.glow}`}
      />

      <BrandMark to="/" className="mb-12" />

      <div className={`relative grid size-20 place-items-center rounded-3xl ring-1 ring-inset ${toneClass.bg} ${toneClass.ring}`}>
        <copy.icon className={`size-9 ${toneClass.text}`} />
        {kind === "maintenance" && (
          <span className="border-background bg-accent absolute -right-1 -bottom-1 size-4 animate-pulse rounded-full border-[3px]" />
        )}
      </div>

      <span className={`mt-7 text-xs font-semibold tracking-[0.18em] uppercase ${toneClass.text}`}>{copy.eyebrow}</span>
      <h1 className="mt-3 max-w-md text-3xl leading-tight font-bold text-balance sm:text-4xl">{copy.title}</h1>
      <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">{copy.text}</p>

      {returnAt && (
        <div className={`mt-6 flex max-w-sm items-center gap-3 rounded-xl border px-4 py-3 text-left ${toneClass.border} ${toneClass.bg}`}>
          <CalendarClock className={`size-5 shrink-0 ${toneClass.text}`} />
          <div className="min-w-0">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">Previsão de retorno</p>
            <p className="text-sm font-semibold">
              {returnAt > now ? (
                <>
                  {formatReturnAt(returnAt, now)}
                  <span className="text-muted-foreground ml-1.5 font-normal">({formatCountdown(returnAt, now)})</span>
                </>
              ) : (
                "Finalizando os últimos ajustes"
              )}
            </p>
          </div>
        </div>
      )}

      {/* Aviso opcional definido pelo admin (Configurações → Dashboard). Texto puro: nada é interpretado como HTML. */}
      {notice && (
        <p className={`mt-5 max-w-sm rounded-xl border px-4 py-3 text-sm leading-relaxed break-words whitespace-pre-line ${toneClass.border} ${toneClass.bg}`}>
          {notice}
        </p>
      )}

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={handleRetry}
          disabled={checking}
          className="bg-primary text-primary-foreground shadow-[inset_0_1px_0_0_oklch(1_0_0/35%),0_8px_22px_-10px_color-mix(in_oklch,var(--primary),transparent_35%)] inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold transition hover:brightness-110 disabled:opacity-70"
        >
          <RefreshCw className={`size-4 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Verificando..." : "Tentar novamente"}
        </button>

        <Link
          to="/"
          className="border-primary/40 bg-primary/10 text-primary inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-sm font-semibold transition hover:bg-primary/15"
        >
          <ArrowLeft className="size-4" />
          Voltar ao início
        </Link>

        <a
          href={inviteUrl}
          target="_blank"
          rel="noreferrer"
          className="border-input inline-flex h-11 items-center gap-2 rounded-xl border bg-white/[0.03] px-5 text-sm font-semibold transition hover:border-white/20 hover:bg-white/[0.07]"
        >
          <DiscordIcon />
          Acompanhar no Discord
        </a>
      </div>

      <p className="text-muted-foreground/60 mt-10 font-mono text-xs">
        {kind === "maintenance" ? "aplicando atualizações" : "reconectando"}
        {".".repeat(dots)}
      </p>
    </div>
  )
}
