import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { ApiError } from "@/api/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { dashboardService } from "@/services/dashboard.service"

/** Recarrega membros/presenças do Discord. Limitado a uma vez por minuto no servidor. */
export function SyncCard({ cooldownSeconds, cachedMembers, onDone }: { cooldownSeconds: number; cachedMembers: number; onDone: () => void }) {
  const [syncing, setSyncing] = useState(false)
  const [wait, setWait] = useState(cooldownSeconds)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  useEffect(() => {
    if (wait <= 0) return
    const id = window.setTimeout(() => setWait(value => value - 1), 1000)
    return () => window.clearTimeout(id)
  }, [wait])

  async function sync() {
    setSyncing(true)
    setMessage(null)
    try {
      const result = await dashboardService.syncServer()
      setMessage({ ok: true, text: `${result.members.toLocaleString("pt-BR")} membros sincronizados em ${(result.durationMs / 1000).toFixed(1)}s.` })
      setWait(60)
      onDone()
    } catch (err) {
      setMessage({ ok: false, text: err instanceof ApiError ? err.message : "Não foi possível sincronizar." })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <Card className="px-4 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-semibold">
            <RefreshCw className="size-4" />
            Sincronização com o Discord
          </h3>
          <p className="text-muted-foreground mt-1 max-w-xl text-xs leading-relaxed">
            Recarrega membros, cargos e presenças. Use se o “Staff online” ou as contagens parecerem defasados. Atualmente há {cachedMembers.toLocaleString("pt-BR")} membros em cache.
          </p>
        </div>
        <Button type="button" variant="outline" disabled={syncing || wait > 0} onClick={sync}>
          <RefreshCw className={syncing ? "animate-spin" : ""} />
          {syncing ? "Sincronizando..." : wait > 0 ? `Aguarde ${wait}s` : "Sincronizar agora"}
        </Button>
      </div>

      {message && (
        <Alert variant={message.ok ? "success" : "destructive"}>
          <AlertDescription className={message.ok ? "text-accent/90" : undefined}>{message.text}</AlertDescription>
        </Alert>
      )}
    </Card>
  )
}
