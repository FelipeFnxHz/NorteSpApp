import { http } from "@/api/client"
import type { DashboardConfig, DashboardStatus, SessionUser } from "@/types"

export const authService = {
  me: () => http.get<{ user: SessionUser }>("/api/user/me"),
  status: () => http.get<{ status: DashboardStatus }>("/api/dashboard/status"),
  config: () => http.get<DashboardConfig>("/api/dashboard/config"),
  logout: () => http.post<void>("/auth/logout"),
}
