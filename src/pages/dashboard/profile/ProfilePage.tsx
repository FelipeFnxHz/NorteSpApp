import { useState } from "react"
import {
  Banknote,
  Building2,
  Calendar,
  Car,
  Check,
  Clock3,
  Copy,
  Crown,
  FileText,
  Gamepad2,
  LogOut,
  Shield,
  Store,
  Ticket,
  UserRound,
  Wallet,
  X,
} from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/states"
import { StatCard } from "@/components/ui/stat-card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DiscordIcon } from "@/components/ui/brand-icons"
import { useApi } from "@/hooks/useApi"
import { useAuth } from "@/contexts/AuthContext"
import { userService } from "@/services/user.service"
import { resolveRoleColor, resolveRoleLabel } from "@/lib/roles"

function formatDate(value: string | null) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("pt-BR", { dateStyle: "long" })
}

function formatMoney(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value).catch(() => null)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copiar"
      className="text-muted-foreground hover:text-foreground hover:bg-white/[0.06] grid size-6 shrink-0 place-items-center rounded-md transition-colors"
    >
      {copied ? <Check className="text-accent size-3.5" /> : <Copy className="size-3.5" />}
    </button>
  )
}

function InfoRow({ icon: Icon, label, value, copyValue }: { icon: typeof UserRound; label: string; value: string; copyValue?: string }) {
  return (
    <div className="border-border/60 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b py-3 text-sm last:border-0">
      <span className="text-muted-foreground flex items-center gap-2">
        <Icon className="size-3.5" />
        {label}
      </span>
      <span className="flex min-w-0 items-center gap-1.5 font-medium break-all sm:text-right">
        {value}
        {copyValue && <CopyButton value={copyValue} />}
      </span>
    </div>
  )
}

export function ProfilePage() {
  const { user, discordRole, discordRoleLoading, logout } = useAuth()
  const { data, loading, error, refetch } = useApi(() => userService.profile(), [])
  const { data: character, loading: characterLoading } = useApi(() => userService.fivemCharacter(), [])
  const [confirmLogout, setConfirmLogout] = useState(false)

  const roleColor = resolveRoleColor(discordRole)

  return (
    <DashboardLayout title="Meu Perfil" description="Sua identidade e seu histórico dentro da NorteSp Roleplay.">
      {/* Identity card */}
      <Card className="relative gap-0 overflow-hidden py-0">
        <div className="from-primary/25 via-primary/5 relative h-28 bg-gradient-to-br to-transparent">
          <div className="bg-grid absolute inset-0 opacity-40" />
        </div>

        <div className="flex flex-col gap-5 px-4 sm:px-6 pb-6 sm:flex-row sm:items-end sm:gap-6">
          {user && (
            <div className="relative -mt-12 shrink-0">
              <img
                src={user.avatar}
                alt={user.displayName}
                className="border-card size-24 rounded-2xl border-4 object-cover shadow-xl"
              />
              <span className="bg-accent border-card absolute -right-1 -bottom-1 size-5 rounded-full border-[3px]" />
            </div>
          )}

          <div className="min-w-0 flex-1 pt-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold">{user?.displayName}</h2>
              {!discordRoleLoading && (
                <Badge variant="outline" className="gap-1.5 border-current" style={{ color: roleColor }}>
                  <Shield className="size-3" />
                  {resolveRoleLabel(discordRole, user?.role)}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-0.5 text-sm">@{user?.username}</p>
          </div>

          <Button variant="outline" onClick={() => setConfirmLogout(true)} className="w-fit shrink-0">
            <LogOut className="size-4" />
            Sair da conta
          </Button>
        </div>
      </Card>

      {error && <ErrorState message={error} onRetry={refetch} />}

      {loading && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      )}

      {data && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={<Ticket className="size-5" />} tone="accent" label="Tickets criados" value={data.ticketsCreated} />
          <StatCard icon={<Ticket className="size-5" />} tone="destructive" label="Tickets fechados" value={data.ticketsClosed} />
          <StatCard icon={<FileText className="size-5" />} tone="secondary" label="Transcripts" value={data.transcripts} />
          <StatCard icon={<Clock3 className="size-5" />} tone="secondary" label="Tempo médio" value={data.averageTime} />
        </div>
      )}

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card className="gap-4 px-4 sm:px-6">
          <h3 className="text-lg font-semibold">Dados da conta</h3>
          <div className="flex flex-col">
            <InfoRow icon={UserRound} label="ID do Discord" value={user?.id ?? "-"} copyValue={user?.id} />
            <InfoRow icon={Calendar} label="Entrou no servidor em" value={formatDate(data?.joinedAt ?? null)} />
            <InfoRow icon={Calendar} label="Conta do Discord criada em" value={formatDate(data?.accountCreatedAt ?? null)} />
          </div>
        </Card>

        <Card className="gap-4 px-4 sm:px-6">
          <h3 className="text-lg font-semibold">Conexões</h3>

          <div className="border-border flex items-center gap-3.5 rounded-xl border bg-white/[0.02] p-4">
            <span className="bg-discord/15 text-discord grid size-11 shrink-0 place-items-center rounded-xl">
              <DiscordIcon className="text-lg" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Discord</p>
              <p className="text-muted-foreground truncate text-xs">@{user?.username}</p>
            </div>
            <Badge variant="success">
              <Check className="size-3" />
              Conectado
            </Badge>
          </div>

          <div className="border-border flex items-center gap-3.5 rounded-xl border bg-white/[0.02] p-4">
            <span className="bg-primary/15 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
              <Gamepad2 className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">FiveM</p>
              <p className="text-muted-foreground truncate text-xs">
                {characterLoading ? "Verificando..." : character?.linked ? character.characterName || "Personagem vinculado" : "Nenhum personagem vinculado"}
              </p>
            </div>
            {!characterLoading && (
              <Badge variant={character?.linked ? "success" : "outline"}>
                {character?.linked ? <Check className="size-3" /> : <X className="size-3" />}
                {character?.linked ? "Conectado" : "Não vinculado"}
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground text-[11px] leading-relaxed">
            Sua identidade nesta Dashboard vem diretamente da sua conta do Discord — não há senha própria para gerenciar
            aqui. O FiveM é vinculado pelo bot, no servidor.
          </p>
        </Card>
      </div>

      <Card className="gap-4 px-4 sm:px-6">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Gamepad2 className="text-primary size-4" />
            Personagem no FiveM
          </h3>
          {!characterLoading && character?.linked && character.isVip && (
            <Badge variant="outline" className="border-primary/40 text-primary gap-1.5">
              <Crown className="size-3" />
              VIP
            </Badge>
          )}
        </div>

        {characterLoading && <Skeleton className="h-32 w-full" />}

        {!characterLoading && character?.linked === false && character.reason === "not_configured" && (
          <p className="text-muted-foreground text-sm">
            Seu personagem está vinculado, mas não consegui buscar os dados agora — o banco do Qbox pode estar fora
            do ar, ou o personagem vinculado não existe mais. Tente novamente mais tarde.
          </p>
        )}

        {!characterLoading && character?.linked === false && character.reason === undefined && (
          <p className="text-muted-foreground text-sm">
            Nenhum personagem vinculado à sua conta ainda — isso é feito pelo bot, dentro do servidor.
          </p>
        )}

        {!characterLoading && character?.linked && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="border-border rounded-xl border bg-white/[0.02] p-3.5">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <UserRound className="size-3.5" />
                Personagem
              </span>
              <strong className="mt-1 block text-sm break-words">{character.characterName || "-"}</strong>
            </div>
            <div className="border-border rounded-xl border bg-white/[0.02] p-3.5">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Wallet className="size-3.5" />
                Na mão
              </span>
              <strong className="mt-1 block text-sm break-words">{formatMoney(character.wallet)}</strong>
            </div>
            <div className="border-border rounded-xl border bg-white/[0.02] p-3.5">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Banknote className="size-3.5" />
                No banco
              </span>
              <strong className="mt-1 block text-sm break-words">{formatMoney(character.bank)}</strong>
            </div>
            <div className="border-border rounded-xl border bg-white/[0.02] p-3.5">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Car className="size-3.5" />
                Veículos
              </span>
              <strong className="mt-1 block text-sm break-words">{character.vehicleCount}</strong>
            </div>
            <div className="border-border rounded-xl border bg-white/[0.02] p-3.5">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Store className="size-3.5" />
                Empresas (dono)
              </span>
              <strong className="mt-1 block text-sm break-words">{character.businessCount}</strong>
            </div>
            <div className="border-border rounded-xl border bg-white/[0.02] p-3.5">
              <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <Building2 className="size-3.5" />
                Corporação
              </span>
              <strong className="mt-1 block text-sm break-words">{character.corporation?.name ?? "Nenhuma"}</strong>
              {character.corporation?.patenteName && (
                <span className="text-muted-foreground text-[11px]">{character.corporation.patenteName}</span>
              )}
            </div>

            {character.groups.length > 0 && (
              <div className="col-span-2 flex flex-col gap-1.5 sm:col-span-4">
                <span className="text-muted-foreground text-xs">Grupos / emprego</span>
                <div className="flex flex-wrap gap-1.5">
                  {character.groups.map(group => (
                    <Badge key={group} variant="secondary">
                      {group}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Sair da sua conta?"
        description="Você precisará entrar novamente com o Discord para acessar a Dashboard."
        confirmLabel="Sair"
        loadingLabel="Saindo..."
        onConfirm={async () => {
          await logout()
          setConfirmLogout(false)
        }}
      />
    </DashboardLayout>
  )
}
