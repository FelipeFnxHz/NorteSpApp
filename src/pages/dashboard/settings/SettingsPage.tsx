import { useState } from "react"
import { Activity, CheckCircle2, Gamepad2, Layers, ServerCog, ShieldCheck, Terminal, XCircle } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppearanceTab } from "./appearance/AppearanceTab"
import { DashboardControlsCard } from "./DashboardControlsCard"
import { ReturnScheduleSection } from "./ReturnScheduleSection"
import { ServerTab } from "./server/ServerTab"
import { SystemHealthCard } from "./SystemHealthCard"
import { useApi } from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardService } from "@/services/dashboard.service"
import { fivemService } from "@/services/fivem.service"
import type { DashboardStatus } from "@/types"

const STATUS_OPTIONS: Array<{ value: DashboardStatus; label: string; tone: "success" | "secondary" | "destructive" }> = [
  { value: "online", label: "Online", tone: "success" },
  { value: "maintenance", label: "Manutenção", tone: "secondary" },
  { value: "offline", label: "Offline", tone: "destructive" },
]

function AlsoManagedViaBotNote() {
  return (
    <p className="text-muted-foreground border-border flex items-start gap-2 rounded-xl border border-dashed p-3.5 text-xs leading-relaxed">
      <Terminal className="mt-0.5 size-3.5 shrink-0" />
      Também pode ser alterado pelo Discord (Admin → Servidor → Integrações e APIs) — os dois lugares editam a mesma
      configuração.
    </p>
  )
}

function SystemRow({ label, online, detail }: { label: string; online: boolean; detail?: string }) {
  return (
    <div className="border-border/60 flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 border-b py-3.5 text-sm last:border-0">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        {detail && <span className="text-muted-foreground text-xs">{detail}</span>}
        {online ? (
          <Badge variant="success">
            <CheckCircle2 className="size-3" />
            Ativo
          </Badge>
        ) : (
          <Badge variant="destructive">
            <XCircle className="size-3" />
            Inativo
          </Badge>
        )}
      </div>
    </div>
  )
}

function StaffSettingsPage() {
  const { isAdmin, isStaff } = useAuth()
  const { data: config, loading: configLoading, refetch: refetchConfig } = useApi(() => dashboardService.config(), [])
  const { data: fivem, loading: fivemLoading } = useApi(() => fivemService.status(), [])

  const [statusSaving, setStatusSaving] = useState<DashboardStatus | null>(null)
  const [pendingStatus, setPendingStatus] = useState<DashboardStatus | null>(null)

  async function changeStatus(status: DashboardStatus) {
    setStatusSaving(status)
    try {
      await dashboardService.setStatus(status)
      refetchConfig()
    } finally {
      setStatusSaving(null)
    }
  }

  function requestStatus(status: DashboardStatus) {
    if (status === config?.status) return
    if (status === "online") {
      void changeStatus(status)
      return
    }
    setPendingStatus(status)
  }

  async function confirmStatus() {
    if (!pendingStatus) return
    await changeStatus(pendingStatus)
    setPendingStatus(null)
  }

  return (
    <DashboardLayout title="Configurações" description="Status dos sistemas — a mesma configuração que o bot usa.">
      <Tabs defaultValue="geral">
        <TabsList>
          <TabsTrigger value="geral">
            <Activity className="size-4" />
            Geral
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="dashboard">
              <ServerCog className="size-4" />
              Dashboard
            </TabsTrigger>
          )}
          <TabsTrigger value="aparencia">
            <Layers className="size-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="servidor">
            <Gamepad2 className="size-4" />
            Servidor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="flex flex-col gap-6">
          <Card className="px-4 sm:px-6">
            <h3 className="mb-1 font-semibold">Status dos sistemas</h3>
            <p className="text-muted-foreground mb-2 text-xs">Visão geral do que está no ar agora.</p>

            {(configLoading || fivemLoading) && <Skeleton className="h-40" />}

            {!configLoading && !fivemLoading && (
              <div className="flex flex-col">
                <SystemRow
                  label="Dashboard"
                  online={config?.status === "online"}
                  detail={STATUS_OPTIONS.find(o => o.value === config?.status)?.label}
                />
                <SystemRow
                  label="Servidor FiveM"
                  online={!!fivem?.online}
                  detail={fivem ? `${fivem.players}/${fivem.maxPlayers} jogadores` : undefined}
                />
                <SystemRow label="API / Bot Discord" online />
              </div>
            )}
          </Card>

          <SystemHealthCard />
        </TabsContent>

        {isAdmin && (
          <TabsContent value="dashboard" className="flex flex-col gap-6">
            <Card className="px-4 sm:px-6">
              <h3 className="mb-1 flex items-center gap-2 font-semibold">
                <ShieldCheck className="size-4" />
                Status da Dashboard
              </h3>
              <p className="text-muted-foreground mb-5 text-xs">
                Controla a tela que membros comuns veem quando a Dashboard está em manutenção ou fora do ar.
              </p>

              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map(option => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={config?.status === option.value ? "default" : "outline"}
                    disabled={statusSaving !== null}
                    onClick={() => requestStatus(option.value)}
                  >
                    {statusSaving === option.value ? "Salvando..." : option.label}
                  </Button>
                ))}
              </div>

              {config && <ReturnScheduleSection config={config} onChanged={refetchConfig} />}

              <div className="mt-6">
                <AlsoManagedViaBotNote />
              </div>
            </Card>

            <DashboardControlsCard config={config ?? null} onChanged={refetchConfig} />
          </TabsContent>
        )}

        <TabsContent value="aparencia">
          <AppearanceTab canManageGlobal={isStaff} />
        </TabsContent>

        <TabsContent value="servidor">
          <ServerTab />
        </TabsContent>
      </Tabs>

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={next => !next && setPendingStatus(null)}
        variant="destructive"
        title={pendingStatus === "offline" ? "Colocar a Dashboard offline?" : "Colocar a Dashboard em manutenção?"}
        description={
          pendingStatus === "offline"
            ? "Enquanto estiver offline, só a staff consegue acessar a Dashboard. Os demais usuários verão a página de indisponibilidade."
            : "Durante a manutenção, só a staff consegue acessar a Dashboard. Os demais usuários verão a página de manutenção."
        }
        confirmLabel={pendingStatus === "offline" ? "Colocar offline" : "Ativar manutenção"}
        loadingLabel="Aplicando..."
        onConfirm={confirmStatus}
      />
    </DashboardLayout>
  )
}

/**
 * Membros comuns só personalizam a própria experiência; Staff/Moderadores também veem
 * status, servidor e a identidade global. O backend reforça isso em cada rota.
 */
export function SettingsPage() {
  const { isStaff } = useAuth()

  if (isStaff) return <StaffSettingsPage />

  return (
    <DashboardLayout title="Configurações" description="Personalize a sua experiência na Dashboard.">
      <AppearanceTab canManageGlobal={false} />
    </DashboardLayout>
  )
}
