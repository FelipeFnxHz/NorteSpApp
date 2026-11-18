import {
  BarChart3,
  BookOpenText,
  Calculator,
  CalendarClock,
  DatabaseBackup,
  ImageIcon,
  Landmark,
  Lightbulb,
  Building2,
  Swords,
  CalendarDays,
  Gavel,
  FileText,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  Settings,
  ShieldBan,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Ticket,
  Users,
  type LucideIcon,
} from "lucide-react"
import type { UserRole } from "@/types"

export type NavGroup = "Geral" | "Gestão" | "Sistema"

export interface NavItem {
  to: string
  group: NavGroup
  label: string
  icon: LucideIcon
  access: UserRole[]
  corpAccess?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard", group: "Geral", label: "Visão Geral", icon: LayoutDashboard, access: ["member", "staff", "admin"] },
  { to: "/dashboard/corporations", group: "Gestão", label: "Corporações", icon: Building2, access: ["staff", "admin"], corpAccess: true },
  { to: "/dashboard/faccoes", group: "Gestão", label: "Facções", icon: Swords, access: ["staff", "admin"] },
  { to: "/dashboard/tickets", group: "Geral", label: "Tickets", icon: Ticket, access: ["member", "staff", "admin"] },
  { to: "/dashboard/whitelist", group: "Geral", label: "Whitelist", icon: ShieldCheck, access: ["member", "staff", "admin"] },
  { to: "/dashboard/punishments", group: "Geral", label: "Minhas Punições", icon: Gavel, access: ["member", "staff", "admin"] },
  { to: "/dashboard/events", group: "Geral", label: "Agenda de Eventos", icon: CalendarDays, access: ["member", "staff", "admin"] },
  { to: "/dashboard/changelog", group: "Geral", label: "Changelog", icon: Sparkles, access: ["member", "staff", "admin"] },
  { to: "/dashboard/store", group: "Geral", label: "Loja", icon: ShoppingBag, access: ["member", "staff", "admin"] },
  { to: "/dashboard/suggestions", group: "Geral", label: "Sugestões", icon: Lightbulb, access: ["member", "staff", "admin"] },
  { to: "/dashboard/rules", group: "Geral", label: "Regras", icon: BookOpenText, access: ["member", "staff", "admin"] },
  { to: "/dashboard/calculator", group: "Geral", label: "Calculadora", icon: Calculator, access: ["member", "staff", "admin"] },
  { to: "/dashboard/taxes", group: "Geral", label: "Impostos", icon: CalendarClock, access: ["member", "staff", "admin"] },
  { to: "/dashboard/transcripts", group: "Geral", label: "Transcripts", icon: FileText, access: ["member", "staff", "admin"] },
  { to: "/dashboard/finance", group: "Gestão", label: "Financeiro", icon: Landmark, access: ["staff", "admin"], corpAccess: true },
  { to: "/dashboard/gallery", group: "Gestão", label: "Galeria do site", icon: ImageIcon, access: ["staff", "admin"] },
  { to: "/dashboard/staff", group: "Gestão", label: "Staff", icon: Users, access: ["staff", "admin"] },
  { to: "/dashboard/staff-logs", group: "Gestão", label: "Logs", icon: ScrollText, access: ["staff", "admin"] },
  { to: "/dashboard/moderation", group: "Gestão", label: "Moderação", icon: ShieldBan, access: ["staff", "admin"] },
  { to: "/dashboard/feedback", group: "Gestão", label: "Feedback", icon: MessageSquare, access: ["staff", "admin"] },
  { to: "/dashboard/backups", group: "Sistema", label: "Backups", icon: DatabaseBackup, access: ["admin"] },
  { to: "/dashboard/analytics", group: "Sistema", label: "Analytics", icon: BarChart3, access: ["staff", "admin"] },
  { to: "/dashboard/settings", group: "Sistema", label: "Configurações", icon: Settings, access: ["member", "staff", "admin"] },
]

export function canAccess(item: NavItem, role: UserRole | undefined, hasCorpAccess = false): boolean {
  if (!role) return false
  if (item.corpAccess && hasCorpAccess) return true
  return item.access.includes(role)
}
