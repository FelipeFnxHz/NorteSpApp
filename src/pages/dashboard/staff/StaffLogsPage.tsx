import { useState } from "react"
import { ScrollText, Search } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { SelectMenu } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { useApi } from "@/hooks/useApi"
import { staffService } from "@/services/staff.service"
import { LOG_LEGEND, LOG_TONE, getLogMeta } from "@/lib/logTypes"
import { cn } from "@/lib/utils"
import { StaffLogDetailDialog } from "./StaffLogDetailDialog"
import type { DashboardLog } from "@/types"

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" })
}

function formatClock(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", { timeStyle: "medium" })
}

export function StaffLogsPage() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState("")
  const [selected, setSelected] = useState<DashboardLog | null>(null)

  const { data, loading, error, refetch } = useApi(
    () => staffService.logs({ page, limit: 25, type: type || undefined }),
    [page, type],
  )
  const { data: stats } = useApi(() => staffService.logsStats(), [])

  return (
    <DashboardLayout title="Logs da Staff" description="Monitoramento de ações realizadas pela equipe, em tempo real.">
      {stats && stats.byType.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<ScrollText className="size-5" />} tone="primary" label="Total de eventos" value={stats.total} />
          {stats.byType.slice(0, 3).map(entry => {
            const meta = getLogMeta(entry.type)
            return (
              <StatCard
                key={entry.type}
                icon={<meta.icon className="size-5" />}
                tone="secondary"
                chipClassName={LOG_TONE[meta.tone].chip}
                label={meta.label}
                value={entry.total}
              />
            )
          })}
        </div>
      )}

      {/* Legend — every color on this page means the same thing */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {LOG_LEGEND.map(item => (
          <span key={item.tone} className="text-muted-foreground flex items-center gap-2 text-xs">
            <span className={cn("size-2 rounded-full", LOG_TONE[item.tone].dot)} />
            {item.label}
          </span>
        ))}
      </div>

      {/* Terminal-style event feed */}
      <Card className="gap-0 overflow-hidden bg-foreground/[0.04] py-0 font-mono">
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b bg-white/[0.02] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="text-muted-foreground ml-2 text-xs">staff-activity.log</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
              <SelectMenu
                value={type}
                onValueChange={value => {
                  setType(value)
                  setPage(1)
                }}
                aria-label="Filtrar por tipo"
                placeholder="Todos os tipos"
                options={(stats?.byType ?? []).map(entry => ({ value: entry.type, label: getLogMeta(entry.type).label }))}
                className="min-w-44 pl-8"
              />
            </div>
          </div>
        </div>

        <div className="max-h-[560px] overflow-y-auto">
          {loading && !data && (
            <div className="flex flex-col gap-2 p-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          )}

          {error && (
            <div className="p-5">
              <ErrorState message={error} onRetry={refetch} />
            </div>
          )}

          {data && data.logs.length === 0 && (
            <div className="p-5">
              <EmptyState icon={<ScrollText className="size-6" />} title="Nenhum log encontrado" />
            </div>
          )}

          {data?.logs.map(log => {
            const meta = getLogMeta(log.type)
            const tone = LOG_TONE[meta.tone]
            return (
              <div
                key={log._id}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalhes: ${log.title}`}
                onClick={() => setSelected(log)}
                onKeyDown={event => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    setSelected(log)
                  }
                }}
                className="group border-border/60 focus-visible:ring-primary/40 flex cursor-pointer items-start gap-3 border-b px-5 py-2.5 text-[13px] leading-relaxed transition-colors outline-none last:border-0 hover:bg-white/[0.04] focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset"
              >
                <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", tone.dot)} />
                <span className="text-muted-foreground/70 w-[86px] shrink-0 tabular-nums">{formatClock(log.createdAt)}</span>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 font-sans text-[10.5px] font-semibold",
                    tone.badge,
                  )}
                >
                  <meta.icon className="size-3" />
                  {meta.label}
                </span>
                <span className="min-w-0 flex-1 truncate text-foreground/85">{log.title}</span>
                <span className="text-muted-foreground hidden shrink-0 sm:inline">{log.staffName ?? "sistema"}</span>
                {log.ticketCode && <span className="text-muted-foreground/60 hidden shrink-0 lg:inline">#{log.ticketCode}</span>}
                <span className="text-muted-foreground/50 hidden shrink-0 xl:inline">{formatDate(log.createdAt)}</span>
              </div>
            )
          })}
        </div>

        {data && data.totalPages > 1 && (
          <div className="border-border flex items-center justify-center gap-4 border-t bg-white/[0.02] py-3 text-xs">
            <Button variant="outline" size="sm" disabled={data.page <= 1} onClick={() => setPage(p => p - 1)}>
              Anterior
            </Button>
            <span className="text-muted-foreground font-sans">
              Página {data.page} de {data.totalPages}
            </span>
            <Button variant="outline" size="sm" disabled={data.page >= data.totalPages} onClick={() => setPage(p => p + 1)}>
              Próxima
            </Button>
          </div>
        )}
      </Card>

      <StaffLogDetailDialog log={selected} onOpenChange={open => !open && setSelected(null)} />
    </DashboardLayout>
  )
}
