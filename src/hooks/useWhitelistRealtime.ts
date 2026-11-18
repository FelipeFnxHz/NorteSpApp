import { useEffect, useRef } from "react"
import { onRealtime } from "@/lib/realtime-bus"

/**
 * Chama `onChange` sempre que a whitelist muda (nova candidatura, decisão, expiração).
 * Rajadas são agrupadas (300 ms) e, após uma queda da conexão, recarrega tudo.
 */
export function useWhitelistRealtime(onChange: () => void) {
  const ref = useRef(onChange)
  ref.current = onChange

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const schedule = () => {
      clearTimeout(timer)
      timer = setTimeout(() => ref.current(), 300)
    }
    const offs = [onRealtime("whitelist-changed", schedule), onRealtime("stream-reconnected", schedule)]
    return () => {
      offs.forEach(off => off())
      clearTimeout(timer)
    }
  }, [])
}
