import { Gavel, Radio, ShieldCheck, TriangleAlert, Ticket } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Link } from "@/components/ui/link"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { StatCard } from "@/components/ui/stat-card"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { formatDateTime } from "@/lib/community"
import { punishmentsService } from "@/services/community.service"
import { PunishmentList } from "./PunishmentList"

export function PunishmentsPage() {
  const { data, loading, error, refetch } = useApi(() => punishmentsService.me(), [])
  // Atualiza na hora quando a staff pune/remove e, a cada minuto, para pegar bans feitos direto no jogo.
  useLiveRefresh(refetch, ["punishments-changed"], 60_000)

  const activeBan = data?.summary.activeBan

  return (
    <DashboardLayout title="Minhas Punições" description="Consulte o motivo, o responsável e a data de qualquer punição na sua conta.">
      <div className="text-muted-foreground flex items-center gap-2 text-xs">
        <span className="relative flex size-2">
          <span className="bg-accent absolute inline-flex size-full animate-ping rounded-full opacity-60" />
          <span className="bg-accent relative inline-flex size-2 rounded-full" />
        </span>
        <Radio className="size-3.5" />
        Atualizado em tempo real
      </div>

      {loading && !data && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      )}

      {error && !data && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <>
          {activeBan && (
            <Alert variant="destructive">
              <TriangleAlert />
              <AlertDescription>
                <strong className="block">Sua conta está banida{activeBan.permanent ? " permanentemente" : ""}.</strong>
                {activeBan.reason}
                {!activeBan.permanent && activeBan.expiresAt && <span className="mt-1 block text-xs opacity-80">Libera em {formatDateTime(activeBan.expiresAt)}</span>}
              </AlertDescription>
            </Alert>
          )}

          {!data.fivemConnected && (
            <Alert>
              <TriangleAlert />
              <AlertDescription>O histórico do jogo está indisponível no momento; exibimos apenas os registros da Dashboard.</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={<Gavel className="size-5" />} tone="secondary" label="Total de registros" value={data.summary.total} />
            <StatCard icon={<Gavel className="size-5" />} tone="destructive" label="Banimentos" value={data.summary.bans} />
            <StatCard icon={<TriangleAlert className="size-5" />} tone="primary" label="Advertências" value={data.summary.warns} />
            <StatCard
              icon={<ShieldCheck className="size-5" />}
              tone={activeBan ? "destructive" : "accent"}
              label="Situação da conta"
              value={activeBan ? "Banida" : "Liberada"}
            />
          </div>

          {data.items.length === 0 ? (
            <EmptyState
              icon={<ShieldCheck className="size-8" />}
              title="Nenhuma punição registrada"
              description="Sua conta está limpa. Continue seguindo as regras da cidade!"
            />
          ) : (
            <PunishmentList items={data.items} />
          )}

          <p className="text-muted-foreground flex flex-wrap items-center gap-x-1.5 text-xs">
            <Ticket className="size-3.5" />
            Discorda de uma punição?
            <Link to="/dashboard/tickets" className="text-primary font-medium hover:underline">
              Abra um ticket de Recorrer Punição
            </Link>
            com o código do registro.
          </p>
        </>
      )}
    </DashboardLayout>
  )
}
