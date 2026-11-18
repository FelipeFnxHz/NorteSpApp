import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PermissionToggleProps {
  label: string
  checked: boolean
  onToggle: () => void
}

export function PermissionToggle({ label, checked, onToggle }: PermissionToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={checked}
      className={cn(
        "flex min-w-0 items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] font-medium transition-colors",
        checked
          ? "border-primary/40 bg-primary/10 text-foreground"
          : "border-border text-muted-foreground hover:border-white/20 hover:text-foreground bg-white/[0.02]",
      )}
    >
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-[5px] border transition-colors",
          checked ? "bg-primary border-primary text-primary-foreground" : "border-white/20",
        )}
      >
        {checked && <Check className="size-3" strokeWidth={3} />}
      </span>
      {label}
    </button>
  )
}
