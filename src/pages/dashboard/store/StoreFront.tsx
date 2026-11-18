import { useMemo, useState } from "react"
import { ChevronDown, ChevronsDownUp, ChevronsUpDown, Link2Off, PauseCircle, Search, ShoppingCart, Store } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { useApi } from "@/hooks/useApi"
import { useStoreRealtime } from "@/hooks/useStoreRealtime"
import { cn } from "@/lib/utils"
import { storeService } from "@/services/store.service"
import type { StoreCategory, StoreOrder, StoreProduct } from "@/types"
import { CartSheet } from "./CartSheet"
import { OrderDetailsDialog } from "./OrderDetailsDialog"
import { ProductCard } from "./ProductCard"
import { ProductDetailsDialog } from "./ProductDetailsDialog"
import { useCart } from "./useCart"

function Pill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "shrink-0 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/20",
        active ? "border-primary/50 bg-primary/12 text-primary" : "border-border text-muted-foreground bg-white/[0.02] hover:bg-white/[0.06] hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}

const COLLAPSED_KEY = "norte.store.collapsed"

function loadCollapsed(): Set<string> {
  try {
    const raw = JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? "[]")
    return new Set(Array.isArray(raw) ? raw.filter((id): id is string => typeof id === "string") : [])
  } catch {
    return new Set()
  }
}

export function StoreFront({ onOrderChanged }: { onOrderChanged: () => void }) {
  const { data, loading, error, refetch } = useApi(() => storeService.catalog(), [])
  const cart = useCart()
  useStoreRealtime({ onCatalog: refetch })
  const [category, setCategory] = useState<string>("all")
  const [query, setQuery] = useState("")
  const [cartOpen, setCartOpen] = useState(false)
  const [order, setOrder] = useState<StoreOrder | null>(null)
  const [detailsId, setDetailsId] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState<Set<string>>(loadCollapsed)

  function updateCollapsed(next: Set<string>) {
    setCollapsed(next)
    try {
      localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...next]))
    } catch {}
  }

  function toggleSection(id: string) {
    const next = new Set(collapsed)
    if (!next.delete(id)) next.add(id)
    updateCollapsed(next)
  }

  const sections = useMemo(() => {
    const term = query.trim().toLowerCase()
    const matches = (product: StoreProduct) => !term || `${product.name} ${product.description}`.toLowerCase().includes(term)
    const known = new Set((data?.categories ?? []).map(item => item.id))
    const visible = (data?.products ?? []).filter(matches)

    const result: { category: StoreCategory; products: StoreProduct[] }[] = (data?.categories ?? [])
      .filter(item => category === "all" || item.id === category)
      .map(item => ({ category: item, products: visible.filter(product => product.categoryId === item.id) }))

    const orphans = visible.filter(product => !product.categoryId || !known.has(product.categoryId))
    if (category === "all" && orphans.length) result.push({ category: { id: "outros", name: "Outros", description: "", order: Number.MAX_SAFE_INTEGER }, products: orphans })
    return result.filter(section => section.products.length > 0)
  }, [data, category, query])

  const searching = query.trim().length > 0
  const allCollapsed = sections.length > 0 && sections.every(section => collapsed.has(section.category.id))

  if (loading && !data) return <Skeleton className="h-96 w-full rounded-2xl" />
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />
  if (!data) return null

  return (
    <div className="flex flex-col gap-5">
      {data.paused && (
        <Alert variant="warning">
          <PauseCircle className="size-4" />
          <AlertDescription>A loja está pausada no momento: você pode ver os produtos, mas não é possível comprar.</AlertDescription>
        </Alert>
      )}

      {!data.linked && (
        <Alert>
          <Link2Off className="size-4" />
          <AlertDescription>Vincule seu ID do jogo ao Discord para receber compras que entregam itens no servidor.</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Buscar produtos..."
            aria-label="Buscar produtos"
            className="border-border placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/15 h-10 w-full rounded-xl border bg-white/[0.03] pr-3 pl-9 text-sm outline-none focus:ring-4 sm:h-9"
          />
        </div>

        <div className="-mx-1 flex min-w-0 flex-1 gap-2 overflow-x-auto px-1 pb-1 sm:pb-0">
          <Pill active={category === "all"} onClick={() => setCategory("all")}>
            Todos
          </Pill>
          {data.categories.map(item => (
            <Pill key={item.id} active={category === item.id} onClick={() => setCategory(item.id)}>
              {item.name}
            </Pill>
          ))}
        </div>

        {sections.length > 1 && !searching && (
          <Button variant="ghost" className="shrink-0" onClick={() => updateCollapsed(allCollapsed ? new Set() : new Set(sections.map(section => section.category.id)))}>
            {allCollapsed ? <ChevronsUpDown /> : <ChevronsDownUp />}
            {allCollapsed ? "Expandir tudo" : "Recolher tudo"}
          </Button>
        )}

        <Button variant="outline" className="relative shrink-0" onClick={() => setCartOpen(true)}>
          <ShoppingCart />
          Carrinho
          {cart.count > 0 && (
            <span className="bg-primary text-primary-foreground grid min-w-5 place-items-center rounded-full px-1.5 text-[10.5px] leading-5 font-bold">{cart.count}</span>
          )}
        </Button>
      </div>

      {sections.length === 0 ? (
        <EmptyState
          icon={<Store className="size-6" />}
          title={data.products.length === 0 ? "A loja ainda não tem produtos" : "Nada encontrado"}
          description={data.products.length === 0 ? "Volte em breve." : "Tente outra categoria ou termo de busca."}
        />
      ) : (
        <div className="flex flex-col gap-10">
          {sections.map(({ category: section, products }) => {
            const open = searching || !collapsed.has(section.id)
            return (
              <section key={section.id} aria-labelledby={`categoria-${section.id}`} className="flex flex-col gap-4">
                <header className="border-border border-b pb-3">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    disabled={searching}
                    aria-expanded={open}
                    aria-controls={`produtos-${section.id}`}
                    className="group focus-visible:ring-primary/40 -mx-2 flex w-[calc(100%+1rem)] items-start gap-2.5 rounded-lg px-2 py-1 text-left transition-colors outline-none hover:bg-white/[0.03] focus-visible:ring-2 disabled:cursor-default disabled:hover:bg-transparent"
                  >
                    <span className="bg-primary mt-1 h-5 w-1 shrink-0 rounded-full" aria-hidden />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                        <h2 id={`categoria-${section.id}`} className="min-w-0 text-lg font-bold tracking-tight break-words">
                          {section.name}
                        </h2>
                        <Badge variant="secondary">{products.length === 1 ? "1 item" : `${products.length} itens`}</Badge>
                      </span>
                      {section.description && <span className="text-muted-foreground text-sm break-words">{section.description}</span>}
                    </span>
                    {!searching && (
                      <span className="text-muted-foreground group-hover:text-foreground mt-0.5 flex shrink-0 items-center gap-1.5 text-xs transition-colors">
                        <span className="hidden sm:inline">{open ? "Recolher" : "Expandir"}</span>
                        <ChevronDown className={cn("size-4 transition-transform duration-200", open && "rotate-180")} />
                      </span>
                    )}
                  </button>
                </header>

                <div id={`produtos-${section.id}`} inert={!open} className={cn("grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="min-h-0 overflow-hidden">
                    <div className="-mx-1 grid grid-cols-1 gap-4 px-1 py-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {products.map(product => (
                        <ProductCard key={product.id} product={product} inCart={cart.lines[product.id] ?? 0} onAdd={() => cart.add(product.id)} onDetails={() => setDetailsId(product.id)} />
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}

      <ProductDetailsDialog
        product={data.products.find(product => product.id === detailsId) ?? null}
        categoryName={data.categories.find(item => item.id === data.products.find(product => product.id === detailsId)?.categoryId)?.name}
        inCart={detailsId ? (cart.lines[detailsId] ?? 0) : 0}
        onAdd={() => detailsId && cart.add(detailsId)}
        onClose={() => setDetailsId(null)}
      />

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} catalog={data} onOrderCreated={setOrder} />
      <OrderDetailsDialog
        initial={order}
        onClose={() => {
          setOrder(null)
          onOrderChanged()
        }}
      />
    </div>
  )
}
