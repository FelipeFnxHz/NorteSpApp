import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Tone = "primary" | "accent" | "secondary" | "destructive"

const TONE_CLASS: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary ring-primary/20",
  accent: "bg-accent/12 text-accent ring-accent/20",
  secondary: "bg-white/[0.06] text-foreground ring-white/10",
  destructive: "bg-destructive/12 text-destructive ring-destructive/20",
}

export function StatCard({
  icon,
  tone,
  label,
  value,
  hint,
  chipClassName,
}: {
  icon: ReactNode
  tone: Tone
  label: string
  value: ReactNode
  hint?: string
  /** Overrides the tone's chip colors — for tones outside the base four (e.g. log types). */
  chipClassName?: string
}) {
  return (
    <Card className="group hover:border-white/15 relative flex-col items-start gap-3 overflow-hidden p-4 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <div
        className={cn("grid size-11 shrink-0 place-items-center rounded-xl ring-1 ring-inset", chipClassName ?? TONE_CLASS[tone])}
      >
        {icon}
      </div>
      <div className="w-full min-w-0">
        <span className="text-muted-foreground block truncate text-xs font-medium">{label}</span>
        <strong className="font-display block truncate text-xl sm:text-2xl leading-tight font-bold tracking-tight">{value}</strong>
        {hint && <small className="text-muted-foreground block text-[11px]">{hint}</small>}
      </div>
    </Card>
  )
}
