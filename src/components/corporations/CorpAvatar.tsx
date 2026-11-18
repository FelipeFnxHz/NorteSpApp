import { Building2 } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { cn } from "@/lib/utils"
import { corpTileStyle, resolveCorpColor } from "@/lib/corpTheme"
import { FA_REGISTRY, LUCIDE_REGISTRY, parseCorpIcon, type IconLibrary } from "@/lib/corp-icons"

const SIZES = {
  sm: { box: "size-5 rounded-md text-[10px]", glyph: 12 },
  md: { box: "size-12 rounded-xl text-base", glyph: 20 },
  lg: { box: "size-14 rounded-2xl text-xl", glyph: 24 },
  xl: { box: "size-16 rounded-2xl text-2xl", glyph: 28 },
} as const

interface CorpAvatarProps {
  name: string
  icon?: string | null
  color?: string | null
  size?: keyof typeof SIZES
  className?: string
}

export function LibraryGlyph({ kind, name, size }: { kind: IconLibrary; name: string; size: number }) {
  if (kind === "lucide") {
    const Icon = LUCIDE_REGISTRY[name]
    return <Icon size={size} strokeWidth={2} aria-hidden="true" />
  }

  return (
    <span className="inline-flex leading-none" style={{ fontSize: size * 0.9 }}>
      <FontAwesomeIcon icon={FA_REGISTRY[name]} aria-hidden="true" />
    </span>
  )
}

function Glyph({ icon, name, size }: { icon?: string | null; name: string; size: number }) {
  const parsed = parseCorpIcon(icon)

  if (parsed && parsed.kind !== "text") return <LibraryGlyph kind={parsed.kind} name={parsed.name} size={size} />
  if (parsed) return <>{parsed.value}</>
  if (name.trim()) return <>{name.trim().slice(0, 2).toUpperCase()}</>
  return <Building2 size={size} className="opacity-50" aria-hidden="true" />
}

export function CorpAvatar({ name, icon, color, size = "lg", className }: CorpAvatarProps) {
  const { box, glyph } = SIZES[size]

  return (
    <div
      className={cn("grid shrink-0 place-items-center font-bold ring-1 ring-white/10 ring-inset transition-colors", box, className)}
      style={corpTileStyle(resolveCorpColor(color))}
    >
      <Glyph icon={icon} name={name} size={glyph} />
    </div>
  )
}
