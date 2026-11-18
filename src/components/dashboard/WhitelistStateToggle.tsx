import { useEffect, useState } from "react"
import { Lock, LockOpen } from "lucide-react"
import { ApiError, http } from "@/api/client"
import { Switch } from "@/components/ui/switch"
import { onRealtime } from "@/lib/realtime-bus"
import { cn } from "@/lib/utils"

export function useWhitelistOpen() {
  const [open, setOpen] = useState<boolean | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = () => http.get<{ open: boolean }>("/api/whitelist/state").then(r => !cancelled && setOpen(r.open), () => {})
    void load()
    const off = onRealtime("whitelist-status", payload => setOpen(payload.open))
    const offReconnect = onRealtime("stream-reconnected", () => void load())
    return () => { cancelled = true; off(); offReconnect() }
  }, [])

  return open
}

export function WhitelistStatusPill({ open }: { open: boolean | null }) {
  if (open === null) return null
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", open ? "border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]" : "border-[#f0464f]/30 bg-[#f0464f]/10 text-[#f0464f]")}>
      {open ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
      {open ? "Whitelist Aberta" : "Whitelist Fechada"}
    </span>
  )
}

export function WhitelistStateToggle() {
  const open = useWhitelistOpen()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function toggle(next: boolean) {
    setSaving(true)
    setError(null)
    try {
      await http.put<{ open: boolean }>("/api/whitelist/state", { open: next })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível alterar o estado.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="border-border/70 bg-foreground/[0.03] flex items-center gap-3 rounded-full border py-1 pr-3 pl-1.5">
        <WhitelistStatusPill open={open} />
        <Switch checked={open ?? false} disabled={open === null || saving} onCheckedChange={toggle} aria-label="Abrir ou fechar a whitelist" />
      </div>
      {error && <span className="text-destructive text-xs">{error}</span>}
    </div>
  )
}
