import { http } from "@/api/client"

export interface PublicStats {
  playersOnline: number
  discordMembers: number
  organizations: number
  companies: number
}

export const publicStatsService = {
  get: () => http.get<PublicStats>("/api/dashboard/public-stats"),
}
