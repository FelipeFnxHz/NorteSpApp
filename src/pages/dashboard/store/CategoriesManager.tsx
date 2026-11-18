import { useEffect, useState } from "react"
import { Pencil, Plus, Tags, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { ApiError } from "@/api/client"
import { useStoreRealtime } from "@/hooks/useStoreRealtime"
import { useApi } from "@/hooks/useApi"
import { storeService } from "@/services/store.service"
import { moveItem } from "@/lib/reorder"
import type { StoreCategory } from "@/types"
import { ReorderButtons } from "./ReorderButtons"

function CategoryForm({ editing, onDone }: { editing: StoreCategory | null; onDone: () => void }) {
  const [name, setName] = useState(editing?.name ?? "")
  const [description, setDescription] = useState(editing?.description ?? "")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!name.trim()) return setError("Informe o nome da categoria.")
    setBusy(true)
    setError(null)
    try {
      if (editing) await storeService.updateCategory(editing.id, { name, description })
      else {
        await storeService.createCategory({ name, description })
        setName("")
        setDescription("")
      }
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar a categoria.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-border flex flex-col gap-3.5 border-t pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
      <p className="flex items-center gap-1.5 text-sm font-bold">
        {editing ? <Pencil className="size-3.5" /> : <Plus className="size-3.5" />}
        {editing ? "Editando categoria" : "Nova categoria"}
      </p>
      <Input label="Nome" value={name} maxLength={40} onChange={e => setName(e.target.value)} placeholder="Ex: VIPs" />
      <Input label="Descrição (opcional)" value={description} maxLength={140} onChange={e => setDescription(e.target.value)} placeholder="Uma linha sobre a categoria" />
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="flex flex-wrap gap-2">
        <Button onClick={submit} disabled={busy}>
          {busy ? "Salvando..." : editing ? "Salvar alterações" : "Adicionar categoria"}
        </Button>
        {editing && (
          <Button variant="outline" onClick={onDone} disabled={busy}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  )
}

export function CategoriesManager() {
  const { data, loading, error, refetch } = useApi(() => storeService.categories(), [])
  const [editing, setEditing] = useState<StoreCategory | null>(null)
  const [removing, setRemoving] = useState<StoreCategory | null>(null)
  const [optimistic, setOptimistic] = useState<StoreCategory[] | null>(null)
  const [moving, setMoving] = useState(false)
  const [moveError, setMoveError] = useState<string | null>(null)

  useEffect(() => setOptimistic(null), [data])

  async function move(index: number, delta: -1 | 1) {
    const next = moveItem(categories, index, index + delta)
    if (next === categories) return
    setOptimistic(next)
    setMoving(true)
    setMoveError(null)
    try {
      await storeService.reorderCategories(next.map(item => item.id))
      refetch()
    } catch (err) {
      setOptimistic(null)
      setMoveError(err instanceof ApiError ? err.message : "Falha ao salvar a ordem.")
      refetch()
    } finally {
      setMoving(false)
    }
  }

  useStoreRealtime({ onCatalog: refetch })

  if (loading && !data) return <Skeleton className="h-72 w-full rounded-2xl" />
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />
  const categories = optimistic ?? data?.categories ?? []

  return (
    <div className="border-border grid gap-6 rounded-2xl border bg-white/[0.02] p-5 lg:grid-cols-[1.2fr_1fr]">
      <div className="flex flex-col gap-2.5">
        <p className="text-sm font-bold">Categorias ({categories.length})</p>
        {categories.length > 1 && <p className="text-muted-foreground text-xs">A ordem aqui é a ordem das seções na vitrine.</p>}
        {moveError && (
          <Alert variant="destructive">
            <AlertDescription>{moveError}</AlertDescription>
          </Alert>
        )}
        {categories.length === 0 ? (
          <EmptyState icon={<Tags className="size-6" />} title="Nenhuma categoria" description="Crie a primeira (ex.: VIPs, Veículos, Itens, Moedas)." />
        ) : (
          <ul className="scroll-dark flex max-h-[26rem] flex-col gap-2 pr-1.5">
            {categories.map((category, index) => (
              <li key={category.id} className="border-border flex items-center gap-2 rounded-xl border bg-white/[0.02] px-3 py-3">
                <ReorderButtons index={index} count={categories.length} label={category.name} disabled={moving} onMove={delta => move(index, delta)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold break-words">{category.name}</p>
                  {category.description && <p className="text-muted-foreground text-xs break-words">{category.description}</p>}
                </div>
                <Button size="icon-sm" variant="ghost" onClick={() => setEditing(category)} aria-label={`Editar ${category.name}`}>
                  <Pencil />
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => setRemoving(category)} aria-label={`Excluir ${category.name}`}>
                  <Trash2 className="text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <CategoryForm
        key={editing?.id ?? "new"}
        editing={editing}
        onDone={() => {
          setEditing(null)
          refetch()
        }}
      />

      <ConfirmDialog
        open={!!removing}
        onOpenChange={open => !open && setRemoving(null)}
        title="Excluir categoria"
        description={`Excluir "${removing?.name}"? Só é possível se ela não tiver produtos.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={async () => {
          await storeService.removeCategory(removing!.id)
          if (editing?.id === removing!.id) setEditing(null)
          setRemoving(null)
          refetch()
        }}
      />
    </div>
  )
}
