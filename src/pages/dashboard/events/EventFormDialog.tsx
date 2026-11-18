import { useEffect, useState } from "react"
import { ApiError } from "@/api/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input, Select } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EVENT_CATEGORIES, isoToLocalInput, localInputToIso } from "@/lib/community"
import { eventsService } from "@/services/community.service"
import type { EventCategory, RoleplayEvent } from "@/types"

const DESCRIPTION_MAX = 1500
const DATE_INPUT =
  "border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring/40 h-10 w-full rounded-xl border px-3 text-sm transition outline-none focus-visible:ring-3 [color-scheme:dark]"

interface Props {
  open: boolean
  event: RoleplayEvent | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

export function EventFormDialog({ open, event, onOpenChange, onSaved }: Props) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<EventCategory>("race")
  const [location, setLocation] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle(event?.title ?? "")
    setCategory(event?.category ?? "race")
    setLocation(event?.location ?? "")
    setStartsAt(isoToLocalInput(event?.startsAt))
    setEndsAt(isoToLocalInput(event?.endsAt))
    setDescription(event?.description ?? "")
    setError(null)
  }, [open, event])

  async function submit() {
    if (!startsAt) return setError("Informe a data e o horário de início.")
    setSaving(true)
    setError(null)
    try {
      const body = { title, category, location, description, startsAt: localInputToIso(startsAt), endsAt: endsAt ? localInputToIso(endsAt) : null }
      if (event) await eventsService.update(event.id, body)
      else await eventsService.create(body)
      onSaved()
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => !saving && onOpenChange(next)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{event ? "Editar evento" : "Agendar evento"}</DialogTitle>
          <DialogDescription>Aparece na hora na agenda de todos os jogadores. Cada mudança é registrada nos logs da staff.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Input label="Título" value={title} maxLength={100} onChange={e => setTitle(e.target.value)} placeholder="Ex.: Corrida clandestina — Circuito do Porto" />

          <div className="grid gap-4 sm:grid-cols-2">
            <Select label="Categoria" value={category} onChange={e => setCategory(e.target.value as EventCategory)} options={EVENT_CATEGORIES.map(c => ({ value: c.value, label: c.label }))} />
            <Input label="Local" value={location} maxLength={100} onChange={e => setLocation(e.target.value)} placeholder="Ex.: Porto de Los Santos" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-start">Início</Label>
              <input id="event-start" type="datetime-local" value={startsAt} onChange={e => setStartsAt(e.target.value)} className={DATE_INPUT} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-end">Término (opcional)</Label>
              <input id="event-end" type="datetime-local" value={endsAt} min={startsAt} onChange={e => setEndsAt(e.target.value)} className={DATE_INPUT} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="event-description">Descrição</Label>
            <Textarea id="event-description" rows={5} value={description} maxLength={DESCRIPTION_MAX} onChange={e => setDescription(e.target.value)} placeholder="Regras, premiação, como participar..." />
            <span className="text-muted-foreground text-right font-mono text-[11px] tabular-nums">
              {description.length}/{DESCRIPTION_MAX}
            </span>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" disabled={saving} onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button disabled={saving} onClick={submit}>
            {saving ? "Salvando..." : event ? "Salvar alterações" : "Agendar evento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
