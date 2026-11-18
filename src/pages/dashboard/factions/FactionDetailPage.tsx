import { useState } from "react"
import { Ban, Clock, Crown, Gamepad2, Landmark, Pencil, Settings2, Shield, Trash2, UserCheck, UserPlus, Users } from "lucide-react"
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
import { CorpAvatar } from "@/components/corporations/CorpAvatar"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "@/contexts/RouterContext"
import { corpGradient, resolveCorpColor } from "@/lib/corpTheme"
import { factionsService } from "@/services/factions.service"
import type { FactionMember } from "@/types/factions"
import { FactionDialog } from "./FactionDialog"
import { FactionMemberDialog } from "./FactionMemberDialog"
import { FactionPatentesDialog } from "./FactionPatentesDialog"
import { HireFactionMemberDialog } from "./HireFactionMemberDialog"

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

const STATUS_LABEL: Record<string, { label: string; variant: "success" | "secondary" | "destructive" }> = {
  active: { label: "Ativo", variant: "success" },
  away: { label: "Afastado", variant: "secondary" },
  suspended: { label: "Suspenso", variant: "destructive" },
}

export function FactionDetailPage({ slug }: { slug: string }) {
  const { isAdmin } = useAuth()
  const { navigate } = useRouter()
  const [hireOpen, setHireOpen] = useState(false)
  const [patentesOpen, setPatentesOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [activeMember, setActiveMember] = useState<FactionMember | null>(null)

  const faction$ = useApi(() => factionsService.get(slug), [slug])
  const stats$ = useApi(() => factionsService.stats(slug), [slug])
  const members$ = useApi(() => factionsService.members(slug), [slug])
  const refresh = () => { faction$.refetch(); stats$.refetch(); members$.refetch() }
  useLiveRefresh(refresh, ["factions-changed"], 120_000)

  const faction = faction$.data?.faction
  const members = members$.data?.members ?? []
  const themeColor = resolveCorpColor(faction?.color)
  const patentesByRank = faction ? faction.patentes.slice().sort((a, b) => b.order - a.order) : []
  const membersIn = (patenteId: string) => members.filter(m => m.patenteId === patenteId).length

  async function confirmDelete() {
    if (!faction) return
    await factionsService.remove(faction.slug)
    navigate("/dashboard/faccoes")
  }

  return (
    <DashboardLayout title={faction?.name ?? "Facção"} description={faction?.description || "Carregando..."}>
      <Breadcrumb items={[{ label: "Facções", to: "/dashboard/faccoes" }, { label: faction?.name ?? slug }]} />

      {faction$.loading && !faction && <Skeleton className="h-32 w-full rounded-2xl" />}
      {faction$.error && !faction && <ErrorState message={faction$.error} onRetry={faction$.refetch} />}

      {faction && (
        <Card className="relative gap-0 overflow-hidden py-0" style={corpGradient(themeColor, 26, "var(--card)", 65)}>
          <div className="bg-grid absolute inset-0 opacity-30" />
          <div className="relative flex flex-wrap items-center justify-between gap-5 p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <CorpAvatar name={faction.name} icon={faction.icon} color={themeColor} size="xl" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold">{faction.name}</h2>
                  <Badge variant={faction.status === "active" ? "success" : "secondary"}>{faction.status === "active" ? "Ativa" : "Inativa"}</Badge>
                  {faction.source === "game" && <Badge variant="secondary"><Gamepad2 /> Criada no jogo</Badge>}
                </div>
                <p className="text-muted-foreground mt-1 max-w-xl text-sm">{faction.description || "Sem descrição."}</p>
                {(faction.leaderId || faction.leaderName) && (
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs"><Crown className="size-3.5" /> Líder: {faction.leaderName || faction.leaderId}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/dashboard/finance")}><Landmark className="size-4" /> Financeiro</Button>
              {isAdmin && (
                <>
                  <Button variant="outline" onClick={() => setEditOpen(true)}><Pencil className="size-4" /> Editar</Button>
                  <Button variant="outline" onClick={() => setPatentesOpen(true)}><Settings2 className="size-4" /> Patentes</Button>
                  <Button variant="outline" onClick={async () => { await factionsService.setStatus(faction.slug, faction.status === "active" ? "inactive" : "active"); refresh() }}>
                    {faction.status === "active" ? "Desativar" : "Ativar"}
                  </Button>
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="size-4" /> Excluir</Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      {stats$.data && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<Users className="size-5" />} tone="primary" label="Efetivo total" value={stats$.data.total} />
          <StatCard icon={<UserCheck className="size-5" />} tone="accent" label="Ativos" value={stats$.data.active} />
          <StatCard icon={<Clock className="size-5" />} tone="secondary" label="Afastados" value={stats$.data.away} />
          <StatCard icon={<Ban className="size-5" />} tone="destructive" label="Suspensos" value={stats$.data.suspended} />
        </div>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1fr_320px]">
        <Card className="gap-5">
          <div className="flex items-center justify-between gap-3 px-4 sm:px-6">
            <div>
              <h3 className="text-lg font-semibold">Membros</h3>
              <p className="text-muted-foreground text-xs">{plural(members.length, "pessoa na facção", "pessoas na facção")}</p>
            </div>
            {isAdmin && faction && <Button onClick={() => setHireOpen(true)}><UserPlus className="size-4" /> Adicionar</Button>}
          </div>

          <div className="px-4 sm:px-6">
            {members$.loading && !members$.data && <Skeleton className="h-48 w-full" />}
            {members$.error && !members$.data && <ErrorState message={members$.error} onRetry={members$.refetch} />}
            {members$.data && members.length === 0 && <EmptyState icon={<Shield className="size-6" />} title="Nenhum membro cadastrado ainda" />}

            {members.length > 0 && (
              <div className="scroll-dark max-h-[min(65vh,28rem)] [&_[data-slot=table-container]]:overflow-visible [&_thead_th]:bg-card [&_thead_th]:sticky [&_thead_th]:top-0 [&_thead_th]:z-10">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Membro</TableHead>
                      <TableHead>Patente</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Entrou em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map(member => {
                      const status = STATUS_LABEL[member.status] ?? STATUS_LABEL.active
                      const name = member.discordName ?? member.userId
                      return (
                        <TableRow key={member.userId} className={isAdmin ? "cursor-pointer" : undefined} onClick={isAdmin ? () => setActiveMember(member) : undefined}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="size-9 ring-1 ring-white/10">
                                {member.discordAvatar && <AvatarImage src={member.discordAvatar} alt="" />}
                                <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div className="leading-tight">
                                <span className="block text-sm font-medium">{name}</span>
                                {member.rpName && <span className="text-muted-foreground block text-xs">{member.rpName}</span>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.patenteName ? <Badge variant="outline"><Shield />{member.patenteName}</Badge> : <span className="text-muted-foreground">—</span>}
                          </TableCell>
                          <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                          <TableCell className="text-muted-foreground text-sm">{new Date(member.hiredAt).toLocaleDateString("pt-BR")}</TableCell>
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
            {patentesByRank.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma patente cadastrada.</p>}
            {patentesByRank.map((patente, index) => (
              <div key={patente._id} className="border-border flex items-center gap-3 rounded-xl border bg-white/[0.02] px-3 py-2.5">
                <span className="text-muted-foreground w-5 text-center text-xs font-semibold tabular-nums">{index + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{patente.name}</p>
                  <p className="text-muted-foreground text-[11px]">{plural(membersIn(patente._id), "membro", "membros")}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {faction && (
        <>
          <HireFactionMemberDialog open={hireOpen} onOpenChange={setHireOpen} faction={faction} onDone={() => { setHireOpen(false); refresh() }} />
          {activeMember && (
            <FactionMemberDialog open faction={faction} member={activeMember} onOpenChange={open => !open && setActiveMember(null)} onDone={() => { setActiveMember(null); refresh() }} />
          )}
          <FactionPatentesDialog open={patentesOpen} onOpenChange={setPatentesOpen} faction={faction} onChanged={refresh} />
          <FactionDialog open={editOpen} onOpenChange={setEditOpen} faction={faction} onSaved={() => { setEditOpen(false); refresh() }} />
          <ConfirmDialog
            open={deleteOpen} onOpenChange={setDeleteOpen} variant="destructive" title={`Excluir ${faction.name}?`}
            description="A facção, os membros, o histórico e o cofre (com todos os movimentos) serão apagados. Essa ação não pode ser desfeita."
            confirmLabel="Excluir facção" loadingLabel="Excluindo..." onConfirm={confirmDelete}
          />
        </>
      )}
    </DashboardLayout>
  )
}
