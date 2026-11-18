import { Bug, Gavel, LifeBuoy, ShieldAlert, type LucideIcon } from "lucide-react"
import type { Tone } from "@/components/ui/tone-icon"

export const TICKET_CATEGORY_META: Record<string, { icon: LucideIcon; tone: Tone }> = {
  support: { icon: LifeBuoy, tone: "cyan" },
  complaint: { icon: ShieldAlert, tone: "red" },
  punishment: { icon: Gavel, tone: "orange" },
  bugs: { icon: Bug, tone: "purple" },
}

export const DEFAULT_CATEGORY_META = TICKET_CATEGORY_META.support

export function categoryMeta(type: string) {
  return TICKET_CATEGORY_META[type] ?? DEFAULT_CATEGORY_META
}

export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

export function formatTime(value: string | Date) {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}
