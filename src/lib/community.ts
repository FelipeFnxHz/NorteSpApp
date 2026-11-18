import { Ban, Gavel, LockOpen, LogOut, TriangleAlert, type LucideIcon } from "lucide-react"
import type { ChangelogCategory, EventCategory, PunishmentKind } from "@/types"
import type { LogTone } from "@/lib/logTypes"

export const PUNISHMENT_META: Record<PunishmentKind, { label: string; icon: LucideIcon; tone: LogTone }> = {
  ban: { label: "Banimento", icon: Gavel, tone: "red" },
  unban: { label: "Banimento removido", icon: LockOpen, tone: "green" },
  warn: { label: "Advertência", icon: TriangleAlert, tone: "orange" },
  kick: { label: "Expulsão", icon: LogOut, tone: "amber" },
}

export const PUNISHMENT_FALLBACK = { label: "Punição", icon: Ban, tone: "neutral" as LogTone }

export const CHANGELOG_CATEGORIES: Array<{ value: ChangelogCategory; label: string; tone: LogTone }> = [
  { value: "feature", label: "Novidade", tone: "green" },
  { value: "fix", label: "Correção", tone: "orange" },
  { value: "economy", label: "Economia", tone: "amber" },
  { value: "vehicles", label: "Veículos", tone: "blue" },
  { value: "balance", label: "Balanceamento", tone: "violet" },
  { value: "patch", label: "Patch / Sistema", tone: "cyan" },
]

export const EVENT_CATEGORIES: Array<{ value: EventCategory; label: string; tone: LogTone }> = [
  { value: "race", label: "Corrida", tone: "red" },
  { value: "auction", label: "Leilão", tone: "amber" },
  { value: "faction", label: "Evento faccionado", tone: "violet" },
  { value: "meeting", label: "Reunião", tone: "blue" },
  { value: "special", label: "Evento especial", tone: "green" },
  { value: "other", label: "Outro", tone: "neutral" },
]

export const categoryMeta = <T extends { value: string }>(list: T[], value: string): T => list.find(item => item.value === value) ?? list[list.length - 1]

const DATE_TIME = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
const DATE = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
const TIME = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" })

export const formatDateTime = (iso: string) => DATE_TIME.format(new Date(iso))
export const formatLongDate = (iso: string) => DATE.format(new Date(iso))
export const formatTime = (iso: string) => TIME.format(new Date(iso))

/** Valor para <input type="datetime-local"> a partir de um ISO (fuso do navegador). */
export function isoToLocalInput(iso: string | null | undefined): string {
  if (!iso) return ""
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export const localInputToIso = (value: string) => (value ? new Date(value).toISOString() : "")

export function startOfDayKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

export function dayLabel(date: Date, now = new Date()): string {
  const key = startOfDayKey(date)
  if (key === startOfDayKey(now)) return "Hoje"
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  if (key === startOfDayKey(tomorrow)) return "Amanhã"
  return new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" }).format(date)
}
