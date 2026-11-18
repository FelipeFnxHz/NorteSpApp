import { useState } from "react"
import { LogOut, Megaphone, ShieldAlert, Store } from "lucide-react"
import { ApiError } from "@/api/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { dashboardService } from "@/services/dashboard.service"
import type { DashboardConfigFull } from "@/types"

const MESSAGE_MAX = 280

function Section({ icon, title, description, children }: { icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="border-border flex flex-col gap-4 border-t pt-6 first:border-0 first:pt-0">
      <div>
        <h4 className="flex items-center gap-2 text-sm font-semibold">
          {icon}
          {title}
        </h4>
        <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{description}</p>
      </div>
      {children}
    </div>
  )
}

/** Opções administrativas (somente admin): aviso de manutenção, loja aberta/pausada e encerramento de sessões. */
export function DashboardControlsCard({ config, onChanged }: { config: DashboardConfigFull | null; onChanged: () => void }) {
  const [message, setMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState<"message" | "store" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [confirmRevoke, setConfirmRevoke] = useState(false)

  if (!config) return <Skeleton className="h-72 w-full rounded-2xl" />

  const current = message ?? config.statusMessage
  const dirty = current.trim() !== config.statusMessage

  async function save(kind: "message" | "store", body: { statusMessage?: string; storeOpen?: boolean }, okText: string) {
    setSaving(kind)
    setError(null)
    setSaved(null)
    try {
      await dashboardService.updateSettings(body)
      setMessage(null)
      setSaved(okText)
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar.")
    } finally {
      setSaving(null)
    }
  }

  async function revokeSessions() {
    try {
      await dashboardService.revokeSessions()
      setSaved("Todas as sessões foram encerradas. A sua continua ativa.")
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível encerrar as sessões.")
    } finally {
      setConfirmRevoke(false)
    }
  }

  return (
    <Card className="gap-6 px-4 sm:px-6">
      <div>
        <h3 className="font-semibold">Controles administrativos</h3>
        <p className="text-muted-foreground mt-1 text-xs">Ajustes que valem para todo o servidor. Cada alteração fica registrada nos Logs da Staff.</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {saved && (
        <Alert variant="success">
          <AlertDescription className="text-accent/90">{saved}</AlertDescription>
        </Alert>
      )}

      <Section icon={<Megaphone className="size-4" />} title="Aviso de manutenção" description="Texto exibido aos membros nas telas de manutenção e offline (ex.: previsão de retorno). Deixe vazio para usar a mensagem padrão.">
        <div className="flex flex-col gap-2">
          <Textarea value={current} maxLength={MESSAGE_MAX} rows={3} onChange={event => setMessage(event.target.value)} placeholder="Ex.: Voltamos às 22h. Atualizando a loja e os tickets." aria-label="Aviso de manutenção" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-muted-foreground font-mono text-[11px] tabular-nums" aria-live="polite">
              {current.length}/{MESSAGE_MAX}
            </span>
            <Button size="sm" disabled={!dirty || saving !== null} onClick={() => save("message", { statusMessage: current }, "Aviso atualizado.")}>
              {saving === "message" ? "Salvando..." : "Salvar aviso"}
            </Button>
          </div>
        </div>
      </Section>

      <Section icon={<Store className="size-4" />} title="Loja" description="Pausar impede novos pedidos (a vitrine continua visível). Pagamentos e entregas de pedidos já feitos não são afetados.">
        <label className="border-border flex items-center justify-between gap-4 rounded-xl border bg-white/[0.02] px-4 py-3.5">
          <span className="min-w-0">
            <span className="block text-sm font-medium">{config.storeOpen ? "Loja aberta" : "Loja pausada"}</span>
            <span className="text-muted-foreground block text-xs">{config.storeOpen ? "Os membros podem comprar normalmente." : "Ninguém consegue finalizar compras agora."}</span>
          </span>
          <Switch checked={config.storeOpen} disabled={saving !== null} onCheckedChange={open => save("store", { storeOpen: open }, open ? "Loja reaberta." : "Loja pausada.")} aria-label="Loja aberta" />
        </label>
      </Section>

      <Section icon={<ShieldAlert className="size-4" />} title="Segurança das sessões" description="Desconecta todos os usuários da Dashboard de uma vez (útil após troca de equipe ou suspeita de acesso indevido). Eles entram de novo pelo Discord.">
        <div>
          <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirmRevoke(true)}>
            <LogOut />
            Encerrar todas as sessões
          </Button>
        </div>
      </Section>

      <ConfirmDialog
        open={confirmRevoke}
        onOpenChange={setConfirmRevoke}
        variant="destructive"
        title="Encerrar todas as sessões?"
        description="Todos os usuários conectados serão desconectados agora e precisarão entrar de novo. A sua sessão continua ativa."
        confirmLabel="Encerrar sessões"
        loadingLabel="Encerrando..."
        onConfirm={revokeSessions}
      />
    </Card>
  )
}
