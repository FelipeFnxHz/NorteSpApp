import { http } from "@/api/client"
import type { NotificationItem } from "@/types"

export const notificationsService = {
  list: () => http.get<{ notifications: NotificationItem[] }>("/api/notifications"),
  markRead: (id: string) => http.post<void>(`/api/notifications/${id}/read`),
  markAllRead: () => http.post<void>("/api/notifications/read-all"),
}
