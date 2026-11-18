import { http } from "@/api/client"
import type { FivemStatus } from "@/types"

export const fivemService = {
  status: () => http.get<FivemStatus>("/api/fivem/status"),
}
