import { useEffect, useState } from "react"
import { CheckCircle2, Copy, Loader2, QrCode, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { DELIVERY_STATUS } from "@/lib/store-meta"
import { formatBRL } from "@/lib/money"
import { storeService } from "@/services/store.service"
import type { StoreOrder } from "@/types"

const POLL_MS = 4000

function useCountdown(expiresAt: string, active: boolean) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [active])
  const left = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000))
  return `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`
}

function CopyCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="flex w-full flex-col gap-2">
      <p className="text-muted-foreground text-xs font-medium">Pix copia e cola</p>
      <div className="border-border rounded-lg border bg-white/[0.03] p-2.5 font-mono text-[11px] leading-snug break-all select-all">{code}</div>
      <Button variant="outline" onClick={copy}>
        {copied ? <CheckCircle2 className="text-accent" /> : <Copy />}
        {copied ? "Código copiado!" : "Copiar código"}
      </Button>
    </div>
  )
}

export function PixCheckoutDialog({ initial, onClose }: { initial: StoreOrder | null; onClose: (order: StoreOrder | null) => void }) {
  const [order, setOrder] = useState<StoreOrder | null>(initial)
  const code = initial?.code

  useEffect(() => setOrder(initial), [initial])

  useEffect(() => {
    if (!code || order?.status !== "pending") return
    const id = setInterval(async () => {
      try {
        setOrder((await storeService.order(code)).order)
      } catch {}
    }, POLL_MS)
    return () => clearInterval(id)
  }, [code, order?.status])

  const pending = order?.status === "pending"
  const countdown = useCountdown(order?.expiresAt ?? new Date().toISOString(), pending)

  return (
    <Dialog open={!!initial} onOpenChange={open => !open && onClose(order)}>
      <DialogContent className="max-h-[92dvh] max-w-md overflow-y-auto">
        {order && (
          <div className="flex flex-col items-center gap-5 text-center">
            {pending && (
              <>
                <div className="flex flex-col items-center gap-1">
                  <DialogTitle className="flex items-center gap-2 text-lg">
                    <QrCode className="size-5" /> Pague com Pix
                  </DialogTitle>
                  <DialogDescription>Escaneie o QR Code ou use o código copia e cola no app do seu banco.</DialogDescription>
                </div>

                <p className="text-3xl font-bold tracking-tight tabular-nums">{formatBRL(order.totalCents)}</p>

                {order.pix?.qrCodeBase64 && (
                  <img src={`data:image/png;base64,${order.pix.qrCodeBase64}`} alt="QR Code Pix" className="size-52 rounded-xl bg-white p-2.5" />
                )}
                {order.pix?.qrCode && <CopyCode code={order.pix.qrCode} />}

                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                  <Loader2 className="size-3.5 animate-spin" />
                  Aguardando pagamento · expira em <span className="text-foreground font-semibold tabular-nums">{countdown}</span>
                </div>
              </>
            )}

            {order.status === "paid" && (
              <>
                <span className="bg-accent/15 text-accent grid size-14 place-items-center rounded-full">
                  <CheckCircle2 className="size-7" />
                </span>
                <div>
                  <DialogTitle className="text-lg">Pagamento aprovado!</DialogTitle>
                  <DialogDescription className="mt-1">Pedido {order.code}. Seus itens são entregues automaticamente no servidor.</DialogDescription>
                </div>
                <Badge variant={DELIVERY_STATUS[order.delivery.status].tone}>{DELIVERY_STATUS[order.delivery.status].label}</Badge>
              </>
            )}

            {(order.status === "expired" || order.status === "canceled" || order.status === "refunded") && (
              <>
                <span className="bg-destructive/15 text-destructive grid size-14 place-items-center rounded-full">
                  <XCircle className="size-7" />
                </span>
                <div>
                  <DialogTitle className="text-lg">{order.status === "expired" ? "Pix expirado" : "Pedido encerrado"}</DialogTitle>
                  <DialogDescription className="mt-1">Nenhuma cobrança foi feita. Você pode montar um novo pedido na loja.</DialogDescription>
                </div>
              </>
            )}

            <Button variant={pending ? "ghost" : "default"} className="w-full" onClick={() => onClose(order)}>
              {pending ? "Fechar e pagar depois" : "Concluir"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
