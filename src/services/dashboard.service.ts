import { http } from "@/api/client"
import type { AnnouncementTone, DashboardAnalytics, DashboardConfigFull, DashboardStatus, SearchResults, ServerSettings, SystemHealth } from "@/types"

export interface DashboardOverview {
  total: number
  opened: number
  closed: number
  bugs: number
  complaints: number
  punishments: number
  transcripts: number
}

export const dashboardService = {
  overview: () => http.get<DashboardOverview>("/api/dashboard/overview"),
  search: (query: string) => http.get<SearchResults>(`/api/dashboard/search?q=${encodeURIComponent(query)}`),
  analytics: () => http.get<DashboardAnalytics>("/api/dashboard/analytics"),
  config: () => http.get<DashboardConfigFull>("/api/dashboard/config"),
  updateConfig: (body: {
    name?: string
    logoUrl?: string
    description?: string
    inviteUrl?: string
    announcement?: { enabled: boolean; text: string; tone: AnnouncementTone }
    resetIdentity?: boolean
  }) => http.patch<{ message: string }>("/api/dashboard/config", body),
  setStatus: (status: DashboardStatus) => http.post<{ status: DashboardStatus }>("/api/dashboard/status", { status }),
  updateSettings: (body: { statusMessage?: string; storeOpen?: boolean; returnAt?: number | null; autoReturn?: boolean }) => http.patch<{ ok: true }>("/api/dashboard/settings", body),
  revokeSessions: () => http.post<{ ok: true }>("/api/dashboard/sessions/revoke"),
  system: () => http.get<SystemHealth>("/api/dashboard/system"),
  server: () => http.get<ServerSettings>("/api/dashboard/server"),
  setServerChannel: (key: string, channelId: string | null) => http.patch<{ ok: true }>("/api/dashboard/server/channels", { key, channelId }),
  setServerRole: (key: string, roleId: string | null) => http.patch<{ ok: true }>("/api/dashboard/server/roles", { key, roleId }),
  syncServer: () => http.post<{ ok: true; members: number; durationMs: number }>("/api/dashboard/server/sync"),
  roles: () => http.get<{ roles: Array<{ id: string; name: string; color: string }> }>("/api/dashboard/roles"),
}
