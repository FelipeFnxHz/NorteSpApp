import { http } from "@/api/client"
import type { CorpLinkIssued, CorpLinkStatus, Corporation, CorporationHistoryEntry, CorporationMember, CorporationMemberDetail, CorporationStats, CorpPermission, MemberStatus } from "@/types"

export interface HireBody {
  userId: string
  patenteId?: string
  cargoInternoRoleId?: string
  reason?: string
}

export interface UpdateMemberBody {
  patenteId?: string | null
  cargoInternoRoleId?: string | null
  status?: "active" | "away" | "suspended"
  reason?: string
  action?: "promote" | "demote" | "transfer" | "warn" | "suspend" | "unsuspend" | "edit"
}

export interface CreateCorporationBody {
  name: string
  description?: string
  icon?: string
  color?: string
  approvedRole?: string
}

export interface CreatePatenteBody {
  roleId?: string
  name: string
  description?: string
  permissions?: CorpPermission[]
}

export interface UpdatePatenteBody {
  name?: string
  description?: string
  roleId?: string
  order?: number
  enabled?: boolean
  permissions?: CorpPermission[]
}

export const corporationsService = {
  linkStatus: (slug: string) => http.get<CorpLinkStatus>(`/api/corporations/${slug}/link-code`),
  generateLinkCode: (slug: string) => http.post<CorpLinkIssued>(`/api/corporations/${slug}/link-code`),
  revokeLinkCode: (slug: string) => http.delete<{ ok: true }>(`/api/corporations/${slug}/link-code`),
  list: () => http.get<{ corporations: Corporation[] }>("/api/corporations"),
  myPermissions: () => http.get<{ bySlug: Record<string, CorpPermission[]>; memberOf: string[] }>("/api/corporations/my-permissions"),
  get: (slug: string) => http.get<{ corporation: Corporation }>(`/api/corporations/${slug}`),
  create: (body: CreateCorporationBody) => http.post<{ corporation: Corporation }>("/api/corporations", body),
  update: (slug: string, body: Partial<CreateCorporationBody>) =>
    http.patch<{ corporation: Corporation }>(`/api/corporations/${slug}`, body),
  setStatus: (slug: string, status: "active" | "inactive") =>
    http.post<{ corporation: Corporation }>(`/api/corporations/${slug}/status`, { status }),
  remove: (slug: string) => http.delete<{ success: true }>(`/api/corporations/${slug}`),
  syncFromForms: () =>
    http.post<{ created: string[]; skipped: string[]; corporations: Corporation[] }>(
      "/api/corporations/sync-from-forms",
    ),

  addPatente: (slug: string, body: CreatePatenteBody) =>
    http.post<{ corporation: Corporation }>(`/api/corporations/${slug}/patentes`, body),
  updatePatente: (slug: string, patenteId: string, body: UpdatePatenteBody) =>
    http.patch<{ corporation: Corporation }>(`/api/corporations/${slug}/patentes/${patenteId}`, body),
  reorderPatentes: (slug: string, ids: string[]) =>
    http.put<{ corporation: Corporation }>(`/api/corporations/${slug}/patentes/order`, { ids }),
  removePatente: (slug: string, patenteId: string) =>
    http.delete<{ corporation: Corporation }>(`/api/corporations/${slug}/patentes/${patenteId}`),

  members: (slug: string) => http.get<{ members: CorporationMember[] }>(`/api/corporations/${slug}/members`),
  memberDetail: (slug: string, userId: string) =>
    http.get<{ member: CorporationMemberDetail; history: CorporationHistoryEntry[]; historyHidden?: boolean }>(
      `/api/corporations/${slug}/members/${userId}`,
    ),
  hire: (slug: string, body: HireBody) =>
    http.post<{ member: CorporationMember }>(`/api/corporations/${slug}/members`, body),
  updateMember: (slug: string, userId: string, body: UpdateMemberBody) =>
    http.patch<{ member: CorporationMember }>(`/api/corporations/${slug}/members/${userId}`, body),
  setMemberStatus: (slug: string, userId: string, body: { status: MemberStatus; reason?: string }) =>
    http.post<{ member: CorporationMember; unchanged: boolean }>(`/api/corporations/${slug}/members/${userId}/status`, body),
  fire: (slug: string, userId: string, reason?: string) =>
    http.delete<{ success: true }>(`/api/corporations/${slug}/members/${userId}`, { reason }),

  history: (slug: string, page = 1) =>
    http.get<{ history: CorporationHistoryEntry[]; total: number; page: number; totalPages: number }>(
      `/api/corporations/${slug}/history?page=${page}`,
    ),
  stats: (slug: string) => http.get<CorporationStats>(`/api/corporations/${slug}/stats`),
}
