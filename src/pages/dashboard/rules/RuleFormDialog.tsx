import { useEffect, useState } from "react"
import { ApiError } from "@/api/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { rulesService, type RuleItem } from "@/services/modules.service"
import { RuleText } from "./RuleText"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: string
  categoryLabel: string
  editing: RuleItem | null
  limits: { title: number; description: number }
  onSaved: () => void
}

export function RuleFormDialog({ open, onOpenChange, type, categoryLabel, editing, limits, onSaved }: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? "")
    setDescription(editing?.description ?? "")
    setError(null)
  }, [open, editing])

  async function submit() {
    setSaving(true)
    setError(null)
    try {
      if (editing) await rulesService.update(editing.id, { title, description })
      else await rulesService.create(type, { title, description })
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar a regra.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => !saving && onOpenChange(next)}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar regra" : "Nova regra"} • {categoryLabel}</DialogTitle>
          <DialogDescription>Vale na hora no site e nos painéis do bot. Aceita **negrito**, *itálico*, `código` e listas com “- ”.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">Título</span>
            <Input value={title} maxLength={limits.title} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Proibido RDM e VDM" autoFocus />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">Texto da regra</span>
            <Textarea rows={8} value={description} maxLength={limits.description} onChange={e => setDescription(e.target.value)} placeholder="Explique a regra e as punições aplicáveis." className="leading-6" />
            <span className="text-muted-foreground self-end font-mono text-[11px]">{description.length}/{limits.description}</span>
          </div>

          {(title || description) && (
            <div className="border-border/70 rounded-xl border bg-white/[0.02] p-4">
              <p className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">Pré-visualização</p>
              <h4 className="mb-1 text-base font-semibold">{title || "Sem título"}</h4>
              <RuleText text={description} />
            </div>
          )}

          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button onClick={submit} disabled={saving || title.trim().length < 3 || description.trim().length < 5}>{saving ? "Salvando..." : editing ? "Salvar alterações" : "Criar regra"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
