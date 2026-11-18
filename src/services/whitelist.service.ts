import { http } from "@/api/client"
import type { WhitelistConfig, WhitelistMeResponse, WhitelistPendingItem, WhitelistQuestion, WhitelistQuestionType } from "@/types"

export interface WhitelistAnswerInput {
  questionId: string
  /** Texto livre — usado quando a pergunta é do tipo "text". */
  answer?: string
  /** Opções escolhidas — usado em "single" e "multiple". */
  values?: string[]
}

export interface QuestionBody {
  question?: string
  description?: string
  required?: boolean
  order?: number
  type?: WhitelistQuestionType
  options?: string[]
}

export const whitelistService = {
  me: () => http.get<WhitelistMeResponse>("/api/whitelist/me"),
  apply: (answers: WhitelistAnswerInput[]) =>
    http.post<{ response: { _id: string; status: string } }>("/api/whitelist/apply", { answers }),

  pending: () => http.get<{ pending: WhitelistPendingItem[] }>("/api/whitelist/pending"),
  approve: (id: string, reason?: string) => http.post<{ message: string }>(`/api/whitelist/${id}/approve`, { reason }),
  reject: (id: string, reason?: string) => http.post<{ message: string }>(`/api/whitelist/${id}/reject`, { reason }),

  config: () => http.get<WhitelistConfig>("/api/whitelist/config"),
  updateApprovedRole: (approvedRole: string) =>
    http.patch<{ approvedRole: string }>("/api/whitelist/config", { approvedRole }),

  addQuestion: (body: QuestionBody) => http.post<{ questions: WhitelistQuestion[] }>("/api/whitelist/questions", body),
  updateQuestion: (id: string, body: QuestionBody) =>
    http.patch<{ questions: WhitelistQuestion[] }>(`/api/whitelist/questions/${id}`, body),
  reorderQuestions: (ids: string[]) => http.put<{ questions: WhitelistQuestion[] }>("/api/whitelist/questions/order", { ids }),
  removeQuestion: (id: string) => http.delete<{ questions: WhitelistQuestion[] }>(`/api/whitelist/questions/${id}`),
}
