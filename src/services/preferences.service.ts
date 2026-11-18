import { http } from "@/api/client"
import type { AppearancePrefs } from "@/lib/appearance"

export const preferencesService = {
  get: () => http.get<{ appearance: AppearancePrefs }>("/api/preferences"),
  save: (patch: Partial<AppearancePrefs>) => http.put<{ appearance: AppearancePrefs }>("/api/preferences/appearance", patch),
  reset: () => http.delete<{ appearance: AppearancePrefs }>("/api/preferences/appearance"),
}
