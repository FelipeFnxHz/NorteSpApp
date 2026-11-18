import { useEffect, useState } from "react"
import { ApiError } from "@/api/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input, Select } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CHANGELOG_CATEGORIES, isoToLocalInput, localInputToIso } from "@/lib/community"
import { changelogService } from "@/services/community.service"
import type { ChangelogCategory, ChangelogEntry } from "@/types"

const CONTENT_MAX = 4000

interface Props {
  open: boolean
  entry: ChangelogEntry | null
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}

/** Criar/editar uma entrada do mural. Publicar também envia o embed ao canal de atualizações do Discord. */
export function ChangelogFormDialog({ open, entry, onOpenChange, onSaved }: Props) {
  const [title, setTitle] = useState("")
  const [version, setVersion] = useState("")
  const [category, setCategory] = useState<ChangelogCategory>("feature")
  const [publishedAt, setPublishedAt] = useState("")
  const [content, setContent] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setTitle(entry?.title ?? "")
    setVersion(entry?.version ?? "")
    setCategory(entry?.category ?? "feature")
    setPublishedAt(isoToLocalInput(entry?.publishedAt))
    setContent(entry?.content ?? "")
    setError(null)
  }, [open, entry])

  async function submit() {
    setSaving(true)
    setError(null)
    try {
      const body = { title, version, category, content, ...(publishedAt ? { publishedAt: localInputToIso(publishedAt) } : {}) }
      if (entry) await changelogService.update(entry.id, body)
      else await changelogService.create(body)
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
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{entry ? "Editar publicação" : "Nova publicação"}</DialogTitle>
          <DialogDescription>
            {entry ? "A mensagem no canal de atualizações do Discord também é editada." : "Aparece na hora para toda a comunidade e é enviada ao canal de atualizações do Discord."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <Input label="Título" value={title} maxLength={100} onChange={event => setTitle(event.target.value)} placeholder="Ex.: Novos veículos importados" />

          <div className="grid gap-4 sm:grid-cols-3">
            <Input label="Versão do patch" value={version} maxLength={20} onChange={event => setVersion(event.target.value)} placeholder="1.4.2" />
            <Select
              label="Categoria"
              value={category}
              onChange={event => setCategory(event.target.value as ChangelogCategory)}
              options={CHANGELOG_CATEGORIES.map(item => ({ value: item.value, label: item.label }))}
            />
            <div className="flex flex-col gap-2">
              <Label htmlFor="changelog-date">Data (opcional)</Label>
              <input
                id="changelog-date"
                type="datetime-local"
                value={publishedAt}
                onChange={event => setPublishedAt(event.target.value)}
                className="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring/40 h-10 w-full rounded-xl border px-3 text-sm transition outline-none focus-visible:ring-3 [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="changelog-content">Descrição detalhada</Label>
            <Textarea
              id="changelog-content"
              rows={8}
              value={content}
              maxLength={CONTENT_MAX}
              onChange={event => setContent(event.target.value)}
              placeholder={"- Corrigido o bug do inventário\n- Novos carros na concessionária\n- Economia: imposto do banco reduzido"}
            />
            <span className="text-muted-foreground flex justify-between text-[11px]">
              <span>Dica: use “- ” no início da linha para criar uma lista.</span>
              <span className="font-mono tabular-nums">
                {content.length}/{CONTENT_MAX}
              </span>
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
            {saving ? "Salvando..." : entry ? "Salvar alterações" : "Publicar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
