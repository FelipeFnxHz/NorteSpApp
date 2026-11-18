import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface OptionPickerProps {
  /** "single" renderiza como radio, "multiple" como checkbox. */
  mode: "single" | "multiple"
  options: string[]
  value: string[]
  onChange: (value: string[]) => void
  invalid?: boolean
  label: string
}

export function OptionPicker({ mode, options, value, onChange, invalid, label }: OptionPickerProps) {
  const multiple = mode === "multiple"

  function toggle(option: string) {
    if (!multiple) return onChange([option])
    onChange(value.includes(option) ? value.filter(item => item !== option) : options.filter(item => item === option || value.includes(item)))
  }

  return (
    <div role={multiple ? "group" : "radiogroup"} aria-label={label} className="flex flex-col gap-2">
      {options.map(option => {
        const selected = value.includes(option)
        return (
          <button
            key={option}
            type="button"
            role={multiple ? "checkbox" : "radio"}
            aria-checked={selected}
            onClick={() => toggle(option)}
            className={cn(
              "group flex w-full min-w-0 items-start gap-3 rounded-xl border px-3.5 py-3 text-left text-[13.5px] transition-all outline-none",
              "focus-visible:ring-primary/20 focus-visible:ring-4",
              selected
                ? "border-primary/50 bg-primary/[0.07]"
                : invalid
                  ? "border-destructive/40 bg-white/[0.02] hover:bg-white/[0.04]"
                  : "border-border bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
            )}
          >
            <span
              className={cn(
                "mt-px grid size-[18px] shrink-0 place-items-center border transition-all",
                multiple ? "rounded-[5px]" : "rounded-full",
                selected ? "border-primary bg-primary text-primary-foreground" : "border-white/25 bg-transparent group-hover:border-white/40",
              )}
            >
              {selected && (multiple ? <Check className="size-3" strokeWidth={3.5} /> : <span className="bg-primary-foreground size-1.5 rounded-full" />)}
            </span>
            <span className={cn("min-w-0 flex-1 leading-snug [overflow-wrap:anywhere]", selected ? "text-foreground font-medium" : "text-foreground/90")}>{option}</span>
          </button>
        )
      })}
    </div>
  )
}
