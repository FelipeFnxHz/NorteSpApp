import { http } from "@/api/client"
import type { ChangelogEntry, ChangelogInput, EventInput, LiveAnalytics, LiveRange, PlayerLookup, PunishmentHistory, RecentPunishment, RoleplayEvent, } from "@/types"

export const punishmentsService = {
  me: () => http.get<PunishmentHistory>("/api/punishments/me"),
  lookup: (query: string) => http.get<PlayerLookup>(`/api/punishments/lookup?q=${encodeURIComponent(query)}`),
  recent: () => http.get<{ items: RecentPunishment[] }>("/api/punishments/recent"),
  ban: (body: { target: string; reason: string; durationHours: number | null }) =>
    http.post<{ ok: true; targetName: string }>("/api/punishments/ban", body),
  unban: (body: { target: string; reason: string }) => http.post<{ ok: true; targetName: string }>("/api/punishments/unban", body),
  warn: (body: { target: string; reason: string }) => http.post<{ ok: true; targetName: string }>("/api/punishments/warn", body),
}

export const changelogService = {
  list: () => http.get<{ items: ChangelogEntry[] }>("/api/changelog"),
  create: (body: ChangelogInput) => http.post<ChangelogEntry>("/api/changelog", body),
  update: (id: string, body: Partial<ChangelogInput>) => http.patch<ChangelogEntry>(`/api/changelog/${id}`, body),
  remove: (id: string) => http.delete<{ ok: true }>(`/api/changelog/${id}`),
}

export const eventsService = {
  list: (all = false) => http.get<{ items: RoleplayEvent[]; canManage: boolean }>(`/api/events${all ? "?all=1" : ""}`),
  create: (body: EventInput) => http.post<RoleplayEvent>("/api/events", body),
  update: (id: string, body: Partial<EventInput>) => http.patch<RoleplayEvent>(`/api/events/${id}`, body),
  cancel: (id: string, reason: string) => http.post<RoleplayEvent>(`/api/events/${id}/cancel`, { reason }),
}

export const liveAnalyticsService = {
  live: (range: LiveRange) => http.get<LiveAnalytics>(`/api/analytics/live?range=${range}`),
}
