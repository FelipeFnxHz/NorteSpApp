import { useEffect, useMemo, useState } from "react"
import { ArrowDown, ArrowUp, BookOpenText, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { ApiError } from "@/api/client"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { cn } from "@/lib/utils"
import { rulesService, type RuleItem } from "@/services/modules.service"
import { RuleFormDialog } from "./RuleFormDialog"
import { RuleText } from "./RuleText"

const initialType = () => window.location.hash.replace("#", "")

export function RulesPage() {
  const { isStaff } = useAuth()
  const { data, loading, error, refetch } = useApi(() => rulesService.list(), [])
  useLiveRefresh(refetch, ["rules-changed"], 120_000)

  const [active, setActive] = useState(initialType)
  const [query, setQuery] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState<{ open: boolean; editing: RuleItem | null }>({ open: false, editing: null })
  const [removing, setRemoving] = useState<RuleItem | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [pendingOrder, setPendingOrder] = useState<Record<string, string[]>>({})

  const categories = data?.categories ?? []
  const category = categories.find(c => c.type === active) ?? categories[0]

  useEffect(() => { setPendingOrder({}) }, [data])
  useEffect(() => { if (category && category.type !== active) setActive(category.type) }, [category, active])

  const rules = useMemo(() => {
    if (!category) return []
    const order = pendingOrder[category.type]
    const base = order ? order.map(id => category.rules.find(r => r.id === id)).filter((r): r is RuleItem => Boolean(r)) : category.rules
    const q = query.trim().toLowerCase()
    return q ? base.filter(rule => `${rule.title} ${rule.description}`.toLowerCase().includes(q)) : base
  }, [category, pendingOrder, query])

  function select(type: string) {
    setActive(type)
    setQuery("")
    history.replaceState(null, "", `#${type}`)
  }

  async function move(rule: RuleItem, delta: -1 | 1) {
    if (!category) return
    const ids = (pendingOrder[category.type] ?? category.rules.map(r => r.id)).slice()
    const from = ids.indexOf(rule.id)
    const to = from + delta
    if (to < 0 || to >= ids.length) return
    ;[ids[from], ids[to]] = [ids[to], ids[from]]
    setPendingOrder(current => ({ ...current, [category.type]: ids }))
    try {
      await rulesService.reorder(category.type, ids)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível reordenar.")
      refetch()
    }
  }

  const editing = isStaff && editMode
  const searching = query.trim().length > 0

  return (
    <DashboardLayout
      title="Regras"
      description="Diretrizes oficiais da cidade."
      actions={isStaff && (
        <div className="flex items-center gap-3">
          <label className="border-border/70 bg-foreground/[0.03] flex cursor-pointer items-center gap-2 rounded-full border py-1.5 pr-2.5 pl-3 text-xs font-medium">
            Modo edição
            <Switch checked={editMode} onCheckedChange={setEditMode} aria-label="Ativar modo de edição" />
          </label>
          {editing && category && <Button onClick={() => setForm({ open: true, editing: null })}><Plus className="size-4" /> Nova regra</Button>}
        </div>
      )}
    >
      {loading && !data && <Skeleton className="h-96 w-full rounded-2xl" />}
      {error && !data && <ErrorState message={error} onRetry={refetch} />}
      {actionError && <Alert variant="destructive"><AlertDescription>{actionError}</AlertDescription></Alert>}

      {category && (
        <div className="grid items-start gap-6 lg:grid-cols-[240px_1fr]">
          <nav aria-label="Categorias de regras" className="scroll-dark -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:sticky lg:top-24 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
            {categories.map(item => (
              <button
                key={item.type}
                type="button"
                onClick={() => select(item.type)}
                aria-current={item.type === category.type}
                className={cn(
                  "flex shrink-0 items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-colors",
                  item.type === category.type ? "border-primary/40 bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                )}
              >
                <span className="whitespace-nowrap">{item.label}</span>
                <span className="rounded-full bg-white/[0.07] px-2 py-px font-mono text-[11px] tabular-nums">{item.rules.length}</span>
              </button>
            ))}
          </nav>

          <Card className="gap-6 px-4 sm:px-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">{category.label}</h2>
                <p className="text-muted-foreground mt-1 text-sm">{category.description}</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar nesta categoria" className="pl-9" aria-label="Buscar regras" />
              </div>
            </div>

            {rules.length === 0 && (
              <EmptyState
                icon={<BookOpenText className="size-5" />}
                title={searching ? "Nada encontrado" : "Nenhuma regra cadastrada"}
                description={searching ? "Tente outras palavras." : isStaff ? "Ative o modo edição para criar a primeira regra." : "A staff ainda não publicou regras nesta categoria."}
              />
            )}

            <ol className="flex flex-col gap-8">
              {rules.map((rule, index) => (
                <li key={rule.id} id={`rule-${rule.id}`} className="group flex scroll-mt-28 gap-4">
                  <span className="bg-primary/12 text-primary mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold tabular-nums">{searching ? "•" : index + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-lg leading-snug font-semibold break-words">{rule.title}</h3>
                      {editing && (
                        <div className="flex shrink-0 gap-1">
                          <Button variant="ghost" size="icon" aria-label="Mover para cima" disabled={searching || index === 0} onClick={() => move(rule, -1)}><ArrowUp className="size-4" /></Button>
                          <Button variant="ghost" size="icon" aria-label="Mover para baixo" disabled={searching || index === rules.length - 1} onClick={() => move(rule, 1)}><ArrowDown className="size-4" /></Button>
                          <Button variant="ghost" size="icon" aria-label="Editar regra" onClick={() => setForm({ open: true, editing: rule })}><Pencil className="size-4" /></Button>
                          <Button variant="ghost" size="icon" aria-label="Remover regra" onClick={() => setRemoving(rule)}><Trash2 className="text-destructive size-4" /></Button>
                        </div>
                      )}
                    </div>
                    <div className="mt-2"><RuleText text={rule.description} /></div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      )}

      {category && data && (
        <RuleFormDialog open={form.open} onOpenChange={open => setForm(f => ({ ...f, open }))} type={category.type} categoryLabel={category.label} editing={form.editing} limits={data.limits} onSaved={refetch} />
      )}
      <ConfirmDialog
        open={!!removing} onOpenChange={open => !open && setRemoving(null)} variant="destructive" confirmLabel="Remover regra"
        title="Remover esta regra?" description={`“${removing?.title ?? ""}” some do site e do bot na hora. A remoção é registrada nos logs do Discord.`}
        onConfirm={async () => { await rulesService.remove(removing!.id); setRemoving(null); refetch() }}
      />
    </DashboardLayout>
  )
}
