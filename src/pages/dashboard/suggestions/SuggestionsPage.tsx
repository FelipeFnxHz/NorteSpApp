import { useEffect, useMemo, useState } from "react"
import { ArrowBigDown, ArrowBigUp, Kanban, Lightbulb, List, Plus, Trash2 } from "lucide-react"
import { ApiError } from "@/api/client"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SelectMenu } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { LOG_TONE } from "@/lib/logTypes"
import { SUGGESTION_CATEGORY, SUGGESTION_STATUS, SUGGESTION_STATUS_ORDER, timeAgo } from "@/lib/modules"
import { cn } from "@/lib/utils"
import { suggestionsService } from "@/services/modules.service"
import type { Suggestion, SuggestionCategory, SuggestionStatus } from "@/types/modules"

const CATEGORY_OPTIONS = Object.entries(SUGGESTION_CATEGORY).map(([value, label]) => ({ value, label }))
const STATUS_OPTIONS = SUGGESTION_STATUS_ORDER.map(value => ({ value, label: SUGGESTION_STATUS[value].label }))

function StatusChip({ status }: { status: SuggestionStatus }) {
  const meta = SUGGESTION_STATUS[status]
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", LOG_TONE[meta.tone].badge)}><span className={cn("size-1.5 rounded-full", LOG_TONE[meta.tone].dot)} />{meta.label}</span>
}

function NewSuggestionDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (open: boolean) => void; onCreated: () => void }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [category, setCategory] = useState<SuggestionCategory>("other")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSaving(true)
    setError(null)
    try {
      await suggestionsService.create({ title, content, category })
      setTitle(""); setContent(""); setCategory("other")
      onCreated()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível enviar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => !saving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova sugestão</DialogTitle>
          <DialogDescription>Descreva a ideia com clareza. A comunidade vota e a staff acompanha o andamento aqui.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-[1fr_180px]">
            <div className="flex flex-col gap-1.5"><span className="text-xs font-medium">Título</span><Input value={title} maxLength={100} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Adicionar mais concessionárias" /></div>
            <div className="flex flex-col gap-1.5"><span className="text-xs font-medium">Categoria</span><SelectMenu value={category} onValueChange={v => setCategory(v as SuggestionCategory)} options={CATEGORY_OPTIONS} triggerClassName="h-9" aria-label="Categoria" /></div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">Descrição</span>
            <Textarea rows={6} value={content} maxLength={1500} onChange={e => setContent(e.target.value)} placeholder="Explique o que muda e por que isso melhora o servidor." />
            <span className="text-muted-foreground self-end font-mono text-[11px]">{content.length}/1500</span>
          </div>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving}>{saving ? "Enviando..." : "Enviar sugestão"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SuggestionCard({ item, canManage, onChanged, onDelete, onError }: { item: Suggestion; canManage: boolean; onChanged: (next: Suggestion) => void; onDelete: () => void; onError: (message: string) => void }) {
  const [note, setNote] = useState(item.statusNote ?? "")
  const { user } = useAuth()
  const isOwn = user?.id === item.author.id

  async function vote(value: 1 | -1) {
    try { onChanged(await suggestionsService.vote(item.id, item.myVote === value ? 0 : value)) }
    catch (err) { onError(err instanceof ApiError ? err.message : "Não foi possível votar.") }
  }

  async function setStatus(status: string) {
    try { onChanged(await suggestionsService.setStatus(item.id, status as SuggestionStatus, note)) }
    catch (err) { onError(err instanceof ApiError ? err.message : "Não foi possível alterar o estado.") }
  }

  return (
    <Card className="flex-row gap-3 p-4">
      <div className="flex shrink-0 flex-col items-center gap-0.5">
        <button type="button" aria-label="Voto positivo" aria-pressed={item.myVote === 1} onClick={() => vote(1)} disabled={isOwn} className={cn("rounded-md p-0.5 transition hover:bg-white/10", item.myVote === 1 ? "text-[#34d399]" : "text-muted-foreground")}><ArrowBigUp className={cn("size-6", item.myVote === 1 && "fill-current")} /></button>
        <span className={cn("text-sm font-bold tabular-nums", item.score > 0 && "text-[#34d399]", item.score < 0 && "text-[#f0464f]")}>{item.score}</span>
        <button type="button" aria-label="Voto negativo" aria-pressed={item.myVote === -1} onClick={() => vote(-1)} disabled={isOwn} className={cn("rounded-md p-0.5 transition hover:bg-white/10", item.myVote === -1 ? "text-[#f0464f]" : "text-muted-foreground")}><ArrowBigDown className={cn("size-6", item.myVote === -1 && "fill-current")} /></button>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip status={item.status} />
          <span className="text-muted-foreground text-[11px]">{SUGGESTION_CATEGORY[item.category]}</span>
        </div>
        <h4 className="text-[15px] leading-snug font-semibold break-words">{item.title}</h4>
        <p className="text-muted-foreground text-sm leading-relaxed break-words whitespace-pre-line">{item.content}</p>
        {item.statusNote && <p className="border-border/70 rounded-lg border-l-2 bg-white/[0.03] px-3 py-2 text-xs"><strong>{item.statusChangedByName ?? "Staff"}:</strong> {item.statusNote}</p>}
        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span>{item.author.name} • {timeAgo(item.createdAt)} • {item.up} ↑ {item.down} ↓</span>
          {item.canDelete && <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="size-3.5" /> Remover</Button>}
        </div>

        {canManage && (
          <div className="border-border/60 mt-1 grid gap-2 border-t pt-3 sm:grid-cols-[200px_1fr]">
            <SelectMenu value={item.status} onValueChange={setStatus} options={STATUS_OPTIONS} triggerClassName="h-9" aria-label="Estado da sugestão" />
            <Input value={note} maxLength={300} onChange={e => setNote(e.target.value)} onBlur={() => note !== (item.statusNote ?? "") && void setStatus(item.status)} placeholder="Nota para a comunidade (opcional, salva ao sair do campo)" />
          </div>
        )}
      </div>
    </Card>
  )
}

export function SuggestionsPage() {
  const [sort, setSort] = useState<"top" | "new">("top")
  const [view, setView] = useState<"list" | "board">("list")
  const [filter, setFilter] = useState<"" | SuggestionStatus>("")
  const { data, loading, error, refetch } = useApi(() => suggestionsService.list(sort), [sort])
  useLiveRefresh(refetch, ["suggestions-changed"], 120_000)

  const [creating, setCreating] = useState(false)
  const [deleting, setDeleting] = useState<Suggestion | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [local, setLocal] = useState<Record<string, Suggestion>>({})
  useEffect(() => setLocal({}), [data])

  const items = useMemo(() => {
    const merged = (data?.items ?? []).map(item => local[item.id] ?? item)
    return filter ? merged.filter(item => item.status === filter) : merged
  }, [data, local, filter])

  const patch = (next: Suggestion) => setLocal(current => ({ ...current, [next.id]: next }))
  const canManage = data?.canManage ?? false
  const renderCard = (item: Suggestion) => <SuggestionCard key={item.id} item={item} canManage={canManage} onChanged={patch} onDelete={() => setDeleting(item)} onError={setActionError} />

  return (
    <DashboardLayout title="Sugestões e Roadmap" description="Proponha ideias, vote nas melhores e acompanhe o que a equipe está analisando e desenvolvendo." actions={<Button onClick={() => setCreating(true)}><Plus className="size-4" /> Nova sugestão</Button>}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={view} onValueChange={v => setView(v as "list" | "board")}>
          <TabsList>
            <TabsTrigger value="list"><List className="size-4" /> Lista</TabsTrigger>
            <TabsTrigger value="board"><Kanban className="size-4" /> Roadmap</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <SelectMenu value={sort} onValueChange={v => setSort(v as "top" | "new")} options={[{ value: "top", label: "Mais votadas" }, { value: "new", label: "Mais recentes" }]} className="w-40" aria-label="Ordenar" />
          {view === "list" && <SelectMenu value={filter} onValueChange={v => setFilter(v as "" | SuggestionStatus)} options={STATUS_OPTIONS} placeholder="Todos os estados" className="w-48" aria-label="Filtrar por estado" />}
        </div>
      </div>

      {actionError && <Alert variant="destructive"><AlertDescription>{actionError}</AlertDescription></Alert>}
      {loading && !data && <div className="grid gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>}
      {error && !data && <ErrorState message={error} onRetry={refetch} />}
      {data && items.length === 0 && <EmptyState icon={<Lightbulb className="size-5" />} title="Nenhuma sugestão por aqui" description="Seja o primeiro a propor uma ideia." />}

      {view === "list" && <div className="grid gap-4">{items.map(renderCard)}</div>}

      {view === "board" && data && (
        <div className="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-5">
          {SUGGESTION_STATUS_ORDER.map(status => {
            const column = items.filter(item => item.status === status)
            return (
              <div key={status} className="flex min-w-0 flex-col gap-3">
                <div className="flex items-center justify-between px-1"><StatusChip status={status} /><span className="text-muted-foreground text-xs tabular-nums">{column.length}</span></div>
                {column.length === 0 ? <p className="text-muted-foreground border-border/60 rounded-xl border border-dashed p-4 text-center text-xs">Vazio</p> : column.map(renderCard)}
              </div>
            )
          })}
        </div>
      )}

      <NewSuggestionDialog open={creating} onOpenChange={setCreating} onCreated={refetch} />
      <ConfirmDialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)} variant="destructive" confirmLabel="Remover" title="Remover esta sugestão?" description="Os votos também são apagados e a ação fica registrada no Discord." onConfirm={async () => { await suggestionsService.remove(deleting!.id); setDeleting(null); refetch() }} />
    </DashboardLayout>
  )
}
