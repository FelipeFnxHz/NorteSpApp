import { http } from "@/api/client"
import type { LogsStats, PaginatedLogs, StaffOnline } from "@/types"

export interface StaffRole {
  key: string
  name: string
  roleId: string
  color: string | null
}

export interface LogsFilter {
  page?: number
  limit?: number
  type?: string
}

export const staffService = {
  hierarchy: () => http.get<{ staffRoles: StaffRole[] }>("/api/staff"),
  online: () => http.get<{ total: number; staff: StaffOnline[] }>("/api/staff/online"),
  logs: (filter: LogsFilter = {}) => {
    const params = new URLSearchParams()
    if (filter.page) params.set("page", String(filter.page))
    if (filter.limit) params.set("limit", String(filter.limit))
    if (filter.type) params.set("type", filter.type)
    const query = params.toString()
    return http.get<PaginatedLogs>(`/api/notifications/logs${query ? `?${query}` : ""}`)
  },
  logsStats: () => http.get<LogsStats>("/api/notifications/logs/stats"),
}

export interface StaffMember {
  id: string
  username: string
  displayName: string
  avatar: string
  status: "online" | "idle" | "dnd" | "offline"
  role: { key: string; roleId: string; name: string; rank: number; color: string | null }
  extraRoles: string[]
}
export interface StaffHierarchyRole { key: string; name: string; roleId: string; rank: number; color: string | null; count: number }
export interface StaffMembersResponse {
  members: StaffMember[]
  roles: StaffHierarchyRole[]
  permissions: { canManage: boolean; actorRank: number | null; assignable: string[] }
}
export interface StaffCandidate { id: string; username: string; displayName: string; avatar: string }

export const staffManageService = {
  members: () => http.get<StaffMembersResponse>("/api/staff/members"),
  candidates: (query: string) => http.get<{ items: StaffCandidate[] }>(`/api/staff/candidates?q=${encodeURIComponent(query)}`),
  add: (userId: string, roleKey: string) => http.post<{ ok: true }>("/api/staff/members", { userId, roleKey }),
  changeRole: (userId: string, roleKey: string) => http.patch<{ ok: true }>(`/api/staff/members/${userId}`, { roleKey }),
  remove: (userId: string) => http.delete<{ ok: true }>(`/api/staff/members/${userId}`),
}
