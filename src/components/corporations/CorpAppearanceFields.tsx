import { cn } from "@/lib/utils"
import { CORP_COLOR_PRESETS, resolveCorpColor, toColorInputValue } from "@/lib/corpTheme"
import { CorpAvatar } from "./CorpAvatar"
import { IconPicker } from "./IconPicker"

interface CorpAppearanceFieldsProps {
  name: string
  icon: string
  color: string
  onIconChange: (icon: string) => void
  onColorChange: (color: string) => void
}

export function CorpAppearanceFields({ name, icon, color, onIconChange, onColorChange }: CorpAppearanceFieldsProps) {
  const activeColor = resolveCorpColor(color)

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex items-center gap-4">
        <CorpAvatar name={name} icon={icon} color={activeColor} size="xl" />

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="text-muted-foreground text-xs font-semibold">Cor da corporação</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {CORP_COLOR_PRESETS.map(preset => (
              <button
                key={preset}
                type="button"
                aria-label={`Usar a cor ${preset}`}
                aria-pressed={activeColor.toLowerCase() === preset.toLowerCase()}
                onClick={() => onColorChange(preset)}
                style={{ backgroundColor: preset }}
                className={cn(
                  "size-6 rounded-full ring-offset-2 ring-offset-[var(--card)] transition-shadow",
                  activeColor.toLowerCase() === preset.toLowerCase() ? "ring-2 ring-white/80" : "hover:ring-2 hover:ring-white/30",
                )}
              />
            ))}
            <input
              type="color"
              value={toColorInputValue(activeColor)}
              onChange={event => onColorChange(event.target.value)}
              aria-label="Escolher cor personalizada"
              className="border-input size-7 cursor-pointer rounded-lg border bg-transparent p-0.5"
            />
          </div>
        </div>
      </div>

      <IconPicker value={icon} color={activeColor} onChange={onIconChange} />
    </div>
  )
}
