import { http } from "@/api/client"

export interface DeveloperBadge {
  name: string
  color: string | null
}

export interface DeveloperCard {
  id: string
  username: string
  displayName: string
  avatar: string
  status: string
  title: string
  badges: DeveloperBadge[]
  profileUrl: string
}

export const developersService = {
  list: () => http.get<{ developers: DeveloperCard[] }>("/api/dashboard/developers"),
}
