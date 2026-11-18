import { useMemo, useState } from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Coins, Lock, Radio, Ticket, TrendingUp, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/states"
import { StatCard } from "@/components/ui/stat-card"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { cn } from "@/lib/utils"
import { liveAnalyticsService } from "@/services/community.service"
import type { LiveRange } from "@/types"

const BLUE = "#4c8dff"
const GREEN = "#34d399"
const AMBER = "#f5b94a"
const VIOLET = "#a78bfa"

const RANGES: Array<{ value: LiveRange; label: string }> = [
  { value: "24h", label: "24 horas" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
]

const compact = new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 })
const full = new Intl.NumberFormat("pt-BR")
const money = (value: number) => `$${full.format(Math.round(value))}`

function tickFormatter(range: LiveRange) {
  const options: Intl.DateTimeFormatOptions = range === "24h" ? { hour: "2-digit", minute: "2-digit" } : { day: "2-digit", month: "2-digit" }
  const formatter = new Intl.DateTimeFormat("pt-BR", options)
  return (value: number) => formatter.format(new Date(value))
}

const tooltipLabel = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })

/** Tooltip no padrão visual da Dashboard (funciona nos dois temas). */
interface ChartTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{ dataKey?: unknown; color?: string; name?: unknown; value?: unknown }>
  label?: unknown
  formatValue: (value: number, name: string) => string
  formatLabel?: (label: unknown) => string
}

function ChartTooltip({ active, payload, label, formatValue, formatLabel }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="border-border bg-popover text-popover-foreground rounded-xl border px-3 py-2.5 text-xs shadow-xl">
      <p className="text-muted-foreground mb-1.5 font-medium">{formatLabel ? formatLabel(label) : String(label ?? "")}</p>
      <div className="flex flex-col gap-1">
        {payload.map(entry => (
          <p key={String(entry.dataKey)} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{String(entry.name ?? "")}</span>
            <strong className="ml-auto pl-4 tabular-nums">{formatValue(Number(entry.value), String(entry.name))}</strong>
          </p>
        ))}
      </div>
    </div>
  )
}

function ChartCard({ title, subtitle, children, empty }: { title: string; subtitle: string; children: React.ReactNode; empty?: boolean }) {
  return (
    <Card className="gap-4 p-4 sm:p-6">
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-muted-foreground text-xs">{subtitle}</p>
      </div>
      {empty ? (
        <div className="text-muted-foreground grid h-64 place-items-center rounded-xl border border-dashed text-center text-xs">
          Coletando dados… o primeiro ponto aparece em até 5 minutos.
        </div>
      ) : (
        <div className="text-muted-foreground h-64 w-full" role="img" aria-label={title}>
          {children}
        </div>
      )}
    </Card>
  )
}

const AXIS = { stroke: "currentColor", strokeOpacity: 0.15 }
const TICK = { fill: "currentColor", fontSize: 11 }

/** Gráficos em tempo real: jogadores online, economia e tickets. Atualiza por SSE a cada novo ponto coletado. */
export function LiveAnalyticsSection() {
  const [range, setRange] = useState<LiveRange>("24h")
  const { data, loading, error, refetch } = useApi(() => liveAnalyticsService.live(range), [range])
  useLiveRefresh(refetch, ["analytics-changed", "ticket-changed"], 60_000)

  const formatTick = useMemo(() => tickFormatter(range), [range])

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    )
  }
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />
  if (!data) return null

  const { players, economy, tickets } = data
  const hasPlayers = players.series.length > 1
  const peakTime = players.peak ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(players.peak.at) : undefined

  return (
    <section className="flex flex-col gap-4" aria-label="Analytics em tempo real">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Radio className="text-accent size-4" />
            Servidor em tempo real
          </h2>
          <p className="text-muted-foreground text-xs">Atualizado às {new Date(data.generatedAt).toLocaleTimeString("pt-BR")} • novos pontos a cada 5 min</p>
        </div>

        <div role="radiogroup" aria-label="Período" className="bg-background/40 border-border flex gap-0.5 rounded-xl border p-1">
          {RANGES.map(option => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={range === option.value}
              onClick={() => setRange(option.value)}
              className={cn(
                "h-7 rounded-lg px-3 text-xs font-medium transition-colors",
                range === option.value ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Users className="size-5" />}
          tone={players.online ? "accent" : "destructive"}
          label="Jogadores agora"
          value={players.online ? `${players.current}${players.max ? `/${players.max}` : ""}` : "Offline"}
        />
        <StatCard icon={<TrendingUp className="size-5" />} tone="primary" label="Pico no período" value={players.peak?.value ?? 0} hint={peakTime} />
        <StatCard icon={<Ticket className="size-5" />} tone="secondary" label="Tickets abertos" value={tickets.open} hint={`Média de ${players.average} jogadores`} />
        <StatCard
          icon={data.economyRestricted ? <Lock className="size-5" /> : <Coins className="size-5" />}
          tone="secondary"
          label="Dinheiro em circulação"
          value={economy ? `$${compact.format(economy.current.total)}` : data.economyRestricted ? "Restrito" : "—"}
          hint={economy ? `${economy.change >= 0 ? "+" : "−"}$${compact.format(Math.abs(economy.change))} no período` : data.economyRestricted ? "Somente administradores" : "Sem dados do banco"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard title="Jogadores online" subtitle="Pico de jogadores a cada intervalo" empty={!hasPlayers}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={players.series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-players" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BLUE} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.08} />
              <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={formatTick} tick={TICK} axisLine={AXIS} tickLine={false} minTickGap={36} />
              <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} width={44} />
              {players.max > 0 && <ReferenceLine y={players.max} stroke="currentColor" strokeOpacity={0.3} strokeDasharray="4 4" label={{ value: "Slots", fill: "currentColor", fontSize: 10, position: "insideTopRight" }} />}
              <Tooltip content={props => <ChartTooltip {...props} formatValue={value => String(value)} formatLabel={label => tooltipLabel.format(Number(label))} />} />
              <Area type="monotone" dataKey="players" name="Jogadores" stroke={BLUE} strokeWidth={2} fill="url(#grad-players)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Evolução da economia"
          subtitle={data.economyRestricted ? "Visível apenas para administradores" : "Dinheiro em mãos + banco de todos os personagens"}
          empty={!economy || economy.series.length < 2}
        >
          {economy && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={economy.series} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
                <defs>
                  <linearGradient id="grad-economy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={AMBER} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={AMBER} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={formatTick} tick={TICK} axisLine={AXIS} tickLine={false} minTickGap={36} />
                <YAxis tickFormatter={(value: number) => compact.format(value)} tick={TICK} axisLine={false} tickLine={false} width={52} domain={["auto", "auto"]} />
                <Tooltip content={props => <ChartTooltip {...props} formatValue={value => money(value)} formatLabel={label => tooltipLabel.format(Number(label))} />} />
                <Area type="monotone" dataKey="total" name="Total" stroke={AMBER} strokeWidth={2} fill="url(#grad-economy)" isAnimationActive={false} />
                <Line type="monotone" dataKey="bank" name="Banco" stroke={GREEN} strokeWidth={1.5} dot={false} isAnimationActive={false} />
                <Line type="monotone" dataKey="cash" name="Em mãos" stroke={VIOLET} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Tickets abertos" subtitle="Quantidade de tickets em aberto ao longo do tempo" empty={tickets.series.length < 2}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={tickets.series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="grad-tickets" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={GREEN} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={GREEN} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.08} />
              <XAxis dataKey="t" type="number" scale="time" domain={["dataMin", "dataMax"]} tickFormatter={formatTick} tick={TICK} axisLine={AXIS} tickLine={false} minTickGap={36} />
              <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={props => <ChartTooltip {...props} formatValue={value => String(value)} formatLabel={label => tooltipLabel.format(Number(label))} />} />
              <Area type="stepAfter" dataKey="open" name="Abertos" stroke={GREEN} strokeWidth={2} fill="url(#grad-tickets)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tickets criados por dia" subtitle={`Últimos ${tickets.daily.length} dias`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tickets.daily} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.08} />
              <XAxis dataKey="label" tick={TICK} axisLine={AXIS} tickLine={false} interval="preserveStartEnd" minTickGap={20} />
              <YAxis allowDecimals={false} tick={TICK} axisLine={false} tickLine={false} width={44} />
              <Tooltip cursor={{ fill: "currentColor", fillOpacity: 0.06 }} content={props => <ChartTooltip {...props} formatValue={value => String(value)} />} />
              <Bar dataKey="created" name="Criados" fill={VIOLET} radius={[6, 6, 0, 0]} maxBarSize={32} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </section>
  )
}
