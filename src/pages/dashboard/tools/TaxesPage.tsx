import { useEffect, useMemo, useState } from "react"
import { CalendarClock, CheckCircle2, Circle, Plus, Repeat, Trash2 } from "lucide-react"
import { ApiError } from "@/api/client"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SelectMenu } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { LOG_TONE } from "@/lib/logTypes"
import { TAX_STATUS, formatMoney } from "@/lib/modules"
import { cn } from "@/lib/utils"
import { taxesService } from "@/services/modules.service"
import type { TaxEntry, TaxesResponse } from "@/types/modules"

const RECURRENCE = [{ value: "", label: "Não se repete" }, { value: "7", label: "A cada 7 dias" }, { value: "15", label: "A cada 15 dias" }, { value: "30", label: "A cada 30 dias" }]
const monthLabel = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

function NewTaxDialog({ open, onOpenChange, data, onCreated }: { open: boolean; onOpenChange: (v: boolean) => void; data: TaxesResponse; onCreated: () => void }) {
  const [label, setLabel] = useState("")
  const [amount, setAmount] = useState("")
  const [dueAt, setDueAt] = useState("")
  const [recurrence, setRecurrence] = useState("")
  const [owner, setOwner] = useState("me")
  const [userId, setUserId] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (open) { setLabel(""); setAmount(""); setDueAt(""); setRecurrence(""); setOwner("me"); setUserId(""); setError(null) } }, [open])

  async function submit() {
    setSaving(true)
    setError(null)
    try {
      await taxesService.create({
        label, amount: Number(amount), dueAt: dueAt ? new Date(`${dueAt}T23:59:00`).toISOString() : "", recurrenceDays: recurrence ? Number(recurrence) : null,
        ...(owner === "me" ? (userId ? { userId } : {}) : { ownerType: "corp", corpSlug: owner }),
      })
      onCreated()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !saving && onOpenChange(v)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Novo prazo de imposto</DialogTitle><DialogDescription>Cadastre o vencimento para não perder bens por inatividade.</DialogDescription></DialogHeader>
        <div className="grid gap-4">
          <div className="flex flex-col gap-1.5"><span className="text-xs font-medium">Nome</span><Input value={label} maxLength={80} onChange={e => setLabel(e.target.value)} placeholder="Ex.: IPTU da mansão" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5"><span className="text-xs font-medium">Valor</span><Input type="number" min={0} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" /></div>
            <div className="flex flex-col gap-1.5"><span className="text-xs font-medium">Vencimento</span><input type="date" value={dueAt} onChange={e => setDueAt(e.target.value)} className="border-input bg-input/30 focus-visible:border-ring h-10 w-full rounded-xl border px-3 text-sm outline-none [color-scheme:dark]" /></div>
          </div>
          <div className="flex flex-col gap-1.5"><span className="text-xs font-medium">Repetição</span><SelectMenu value={recurrence} onValueChange={setRecurrence} options={RECURRENCE.filter(o => o.value)} placeholder="Não se repete" triggerClassName="h-10" aria-label="Repetição" /></div>
          {data.corps.length > 0 && <div className="flex flex-col gap-1.5"><span className="text-xs font-medium">De quem é</span><SelectMenu value={owner} onValueChange={setOwner} options={[{ value: "me", label: "Pessoal" }, ...data.corps.map(c => ({ value: c.slug, label: `Corporação: ${c.name}` }))]} triggerClassName="h-10" aria-label="Dono" /></div>}
          {data.canStaffCreate && owner === "me" && <div className="flex flex-col gap-1.5"><span className="text-xs font-medium">ID do jogador (staff, opcional)</span><Input value={userId} onChange={e => setUserId(e.target.value)} placeholder="Deixe vazio para criar para você" inputMode="numeric" /></div>}
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button><Button onClick={submit} disabled={saving || !label || !dueAt}>{saving ? "Salvando..." : "Adicionar"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function TaxesPage() {
  const { data, loading, error, refetch } = useApi(() => taxesService.list(), [])
  useLiveRefresh(refetch, ["taxes-changed"], 120_000)
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const groups = useMemo(() => {
    const map = new Map<string, TaxEntry[]>()
    for (const item of data?.items ?? []) {
      const key = item.status === "paid" ? "Pagos" : monthLabel(item.dueAt)
      map.set(key, [...(map.get(key) ?? []), item])
    }
    return [...map.entries()].sort(([a], [b]) => (a === "Pagos" ? 1 : b === "Pagos" ? -1 : 0))
  }, [data])

  async function run(action: () => Promise<unknown>) {
    setActionError(null)
    try { await action(); refetch() } catch (err) { setActionError(err instanceof ApiError ? err.message : "Ação não concluída.") }
  }

  return (
    <DashboardLayout title="Calendário de Impostos" description="Prazos de pagamento das suas propriedades e empresas — pague antes do vencimento para não perder nada." actions={<Button onClick={() => setCreating(true)} disabled={!data}><Plus className="size-4" /> Novo prazo</Button>}>
      {actionError && <Alert variant="destructive"><AlertDescription>{actionError}</AlertDescription></Alert>}
      {loading && !data && <Skeleton className="h-48 w-full rounded-2xl" />}
      {error && !data && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="gap-1 px-5"><span className="text-muted-foreground text-xs font-medium">Em atraso</span><span className={cn("text-3xl font-bold tabular-nums", data.summary.overdue > 0 && "text-[#f0464f]")}>{data.summary.overdue}</span></Card>
            <Card className="gap-1 px-5"><span className="text-muted-foreground text-xs font-medium">Vencem em 3 dias</span><span className={cn("text-3xl font-bold tabular-nums", data.summary.dueSoon > 0 && "text-[#f5b94a]")}>{data.summary.dueSoon}</span></Card>
            <Card className="gap-1 px-5"><span className="text-muted-foreground text-xs font-medium">Total em aberto</span><span className="text-3xl font-bold tabular-nums">{formatMoney(data.summary.totalOpen)}</span></Card>
          </div>

          {data.items.length === 0 && <EmptyState icon={<CalendarClock className="size-5" />} title="Nenhum prazo cadastrado" description="Adicione os impostos das suas propriedades para receber o controle de vencimentos." />}

          {groups.map(([group, items]) => (
            <Card key={group} className="gap-1 px-4 sm:px-6">
              <h3 className="mb-2 text-sm font-semibold capitalize">{group}</h3>
              {items.map(item => {
                const meta = TAX_STATUS[item.status]
                return (
                  <div key={item.id} className="border-border/60 flex items-center justify-between gap-3 border-b py-3 last:border-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <button type="button" aria-label={item.paidAt ? "Marcar como pendente" : "Marcar como pago"} onClick={() => run(() => taxesService.setPaid(item.id, !item.paidAt))} className={cn("shrink-0 transition", item.paidAt ? "text-[#34d399]" : "text-muted-foreground hover:text-foreground")}>
                        {item.paidAt ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                      </button>
                      <div className="min-w-0">
                        <p className={cn("flex flex-wrap items-center gap-2 text-sm font-medium", item.paidAt && "text-muted-foreground line-through")}>{item.label}{item.recurrenceDays && <Repeat className="text-muted-foreground size-3" aria-label={`Repete a cada ${item.recurrenceDays} dias`} />}</p>
                        <p className="text-muted-foreground truncate text-xs">{item.ownerType === "corp" ? item.ownerName : "Pessoal"} • vence {new Date(item.dueAt).toLocaleDateString("pt-BR")}{!item.paidAt && (item.daysLeft < 0 ? ` (${-item.daysLeft} d de atraso)` : ` (em ${item.daysLeft} d)`)}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={cn("hidden rounded-full border px-2.5 py-0.5 text-[11px] font-semibold sm:inline", LOG_TONE[meta.tone].badge)}>{meta.label}</span>
                      <span className="text-sm font-bold tabular-nums">{formatMoney(item.amount)}</span>
                      <Button variant="ghost" size="icon" aria-label="Remover prazo" onClick={() => run(() => taxesService.remove(item.id))}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                )
              })}
            </Card>
          ))}
          <NewTaxDialog open={creating} onOpenChange={setCreating} data={data} onCreated={refetch} />
        </>
      )}
    </DashboardLayout>
  )
}
