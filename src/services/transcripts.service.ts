import { http } from "@/api/client"
import type { TranscriptDetail, TranscriptSummary } from "@/types"

export const transcriptsService = {
  list: () => http.get<{ transcripts: TranscriptSummary[] }>("/api/transcripts"),
  detail: (id: string) => http.get<{ transcript: TranscriptDetail }>(`/api/transcripts/${id}`),
}
