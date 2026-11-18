import { useState } from "react"
import { ApiError } from "@/api/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/states"
import { useApi } from "@/hooks/useApi"
import { dashboardService } from "@/services/dashboard.service"
import type { ServerRoleItem } from "@/types"
import { ChannelsCard } from "./ChannelsCard"
import { GuildOverviewCard } from "./GuildOverviewCard"
import { RolesCard } from "./RolesCard"
import { SyncCard } from "./SyncCard"

interface PendingRole {
  role: ServerRoleItem
  roleId: string | null
  roleName: string
}

/** Configurações → Servidor: visão geral, sincronização, canais de log/sistema e cargos autorizados. */
export function ServerTab() {
  const { data, loading, error, refetch } = useApi(() => dashboardService.server(), [])
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null)
  const [pendingRole, setPendingRole] = useState<PendingRole | null>(null)

  if (loading && !data) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-56 w-full rounded-2xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    )
  }
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />
  if (!data) return null

  async function run(key: string, action: () => Promise<unknown>, okText: string) {
    setSavingKey(key)
    setFeedback(null)
    try {
      await action()
      setFeedback({ ok: true, text: okText })
      refetch()
    } catch (err) {
      setFeedback({ ok: false, text: err instanceof ApiError ? err.message : "Não foi possível salvar." })
    } finally {
      setSavingKey(null)
    }
  }

  function changeChannel(key: string, channelId: string | null) {
    void run(key, () => dashboardService.setServerChannel(key, channelId), "Canal atualizado.")
  }

  function requestRole(role: ServerRoleItem, roleId: string | null) {
    const roleName = roleId ? (data?.options?.roles.find(option => option.id === roleId)?.name ?? "") : ""
    setPendingRole({ role, roleId, roleName })
  }

  async function confirmRole() {
    if (!pendingRole) return
    await run(pendingRole.role.key, () => dashboardService.setServerRole(pendingRole.role.key, pendingRole.roleId), "Cargo atualizado.")
    setPendingRole(null)
  }

  return (
    <div className="flex flex-col gap-6">
      {feedback && (
        <Alert variant={feedback.ok ? "success" : "destructive"}>
          <AlertDescription className={feedback.ok ? "text-accent/90" : undefined}>{feedback.text}</AlertDescription>
        </Alert>
      )}

      <GuildOverviewCard data={data} />

      {data.canEdit && <SyncCard cooldownSeconds={data.syncCooldownSeconds} cachedMembers={data.guild.cachedMembers} onDone={refetch} />}

      {data.channelGroups.map(group => (
        <ChannelsCard key={group.id} group={group} options={data.options} savingKey={savingKey} onChange={changeChannel} />
      ))}

      <RolesCard roles={data.roles} options={data.options} savingKey={savingKey} onChange={requestRole} />

      {!data.canEdit && (
        <p className="text-muted-foreground text-center text-xs">Somente administradores podem alterar canais e cargos. Cada mudança fica registrada nos Logs da Staff.</p>
      )}

      <ConfirmDialog
        open={pendingRole !== null}
        onOpenChange={next => !next && setPendingRole(null)}
        variant="destructive"
        title={pendingRole?.roleId ? `Usar @${pendingRole.roleName} como ${pendingRole.role.label}?` : `Remover o cargo ${pendingRole?.role.label}?`}
        description="Este cargo define quem acessa a Dashboard (e com qual nível). A mudança vale na hora para todos os membros e fica registrada nos logs."
        confirmLabel="Confirmar alteração"
        loadingLabel="Salvando..."
        onConfirm={confirmRole}
      />
    </div>
  )
}
