import { useEffect, useState } from "react"
import { Shield, UserCog } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input, Select } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { factionsService } from "@/services/factions.service"
import { ApiError } from "@/api/client"
import type { MemberStatus } from "@/types"
import type { Faction, FactionMember } from "@/types/factions"

interface Props { open: boolean; onOpenChange: (open: boolean) => void; faction: Faction; member: FactionMember; onDone: () => void }

const STATUS_OPTIONS: Array<{ value: MemberStatus; label: string }> = [
  { value: "active", label: "Ativo" }, { value: "away", label: "Afastado" }, { value: "suspended", label: "Suspenso" },
]

export function FactionMemberDialog({ open, onOpenChange, faction, member, onDone }: Props) {
  const [patenteId, setPatenteId] = useState("")
  const [status, setStatus] = useState<MemberStatus>("active")
  const [rpName, setRpName] = useState("")
  const [citizenId, setCitizenId] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fireOpen, setFireOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    setPatenteId(member.patenteId ?? ""); setStatus(member.status); setRpName(member.rpName); setCitizenId(member.citizenId); setReason(""); setError(null)
  }, [open, member])

  async function save() {
    setLoading(true)
    setError(null)
    try {
      await factionsService.updateMember(faction.slug, member.userId, { patenteId: patenteId || null, status, rpName, citizenId, reason })
      onDone()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar.")
    } finally {
      setLoading(false)
    }
  }

  async function fire() {
    await factionsService.fire(faction.slug, member.userId, reason || undefined)
    onDone()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="bg-primary/10 text-primary ring-primary/15 grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset"><UserCog className="size-[18px]" /></span>
              <div>
                <DialogTitle>{member.discordName ?? member.userId}</DialogTitle>
                <DialogDescription>Membro de {faction.name} desde {new Date(member.hiredAt).toLocaleDateString("pt-BR")}.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Select
              label="Patente" icon={<Shield className="size-4" />} value={patenteId} onChange={e => setPatenteId(e.target.value)} placeholder="Sem patente"
              options={faction.patentes.slice().sort((a, b) => b.order - a.order).map(p => ({ value: p._id, label: p.name }))}
            />
            <Select label="Status" value={status} onChange={e => setStatus(e.target.value as MemberStatus)} options={STATUS_OPTIONS} />
            <Input label="Nome no RP" value={rpName} onChange={e => setRpName(e.target.value)} />
            <Input label="ID do cidadão" value={citizenId} onChange={e => setCitizenId(e.target.value)} />
            <Input label="Motivo (opcional)" value={reason} onChange={e => setReason(e.target.value)} />
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
          </div>
          <DialogFooter className="sm:justify-between">
            <Button variant="destructive" onClick={() => setFireOpen(true)} disabled={loading}>Remover da facção</Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
              <Button onClick={save} disabled={loading}>{loading ? "Salvando..." : "Salvar"}</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={fireOpen} onOpenChange={setFireOpen} variant="destructive" title={`Remover ${member.discordName ?? member.userId}?`}
        description="O membro sai da facção e perde os cargos do Discord ligados a ela. A ação fica registrada no histórico."
        confirmLabel="Remover" loadingLabel="Removendo..." onConfirm={fire}
      />
    </>
  )
}
