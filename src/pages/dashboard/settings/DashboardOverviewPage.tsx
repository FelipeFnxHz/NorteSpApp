import { ArrowRight, BarChart3, Bug, Building2, Clock3, FileText, MessageSquare, ScrollText, ShieldAlert, ShieldCheck, ShoppingBag, Ticket, Trophy, Users, type LucideIcon, } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { ServerStatusWidget } from "@/components/dashboard/ServerStatusWidget"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/states"
import { StatCard } from "@/components/ui/stat-card"
import { Link } from "@/components/ui/link"
import { useApi } from "@/hooks/useApi"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { ticketsService } from "@/services/tickets.service"
import { staffService } from "@/services/staff.service"

type ShortcutTone = "amber" | "blue" | "violet" | "green" | "cyan" | "rose" | "orange" | "analytics"

const TONE: Record<ShortcutTone, { chip: string; hover: string; glow: string }> = {
  amber: {
    chip: "bg-[#f5b94a]/12 text-[#f5b94a] ring-[#f5b94a]/25",
    hover: "hover:border-[#f5b94a]/40",
    glow: "bg-[#f5b94a]/20",
  },
  analytics: {
    chip: "bg-[#D1D5DB]/12 text-[#D1D5DB] ring-[#D1D5DB]/25",
    hover: "hover:border-[#D1D5DB]/40",
    glow: "bg-[#D1D5DB]/20",
  },
  blue: {
    chip: "bg-[#4c8dff]/12 text-[#4c8dff] ring-[#4c8dff]/25",
    hover: "hover:border-[#4c8dff]/40",
    glow: "bg-[#4c8dff]/20",
  },
  violet: {
    chip: "bg-[#a78bfa]/12 text-[#a78bfa] ring-[#a78bfa]/25",
    hover: "hover:border-[#a78bfa]/40",
    glow: "bg-[#a78bfa]/20",
  },
  green: {
    chip: "bg-[#34d399]/12 text-[#34d399] ring-[#34d399]/25",
    hover: "hover:border-[#34d399]/40",
    glow: "bg-[#34d399]/20",
  },
  cyan: {
    chip: "bg-[#22d3ee]/12 text-[#22d3ee] ring-[#22d3ee]/25",
    hover: "hover:border-[#22d3ee]/40",
    glow: "bg-[#22d3ee]/20",
  },
  orange: {
    chip: "bg-[#fb923c]/12 text-[#fb923c] ring-[#fb923c]/25",
    hover: "hover:border-[#fb923c]/40",
    glow: "bg-[#fb923c]/20",
  },
  rose: {
    chip: "bg-[#fb7185]/12 text-[#fb7185] ring-[#fb7185]/25",
    hover: "hover:border-[#fb7185]/40",
    glow: "bg-[#fb7185]/20",
  },
}

const SHORTCUTS: Array<{ to: string; icon: LucideIcon; label: string; hint: string; tone: ShortcutTone; staffOnly?: boolean; corpOnly?: boolean }> = [
  { to: "/dashboard/tickets", icon: Ticket, label: "Tickets", hint: "Ver atendimentos", tone: "amber" },
  { to: "/dashboard/corporations", icon: Building2, label: "Corporações", hint: "Gerenciar patentes", tone: "blue", corpOnly: true },
  { to: "/dashboard/whitelist", icon: ShieldCheck, label: "Whitelist", hint: "Candidatura e análise", tone: "green" },
  { to: "/dashboard/store", icon: ShoppingBag, label: "Loja", hint: "Produtos, carrinho e compras", tone: "orange" },
  { to: "/dashboard/transcripts", icon: FileText, label: "Transcripts", hint: "Conversas encerradas", tone: "cyan" },
  { to: "/dashboard/feedback", icon: MessageSquare, label: "Feedback", hint: "Ver avaliações", tone: "rose", staffOnly: true },
  { to: "/dashboard/staff-logs", icon: ScrollText, label: "Logs da Staff", hint: "Auditar ações", tone: "violet", staffOnly: true },
  { to: "/dashboard/analytics", icon: BarChart3, label: "Analytics", hint: "Métricas de atendimento", tone: "analytics", staffOnly: true },
]

function shortStaffLabel(id: string | undefined) {
  if (!id) return "-"
  return `Staff #${id.slice(-4)}`
}

export function DashboardOverviewPage() {
  const { user, isStaff, isInAnyCorp, memberCorpSlugs } = useAuth()

  const { data, loading, error, refetch } = useApi(() => ticketsService.stats(), [])
  const { data: staffOnlineData } = useApi(() => (isStaff ? staffService.online() : Promise.resolve(null)), [isStaff])

  const shortcuts = SHORTCUTS.filter(item => (!item.staffOnly || isStaff) && (!item.corpOnly || isInAnyCorp)).map(item =>
    item.corpOnly && memberCorpSlugs.length === 1
      ? { ...item, to: `/dashboard/corporations/${memberCorpSlugs[0]}`, label: "Minha corporação", hint: "Efetivo e hierarquia" }
      : item,
  )

  return (
    <DashboardLayout title="Visão Geral" description={`Bem-vindo de volta, ${user?.displayName}.`}>
      <ServerStatusWidget />

      {loading && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {error && <ErrorState message={error} onRetry={refetch} />}

      {data && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={<Ticket className="size-5" />} tone="primary" label="Tickets abertos" value={data.opened} hint={`${data.total} no total`} />
            <StatCard icon={<FileText className="size-5" />} tone="secondary" label="Transcripts" value={data.transcripts} />
            <StatCard icon={<ShieldAlert className="size-5" />} tone="destructive" label="Denúncias" value={data.complaints} />
            <StatCard icon={<Clock3 className="size-5" />} tone="accent" label="Tempo médio" value={data.averageTime} />
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[1fr_320px]">
            <Card className="gap-1 px-4 sm:px-6">
              <h3 className="text-lg font-semibold">Atalhos</h3>
              <p className="text-muted-foreground mb-4 text-xs">Direto para o que você mais usa.</p>

              <div className="grid gap-3 sm:grid-cols-2">
                {shortcuts.map(shortcut => (
                  <Link
                    key={shortcut.to}
                    to={shortcut.to}
                    className={cn(
                      "group border-border relative flex items-center gap-3.5 overflow-hidden rounded-xl border bg-white/[0.02] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/[0.04]",
                      TONE[shortcut.tone].hover,
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none absolute -top-8 -left-8 size-24 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100",
                        TONE[shortcut.tone].glow,
                      )}
                    />
                    <span
                      className={cn(
                        "relative grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset transition-transform duration-200 group-hover:scale-105",
                        TONE[shortcut.tone].chip,
                      )}
                    >
                      <shortcut.icon className="size-[18px]" />
                    </span>
                    <div className="relative min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{shortcut.label}</p>
                      <p className="text-muted-foreground truncate text-xs">{shortcut.hint}</p>
                    </div>
                    <ArrowRight className="text-muted-foreground relative size-4 shrink-0 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </Card>

            {isStaff && (
              <Card className="gap-4 px-4 sm:px-6">
                <h3 className="text-lg font-semibold">Equipe agora</h3>

                <div className="flex items-center gap-3 rounded-xl bg-white/[0.02] p-3.5">
                  <span className="bg-accent/12 text-accent grid size-10 shrink-0 place-items-center rounded-xl">
                    <Users className="size-[18px]" />
                  </span>
                  <div>
                    <strong className="block text-lg leading-none font-bold">{staffOnlineData?.total ?? "—"}</strong>
                    <span className="text-muted-foreground text-xs">Staff online agora</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 text-sm">
                  <div className="border-border/60 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b pb-3">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Bug className="size-3.5" />
                      Bugs reportados
                    </span>
                    <strong>{data.bugs}</strong>
                  </div>
                  <div className="border-border/60 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b pb-3">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Trophy className="size-3.5" />
                      Top fechamentos
                    </span>
                    <div className="text-right">
                      <strong className="block leading-tight">{shortStaffLabel(data.bestStaff?.id)}</strong>
                      {data.bestStaff && <span className="text-muted-foreground text-[11px]">{data.bestStaff.totalClosed} tickets</span>}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MessageSquare className="size-3.5" />
                      Atendimento + rápido
                    </span>
                    <div className="text-right">
                      <strong className="block leading-tight">{shortStaffLabel(data.fastestStaff?.id)}</strong>
                      {data.fastestStaff && <span className="text-muted-foreground text-[11px]">média {data.fastestStaff.averageTime}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  )
}
