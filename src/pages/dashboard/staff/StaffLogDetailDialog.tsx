import { useState } from "react"
import { CalendarClock, Check, Copy, Hash, MessageSquareQuote, Ticket } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LOG_TONE, getLogMeta } from "@/lib/logTypes"
import { renderLogText, cleanLogText } from "@/lib/logText"
import { cn } from "@/lib/utils"
import type { DashboardLog, LogActor } from "@/types"

interface StaffLogDetailDialogProps {
  log: DashboardLog | null
  onOpenChange: (open: boolean) => void
}

export function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const minutes = Math.round(diff / 60_000)
  if (minutes < 1) return "agora mesmo"
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  const days = Math.round(hours / 24)
  return `há ${days} ${days === 1 ? "dia" : "dias"}`
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wider uppercase">{children}</p>
}

export function CopyId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // clipboard indisponível (http/permissão): ignora silenciosamente
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded font-mono text-[11px] transition-colors outline-none focus-visible:ring-2"
      aria-label="Copiar ID"
    >
      {id}
      {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
    </button>
  )
}

function ActorCard({ actor, fallbackLabel }: { actor: LogActor | null | undefined; fallbackLabel: string }) {
  if (!actor) {
    return (
      <div className="border-border text-muted-foreground flex min-h-[72px] items-center rounded-xl border border-dashed px-4 text-sm">
        {fallbackLabel}
      </div>
    )
  }

  return (
    <div className="border-border flex items-center gap-3 rounded-xl border bg-white/[0.025] px-3.5 py-3">
      <Avatar className="size-11">
        <AvatarImage src={actor.avatar ?? undefined} alt={actor.name} />
        <AvatarFallback>{actor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-col gap-1">
        <span className="truncate text-sm font-semibold">{actor.name}</span>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {actor.roleName ? (
            <span
              className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10.5px] font-semibold"
              style={{
                color: actor.roleColor ?? undefined,
                borderColor: actor.roleColor ? `${actor.roleColor}4d` : undefined,
                backgroundColor: actor.roleColor ? `${actor.roleColor}1a` : undefined,
              }}
            >
              <span className="size-1.5 rounded-full bg-current" />
              {actor.roleName}
            </span>
          ) : (
            <span className="text-muted-foreground text-[11px]">{actor.inServer ? "Sem cargo" : "Fora do servidor"}</span>
          )}
          <CopyId id={actor.id} />
        </div>
      </div>
    </div>
  )
}

export function StaffLogDetailDialog({ log, onOpenChange }: StaffLogDetailDialogProps) {
  const meta = log ? getLogMeta(log.type) : null
  const tone = meta ? LOG_TONE[meta.tone] : null
  const date = log ? new Date(log.createdAt) : null

  return (
    <Dialog open={!!log} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        {log && meta && tone && date && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset", tone.chip)}>
                  <meta.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <DialogTitle className="truncate">{log.title}</DialogTitle>
                  <DialogDescription>Registro de auditoria · somente leitura</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <SectionLabel>Autor</SectionLabel>
                  <ActorCard actor={log.author} fallbackLabel="Sistema (sem autor)" />
                </div>
                <div>
                  <SectionLabel>Usuário afetado</SectionLabel>
                  <ActorCard actor={log.target} fallbackLabel="Sem usuário alvo" />
                </div>
              </div>

              <div>
                <SectionLabel>Ação realizada</SectionLabel>
                <div className="border-border flex flex-col gap-2.5 rounded-xl border bg-white/[0.025] px-4 py-3.5">
                  <span
                    className={cn(
                      "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      tone.badge,
                    )}
                  >
                    <meta.icon className="size-3" />
                    {meta.label}
                  </span>
                  <p className="text-muted-foreground text-sm leading-relaxed">{renderLogText(log.description)}</p>

                  {(log.corporation || (log.details && log.details.length > 0)) && (
                    <dl className="border-border mt-1 grid gap-x-6 gap-y-2 border-t pt-3 sm:grid-cols-2">
                      {log.corporation && (
                        <div className="min-w-0">
                          <dt className="text-muted-foreground text-[11px]">Corporação</dt>
                          <dd className="text-sm font-medium break-words">{log.corporation}</dd>
                        </div>
                      )}
                      {(log.details ?? []).map(detail => (
                        <div key={`${detail.label}-${detail.value}`} className="min-w-0">
                          <dt className="text-muted-foreground text-[11px]">{cleanLogText(detail.label)}</dt>
                          <dd className="text-sm font-medium break-words">{cleanLogText(detail.value)}</dd>
                        </div>
                      ))}
                    </dl>
                  )}

                  {log.changes && log.changes.length > 0 && (
                    <ul className="border-border mt-1 flex flex-col gap-2 border-t pt-3">
                      {log.changes.map(change => (
                        <li key={change.label} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                          <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">{change.label}</span>
                          <span className="rounded-md bg-white/[0.05] px-2 py-0.5 text-xs break-words">{cleanLogText(change.from || "—")}</span>
                          <span className="text-muted-foreground">→</span>
                          <span className="bg-primary/10 text-primary rounded-md px-2 py-0.5 text-xs font-medium break-words">{cleanLogText(change.to || "—")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <div>
                <SectionLabel>Motivo</SectionLabel>
                <div
                  className={cn(
                    "flex gap-3 rounded-xl border px-4 py-3.5",
                    log.reason ? "border-border bg-white/[0.025]" : "border-border border-dashed",
                  )}
                >
                  <MessageSquareQuote className={cn("mt-0.5 size-4 shrink-0", tone.chip.split(" ").find(c => c.startsWith("text-")))} />
                  {log.reason ? (
                    <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{log.reason}</p>
                  ) : (
                    <p className="text-muted-foreground text-sm italic">Nenhum motivo foi informado pelo responsável.</p>
                  )}
                </div>
              </div>

              <div className="border-border flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border bg-black/20 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <CalendarClock className="text-muted-foreground size-4 shrink-0" />
                  <div>
                    <p className="text-sm font-medium first-letter:uppercase">
                      {date.toLocaleDateString("pt-BR", { dateStyle: "full" })} às{" "}
                      {date.toLocaleTimeString("pt-BR", { timeStyle: "medium" })}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      {relativeTime(log.createdAt)} · {date.toISOString()}
                    </p>
                  </div>
                </div>
                <div className="text-muted-foreground flex items-center gap-4 text-[11px]">
                  {log.ticketCode && (
                    <span className="inline-flex items-center gap-1">
                      <Ticket className="size-3" /> #{log.ticketCode}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Hash className="size-3" />
                    {log._id.slice(-8)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
