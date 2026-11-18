import { useCallback, useEffect, useState } from "react"
import { Check, Copy, KeyRound, RefreshCw, ShieldAlert, Trash2 } from "lucide-react"
import { ApiError, apiOrigin } from "@/api/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { copyText } from "@/lib/clipboard"
import { formatDateTime } from "@/lib/community"
import { corporationsService } from "@/services/corporations.service"
import type { CorpLinkStatus } from "@/types"

function CopyButton({ text, label, size = "sm" }: { text: string; label: string; size?: "sm" | "default" }) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const id = setTimeout(() => setCopied(false), 2000)
    return () => clearTimeout(id)
  }, [copied])

  return (
    <Button type="button" size={size} variant={copied ? "secondary" : "outline"} onClick={async () => setCopied(await copyText(text))} aria-live="polite">
      {copied ? <Check className="text-accent size-4" /> : <Copy className="size-4" />}
      {copied ? "Copiado!" : label}
    </Button>
  )
}

function Snippet({ code }: { code: string }) {
  const text = `GET ${apiOrigin()}/api/integrations/corporation\nX-Link-Code: ${code}`
  return (
    <div className="border-border bg-background/60 relative rounded-xl border">
      <pre className="overflow-x-auto p-3.5 pr-24 font-mono text-[11px] leading-relaxed whitespace-pre">{text}</pre>
      <div className="absolute top-2 right-2">
        <CopyButton text={text} label="Copiar" />
      </div>
    </div>
  )
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  slug: string
  corpName: string
}

export function LinkCodeDialog({ open, onOpenChange, slug, corpName }: Props) {
  const [status, setStatus] = useState<CorpLinkStatus | null>(null)
  const [issued, setIssued] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirming, setConfirming] = useState<"regenerate" | "revoke" | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setStatus(await corporationsService.linkStatus(slug))
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível carregar o código.")
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    if (!open) {
      setIssued(null)
      setConfirming(null)
      return
    }
    void load()
  }, [open, load])

  async function run(action: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await action()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível concluir a ação.")
    } finally {
      setBusy(false)
      setConfirming(null)
    }
  }

  const generate = () =>
    run(async () => {
      const result = await corporationsService.generateLinkCode(slug)
      setIssued(result.code)
      setStatus(result)
    })

  const revoke = () =>
    run(async () => {
      await corporationsService.revokeLinkCode(slug)
      setStatus({ exists: false })
    })

  return (
    <Dialog open={open} onOpenChange={next => !busy && onOpenChange(next)}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="size-5" />
            Código de vinculação
          </DialogTitle>
          <DialogDescription>
            Liga <strong className="text-foreground font-semibold">{corpName}</strong> ao bot do Discord e aos scripts do servidor FiveM, sem expor senhas ou chaves da Dashboard.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && !status && <Skeleton className="h-32 w-full rounded-xl" />}

          {issued ? (
            <>
              <div className="border-primary/30 bg-primary/8 flex flex-col items-center gap-4 rounded-2xl border p-5 text-center">
                <span className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">Seu código</span>
                <code className="font-mono text-lg font-bold tracking-wider break-all select-all sm:text-2xl">{issued}</code>
                <CopyButton text={issued} label="Copiar para a área de transferência" size="default" />
              </div>

              <Alert>
                <ShieldAlert />
                <AlertDescription>
                  <strong className="block">Guarde agora: este código não será mostrado de novo.</strong>
                  Ele funciona como uma senha da corporação. Se perder ou vazar, gere outro (o anterior deixa de funcionar).
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Como usar</h4>
                <ol className="text-muted-foreground mb-3 list-decimal space-y-1.5 pl-5 text-sm">
                  <li>Copie o código e guarde-o no config do seu script ou bot (nunca em canais públicos).</li>
                  <li>Envie-o no header <code className="text-foreground font-mono text-xs">X-Link-Code</code> a cada consulta.</li>
                  <li>A resposta traz a corporação, as patentes e os membros ativos (somente leitura).</li>
                </ol>
                <Snippet code={issued} />
              </div>
            </>
          ) : (
            status && (
              <>
                {status.exists ? (
                  <div className="border-border grid gap-3 rounded-2xl border bg-white/[0.02] p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="flex items-center gap-2 text-sm font-medium">
                        <span className="bg-accent size-2 rounded-full" />
                        Código ativo
                      </span>
                      <code className="bg-background/60 rounded-lg px-2.5 py-1 font-mono text-xs tracking-widest">NSP-•••••-•••••-•••••-{status.hint}</code>
                    </div>
                    <dl className="text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                      <div>
                        <dt className="font-semibold tracking-wide uppercase">Gerado em</dt>
                        <dd className="text-foreground mt-0.5">{status.createdAt && formatDateTime(status.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold tracking-wide uppercase">Por</dt>
                        <dd className="text-foreground mt-0.5 truncate">{status.createdByName}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold tracking-wide uppercase">Usos</dt>
                        <dd className="text-foreground mt-0.5 tabular-nums">{status.uses ?? 0}</dd>
                      </div>
                      <div>
                        <dt className="font-semibold tracking-wide uppercase">Último uso</dt>
                        <dd className="text-foreground mt-0.5">{status.lastUsedAt ? formatDateTime(status.lastUsedAt) : "Nunca"}</dd>
                      </div>
                    </dl>
                  </div>
                ) : (
                  <div className="border-border flex flex-col items-center gap-2 rounded-2xl border border-dashed p-6 text-center">
                    <Badge variant="secondary">Sem código ativo</Badge>
                    <p className="text-muted-foreground max-w-sm text-sm">Gere um código para vincular esta corporação ao bot e aos scripts do servidor.</p>
                  </div>
                )}

                {confirming && (
                  <Alert variant={confirming === "revoke" ? "destructive" : undefined}>
                    <ShieldAlert />
                    <AlertDescription>
                      {confirming === "revoke"
                        ? "Revogar desliga imediatamente tudo que usa este código."
                        : "O código atual deixa de funcionar assim que o novo for gerado. Atualize seus scripts depois."}
                    </AlertDescription>
                  </Alert>
                )}

                {status.exists && (
                  <Snippet code="SEU-CÓDIGO" />
                )}
              </>
            )
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          {issued ? (
            <Button onClick={() => setIssued(null)}>Concluir</Button>
          ) : (
            status && (
              <>
                {status.exists && (
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => (confirming === "revoke" ? void revoke() : setConfirming("revoke"))}
                  >
                    <Trash2 className="text-destructive size-4" />
                    {confirming === "revoke" ? "Confirmar revogação" : "Revogar"}
                  </Button>
                )}
                <Button
                  disabled={busy}
                  onClick={() => (status.exists && confirming !== "regenerate" ? setConfirming("regenerate") : void generate())}
                >
                  {status.exists ? <RefreshCw className="size-4" /> : <KeyRound className="size-4" />}
                  {busy ? "Gerando..." : status.exists ? (confirming === "regenerate" ? "Confirmar e gerar novo" : "Gerar novo código") : "Gerar código"}
                </Button>
              </>
            )
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
