import { useEffect, useState } from "react"
import { ArrowDownCircle, ArrowUpCircle, Ban, Clock3, Loader2, PlayCircle, RotateCcw, ScrollText, Trash2, UserMinus, UserPlus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, Input } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { ErrorState } from "@/components/ui/states"
import { useApi } from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { corporationsService } from "@/services/corporations.service"
import { ApiError } from "@/api/client"
import type { Corporation, MemberStatus } from "@/types"

const ACTION_META: Record<string, { label: string; icon: typeof UserPlus; tone: string }> = {
  hire: { label: "Contratação", icon: UserPlus, tone: "text-accent" },
  promote: { label: "Promoção", icon: ArrowUpCircle, tone: "text-accent" },
  demote: { label: "Rebaixamento", icon: ArrowDownCircle, tone: "text-primary" },
  transfer: { label: "Transferência de patente", icon: ScrollText, tone: "text-muted-foreground" },
  warn: { label: "Advertência", icon: Ban, tone: "text-primary" },
  suspend: { label: "Suspensão", icon: Ban, tone: "text-destructive" },
  unsuspend: { label: "Reativação", icon: RotateCcw, tone: "text-accent" },
  away: { label: "Afastamento", icon: Clock3, tone: "text-primary" },
  return: { label: "Retorno ao serviço", icon: PlayCircle, tone: "text-accent" },
  fire: { label: "Demissão", icon: UserMinus, tone: "text-destructive" },
  edit: { label: "Dados atualizados", icon: ScrollText, tone: "text-muted-foreground" },
}

const STATUS_LABEL: Record<MemberStatus, { label: string; variant: "success" | "secondary" | "destructive" }> = {
  active: { label: "Ativo", variant: "success" },
  away: { label: "Afastado", variant: "secondary" },
  suspended: { label: "Suspenso", variant: "destructive" },
}

function StatusButton({ id, icon: Icon, label, busyLabel, onClick, destructive, busyKey }: {
  id: string
  icon: typeof Clock3
  label: string
  busyLabel: string
  onClick: () => void
  destructive?: boolean
  busyKey: string | null
}) {
  const active = busyKey === id
  return (
    <Button size="sm" variant={destructive ? "destructive" : "outline"} disabled={busyKey !== null} onClick={onClick}>
      {active ? <Loader2 className="size-3.5 animate-spin" /> : <Icon className="size-3.5" />}
      {active ? busyLabel : label}
    </Button>
  )
}

interface MemberProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  corporation: Corporation
  userId: string
  onChanged: () => void
}

export function MemberProfileDialog({ open, onOpenChange, corporation, userId, onChanged }: MemberProfileDialogProps) {
  const { hasCorpPermission } = useAuth()
  const canManage = hasCorpPermission(corporation.slug, "manage_members")
  const canFire = hasCorpPermission(corporation.slug, "fire")
  const { data, loading, error, refetch } = useApi(
    () => corporationsService.memberDetail(corporation.slug, userId),
    [corporation.slug, userId],
  )

  const [patenteId, setPatenteId] = useState<string | null>(null)
  const [reason, setReason] = useState("")
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<"fire" | "suspend" | null>(null)
  const [confirmedStatus, setConfirmedStatus] = useState<MemberStatus | null>(null)

  useEffect(() => setConfirmedStatus(null), [data])

  const member = data?.member
  const currentStatus: MemberStatus = confirmedStatus ?? member?.status ?? "active"
  const status = STATUS_LABEL[currentStatus]
  const currentPatente = patenteId ?? member?.patenteId ?? ""
  const patente = corporation.patentes.find(p => p._id === member?.patenteId)
  const memberName = member?.discordName ?? userId

  function afterChange() {
    onChanged()
    refetch()
    setReason("")
  }

  async function changeStatus(key: string, nextStatus: MemberStatus) {
    setActionError(null)
    setBusyKey(key)
    try {
      const result = await corporationsService.setMemberStatus(corporation.slug, userId, {
        status: nextStatus,
        reason: reason || undefined,
      })
      setConfirmedStatus(result.member.status)
      afterChange()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível alterar o status.")
    } finally {
      setBusyKey(null)
    }
  }

  async function savePatente() {
    if (!member) return
    const sorted = corporation.patentes.slice().sort((a, b) => a.order - b.order)
    const currentOrder = sorted.find(p => p._id === member.patenteId)?.order ?? -1
    const newOrder = sorted.find(p => p._id === currentPatente)?.order ?? -1

    setActionError(null)
    setBusyKey("patente")
    try {
      await corporationsService.updateMember(corporation.slug, userId, {
        patenteId: currentPatente || null,
        action: newOrder > currentOrder ? "promote" : "demote",
        reason: reason || undefined,
      })
      afterChange()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível salvar a patente.")
    } finally {
      setBusyKey(null)
    }
  }

  async function confirmFire() {
    await corporationsService.fire(corporation.slug, userId, reason || undefined)
    setConfirming(null)
    onChanged()
    onOpenChange(false)
  }

  async function confirmSuspend() {
    const result = await corporationsService.setMemberStatus(corporation.slug, userId, {
      status: "suspended",
      reason: reason || undefined,
    })
    setConfirmedStatus(result.member.status)
    setConfirming(null)
    afterChange()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Perfil do membro</DialogTitle>
          <DialogDescription>{corporation.name}</DialogDescription>
        </DialogHeader>

        {loading && !member && <Skeleton className="h-64 w-full" />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {member && (
          <div className="flex flex-col gap-5">
            <div className="border-border flex flex-wrap items-center gap-3 rounded-xl border bg-white/[0.02] p-3.5">
              <Avatar className="size-12 ring-1 ring-white/10">
                {member.discordAvatar && <AvatarImage src={member.discordAvatar} alt="" />}
                <AvatarFallback>{memberName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold">{memberName}</p>
                <p className="text-muted-foreground truncate text-xs">@{member.discordUsername ?? "-"}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <Badge variant={status.variant} className="transition-colors">
                  {status.label}
                </Badge>
                {patente && (
                  <Badge variant="outline" className="text-[11px] font-normal">
                    {patente.name}
                  </Badge>
                )}
              </div>
            </div>

            {(canManage || canFire) && (
              <div className="border-border flex flex-col gap-3.5 rounded-xl border bg-white/[0.02] p-3.5">
                <span className="text-muted-foreground text-xs font-semibold">Ações</span>
                {canManage && (
                <>
                <Select
                  value={currentPatente}
                  onChange={e => setPatenteId(e.target.value)}
                  placeholder="Sem patente"
                  options={corporation.patentes
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map(p => ({ value: p._id, label: p.name }))}
                />
                </>
                )}
                <Input placeholder="Motivo (opcional)" value={reason} onChange={e => setReason(e.target.value)} />

                {actionError && (
                  <Alert variant="destructive">
                    <AlertDescription>{actionError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-wrap gap-2">
                  {canManage && (<>
                  <StatusButton busyKey={busyKey} id="patente" icon={ArrowUpCircle} label="Salvar patente" busyLabel="Salvando..." onClick={savePatente} />

                  {/* Only the transitions that make sense from the current status. */}
                  {currentStatus === "active" && (
                    <StatusButton busyKey={busyKey} id="away" icon={Clock3} label="Marcar afastado" busyLabel="Afastando..." onClick={() => changeStatus("away", "away")} />
                  )}
                  {currentStatus === "away" && (
                    <StatusButton busyKey={busyKey} id="return" icon={PlayCircle} label="Retornar ao serviço" busyLabel="Retornando..." onClick={() => changeStatus("return", "active")} />
                  )}
                  {currentStatus !== "suspended" && (
                    <StatusButton busyKey={busyKey} id="suspend" icon={Ban} label="Suspender" busyLabel="Suspendendo..." onClick={() => setConfirming("suspend")} />
                  )}
                  {currentStatus === "suspended" && (
                    <StatusButton busyKey={busyKey} id="unsuspend" icon={RotateCcw} label="Reativar" busyLabel="Reativando..." onClick={() => changeStatus("unsuspend", "active")} />
                  )}

                  </>)}

                  {canFire && (
                    <StatusButton busyKey={busyKey} id="fire" icon={Trash2} label="Demitir" busyLabel="Demitindo..." destructive onClick={() => setConfirming("fire")} />
                  )}
                </div>
              </div>
            )}

            {!data?.historyHidden && (
            <div>
              <h4 className="text-muted-foreground mb-3 flex items-center gap-2 text-xs font-semibold">
                <ScrollText className="size-3.5" />
                Histórico
              </h4>

              {data?.history.length === 0 && (
                <p className="text-muted-foreground border-border rounded-lg border border-dashed p-4 text-center text-sm">
                  Nenhum evento registrado.
                </p>
              )}

              <div className="max-h-56 overflow-y-auto">
                <ol className="border-border relative flex flex-col gap-4 border-l pl-5">
                  {data?.history.map(entry => {
                    const meta = ACTION_META[entry.action] ?? { label: entry.action, icon: ScrollText, tone: "text-muted-foreground" }
                    return (
                      <li key={entry._id} className="relative">
                        <span className={`bg-card border-border absolute top-0.5 -left-[25px] grid size-5 place-items-center rounded-full border ${meta.tone}`}>
                          <meta.icon className="size-3" />
                        </span>
                        <p className="text-sm font-medium">{meta.label}</p>
                        {entry.reason && <p className="text-muted-foreground mt-0.5 text-xs">{entry.reason}</p>}
                        <p className="text-muted-foreground/70 mt-0.5 text-[11px]">
                          {new Date(entry.createdAt).toLocaleString("pt-BR")}
                        </p>
                      </li>
                    )
                  })}
                </ol>
              </div>
            </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={confirming === "fire"}
        onOpenChange={next => !next && setConfirming(null)}
        variant="destructive"
        title={`Demitir ${memberName}?`}
        description={`${memberName} será removido de ${corporation.name} e perderá os cargos do Discord dessa corporação. A demissão fica registrada no histórico.`}
        confirmLabel="Demitir"
        loadingLabel="Demitindo..."
        onConfirm={confirmFire}
      >
        {reason && <p className="text-muted-foreground text-sm">Motivo: {reason}</p>}
      </ConfirmDialog>

      <ConfirmDialog
        open={confirming === "suspend"}
        onOpenChange={next => !next && setConfirming(null)}
        title={`Suspender ${memberName}?`}
        description="A suspensão fica registrada no histórico. Você pode reativar o membro depois."
        confirmLabel="Suspender"
        loadingLabel="Suspendendo..."
        onConfirm={confirmSuspend}
      >
        {reason && <p className="text-muted-foreground text-sm">Motivo: {reason}</p>}
      </ConfirmDialog>
    </Dialog>
  )
}
