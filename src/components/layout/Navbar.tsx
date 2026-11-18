import { useState } from "react"
import { ChevronDown, LogOut, Menu, Search, User as UserIcon } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "@/contexts/RouterContext"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { SidebarNav } from "./Sidebar"
import { GlobalSearch } from "./GlobalSearch"
import { NotificationBell } from "./NotificationBell"
import { RulesShortcut } from "./RulesShortcut"
import { resolveRoleColor, resolveRoleLabel } from "@/lib/roles"

export function Navbar() {
  const { user, discordRole, logout } = useAuth()
  const { navigate } = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <header className="border-border/70 bg-background/70 sticky top-0 z-30 border-b pt-[env(safe-area-inset-top)] backdrop-blur-xl">
     <div className="flex h-16 items-center justify-between gap-3 px-4 sm:gap-4 sm:px-8 lg:px-10">
      <div className="flex min-w-0 items-center gap-3">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="bg-sidebar w-[min(18rem,85vw)] p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SidebarNav onNavigate={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        <Button variant="outline" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
          <Menu className="size-4" />
        </Button>

        <div className="hidden sm:block">
          <GlobalSearch />
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="outline" size="icon" className="sm:hidden" onClick={() => setSearchOpen(value => !value)} aria-label="Pesquisar" aria-expanded={searchOpen}>
          <Search className="size-4" />
        </Button>
        <RulesShortcut />
        <NotificationBell />

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto gap-2 rounded-full py-1 pr-2 pl-1 sm:pr-2.5",
              )}
            >
              <Avatar className="size-7">
                <AvatarImage src={user.avatar} alt={user.displayName} />
                <AvatarFallback>{user.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-[13px] leading-none font-semibold">{user.displayName}</p>
                <p className="text-muted-foreground mt-0.5 text-[11px] leading-none" style={{ color: resolveRoleColor(discordRole) }}>
                  {resolveRoleLabel(discordRole, user.role)}
                </p>
              </div>
              <ChevronDown className="text-muted-foreground size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="!w-[min(13rem,calc(100vw-1.5rem))]">
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                <UserIcon />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => logout()}>
                <LogOut />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
     </div>

     {searchOpen && (
       <div className="px-4 pb-3 sm:hidden">
         <GlobalSearch autoFocus onDone={() => setSearchOpen(false)} />
       </div>
     )}
    </header>
  )
}
