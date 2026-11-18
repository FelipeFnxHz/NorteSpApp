import { useEffect, type CSSProperties } from "react"
import { ArrowUpRight } from "lucide-react"
import { DiscordIcon } from "@/components/ui/brand-icons"
import { Skeleton } from "@/components/ui/skeleton"
import { useApi } from "@/hooks/useApi"
import { cn } from "@/lib/utils"
import { developersService, type DeveloperCard } from "@/services/developers.service"
import { SectionHeading } from "./SectionHeading"

const REFRESH_MS = 120_000

const STATUS_DOT: Record<string, string> = {
  online: "bg-accent",
  idle: "bg-primary",
  dnd: "bg-destructive",
}

const STATUS_LABEL: Record<string, string> = {
  online: "Online",
  idle: "Ausente",
  dnd: "Ocupado",
}

function DeveloperTile({ developer }: { developer: DeveloperCard }) {
  const accent = developer.badges[0]?.color ?? null
  const online = developer.status in STATUS_DOT

  return (
    <article className="group border-border relative flex flex-col overflow-hidden rounded-2xl border bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.04]">
      <div
        className="pointer-events-none absolute -top-20 left-1/2 size-48 -translate-x-1/2 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundColor: accent ? `color-mix(in oklch, ${accent} 30%, transparent)` : "var(--glow)" }}
      />

      <div className="relative mx-auto">
        <img
          src={developer.avatar}
          alt={developer.displayName}
          loading="lazy"
          className="size-24 rounded-full object-cover ring-2 ring-white/10 transition-all duration-300 group-hover:ring-white/25"
          style={accent ? ({ boxShadow: `0 0 0 4px color-mix(in oklch, ${accent} 14%, transparent)` } as CSSProperties) : undefined}
        />
        <span
          title={online ? STATUS_LABEL[developer.status] : "Offline"}
          className={cn(
            "border-card absolute right-1 bottom-1 size-5 rounded-full border-[3px]",
            online ? STATUS_DOT[developer.status] : "bg-muted-foreground/50",
          )}
        />
      </div>

      <div className="relative mt-5 text-center">
        <h3 className="font-display truncate text-lg font-bold">{developer.displayName}</h3>
        <p className="text-muted-foreground truncate text-xs">@{developer.username}</p>
      </div>

      <div className="relative mt-4 flex flex-wrap justify-center gap-1.5">
        {developer.badges.length === 0 && (
          <span className="border-primary/25 bg-primary/10 text-primary rounded-full border px-2.5 py-0.5 text-[11px] font-semibold">
            {developer.title}
          </span>
        )}
        {developer.badges.map(badge => (
          <span
            key={badge.name}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] font-semibold"
          >
            <span className="size-1.5 rounded-full" style={{ backgroundColor: badge.color ?? "var(--primary)" }} />
            {badge.name}
          </span>
        ))}
      </div>

      <a
        href={developer.profileUrl}
        target="_blank"
        rel="noreferrer"
        className="bg-discord/12 text-discord hover:bg-discord/22 relative mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors"
      >
        <DiscordIcon className="size-4" />
        Ver no Discord
        <ArrowUpRight className="size-3.5 opacity-70 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </a>
    </article>
  )
}

export function Developers() {
  const { data, loading, error, refetch } = useApi(() => developersService.list(), [])

  useEffect(() => {
    const id = setInterval(refetch, REFRESH_MS)
    return () => clearInterval(id)
  }, [refetch])

  const developers = data?.developers ?? []

  const gridClass =
    developers.length === 1
      ? "max-w-xs grid-cols-1"
      : developers.length === 2
        ? "max-w-2xl sm:grid-cols-2"
        : "max-w-5xl sm:grid-cols-2 lg:grid-cols-3"

  if (!loading && (error || developers.length === 0)) return null

  return (
    <section id="desenvolvedores" className="border-border/70 border-t py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="Equipe"
          title="Quem constrói a NorteSp Roleplay."
          description="Os desenvolvedores por trás do servidor, do bot e da dashboard — atualizados em tempo real direto do nosso Discord."
        />

        <div className={cn("mx-auto mt-12 sm:mt-16 grid gap-5", gridClass)}>
          {loading && Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-[22rem] w-full rounded-2xl" />)}
          {developers.map(developer => (
            <DeveloperTile key={developer.id} developer={developer} />
          ))}
        </div>
      </div>
    </section>
  )
}
