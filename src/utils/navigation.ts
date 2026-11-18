import type { UserRole } from '@/types'
import { FileText, LayoutDashboard, ScrollText, Settings, Ticket, UserIcon, Users } from '@/components/ui/icons'

export interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  access: UserRole[]
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard, access: ['member', 'staff', 'admin'] },
  { to: '/dashboard/tickets', label: 'Meus Tickets', icon: Ticket, access: ['member'] },
  { to: '/dashboard/transcripts', label: 'Meus Transcripts', icon: FileText, access: ['member'] },
  { to: '/dashboard/profile', label: 'Meu Perfil', icon: UserIcon, access: ['member'] },
  { to: '/dashboard/tickets', label: 'Tickets', icon: Ticket, access: ['staff', 'admin'] },
  { to: '/dashboard/transcripts', label: 'Transcripts', icon: FileText, access: ['staff', 'admin'] },
  { to: '/dashboard/staff', label: 'Staff', icon: Users, access: ['staff', 'admin'] },
  { to: '/dashboard/analytics', label: 'Analytics', icon: Users, access: ['staff', 'admin'] },
  { to: '/dashboard/staff-logs', label: 'Logs', icon: ScrollText, access: ['staff', 'admin'] },
  { to: '/dashboard/settings', label: 'Configurações', icon: Settings, access: ['admin'] },
]

export function canAccess(item: NavItem, role: UserRole | undefined): boolean {
  if (!role) return false
  return item.access.includes(role)
}