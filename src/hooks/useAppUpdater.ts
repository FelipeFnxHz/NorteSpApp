import { useCallback, useEffect, useRef, useState } from "react"
import type { Update } from "@tauri-apps/plugin-updater"
import { checkForUpdate, installUpdate, UPDATE_CHECK_DELAY_MS, UPDATE_CHECK_INTERVAL_MS } from "@/lib/updater"

export function useAppUpdater() {
  const [update, setUpdate] = useState<Update | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const installingRef = useRef(false)
  const knownVersion = useRef<string | null>(null)

  const runCheck = useCallback(async () => {
    if (installingRef.current) return

    try {
      const found = await checkForUpdate()
      if (!found) return

      // Uma versão nova reabre o aviso mesmo que a anterior tenha sido dispensada.
      if (found.version !== knownVersion.current) {
        knownVersion.current = found.version
        setDismissed(false)
      }
      setUpdate(found)
    } catch (err) {
      // Sem rede ou endpoint indisponível: tenta de novo no próximo ciclo.
      console.error("[updater] erro no ciclo de verificação:", err)
    }
  }, [])

  useEffect(() => {
    const first = setTimeout(runCheck, UPDATE_CHECK_DELAY_MS)
    const loop = setInterval(runCheck, UPDATE_CHECK_INTERVAL_MS)
    return () => {
      clearTimeout(first)
      clearInterval(loop)
    }
  }, [runCheck])

  const install = useCallback(async () => {
    if (!update || installingRef.current) return

    installingRef.current = true
    setInstalling(true)
    setError(null)
    setProgress(null)

    try {
      await installUpdate(update, setProgress)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível instalar a atualização.")
      installingRef.current = false
      setInstalling(false)
    }
  }, [update])

  const dismiss = useCallback(() => setDismissed(true), [])

  return { update, visible: !!update && !dismissed, installing, progress, error, install, dismiss }
}
