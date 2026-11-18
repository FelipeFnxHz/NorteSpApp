import { useState } from "react"
import { CalendarClock, Clock, X } from "lucide-react"
import { ApiError } from "@/api/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { formatCountdown, formatReturnAt, toLocalInputValue } from "@/lib/return-time"
import { dashboardService } from "@/services/dashboard.service"
import type { DashboardConfigFull } from "@/types"

const PRESETS: Array<{ label: string; minutes: number }> = [
  { label: "+30 min", minutes: 30 },
  { label: "+1 h", minutes: 60 },
  { label: "+2 h", minutes: 120 },
  { label: "+4 h", minutes: 240 },
]

/** Previsão de retorno: aparece na tela de manutenção/offline e, opcionalmente, recoloca a Dashboard online sozinha. */
export function ReturnScheduleSection({ config, onChanged }: { config: DashboardConfigFull; onChanged: () => void }) {
  const [value, setValue] = useState<string | null>(null)
  const [auto, setAuto] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)

  const savedValue = toLocalInputValue(config.returnAt)
  const current = value ?? savedValue
  const currentAuto = auto ?? config.autoReturn
  const dirty = current !== savedValue || currentAuto !== config.autoReturn
  const currentEpoch = current ? new Date(current).getTime() : null
  const active = config.status !== "online"

  function applyPreset(minutes: number) {
    setValue(toLocalInputValue(Date.now() + minutes * 60_000))
    setSaved(null)
  }

  async function save(next: { returnAt: number | null; autoReturn: boolean }, okText: string) {
    setSaving(true)
    setError(null)
    setSaved(null)
    try {
      await dashboardService.updateSettings(next)
      setValue(null)
      setAuto(null)
      setSaved(okText)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.")
    } finally {
      setSaving(false)
    }
  }

  function submit() {
    if (!currentEpoch || Number.isNaN(currentEpoch)) return setError("Escolha a data e o horário de retorno.")
    if (currentEpoch <= Date.now()) return setError("O horário precisa estar no futuro.")
    void save({ returnAt: currentEpoch, autoReturn: currentAuto }, "Previsão de retorno salva.")
  }

  return (
    <div className="border-border mt-6 flex flex-col gap-4 border-t pt-6">
      <div>
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          <CalendarClock className="size-4" />
          Previsão de retorno
        </h4>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
          Mostrada aos membros na tela de manutenção ou offline.
          {!active && " Fica guardada, mas só aparece quando a Dashboard sair do ar."}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {saved && (
        <Alert variant="success">
          <AlertDescription className="text-accent/90">{saved}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-[minmax(0,280px)_1fr] sm:items-end">
        <div className="flex flex-col gap-2">
          <label htmlFor="return-at" className="text-sm font-medium">
            Data e horário
          </label>
          <input
            id="return-at"
            type="datetime-local"
            value={current}
            onChange={event => {
              setValue(event.target.value)
              setSaved(null)
            }}
            className="border-input bg-input/30 focus-visible:border-ring focus-visible:ring-ring/40 h-10 w-full rounded-xl border px-3 text-sm transition outline-none focus-visible:ring-3 [color-scheme:dark]"
          />
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Atalhos de horário">
          {PRESETS.map(preset => (
            <Button key={preset.minutes} type="button" size="sm" variant="outline" onClick={() => applyPreset(preset.minutes)}>
              <Clock className="size-3.5" />
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {currentEpoch && currentEpoch > Date.now() && (
        <p className="text-muted-foreground text-xs">
          Os membros verão: <strong className="text-foreground font-semibold">volta {formatReturnAt(currentEpoch)}</strong>
          {formatCountdown(currentEpoch) && ` (${formatCountdown(currentEpoch)})`}.
        </p>
      )}

      <label className="border-border flex cursor-pointer items-center justify-between gap-4 rounded-xl border bg-white/[0.02] px-4 py-3.5">
        <span className="min-w-0">
          <span className="block text-sm font-medium">Voltar automaticamente</span>
          <span className="text-muted-foreground block text-xs">Ao chegar no horário, a Dashboard fica online sem ninguém precisar clicar.</span>
        </span>
        <Switch
          checked={currentAuto}
          disabled={saving || !current}
          onCheckedChange={next => {
            setAuto(next)
            setSaved(null)
          }}
          aria-label="Voltar automaticamente"
        />
      </label>

      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" disabled={!dirty || saving || !current} onClick={submit}>
          {saving ? "Salvando..." : "Salvar previsão"}
        </Button>
        {(config.returnAt || current) && (
          <Button
            size="sm"
            variant="outline"
            disabled={saving}
            onClick={() => (config.returnAt ? save({ returnAt: null, autoReturn: false }, "Previsão removida.") : (setValue(null), setAuto(null)))}
          >
            <X className="size-3.5" />
            Remover previsão
          </Button>
        )}
      </div>
    </div>
  )
}
