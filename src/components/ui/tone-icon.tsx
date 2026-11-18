import type { CSSProperties, ElementType } from "react"
import { cn } from "@/lib/utils"

export const TONES = {
  blue: "#4c8dff",
  red: "#f0464f",
  purple: "#a78bfa",
  green: "#34d399",
  orange: "#fb923c",
  amber: "#fbbf24",
  pink: "#f472b6",
  cyan: "#22d3ee",
  teal: "#2dd4bf",
  indigo: "#818cf8",
  sky: "#38bdf8",
  rose: "#fb7185",
} as const

export type Tone = keyof typeof TONES

export function toneStyle(tone: Tone): CSSProperties {
  const color = TONES[tone]
  return {
    color,
    backgroundColor: `color-mix(in oklab, ${color} 12%, transparent)`,
    boxShadow: `inset 0 0 0 1px color-mix(in oklab, ${color} 24%, transparent)`,
  }
}

interface ToneIconProps {
  icon: ElementType<{ className?: string }>
  tone: Tone
  className?: string
  iconClassName?: string
}

export function ToneIcon({ icon: Icon, tone, className, iconClassName = "size-5" }: ToneIconProps) {
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-xl", className)} style={toneStyle(tone)}>
      <Icon className={iconClassName} />
    </span>
  )
}
