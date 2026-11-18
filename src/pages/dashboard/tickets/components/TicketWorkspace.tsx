import { useEffect, useState } from "react"
import { BellRing, Check, CheckCircle2, Clock3, ExternalLink, FileText, Hand, LogOut, Trash2, UserCheck, UserRound, X } from "lucide-react"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Link } from "@/components/ui/link"
import { Skeleton } from "@/components/ui/skeleton"
import { ToneIcon } from "@/components/ui/tone-icon"
import { cn } from "@/lib/utils"
import { ApiError } from "@/api/client"
import { useApi } from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { useTicketRealtime } from "@/hooks/useTicketRealtime"
import { ticketsService } from "@/services/tickets.service"
import { categoryMeta, formatDateTime } from "../ticket-meta"
import { TicketChat } from "./TicketChat"

function InfoRow({ icon: Icon, label, value }: { icon: typeof UserRound; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 text-xs">
      <span className="text-muted-foreground flex shrink-0 items-center gap-1.5">
        <Icon className="size-3.5" />
        {label}
      </span>
      <strong className="text-right font-medium break-words">{value}</strong>
    </div>
  )
}

interface TicketWorkspaceProps {
  codigo: string | null
  onClose: () => void
  onDeleted: () => void
}

export function TicketWorkspace({ codigo, onClose, onDeleted }: TicketWorkspaceProps) {
  const { user, isStaff } = useAuth()
  const { data, loading, refetch } = useApi(
    () => (codigo ? ticketsService.detail(codigo) : Promise.resolve(null)),
    [codigo],
  )
  const [busy, setBusy] = useState<"claim" | "drop" | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [notify, setNotify] = useState<"idle" | "sending" | "sent">("idle")
  const [confirm, setConfirm] = useState<"close" | "delete" | null>(null)
  const [tab, setTab] = useState<"chat" | "info">("chat")
  const detail = data?.ticket

  useTicketRealtime({
    onChanged: event => {
      if (event.codigo !== codigo) return
      if (event.reason === "deleted") onClose()
      else refetch()
    },
    onReconnect: refetch,
  })

  async function run(action: "claim" | "drop") {
    if (!codigo) return
    setBusy(action)
    setActionError(null)
    try {
      await (action === "claim" ? ticketsService.claim(codigo) : ticketsService.drop(codigo))
      refetch()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível concluir a ação.")
    } finally {
      setBusy(null)
    }
  }

  async function notifyOwner() {
    if (!codigo || notify !== "idle") return
    setNotify("sending")
    setActionError(null)
    try {
      await ticketsService.notifyOwner(codigo)
      setNotify("sent")
      setTimeout(() => setNotify("idle"), 4000)
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Não foi possível notificar o dono do ticket.")
      setNotify("idle")
    }
  }

  useEffect(() => {
    setTab("chat")
    setNotify("idle")
  }, [codigo])

  const isOpen = detail?.status === "open"
  const meta = categoryMeta(detail?.type ?? "support")
  const claimedByMe = !!detail?.claimedBy && detail.claimedBy === user?.id

  return (
    <>
      <Dialog open={!!codigo} onOpenChange={open => !open && onClose()}>
        <DialogContent showCloseButton={false} className="h-[min(92dvh,800px)] max-w-5xl gap-0 overflow-hidden p-0 sm:p-0">
          <DialogDescription className="sr-only">Chat e gerenciamento do ticket</DialogDescription>
          <div className="flex h-full min-h-0 flex-col">
            <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5 sm:px-5">
              <ToneIcon icon={meta.icon} tone={meta.tone} className="size-10" iconClassName="size-[18px]" />
              <div className="min-w-0">
                <DialogTitle className="font-mono text-base">{codigo}</DialogTitle>
                <p className="text-muted-foreground truncate text-xs">{detail ? `${detail.typeLabel} · ${detail.motivo}` : "Carregando..."}</p>
              </div>
              {detail && (
                <Badge variant={isOpen ? "success" : "secondary"} className="ml-auto shrink-0">
                  {isOpen ? "Aberto" : "Fechado"}
                </Badge>
              )}
              <DialogClose
                aria-label="Fechar"
                className={cn(
                  "text-muted-foreground hover:text-foreground grid size-9 shrink-0 place-items-center rounded-lg transition-colors outline-none hover:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-white/20",
                  !detail && "ml-auto",
                )}
              >
                <X className="size-4" />
              </DialogClose>
            </header>

            <div className="flex shrink-0 gap-1 border-b border-white/10 p-1.5 md:hidden" role="tablist">
              {(["chat", "info"] as const).map(item => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  onClick={() => setTab(item)}
                  className={cn(
                    "h-9 flex-1 rounded-lg text-xs font-semibold transition-colors",
                    tab === item ? "bg-white/[0.08] text-foreground" : "text-muted-foreground",
                  )}
                >
                  {item === "chat" ? "Conversa" : "Detalhes"}
                </button>
              ))}
            </div>

            <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_300px]">
              <div className={cn("min-h-0", tab !== "chat" && "max-md:hidden")}>
                {codigo && <TicketChat codigo={codigo} canReply={isOpen ?? false} />}
              </div>

              <aside className={cn("min-h-0 overflow-y-auto p-4 md:border-l md:border-white/10 [scrollbar-width:thin]", tab !== "info" && "max-md:hidden")}>
                {loading && <Skeleton className="h-40 w-full" />}
                {detail && (
                  <div className="flex flex-col gap-4">
                    <div className="divide-y divide-white/[0.06]">
                      <InfoRow icon={UserRound} label="Aberto por" value={detail.userName} />
                      <InfoRow icon={UserCheck} label="Responsável" value={detail.claimedByName ?? "Não atribuído"} />
                      {detail.closedByName && <InfoRow icon={CheckCircle2} label="Fechado por" value={detail.closedByName} />}
                      <InfoRow icon={Clock3} label="Criado em" value={formatDateTime(detail.createdAt)} />
                      <InfoRow icon={FileText} label="Origem" value={detail.source === "dashboard" ? "Dashboard" : "Discord"} />
                    </div>

                    {detail.answers.length > 0 && (
                      <div className="flex flex-col gap-2.5">
                        <h3 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">Ficha de atendimento</h3>
                        {detail.answers.map(answer => (
                          <div key={answer.label} className="text-xs">
                            <span className="text-muted-foreground block">{answer.label}</span>
                            <span className="break-words whitespace-pre-wrap">{answer.value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {detail.attachments.length > 0 && (
                      <div className="flex flex-col gap-2">
                        <h3 className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase">Provas anexadas</h3>
                        <div className="grid grid-cols-3 gap-1.5">
                          {detail.attachments.map(url => (
                            <a key={url} href={url} target="_blank" rel="noreferrer" className="hover:border-white/30 aspect-square overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                              <img src={url} alt="" loading="lazy" className="size-full object-cover" onError={event => (event.currentTarget.style.display = "none")} />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {actionError && <p className="text-destructive text-xs">{actionError}</p>}

                    <div className="flex flex-col gap-2">
                      {isOpen && isStaff && !detail.claimedBy && (
                        <Button size="sm" disabled={busy !== null} onClick={() => run("claim")}>
                          <Hand className="size-4" />
                          {busy === "claim" ? "Assumindo..." : "Assumir atendimento"}
                        </Button>
                      )}
                      {isOpen && isStaff && detail.claimedBy && (
                        <Button size="sm" variant="outline" disabled={busy !== null || !(claimedByMe || user?.role === "admin")} onClick={() => run("drop")}>
                          <LogOut className="size-4" />
                          {busy === "drop" ? "Largando..." : "Largar atendimento"}
                        </Button>
                      )}
                      {isOpen && isStaff && (
                        <Button size="sm" variant="outline" disabled={notify !== "idle"} onClick={notifyOwner}>
                          {notify === "sent" ? <Check className="text-accent size-4" /> : <BellRing className="size-4" />}
                          {notify === "sending" ? "Notificando..." : notify === "sent" ? "Dono notificado" : "Notificar dono"}
                        </Button>
                      )}
                      {isOpen && isStaff && (
                        <Button size="sm" variant="destructive" onClick={() => setConfirm("close")}>
                          <CheckCircle2 className="size-4" />
                          Finalizar ticket
                        </Button>
                      )}
                      {detail.channelUrl && (
                        <a href={detail.channelUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                          <ExternalLink className="size-4" />
                          Abrir no Discord
                        </a>
                      )}
                      {detail.transcriptUrl && (
                        <Link to={`/dashboard/transcripts?codigo=${encodeURIComponent(detail.codigo)}`} className="text-primary inline-flex items-center gap-1.5 text-xs font-semibold hover:underline">
                          Ver transcript completo
                          <ExternalLink className="size-3" />
                        </Link>
                      )}
                      {isStaff && !isOpen && (
                        <Button size="sm" variant="destructive" onClick={() => setConfirm("delete")}>
                          <Trash2 className="size-4" />
                          Excluir ticket
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </aside>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirm === "close"}
        onOpenChange={open => !open && setConfirm(null)}
        variant="destructive"
        title={`Finalizar o ticket ${codigo}?`}
        description="O transcript será gerado, o solicitante receberá o resumo e a avaliação por DM e o canal será excluído do Discord."
        confirmLabel="Finalizar ticket"
        loadingLabel="Finalizando..."
        onConfirm={async () => {
          if (!codigo) return
          await ticketsService.close(codigo)
          setConfirm(null)
          refetch()
        }}
      />

      <ConfirmDialog
        open={confirm === "delete"}
        onOpenChange={open => !open && setConfirm(null)}
        variant="destructive"
        title={`Excluir ticket ${codigo}?`}
        description="O ticket é removido permanentemente da lista. Se já houver um transcript gerado, ele continua disponível."
        confirmLabel="Excluir ticket"
        loadingLabel="Excluindo..."
        onConfirm={async () => {
          if (!codigo) return
          await ticketsService.remove(codigo)
          setConfirm(null)
          onDeleted()
        }}
      />
    </>
  )
}
