import { http } from "@/api/client"
import type {
  BackupItem, BackupSchedule, BackupsResponse, GalleryImage, GalleryManageImage, MyProfile, ServerStatus, Suggestion,
  SuggestionCategory, SuggestionStatus, TaxesResponse, VaultCorp, VaultDetail,
} from "@/types/modules"

export const galleryService = {
  list: () => http.get<{ items: GalleryImage[] }>("/api/gallery"),
  manage: () => http.get<{ items: GalleryManageImage[]; limit: number }>("/api/gallery/manage"),
  upload: (file: File) => http.upload<GalleryManageImage>("/api/gallery", file, { "x-file-name": encodeURIComponent(file.name) }),
  remove: (id: string) => http.delete<{ ok: true }>(`/api/gallery/${id}`),
}

export const backupsService = {
  list: () => http.get<BackupsResponse>("/api/backups"),
  create: (scope: "panel" | "server") => http.post<BackupItem>("/api/backups", { scope }),
  restore: (id: string, confirm: string) => http.post<{ ok: true }>(`/api/backups/${id}/restore`, { confirm }),
  remove: (id: string) => http.delete<{ ok: true }>(`/api/backups/${id}`),
  saveSchedule: (schedule: Pick<BackupSchedule, "enabled" | "intervalHours" | "keepLast">) => http.put<BackupSchedule>("/api/backups/schedule", schedule),
  downloadUrl: (id: string) => `/api/backups/${id}/download`,
}

export const serverStatusService = {
  get: () => http.get<ServerStatus>("/api/server-status"),
  refreshEmbed: () => http.post<{ ok: true }>("/api/server-status/embed/refresh"),
}

export const suggestionsService = {
  list: (sort: "top" | "new", status?: SuggestionStatus) =>
    http.get<{ items: Suggestion[]; canManage: boolean }>(`/api/suggestions?sort=${sort}${status ? `&status=${status}` : ""}`),
  create: (body: { title: string; content: string; category: SuggestionCategory }) => http.post<Suggestion>("/api/suggestions", body),
  vote: (id: string, value: 1 | -1 | 0) => http.post<Suggestion>(`/api/suggestions/${id}/vote`, { value }),
  setStatus: (id: string, status: SuggestionStatus, note: string) => http.patch<Suggestion>(`/api/suggestions/${id}/status`, { status, note }),
  remove: (id: string) => http.delete<{ ok: true }>(`/api/suggestions/${id}`),
}

export type VaultScope = "corp" | "faction"
const vaultBase = (scope: VaultScope) => (scope === "faction" ? "/api/vault/factions" : "/api/vault")

export const vaultService = {
  corps: (scope: VaultScope = "corp") => http.get<{ items: VaultCorp[] }>(vaultBase(scope)),
  detail: (slug: string, page: number, type: "" | "deposit" | "withdraw", scope: VaultScope = "corp") =>
    http.get<VaultDetail>(`${vaultBase(scope)}/${slug}?page=${page}${type ? `&type=${type}` : ""}`),
  move: (slug: string, body: { type: "deposit" | "withdraw"; amount: number; note: string }, scope: VaultScope = "corp") => http.post<{ balance: number }>(`${vaultBase(scope)}/${slug}/transactions`, body),
  setChannel: (slug: string, financeChannelId: string, scope: VaultScope = "corp") => http.put<{ financeChannelId: string | null }>(`${vaultBase(scope)}/${slug}/settings`, { financeChannelId }),
}

export const taxesService = {
  list: () => http.get<TaxesResponse>("/api/taxes"),
  create: (body: Record<string, unknown>) => http.post<unknown>("/api/taxes", body),
  setPaid: (id: string, paid: boolean) => http.patch<{ ok: true }>(`/api/taxes/${id}/paid`, { paid }),
  remove: (id: string) => http.delete<{ ok: true }>(`/api/taxes/${id}`),
}

export const profileService = {
  me: () => http.get<MyProfile>("/api/profile/me"),
  save: (body: { bio: string; steam: string; epic: string }) => http.put<Pick<MyProfile, "bio" | "steam" | "epic">>("/api/profile/me", body),
}

export interface RuleItem { id: string; title: string; description: string; order: number; updatedAt: string }
export interface RuleCategory { type: string; label: string; description: string; rules: RuleItem[] }
export interface RulesResponse { limits: { title: number; description: number }; categories: RuleCategory[] }

export const rulesService = {
  list: () => http.get<RulesResponse>("/api/rules"),
  create: (type: string, body: { title: string; description: string }) => http.post<RuleItem>("/api/rules", { type, ...body }),
  update: (id: string, body: { title: string; description: string }) => http.patch<RuleItem>(`/api/rules/${id}`, body),
  remove: (id: string) => http.delete<{ ok: true }>(`/api/rules/${id}`),
  reorder: (type: string, ids: string[]) => http.put<{ ok: true }>("/api/rules/reorder", { type, ids }),
}
