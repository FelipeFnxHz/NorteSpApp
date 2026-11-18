import { SidebarNav } from "./SidebarNav"

// Re-exported so existing imports (`import { SidebarNav } from "./Sidebar"`) keep working.
export { SidebarNav }

export function Sidebar() {
  return (
    <aside className="border-sidebar-border bg-sidebar sticky top-0 hidden h-dvh w-[264px] shrink-0 border-r px-5 py-6 lg:block">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(70%_100%_at_30%_0%,var(--glow),transparent)] opacity-60" />
      <div className="relative h-full">
        <SidebarNav />
      </div>
    </aside>
  )
}
