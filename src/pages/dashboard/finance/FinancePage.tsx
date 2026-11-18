import { useEffect, useState } from "react"
import { ArrowDownLeft, ArrowUpRight, Gamepad2, Landmark, Settings2, Wallet } from "lucide-react"
import { ApiError } from "@/api/client"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CorpAvatar } from "@/components/corporations/CorpAvatar"
import { SelectMenu } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState, Pagination } from "@/components/ui/states"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { formatDateTime, formatMoney } from "@/lib/modules"
import { cn } from "@/lib/utils"
import { vaultService, type VaultScope } from "@/services/modules.service"
import { useAuth } from "@/contexts/AuthContext"

type Filter = "" | "deposit" | "withdraw"

function MovementDialog({ slug, scope, type, onClose, onDone }: { slug: string; scope: VaultScope; type: "deposit" | "withdraw" | null; onClose: () => void; onDone: () => void }) {
  const [amount, setAmount] = useState("")
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (type) { setAmount(""); setNote(""); setError(null) } }, [type])
  const deposit = type === "deposit"

  async function submit() {
    setSaving(true)
    setError(null)
    try {
      await vaultService.move(slug, { type: type!, amount: Number(amount), note }, scope)
      onDone()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível registrar o movimento.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={!!type} onOpenChange={open => !saving && !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{deposit ? "Registrar depósito" : "Registrar levantamento"}</DialogTitle>
          <DialogDescription>O movimento fica gravado no histórico (não pode ser editado) e é enviado ao canal de logs financeiros no Discord.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="flex flex-col gap-1.5"><span className="text-xs font-medium">Valor</span><Input type="number" min={1} inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0" autoFocus /></div>
          <div className="flex flex-col gap-1.5"><span className="text-xs font-medium">{deposit ? "Descrição (opcional)" : "Justificativa (obrigatória)"}</span><Input value={note} maxLength={200} onChange={e => setNote(e.target.value)} placeholder={deposit ? "Ex.: Faturamento do dia" : "Ex.: Compra de materiais"} /></div>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button variant={deposit ? "default" : "destructive"} onClick={submit} disabled={saving || !amount}>{saving ? "Registrando..." : deposit ? "Depositar" : "Levantar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function ChannelSettings({ slug, scope, current, onSaved }: { slug: string; scope: VaultScope; current: string | null; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(current ?? "")
  const [error, setError] = useState<string | null>(null)
  useEffect(() => setValue(current ?? ""), [current])

  async function save() {
    setError(null)
    try { await vaultService.setChannel(slug, value.trim(), scope); setOpen(false); onSaved() }
    catch (err) { setError(err instanceof ApiError ? err.message : "Não foi possível salvar.") }
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}><Settings2 className="size-3.5" /> Canal de logs {current ? "" : "(não definido)"}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Canal de logs financeiros</DialogTitle>
            <DialogDescription>Cole o ID do canal de texto do Discord onde esta {scope === "faction" ? "facção" : "corporação"} recebe cada depósito e levantamento. Deixe vazio para usar só o log geral da staff.</DialogDescription>
          </DialogHeader>
          <Input value={value} onChange={e => setValue(e.target.value)} placeholder="ID do canal (ex.: 123456789012345678)" inputMode="numeric" />
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button><Button onClick={save}>Salvar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Conteúdo de um escopo (corporações OU facções). Remonta via `key` ao trocar de aba:
 * `useApi` mantém o `data` anterior durante o refetch, e sem remontar o slug de uma corporação
 * era enviado para /api/vault/factions/:slug (404).
 */
function FinanceScopeView({ scope }: { scope: VaultScope }) {
  const isFaction = scope === "faction"
  const corps = useApi(() => vaultService.corps(scope), [scope])
  const [slug, setSlug] = useState("")
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<Filter>("")
  const [moving, setMoving] = useState<null | "deposit" | "withdraw">(null)

  useEffect(() => { if (!slug && corps.data?.items[0]) setSlug(corps.data.items[0].slug) }, [corps.data, slug])
  useEffect(() => setPage(1), [slug, filter])

  const detail = useApi(() => (slug ? vaultService.detail(slug, page, filter, scope) : Promise.resolve(null)), [slug, page, filter, scope])
  const refreshAll = () => { corps.refetch(); detail.refetch() }
  useLiveRefresh(refreshAll, ["vault-changed"], 120_000)

  const d = detail.data
  const noAccess = corps.data && corps.data.items.length === 0

  return (
    <>
      {corps.loading && !corps.data && <Skeleton className="h-40 w-full rounded-2xl" />}
      {corps.error && !corps.data && <ErrorState message={corps.error} onRetry={corps.refetch} />}
      {noAccess && <EmptyState icon={<Landmark className="size-5" />} title={isFaction ? "Nenhuma facção ativa" : "Sem acesso ao financeiro"} description={isFaction ? "As facções criadas no servidor aparecem aqui automaticamente, cada uma com o seu cofre." : "Peça a um líder uma patente com a permissão “Ver cofre e financeiro”."} />}

      {corps.data && corps.data.items.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SelectMenu value={slug} onValueChange={setSlug} options={corps.data.items.map(c => ({ value: c.slug, label: c.name, icon: <CorpAvatar name={c.name} icon={c.icon} color={c.color} size="sm" /> }))} className="w-64" triggerClassName="h-10" aria-label={isFaction ? "Facção" : "Corporação"} />
            {d?.canManage && (
              <div className="flex flex-wrap gap-2">
                <ChannelSettings slug={slug} scope={scope} current={d.financeChannelId} onSaved={detail.refetch} />
                <Button onClick={() => setMoving("deposit")}><ArrowDownLeft className="size-4" /> Depositar</Button>
                <Button variant="destructive" onClick={() => setMoving("withdraw")}><ArrowUpRight className="size-4" /> Levantar</Button>
              </div>
            )}
          </div>

          {detail.loading && !d && <Skeleton className="h-64 w-full rounded-2xl" />}
          {detail.error && !d && <ErrorState message={detail.error} onRetry={detail.refetch} />}

          {d && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="gap-1 px-5 md:col-span-1"><span className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium"><Wallet className="size-3.5" /> Saldo do cofre</span><span className="text-3xl font-bold tabular-nums">{formatMoney(d.balance)}</span></Card>
                <Card className="gap-1 px-5"><span className="text-muted-foreground text-xs font-medium">Depósitos (30 dias)</span><span className="text-2xl font-bold text-[#34d399] tabular-nums">{formatMoney(d.stats.deposits30d)}</span></Card>
                <Card className="gap-1 px-5"><span className="text-muted-foreground text-xs font-medium">Levantamentos (30 dias)</span><span className="text-2xl font-bold text-[#f0464f] tabular-nums">{formatMoney(d.stats.withdraws30d)}</span></Card>
              </div>

              <Card className="gap-3 px-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">Histórico de movimentos</h3>
                  <SelectMenu value={filter} onValueChange={v => setFilter(v as Filter)} placeholder="Todos os movimentos" options={[{ value: "deposit", label: "Só depósitos" }, { value: "withdraw", label: "Só levantamentos" }]} className="w-48" aria-label="Filtrar movimentos" />
                </div>

                {d.items.length === 0 && <EmptyState icon={<Landmark className="size-5" />} title="Sem movimentos" description="Os depósitos e levantamentos aparecem aqui assim que forem registrados." />}
                <div className="flex flex-col">
                  {d.items.map(t => (
                    <div key={t.id} className="border-border/60 flex items-center justify-between gap-3 border-b py-3 last:border-0">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", t.type === "deposit" ? "bg-[#34d399]/12 text-[#34d399]" : "bg-[#f0464f]/12 text-[#f0464f]")}>{t.type === "deposit" ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}</span>
                        <div className="min-w-0">
                          <p className="flex flex-wrap items-center gap-2 text-sm font-medium">{t.actorName}{t.source === "game" && <Badge variant="secondary"><Gamepad2 /> In-game</Badge>}</p>
                          <p className="text-muted-foreground truncate text-xs">{formatDateTime(t.createdAt)}{t.note && ` • ${t.note}`}</p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className={cn("text-sm font-bold tabular-nums", t.type === "deposit" ? "text-[#34d399]" : "text-[#f0464f]")}>{t.type === "deposit" ? "+" : "−"}{formatMoney(t.amount)}</p>
                        <p className="text-muted-foreground text-[11px] tabular-nums">saldo {formatMoney(t.balanceAfter)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {d.pages > 1 && <Pagination page={d.page} totalPages={d.pages} onChange={setPage} />}
              </Card>
            </>
          )}
          <MovementDialog slug={slug} scope={scope} type={moving} onClose={() => setMoving(null)} onDone={refreshAll} />
        </>
      )}
    </>
  )
}

export function FinancePage() {
  const { isAdmin, isStaff } = useAuth()
  const canSeeFactions = isAdmin || isStaff
  const [scope, setScope] = useState<VaultScope>("corp")

  return (
    <DashboardLayout title={scope === "faction" ? "Financeiro da Facção" : "Financeiro da Corporação"} description="Saldo do cofre e histórico completo de depósitos e levantamentos, em tempo real.">
      {canSeeFactions && (
        <div role="tablist" aria-label="Tipo de organização" className="border-border inline-flex w-fit gap-1 rounded-xl border bg-white/[0.03] p-1">
          {([["corp", "Corporações"], ["faction", "Facções"]] as const).map(([value, label]) => (
            <button
              key={value} role="tab" aria-selected={scope === value} onClick={() => setScope(value)}
              className={cn("rounded-lg px-4 py-1.5 text-sm font-medium transition-colors", scope === value ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground")}
            >
              {label}
            </button>
          ))}
        </div>
      )}
      <FinanceScopeView key={scope} scope={scope} />
    </DashboardLayout>
  )
}
