import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import type { ReactNode } from "react"
import { Sidebar } from "@/components/layout/Sidebar"
import { Navbar } from "@/components/layout/Navbar"
import { GlobalAnnouncement } from "@/components/layout/GlobalAnnouncement"

interface DashboardLayoutProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}

export function DashboardLayout({ title, description, actions, children }: DashboardLayoutProps) {
  const { dashboardConfig } = useAuth()

  useEffect(() => {
    document.title = `${title} • ${dashboardConfig.name || "Dashboard"}`
  }, [title, dashboardConfig.name])

  return (
    <div className="flex min-h-dvh">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(60%_100%_at_50%_-20%,var(--glow),transparent)] opacity-50" />

        <Navbar />

        <main className="relative mx-auto flex w-full max-w-[1360px] flex-1 flex-col px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:px-8 sm:py-8 lg:px-10">
          <GlobalAnnouncement />

          <header className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
            <div className="min-w-0">
              <h1 className="text-2xl leading-tight font-bold tracking-tight break-words sm:text-[32px]">{title}</h1>
              {description && <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm">{description}</p>}
            </div>
            {actions && <div className="flex w-full flex-wrap gap-2 sm:w-auto [&>button]:flex-1 sm:[&>button]:flex-none">{actions}</div>}
          </header>

          <div className="flex flex-col gap-6">{children}</div>

          <footer className="text-muted-foreground/70 mt-auto pt-10 text-center text-xs sm:pt-14">
            NorteSp Roleplay © {new Date().getFullYear()}
          </footer>
        </main>
      </div>
    </div>
  )
}
