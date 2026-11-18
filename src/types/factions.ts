import type { CorpPermission, MemberStatus } from "@/types"

export interface FactionPatente {
  _id: string
  roleId: string
  name: string
  description: string
  order: number
  enabled: boolean
  permissions?: CorpPermission[]
}

export interface Faction {
  _id: string
  slug: string
  name: string
  description: string
  icon: string
  color: string
  secondaryColor: string
  logoUrl: string
  bannerUrl: string
  leaderId: string | null
  leaderName: string
  status: "active" | "inactive"
  approvedRole: string
  gameRef: string | null
  source: "game" | "dashboard"
  memberCount?: number
  patentes: FactionPatente[]
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface FactionMember {
  _id: string
  factionSlug: string
  userId: string
  rpName: string
  citizenId: string
  patenteId: string | null
  status: MemberStatus
  hiredAt: string
  hiredBy: string
  discordName: string | null
  discordAvatar: string | null
  patenteName: string | null
}

export interface FactionStats {
  total: number
  active: number
  away: number
  suspended: number
}

export interface FactionBody {
  name?: string
  description?: string
  icon?: string
  color?: string
  approvedRole?: string
  leaderId?: string
  leaderName?: string
}
