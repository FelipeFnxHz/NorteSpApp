import { useState } from "react"
import { Building2, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input, Select } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useApi } from "@/hooks/useApi"
import { dashboardService } from "@/services/dashboard.service"
import { corporationsService } from "@/services/corporations.service"
import { ApiError } from "@/api/client"
import { DEFAULT_CORP_COLOR } from "@/lib/corpTheme"
import { CorpAppearanceFields } from "@/components/corporations/CorpAppearanceFields"

interface CreateCorporationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function CreateCorporationDialog({ open, onOpenChange, onCreated }: CreateCorporationDialogProps) {
  const { data: rolesData } = useApi(() => dashboardService.roles(), [open])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState("")
  const [color, setColor] = useState(DEFAULT_CORP_COLOR)
  const [approvedRole, setApprovedRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function reset() {
    setName("")
    setDescription("")
    setIcon("")
    setColor(DEFAULT_CORP_COLOR)
    setApprovedRole("")
    setError(null)
  }

  async function handleSubmit() {
    setError(null)

    if (!name.trim()) {
      setError("Informe o nome da corporação.")
      return
    }

    setLoading(true)
    try {
      await corporationsService.create({ name, description, icon, color, approvedRole: approvedRole || undefined })
      reset()
      onCreated()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao criar corporação.")
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
            <span className="bg-primary/10 text-primary ring-primary/15 grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset">
              <Building2 className="size-[18px]" />
            </span>
            <div>
              <DialogTitle>Nova corporação</DialogTitle>
              <DialogDescription>Crie uma organização do servidor — sem precisar mexer em código.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <CorpAppearanceFields name={name} icon={icon} color={color} onIconChange={setIcon} onColorChange={setColor} />

          <Input label="Nome" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Defesa Civil" />
          <Input
            label="Descrição"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Uma frase curta sobre a corporação"
          />
          <Select
            label="Cargo padrão ao contratar"
            icon={<Shield className="size-4" />}
            value={approvedRole}
            onChange={e => setApprovedRole(e.target.value)}
            placeholder="Nenhum cargo aplicado automaticamente"
            hint="Aplicado a qualquer membro contratado nessa corporação, além da patente escolhida na contratação."
            options={(rolesData?.roles ?? []).map(role => ({ value: role.id, label: role.name }))}
          />

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
            {loading ? "Criando..." : "Criar corporação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
