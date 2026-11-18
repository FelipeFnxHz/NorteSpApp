import { useEffect, useState } from "react"
import { Pencil, Shield } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input, Select } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useApi } from "@/hooks/useApi"
import { dashboardService } from "@/services/dashboard.service"
import { corporationsService, type CreateCorporationBody } from "@/services/corporations.service"
import { ApiError } from "@/api/client"
import { resolveCorpColor } from "@/lib/corpTheme"
import { CorpAppearanceFields } from "@/components/corporations/CorpAppearanceFields"
import type { Corporation } from "@/types"

interface EditCorporationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  corporation: Corporation
  onSaved: () => void
}

export function EditCorporationDialog({ open, onOpenChange, corporation, onSaved }: EditCorporationDialogProps) {
  const { data: rolesData } = useApi(() => dashboardService.roles(), [open])
  const [name, setName] = useState(corporation.name)
  const [description, setDescription] = useState(corporation.description ?? "")
  const [icon, setIcon] = useState(corporation.icon ?? "")
  const [color, setColor] = useState(resolveCorpColor(corporation.color))
  const [approvedRole, setApprovedRole] = useState(corporation.approvedRole ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(corporation.name)
    setDescription(corporation.description ?? "")
    setIcon(corporation.icon ?? "")
    setColor(resolveCorpColor(corporation.color))
    setApprovedRole(corporation.approvedRole ?? "")
    setError(null)
  }, [open, corporation])

  async function handleSubmit() {
    setError(null)

    if (!name.trim()) {
      setError("Informe o nome da corporação.")
      return
    }

    const body: Partial<CreateCorporationBody> = {}
    if (name.trim() !== corporation.name) body.name = name.trim()
    if (description !== (corporation.description ?? "")) body.description = description
    if (icon !== (corporation.icon ?? "")) body.icon = icon
    if (color !== resolveCorpColor(corporation.color)) body.color = color
    if (approvedRole !== (corporation.approvedRole ?? "")) body.approvedRole = approvedRole

    if (Object.keys(body).length === 0) {
      onOpenChange(false)
      return
    }

    setLoading(true)
    try {
      await corporationsService.update(corporation.slug, body)
      onSaved()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar corporação.")
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
              <Pencil className="size-[18px]" />
            </span>
            <div>
              <DialogTitle>Editar {corporation.name}</DialogTitle>
              <DialogDescription>Mudar o nome não altera o endereço da página nem os membros atuais.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <CorpAppearanceFields name={name} icon={icon} color={color} onIconChange={setIcon} onColorChange={setColor} />

          <Input label="Nome" value={name} onChange={e => setName(e.target.value)} />
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
            hint="Vale para as próximas contratações. Quem já foi contratado não é alterado."
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
            {loading ? "Salvando..." : "Salvar alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
