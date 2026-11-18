import { useEffect, useState } from "react"
import { Check, Copy, Cpu, Gauge, Layers, RefreshCw, Users } from "lucide-react"
import { ApiError } from "@/api/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/contexts/AuthContext"
import { useServerStatus } from "@/hooks/useServerStatus"
import { timeAgo } from "@/lib/modules"
import { cn } from "@/lib/utils"
import { serverStatusService } from "@/services/modules.service"

function Metric({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="border-border/60 bg-foreground/[0.03] flex min-w-0 flex-col gap-1 rounded-xl border p-3">
      <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium">{icon}{label}</span>
      <span className="truncate text-sm font-semibold tabular-nums">{children}</span>
    </div>
  )
}

/** Monitor do servidor FiveM na Visão Geral: muda sozinho a cada alteração (SSE), sem F5. */
export function ServerStatusWidget() {
  const { user } = useAuth()
  const { status, error } = useServerStatus()
  const [now, setNow] = useState(Date.now())
  const [copied, setCopied] = useState(false)
  const [refreshing, setRefreshing] = useState<null | "ok" | string>(null)

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 5_000)
    return () => clearInterval(timer)
  }, [])

  if (!status) return error ? null : <Skeleton className="h-44 w-full rounded-2xl" />

  const { players, online } = status
  const percent = players.max > 0 ? Math.min(100, Math.round((players.current / players.max) * 100)) : 0
  const barTone = percent >= 90 ? "bg-[#f0464f]" : percent >= 70 ? "bg-[#f5b94a]" : "bg-[#34d399]"

  async function copy() {
    try {
      await navigator.clipboard.writeText(status!.connect)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  async function refreshEmbed() {
    setRefreshing("...")
    try {
      await serverStatusService.refreshEmbed()
      setRefreshing("ok")
    } catch (err) {
      setRefreshing(err instanceof ApiError ? err.message : "Falha ao atualizar.")
    }
    setTimeout(() => setRefreshing(null), 4000)
  }

  return (
    <Card className="gap-5 px-4 sm:px-6" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="relative grid size-3 place-items-center">
            {online && <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#34d399]/60" />}
            <span className={cn("relative inline-flex size-2.5 rounded-full", online ? "bg-[#34d399]" : "bg-[#f0464f]")} />
          </span>
          <div className="min-w-0">
            <h3 className="text-lg leading-tight font-semibold">{online ? "Servidor Online" : "Servidor Offline"}</h3>
            <p className="text-muted-foreground truncate text-xs">{status.hostname ?? "NorteSp Roleplay"} • atualizado {timeAgo(status.updatedAt, now)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {user?.role === "admin" && (
            <Button variant="ghost" size="sm" onClick={refreshEmbed} disabled={refreshing === "..."} title="Força a atualização da mensagem fixa no Discord">
              <RefreshCw className={cn("size-3.5", refreshing === "..." && "animate-spin")} />
              {refreshing && refreshing !== "..." ? (refreshing === "ok" ? "Discord atualizado" : refreshing) : "Atualizar Discord"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copy}>
            {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            <code className="text-xs">{status.connect}</code>
          </Button>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-end justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-medium"><Users className="size-3.5" /> Jogadores conectados</span>
          <span className="font-semibold tabular-nums">{online ? `${players.current}/${players.max}` : "—"} <span className="text-muted-foreground text-xs font-normal">({online ? percent : 0}%)</span></span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.07]" role="progressbar" aria-valuemin={0} aria-valuemax={players.max} aria-valuenow={players.current}>
          <div className={cn("h-full rounded-full transition-all duration-700", barTone)} style={{ width: `${online ? percent : 0}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric icon={<Gauge className="size-3.5" />} label="Ping médio">{online && status.pingAvg !== null ? `${status.pingAvg} ms` : "—"}</Metric>
        <Metric icon={<Layers className="size-3.5" />} label="Resources ativos">{online && status.resources !== null ? status.resources : "—"}</Metric>
        <Metric icon={<Cpu className="size-3.5" />} label="CPU da máquina">{status.machine.cpu !== null ? `${status.machine.cpu}%` : <span className="text-muted-foreground font-normal">não reportado</span>}</Metric>
        <Metric icon={<Cpu className="size-3.5" />} label="RAM da máquina">{status.machine.memoryMb !== null ? `${status.machine.memoryMb.toLocaleString("pt-BR")} MB` : <span className="text-muted-foreground font-normal">não reportado</span>}</Metric>
      </div>
    </Card>
  )
}
