import { lazy, Suspense } from "react"
import { ArrowDownRight, ArrowUpRight, BarChart3, Clock3, Flame, LineChart, PieChart, TrendingUp } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/states"
import { StatCard } from "@/components/ui/stat-card"
import { BarChart } from "@/components/charts/BarChart"
import { Sparkline } from "@/components/charts/Sparkline"
import { useApi } from "@/hooks/useApi"
import { dashboardService } from "@/services/dashboard.service"

// Recharts só é baixado quando a página de Analytics é aberta.
const LiveAnalyticsSection = lazy(() => import("./LiveAnalyticsSection").then(module => ({ default: module.LiveAnalyticsSection })))

export function AnalyticsPage() {
  const { data, loading, error, refetch } = useApi(() => dashboardService.analytics(), [])
  const trend = data?.advanced.weeklyGrowth

  return (
    <DashboardLayout title="Analytics" description="Métricas do servidor em tempo real e do atendimento.">
      <Suspense fallback={<Skeleton className="h-80 w-full rounded-2xl" />}>
        <LiveAnalyticsSection />
      </Suspense>

      {loading && (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-72 w-full rounded-2xl" />
            <Skeleton className="h-72 w-full rounded-2xl" />
          </div>
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Card className="relative gap-2 overflow-hidden p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="bg-primary/12 text-primary ring-primary/20 grid size-10 place-items-center sm:size-11 rounded-xl ring-1 ring-inset">
                  <BarChart3 className="size-5" />
                </span>
                {trend !== undefined && (
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      trend >= 0 ? "bg-accent/12 text-accent" : "bg-destructive/12 text-destructive"
                    }`}
                  >
                    {trend >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                    {Math.abs(trend)}%
                  </span>
                )}
              </div>
              <span className="text-muted-foreground text-xs font-medium">Tickets essa semana</span>
              <strong className="font-display text-2xl font-bold">{data.advanced.currentWeekTotal}</strong>
              <Sparkline values={data.ticketsByDay.map(d => d.total)} />
            </Card>

            <StatCard icon={<Clock3 className="size-5" />} tone="accent" label="Tempo médio de fechamento" value={data.advanced.averageCloseTime} />
            <StatCard icon={<TrendingUp className="size-5" />} tone="secondary" label="Tickets fechados" value={data.advanced.closedTickets} />
            <StatCard icon={<BarChart3 className="size-5" />} tone="secondary" label="Semana anterior" value={data.advanced.previousWeekTotal} />
          </div>

          <Card className="px-4 sm:px-6">
            <div className="mb-5 flex items-center gap-2">
              <LineChart className="text-primary size-4" />
              <h3 className="text-lg font-semibold">Tickets nos últimos 7 dias</h3>
            </div>
            <BarChart items={data.ticketsByDay.map(day => ({ label: day.label, value: day.total }))} />
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="px-4 sm:px-6">
              <div className="mb-5 flex items-center gap-2">
                <PieChart className="text-primary size-4" />
                <h3 className="text-lg font-semibold">Categorias mais usadas</h3>
              </div>
              {data.categories.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">Sem dados suficientes ainda.</p>
              ) : (
                <BarChart
                  items={data.categories.map(category => ({
                    label: category.label,
                    value: category.total,
                    hint: `${category.percent}%`,
                  }))}
                />
              )}
            </Card>

            <Card className="px-4 sm:px-6">
              <div className="mb-5 flex items-center gap-2">
                <Flame className="text-accent size-4" />
                <h3 className="text-lg font-semibold">Horários mais movimentados</h3>
              </div>
              {data.busyHours.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">Sem dados suficientes ainda.</p>
              ) : (
                <BarChart tone="accent" items={data.busyHours.map(hour => ({ label: hour.hour, value: hour.total }))} />
              )}
            </Card>
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
