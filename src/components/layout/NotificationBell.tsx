import { Bell, CheckCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { renderLogText, cleanLogText } from "@/lib/logText"
import { useEffect, useState } from "react"
import { useNotifications } from "@/hooks/useNotifications"
import { LOG_TONE, getLogMeta } from "@/lib/logTypes"
import type { NotificationItem } from "@/types"

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.round(diffMs / 60_000)
  if (minutes < 1) return "agora"
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `há ${hours}h`
  const days = Math.round(hours / 24)
  if (days < 7) return `há ${days}d`
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
}

function NotificationCard({ item, onRead }: { item: NotificationItem; onRead: (id: string) => void }) {
  const meta = getLogMeta(item.type)

  return (
    <button
      type="button"
      onClick={() => !item.read && onRead(item.id)}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors",
        item.read ? "hover:bg-white/[0.04]" : "bg-primary/[0.06] hover:bg-primary/[0.1]",
      )}
    >
      {item.staffAvatar ? (
        <img src={item.staffAvatar} alt="" className="size-8 shrink-0 rounded-full object-cover ring-1 ring-white/10" />
      ) : (
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full ring-1 ring-inset", LOG_TONE[meta.tone].chip)}>
          <meta.icon className="size-[15px]" />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <strong className="text-[13px] leading-tight font-semibold">{item.title}</strong>
          {!item.read && <span className="bg-primary mt-1 size-1.5 shrink-0 rounded-full" />}
        </div>
        <p className="text-muted-foreground mt-0.5 line-clamp-3 text-xs leading-relaxed">{renderLogText(item.description)}</p>

        {item.changes && item.changes.length > 0 && (
          <ul className="mt-1.5 flex flex-col gap-0.5">
            {item.changes.slice(0, 2).map(change => (
              <li key={change.label} className="text-muted-foreground/90 flex min-w-0 items-center gap-1.5 text-[11px]">
                <span className="shrink-0 font-semibold">{change.label}:</span>
                <span className="truncate">
                  {cleanLogText(change.from || "—")} <span className="text-primary">→</span> {cleanLogText(change.to || "—")}
                </span>
              </li>
            ))}
          </ul>
        )}

        {item.reason && (
          <p className="text-muted-foreground/90 mt-1.5 line-clamp-2 border-l-2 border-white/15 pl-2 text-[11px] leading-relaxed italic">
            {item.reason}
          </p>
        )}
        <div className="text-muted-foreground/70 mt-1.5 flex items-center gap-2 text-[11px]">
          <span>{relativeTime(item.createdAt)}</span>
          {item.corporation && (
            <Badge variant="outline" className="h-4 max-w-[9rem] truncate px-1.5 text-[10px] font-normal">
              {item.corporation}
            </Badge>
          )}
          {item.ticketCode && (
            <Badge variant="outline" className="h-4 px-1.5 text-[10px] font-normal">
              {item.ticketCode}
            </Badge>
          )}
        </div>
      </div>
    </button>
  )
}

export function NotificationBell() {
  const { items: notifications, loading, error, unreadCount, arrivals, markRead, markAllRead, reload } = useNotifications()
  const [ringing, setRinging] = useState(false)

  // Sininho balança e o contador "pula" quando chega uma notificação nova.
  useEffect(() => {
    if (arrivals === 0) return
    setRinging(true)
    const timer = window.setTimeout(() => setRinging(false), 1200)
    return () => window.clearTimeout(timer)
  }, [arrivals])

  return (
    <DropdownMenu>
      {/*
        No asChild + nested <Button> here on purpose: the installed
        "radix-ui" build renders its own native trigger element and doesn't
        support classic Radix's asChild/Slot merging, so wrapping a <Button>
        inside it produced <button> inside <button> (invalid HTML, broke
        clicks). Styling the trigger directly with buttonVariants() avoids
        the nesting entirely — single real button in the DOM.
      */}
      <DropdownMenuTrigger aria-label={unreadCount > 0 ? `Notificações (${unreadCount} não lidas)` : "Notificações"} className={cn(buttonVariants({ variant: "outline", size: "icon" }), "relative")}>
        <Bell className={cn("size-4 origin-top", ringing && "animate-bell-ring")} />
        {unreadCount > 0 && (
          <Badge
            key={unreadCount}
            variant="destructive"
            className={cn("absolute -top-1.5 -right-1.5 h-4 min-w-4 justify-center rounded-full px-1 text-[10px]", ringing && "animate-badge-pop")}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="!w-[min(22rem,calc(100vw-1.5rem))]">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="p-0">Notificações</DropdownMenuLabel>
          </DropdownMenuGroup>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllRead}
              className="text-primary hover:text-primary/80 flex items-center gap-1 text-xs font-semibold transition-colors"
            >
              <CheckCheck className="size-3.5" />
              Marcar todas
            </button>
          )}
        </div>
        <DropdownMenuSeparator />

        <div className="flex max-h-96 flex-col gap-0.5 overflow-y-auto">
          {loading &&
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex animate-pulse items-start gap-3 px-2.5 py-2.5">
                <span className="bg-white/[0.06] size-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5 pt-0.5">
                  <div className="h-3 w-2/3 rounded bg-white/[0.06]" />
                  <div className="h-2.5 w-full rounded bg-white/[0.04]" />
                </div>
              </div>
            ))}

          {!loading && error && (
            <div className="p-4 text-center">
              <p className="text-destructive text-sm">Não foi possível carregar as notificações.</p>
              <p className="text-muted-foreground mt-1 text-xs">{error}</p>
              <button type="button" onClick={reload} className="text-primary mt-2 text-xs font-semibold underline">
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && notifications.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <span className="bg-white/[0.05] text-muted-foreground grid size-10 place-items-center rounded-full">
                <Bell className="size-4" />
              </span>
              <p className="text-muted-foreground text-sm">Nenhuma notificação por aqui.</p>
            </div>
          )}

          {notifications.map(item => (
            <NotificationCard key={item.id} item={item} onRead={markRead} />
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
