import { useEffect, useState } from "react"
import { Ban, Clock, KeyRound, Pencil, Settings2, Shield, Trash2, UserCheck, UserPlus, Users } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ErrorState, EmptyState, Breadcrumb } from "@/components/ui/states"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { useApi } from "@/hooks/useApi"
import { useCorpRealtime } from "@/hooks/useCorpRealtime"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "@/contexts/RouterContext"
import { corporationsService } from "@/services/corporations.service"
import { corpGradient, resolveCorpColor } from "@/lib/corpTheme"
import { CorpAvatar } from "@/components/corporations/CorpAvatar"
import type { CorporationMember } from "@/types"
import { HireMemberDialog } from "./HireMemberDialog"
import { MemberProfileDialog } from "./MemberProfileDialog"
import { ManagePatentesDialog } from "./ManagePatentesDialog"
import { EditCorporationDialog } from "./EditCorporationDialog"
import { LinkCodeDialog } from "./LinkCodeDialog"

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "secondary" | "destructive" }> = {
  active: { label: "Ativo", variant: "success" },
  away: { label: "Afastado", variant: "secondary" },
  suspended: { label: "Suspenso", variant: "destructive" },
  terminated: { label: "Desligado", variant: "destructive" },
}

export function CorporationDetailPage({ slug }: { slug: string }) {
  const { isAdmin, hasCorpPermission, isCorpMember, hasAnyPermissionIn, corpAccessLoading, refreshCorpAccess } = useAuth()
  const canEditCorp = hasCorpPermission(slug, "edit_corp")
  const canManagePatentes = hasCorpPermission(slug, "manage_patentes")
  const canHire = hasCorpPermission(slug, "hire")
  const canOpenProfiles = hasAnyPermissionIn(slug)
  const allowed = isCorpMember(slug)
  const { navigate } = useRouter()
  const [hireOpen, setHireOpen] = useState(false)
  const [patentesOpen, setPatentesOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [linkOpen, setLinkOpen] = useState(false)
  const [activeMember, setActiveMember] = useState<CorporationMember | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  useEffect(() => {
    if (!corpAccessLoading && !allowed) navigate("/dashboard/corporations", { replace: true })
  }, [corpAccessLoading, allowed, navigate])

  const { data: corpData, loading: corpLoading, error: corpError, refetch: refetchCorp } = useApi(
    () => corporationsService.get(slug),
    [slug],
  )
  const { data: statsData, refetch: refetchStats } = useApi(() => corporationsService.stats(slug), [slug])
  const { data: membersData, loading: membersLoading, error: membersError, refetch: refetchMembers } = useApi(
    () => corporationsService.members(slug),
    [slug],
  )

  useCorpRealtime(refetchMembers, refetchStats, refetchCorp)

  function refreshAll() {
    refreshCorpAccess()
  }

  const corp = corpData?.corporation

  async function confirmDelete() {
    if (!corp) return
    await corporationsService.remove(corp.slug)
    navigate("/dashboard/corporations")
  }

  const themeColor = resolveCorpColor(corp?.color)
  const members = membersData?.members ?? []
  const patentesByRank = corp ? corp.patentes.slice().sort((x, y) => y.order - x.order) : []
  const membersIn = (patenteId: string) => members.filter(member => member.patenteId === patenteId).length

  return (
    <DashboardLayout title={corp?.name ?? "Corporação"} description={corp?.description || "Carregando..."}>
      <Breadcrumb items={[{ label: "Corporações", to: "/dashboard/corporations" }, { label: corp?.name ?? slug }]} />

      {corpLoading && <Skeleton className="h-32 w-full rounded-2xl" />}
      {corpError && <ErrorState message={corpError} onRetry={refetchCorp} />}

      {corp && (
        <Card
          className="relative gap-0 overflow-hidden py-0"
          style={corpGradient(themeColor, 26, "var(--card)", 65)}
        >
          <div className="bg-grid absolute inset-0 opacity-30" />
          <div className="relative flex flex-wrap items-center justify-between gap-5 p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <CorpAvatar name={corp.name} icon={corp.icon} color={themeColor} size="xl" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold">{corp.name}</h2>
                  <Badge variant={corp.status === "active" ? "success" : "secondary"}>
                    {corp.status === "active" ? "Ativa" : "Inativa"}
                  </Badge>
                </div>
                <p className="text-muted-foreground mt-1 max-w-xl text-sm">{corp.description || "Sem descrição."}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canEditCorp && (
                <Button variant="outline" onClick={() => setEditOpen(true)}>
                  <Pencil className="size-4" />
                  Editar
                </Button>
              )}
              {canEditCorp && (
                <Button variant="outline" onClick={() => setLinkOpen(true)}>
                  <KeyRound className="size-4" />
                  Vinculação
                </Button>
              )}
              {canManagePatentes && (
                <Button variant="outline" onClick={() => setPatentesOpen(true)}>
                  <Settings2 className="size-4" />
                  Patentes
                </Button>
              )}
              {isAdmin && (
                <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                  <Trash2 className="size-4" />
                  Excluir
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {statsData && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<Users className="size-5" />} tone="primary" label="Efetivo total" value={statsData.total} />
          <StatCard icon={<UserCheck className="size-5" />} tone="accent" label="Ativos" value={statsData.active} />
          <StatCard icon={<Clock className="size-5" />} tone="secondary" label="Afastados" value={statsData.away} />
          <StatCard icon={<Ban className="size-5" />} tone="destructive" label="Suspensos" value={statsData.suspended} />
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="gap-5">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold">Membros</h3>
              <p className="text-muted-foreground text-xs">
                {plural(members.length, "pessoa contratada", "pessoas contratadas")}
              </p>
            </div>
            {canHire && corp && (
              <Button onClick={() => setHireOpen(true)}>
                <UserPlus className="size-4" />
                Contratar
              </Button>
            )}
          </div>

          <div className="px-4 sm:px-6">
            {membersLoading && <Skeleton className="h-48 w-full" />}
            {membersError && <ErrorState message={membersError} onRetry={refetchMembers} />}

            {membersData && members.length === 0 && (
              <EmptyState icon={<Shield className="size-6" />} title="Nenhum membro contratado ainda" />
            )}

            {members.length > 0 && (
              <div className="scroll-dark max-h-[min(65vh,28rem)] [&_[data-slot=table-container]]:overflow-visible [&_thead_th]:bg-card [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Patente</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contratado em</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(member => {
                    const status = STATUS_LABEL[member.status] ?? STATUS_LABEL.active
                    const name = member.discordName ?? member.userId
                    return (
                      <TableRow
                        key={member.userId}
                        className={canOpenProfiles ? "cursor-pointer" : undefined}
                        onClick={canOpenProfiles ? () => setActiveMember(member) : undefined}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="size-9 ring-1 ring-white/10">
                              {member.discordAvatar && <AvatarImage src={member.discordAvatar} alt="" />}
                              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="leading-tight">
                              <span className="block text-sm font-medium">{name}</span>
                              {member.rpName && (
                                <span className="text-muted-foreground block text-xs">{member.rpName}</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.patenteName ? (
                            <Badge variant="outline">
                              <Shield />
                              {member.patenteName}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {new Date(member.hiredAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </div>
        </Card>

        <Card className="gap-4">
          <div className="px-4 sm:px-6">
            <h3 className="text-lg font-semibold">Hierarquia</h3>
            <p className="text-muted-foreground text-xs">Da patente mais alta para a mais baixa.</p>
          </div>
          <div className="scroll-dark mx-4 flex max-h-[min(65vh,28rem)] flex-col gap-2 pr-2 sm:mx-6 [&>*]:shrink-0">
            {patentesByRank.length === 0 && (
              <p className="text-muted-foreground text-sm">Nenhuma patente cadastrada.</p>
            )}
            {patentesByRank.map((patente, index) => (
              <div
                key={patente._id}
                className="border-border flex items-center gap-3 rounded-xl border bg-white/[0.02] px-3 py-2.5"
              >
                <span className="text-muted-foreground w-5 text-center text-xs font-semibold tabular-nums">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{patente.name}</p>
                  <p className="text-muted-foreground text-[11px]">
                    {plural(membersIn(patente._id), "membro", "membros")}
                    {patente.permissions && patente.permissions.length > 0 && (
                      <> · {plural(patente.permissions.length, "permissão", "permissões")}</>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {corp && (
        <HireMemberDialog
          open={hireOpen}
          onOpenChange={setHireOpen}
          corporation={corp}
          onHired={() => {
            setHireOpen(false)
            refreshAll()
          }}
        />
      )}

      {corp && activeMember && (
        <MemberProfileDialog
          open={!!activeMember}
          onOpenChange={open => !open && setActiveMember(null)}
          corporation={corp}
          userId={activeMember.userId}
          onChanged={refreshAll}
        />
      )}
      {corp && (
        <ConfirmDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          variant="destructive"
          title={`Excluir ${corp.name}?`}
          description="A corporação será removida do Dashboard. O histórico dos membros não é apagado. Essa ação não pode ser desfeita."
          confirmLabel="Excluir corporação"
          loadingLabel="Excluindo..."
          onConfirm={confirmDelete}
        />
      )}
      {corp && <LinkCodeDialog open={linkOpen} onOpenChange={setLinkOpen} slug={slug} corpName={corp.name} />}
      {corp && (
        <EditCorporationDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          corporation={corp}
          onSaved={() => {
            setEditOpen(false)
            refreshAll()
          }}
        />
      )}
      {corp && (
        <ManagePatentesDialog
          open={patentesOpen}
          onOpenChange={setPatentesOpen}
          corporation={corp}
          onChanged={refreshAll}
        />
      )}
    </DashboardLayout>
  )
}
