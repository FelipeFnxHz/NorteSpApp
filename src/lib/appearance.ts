export type Theme = "dark" | "light" | "system"
export type AccentKey = "amber" | "blue" | "violet" | "emerald" | "rose" | "cyan" | "orange" | "pink" | "custom"
export type Density = "comfortable" | "compact"
export type Radius = "sharp" | "default" | "round"
export type FontSize = "small" | "default" | "large"

export interface AppearancePrefs {
  theme: Theme
  accent: AccentKey
  customAccent: string
  density: Density
  radius: Radius
  fontSize: FontSize
  reduceMotion: boolean
}

export const DEFAULT_APPEARANCE: AppearancePrefs = {
  theme: "dark",
  accent: "amber",
  customAccent: "#f5b94a",
  density: "comfortable",
  radius: "default",
  fontSize: "default",
  reduceMotion: false,
}

export const CACHE_KEY = "norte.appearance.v1"

interface AccentPreset {
  label: string
  hue: number
  chroma: number
}

export const ACCENT_PRESETS: Record<Exclude<AccentKey, "custom">, AccentPreset> = {
  amber: { label: "Âmbar", hue: 78, chroma: 0.16 },
  blue: { label: "Azul", hue: 255, chroma: 0.17 },
  violet: { label: "Violeta", hue: 295, chroma: 0.18 },
  emerald: { label: "Esmeralda", hue: 160, chroma: 0.15 },
  rose: { label: "Rosa", hue: 12, chroma: 0.19 },
  cyan: { label: "Ciano", hue: 205, chroma: 0.13 },
  orange: { label: "Laranja", hue: 50, chroma: 0.17 },
  pink: { label: "Magenta", hue: 350, chroma: 0.19 },
}

/** Converte #RRGGBB em matiz/croma OKLCH para derivar uma cor legível em qualquer tema. */
export function hexToHueChroma(hex: string): { hue: number; chroma: number } {
  const channel = (offset: number) => {
    const value = parseInt(hex.slice(offset, offset + 2), 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  }
  const r = channel(1)
  const g = channel(3)
  const b = channel(5)

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)

  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s

  const chroma = Math.hypot(a, bb)
  const hue = ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360
  return { hue: Math.round(hue * 10) / 10, chroma }
}

type Vars = Record<string, string>

function accentVars(prefs: AppearancePrefs, mode: "dark" | "light"): Vars {
  const base =
    prefs.accent === "custom"
      ? hexToHueChroma(prefs.customAccent)
      : ACCENT_PRESETS[prefs.accent]
  const hue = base.hue
  // Cores muito neutras/saturadas demais perdem legibilidade: limita o croma.
  const chroma = base.chroma < 0.03 ? 0.02 : Math.min(0.21, Math.max(0.09, base.chroma))

  const lightness = mode === "dark" ? 0.82 : 0.6
  const primary = `oklch(${lightness} ${chroma.toFixed(3)} ${hue})`
  const foreground = mode === "dark" ? `oklch(0.2 0.04 ${hue})` : `oklch(0.99 0.01 ${hue})`

  return {
    "--primary": primary,
    "--primary-foreground": foreground,
    "--ring": `oklch(${lightness} ${chroma.toFixed(3)} ${hue} / 45%)`,
    "--chart-1": primary,
  }
}

export interface AppearanceSnapshot {
  theme: Theme
  attrs: Record<string, string>
  varsDark: Vars
  varsLight: Vars
}

/** Tudo que precisa ser aplicado no <html>; também é o que o script anti-flash lê do cache. */
export function buildSnapshot(prefs: AppearancePrefs): AppearanceSnapshot {
  return {
    theme: prefs.theme,
    attrs: {
      "data-density": prefs.density,
      "data-radius": prefs.radius,
      "data-font": prefs.fontSize,
      "data-motion": prefs.reduceMotion ? "reduce" : "auto",
    },
    varsDark: accentVars(prefs, "dark"),
    varsLight: accentVars(prefs, "light"),
  }
}

export function resolveTheme(theme: Theme): "dark" | "light" {
  if (theme !== "system") return theme
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark"
}

const ACCENT_KEYS = ["--primary", "--primary-foreground", "--ring", "--chart-1"]
const ATTR_KEYS = ["data-theme", "data-density", "data-radius", "data-font", "data-motion"]

export function applyAppearance(prefs: AppearancePrefs, options: { animate?: boolean } = {}): void {
  const root = document.documentElement
  const snapshot = buildSnapshot(prefs)
  const mode = resolveTheme(prefs.theme)

  if (options.animate && !prefs.reduceMotion) {
    root.setAttribute("data-theme-transition", "")
    window.setTimeout(() => root.removeAttribute("data-theme-transition"), 320)
  }

  root.setAttribute("data-theme", mode)
  for (const [key, value] of Object.entries(snapshot.attrs)) root.setAttribute(key, value)
  const vars = mode === "dark" ? snapshot.varsDark : snapshot.varsLight
  for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value)
  root.style.colorScheme = mode
}

/** Páginas públicas (landing/login) mantêm a identidade padrão escura. */
export function clearAppearance(): void {
  const root = document.documentElement
  ATTR_KEYS.forEach(key => root.removeAttribute(key))
  ACCENT_KEYS.forEach(key => root.style.removeProperty(key))
  root.style.colorScheme = "dark"
}

export function sanitizePrefs(input: Partial<AppearancePrefs> | null | undefined): AppearancePrefs {
  return { ...DEFAULT_APPEARANCE, ...(input ?? {}) }
}

export function readCachedPrefs(): AppearancePrefs {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return DEFAULT_APPEARANCE
    const parsed = JSON.parse(raw) as { prefs?: Partial<AppearancePrefs> }
    return sanitizePrefs(parsed.prefs)
  } catch {
    return DEFAULT_APPEARANCE
  }
}

export function writeCachedPrefs(prefs: AppearancePrefs): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ prefs, snapshot: buildSnapshot(prefs) }))
  } catch {
    // armazenamento indisponível (modo privado): só não há cache
  }
}

export function prefsEqual(a: AppearancePrefs, b: AppearancePrefs): boolean {
  return (Object.keys(DEFAULT_APPEARANCE) as Array<keyof AppearancePrefs>).every(key => a[key] === b[key])
}
