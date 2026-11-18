import { useMemo, useState } from "react"
import { Pencil, Plus, Search, Gamepad2, Shield, Swords, Users } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState, EmptyState } from "@/components/ui/states"
import { CorpAvatar } from "@/components/corporations/CorpAvatar"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "@/contexts/RouterContext"
import { corpGradient, resolveCorpColor } from "@/lib/corpTheme"
import { factionsService } from "@/services/factions.service"
import type { Faction } from "@/types/factions"
import { FactionDialog } from "./FactionDialog"

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

function FactionCard({ faction, canEdit, onOpen, onEdit }: { faction: Faction; canEdit: boolean; onOpen: () => void; onEdit: () => void }) {
  const color = resolveCorpColor(faction.color)
  return (
    <Card onClick={onOpen} className="group hover:border-white/15 cursor-pointer gap-0 overflow-hidden py-0 transition-all duration-200 hover:-translate-y-0.5">
      <div className="relative h-20" style={corpGradient(color, 25)}>
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {faction.source === "game" && <Badge variant="secondary"><Gamepad2 /> In-game</Badge>}
          <Badge variant={faction.status === "active" ? "success" : "secondary"}>{faction.status === "active" ? "Ativa" : "Inativa"}</Badge>
          {canEdit && (
            <Button
              size="icon-sm" variant="outline" className="bg-background/60 backdrop-blur" aria-label={`Editar ${faction.name}`}
              onClick={event => { event.stopPropagation(); onEdit() }}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5">
        <CorpAvatar name={faction.name} icon={faction.icon} color={color} className="border-card -mt-7 border-4 shadow-lg" />
        <div>
          <h3 className="text-lg leading-tight font-semibold">{faction.name}</h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 min-h-10 text-sm">{faction.description || "Sem descrição."}</p>
        </div>
        <div className="border-border text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-4 text-xs">
          <Shield className="size-3.5" />
          {plural(faction.patentes.length, "patente", "patentes")}
          <span aria-hidden="true" className="opacity-50">•</span>
          <Users className="size-3.5" />
          {plural(faction.memberCount ?? 0, "membro", "membros")}
        </div>
      </div>
    </Card>
  )
}

export function FactionsPage() {
  const { isAdmin } = useAuth()
  const { navigate } = useRouter()
  const { data, loading, error, refetch } = useApi(() => factionsService.list(), [])
  useLiveRefresh(refetch, ["factions-changed"], 120_000)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Faction | null>(null)
  const [query, setQuery] = useState("")

  const factions = useMemo(() => {
    const term = query.trim().toLowerCase()
    const all = data?.factions ?? []
    return term ? all.filter(f => f.name.toLowerCase().includes(term)) : all
  }, [data, query])

  return (
    <DashboardLayout title="Facções" description="Facções criadas no servidor, com hierarquia, membros e cofre. Novas facções do jogo aparecem aqui automaticamente.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar facção..." aria-label="Buscar facção"
            className="border-input placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/15 h-9 w-full rounded-lg border bg-white/[0.03] pr-3 pl-9 text-sm outline-none focus:ring-4"
          />
        </div>
        {isAdmin && <Button onClick={() => setCreateOpen(true)}><Plus className="size-4" /> Nova Facção</Button>}
      </div>

      {loading && !data && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 w-full rounded-2xl" />)}
        </div>
      )}
      {error && !data && <ErrorState message={error} onRetry={refetch} />}

      {data && data.factions.length === 0 && (
        <EmptyState
          icon={<Swords className="size-6" />} title="Nenhuma facção cadastrada"
          description={isAdmin ? "Elas aparecem sozinhas quando um jogador cria uma facção no servidor, ou crie uma pelo botão acima." : "As facções criadas no servidor aparecem aqui automaticamente."}
        />
      )}
      {data && data.factions.length > 0 && factions.length === 0 && <EmptyState icon={<Search className="size-6" />} title="Nenhum resultado" description={`Nada encontrado para "${query}".`} />}

      {factions.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {factions.map(faction => (
            <FactionCard
              key={faction.slug} faction={faction} canEdit={isAdmin}
              onOpen={() => navigate(`/dashboard/faccoes/${faction.slug}`)} onEdit={() => setEditing(faction)}
            />
          ))}
        </div>
      )}

      <FactionDialog open={createOpen} onOpenChange={setCreateOpen} onSaved={() => { setCreateOpen(false); refetch() }} />
      {editing && <FactionDialog open faction={editing} onOpenChange={open => !open && setEditing(null)} onSaved={() => { setEditing(null); refetch() }} />}
    </DashboardLayout>
  )
}
