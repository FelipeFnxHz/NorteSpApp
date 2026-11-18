import { Swords, Pencil, ArrowDownUp, ArrowUpDown, BookOpenText, UserMinus, UserPlus, TrendingDown, TrendingUp, UserCog, DatabaseBackup, ImagePlus, Lightbulb, Landmark, Radio, Wallet, Eye, Ban, CalendarDays, CalendarX, Gavel, LockOpen, Newspaper, Search, BellRing, Building2, CheckCircle2, CircleDollarSign, FilePenLine, Hand, KeyRound, Package, PlusCircle, RotateCcw, Settings, Shield, ShieldCheck, ShieldX, ShoppingCart, Tag, Terminal, Trash2, Truck, TriangleAlert, type LucideIcon } from "lucide-react"

export type LogTone = "green" | "red" | "blue" | "violet" | "cyan" | "amber" | "orange" | "neutral"

export const LOG_TONE: Record<LogTone, { dot: string; badge: string; chip: string }> = {
  green: {
    dot: "bg-[#34d399]",
    badge: "border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]",
    chip: "bg-[#34d399]/12 text-[#34d399] ring-[#34d399]/25",
  },
  red: {
    dot: "bg-[#f0464f]",
    badge: "border-[#f0464f]/30 bg-[#f0464f]/10 text-[#f0464f]",
    chip: "bg-[#f0464f]/12 text-[#f0464f] ring-[#f0464f]/25",
  },
  blue: {
    dot: "bg-[#4c8dff]",
    badge: "border-[#4c8dff]/30 bg-[#4c8dff]/10 text-[#4c8dff]",
    chip: "bg-[#4c8dff]/12 text-[#4c8dff] ring-[#4c8dff]/25",
  },
  violet: {
    dot: "bg-[#a78bfa]",
    badge: "border-[#a78bfa]/30 bg-[#a78bfa]/10 text-[#a78bfa]",
    chip: "bg-[#a78bfa]/12 text-[#a78bfa] ring-[#a78bfa]/25",
  },
  cyan: {
    dot: "bg-[#22d3ee]",
    badge: "border-[#22d3ee]/30 bg-[#22d3ee]/10 text-[#22d3ee]",
    chip: "bg-[#22d3ee]/12 text-[#22d3ee] ring-[#22d3ee]/25",
  },
  amber: {
    dot: "bg-[#f5b94a]",
    badge: "border-[#f5b94a]/30 bg-[#f5b94a]/10 text-[#f5b94a]",
    chip: "bg-[#f5b94a]/12 text-[#f5b94a] ring-[#f5b94a]/25",
  },
  orange: {
    dot: "bg-[#fb923c]",
    badge: "border-[#fb923c]/30 bg-[#fb923c]/10 text-[#fb923c]",
    chip: "bg-[#fb923c]/12 text-[#fb923c] ring-[#fb923c]/25",
  },
  neutral: {
    dot: "bg-muted-foreground",
    badge: "border-white/10 bg-white/[0.04] text-muted-foreground",
    chip: "bg-white/[0.06] text-muted-foreground ring-white/10",
  },
}

export interface LogMeta {
  label: string
  icon: LucideIcon
  tone: LogTone
}

const KNOWN: Record<string, LogMeta> = {
  ticket_created: { label: "Ticket criado", icon: PlusCircle, tone: "green" },
  ticket_claimed: { label: "Ticket assumido", icon: Hand, tone: "cyan" },
  ticket_closed: { label: "Ticket fechado", icon: CheckCircle2, tone: "red" },
  ticket_dropped: { label: "Ticket liberado", icon: RotateCcw, tone: "orange" },
  ticket_user_added: { label: "Usuário adicionado", icon: UserPlus, tone: "blue" },
  ticket_user_removed: { label: "Usuário removido", icon: UserMinus, tone: "orange" },
  ticket_owner_notified: { label: "Dono notificado", icon: BellRing, tone: "orange" },
  ticket_renamed: { label: "Ticket renomeado", icon: FilePenLine, tone: "blue" },
  corp_status_changed: { label: "Status da corporação", icon: Building2, tone: "orange" },
  ticket_reopened: { label: "Ticket reaberto", icon: RotateCcw, tone: "green" },
  ticket_deleted: { label: "Ticket excluído", icon: Trash2, tone: "red" },
  faction_created: { label: "Facção criada", icon: Swords, tone: "green" },
  faction_edited: { label: "Facção editada", icon: FilePenLine, tone: "blue" },
  faction_status_changed: { label: "Status da facção", icon: Swords, tone: "orange" },
  faction_deleted: { label: "Facção excluída", icon: Trash2, tone: "red" },
  faction_patente_changed: { label: "Hierarquia da facção", icon: Shield, tone: "violet" },
  faction_member_hired: { label: "Membro adicionado à facção", icon: UserPlus, tone: "green" },
  faction_member_fired: { label: "Membro removido da facção", icon: UserMinus, tone: "red" },
  faction_member_updated: { label: "Membro da facção atualizado", icon: UserCog, tone: "blue" },
  faction_vault_deposit: { label: "Depósito no cofre da facção", icon: TrendingUp, tone: "green" },
  faction_vault_withdraw: { label: "Levantamento do cofre da facção", icon: TrendingDown, tone: "red" },
  faction_vault_viewed: { label: "Cofre da facção consultado", icon: Eye, tone: "blue" },
  faction_vault_settings_updated: { label: "Canal financeiro da facção", icon: Settings, tone: "blue" },
  corp_created: { label: "Corporação criada", icon: Building2, tone: "green" },
  corp_edited: { label: "Corporação editada", icon: FilePenLine, tone: "blue" },
  corp_deleted: { label: "Corporação excluída", icon: Trash2, tone: "red" },
  corp_member_hired: { label: "Membro contratado", icon: UserPlus, tone: "green" },
  corp_member_fired: { label: "Membro demitido", icon: UserMinus, tone: "red" },
  corp_member_updated: { label: "Membro atualizado", icon: UserCog, tone: "blue" },
  corp_patente_changed: { label: "Patente alterada", icon: Shield, tone: "violet" },
  whitelist_approved: { label: "Whitelist aprovada", icon: ShieldCheck, tone: "green" },
  whitelist_rejected: { label: "Whitelist reprovada", icon: ShieldX, tone: "red" },
  config_updated: { label: "Configuração alterada", icon: Settings, tone: "amber" },
  system_alert: { label: "Alerta do sistema", icon: TriangleAlert, tone: "orange" },
  punishment: { label: "Punição", icon: Ban, tone: "orange" },
  corp_link_code_generated: { label: "Código de vinculação gerado", icon: KeyRound, tone: "green" },
  corp_link_code_revoked: { label: "Código de vinculação revogado", icon: KeyRound, tone: "red" },
  punishment_history_viewed: { label: "Histórico consultado", icon: Search, tone: "blue" },
  punishment_banned: { label: "Banimento aplicado", icon: Gavel, tone: "red" },
  punishment_unbanned: { label: "Banimento removido", icon: LockOpen, tone: "green" },
  punishment_warned: { label: "Advertência aplicada", icon: TriangleAlert, tone: "orange" },
  changelog_published: { label: "Changelog publicado", icon: Newspaper, tone: "green" },
  changelog_edited: { label: "Changelog editado", icon: FilePenLine, tone: "blue" },
  changelog_deleted: { label: "Changelog removido", icon: Trash2, tone: "red" },
  rule_created: { label: "Regra criada", icon: BookOpenText, tone: "green" },
  rule_updated: { label: "Regra editada", icon: Pencil, tone: "blue" },
  rule_deleted: { label: "Regra removida", icon: Trash2, tone: "red" },
  rules_reordered: { label: "Regras reordenadas", icon: ArrowUpDown, tone: "violet" },
  staff_added: { label: "Staff adicionado", icon: UserPlus, tone: "green" },
  staff_promoted: { label: "Staff promovido", icon: TrendingUp, tone: "green" },
  staff_demoted: { label: "Staff rebaixado", icon: TrendingDown, tone: "orange" },
  staff_role_changed: { label: "Cargo de staff alterado", icon: UserCog, tone: "violet" },
  staff_removed: { label: "Staff removido", icon: UserMinus, tone: "red" },
  gallery_uploaded: { label: "Imagem adicionada à galeria", icon: ImagePlus, tone: "green" },
  gallery_removed: { label: "Imagem removida da galeria", icon: Trash2, tone: "red" },
  backup_created: { label: "Backup gerado", icon: DatabaseBackup, tone: "green" },
  backup_failed: { label: "Falha no backup", icon: TriangleAlert, tone: "red" },
  backup_deleted: { label: "Backup removido", icon: Trash2, tone: "orange" },
  backup_schedule_updated: { label: "Agenda de backups", icon: Settings, tone: "blue" },
  backup_restore_requested: { label: "Restauro solicitado", icon: RotateCcw, tone: "orange" },
  backup_restore_completed: { label: "Restauro concluído", icon: CheckCircle2, tone: "green" },
  backup_restore_failed: { label: "Restauro falhou/recusado", icon: ShieldX, tone: "red" },
  suggestion_created: { label: "Nova sugestão", icon: Lightbulb, tone: "blue" },
  suggestion_status_changed: { label: "Estado da sugestão", icon: Tag, tone: "violet" },
  suggestion_deleted: { label: "Sugestão removida", icon: Trash2, tone: "red" },
  whitelist_state_changed: { label: "Estado da whitelist", icon: ShieldCheck, tone: "orange" },
  vault_deposit: { label: "Depósito no cofre", icon: Wallet, tone: "green" },
  vault_withdraw: { label: "Levantamento do cofre", icon: Landmark, tone: "red" },
  vault_viewed: { label: "Cofre consultado", icon: Eye, tone: "cyan" },
  vault_settings_updated: { label: "Canal financeiro", icon: Settings, tone: "blue" },
  server_status_channel: { label: "Canal de status", icon: Radio, tone: "blue" },
  event_created: { label: "Evento agendado", icon: CalendarDays, tone: "green" },
  event_edited: { label: "Evento editado", icon: FilePenLine, tone: "blue" },
  event_cancelled: { label: "Evento cancelado", icon: CalendarX, tone: "red" },
  store_category_created: { label: "Categoria criada", icon: Tag, tone: "green" },
  store_category_edited: { label: "Categoria editada", icon: FilePenLine, tone: "blue" },
  store_category_deleted: { label: "Categoria excluída", icon: Trash2, tone: "red" },
  store_product_created: { label: "Produto criado", icon: Package, tone: "green" },
  store_product_edited: { label: "Produto editado", icon: FilePenLine, tone: "blue" },
  store_product_deleted: { label: "Produto excluído", icon: Trash2, tone: "red" },
  store_catalog_reordered: { label: "Ordem alterada", icon: ArrowDownUp, tone: "violet" },
  store_token_updated: { label: "Mercado Pago alterado", icon: KeyRound, tone: "orange" },
  store_token_removed: { label: "Mercado Pago removido", icon: KeyRound, tone: "red" },
  store_order_created: { label: "Pedido criado", icon: ShoppingCart, tone: "cyan" },
  store_payment_approved: { label: "Pagamento aprovado", icon: CircleDollarSign, tone: "green" },
  store_delivery_completed: { label: "Entrega concluída", icon: Truck, tone: "green" },
  store_delivery_failed: { label: "Falha na entrega", icon: TriangleAlert, tone: "red" },
  store_order_redelivered: { label: "Reentrega solicitada", icon: RotateCcw, tone: "orange" },
}

function humanize(type: string) {
  const text = type.replace(/_/g, " ").trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function getLogMeta(type: string): LogMeta {
  const known = KNOWN[type]
  if (known) return known

  const name = type.toLowerCase()
  const label = humanize(type)

  if (/(creat|hire|approv|reopen|return)/.test(name)) return { label, icon: PlusCircle, tone: "green" }
  if (/(delet|fire|close|reject|remov)/.test(name)) return { label, icon: Trash2, tone: "red" }
  if (/promot/.test(name)) return { label, icon: Shield, tone: "violet" }
  if (/(edit|updat|chang)/.test(name)) return { label, icon: FilePenLine, tone: "blue" }
  if (/(claim|assum)/.test(name)) return { label, icon: Hand, tone: "cyan" }
  if (/(alert|warn|punish|ban)/.test(name)) return { label, icon: TriangleAlert, tone: "orange" }
  return { label, icon: Terminal, tone: "neutral" }
}

export const LOG_LEGEND: Array<{ tone: LogTone; label: string }> = [
  { tone: "green", label: "Criação / contratação" },
  { tone: "red", label: "Exclusão / demissão / fechamento" },
  { tone: "blue", label: "Edição / atualização" },
  { tone: "violet", label: "Promoção" },
  { tone: "orange", label: "Alertas / punições" },
]
