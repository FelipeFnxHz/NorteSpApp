import { useRef } from "react"
import { LogOut } from "lucide-react"
import { Link } from "@/components/ui/link"
import { BrandMark } from "@/components/ui/brand"
import { useAuth } from "@/contexts/AuthContext"
import { useRetainedScroll } from "@/hooks/useRetainedScroll"
import { useRouter } from "@/contexts/RouterContext"
import { canAccess, NAV_ITEMS, type NavGroup } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { resolveRoleColor, resolveRoleLabel } from "@/lib/roles"

const GROUP_ORDER: NavGroup[] = ["Geral", "Gestão", "Sistema"]

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user, dashboardConfig, hasAnyCorpAccess, discordRole, logout } = useAuth()
  const { path } = useRouter()

  const visible = NAV_ITEMS.filter(item => canAccess(item, user?.role, hasAnyCorpAccess))
  const roleColor = resolveRoleColor(discordRole)

  const navRef = useRef<HTMLElement>(null)
  useRetainedScroll(navRef, [visible.length, path])

  return (
    <div className="flex h-full flex-col gap-7">
      <BrandMark to="/dashboard" logoUrl={dashboardConfig.logoUrl} caption={dashboardConfig.name || "Dashboard"} className="px-2" />

      <nav ref={navRef} className="scroll-dark flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain" aria-label="Principal">
        {GROUP_ORDER.map(group => {
          const items = visible.filter(item => item.group === group)
          if (items.length === 0) return null

          return (
            <div key={group} className="flex flex-col gap-1">
              <span className="text-muted-foreground/70 mb-1 px-3 text-[10px] font-semibold tracking-[0.16em] uppercase">
                {group}
              </span>
              {items.map(item => {
                const active = path === item.to
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group/nav relative flex h-9 items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-colors",
                      active
                        ? "text-foreground bg-white/[0.06]"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
                    )}
                  >
                    {active && <span className="bg-primary absolute top-2 bottom-2 -left-3 w-[3px] rounded-r-full" />}
                    <item.icon
                      className={cn("size-4 transition-colors", active ? "text-primary" : "group-hover/nav:text-foreground")}
                    />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>

      {user && (
        <div className="border-border bg-white/[0.03] flex items-center gap-3 rounded-xl border p-2.5">
          <div className="relative shrink-0">
            <img src={user.avatar} alt="" className="size-9 rounded-full object-cover ring-1 ring-white/10" />
            <span className="bg-accent border-sidebar absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] leading-tight font-semibold">{user.displayName}</p>
            <p className="text-muted-foreground truncate text-[11px]" style={{ color: roleColor }}>
              {resolveRoleLabel(discordRole, user.role)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            aria-label="Sair"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 grid size-8 place-items-center rounded-lg transition-colors"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
