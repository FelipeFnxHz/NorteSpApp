import { http } from "@/api/client"
import type { FeedbackStats, PaginatedFeedback } from "@/types"

export interface FeedbackFilter {
  page?: number
  limit?: number
}

export const feedbackService = {
  list: (filter: FeedbackFilter = {}) => {
    const params = new URLSearchParams()
    if (filter.page) params.set("page", String(filter.page))
    if (filter.limit) params.set("limit", String(filter.limit))
    const query = params.toString()
    return http.get<PaginatedFeedback>(`/api/feedback${query ? `?${query}` : ""}`)
  },
  stats: () => http.get<FeedbackStats>("/api/feedback/stats"),
}
