import { useMemo, useState } from "react"
import { Ellipsis, UserCog, UserMinus, Users } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { StaffMember, StaffMembersResponse } from "@/services/staff.service"

const STATUS_DOT: Record<string, string> = { online: "bg-accent", idle: "bg-primary", dnd: "bg-destructive", offline: "bg-muted-foreground/60" }
const STATUS_LABEL: Record<string, string> = { online: "Online", idle: "Ausente", dnd: "Não perturbe", offline: "Offline" }

interface Props {
  data: StaffMembersResponse | null
  loading: boolean
  error: string | null
  onRetry: () => void
  onEditRole: (member: StaffMember) => void
  onRemove: (member: StaffMember) => void
}

export function StaffMembersCard({ data, loading, error, onRetry, onEditRole, onRemove }: Props) {
  const [view, setView] = useState<"all" | "online">("all")
  const perms = data?.permissions

  const groups = useMemo(() => {
    const visible = (data?.members ?? []).filter(member => view === "all" || member.status !== "offline")
    const map = new Map<number, { name: string; color: string | null; members: StaffMember[] }>()
    for (const member of visible) {
      const group = map.get(member.role.rank) ?? { name: member.role.name, color: member.role.color, members: [] }
      group.members.push(member)
      map.set(member.role.rank, group)
    }
    return [...map.entries()].sort(([a], [b]) => a - b).map(([rank, group]) => ({ rank, ...group }))
  }, [data, view])

  return (
    <Card className="gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold"><Users className="text-primary size-4" /> Equipe</h3>
          <p className="text-muted-foreground text-xs">Sincronizada com os cargos do Discord — muda sozinha quando algo é alterado.</p>
        </div>
        <Tabs value={view} onValueChange={v => setView(v as "all" | "online")}>
          <TabsList><TabsTrigger value="all">Todos</TabsTrigger><TabsTrigger value="online">Online</TabsTrigger></TabsList>
        </Tabs>
      </div>

      <div className="px-4 sm:px-6">
        {loading && !data && <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[72px] rounded-xl" />)}</div>}
        {error && !data && <ErrorState message={error} onRetry={onRetry} />}
        {data && groups.length === 0 && <EmptyState icon={<Users className="size-6" />} title={view === "online" ? "Nenhum staff online no momento" : "Nenhum membro com cargo de staff"} />}

        <div className="flex flex-col gap-6">
          {groups.map(group => (
            <section key={group.rank} aria-label={group.name} className="flex flex-col gap-2.5">
              <h4 className="flex items-center gap-2 text-[11px] font-semibold tracking-wide uppercase">
                <span className="size-2 shrink-0 rounded-full bg-white/30" style={group.color ? { backgroundColor: group.color } : undefined} />
                <span className="text-muted-foreground truncate">{group.name}</span>
                <span className="bg-white/[0.06] text-muted-foreground rounded-full px-1.5 py-px font-mono text-[10px] tabular-nums">{group.members.length}</span>
                <span className="bg-border h-px flex-1" />
              </h4>

              <div className="grid grid-cols-1 gap-3 min-[560px]:grid-cols-2 2xl:grid-cols-3">
                {group.members.map(member => {
                  const manageable = !!perms?.canManage && perms.actorRank !== null && member.role.rank > perms.actorRank
                  return (
                    <div key={member.id} className="border-border hover:border-white/15 flex items-center gap-3 rounded-xl border bg-white/[0.02] p-3 transition-colors">
                      <div className="relative shrink-0">
                        <img src={member.avatar} alt="" loading="lazy" className={cn("size-10 rounded-full object-cover ring-1 ring-white/10", member.status === "offline" && "opacity-60")} />
                        <span className={cn("border-card absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2", STATUS_DOT[member.status])} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <strong className="block truncate text-[13px] font-semibold">{member.displayName}</strong>
                        <span className="text-muted-foreground block truncate text-[11px]">{STATUS_LABEL[member.status]}{member.extraRoles.length > 0 && ` • +${member.extraRoles.join(", ")}`}</span>
                      </div>
                      {manageable && (
                        <DropdownMenu>
                          <DropdownMenuTrigger aria-label={`Ações para ${member.displayName}`} className={buttonVariants({ variant: "ghost", size: "icon" })}><Ellipsis className="size-4" /></DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="!w-48">
                            <DropdownMenuItem onClick={() => onEditRole(member)}><UserCog /> Editar cargo</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => onRemove(member)}><UserMinus /> Remover da equipe</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Card>
  )
}
