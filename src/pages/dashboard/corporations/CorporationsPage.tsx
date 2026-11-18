import { useMemo, useState } from "react"
import { Building2, Pencil, Plus, RefreshCw, Search, Shield, Users } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState, EmptyState } from "@/components/ui/states"
import { useApi } from "@/hooks/useApi"
import { useCorpRealtime } from "@/hooks/useCorpRealtime"
import { useAuth } from "@/contexts/AuthContext"
import { corporationsService } from "@/services/corporations.service"
import { ApiError } from "@/api/client"
import { useRouter } from "@/contexts/RouterContext"
import { CreateCorporationDialog } from "./CreateCorporationDialog"
import { EditCorporationDialog } from "./EditCorporationDialog"
import { corpGradient, resolveCorpColor } from "@/lib/corpTheme"
import { CorpAvatar } from "@/components/corporations/CorpAvatar"
import type { Corporation } from "@/types"

const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`

function CorporationCard({
  corp,
  canEdit,
  onOpen,
  onEdit,
}: {
  corp: Corporation
  canEdit: boolean
  onOpen: () => void
  onEdit: () => void
}) {
  const members = corp.memberCount ?? 0
  const color = resolveCorpColor(corp.color)

  return (
    <Card
      onClick={onOpen}
      className="group hover:border-white/15 cursor-pointer gap-0 overflow-hidden py-0 transition-all duration-200 hover:-translate-y-0.5"
    >
      <div
        className="relative h-20"
        style={corpGradient(color, 25)}
      >
        <div className="bg-grid absolute inset-0 opacity-40" />
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <Badge variant={corp.status === "active" ? "success" : "secondary"}>
            {corp.status === "active" ? "Ativa" : "Inativa"}
          </Badge>
          {canEdit && (
            <Button
              size="icon-sm"
              variant="outline"
              className="bg-background/60 backdrop-blur"
              aria-label={`Editar ${corp.name}`}
              onClick={event => {
                event.stopPropagation()
                onEdit()
              }}
            >
              <Pencil className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5">
        <CorpAvatar name={corp.name} icon={corp.icon} color={color} className="border-card -mt-7 border-4 shadow-lg" />

        <div>
          <h3 className="text-lg leading-tight font-semibold">{corp.name}</h3>
          <p className="text-muted-foreground mt-1 line-clamp-2 min-h-10 text-sm">
            {corp.description || "Sem descrição."}
          </p>
        </div>

        <div className="border-border text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 border-t pt-4 text-xs">
          <Shield className="size-3.5" />
          {plural(corp.patentes.length, "patente cadastrada", "patentes cadastradas")}
          <span aria-hidden="true" className="opacity-50">
            •
          </span>
          <Users className="size-3.5" />
          {plural(members, "pessoa contratada", "pessoas contratadas")}
        </div>
      </div>
    </Card>
  )
}

export function CorporationsPage() {
  const { isAdmin, isStaff, hasCorpPermission } = useAuth()
  const { navigate } = useRouter()
  const { data, loading, error, refetch } = useApi(() => corporationsService.list(), [])
  useCorpRealtime(refetch)
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Corporation | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncMessage, setSyncMessage] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const corporations = useMemo(() => {
    const term = query.trim().toLowerCase()
    const all = data?.corporations ?? []
    return term ? all.filter(corp => corp.name.toLowerCase().includes(term)) : all
  }, [data, query])

  async function handleSync() {
    setSyncing(true)
    setSyncMessage(null)
    try {
      const result = await corporationsService.syncFromForms()
      setSyncMessage(
        result.created.length > 0
          ? `${result.created.length} corporação(ões) importada(s) do sistema de Forms.`
          : "Nenhuma corporação nova para importar — os Forms Militares já estão todos sincronizados.",
      )
      refetch()
    } catch (err) {
      setSyncMessage(err instanceof ApiError ? err.message : "Falha ao sincronizar.")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <DashboardLayout title="Corporações" description="Todas as organizações do servidor, com hierarquia e efetivo em um só lugar.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Buscar corporação..."
            aria-label="Buscar corporação"
            className="border-input placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/15 h-9 w-full rounded-lg border bg-white/[0.03] pr-3 pl-9 text-sm outline-none focus:ring-4"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isStaff && (
            <Button variant="outline" onClick={handleSync} disabled={syncing}>
              <RefreshCw className={`size-4 ${syncing ? "animate-spin" : ""}`} />
              Sincronizar do Forms
            </Button>
          )}
          {isAdmin && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="size-4" />
              Nova Corporação
            </Button>
          )}
        </div>
      </div>

      {syncMessage && (
        <p className="border-border text-muted-foreground rounded-xl border bg-white/[0.03] px-4 py-3 text-sm">
          {syncMessage}
        </p>
      )}

      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && data.corporations.length === 0 && (
        <EmptyState
          icon={<Building2 className="size-6" />}
          title="Nenhuma corporação cadastrada"
          description={
            isAdmin
              ? "Crie a primeira pelo botão acima."
              : isStaff
                ? "Fale com um administrador para criar uma."
                : "Você não está contratado em nenhuma corporação."
          }
        />
      )}

      {data && data.corporations.length > 0 && corporations.length === 0 && (
        <EmptyState icon={<Search className="size-6" />} title="Nenhum resultado" description={`Nada encontrado para "${query}".`} />
      )}

      {corporations.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {corporations.map(corp => (
            <CorporationCard
              key={corp.slug}
              corp={corp}
              canEdit={hasCorpPermission(corp.slug, "edit_corp")}
              onOpen={() => navigate(`/dashboard/corporations/${corp.slug}`)}
              onEdit={() => setEditing(corp)}
            />
          ))}
        </div>
      )}

      {editing && (
        <EditCorporationDialog
          open
          onOpenChange={open => !open && setEditing(null)}
          corporation={editing}
          onSaved={() => {
            setEditing(null)
            refetch()
          }}
        />
      )}

      <CreateCorporationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={() => {
          setCreateOpen(false)
          refetch()
        }}
      />
    </DashboardLayout>
  )
}
