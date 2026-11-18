import { useEffect, useState } from "react"
import { Megaphone } from "lucide-react"
import { ApiError } from "@/api/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { GlobalAnnouncementView } from "@/components/layout/GlobalAnnouncement"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardService } from "@/services/dashboard.service"
import type { AnnouncementTone } from "@/types"
import { Segmented } from "./Segmented"

const TEXT_MAX = 240

const TONES: Array<{ value: AnnouncementTone; label: string }> = [
  { value: "info", label: "Informação" },
  { value: "warning", label: "Atenção" },
  { value: "success", label: "Novidade" },
]

/** Faixa de aviso exibida no topo da Dashboard para todos os usuários (eventos, janelas de manutenção, novidades). */
export function AnnouncementSection() {
  const { dashboardConfig } = useAuth()
  const current = dashboardConfig.announcement
  const [enabled, setEnabled] = useState(current?.enabled ?? false)
  const [text, setText] = useState(current?.text ?? "")
  const [tone, setTone] = useState<AnnouncementTone>(current?.tone ?? "info")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setEnabled(current?.enabled ?? false)
    setText(current?.text ?? "")
    setTone(current?.tone ?? "info")
  }, [current?.enabled, current?.text, current?.tone])

  const dirty = enabled !== (current?.enabled ?? false) || text !== (current?.text ?? "") || tone !== (current?.tone ?? "info")

  async function save() {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      await dashboardService.updateConfig({ announcement: { enabled, text, tone } })
      setSaved(true)
      window.setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="gap-5 px-4 sm:px-6">
      <div>
        <div className="mb-1 flex flex-wrap items-center gap-2">
          <h3 className="flex items-center gap-2 font-semibold">
            <Megaphone className="size-4" />
            Aviso global
          </h3>
          <Badge variant={current?.enabled ? "success" : "secondary"}>{current?.enabled ? "No ar" : "Desligado"}</Badge>
        </div>
        <p className="text-muted-foreground text-xs leading-relaxed">Uma faixa no topo da Dashboard, visível para todos. Cada usuário pode dispensá-la; ao mudar o texto, ela volta a aparecer.</p>
      </div>

      <label className="border-border flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-white/[0.02] px-4 py-3.5">
        <span className="min-w-0">
          <span className="block text-sm font-medium">Exibir aviso</span>
          <span className="text-muted-foreground block text-xs">Liga ou desliga sem perder o texto.</span>
        </span>
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Exibir aviso global" />
      </label>

      <div className="flex flex-col gap-2">
        <Textarea value={text} maxLength={TEXT_MAX} rows={3} onChange={event => setText(event.target.value)} placeholder="Ex.: Evento especial neste sábado às 20h. Confira o canal #anúncios." aria-label="Texto do aviso global" />
        <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
          {text.length}/{TEXT_MAX}
        </span>
      </div>

      <Segmented label="Tipo do aviso" value={tone} onChange={setTone} options={TONES} />

      {text.trim() && (
        <div className="flex flex-col gap-2">
          <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">Pré-visualização</p>
          <GlobalAnnouncementView tone={tone} text={text.trim()} />
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-3">
        <Button type="button" className="w-fit" disabled={saving || !dirty} onClick={save}>
          {saving ? "Salvando..." : "Salvar aviso"}
        </Button>
        {saved && <p className="text-accent text-xs font-medium">Aviso atualizado para todos.</p>}
      </div>
    </Card>
  )
}
