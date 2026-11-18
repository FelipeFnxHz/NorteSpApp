import { useState } from "react"
import { Hash, Shield, UserPlus } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input, Select } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { factionsService } from "@/services/factions.service"
import { ApiError } from "@/api/client"
import type { Faction } from "@/types/factions"

interface Props { open: boolean; onOpenChange: (open: boolean) => void; faction: Faction; onDone: () => void }

export function HireFactionMemberDialog({ open, onOpenChange, faction, onDone }: Props) {
  const [userId, setUserId] = useState("")
  const [patenteId, setPatenteId] = useState("")
  const [rpName, setRpName] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() { setUserId(""); setPatenteId(""); setRpName(""); setReason(""); setError(null) }

  async function submit() {
    if (!/^\d{15,25}$/.test(userId.trim())) return setError("Informe um ID do Discord válido (só números).")
    setLoading(true)
    setError(null)
    try {
      await factionsService.hire(faction.slug, { userId: userId.trim(), patenteId: patenteId || undefined, rpName: rpName || undefined, reason: reason || undefined })
      reset()
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao adicionar o membro.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => { if (!next) reset(); onOpenChange(next) }}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="bg-accent/12 text-accent ring-accent/20 grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset"><UserPlus className="size-[18px]" /></span>
            <div>
              <DialogTitle>Adicionar à {faction.name}</DialogTitle>
              <DialogDescription>Aplica o cargo da facção (e o da patente, se tiver) e registra no histórico.</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Input label="ID do Discord" icon={<Hash className="text-muted-foreground size-4" />} value={userId} onChange={e => setUserId(e.target.value)} placeholder="Ex: 123456789012345678" />
          {faction.patentes.length > 0 && (
            <Select
              label="Patente inicial" icon={<Shield className="size-4" />} value={patenteId} onChange={e => setPatenteId(e.target.value)} placeholder="Sem patente inicial"
              options={faction.patentes.slice().sort((a, b) => b.order - a.order).map(p => ({ value: p._id, label: p.name }))}
            />
          )}
          <Input label="Nome no RP (opcional)" value={rpName} onChange={e => setRpName(e.target.value)} />
          <Input label="Motivo (opcional)" value={reason} onChange={e => setReason(e.target.value)} />
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={submit} disabled={loading}>{loading ? "Adicionando..." : "Adicionar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
