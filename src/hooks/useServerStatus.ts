import { useEffect, useState } from "react"
import { onRealtime } from "@/lib/realtime-bus"
import { serverStatusService } from "@/services/modules.service"
import type { ServerStatus } from "@/types/modules"

export function useServerStatus() {
  const [status, setStatus] = useState<ServerStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const load = () =>
      serverStatusService.get().then(
        next => !cancelled && (setStatus(next), setError(null)),
        () => !cancelled && setError("Não foi possível consultar o servidor."),
      )

    void load()
    const offLive = onRealtime("server-status", next => setStatus(next))
    const offReconnect = onRealtime("stream-reconnected", () => void load())
    return () => {
      cancelled = true
      offLive()
      offReconnect()
    }
  }, [])

  return { status, error }
}
