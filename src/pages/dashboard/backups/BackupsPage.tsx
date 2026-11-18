import { useEffect, useState } from "react"
import { AlertTriangle, DatabaseBackup, Download, History, Loader2, RotateCcw, Server, Trash2 } from "lucide-react"
import { ApiError, assetUrl } from "@/api/client"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SelectMenu } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { Switch } from "@/components/ui/switch"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { formatBytes, formatDateTime } from "@/lib/modules"
import { backupsService } from "@/services/modules.service"
import type { BackupItem, BackupSchedule } from "@/types/modules"

const KIND_LABEL = { manual: "Manual", scheduled: "Agendado", "pre-restore": "Segurança pré-restauro" } as const
const SCOPE_LABEL = { panel: "Painel (MongoDB)", server: "Servidor (MySQL)" } as const
const INTERVALS = [6, 12, 24, 48, 168].map(hours => ({ value: String(hours), label: hours === 168 ? "A cada 7 dias" : `A cada ${hours} horas` }))

function StatusBadge({ item }: { item: BackupItem }) {
  if (item.status === "running") return <Badge variant="secondary"><Loader2 className="animate-spin" /> Gerando</Badge>
  if (item.status === "failed") return <Badge variant="destructive">Falhou</Badge>
  return <Badge variant="success">Concluído</Badge>
}

function ScheduleCard({ schedule, onSaved }: { schedule: BackupSchedule; onSaved: () => void }) {
  const [enabled, setEnabled] = useState(schedule.enabled)
  const [interval, setIntervalHours] = useState(String(schedule.intervalHours))
  const [keepLast, setKeepLast] = useState(String(schedule.keepLast))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    setEnabled(schedule.enabled)
    setIntervalHours(String(schedule.intervalHours))
    setKeepLast(String(schedule.keepLast))
  }, [schedule.enabled, schedule.intervalHours, schedule.keepLast])

  const dirty = enabled !== schedule.enabled || Number(interval) !== schedule.intervalHours || Number(keepLast) !== schedule.keepLast

  async function save() {
    setSaving(true)
    setMessage(null)
    try {
      await backupsService.saveSchedule({ enabled, intervalHours: Number(interval), keepLast: Number(keepLast) })
      setMessage({ ok: true, text: "Agenda salva." })
      onSaved()
    } catch (err) {
      setMessage({ ok: false, text: err instanceof ApiError ? err.message : "Não foi possível salvar." })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="gap-4 px-4 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Backup automático</h3>
          <p className="text-muted-foreground text-xs">Gera um ponto de restauro do painel no intervalo escolhido e apaga os mais antigos.</p>
        </div>
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Ativar backups automáticos" />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">Frequência</span>
          <SelectMenu value={interval} onValueChange={setIntervalHours} options={INTERVALS} disabled={!enabled} triggerClassName="h-10" aria-label="Frequência" />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-muted-foreground text-xs font-medium">Manter os últimos</span>
          <Input type="number" min={1} max={60} value={keepLast} onChange={event => setKeepLast(event.target.value)} disabled={!enabled} />
        </div>
        <Button onClick={save} disabled={!dirty || saving}>{saving ? "Salvando..." : "Salvar agenda"}</Button>
      </div>
      {schedule.enabled && schedule.lastRunAt > 0 && <p className="text-muted-foreground text-xs">Último backup automático: {formatDateTime(schedule.lastRunAt)}</p>}
      {message && <p className={`text-xs ${message.ok ? "text-accent" : "text-destructive"}`}>{message.text}</p>}
    </Card>
  )
}

function RestoreDialog({ item, onClose, onDone }: { item: BackupItem | null; onClose: () => void; onDone: () => void }) {
  const [text, setText] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (item) { setText(""); setError(null) } }, [item])

  async function restore() {
    if (!item) return
    setBusy(true)
    setError(null)
    try {
      await backupsService.restore(item.id, text)
      onDone()
      onClose()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível iniciar o restauro.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={!!item} onOpenChange={open => !busy && !open && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive size-5" /> Restaurar este backup?</DialogTitle>
          <DialogDescription>
            O banco do painel volta ao estado de {item ? formatDateTime(item.createdAt) : ""}. Tudo o que mudou depois (tickets, sugestões, movimentos do cofre, configurações) será substituído.
          </DialogDescription>
        </DialogHeader>
        <Alert>
          <AlertTitle>Rede de segurança</AlertTitle>
          <AlertDescription>Antes de apagar qualquer coisa, o sistema gera automaticamente um backup “Segurança pré-restauro” do estado atual. A tentativa é registrada no Discord.</AlertDescription>
        </Alert>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium">Digite <strong>RESTAURAR</strong> para confirmar</span>
          <Input value={text} onChange={event => setText(event.target.value)} placeholder="RESTAURAR" autoComplete="off" />
        </div>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>Cancelar</Button>
          <Button variant="destructive" onClick={restore} disabled={busy || text !== "RESTAURAR"}>{busy ? "Iniciando..." : "Restaurar agora"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function BackupsPage() {
  const { data, loading, error, refetch } = useApi(() => backupsService.list(), [])
  useLiveRefresh(refetch, ["backups-changed"], 30_000)

  const [creating, setCreating] = useState<null | "panel" | "server">(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [restoring, setRestoring] = useState<BackupItem | null>(null)
  const [removing, setRemoving] = useState<BackupItem | null>(null)

  async function create(scope: "panel" | "server") {
    setCreating(scope)
    setActionError(null)
    try {
      await backupsService.create(scope)
      refetch()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível iniciar o backup.")
    } finally {
      setCreating(null)
    }
  }

  const busy = data?.busy ?? false
  const lastBackup = data?.items.reduce<BackupItem | null>((latest, item) => (!latest || item.createdAt > latest.createdAt ? item : latest), null) ?? null

  return (
    <DashboardLayout
      title="Backups e Restauro"
      description="Pontos de restauro do banco do painel e do servidor. Área restrita à administração."
      actions={
        <>
          <Button onClick={() => create("panel")} disabled={busy || creating !== null}><DatabaseBackup className="size-4" /> Backup do painel</Button>
          <Button variant="outline" onClick={() => create("server")} disabled={busy || creating !== null}><Server className="size-4" /> Backup do servidor</Button>
        </>
      }
    >
      <Alert>
        <AlertTitle>Onde ficam guardados</AlertTitle>
        <AlertDescription>Os backups ficam no mesmo MongoDB do painel: protegem contra erros e perda de dados, mas não contra a perda do próprio banco. Use “Baixar” para guardar cópias fora.</AlertDescription>
      </Alert>

      {busy && <Alert><AlertDescription className="flex items-center gap-2"><Loader2 className="size-4 animate-spin" /> Há um backup ou restauro em andamento. A lista atualiza sozinha quando terminar.</AlertDescription></Alert>}
      {actionError && <Alert variant="destructive"><AlertDescription>{actionError}</AlertDescription></Alert>}

      {loading && !data && <Skeleton className="h-40 w-full rounded-2xl" />}
      {error && !data && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <>
          <ScheduleCard schedule={data.schedule} onSaved={refetch} />

          <Card className="gap-3 px-4 sm:px-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h3 className="flex items-center gap-2 text-lg font-semibold"><History className="size-4" /> Pontos de restauro</h3>
              {lastBackup && <p className="text-muted-foreground text-xs">Último backup: {formatDateTime(lastBackup.createdAt)} • {data.items.length} {data.items.length === 1 ? "ponto" : "pontos"}</p>}
            </div>
            {data.items.length === 0 && <EmptyState icon={<DatabaseBackup className="size-5" />} title="Nenhum backup ainda" description="Gere o primeiro ponto de restauro com os botões acima." />}
            <div className="scroll-dark flex max-h-[min(60vh,32rem)] flex-col pr-2 [&>*]:shrink-0">
              {data.items.map(item => (
                <div key={item.id} className="border-border/60 flex flex-col gap-3 border-b py-3.5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge item={item} />
                      <span className="text-sm font-medium">{SCOPE_LABEL[item.scope]}</span>
                      <Badge variant="outline">{KIND_LABEL[item.kind]}</Badge>
                      {item.restoredAt && <Badge variant="secondary">Restaurado em {formatDateTime(item.restoredAt)}</Badge>}
                    </div>
                    <p className="text-muted-foreground text-xs">
                      {formatDateTime(item.createdAt)} • por {item.createdByName}
                      {item.status === "completed" && ` • ${formatBytes(item.sizeBytes)} • ${item.totalRecords.toLocaleString("pt-BR")} registros em ${item.collectionCount} ${item.scope === "panel" ? "coleções" : "tabelas"}`}
                      {item.truncated && " • algumas tabelas truncadas em 200 mil linhas"}
                    </p>
                    {item.error && <p className="text-destructive text-xs">{item.error}</p>}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {item.status === "completed" && (
                      <>
                        <a href={assetUrl(backupsService.downloadUrl(item.id))} className={buttonVariants({ variant: "outline", size: "sm" })}><Download className="size-3.5" /> Baixar</a>
                        <Button variant="outline" size="sm" disabled={busy} onClick={() => setRestoring(item)}><RotateCcw className="size-3.5" /> Restaurar</Button>
                      </>
                    )}
                    {item.status !== "running" && <Button variant="destructive" size="icon" aria-label="Remover backup" onClick={() => setRemoving(item)}><Trash2 className="size-4" /></Button>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      <RestoreDialog item={restoring} onClose={() => setRestoring(null)} onDone={refetch} />
      <ConfirmDialog
        open={!!removing} onOpenChange={open => !open && setRemoving(null)} variant="destructive" confirmLabel="Remover"
        title="Remover este backup?" description="O arquivo é apagado de forma definitiva e a ação é registrada no Discord."
        onConfirm={async () => { await backupsService.remove(removing!.id); setRemoving(null); refetch() }}
      />
    </DashboardLayout>
  )
}
