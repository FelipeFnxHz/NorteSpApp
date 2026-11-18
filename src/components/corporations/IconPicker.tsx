import { useMemo, useState } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { corpTileStyle } from "@/lib/corpTheme"
import { CORP_ICON_TEXT_MAX, FA_CATALOG, LUCIDE_CATALOG, formatCorpIcon, parseCorpIcon, searchIcons, type IconLibrary, } from "@/lib/corp-icons"
import { LibraryGlyph } from "./CorpAvatar"

type Tab = IconLibrary | "text"

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "lucide", label: "Lucide" },
  { id: "fa", label: "FontAwesome" },
  { id: "text", label: "Texto / Emoji" },
]

interface IconPickerProps {
  value: string
  color: string
  onChange: (value: string) => void
}

export function IconPicker({ value, color, onChange }: IconPickerProps) {
  const parsed = parseCorpIcon(value)
  const [tab, setTab] = useState<Tab>(parsed?.kind ?? "lucide")
  const [query, setQuery] = useState("")

  const catalog = tab === "fa" ? FA_CATALOG : LUCIDE_CATALOG
  const results = useMemo(() => (tab === "text" ? [] : searchIcons(catalog, query)), [tab, catalog, query])
  const selectedName = parsed && parsed.kind !== "text" && parsed.kind === tab ? parsed.name : null

  function switchTab(next: Tab) {
    setTab(next)
    setQuery("")
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div role="tablist" aria-label="Biblioteca de ícones" className="flex min-w-0 flex-wrap gap-1 rounded-lg bg-white/[0.04] p-1">
          {TABS.map(item => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              onClick={() => switchTab(item.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
                tab === item.id ? "bg-white/10 text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {value && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} className="shrink-0 text-xs">
            <X className="size-3.5" />
            Limpar
          </Button>
        )}
      </div>

      {tab === "text" ? (
        <Input
          value={parsed?.kind === "text" ? parsed.value : ""}
          onChange={event => onChange(event.target.value)}
          placeholder="Sigla ou emoji (ex: DC)"
          maxLength={CORP_ICON_TEXT_MAX}
          hint="Até 4 caracteres. Sem ícone, a corporação usa as iniciais do nome."
        />
      ) : (
        <>
          <Input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={`Buscar ícone ${tab === "fa" ? "FontAwesome" : "Lucide"}...`}
            aria-label="Buscar ícone"
            icon={<Search className="size-4" />}
          />

          {results.length === 0 ? (
            <p className="text-muted-foreground border-border rounded-lg border border-dashed p-4 text-center text-sm">
              Nenhum ícone encontrado para “{query}”.
            </p>
          ) : (
            <div
              role="listbox"
              aria-label="Ícones disponíveis"
              className="grid max-h-52 grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-1.5 overflow-x-hidden overflow-y-auto pr-1"
            >
              {results.map(entry => {
                const selected = entry.name === selectedName
                return (
                  <button
                    key={entry.name}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    aria-label={entry.label}
                    title={entry.label}
                    onClick={() => onChange(formatCorpIcon(tab as IconLibrary, entry.name))}
                    style={selected ? corpTileStyle(color) : undefined}
                    className={cn(
                      "grid aspect-square place-items-center rounded-lg border transition-colors",
                      selected
                        ? "border-current"
                        : "border-border text-muted-foreground hover:text-foreground bg-white/[0.02] hover:border-white/20",
                    )}
                  >
                    <LibraryGlyph kind={tab as IconLibrary} name={entry.name} size={20} />
                  </button>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
