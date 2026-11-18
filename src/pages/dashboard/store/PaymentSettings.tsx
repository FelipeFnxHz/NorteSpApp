import { useState } from "react"
import { Check, Copy, KeyRound, ShieldCheck, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/states"
import { ApiError } from "@/api/client"
import { useApi } from "@/hooks/useApi"
import { storeService } from "@/services/store.service"

const WEBHOOK_PATH = "/api/store/webhook/mercadopago"
const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? window.location.origin

export function PaymentSettings() {
  const { data, loading, error, refetch } = useApi(() => storeService.mercadoPago(), [])
  const [token, setToken] = useState("")
  const [secret, setSecret] = useState("")
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [removing, setRemoving] = useState(false)
  const [copied, setCopied] = useState(false)

  if (loading && !data) return <Skeleton className="h-80 w-full rounded-2xl" />
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />
  if (!data) return null

  const webhookUrl = `${API_BASE.replace(/\/$/, "")}${WEBHOOK_PATH}`

  async function save() {
    setBusy(true)
    setMessage(null)
    try {
      await storeService.saveMercadoPago({ ...(token.trim() && { accessToken: token.trim() }), ...(secret.trim() && { webhookSecret: secret.trim() }) })
      setToken("")
      setSecret("")
      setMessage({ ok: true, text: "Configurações salvas com segurança." })
      refetch()
    } catch (err) {
      setMessage({ ok: false, text: err instanceof ApiError ? err.message : "Falha ao salvar." })
    } finally {
      setBusy(false)
    }
  }

  async function copyWebhook() {
    await navigator.clipboard.writeText(webhookUrl).catch(() => null)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <section className="border-border flex flex-col gap-4 rounded-2xl border bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <KeyRound className="size-4" /> Access Token do Mercado Pago
          </h3>
          <Badge variant={data.configured ? "success" : "outline"}>{data.configured ? "Configurado" : "Não configurado"}</Badge>
        </div>

        {data.tokenPreview && (
          <p className="text-muted-foreground text-xs">
            Token atual: <code className="text-foreground rounded bg-white/[0.07] px-1.5 py-0.5 font-mono">{data.tokenPreview}</code>
          </p>
        )}

        <Input
          label={data.configured ? "Novo Access Token (deixe vazio para manter)" : "Access Token"}
          type="password"
          autoComplete="off"
          value={token}
          onChange={e => setToken(e.target.value)}
          placeholder="APP_USR-..."
          hint="Mercado Pago → Seu negócio → Credenciais → Credenciais de produção."
        />
        <Input
          label={data.hasWebhookSecret ? "Novo segredo do webhook (opcional)" : "Segredo do webhook (recomendado)"}
          type="password"
          autoComplete="off"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          placeholder="Assinatura secreta das notificações"
          hint="Quando definido, o servidor só aceita notificações com assinatura válida do Mercado Pago."
        />

        <p className="text-muted-foreground flex items-start gap-2 text-xs leading-relaxed">
          <ShieldCheck className="text-accent mt-0.5 size-4 shrink-0" />
          Os segredos são cifrados (AES-256-GCM) antes de irem para o banco e nunca são exibidos novamente.
        </p>

        {message && (
          <Alert variant={message.ok ? "default" : "destructive"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={save} disabled={busy || (!token.trim() && !secret.trim())}>
            {busy ? "Salvando..." : "Salvar"}
          </Button>
          {data.configured && (
            <Button variant="destructive" onClick={() => setRemoving(true)} disabled={busy}>
              <Trash2 /> Remover credenciais
            </Button>
          )}
        </div>
      </section>

      <section className="border-border flex flex-col gap-3 rounded-2xl border bg-white/[0.02] p-5">
        <h3 className="text-sm font-bold">URL do webhook</h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          Cadastre esta URL em Mercado Pago → Seu negócio → Webhooks → evento "Pagamentos". Precisa ser HTTPS. O pedido também é conferido a cada poucos segundos enquanto o jogador está no Pix.
        </p>
        <div className="flex items-center gap-2">
          <code className="border-border min-w-0 flex-1 truncate rounded-lg border bg-white/[0.03] px-3 py-2 font-mono text-xs">{webhookUrl}</code>
          <Button size="icon" variant="outline" onClick={copyWebhook} aria-label="Copiar URL do webhook">
            {copied ? <Check className="text-accent" /> : <Copy />}
          </Button>
        </div>
      </section>

      <ConfirmDialog
        open={removing}
        onOpenChange={setRemoving}
        title="Remover credenciais"
        description="A loja deixa de aceitar pagamentos até um novo token ser configurado."
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={async () => {
          await storeService.removeMercadoPago()
          setRemoving(false)
          refetch()
        }}
      />
    </div>
  )
}
