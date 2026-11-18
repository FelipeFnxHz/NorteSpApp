import { useEffect, useRef } from "react"
import { onRealtime, type RealtimeEvents } from "@/lib/realtime-bus"

type LiveEvent = Exclude<keyof RealtimeEvents, "stream-reconnected">

/**
 * Mantém uma tela atualizada sem F5: recarrega quando chega um dos eventos SSE (rajadas agrupadas em 300 ms),
 * quando a conexão volta, quando a aba volta a ficar visível e, como rede de segurança para dados que mudam fora
 * da Dashboard (ex.: bans feitos direto no jogo), a cada `pollMs` enquanto a aba está aberta.
 */
export function useLiveRefresh(refetch: () => void, events: LiveEvent[], pollMs = 60_000) {
  const ref = useRef(refetch)
  ref.current = refetch
  const key = events.join(",")

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(() => ref.current(), 300)
    }

    const offs = [...events.map(event => onRealtime(event, schedule as never)), onRealtime("stream-reconnected", schedule)]
    const onVisible = () => document.visibilityState === "visible" && schedule()
    document.addEventListener("visibilitychange", onVisible)
    const poll = pollMs > 0 ? setInterval(() => document.visibilityState === "visible" && ref.current(), pollMs) : undefined

    return () => {
      offs.forEach(off => off())
      document.removeEventListener("visibilitychange", onVisible)
      clearTimeout(timer)
      if (poll) clearInterval(poll)
    }
  }, [key, pollMs])
}
