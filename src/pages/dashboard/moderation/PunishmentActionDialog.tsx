import { useEffect, useState } from "react"
import { Select } from "@/components/ui/form"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Textarea } from "@/components/ui/textarea"
import { punishmentsService } from "@/services/community.service"

export type PunishmentAction = "ban" | "unban" | "warn"

const DURATIONS = [
  { value: "24", label: "1 dia" },
  { value: "72", label: "3 dias" },
  { value: "168", label: "7 dias" },
  { value: "360", label: "15 dias" },
  { value: "720", label: "30 dias" },
  { value: "2160", label: "90 dias" },
  { value: "permanent", label: "Permanente" },
]

const COPY: Record<PunishmentAction, { title: (name: string) => string; description: string; confirm: string; loading: string; destructive: boolean }> = {
  ban: {
    title: name => `Banir ${name}?`,
    description: "O ban é gravado direto no banco do servidor e vale imediatamente. Um log detalhado é enviado ao Discord.",
    confirm: "Aplicar banimento",
    loading: "Banindo...",
    destructive: true,
  },
  unban: {
    title: name => `Remover o ban de ${name}?`,
    description: "Todos os banimentos desta conta são removidos do banco do servidor. Um log detalhado é enviado ao Discord.",
    confirm: "Remover banimento",
    loading: "Removendo...",
    destructive: false,
  },
  warn: {
    title: name => `Advertir ${name}?`,
    description: "A advertência fica no histórico do jogador, visível para ele na Dashboard, e é registrada nos logs.",
    confirm: "Aplicar advertência",
    loading: "Registrando...",
    destructive: false,
  },
}

interface Props {
  action: PunishmentAction | null
  /** Identificador digitado na busca (License, Discord ou Citizen ID). */
  target: string
  targetName: string
  onClose: () => void
  onDone: () => void
}

/** Confirmação com motivo obrigatório (e duração, no ban). Erros do servidor aparecem dentro do próprio modal. */
export function PunishmentActionDialog({ action, target, targetName, onClose, onDone }: Props) {
  const [reason, setReason] = useState("")
  const [duration, setDuration] = useState("permanent")

  useEffect(() => {
    if (action) {
      setReason("")
      setDuration("permanent")
    }
  }, [action])

  if (!action) return null
  const copy = COPY[action]

  return (
    <ConfirmDialog
      open
      onOpenChange={next => !next && onClose()}
      variant={copy.destructive ? "destructive" : "default"}
      title={copy.title(targetName)}
      description={copy.description}
      confirmLabel={copy.confirm}
      loadingLabel={copy.loading}
      onConfirm={async () => {
        const text = reason.trim()
        if (text.length < 5) throw new Error("Informe um motivo com pelo menos 5 caracteres.")
        if (action === "ban") await punishmentsService.ban({ target, reason: text, durationHours: duration === "permanent" ? null : Number(duration) })
        else if (action === "unban") await punishmentsService.unban({ target, reason: text })
        else await punishmentsService.warn({ target, reason: text })
        onDone()
        onClose()
      }}
    >
      <div className="grid gap-3">
        {action === "ban" && <Select label="Duração" value={duration} onChange={event => setDuration(event.target.value)} options={DURATIONS} />}
        <Textarea
          value={reason}
          rows={4}
          maxLength={500}
          autoFocus
          onChange={event => setReason(event.target.value)}
          placeholder="Motivo (obrigatório) — aparece para o jogador e nos logs"
          aria-label="Motivo"
        />
      </div>
    </ConfirmDialog>
  )
}
