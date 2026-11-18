import { useState } from "react"
import { MessageSquare, MessagesSquare, RefreshCw, Star, ThumbsUp, Trophy } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { StatCard } from "@/components/ui/stat-card"
import { Button } from "@/components/ui/button"
import { useApi } from "@/hooks/useApi"
import { feedbackService } from "@/services/feedback.service"

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

function Stars({ rating, size = "size-3.5" }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className={`${size} ${index < rating ? "fill-primary text-primary" : "text-muted-foreground/25"}`} />
      ))}
    </div>
  )
}

function RatingDistribution({ dist, total }: { dist: Record<number, number>; total: number }) {
  return (
    <div className="flex flex-col gap-2">
      {[5, 4, 3, 2, 1].map(star => {
        const count = dist[star] ?? 0
        const percent = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={star} className="flex items-center gap-3 text-xs">
            <span className="text-muted-foreground flex w-8 shrink-0 items-center gap-0.5">
              {star}
              <Star className="fill-muted-foreground/40 text-muted-foreground/40 size-3" />
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
              <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${Math.max(percent, count > 0 ? 3 : 0)}%` }} />
            </div>
            <span className="text-muted-foreground w-7 shrink-0 text-right tabular-nums">{count}</span>
          </div>
        )
      })}
    </div>
  )
}

export function FeedbackPage() {
  const [page, setPage] = useState(1)
  const { data: stats, refetch: refetchStats } = useApi(() => feedbackService.stats(), [])
  const { data, loading, error, refetch } = useApi(() => feedbackService.list({ page, limit: 20 }), [page])

  return (
    <DashboardLayout title="Feedback" description="Avaliações recebidas ao fechar tickets.">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetch()
            refetchStats()
          }}
        >
          <RefreshCw className="size-3.5" />
          Atualizar
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<MessagesSquare className="size-5" />} tone="primary" label="Total de avaliações" value={stats.total} />
          <StatCard icon={<Star className="size-5" />} tone="accent" label="Nota média" value={stats.avgRating.toFixed(1)} />
          <StatCard icon={<ThumbsUp className="size-5" />} tone="secondary" label="Com comentário" value={stats.withComment} />
          <StatCard
            icon={<Trophy className="size-5" />}
            tone="secondary"
            label="Melhor avaliado"
            value={stats.topStaff[0]?.staffName || "—"}
          />
        </div>
      )}

      {stats && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="px-4 sm:px-6">
            <h3 className="mb-4 text-lg font-semibold">Distribuição de notas</h3>
            <RatingDistribution dist={stats.ratingDist} total={stats.total} />
          </Card>

          <Card className="px-4 sm:px-6">
            <h3 className="mb-4 text-lg font-semibold">Ranking da staff</h3>
            {stats.topStaff.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sem avaliações suficientes ainda.</p>
            ) : (
              <div className="flex flex-col gap-1">
                {stats.topStaff.map((staff, index) => (
                  <div key={staff._id} className="flex items-center gap-3 rounded-lg px-1 py-2 text-sm">
                    <span
                      className={`grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-bold ${
                        index === 0 ? "bg-primary/15 text-primary" : "bg-white/[0.05] text-muted-foreground"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{staff.staffName || `Staff #${staff._id.slice(-4)}`}</span>
                    <Stars rating={Math.round(staff.avgRating)} />
                    <span className="text-muted-foreground w-9 shrink-0 text-right text-xs">({staff.total})</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <Card className="gap-4 px-4 sm:px-6">
        <div>
          <h3 className="text-lg font-semibold">Todos os feedbacks</h3>
          <p className="text-muted-foreground text-xs">O que jogadores disseram sobre os atendimentos.</p>
        </div>

        {loading && (
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        )}

        {error && <ErrorState message={error} onRetry={refetch} />}

        {data && data.feedbacks.length === 0 && (
          <EmptyState icon={<MessageSquare className="size-6" />} title="Nenhum feedback encontrado" />
        )}

        {data && data.feedbacks.length > 0 && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              {data.feedbacks.map(item => (
                <div
                  key={item._id}
                  className="border-border hover:border-white/15 flex flex-col gap-3 rounded-xl border bg-white/[0.02] p-4 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <img src={item.userAvatar} alt="" className="size-8 rounded-full object-cover ring-1 ring-white/10" />
                      <div>
                        <p className="text-[13px] leading-tight font-semibold">{item.username}</p>
                        <p className="text-muted-foreground text-[11px]">avaliou {item.staffName || "a staff"}</p>
                      </div>
                    </div>
                    <Stars rating={item.rating} />
                  </div>

                  {item.comment && <p className="text-muted-foreground border-primary/25 border-l-2 pl-3 text-sm leading-relaxed">{item.comment}</p>}

                  <div className="text-muted-foreground/70 mt-auto flex items-center gap-3 text-[11px]">
                    <span>Ticket {item.ticketCode || "-"}</span>
                    <span>·</span>
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>

            {data.totalPages > 1 && (
              <div className="mt-1 flex items-center justify-center gap-4 text-sm">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>
                  Anterior
                </Button>
                <span className="text-muted-foreground text-xs">
                  Página {data.page} de {data.totalPages}
                </span>
                <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage(value => value + 1)}>
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </DashboardLayout>
  )
}
