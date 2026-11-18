import { useEffect, useState } from "react"
import { Globe, Layers, RotateCcw, Save, Terminal } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/form"
import { Label } from "@/components/ui/label"
import { ApiError } from "@/api/client"
import { useAuth } from "@/contexts/AuthContext"
import { dashboardService } from "@/services/dashboard.service"
import { AnnouncementSection } from "./AnnouncementSection"

const DESCRIPTION_MAX = 140

function CardTitle({ icon, title, description }: { icon: React.ReactNode; title: string; description: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <h3 className="flex items-center gap-2 font-semibold">
          {icon}
          {title}
        </h3>
        <Badge variant="outline" className="h-5 gap-1 px-1.5 text-[10px] font-medium">
          <Globe className="size-2.5" />
          Global
        </Badge>
      </div>
      <p className="text-muted-foreground text-xs leading-relaxed">{description}</p>
    </div>
  )
}

/** Identidade global (nome, logo, descrição e convite): salva no servidor e propagada por SSE a todos os usuários online. */
export function BrandingCard() {
  const { dashboardConfig } = useAuth()
  const [name, setName] = useState(dashboardConfig.name ?? "")
  const [logoUrl, setLogoUrl] = useState(dashboardConfig.logoUrl ?? "")
  const [description, setDescription] = useState(dashboardConfig.description ?? "")
  const [inviteUrl, setInviteUrl] = useState(dashboardConfig.inviteUrl ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  // Se outro admin alterar, o SSE atualiza o contexto e o formulário acompanha.
  useEffect(() => {
    setName(dashboardConfig.name ?? "")
    setLogoUrl(dashboardConfig.logoUrl ?? "")
    setDescription(dashboardConfig.description ?? "")
    setInviteUrl(dashboardConfig.inviteUrl ?? "")
  }, [dashboardConfig.name, dashboardConfig.logoUrl, dashboardConfig.description, dashboardConfig.inviteUrl])

  const dirty =
    name !== (dashboardConfig.name ?? "") ||
    logoUrl !== (dashboardConfig.logoUrl ?? "") ||
    description !== (dashboardConfig.description ?? "") ||
    inviteUrl !== (dashboardConfig.inviteUrl ?? "")

  async function run(action: () => Promise<unknown>, okText: string) {
    setSaving(true)
    setError(null)
    setSaved(null)
    try {
      await action()
      setSaved(okText)
      window.setTimeout(() => setSaved(null), 3000)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar.")
    } finally {
      setSaving(false)
    }
  }

  const save = () => run(() => dashboardService.updateConfig({ name, logoUrl, description, inviteUrl }), "Salvo e aplicado para todos.")

  async function resetIdentity() {
    await run(() => dashboardService.updateConfig({ resetIdentity: true }), "Nome e logo voltaram ao padrão do servidor.")
    setConfirmReset(false)
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-6 px-4 sm:px-6">
        <CardTitle
          icon={<Layers className="size-4" />}
          title="Identidade da Dashboard"
          description={
            <>
              Exibida para <strong className="text-foreground font-semibold">todos os usuários</strong>. Só Staff e Moderadores podem alterar; a mudança aparece na hora, sem recarregar, e fica registrada nos logs.
            </>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="dashboard-name">Nome da Dashboard</Label>
              <Input id="dashboard-name" value={name} onChange={event => setName(event.target.value)} maxLength={50} />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dashboard-logo">URL do logo</Label>
              <Input id="dashboard-logo" value={logoUrl} onChange={event => setLogoUrl(event.target.value)} maxLength={300} placeholder="https://..." inputMode="url" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dashboard-description">Descrição curta</Label>
              <Input id="dashboard-description" value={description} onChange={event => setDescription(event.target.value)} maxLength={DESCRIPTION_MAX} placeholder="Ex.: Central de atendimento da comunidade" />
              <span className="text-muted-foreground font-mono text-[11px] tabular-nums">
                {description.length}/{DESCRIPTION_MAX}
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="dashboard-invite">Convite do Discord</Label>
              <Input id="dashboard-invite" value={inviteUrl} onChange={event => setInviteUrl(event.target.value)} maxLength={120} placeholder="https://discord.gg/..." inputMode="url" />
              <span className="text-muted-foreground text-xs">Usado nos botões “Acompanhar no Discord” das telas de manutenção e offline.</span>
            </div>
          </div>

          <div className="border-border flex flex-col gap-3 self-start rounded-xl border bg-white/[0.02] p-4">
            <p className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">Pré-visualização</p>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="" className="size-11 shrink-0 rounded-xl object-cover ring-1 ring-white/10" onError={event => (event.currentTarget.style.visibility = "hidden")} onLoad={event => (event.currentTarget.style.visibility = "visible")} />
              ) : (
                <span className="bg-primary/15 text-primary grid size-11 shrink-0 place-items-center rounded-xl text-sm font-bold">{(name || "D").charAt(0).toUpperCase()}</span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{name || "Dashboard"}</p>
                <p className="text-muted-foreground line-clamp-2 text-xs">{description || "Sem descrição"}</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={save} disabled={saving || !dirty} className="w-fit">
            <Save className="size-4" />
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
          <Button type="button" variant="outline" disabled={saving} onClick={() => setConfirmReset(true)}>
            <RotateCcw className="size-4" />
            Restaurar nome e logo
          </Button>
          {saved && <p className="text-accent text-xs font-medium">{saved}</p>}
        </div>

        <p className="text-muted-foreground border-border flex items-start gap-2 rounded-xl border border-dashed p-3.5 text-xs leading-relaxed">
          <Terminal className="mt-0.5 size-3.5 shrink-0" />
          Nome e logo também podem ser alterados pelo Discord (Admin → Servidor → Integrações e APIs) — os dois lugares editam a mesma configuração.
        </p>
      </Card>

      <AnnouncementSection />

      <ConfirmDialog
        open={confirmReset}
        onOpenChange={setConfirmReset}
        variant="destructive"
        title="Restaurar nome e logo?"
        description="A Dashboard volta a usar o nome e o ícone do servidor do Discord, para todos os usuários."
        confirmLabel="Restaurar"
        loadingLabel="Restaurando..."
        onConfirm={resetIdentity}
      />
    </div>
  )
}
