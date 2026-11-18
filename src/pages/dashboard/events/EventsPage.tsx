import { useEffect, useMemo, useState } from "react"
import { CalendarDays, CalendarX, MapPin, Pencil, Plus, Timer } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { EVENT_CATEGORIES, categoryMeta, dayLabel, formatTime, startOfDayKey } from "@/lib/community"
import { LOG_TONE } from "@/lib/logTypes"
import { cn } from "@/lib/utils"
import { eventsService } from "@/services/community.service"
import type { RoleplayEvent } from "@/types"
import { EventFormDialog } from "./EventFormDialog"
import { MiniCalendar } from "./MiniCalendar"

const GRACE_MS = 2 * 3_600_000

function eventState(event: RoleplayEvent, now: number): "cancelled" | "live" | "upcoming" | "past" {
  if (event.status === "cancelled") return "cancelled"
  const start = Date.parse(event.startsAt)
  const end = event.endsAt ? Date.parse(event.endsAt) : start + GRACE_MS
  if (now >= end) return "past"
  return now >= start ? "live" : "upcoming"
}

function countdown(startsAt: string, now: number): string | null {
  const minutes = Math.ceil((Date.parse(startsAt) - now) / 60_000)
  if (minutes <= 0) return null
  if (minutes < 60) return `começa em ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `começa em ${hours}h${minutes % 60 ? ` ${minutes % 60}min` : ""}`
  return null
}

export function EventsPage() {
  const { isStaff } = useAuth()
  const [showAll, setShowAll] = useState(false)
  const { data, loading, error, refetch } = useApi(() => eventsService.list(isStaff && showAll), [isStaff && showAll])
  useLiveRefresh(refetch, ["events-changed"], 120_000)

  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const [month, setMonth] = useState(() => new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [editing, setEditing] = useState<RoleplayEvent | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [cancelling, setCancelling] = useState<RoleplayEvent | null>(null)
  const [reason, setReason] = useState("")

  const events = data?.items ?? []

  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const event of events) {
      const key = startOfDayKey(new Date(event.startsAt))
      map.set(key, (map.get(key) ?? 0) + 1)
    }
    return map
  }, [events])

  const groups = useMemo(() => {
    const filtered = selectedDay ? events.filter(event => startOfDayKey(new Date(event.startsAt)) === selectedDay) : events
    const map = new Map<string, RoleplayEvent[]>()
    for (const event of filtered) {
      const key = startOfDayKey(new Date(event.startsAt))
      map.set(key, [...(map.get(key) ?? []), event])
    }
    return [...map.entries()]
  }, [events, selectedDay])

  return (
    <DashboardLayout title="Agenda de Eventos" description="Corridas, leilões e eventos oficiais do servidor.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Radio className="text-accent size-3.5" />
          Atualizado em tempo real
        </span> */}

        {isStaff && (
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-muted-foreground flex cursor-pointer items-center gap-2 text-xs">
              <Switch checked={showAll} onCheckedChange={setShowAll} aria-label="Mostrar passados e cancelados" />
              Passados e cancelados
            </label>
            <Button
              size="sm"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              <Plus className="size-4" />
              Agendar evento
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="order-2 flex min-w-0 flex-col gap-6 lg:order-1">
          {loading && !data && Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-32 w-full rounded-2xl" />)}
          {error && !data && <ErrorState message={error} onRetry={refetch} />}

          {data && groups.length === 0 && (
            <EmptyState
              icon={<CalendarDays className="size-8" />}
              title={selectedDay ? "Sem eventos neste dia" : "Nenhum evento agendado"}
              description={selectedDay ? "Escolha outro dia no calendário." : "Quando a staff agendar algo, aparece aqui na hora."}
            />
          )}

          {groups.map(([key, dayEvents]) => (
            <section key={key} aria-label={dayLabel(new Date(`${key}T12:00:00`))} className="flex flex-col gap-3">
              <h3 className="text-muted-foreground flex items-center gap-3 text-xs font-semibold tracking-wide uppercase">
                <span className="first-letter:uppercase">{dayLabel(new Date(`${key}T12:00:00`))}</span>
                <span className="bg-border h-px flex-1" />
              </h3>

              {dayEvents.map(event => {
                const state = eventState(event, now)
                const meta = categoryMeta(EVENT_CATEGORIES, event.category)
                const tone = LOG_TONE[meta.tone]
                const soon = state === "upcoming" ? countdown(event.startsAt, now) : null

                return (
                  <Card key={event.id} className={cn("gap-4 p-4 sm:p-5", state === "cancelled" && "opacity-60", state === "live" && "border-accent/40")}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-4">
                        <div className={cn("flex min-w-16 shrink-0 flex-col items-center rounded-xl px-3 py-2 ring-1 ring-inset", tone.chip)}>
                          <span className="font-display text-lg leading-none font-bold tabular-nums">{formatTime(event.startsAt)}</span>
                          {event.endsAt && <span className="mt-1 text-[10px] opacity-80 tabular-nums">até {formatTime(event.endsAt)}</span>}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", tone.badge)}>{meta.label}</span>
                            {state === "live" && <Badge variant="success">Acontecendo agora</Badge>}
                            {state === "cancelled" && <Badge variant="destructive">Cancelado</Badge>}
                            {state === "past" && <Badge variant="secondary">Encerrado</Badge>}
                            {soon && (
                              <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                                <Timer className="size-3" />
                                {soon}
                              </span>
                            )}
                          </div>
                          <h4 className={cn("font-display mt-1.5 text-base font-bold break-words", state === "cancelled" && "line-through")}>{event.title}</h4>
                          <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{event.location}</span>
                          </p>
                        </div>
                      </div>

                      {isStaff && state !== "cancelled" && state !== "past" && (
                        <div className="flex gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label={`Editar ${event.title}`}
                            onClick={() => {
                              setEditing(event)
                              setFormOpen(true)
                            }}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label={`Cancelar ${event.title}`}
                            onClick={() => {
                              setReason("")
                              setCancelling(event)
                            }}
                          >
                            <CalendarX className="text-destructive size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    {event.description && <p className="text-foreground/90 text-sm leading-relaxed break-words whitespace-pre-line">{event.description}</p>}
                    {event.cancelReason && <p className="text-destructive text-xs">Motivo do cancelamento: {event.cancelReason}</p>}
                  </Card>
                )
              })}
            </section>
          ))}
        </div>

        <aside className="order-1 lg:order-2">
          <Card className="p-4 sm:p-5 lg:sticky lg:top-6">
            <MiniCalendar month={month} counts={counts} selected={selectedDay} onSelect={setSelectedDay} onMonthChange={setMonth} />
            {selectedDay && (
              <Button size="sm" variant="ghost" className="mt-3 w-full" onClick={() => setSelectedDay(null)}>
                Limpar filtro de dia
              </Button>
            )}
          </Card>
        </aside>
      </div>

      <EventFormDialog open={formOpen} event={editing} onOpenChange={setFormOpen} onSaved={refetch} />

      <ConfirmDialog
        open={cancelling !== null}
        onOpenChange={next => !next && setCancelling(null)}
        variant="destructive"
        title={`Cancelar “${cancelling?.title}”?`}
        description="O evento aparece como cancelado para todos os jogadores e o cancelamento é registrado nos logs."
        confirmLabel="Cancelar evento"
        loadingLabel="Cancelando..."
        onConfirm={async () => {
          if (!cancelling) return
          await eventsService.cancel(cancelling.id, reason)
          setCancelling(null)
          refetch()
        }}
      >
        <Textarea value={reason} maxLength={300} rows={3} onChange={event => setReason(event.target.value)} placeholder="Motivo (opcional) — será exibido aos jogadores" aria-label="Motivo do cancelamento" />
      </ConfirmDialog>
    </DashboardLayout>
  )
}
