import { useState } from "react"
import { Check, Clock3, Loader2, ShieldCheck, ShieldX } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnswerTextarea } from "@/components/ui/answer-textarea"
import { AnswerList } from "@/components/ui/answer-list"
import { whitelistService } from "@/services/whitelist.service"
import { ApiError } from "@/api/client"
import { cn } from "@/lib/utils"
import type { WhitelistPendingItem } from "@/types"

type Decision = "approve" | "reject"

const DECISIONS: Array<{ value: Decision; title: string; hint: string; icon: typeof ShieldCheck; tone: string }> = [
  {
    value: "approve",
    title: "Aprovar",
    hint: "Libera o cargo e avisa por DM",
    icon: ShieldCheck,
    tone: "border-accent/50 bg-accent/[0.07] text-accent",
  },
  {
    value: "reject",
    title: "Reprovar",
    hint: "Envia o motivo por DM",
    icon: ShieldX,
    tone: "border-destructive/50 bg-destructive/[0.07] text-destructive",
  },
]

export function WhitelistReviewDialog({
  item,
  resolved = false,
  onOpenChange,
  onReviewed,
}: {
  item: WhitelistPendingItem | null
  /** Outro membro da staff já decidiu esta candidatura (chegou pelo tempo real). */
  resolved?: boolean
  onOpenChange: (open: boolean) => void
  onReviewed: () => void
}) {
  const [decision, setDecision] = useState<Decision | null>(null)
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setDecision(null)
    setReason("")
    setError(null)
  }

  const needsReason = decision === "reject"
  const canConfirm = !!decision && (!needsReason || reason.trim().length > 0) && !busy && !resolved

  async function confirm() {
    if (!item || !decision) return
    setError(null)
    setBusy(true)
    try {
      if (decision === "approve") await whitelistService.approve(item._id, reason.trim() || undefined)
      else await whitelistService.reject(item._id, reason.trim())
      reset()
      onReviewed()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao registrar a decisão.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog
      open={!!item}
      onOpenChange={open => {
        if (!open) {
          reset()
          onOpenChange(false)
        }
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          {/* pr-10: reserva o canto do botão "X" (absoluto) para que ele nunca fique sobre o status/data. */}
          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-3 pr-10">
            <Avatar className="size-12 shrink-0 ring-1 ring-white/10">
              {item?.avatar && <AvatarImage src={item.avatar} alt="" />}
              <AvatarFallback>{(item?.displayName ?? "??").slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 basis-40 text-left">
              <DialogTitle className="truncate">{item?.displayName}</DialogTitle>
              <DialogDescription className="truncate">@{item?.username}</DialogDescription>
            </div>
            <div className="flex shrink-0 items-center gap-2.5 max-sm:w-full max-sm:justify-between sm:flex-col sm:items-end sm:gap-1.5">
              <Badge variant="secondary">
                <Clock3 className="size-3" />
                Pendente
              </Badge>
              {item && (
                <span className="text-muted-foreground text-[11px] whitespace-nowrap tabular-nums">
                  {new Date(item.createdAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}
                </span>
              )}
            </div>
          </div>
        </DialogHeader>

        {resolved && (
          <Alert>
            <AlertDescription>Esta candidatura já foi analisada por outro membro da staff. Feche e confira a fila atualizada.</AlertDescription>
          </Alert>
        )}

        {item && (
          <section aria-label="Respostas do candidato" className="flex flex-col gap-2.5">
            <h4 className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">
              Respostas · {item.answers.length}
            </h4>
            <AnswerList answers={item.answers} className="max-h-[min(20rem,42dvh)]" />
          </section>
        )}

        <section className="flex flex-col gap-3" aria-label="Decisão">
          <h4 className="text-muted-foreground text-[11px] font-semibold tracking-[0.12em] uppercase">Sua decisão</h4>
          <div className="grid grid-cols-2 gap-2.5">
            {DECISIONS.map(option => {
              const selected = decision === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setDecision(option.value)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all",
                    selected ? option.tone : "border-border text-muted-foreground hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]",
                  )}
                >
                  <option.icon className="size-5 shrink-0" />
                  <span className="min-w-0">
                    <span className={cn("block text-sm font-semibold", !selected && "text-foreground")}>{option.title}</span>
                    <span className="text-muted-foreground block truncate text-[11px]">{option.hint}</span>
                  </span>
                  {selected && <Check className="ml-auto size-4 shrink-0" strokeWidth={3} />}
                </button>
              )
            })}
          </div>

          {decision && (
            <div className="animate-fade-up flex flex-col gap-2">
              <label className="text-xs font-semibold">
                {needsReason ? "Motivo da reprovação" : "Mensagem para o candidato (opcional)"}
                {needsReason && <span className="text-destructive ml-1">*</span>}
              </label>
              <AnswerTextarea
                value={reason}
                onChange={setReason}
                maxLength={400}
                rows={3}
                placeholder={needsReason ? "Ex: Respostas muito curtas — tente de novo com mais detalhes." : "Ex: Bem-vindo à cidade!"}
              />
              <p className="text-muted-foreground text-[11px]">Enviado ao candidato por mensagem direta.</p>
            </div>
          )}
        </section>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant={decision === "reject" ? "destructive" : "default"}
            disabled={!canConfirm}
            onClick={confirm}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {busy ? "Registrando..." : decision === "reject" ? "Confirmar reprovação" : decision === "approve" ? "Confirmar aprovação" : "Escolha uma decisão"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
