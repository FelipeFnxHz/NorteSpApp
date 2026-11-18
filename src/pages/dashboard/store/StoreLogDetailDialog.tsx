import { CalendarClock, Hash, Receipt } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { LOG_TONE, getLogMeta } from "@/lib/logTypes"
import { cleanLogText, renderLogText } from "@/lib/logText"
import { formatBRL } from "@/lib/money"
import { cn } from "@/lib/utils"
import type { StoreLog } from "@/types"
import { CopyId, SectionLabel, relativeTime } from "../staff/StaffLogDetailDialog"

export function StoreLogDetailDialog({ log, onOpenChange }: { log: StoreLog | null; onOpenChange: (open: boolean) => void }) {
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
                  <DialogDescription>Registro de auditoria da loja · somente leitura</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="flex flex-col gap-5">
              <div>
                <SectionLabel>{log.orderCode ? "Comprador / responsável" : "Responsável"}</SectionLabel>
                {log.actor ? (
                  <div className="border-border flex items-center gap-3 rounded-xl border bg-white/[0.025] px-3.5 py-3">
                    <Avatar className="size-11">
                      <AvatarImage src={log.actor.avatar ?? undefined} alt={log.actor.name} />
                      <AvatarFallback>{log.actor.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="truncate text-sm font-semibold">{log.actor.name}</span>
                      <CopyId id={log.actor.id} />
                    </div>
                  </div>
                ) : (
                  <div className="border-border text-muted-foreground flex min-h-[72px] items-center rounded-xl border border-dashed px-4 text-sm">Sistema (sem autor)</div>
                )}
              </div>

              <div>
                <SectionLabel>Ação realizada</SectionLabel>
                <div className="border-border flex flex-col gap-2.5 rounded-xl border bg-white/[0.025] px-4 py-3.5">
                  <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", tone.badge)}>
                    <meta.icon className="size-3" />
                    {meta.label}
                  </span>
                  <p className="text-muted-foreground text-sm leading-relaxed">{renderLogText(log.description)}</p>

                  {(log.orderCode || log.amountCents != null || log.details.length > 0) && (
                    <dl className="border-border mt-1 grid gap-x-6 gap-y-2 border-t pt-3 sm:grid-cols-2">
                      {log.orderCode && (
                        <div className="min-w-0">
                          <dt className="text-muted-foreground text-[11px]">Pedido</dt>
                          <dd className="font-mono text-sm font-medium break-words">{log.orderCode}</dd>
                        </div>
                      )}
                      {log.amountCents != null && (
                        <div className="min-w-0">
                          <dt className="text-muted-foreground text-[11px]">Valor</dt>
                          <dd className="text-sm font-medium tabular-nums">{formatBRL(log.amountCents)}</dd>
                        </div>
                      )}
                      {log.details
                        .filter(detail => !/^💵/u.test(detail.label))
                        .map((detail, index) => (
                          <div key={index} className="min-w-0">
                            <dt className="text-muted-foreground text-[11px]">{cleanLogText(detail.label).replace(/^\S+\s/u, "")}</dt>
                            <dd className="text-sm font-medium break-words whitespace-pre-line">{cleanLogText(detail.value)}</dd>
                          </div>
                        ))}
                    </dl>
                  )}

                  {log.changes.length > 0 && (
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

              <div className="border-border flex flex-wrap items-center justify-between gap-x-6 gap-y-3 rounded-xl border bg-black/20 px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <CalendarClock className="text-muted-foreground size-4 shrink-0" />
                  <div>
                    <p className="text-sm font-medium first-letter:uppercase">
                      {date.toLocaleDateString("pt-BR", { dateStyle: "full" })} às {date.toLocaleTimeString("pt-BR", { timeStyle: "medium" })}
                    </p>
                    <p className="text-muted-foreground text-[11px]">
                      {relativeTime(log.createdAt)} · {date.toISOString()}
                    </p>
                  </div>
                </div>
                <div className="text-muted-foreground flex items-center gap-4 text-[11px]">
                  {log.orderCode && (
                    <span className="inline-flex items-center gap-1">
                      <Receipt className="size-3" /> {log.orderCode}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 font-mono">
                    <Hash className="size-3" />
                    {log.id.slice(-8)}
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
