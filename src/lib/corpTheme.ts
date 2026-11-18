import type { CSSProperties } from "react"

export const DEFAULT_CORP_COLOR = "#5865F2"

export const CORP_COLOR_PRESETS = [
  "#5865F2",
  "#4c8dff",
  "#22b8cf",
  "#2fbf71",
  "#f5b73b",
  "#f0764f",
  "#f0464f",
  "#d44fc2",
  "#8b5cf6",
  "#94a3b8",
]

const HEX_COLOR = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function isValidCorpColor(value: unknown): value is string {
  return typeof value === "string" && HEX_COLOR.test(value.trim())
}

export function resolveCorpColor(color?: string | null): string {
  return isValidCorpColor(color) ? color.trim() : DEFAULT_CORP_COLOR
}

export function toColorInputValue(color: string): string {
  const value = resolveCorpColor(color)
  return value.length === 4 ? `#${[...value.slice(1)].map(char => char + char).join("")}` : value
}

const tint = (color: string, percent: number, base = "transparent") =>
  `color-mix(in srgb, ${color} ${percent}%, ${base})`

export function corpGradient(color: string, strength = 26, fadeTo = "transparent", stop = 75): CSSProperties {
  return { background: `linear-gradient(135deg, ${tint(color, strength)}, ${fadeTo} ${stop}%)` }
}

export function corpTileStyle(color: string): CSSProperties {
  return { backgroundColor: tint(color, 22, "var(--card)"), color }
}
