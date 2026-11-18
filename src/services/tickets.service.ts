import { http } from "@/api/client"
import type {
  TicketCategoryForm,
  TicketDetail,
  TicketMessage,
  TicketStats,
  TicketSummary,
  UploadPayload,
} from "@/types"

export interface OpenTicketInput {
  category: string
  answers: Record<string, string>
  files: UploadPayload[]
}

export const ticketsService = {
  list: () => http.get<{ tickets: TicketSummary[] }>("/api/tickets"),
  stats: () => http.get<TicketStats>("/api/tickets/stats"),
  categories: () => http.get<{ categories: TicketCategoryForm[] }>("/api/tickets/categories"),
  open: (input: OpenTicketInput) => http.post<{ codigo: string; channelUrl: string }>("/api/tickets", input),
  detail: (codigo: string) => http.get<{ ticket: TicketDetail }>(`/api/tickets/${codigo}`),
  messages: (codigo: string) => http.get<{ live: boolean; messages: TicketMessage[] }>(`/api/tickets/${codigo}/messages`),
  send: (codigo: string, content: string, files: UploadPayload[]) =>
    http.post<{ message: TicketMessage | null }>(`/api/tickets/${codigo}/messages`, { content, files }),
  claim: (codigo: string) => http.post<void>(`/api/tickets/${codigo}/claim`),
  drop: (codigo: string) => http.post<void>(`/api/tickets/${codigo}/drop`),
  notifyOwner: (codigo: string) => http.post<{ message: string }>(`/api/tickets/${codigo}/notify`),
  close: (codigo: string) => http.post<void>(`/api/tickets/${codigo}/close`),
  remove: (codigo: string) => http.delete<void>(`/api/tickets/${codigo}`),
}
