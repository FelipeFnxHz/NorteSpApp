import { useState } from "react"
import { CircleAlert, Info, Sparkles, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { cn } from "@/lib/utils"
import type { AnnouncementTone } from "@/types"

const TONE_STYLE: Record<AnnouncementTone, { icon: typeof Info; box: string; icon_: string }> = {
  info: { icon: Info, box: "border-primary/25 bg-primary/10", icon_: "text-primary" },
  warning: { icon: CircleAlert, box: "border-destructive/25 bg-destructive/10", icon_: "text-destructive" },
  success: { icon: Sparkles, box: "border-accent/25 bg-accent/10", icon_: "text-accent" },
}

export function GlobalAnnouncementView({ tone, text, onDismiss }: { tone: AnnouncementTone; text: string; onDismiss?: () => void }) {
  const style = TONE_STYLE[tone]
  return (
    <div role="status" className={cn("flex items-start gap-3 rounded-xl border px-4 py-3 text-sm", style.box)}>
      <style.icon className={cn("mt-0.5 size-4 shrink-0", style.icon_)} />
      {/* Texto puro: nada é interpretado como HTML. */}
      <p className="min-w-0 flex-1 leading-relaxed break-words whitespace-pre-line">{text}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} aria-label="Dispensar aviso" className="text-muted-foreground hover:text-foreground -m-1 grid size-7 shrink-0 place-items-center rounded-lg transition-colors hover:bg-white/[0.06]">
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}

const STORAGE_KEY = "dashboard:announcement-dismissed"

function readDismissed() {
  try {
    return sessionStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

/** Faixa global definida em Configurações → Aparência → Global do servidor. Dispensar vale só nesta sessão do navegador. */
export function GlobalAnnouncement() {
  const { dashboardConfig } = useAuth()
  const announcement = dashboardConfig.announcement
  const [dismissed, setDismissed] = useState(readDismissed)

  if (!announcement?.enabled || !announcement.text) return null

  // O texto entra na chave: mudar o aviso faz a faixa reaparecer para quem tinha dispensado.
  const signature = `${announcement.tone}:${announcement.text}`
  if (dismissed === signature) return null

  function dismiss() {
    try {
      sessionStorage.setItem(STORAGE_KEY, signature)
    } catch {}
    setDismissed(signature)
  }

  return (
    <div className="mb-6">
      <GlobalAnnouncementView tone={announcement.tone} text={announcement.text} onDismiss={dismiss} />
    </div>
  )
}
