import { useEffect, useState } from "react"
import { Building2, Briefcase, MessageSquare, Users } from "lucide-react"
import { useApi } from "@/hooks/useApi"
import { publicStatsService } from "@/services/publicStats.service"
import { Skeleton } from "@/components/ui/skeleton"
import { TONES, type Tone } from "@/components/ui/tone-icon"

function CountUp({ value }: { value: number }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 900
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [value])

  return <>{display.toLocaleString("pt-BR")}</>
}

export function Stats() {
  const { data, loading, error } = useApi(() => publicStatsService.get(), [])

  const items: { icon: typeof Users; label: string; value?: number; tone: Tone }[] = [
    { icon: Users, label: "Jogadores online", value: data?.playersOnline, tone: "orange" },
    { icon: MessageSquare, label: "Membros no Discord", value: data?.discordMembers, tone: "indigo" },
    { icon: Building2, label: "Organizações ativas", value: data?.organizations, tone: "purple" },
    { icon: Briefcase, label: "Empresas registradas", value: data?.companies, tone: "green" },
  ]

  return (
    <section id="estatisticas" className="border-border/70 border-t py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <div className="border-border grid grid-cols-2 overflow-hidden rounded-3xl border bg-white/[0.02] md:grid-cols-4 md:divide-x md:divide-white/[0.06]">
          {items.map((item, index) => (
            <div
              key={item.label}
              className={`flex flex-col gap-3 p-5 sm:p-7 ${index % 2 === 0 ? "border-r border-white/[0.06] md:border-r-0" : ""} ${index < 2 ? "border-b border-white/[0.06] md:border-b-0" : ""}`}
            >
              <item.icon className="size-5" style={{ color: TONES[item.tone] }} />
              {loading ? (
                <Skeleton className="h-10 w-24" />
              ) : error || item.value === undefined ? (
                <strong className="font-display text-muted-foreground text-3xl leading-none sm:text-4xl font-bold">—</strong>
              ) : (
                <strong className="font-display text-3xl leading-none sm:text-4xl font-bold tracking-tight tabular-nums">
                  <CountUp value={item.value} />
                  <span className="text-primary">+</span>
                </strong>
              )}
              <span className="text-muted-foreground text-sm">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
