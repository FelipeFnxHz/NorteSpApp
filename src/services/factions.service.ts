import { http } from "@/api/client"
import type { CorpPermission, MemberStatus } from "@/types"
import type { Faction, FactionBody, FactionMember, FactionStats } from "@/types/factions"

export interface UpdateFactionMemberBody {
  patenteId?: string | null
  status?: MemberStatus
  rpName?: string
  citizenId?: string
  reason?: string
}

const base = "/api/factions"

export const factionsService = {
  list: () => http.get<{ factions: Faction[] }>(base),
  get: (slug: string) => http.get<{ faction: Faction }>(`${base}/${slug}`),
  stats: (slug: string) => http.get<FactionStats>(`${base}/${slug}/stats`),
  create: (body: FactionBody) => http.post<{ faction: Faction }>(base, body),
  update: (slug: string, body: FactionBody) => http.patch<{ faction: Faction }>(`${base}/${slug}`, body),
  setStatus: (slug: string, status: "active" | "inactive") => http.post<{ faction: Faction }>(`${base}/${slug}/status`, { status }),
  remove: (slug: string) => http.delete<{ success: true }>(`${base}/${slug}`),

  addPatente: (slug: string, body: { name: string; roleId?: string; description?: string; permissions?: CorpPermission[] }) =>
    http.post<{ faction: Faction }>(`${base}/${slug}/patentes`, body),
  updatePatente: (slug: string, id: string, body: { name?: string; roleId?: string; enabled?: boolean; permissions?: CorpPermission[] }) =>
    http.patch<{ faction: Faction }>(`${base}/${slug}/patentes/${id}`, body),
  reorderPatentes: (slug: string, ids: string[]) => http.put<{ faction: Faction }>(`${base}/${slug}/patentes/order`, { ids }),
  removePatente: (slug: string, id: string) => http.delete<{ faction: Faction }>(`${base}/${slug}/patentes/${id}`),

  members: (slug: string) => http.get<{ members: FactionMember[] }>(`${base}/${slug}/members`),
  hire: (slug: string, body: { userId: string; patenteId?: string; rpName?: string; citizenId?: string; reason?: string }) =>
    http.post<{ member: FactionMember }>(`${base}/${slug}/members`, body),
  updateMember: (slug: string, userId: string, body: UpdateFactionMemberBody) =>
    http.patch<{ member: FactionMember; unchanged: boolean }>(`${base}/${slug}/members/${userId}`, body),
  fire: (slug: string, userId: string, reason?: string) =>
    http.delete<{ success: true }>(`${base}/${slug}/members/${userId}`, { reason }),
}
