import { useEffect, useState } from "react"
import { Check, Pipette } from "lucide-react"
import { cn } from "@/lib/utils"
import { ACCENT_PRESETS, type AccentKey, type AppearancePrefs } from "@/lib/appearance"

const HEX = /^#[0-9a-fA-F]{6}$/

interface AccentPickerProps {
  accent: AccentKey
  customAccent: string
  onChange: (patch: Partial<AppearancePrefs>) => void
}

export function AccentPicker({ accent, customAccent, onChange }: AccentPickerProps) {
  const [hexDraft, setHexDraft] = useState(customAccent)
  useEffect(() => setHexDraft(customAccent), [customAccent])

  const presets = Object.entries(ACCENT_PRESETS) as Array<[Exclude<AccentKey, "custom">, (typeof ACCENT_PRESETS)[keyof typeof ACCENT_PRESETS]]>

  return (
    <div className="flex flex-col gap-4">
      <div role="radiogroup" aria-label="Cor de destaque" className="flex flex-wrap gap-2.5">
        {presets.map(([key, preset]) => {
          const active = accent === key
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={preset.label}
              title={preset.label}
              onClick={() => onChange({ accent: key })}
              className={cn(
                "grid size-10 place-items-center rounded-full ring-2 ring-offset-2 ring-offset-[var(--card)] transition-all duration-150 hover:scale-110",
                active ? "ring-[var(--foreground)]" : "ring-transparent",
              )}
              style={{ background: `oklch(0.72 ${preset.chroma} ${preset.hue})` }}
            >
              {active && <Check className="size-4 text-white drop-shadow" />}
            </button>
          )
        })}

        <label
          title="Cor personalizada"
          className={cn(
            "relative grid size-10 cursor-pointer place-items-center overflow-hidden rounded-full ring-2 ring-offset-2 ring-offset-[var(--card)] transition-all duration-150 hover:scale-110",
            accent === "custom" ? "ring-[var(--foreground)]" : "ring-transparent",
          )}
          style={{ background: accent === "custom" ? customAccent : "conic-gradient(from 0deg, #f43f5e, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #f43f5e)" }}
        >
          <Pipette className="size-4 text-white drop-shadow" />
          <input
            type="color"
            aria-label="Escolher cor personalizada"
            value={HEX.test(customAccent) ? customAccent : "#f5b94a"}
            onChange={event => onChange({ accent: "custom", customAccent: event.target.value })}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />
        </label>
      </div>

      {accent === "custom" && (
        <div className="flex flex-col gap-1.5 sm:max-w-[14rem]">
          <label htmlFor="accent-hex" className="text-muted-foreground text-xs font-medium">
            Código da cor (HEX)
          </label>
          <input
            id="accent-hex"
            value={hexDraft}
            maxLength={7}
            spellCheck={false}
            onChange={event => {
              const value = event.target.value.startsWith("#") ? event.target.value : `#${event.target.value}`
              setHexDraft(value)
              if (HEX.test(value)) onChange({ accent: "custom", customAccent: value.toLowerCase() })
            }}
            className="border-input focus:border-primary/50 focus:ring-primary/15 h-10 rounded-xl border bg-white/[0.03] px-3.5 font-mono text-sm uppercase outline-none transition-all focus:ring-4"
          />
          <p className="text-muted-foreground text-[11px]">A cor é ajustada automaticamente para manter o contraste em cada tema.</p>
        </div>
      )}
    </div>
  )
}
