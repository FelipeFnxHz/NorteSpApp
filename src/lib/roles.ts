import type { DiscordRole, UserRole } from "@/types"

/** Fallback só para o tempo em que o cargo real do Discord ainda não chegou. */
export const ROLE_LABEL: Record<UserRole, string> = {
  member: "Membro",
  staff: "Staff",
  admin: "Administrador",
}

export function resolveRoleLabel(discordRole: DiscordRole | null, role: UserRole | undefined): string {
  return discordRole?.name ?? ROLE_LABEL[role ?? "member"]
}

export function resolveRoleColor(discordRole: DiscordRole | null): string | undefined {
  return discordRole?.color && discordRole.color !== "#000000" ? discordRole.color : undefined
}
