import { useEffect, useRef } from "react"
import { onRealtime, type RealtimeEvents } from "@/lib/realtime-bus"

interface Handlers {
  onCatalog?: () => void
  onCoupons?: () => void
  onOrder?: (event: RealtimeEvents["store-order"]) => void
  onLog?: () => void
}

/**
 * Escuta os eventos da loja (catálogo, cupons, pedidos) e reconecta sozinho.
 * Rajadas de eventos são agrupadas (300 ms) para não disparar vários refetches seguidos.
 */
export function useStoreRealtime(handlers: Handlers) {
  const ref = useRef(handlers)
  ref.current = handlers

  useEffect(() => {
    const timers = new Map<string, ReturnType<typeof setTimeout>>()
    const debounce = (key: string, fn: () => void) => {
      clearTimeout(timers.get(key))
      timers.set(key, setTimeout(fn, 300))
    }

    const offs = [
      onRealtime("store-catalog", () => debounce("catalog", () => ref.current.onCatalog?.())),
      onRealtime("store-coupons", () => debounce("coupons", () => ref.current.onCoupons?.())),
      onRealtime("store-log", () => debounce("log", () => ref.current.onLog?.())),
      onRealtime("store-order", event => debounce(`order:${event.code}`, () => ref.current.onOrder?.(event))),
      onRealtime("stream-reconnected", () => {
        ref.current.onCatalog?.()
        ref.current.onCoupons?.()
        ref.current.onLog?.()
        ref.current.onOrder?.({ code: "*", status: "", delivery: "" })
      }),
    ]
    return () => {
      offs.forEach(off => off())
      timers.forEach(clearTimeout)
    }
  }, [])
}
