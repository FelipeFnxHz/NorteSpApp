import { useEffect, useState } from "react"
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, EyeOff, Package, Pencil, Plus, Terminal, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { useStoreRealtime } from "@/hooks/useStoreRealtime"
import { useApi } from "@/hooks/useApi"
import { ApiError } from "@/api/client"
import { formatBRL } from "@/lib/money"
import { moveItem } from "@/lib/reorder"
import { cn } from "@/lib/utils"
import { storeService } from "@/services/store.service"
import type { StoreProduct } from "@/types"
import { ProductDialog } from "./ProductDialog"
import { ProductImage } from "./ProductCard"
import { ReorderButtons } from "./ReorderButtons"

const COLLAPSED_KEY = "norte.store.admin.collapsed"

function loadCollapsed(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? "[]")
    return new Set(Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : [])
  } catch {
    return new Set()
  }
}

export function ProductsManager() {
  const { data, loading, error, refetch } = useApi(async () => {
    const [products, categories, roles] = await Promise.all([storeService.products(), storeService.categories(), storeService.roles()])
    return { products: products.products, categories: categories.categories, roles: roles.roles }
  }, [])
  const [dialog, setDialog] = useState<{ editing: StoreProduct | null } | null>(null)
  const [removing, setRemoving] = useState<StoreProduct | null>(null)
  const [optimistic, setOptimistic] = useState<Record<string, StoreProduct[]>>({})
  const [moving, setMoving] = useState(false)
  const [moveError, setMoveError] = useState<string | null>(null)

  useEffect(() => setOptimistic({}), [data])

  const [collapsed, setCollapsed] = useState<Set<string>>(loadCollapsed)

  function updateCollapsed(next: Set<string>) {
    setCollapsed(next)
    try {
      localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...next]))
    } catch {}
  }

  function toggleGroup(id: string) {
    const next = new Set(collapsed)
    if (!next.delete(id)) next.add(id)
    updateCollapsed(next)
  }

  async function move(categoryId: string, list: StoreProduct[], index: number, delta: -1 | 1) {
    const next = moveItem(list, index, index + delta)
    if (next === list) return
    setOptimistic(current => ({ ...current, [categoryId]: next }))
    setMoving(true)
    setMoveError(null)
    try {
      await storeService.reorderProducts(categoryId, next.map(product => product.id))
      refetch()
    } catch (err) {
      setOptimistic({})
      setMoveError(err instanceof ApiError ? err.message : "Falha ao salvar a ordem.")
      refetch()
    } finally {
      setMoving(false)
    }
  }

  useStoreRealtime({ onCatalog: refetch })

  if (loading && !data) return <Skeleton className="h-72 w-full rounded-2xl" />
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />
  if (!data) return null

  const categoryName = (id: string | null) => data.categories.find(category => category.id === id)?.name ?? "Sem categoria"

  const known = new Set(data.categories.map(category => category.id))
  const groups = [
    ...data.categories.map(category => ({ id: category.id, name: category.name, reorderable: true, products: optimistic[category.id] ?? data.products.filter(product => product.categoryId === category.id) })),
    { id: "sem-categoria", name: "Sem categoria", reorderable: false, products: data.products.filter(product => !product.categoryId || !known.has(product.categoryId)) },
  ].filter(group => group.products.length > 0)
  const allCollapsed = groups.length > 0 && groups.every(group => collapsed.has(group.id))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">Produtos ({data.products.length})</p>
        <div className="flex flex-wrap items-center gap-2">
          {groups.length > 1 && (
            <Button variant="ghost" onClick={() => updateCollapsed(allCollapsed ? new Set() : new Set(groups.map(group => group.id)))}>
              {allCollapsed ? <ChevronsUpDown /> : <ChevronsDownUp />}
              {allCollapsed ? "Expandir tudo" : "Recolher tudo"}
            </Button>
          )}
          <Button onClick={() => setDialog({ editing: null })} disabled={data.categories.length === 0}>
            <Plus /> Novo produto
          </Button>
        </div>
      </div>
      {data.categories.length === 0 && <p className="text-muted-foreground text-xs">Crie uma categoria na aba "Categorias" para cadastrar produtos.</p>}

      {moveError && (
        <Alert variant="destructive">
          <AlertDescription>{moveError}</AlertDescription>
        </Alert>
      )}

      {data.products.length === 0 ? (
        <EmptyState icon={<Package className="size-6" />} title="Nenhum produto" description="Cadastre o primeiro produto da loja." />
      ) : (
        <div className="flex flex-col gap-7">
          {groups.map(group => {
            const open = !collapsed.has(group.id)
            return (
            <section key={group.id} className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                aria-expanded={open}
                aria-controls={`produtos-admin-${group.id}`}
                className="group border-border focus-visible:ring-primary/40 flex w-full items-center gap-2 rounded-xl border bg-white/[0.02] px-3.5 py-2.5 text-left transition-colors outline-none hover:bg-white/[0.05] focus-visible:ring-2"
              >
                <h3 className="min-w-0 truncate text-sm font-bold">{group.name}</h3>
                <Badge variant="secondary">{group.products.length}</Badge>
                {open && group.reorderable && group.products.length > 1 && <span className="text-muted-foreground hidden text-xs md:inline">Use as setas para definir a ordem na vitrine.</span>}
                <span className="text-muted-foreground group-hover:text-foreground ml-auto flex shrink-0 items-center gap-1.5 text-xs transition-colors">
                  <span className="hidden sm:inline">{open ? "Recolher" : "Expandir"}</span>
                  <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
                </span>
              </button>
              <div id={`produtos-admin-${group.id}`} inert={!open} className={cn("grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="min-h-0 overflow-hidden">
              <ul className="scroll-dark flex max-h-[34rem] flex-col gap-3 py-1 pr-1.5">
          {group.products.map((product, index) => (
            <li key={product.id} className="border-border flex items-center gap-3 rounded-2xl border bg-white/[0.02] p-3.5">
              {group.reorderable && <ReorderButtons index={index} count={group.products.length} label={product.name} disabled={moving} onMove={delta => move(group.id, group.products, index, delta)} />}
              <ProductImage src={product.image} alt="" className="size-20 shrink-0 rounded-xl" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-1.5">
                  <p className="text-sm font-semibold break-words">{product.name}</p>
                  {!product.active && (
                    <Badge variant="secondary">
                      <EyeOff className="size-3" /> oculto
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  {categoryName(product.categoryId)} · <span className="text-foreground font-semibold tabular-nums">{formatBRL(product.priceCents)}</span> · <span className={product.soldOut ? "text-[#f0464f] font-semibold" : ""}>{product.stock === null ? "estoque ilimitado" : product.soldOut ? "esgotado" : `${product.stock} em estoque`}</span>
                </p>
                <p className="text-muted-foreground flex items-center gap-1 text-[11px]">
                  <Terminal className="size-3" /> {product.deliveryCommands?.length ?? 0} comando(s){product.rewardRoleId ? " · cargo" : ""}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button size="icon-sm" variant="ghost" onClick={() => setDialog({ editing: product })} aria-label={`Editar ${product.name}`}>
                  <Pencil />
                </Button>
                <Button size="icon-sm" variant="ghost" onClick={() => setRemoving(product)} aria-label={`Excluir ${product.name}`}>
                  <Trash2 className="text-destructive" />
                </Button>
              </div>
            </li>
          ))}
              </ul>
              </div>
              </div>
            </section>
            )
          })}
        </div>
      )}

      {dialog && (
        <ProductDialog
          key={dialog.editing?.id ?? "new"}
          open
          editing={dialog.editing}
          categories={data.categories}
          roles={data.roles}
          onClose={saved => {
            setDialog(null)
            if (saved) refetch()
          }}
        />
      )}

      <ConfirmDialog
        open={!!removing}
        onOpenChange={open => !open && setRemoving(null)}
        title="Excluir produto"
        description={`Excluir "${removing?.name}"? Pedidos antigos continuam no histórico.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={async () => {
          await storeService.removeProduct(removing!.id)
          setRemoving(null)
          refetch()
        }}
      />
    </div>
  )
}
