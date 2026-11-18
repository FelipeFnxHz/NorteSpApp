import { Check, Monitor, Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Theme } from "@/lib/appearance"

const THEME_OPTIONS: Array<{ value: Theme; label: string; hint: string; icon: typeof Sun }> = [
  { value: "dark", label: "Escuro", hint: "Menos brilho, ótimo para longas sessões", icon: Moon },
  { value: "light", label: "Claro", hint: "Alto contraste em ambientes iluminados", icon: Sun },
  { value: "system", label: "Sistema", hint: "Acompanha o seu aparelho automaticamente", icon: Monitor },
]

/* Cores fixas: a miniatura mostra o tema de verdade, independente do tema atual. */
const SWATCH = {
  dark: { bg: "#13151f", card: "#1d2030", line: "#2a2e42", text: "#e8eaf2" },
  light: { bg: "#f6f7fb", card: "#ffffff", line: "#dde0ea", text: "#1d2030" },
}

function MiniPreview({ mode }: { mode: "dark" | "light" }) {
  const c = SWATCH[mode]
  return (
    <div className="flex h-full overflow-hidden rounded-md" style={{ background: c.bg, border: `1px solid ${c.line}` }}>
      <div className="w-1/4" style={{ background: c.card, borderRight: `1px solid ${c.line}` }}>
        <div className="mx-1.5 mt-2 h-1.5 rounded-full" style={{ background: "var(--primary)" }} />
        <div className="mx-1.5 mt-1.5 h-1 rounded-full" style={{ background: c.line }} />
        <div className="mx-1.5 mt-1 h-1 rounded-full" style={{ background: c.line }} />
      </div>
      <div className="flex-1 p-1.5">
        <div className="h-1.5 w-1/2 rounded-full" style={{ background: c.text, opacity: 0.8 }} />
        <div className="mt-1.5 grid grid-cols-2 gap-1">
          <div className="h-5 rounded" style={{ background: c.card, border: `1px solid ${c.line}` }} />
          <div className="h-5 rounded" style={{ background: c.card, border: `1px solid ${c.line}` }} />
        </div>
      </div>
    </div>
  )
}

export function ThemePicker({ value, onChange }: { value: Theme; onChange: (theme: Theme) => void }) {
  return (
    <div role="radiogroup" aria-label="Tema" className="grid gap-3 sm:grid-cols-3">
      {THEME_OPTIONS.map(option => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "group relative flex flex-col gap-3 rounded-xl border p-3 text-left transition-all duration-150",
              active ? "border-primary/60 bg-primary/[0.06] ring-primary/20 ring-4" : "border-border hover:border-white/20 hover:bg-white/[0.03]",
            )}
          >
            <div className="h-20">
              {option.value === "system" ? (
                <div className="grid h-full grid-cols-2 gap-1">
                  <MiniPreview mode="dark" />
                  <MiniPreview mode="light" />
                </div>
              ) : (
                <MiniPreview mode={option.value} />
              )}
            </div>
            <div className="flex items-start gap-2.5">
              <option.icon className="text-muted-foreground mt-0.5 size-4 shrink-0" />
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="text-muted-foreground block text-[11px] leading-snug">{option.hint}</span>
              </span>
            </div>
            {active && (
              <span className="bg-primary text-primary-foreground absolute top-2.5 right-2.5 grid size-5 place-items-center rounded-full">
                <Check className="size-3" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
