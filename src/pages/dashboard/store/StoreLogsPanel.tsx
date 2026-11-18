import { useState } from "react"
import { ScrollText, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SelectMenu } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { StatCard } from "@/components/ui/stat-card"
import { useApi } from "@/hooks/useApi"
import { useStoreRealtime } from "@/hooks/useStoreRealtime"
import { LOG_LEGEND, LOG_TONE, getLogMeta } from "@/lib/logTypes"
import { formatBRL } from "@/lib/money"
import { cn } from "@/lib/utils"
import { storeService } from "@/services/store.service"
import type { StoreLog } from "@/types"
import { StoreLogDetailDialog } from "./StoreLogDetailDialog"

const formatDate = (value: string) => new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "medium" })
const formatClock = (value: string) => new Date(value).toLocaleTimeString("pt-BR", { timeStyle: "medium" })

export function StoreLogsPanel() {
  const [page, setPage] = useState(1)
  const [type, setType] = useState("")
  const [selected, setSelected] = useState<StoreLog | null>(null)
  const { data, loading, error, refetch } = useApi(() => storeService.logs({ page, type: type || undefined }), [page, type])

  useStoreRealtime({ onLog: refetch })

  const total = data?.types.reduce((sum, entry) => sum + entry.total, 0) ?? 0

  return (
    <div className="flex flex-col gap-5">
      {data && data.types.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<ScrollText className="size-5" />} tone="primary" label="Total de eventos" value={total} />
          {data.types.slice(0, 3).map(entry => {
            const meta = getLogMeta(entry.type)
            return <StatCard key={entry.type} icon={<meta.icon className="size-5" />} tone="secondary" chipClassName={LOG_TONE[meta.tone].chip} label={meta.label} value={entry.total} />
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        {LOG_LEGEND.map(item => (
          <span key={item.tone} className="text-muted-foreground flex items-center gap-2 text-xs">
            <span className={cn("size-2 rounded-full", LOG_TONE[item.tone].dot)} />
            {item.label}
          </span>
        ))}
      </div>

      <Card className="gap-0 overflow-hidden bg-foreground/[0.04] py-0 font-mono">
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b bg-white/[0.02] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="size-2.5 rounded-full bg-white/15" />
            <span className="text-muted-foreground ml-2 text-xs">store-activity.log</span>
          </div>

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
              options={(data?.types ?? []).map(entry => ({ value: entry.type, label: getLogMeta(entry.type).label }))}
              className="min-w-44 pl-8"
            />
          </div>
        </div>

        <div className="scroll-dark max-h-[560px]">
          {loading && !data && (
            <div className="flex flex-col gap-2 p-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-6 w-full" />
              ))}
            </div>
          )}

          {error && !data && (
            <div className="p-5">
              <ErrorState message={error} onRetry={refetch} />
            </div>
          )}

          {data && data.logs.length === 0 && (
            <div className="p-5">
              <EmptyState icon={<ScrollText className="size-6" />} title="Nenhum log encontrado" description="As ações da loja aparecerão aqui." />
            </div>
          )}

          {data?.logs.map(log => {
            const meta = getLogMeta(log.type)
            const tone = LOG_TONE[meta.tone]
            return (
              <div
                key={log.id}
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
                <span className={cn("inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 font-sans text-[10.5px] font-semibold", tone.badge)}>
                  <meta.icon className="size-3" />
                  {meta.label}
                </span>
                <span className="text-foreground/85 min-w-0 flex-1 truncate">{log.title}</span>
                <span className="text-muted-foreground hidden shrink-0 sm:inline">{log.actor?.name ?? "sistema"}</span>
                {log.orderCode ? (
                  <span className="text-muted-foreground/60 hidden shrink-0 lg:inline">#{log.orderCode}</span>
                ) : null}
                {log.amountCents != null && <span className="text-foreground/80 hidden shrink-0 tabular-nums lg:inline">{formatBRL(log.amountCents)}</span>}
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

      <StoreLogDetailDialog log={selected} onOpenChange={open => !open && setSelected(null)} />
    </div>
  )
}
