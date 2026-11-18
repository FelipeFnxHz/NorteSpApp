import { useEffect, useState } from "react"
import { Crown, Shield, Swords } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input, Select } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CorpAppearanceFields } from "@/components/corporations/CorpAppearanceFields"
import { useApi } from "@/hooks/useApi"
import { dashboardService } from "@/services/dashboard.service"
import { factionsService } from "@/services/factions.service"
import { ApiError } from "@/api/client"
import { DEFAULT_CORP_COLOR } from "@/lib/corpTheme"
import type { Faction } from "@/types/factions"

interface FactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  faction?: Faction
  onSaved: () => void
}

export function FactionDialog({ open, onOpenChange, faction, onSaved }: FactionDialogProps) {
  const editing = Boolean(faction)
  const { data: rolesData } = useApi(() => dashboardService.roles(), [open])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("")
  const [color, setColor] = useState(DEFAULT_CORP_COLOR)
  const [approvedRole, setApprovedRole] = useState("")
  const [leaderId, setLeaderId] = useState("")
  const [leaderName, setLeaderName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(faction?.name ?? "")
    setDescription(faction?.description ?? "")
    setIcon(faction?.icon ?? "")
    setColor(faction?.color ?? DEFAULT_CORP_COLOR)
    setApprovedRole(faction?.approvedRole ?? "")
    setLeaderId(faction?.leaderId ?? "")
    setLeaderName(faction?.leaderName ?? "")
    setError(null)
  }, [open, faction])

  async function handleSubmit() {
    setError(null)
    if (!name.trim()) return setError("Informe o nome da facção.")
    if (leaderId.trim() && !/^\d{15,25}$/.test(leaderId.trim())) return setError("ID do Discord do líder inválido (só números).")

    const body = { name, description, icon, color, approvedRole, leaderId: leaderId.trim(), leaderName }
    setLoading(true)
    try {
      if (faction) await factionsService.update(faction.slug, body)
      else await factionsService.create(body)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar a facção.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="bg-primary/10 text-primary ring-primary/15 grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset">
              <Swords className="size-[18px]" />
            </span>
            <div>
              <DialogTitle>{editing ? `Editar ${faction!.name}` : "Nova facção"}</DialogTitle>
              <DialogDescription>
                {editing ? "Atualize os dados da facção." : "Facções criadas no jogo aparecem sozinhas aqui; use este formulário só para cadastros manuais."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <CorpAppearanceFields name={name} icon={icon} color={color} onIconChange={setIcon} onColorChange={setColor} />
          <Input label="Nome" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Comando Norte" />
          <Input label="Descrição" value={description} onChange={e => setDescription(e.target.value)} placeholder="Uma frase curta sobre a facção" />
          <Input
            label="Líder (ID do Discord)"
            icon={<Crown className="text-muted-foreground size-4" />}
            value={leaderId}
            onChange={e => setLeaderId(e.target.value)}
            placeholder="Opcional — ex: 123456789012345678"
          />
          <Input label="Líder (nome no jogo)" value={leaderName} onChange={e => setLeaderName(e.target.value)} placeholder="Opcional" />
          <Select
            label="Cargo do Discord da facção"
            icon={<Shield className="size-4" />}
            value={approvedRole}
            onChange={e => setApprovedRole(e.target.value)}
            placeholder="Nenhum cargo aplicado automaticamente"
            hint="Aplicado a todo membro adicionado e removido quando ele sai da facção."
            options={(rolesData?.roles ?? []).map(role => ({ value: role.id, label: role.name }))}
          />
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Salvando..." : editing ? "Salvar" : "Criar facção"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
