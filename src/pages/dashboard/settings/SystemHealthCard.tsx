import { Activity, CheckCircle2, Clock, Users, Webhook, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/states"
import { useApi } from "@/hooks/useApi"
import { dashboardService } from "@/services/dashboard.service"

const WEBHOOKS: Array<{ key: "logs" | "announcements" | "dashboardLogs" | "storeLogs"; label: string }> = [
  { key: "logs", label: "Logs gerais" },
  { key: "announcements", label: "Anúncios" },
  { key: "dashboardLogs", label: "Logs da Dashboard" },
  { key: "storeLogs", label: "Logs da Loja" },
]

function formatUptime(seconds: number | null) {
  if (seconds === null) return "—"
  const days = Math.floor(seconds / 86_400)
  const hours = Math.floor((seconds % 86_400) / 3_600)
  const minutes = Math.floor((seconds % 3_600) / 60)
  return days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border-border flex items-center gap-3 rounded-xl border bg-white/[0.02] px-4 py-3.5">
      <span className="bg-primary/12 text-primary ring-primary/20 grid size-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset">{icon}</span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">{label}</p>
        <p className="truncate text-base font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  )
}

/** Saúde do bot e das integrações do Discord (somente indicadores: as URLs dos webhooks nunca são exibidas). */
export function SystemHealthCard() {
  const { data, loading, error, refetch } = useApi(() => dashboardService.system(), [])

  return (
    <Card className="px-4 sm:px-6">
      <h3 className="mb-1 flex items-center gap-2 font-semibold">
        <Activity className="size-4" />
        Bot e integrações
      </h3>
      <p className="text-muted-foreground mb-5 text-xs">Saúde do bot e quais canais de log estão conectados.</p>

      {loading && !data && <Skeleton className="h-44 w-full rounded-xl" />}
      {error && !data && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <div className="flex flex-col gap-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Metric icon={<Activity className="size-4" />} label="Latência" value={data.ping != null && data.ping >= 0 ? `${data.ping} ms` : "—"} />
            <Metric icon={<Clock className="size-4" />} label="Online há" value={formatUptime(data.uptimeSeconds)} />
            <Metric icon={<Users className="size-4" />} label="Membros" value={data.members != null ? data.members.toLocaleString("pt-BR") : "—"} />
          </div>

          <div>
            <p className="mb-1 flex items-center gap-2 text-sm font-medium">
              <Webhook className="size-4" /> Webhooks de log
            </p>
            <div className="flex flex-col">
              {WEBHOOKS.map(item => (
                <div key={item.key} className="border-border/60 flex items-center justify-between gap-3 border-b py-3 text-sm last:border-0">
                  <span>{item.label}</span>
                  {data.webhooks[item.key] ? (
                    <Badge variant="success">
                      <CheckCircle2 className="size-3" /> Conectado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <XCircle className="size-3" /> Não configurado
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            <p className="text-muted-foreground mt-2 text-xs">Configure pelo Discord: Admin → Servidor → Webhooks.</p>
          </div>
        </div>
      )}
    </Card>
  )
}
