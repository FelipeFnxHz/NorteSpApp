export interface GalleryImage { id: string; src: string; alt: string }
export interface GalleryManageImage extends GalleryImage { fileName: string; size: number; uploadedByName: string; createdAt: string; available: boolean }

export interface BackupItem {
  id: string
  scope: "panel" | "server"
  kind: "manual" | "scheduled" | "pre-restore"
  status: "running" | "completed" | "failed"
  sizeBytes: number
  collectionCount: number
  totalRecords: number
  truncated: boolean
  error: string | null
  createdByName: string
  createdAt: string
  finishedAt: string | null
  restoredAt: string | null
}
export interface BackupSchedule { enabled: boolean; intervalHours: number; keepLast: number; lastRunAt: number }
export interface BackupsResponse { items: BackupItem[]; schedule: BackupSchedule; busy: boolean }

export interface ServerStatus {
  online: boolean
  hostname: string | null
  version: string | null
  players: { current: number; max: number }
  pingAvg: number | null
  resources: number | null
  connect: string
  joinUrl: string
  machine: { cpu: number | null; memoryMb: number | null; reportedAt: string | null }
  updatedAt: string
}

export type SuggestionStatus = "review" | "approved" | "in_progress" | "implemented" | "rejected"
export type SuggestionCategory = "vehicles" | "economy" | "rules" | "jobs" | "events" | "other"
export interface Suggestion {
  id: string
  title: string
  content: string
  category: SuggestionCategory
  status: SuggestionStatus
  statusNote: string | null
  statusChangedByName: string | null
  author: { id: string; name: string; avatar: string | null }
  up: number
  down: number
  score: number
  myVote: 1 | -1 | 0
  canDelete: boolean
  createdAt: string
  updatedAt: string
}

export interface VaultCorp { slug: string; name: string; icon: string; color: string; balance: number }
export interface VaultTransaction { id: string; type: "deposit" | "withdraw"; amount: number; balanceAfter: number; actorName: string; source: "dashboard" | "game"; note: string; createdAt: string }
export interface VaultDetail {
  corp: { slug: string; name: string; icon: string; color: string }
  balance: number
  canManage: boolean
  financeChannelId: string | null
  stats: { deposits30d: number; withdraws30d: number }
  total: number
  page: number
  pages: number
  items: VaultTransaction[]
}

export type TaxStatus = "paid" | "overdue" | "due_soon" | "pending"
export interface TaxEntry {
  id: string
  ownerType: "user" | "corp"
  ownerId: string
  ownerName: string
  label: string
  amount: number
  dueAt: string
  paidAt: string | null
  recurrenceDays: number | null
  status: TaxStatus
  daysLeft: number
  createdByName: string
}
export interface TaxesResponse {
  items: TaxEntry[]
  canStaffCreate: boolean
  corps: Array<{ slug: string; name: string; manage: boolean }>
  summary: { overdue: number; dueSoon: number; totalOpen: number }
}

export interface MyProfile { bio: string; steam: string; epic: string; discord: { id: string; username: string; avatar: string | null } }
