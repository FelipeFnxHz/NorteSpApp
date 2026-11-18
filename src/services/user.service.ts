import { http } from "@/api/client"
import type { DiscordRole, FivemCharacter, UserProfileStats } from "@/types"

export const userService = {
  profile: () => http.get<UserProfileStats>("/api/user/profile"),
  fivemCharacter: () => http.get<FivemCharacter>("/api/user/fivem-character"),
  discordRole: () => http.get<{ role: DiscordRole | null }>("/api/user/discord-role"),
}