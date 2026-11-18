import { useMemo, useState } from "react"
import { CircleDot, Inbox, Plus, Search, Ticket as TicketIcon } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { ToneIcon } from "@/components/ui/tone-icon"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useApi } from "@/hooks/useApi"
import { useTicketRealtime } from "@/hooks/useTicketRealtime"
import { ticketsService } from "@/services/tickets.service"
import { cn } from "@/lib/utils"
import { OpenTicketDialog } from "./components/OpenTicketDialog"
import { TicketWorkspace } from "./components/TicketWorkspace"
import { categoryMeta, formatDateTime } from "./ticket-meta"
import type { TicketSummary } from "@/types"

const STATUS_FILTERS: Array<{ value: "all" | TicketSummary["status"]; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "open", label: "Abertos" },
  { value: "closed", label: "Fechados" },
]

export function TicketsPage() {
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]["value"]>("all")
  const [query, setQuery] = useState("")
  const [activeCodigo, setActiveCodigo] = useState<string | null>(null)
  const [opening, setOpening] = useState(false)

  const { data, loading, error, refetch } = useApi(() => ticketsService.list(), [])

  const tickets = useMemo(() => {
    const term = query.trim().toLowerCase()
    return (data?.tickets ?? []).filter(ticket => {
      if (statusFilter !== "all" && ticket.status !== statusFilter) return false
      if (!term) return true
      return ticket.codigo.toLowerCase().includes(term) || (ticket.motivo ?? "").toLowerCase().includes(term)
    })
  }, [data, statusFilter, query])

  useTicketRealtime({ onChanged: refetch, onReconnect: refetch })

  const total = data?.tickets.length ?? 0
  const openCount = data?.tickets.filter(t => t.status === "open").length ?? 0
  const closedCount = total - openCount

  return (
    <DashboardLayout
      title="Tickets"
      description="Acompanhe e gerencie todos os atendimentos."
      actions={
        <Button onClick={() => setOpening(true)}>
          <Plus className="size-4" />
          Abrir ticket
        </Button>
      }
    >
      {data && (
        <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
          <StatCard icon={<Inbox className="size-5" />} tone="secondary" label="Total" value={total} />
          <StatCard icon={<CircleDot className="size-5" />} tone="accent" label="Abertos" value={openCount} />
          <StatCard icon={<CircleDot className="size-5" />} tone="primary" label="Fechados" value={closedCount} />
        </div>
      )}

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 sm:px-6 py-4">
          <div className="bg-background/40 border-border flex w-full gap-0.5 rounded-xl border p-1 sm:inline-flex sm:w-auto">
            {STATUS_FILTERS.map(filter => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setStatusFilter(filter.value)}
                className={cn(
                  "flex-1 rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150 sm:flex-none sm:py-1.5",
                  statusFilter === filter.value
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]",
                )}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar por código ou motivo..."
              aria-label="Buscar ticket"
              className="border-input placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-primary/15 h-10 w-full rounded-xl border bg-white/[0.03] pr-3 pl-10 text-sm outline-none transition-all duration-150 focus:bg-white/[0.05] focus:ring-4"
            />
          </div>
        </div>

        <div>
          {loading && (
            <div className="flex flex-col gap-2 p-4 sm:p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          )}
          {error && (
            <div className="p-4 sm:p-6">
              <ErrorState message={error} onRetry={refetch} />
            </div>
          )}

          {data && tickets.length === 0 && (
            <div className="p-4 sm:p-6">
              <EmptyState icon={<TicketIcon className="size-6" />} title="Nenhum ticket encontrado" />
            </div>
          )}

          {tickets.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Criado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map(ticket => (
                  <TableRow key={ticket.id} className="group cursor-pointer" onClick={() => setActiveCodigo(ticket.codigo)}>
                    <TableCell>
                      <span className="bg-white/[0.04] group-hover:bg-white/[0.07] rounded-md px-2 py-1 font-mono text-xs font-semibold transition-colors">
                        {ticket.codigo}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-2">
                        <ToneIcon icon={categoryMeta(ticket.type).icon} tone={categoryMeta(ticket.type).tone} className="size-7 rounded-lg" iconClassName="size-3.5" />
                        <span className="text-muted-foreground">{ticket.typeLabel}</span>
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[260px] truncate">{ticket.motivo ?? "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{ticket.claimedByName ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={ticket.status === "open" ? "success" : "secondary"} className="gap-1.5">
                        <span className={cn("size-1.5 rounded-full", ticket.status === "open" ? "bg-accent animate-pulse" : "bg-muted-foreground")} />
                        {ticket.status === "open" ? "Aberto" : "Fechado"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDateTime(ticket.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <TicketWorkspace
        codigo={activeCodigo}
        onClose={() => setActiveCodigo(null)}
        onDeleted={() => {
          setActiveCodigo(null)
          refetch()
        }}
      />

      <OpenTicketDialog
        open={opening}
        onOpenChange={setOpening}
        onCreated={codigo => {
          setOpening(false)
          refetch()
          setActiveCodigo(codigo)
        }}
      />
    </DashboardLayout>
  )
}
