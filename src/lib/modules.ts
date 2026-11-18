import type { SuggestionCategory, SuggestionStatus, TaxStatus } from "@/types/modules"
import type { LogTone } from "@/lib/logTypes"

export const formatMoney = (value: number) => `R$ ${value.toLocaleString("pt-BR")}`

export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

export const formatDateTime = (iso: string | number) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })

export function timeAgo(iso: string | number, now = Date.now()): string {
  const seconds = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000))
  if (seconds < 10) return "agora mesmo"
  if (seconds < 60) return `há ${seconds}s`
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)} min`
  if (seconds < 86_400) return `há ${Math.floor(seconds / 3600)} h`
  return `há ${Math.floor(seconds / 86_400)} d`
}

export const SUGGESTION_STATUS: Record<SuggestionStatus, { label: string; tone: LogTone }> = {
  review: { label: "Em Análise", tone: "amber" },
  approved: { label: "Aprovada", tone: "green" },
  in_progress: { label: "Em Desenvolvimento", tone: "blue" },
  implemented: { label: "Implementada", tone: "violet" },
  rejected: { label: "Rejeitada", tone: "red" },
}
export const SUGGESTION_STATUS_ORDER: SuggestionStatus[] = ["review", "approved", "in_progress", "implemented", "rejected"]

export const SUGGESTION_CATEGORY: Record<SuggestionCategory, string> = {
  vehicles: "Veículos", economy: "Economia", rules: "Regras", jobs: "Empregos", events: "Eventos", other: "Outro",
}

export const TAX_STATUS: Record<TaxStatus, { label: string; tone: LogTone }> = {
  paid: { label: "Pago", tone: "green" },
  overdue: { label: "Em atraso", tone: "red" },
  due_soon: { label: "Vence em breve", tone: "amber" },
  pending: { label: "Pendente", tone: "neutral" },
}
