import { FA_CATALOG, FA_REGISTRY, LUCIDE_CATALOG, LUCIDE_REGISTRY, type IconCatalogEntry } from "./catalog"

export { FA_CATALOG, FA_REGISTRY, LUCIDE_CATALOG, LUCIDE_REGISTRY }
export type { IconCatalogEntry }

export type IconLibrary = "lucide" | "fa"

export type ParsedCorpIcon = { kind: IconLibrary; name: string } | { kind: "text"; value: string }

export const CORP_ICON_TEXT_MAX = 4

const REFERENCE = /^(lucide|fa):(.+)$/

export function parseCorpIcon(raw?: string | null): ParsedCorpIcon | null {
  const value = raw?.trim()
  if (!value) return null

  const match = REFERENCE.exec(value)
  if (!match) return { kind: "text", value }

  const kind = match[1] as IconLibrary
  const name = match[2]
  const registry = kind === "lucide" ? LUCIDE_REGISTRY : FA_REGISTRY
  return Object.hasOwn(registry, name) ? { kind, name } : null
}

export function formatCorpIcon(kind: IconLibrary, name: string): string {
  return `${kind}:${name}`
}

const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()

export function searchIcons(catalog: IconCatalogEntry[], query: string): IconCatalogEntry[] {
  const term = normalize(query)
  if (!term) return catalog
  return catalog.filter(entry => normalize(`${entry.name} ${entry.label} ${entry.keywords}`).includes(term))
}
