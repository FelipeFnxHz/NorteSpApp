import { useState } from "react"
import { Hash, Shield, UserPlus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input, Select } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { corporationsService } from "@/services/corporations.service"
import { ApiError } from "@/api/client"
import type { Corporation } from "@/types"

interface HireMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  corporation: Corporation
  onHired: () => void
}

export function HireMemberDialog({ open, onOpenChange, corporation, onHired }: HireMemberDialogProps) {
  const [userId, setUserId] = useState("")
  const [patenteId, setPatenteId] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setUserId("")
    setPatenteId("")
    setReason("")
    setError(null)
  }

  async function handleSubmit() {
    setError(null)

    if (!/^\d{15,25}$/.test(userId.trim())) {
      setError("Informe um ID do Discord válido (só números).")
      return
    }

    setLoading(true)
    try {
      await corporationsService.hire(corporation.slug, {
        userId: userId.trim(),
        patenteId: patenteId || undefined,
        reason: reason || undefined,
      })
      reset()
      onHired()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao contratar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="bg-accent/12 text-accent ring-accent/20 grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset">
              <UserPlus className="size-[18px]" />
            </span>
            <div>
              <DialogTitle>Contratar em {corporation.name}</DialogTitle>
              <DialogDescription>
                Aplica o cargo padrão da corporação (e o da patente, se ela tiver um) e registra no histórico.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <Input
            label="ID do Discord"
            icon={<Hash className="text-muted-foreground size-4" />}
            value={userId}
            onChange={e => setUserId(e.target.value)}
            placeholder="Ex: 123456789012345678"
            hint={'Ative o Modo Desenvolvedor no Discord e clique em "Copiar ID" no perfil da pessoa.'}
          />

          {corporation.patentes.length > 0 && (
            <Select
              label="Patente inicial"
              icon={<Shield className="size-4" />}
              value={patenteId}
              onChange={e => setPatenteId(e.target.value)}
              placeholder="Sem patente inicial"
              options={corporation.patentes
                .slice()
                .sort((a, b) => b.order - a.order)
                .map(p => ({ value: p._id, label: p.name }))}
            />
          )}

          <Input label="Motivo (opcional)" value={reason} onChange={e => setReason(e.target.value)} placeholder="Ex: Indicação do coronel" />

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Contratando..." : "Contratar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
