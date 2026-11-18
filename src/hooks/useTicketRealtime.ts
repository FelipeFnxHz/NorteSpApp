import { useEffect, useRef } from "react"
import { onRealtime, type RealtimeEvents } from "@/lib/realtime-bus"

interface Handlers {
  onChanged?: (event: RealtimeEvents["ticket-changed"]) => void
  onMessage?: (event: RealtimeEvents["ticket-message"]) => void
  onReconnect?: () => void
}

/** Assina os eventos SSE de tickets enquanto o componente estiver montado. */
export function useTicketRealtime(handlers: Handlers) {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    const offs = [
      onRealtime("ticket-changed", event => ref.current.onChanged?.(event)),
      onRealtime("ticket-message", event => ref.current.onMessage?.(event)),
      onRealtime("stream-reconnected", () => ref.current.onReconnect?.()),
    ]
    return () => offs.forEach(off => off())
  }, [])
}
