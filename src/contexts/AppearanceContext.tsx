import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "@/contexts/RouterContext"
import { CACHE_KEY } from "@/lib/appearance"
import { onRealtime } from "@/lib/realtime-bus"
import { preferencesService } from "@/services/preferences.service"
import {
  DEFAULT_APPEARANCE,
  applyAppearance,
  clearAppearance,
  prefsEqual,
  readCachedPrefs,
  sanitizePrefs,
  writeCachedPrefs,
  type AppearancePrefs,
} from "@/lib/appearance"

export type SaveState = "idle" | "saving" | "saved" | "error"

interface AppearanceContextValue {
  prefs: AppearancePrefs
  saveState: SaveState
  update: (patch: Partial<AppearancePrefs>) => void
  reset: () => void
}

const AppearanceContext = createContext<AppearanceContextValue | null>(null)

const SAVE_DEBOUNCE_MS = 350

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const { path } = useRouter()
  const [prefs, setPrefs] = useState<AppearancePrefs>(() => readCachedPrefs())
  const [saveState, setSaveState] = useState<SaveState>("idle")

  const prefsRef = useRef(prefs)
  const pendingRef = useRef<Partial<AppearancePrefs>>({})
  const timerRef = useRef<number | null>(null)
  const savedTimerRef = useRef<number | null>(null)
  const lastServerRef = useRef<AppearancePrefs | null>(null)

  useEffect(() => {
    if (status !== "anonymous") return
    try {
      localStorage.removeItem(CACHE_KEY)
    } catch {
      // ignora
    }
    prefsRef.current = DEFAULT_APPEARANCE
    setPrefs(DEFAULT_APPEARANCE)
  }, [status])

  const inDashboard = path.startsWith("/dashboard")
  const authenticated = status === "authenticated"

  const commit = useCallback((next: AppearancePrefs, options: { animate?: boolean } = {}) => {
    prefsRef.current = next
    setPrefs(next)
    writeCachedPrefs(next)
    applyAppearance(next, options)
  }, [])

  // Aplica no <html> só dentro da dashboard; landing e login ficam na identidade padrão.
  useEffect(() => {
    if (inDashboard && authenticated) applyAppearance(prefs)
    else if (!inDashboard) clearAppearance()
  }, [inDashboard, authenticated, prefs])

  // "Sistema": acompanha o modo claro/escuro do aparelho em tempo real.
  useEffect(() => {
    if (prefs.theme !== "system") return
    const media = window.matchMedia("(prefers-color-scheme: light)")
    const onChange = () => {
      if (inDashboard) applyAppearance(prefsRef.current, { animate: true })
    }
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [prefs.theme, inDashboard])

  // O servidor é a fonte da verdade: ao entrar, carrega as preferências salvas no perfil.
  useEffect(() => {
    if (!authenticated) return
    let cancelled = false
    preferencesService
      .get()
      .then(({ appearance }) => {
        if (cancelled) return
        const server = sanitizePrefs(appearance)
        lastServerRef.current = server
        if (!prefsEqual(server, prefsRef.current)) commit(server)
      })
      .catch(() => null)
    return () => {
      cancelled = true
    }
  }, [authenticated, commit])

  // Mudou em outra aba/dispositivo → reflete aqui na hora, sem F5.
  useEffect(
    () =>
      onRealtime("preferences-changed", ({ appearance }) => {
        const incoming = sanitizePrefs(appearance)
        lastServerRef.current = incoming
        if (!prefsEqual(incoming, prefsRef.current)) commit(incoming, { animate: true })
      }),
    [commit],
  )

  const flush = useCallback(async () => {
    timerRef.current = null
    const patch = pendingRef.current
    pendingRef.current = {}
    if (Object.keys(patch).length === 0) return

    setSaveState("saving")
    try {
      const { appearance } = await preferencesService.save(patch)
      lastServerRef.current = sanitizePrefs(appearance)
      setSaveState("saved")
      if (savedTimerRef.current) window.clearTimeout(savedTimerRef.current)
      savedTimerRef.current = window.setTimeout(() => setSaveState("idle"), 2200)
    } catch {
      // Falha ao salvar: volta ao último estado confirmado pelo servidor.
      setSaveState("error")
      if (lastServerRef.current) commit(lastServerRef.current)
    }
  }, [commit])

  const update = useCallback(
    (patch: Partial<AppearancePrefs>) => {
      commit({ ...prefsRef.current, ...patch }, { animate: "theme" in patch })
      pendingRef.current = { ...pendingRef.current, ...patch }
      setSaveState("saving")
      if (timerRef.current) window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => void flush(), SAVE_DEBOUNCE_MS)
    },
    [commit, flush],
  )

  const reset = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    pendingRef.current = {}
    commit(DEFAULT_APPEARANCE, { animate: true })
    setSaveState("saving")
    preferencesService
      .reset()
      .then(() => {
        lastServerRef.current = DEFAULT_APPEARANCE
        setSaveState("saved")
        savedTimerRef.current = window.setTimeout(() => setSaveState("idle"), 2200)
      })
      .catch(() => setSaveState("error"))
  }, [commit])

  const value = useMemo(() => ({ prefs, saveState, update, reset }), [prefs, saveState, update, reset])

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>
}

export function useAppearance(): AppearanceContextValue {
  const ctx = useContext(AppearanceContext)
  if (!ctx) throw new Error("useAppearance must be used within an AppearanceProvider")
  return ctx
}
