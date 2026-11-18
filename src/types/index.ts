export type UserRole = "member" | "staff" | "admin"

export interface SessionUser {
  id: string
  username: string
  displayName: string
  avatar: string
  role: UserRole
}

export type AnnouncementTone = "info" | "warning" | "success"

export interface DashboardAnnouncement {
  enabled: boolean
  text: string
  tone: AnnouncementTone
}

export interface DashboardConfig {
  name?: string
  logoUrl?: string
  statusMessage?: string
  returnAt?: number | null
  autoReturn?: boolean
  description?: string
  inviteUrl?: string
  announcement?: DashboardAnnouncement
}

export type DashboardStatus = "online" | "maintenance" | "offline"

export interface TicketSummary {
  id: string
  codigo: string
  type: string
  typeLabel: string
  motivo?: string
  status: "open" | "closed" | string
  createdAt: string
  userId?: string
  claimedByName?: string
  lastMessageAt?: string
}

export interface TicketDetail extends TicketSummary {
  userName: string
  userAvatar?: string
  claimedBy?: string
  closedByName?: string
  transcriptUrl?: string
  source: "discord" | "dashboard"
  attachments: string[]
  answers: Array<{ label: string; value: string }>
  channelUrl?: string
}

export type TicketCategoryKey = "support" | "complaint" | "punishment" | "bugs"

export interface TicketField {
  id: string
  emoji: string
  label: string
  description?: string
  kind: "short" | "paragraph" | "files"
  placeholder?: string
  required: boolean
  minLength?: number
  maxLength?: number
}

export interface TicketCategoryForm {
  key: TicketCategoryKey
  label: string
  description: string
  formTitle: string
  configured: boolean
  fields: TicketField[]
}

export interface TicketAttachment {
  url: string
  name: string
  isImage: boolean
}

export interface TicketMessage {
  id: string
  authorId: string
  authorName: string
  avatar: string
  isStaff: boolean
  system: boolean
  viaDashboard: boolean
  content: string
  attachments: TicketAttachment[]
  createdAt: string
  editedAt: string | null
}

export interface UploadPayload {
  name: string
  data: string
}

export interface StaffPerformance {
  id: string
  totalClosed: number
  averageTime: string
}

export interface TicketStats {
  total: number
  opened: number
  closed: number
  support: number
  complaints: number
  bugs: number
  punishments: number
  transcripts: number
  averageTime: string
  bestStaff: StaffPerformance | null
  fastestStaff: StaffPerformance | null
}

export interface TranscriptSummary {
  _id: string
  codigo: string
  userId: string
  type: string
  typeLabel: string
  closedByName: string
  createdAt: string
}

export interface TranscriptMessage {
  authorId: string
  username: string
  displayName: string
  avatar: string
  isStaff: boolean
  content: string
  attachments: string[]
  createdAt: string
}

export interface TranscriptDetail extends TranscriptSummary {
  messages: TranscriptMessage[]
}

export interface StaffOnline {
  id: string
  username: string
  displayName: string
  avatar: string
  status: string
  role: { key: string; roleId: string; name: string; rank: number }
}

export interface TicketSearchHit {
  _id: string
  codigo: string
  motivo?: string
  type: string
}

export interface SearchResults {
  tickets: TicketSearchHit[]
  transcripts: TranscriptSummary[]
  staff: Array<{ id: string; username: string; displayName: string; avatar: string }>
  feedback: Array<{ _id: string; comment: string; staffName: string; rating: number; createdAt: string }>
}

export interface LogActor {
  id: string
  name: string
  avatar: string | null
  roleName: string | null
  roleColor: string | null
  inServer: boolean
}

export interface LogChange {
  label: string
  from?: string | null
  to?: string | null
}

export interface DashboardLog {
  _id: string
  type: string
  title: string
  description: string
  staffId?: string
  staffName?: string
  staffAvatar?: string
  targetId?: string | null
  targetName?: string | null
  ticketCode?: string
  corporation?: string | null
  reason?: string | null
  details?: Array<{ label: string; value: string }> | null
  changes?: LogChange[] | null
  author?: LogActor | null
  target?: LogActor | null
  createdAt: string
}

export interface PaginatedLogs {
  logs: DashboardLog[]
  total: number
  page: number
  totalPages: number
}

export interface LogsStats {
  total: number
  byType: Array<{ type: string; total: number }>
  topStaff: Array<{ _id: string; staffName: string; staffAvatar: string; total: number }>
}

export interface NotificationItem {
  id: string
  type: string
  title: string
  description: string
  read: boolean
  createdAt: string
  staffName?: string | null
  staffAvatar?: string | null
  targetName?: string | null
  ticketCode?: string | null
  corporation?: string | null
  reason?: string | null
  details?: Array<{ label: string; value: string }> | null
  changes?: LogChange[] | null
}

export interface UserProfileStats {
  ticketsCreated: number
  ticketsClosed: number
  transcripts: number
  averageTime: string
  joinedAt: string | null
  accountCreatedAt: string | null
}

export type FivemCharacter =
  | { linked: false; reason: "not_configured" }
  | { linked: false; reason?: undefined }
  | {
      linked: true
      characterName: string | null
      wallet: number
      bank: number
      vehicleCount: number
      businessCount: number
      isVip: boolean
      corporation: { name: string; patenteName: string | null } | null
      groups: string[]
    }

export interface DiscordRole {
  id: string
  name: string
  color: string
}

// ── Feedback ────────────────────────────────────────────────────────────────
export interface FeedbackItem {
  _id: string
  guildId: string
  ticketCode: string
  ticketType: string
  userId: string
  username: string
  userAvatar: string
  staffId: string | null
  staffName: string | null
  rating: number
  comment: string | null
  createdAt: string
}

export interface PaginatedFeedback {
  feedbacks: FeedbackItem[]
  total: number
  page: number
  totalPages: number
}

export interface FeedbackStats {
  total: number
  avgRating: number
  withComment: number
  ratingDist: Record<number, number>
  topStaff: Array<{ _id: string; staffName: string; avgRating: number; total: number }>
}

// ── Analytics ───────────────────────────────────────────────────────────────
export interface TicketsByDay {
  label: string
  total: number
}

export interface TicketCategory {
  type: string
  label: string
  total: number
  percent: number
}

export interface BusyHour {
  hour: string
  total: number
}

export interface DashboardAnalytics {
  ticketsByDay: TicketsByDay[]
  categories: TicketCategory[]
  busyHours: BusyHour[]
  advanced: {
    averageCloseTime: string
    currentWeekTotal: number
    previousWeekTotal: number
    weeklyGrowth: number
    closedTickets: number
  }
}

// ── Settings / system status ───────────────────────────────────────────────
export interface DashboardConfigFull {
  name: string
  logoUrl: string
  status: DashboardStatus
  statusMessage: string
  storeOpen: boolean
  returnAt: number | null
  autoReturn: boolean
  description: string
  inviteUrl: string
  announcement: DashboardAnnouncement
  guildName: string
  guildIcon: string
}

// ── Configurações → Servidor ────────────────────────────────────────────────
export type BindingStatus = "ok" | "unset" | "missing"

export interface ServerChannelItem {
  key: string
  label: string
  channelId: string | null
  name: string | null
  status: BindingStatus
}

export interface ServerChannelGroup {
  id: string
  label: string
  description: string
  items: ServerChannelItem[]
}

export interface ServerRoleItem {
  key: string
  label: string
  tier: "admin" | "staff"
  roleId: string | null
  name: string | null
  color: string | null
  members: number
  status: BindingStatus
}

export interface ServerSettings {
  canEdit: boolean
  guild: {
    id: string
    name: string
    icon: string
    memberCount: number
    cachedMembers: number
    boostTier: number
    boostCount: number
    channelCount: number
    roleCount: number
    createdAt: string
  }
  channelGroups: ServerChannelGroup[]
  roles: ServerRoleItem[]
  health: { configured: number; total: number; broken: number }
  syncCooldownSeconds: number
  options: {
    channels: Array<{ id: string; name: string; category: string | null }>
    roles: Array<{ id: string; name: string; color: string | null }>
  } | null
}

export interface SystemHealth {
  botOnline: boolean
  ping: number | null
  uptimeSeconds: number | null
  members: number | null
  webhooks: { logs: boolean; announcements: boolean; dashboardLogs: boolean; storeLogs: boolean }
}

export interface FivemStatus {
  online: boolean
  players: number
  maxPlayers: number
}
// ── Corporations ────────────────────────────────────────────────────────────
export type CorpPermission =
  | "hire" | "manage_members" | "fire" | "manage_patentes" | "edit_corp" | "view_history" | "view_vault" | "manage_vault"

export interface Patente {
  _id: string
  roleId?: string
  name: string
  description?: string
  order: number
  enabled?: boolean
  permissions?: CorpPermission[]
}

export interface CargoInterno {
  roleId: string
  name: string
  order: number
}

export type CorporationStatus = "active" | "inactive"

export interface Corporation {
  _id: string
  slug: string
  name: string
  description: string
  icon: string
  color: string
  secondaryColor: string
  logoUrl: string
  bannerUrl: string
  leaderId: string | null
  subLeaderId: string | null
  status: CorporationStatus
  approvedRole: string
  memberCount?: number
  patentes: Patente[]
  cargosInternos: CargoInterno[]
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export type MemberStatus = "active" | "away" | "suspended"

export interface CorporationMember {
  _id: string
  corpSlug: string
  userId: string
  rpName: string
  citizenId: string
  patenteId: string | null
  cargoInternoRoleId: string | null
  status: MemberStatus
  hiredAt: string
  hiredBy: string
  discordName: string | null
  discordAvatar: string | null
  patenteName: string | null
  cargoInternoName: string | null
}

export interface CorporationMemberDetail extends CorporationMember {
  discordUsername: string | null
  joinedServerAt: string | null
}

export type CorpHistoryAction =
  | "hire" | "fire" | "promote" | "demote" | "transfer" | "warn" | "suspend" | "unsuspend" | "away" | "return" | "edit"

export interface CorporationHistoryEntry {
  _id: string
  corpSlug: string
  userId: string
  action: CorpHistoryAction
  previousValue: string | null
  newValue: string | null
  reason: string
  performedBy: string
  createdAt: string
}

export interface CorporationStats {
  total: number
  active: number
  away: number
  suspended: number
  actionsByType: Array<{ action: string; total: number }>
}

// ── Whitelist ───────────────────────────────────────────────────────────────
export type WhitelistQuestionType = "text" | "single" | "multiple"

export interface WhitelistQuestion {
  id: string
  question: string
  description?: string
  order: number
  required: boolean
  type?: WhitelistQuestionType
  options?: string[]
}

export interface WhitelistAnswer {
  questionId: string
  question: string
  answer: string
  type?: WhitelistQuestionType
  values?: string[]
}

export interface WhitelistPreviousReview {
  answers: WhitelistAnswer[]
  reviewedByName: string | null
  reviewReason: string | null
  reviewedAt: string | null
}

export interface WhitelistMeOpen {
  status: "none" | "rejected"
  questions: WhitelistQuestion[]
  previous: WhitelistPreviousReview | null
}

export interface WhitelistMeActive {
  status: "pending" | "approved"
  answers: WhitelistAnswer[]
  submittedAt: string
  reviewedByName: string | null
  reviewedAt: string | null
}

export type WhitelistMeResponse = WhitelistMeOpen | WhitelistMeActive

export interface WhitelistPendingItem {
  _id: string
  userId: string
  username: string
  displayName: string
  avatar: string
  answers: WhitelistAnswer[]
  createdAt: string
  source: "dashboard" | "bot"
}

export interface WhitelistConfig {
  approvedRole: string
  questions: WhitelistQuestion[]
}

/* ---------- Loja ---------- */
export interface StoreCategory {
  id: string
  name: string
  description: string
  order: number
}

export interface StoreProduct {
  id: string
  name: string
  description: string
  priceCents: number
  image: string
  categoryId: string | null
  active: boolean
  contents: string[]
  order: number
  rewardRoleName: string | null
  deliveryCommands?: string[]
  rewardRoleId?: string | null
  stock: number | null
  soldOut: boolean
}

export interface StoreCatalog {
  categories: StoreCategory[]
  products: StoreProduct[]
  linked: boolean
  checkoutEnabled: boolean
  paused: boolean
}

export type StoreOrderStatus = "pending" | "paid" | "expired" | "canceled" | "refunded"
export type StoreDeliveryStatus = "waiting" | "queued" | "delivered" | "failed"

export interface StoreOrder {
  code: string
  status: StoreOrderStatus
  totalCents: number
  createdAt: string
  paidAt: string | null
  expiresAt: string
  subtotalCents: number
  discountCents: number
  coupon: { code: string; type: CouponType; value: number } | null
  items: {
    productId: string
    name: string
    image: string
    unitCents: number
    quantity: number
    description: string
    contents: string[]
    roleName: string | null
  }[]
  delivery: { status: StoreDeliveryStatus; total: number; done: number; error?: string }
  pix?: { qrCode: string | null; qrCodeBase64: string | null }
  userId?: string
  username?: string
  citizenid?: string | null
}

export interface StoreLog {
  id: string
  type: string
  title: string
  description: string
  actor: { id: string; name: string; avatar: string | null } | null
  orderCode: string | null
  amountCents: number | null
  details: { label: string; value: string }[]
  changes: { label: string; from?: string | null; to?: string | null }[]
  createdAt: string
}

export interface StoreLogsPage {
  logs: StoreLog[]
  total: number
  page: number
  totalPages: number
  types: { type: string; total: number }[]
}

export interface MercadoPagoState {
  configured: boolean
  tokenPreview: string | null
  hasWebhookSecret: boolean
  updatedAt: string | null
}

export type CouponType = "percent" | "fixed"

export interface StoreCoupon {
  id: string
  code: string
  type: CouponType
  value: number
  maxUses: number | null
  uses: number
  expiresAt: string | null
  active: boolean
  createdAt: string
}

export interface CouponPreview {
  coupon: { code: string; type: CouponType; value: number }
  subtotalCents: number
  discountCents: number
  totalCents: number
}


// ── Punições ────────────────────────────────────────────────────────────────
export type PunishmentKind = "ban" | "unban" | "warn" | "kick"

export interface PunishmentItem {
  id: string
  type: PunishmentKind
  reason: string
  staffName: string
  createdAt: string | null
  expiresAt: string | null
  permanent: boolean
  active: boolean
  targetName: string
}

export interface PunishmentHistory {
  items: PunishmentItem[]
  fivemConnected: boolean
  summary: {
    total: number
    bans: number
    warns: number
    kicks: number
    activeBan: { reason: string; expiresAt: string | null; permanent: boolean } | null
  }
}

export interface PlayerLookup extends PunishmentHistory {
  target: { license: string | null; discordId: string | null; citizenid: string | null; name: string }
}

export interface RecentPunishment {
  id: string
  type: PunishmentKind
  targetName: string
  reason: string
  staffName: string
  createdAt: string
  expiresAt: string | null
  permanent: boolean
}

// ── Changelog ───────────────────────────────────────────────────────────────
export type ChangelogCategory = "feature" | "fix" | "economy" | "vehicles" | "balance" | "patch"

export interface ChangelogEntry {
  id: string
  title: string
  version: string
  category: ChangelogCategory
  content: string
  publishedAt: string
  authorName: string
  edited: boolean
}

export interface ChangelogInput {
  title: string
  version: string
  category: ChangelogCategory
  content: string
  publishedAt?: string
}

// ── Eventos ─────────────────────────────────────────────────────────────────
export type EventCategory = "race" | "auction" | "faction" | "meeting" | "special" | "other"

export interface RoleplayEvent {
  id: string
  title: string
  description: string
  location: string
  category: EventCategory
  startsAt: string
  endsAt: string | null
  status: "scheduled" | "cancelled"
  cancelReason: string | null
  createdByName: string
}

export interface EventInput {
  title: string
  description: string
  location: string
  category: EventCategory
  startsAt: string
  endsAt: string | null
}

// ── Analytics em tempo real ─────────────────────────────────────────────────
export type LiveRange = "24h" | "7d" | "30d"

export interface LiveAnalytics {
  range: LiveRange
  generatedAt: number
  economyRestricted: boolean
  players: {
    current: number
    max: number
    online: boolean
    peak: { value: number; at: number } | null
    average: number
    series: Array<{ t: number; players: number }>
  }
  economy: {
    current: { cash: number; bank: number; total: number }
    change: number
    series: Array<{ t: number; cash: number; bank: number; total: number }>
  } | null
  tickets: {
    open: number
    series: Array<{ t: number; open: number }>
    daily: Array<{ label: string; created: number }>
  }
}

// ── Corporações: código de vinculação ───────────────────────────────────────
export interface CorpLinkStatus {
  exists: boolean
  hint?: string
  createdAt?: string
  createdByName?: string
  lastUsedAt?: string | null
  uses?: number
}

export interface CorpLinkIssued extends CorpLinkStatus {
  code: string
}
