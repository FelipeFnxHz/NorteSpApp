import { useState } from "react"
import { Crown, ShieldHalf, UserPlus, Users } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { StatCard } from "@/components/ui/stat-card"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { staffManageService, type StaffMember } from "@/services/staff.service"
import { AddStaffDialog, ChangeRoleDialog } from "./StaffManageDialogs"
import { StaffMembersCard } from "./StaffMembersCard"

export function StaffPage() {
  const { data, loading, error, refetch } = useApi(() => staffManageService.members(), [])
  // Mudanças feitas no Discord ou por outro admin chegam por SSE; o intervalo é só rede de segurança.
  useLiveRefresh(refetch, ["staff-changed"], 60_000)

  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [removing, setRemoving] = useState<StaffMember | null>(null)

  const roles = data?.roles ?? []
  const perms = data?.permissions
  const online = data?.members.filter(member => member.status !== "offline").length

  return (
    <DashboardLayout
      title="Staff"
      description={perms?.canManage ? "Gerencie a equipe direto daqui: as mudanças são aplicadas nos cargos do Discord." : "Hierarquia de cargos e quem está online agora."}
      actions={perms?.canManage && <Button onClick={() => setAdding(true)}><UserPlus className="size-4" /> Adicionar staff</Button>}
    >
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard icon={<Users className="size-5" />} tone="primary" label="Staff online" value={online ?? "—"} />
        <StatCard icon={<Users className="size-5" />} tone="accent" label="Membros na equipe" value={data?.members.length ?? "—"} />
        <StatCard icon={<ShieldHalf className="size-5" />} tone="secondary" label="Cargos na hierarquia" value={roles.length || "—"} />
        <StatCard icon={<Crown className="size-5" />} tone="secondary" label="Cargo mais alto" value={roles[0]?.name ?? "—"} />
      </div>

      {perms && !perms.canManage && (
        <Alert><AlertDescription>Somente a administração superior pode adicionar, promover ou remover membros da equipe.</AlertDescription></Alert>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[320px_1fr]">
        <Card className="gap-4">
          <div className="px-4 sm:px-6">
            <h3 className="text-lg font-semibold">Hierarquia</h3>
            <p className="text-muted-foreground text-xs">Do cargo mais alto para o mais baixo.</p>
          </div>
          <div className="scroll-dark mx-4 flex max-h-[min(60vh,26rem)] flex-col gap-2 pr-2 sm:mx-6 [&>*]:shrink-0">
            {loading && !data && Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-11 w-full rounded-xl" />)}
            {data && roles.length === 0 && <p className="text-muted-foreground text-sm">Nenhum cargo de staff configurado ainda.</p>}
            {roles.map((role, index) => (
              <div key={role.roleId} className="border-border relative flex items-center gap-3 overflow-hidden rounded-xl border bg-white/[0.02] px-3.5 py-2.5">
                {index === 0 && <div className="from-primary/10 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent" />}
                <span className={`relative grid size-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold ${index === 0 ? "bg-primary/15 text-primary" : "text-muted-foreground bg-white/[0.05]"}`}>{index + 1}</span>
                <span className="relative size-2 shrink-0 rounded-full bg-white/30" style={role.color ? { backgroundColor: role.color } : undefined} />
                <span className="relative flex-1 truncate text-sm font-medium">{role.name}</span>
                <span className="text-muted-foreground relative font-mono text-[11px] tabular-nums">{role.count}</span>
              </div>
            ))}
          </div>
        </Card>

        <StaffMembersCard data={data} loading={loading} error={error} onRetry={refetch} onEditRole={setEditing} onRemove={setRemoving} />
      </div>

      {perms?.canManage && (
        <>
          <AddStaffDialog open={adding} onOpenChange={setAdding} roles={roles} assignable={perms.assignable} onDone={refetch} />
          <ChangeRoleDialog member={editing} onClose={() => setEditing(null)} roles={roles} assignable={perms.assignable} onDone={refetch} />
          <ConfirmDialog
            open={!!removing} onOpenChange={open => !open && setRemoving(null)} variant="destructive" confirmLabel="Remover da equipe"
            title={`Remover ${removing?.displayName ?? ""} da equipe?`}
            description="Todos os cargos de staff deste membro são retirados no Discord e a ação fica registrada nos logs administrativos."
            onConfirm={async () => { await staffManageService.remove(removing!.id); setRemoving(null); refetch() }}
          />
        </>
      )}
    </DashboardLayout>
  )
}
