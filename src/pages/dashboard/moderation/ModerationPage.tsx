import { useCallback, useRef, useState } from "react"
import { Gavel, History, LockOpen, Radio, Search, ShieldAlert, TriangleAlert } from "lucide-react"
import { ApiError } from "@/api/client"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/form"
import { EmptyState } from "@/components/ui/states"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { PUNISHMENT_FALLBACK, PUNISHMENT_META, formatDateTime } from "@/lib/community"
import { LOG_TONE } from "@/lib/logTypes"
import { cn } from "@/lib/utils"
import { punishmentsService } from "@/services/community.service"
import type { PlayerLookup } from "@/types"
import { PunishmentList } from "../punishments/PunishmentList"
import { PunishmentActionDialog, type PunishmentAction } from "./PunishmentActionDialog"

function Identifier({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div className="min-w-0">
      <span className="text-muted-foreground block text-[10px] font-semibold tracking-wide uppercase">{label}</span>
      <code className="block truncate font-mono text-xs">{value}</code>
    </div>
  )
}

export function ModerationPage() {
  const { isAdmin } = useAuth()
  const [query, setQuery] = useState("")
  const [result, setResult] = useState<PlayerLookup | null>(null)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [action, setAction] = useState<PunishmentAction | null>(null)
  const searchedRef = useRef("")

  const recent = useApi(() => punishmentsService.recent(), [])

  const search = useCallback(async (value: string, silent = false) => {
    const text = value.trim()
    if (!text) return
    if (!silent) {
      setSearching(true)
      setError(null)
    }
    try {
      const data = await punishmentsService.lookup(text)
      searchedRef.current = text
      setResult(data)
    } catch (err) {
      if (silent) return
      setResult(null)
      setError(err instanceof ApiError ? err.message : "Não foi possível consultar o jogador.")
    } finally {
      if (!silent) setSearching(false)
    }
  }, [])

  // Qualquer punição aplicada (por qualquer staff) atualiza o jogador aberto e o feed, sem F5.
  useLiveRefresh(
    () => {
      recent.refetch()
      if (searchedRef.current) void search(searchedRef.current, true)
    },
    ["punishments-changed"],
    45_000,
  )

  const banned = result?.summary.activeBan

  return (
    <DashboardLayout title="Moderação" description="Consulte jogadores e aplique ou remova punições direto no servidor.">
      <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
        <Radio className="text-accent size-3.5" />
        Atualizado em tempo real • toda ação gera um log detalhado no Discord
      </div>

      <Card className="gap-4 p-4 sm:p-6">
        <form
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
          onSubmit={event => {
            event.preventDefault()
            void search(query)
          }}
        >
          <div className="min-w-0 flex-1">
            <Input
              label="Jogador"
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="License (license:…), ID do Discord ou Citizen ID"
              icon={<Search className="size-4" />}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Button type="submit" disabled={searching || !query.trim()} className="sm:mb-0.5">
            {searching ? "Buscando..." : "Buscar"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive">
            <TriangleAlert />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Card>

      {result && (
        <div className="flex flex-col gap-6">
          <Card className={cn("gap-5 p-4 sm:p-6", banned && "border-destructive/30")}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display truncate text-xl font-bold">{result.target.name}</h3>
                  {banned ? <Badge variant="destructive">Banido{banned.permanent ? " (permanente)" : ""}</Badge> : <Badge variant="success">Sem ban ativo</Badge>}
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {result.summary.bans} ban(s) • {result.summary.warns} advertência(s)
                  {banned?.expiresAt && ` • libera em ${formatDateTime(banned.expiresAt)}`}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {isAdmin && (
                  <>
                    <Button size="sm" variant="destructive" disabled={Boolean(banned)} onClick={() => setAction("ban")}>
                      <Gavel className="size-4" />
                      Banir
                    </Button>
                    <Button size="sm" variant="outline" disabled={result.summary.bans === 0} onClick={() => setAction("unban")}>
                      <LockOpen className="size-4" />
                      Remover ban
                    </Button>
                  </>
                )}
                <Button size="sm" variant="outline" onClick={() => setAction("warn")}>
                  <ShieldAlert className="size-4" />
                  Advertir
                </Button>
              </div>
            </div>

            <div className="border-border grid gap-4 rounded-xl border bg-white/[0.02] p-4 sm:grid-cols-3">
              <Identifier label="Citizen ID" value={result.target.citizenid} />
              <Identifier label="Discord" value={result.target.discordId} />
              <Identifier label="License" value={result.target.license} />
            </div>

            {!isAdmin && <p className="text-muted-foreground text-xs">Banir e remover banimentos é restrito a administradores.</p>}
          </Card>

          <section className="flex flex-col gap-3" aria-label="Histórico do jogador">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <History className="size-4" />
              Histórico do jogador
            </h3>
            {result.items.length === 0 ? (
              <EmptyState icon={<ShieldAlert className="size-8" />} title="Sem registros" description="Este jogador nunca foi punido." />
            ) : (
              <PunishmentList items={result.items} />
            )}
          </section>
        </div>
      )}

      <section className="flex flex-col gap-3" aria-label="Ações recentes">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <History className="size-4" />
          Ações recentes da staff
        </h3>

        {recent.data && recent.data.items.length === 0 && <p className="text-muted-foreground text-sm">Nenhuma ação registrada pela Dashboard ainda.</p>}

        {recent.data && recent.data.items.length > 0 && (
          <Card className="divide-border gap-0 divide-y p-0">
            {recent.data.items.map(item => {
              const meta = PUNISHMENT_META[item.type] ?? PUNISHMENT_FALLBACK
              return (
                <div key={item.id} className="flex items-start gap-3 px-4 py-3.5">
                  <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg ring-1 ring-inset", LOG_TONE[meta.tone].chip)}>
                    <meta.icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm">
                      <strong className="font-semibold">{item.staffName}</strong> <span className="text-muted-foreground">→ {meta.label.toLowerCase()} •</span>{" "}
                      <strong className="font-semibold">{item.targetName}</strong>
                    </p>
                    <p className="text-muted-foreground truncate text-xs">{item.reason}</p>
                  </div>
                  <time className="text-muted-foreground shrink-0 text-[11px]" dateTime={item.createdAt}>
                    {formatDateTime(item.createdAt)}
                  </time>
                </div>
              )
            })}
          </Card>
        )}
      </section>

      <PunishmentActionDialog
        action={action}
        target={searchedRef.current || query.trim()}
        targetName={result?.target.name ?? ""}
        onClose={() => setAction(null)}
        onDone={() => {
          recent.refetch()
          void search(searchedRef.current, true)
        }}
      />
    </DashboardLayout>
  )
}
