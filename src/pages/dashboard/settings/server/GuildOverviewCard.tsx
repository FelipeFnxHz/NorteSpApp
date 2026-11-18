import { Calendar, Hash, Rocket, ShieldHalf, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { ServerSettings } from "@/types"

function Tile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="border-border flex items-center gap-3 rounded-xl border bg-white/[0.02] px-3.5 py-3">
      <span className="bg-primary/12 text-primary ring-primary/20 grid size-9 shrink-0 place-items-center rounded-lg ring-1 ring-inset">{icon}</span>
      <div className="min-w-0">
        <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">{label}</p>
        <p className="truncate text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  )
}

/** Identidade do servidor do Discord e números principais + saúde dos vínculos de canais/cargos. */
export function GuildOverviewCard({ data }: { data: ServerSettings }) {
  const { guild, health } = data
  const number = (value: number) => value.toLocaleString("pt-BR")
  const percent = health.total ? Math.round((health.configured / health.total) * 100) : 0

  return (
    <Card className="gap-6 px-4 sm:px-6">
      <div className="flex items-center gap-4">
        {guild.icon && <img src={guild.icon} alt="" className="size-14 shrink-0 rounded-2xl object-cover ring-1 ring-white/10" />}
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold">{guild.name}</h3>
          <p className="text-muted-foreground text-xs">Servidor Discord conectado via bot oficial</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Tile icon={<Users className="size-4" />} label="Membros" value={number(guild.memberCount)} />
        <Tile icon={<Rocket className="size-4" />} label="Boosts" value={`${number(guild.boostCount)} · nível ${guild.boostTier}`} />
        <Tile icon={<Hash className="size-4" />} label="Canais" value={number(guild.channelCount)} />
        <Tile icon={<ShieldHalf className="size-4" />} label="Cargos" value={number(guild.roleCount)} />
        <Tile icon={<Calendar className="size-4" />} label="Criado em" value={new Date(guild.createdAt).toLocaleDateString("pt-BR")} />
      </div>

      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-medium">Vínculos configurados</span>
          <span className="text-muted-foreground tabular-nums">
            {health.configured} de {health.total}
            {health.broken > 0 && <span className="text-destructive ml-2 font-medium">· {health.broken} com problema</span>}
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Vínculos configurados">
          <div className="bg-primary h-full rounded-full transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </div>
      </div>
    </Card>
  )
}
