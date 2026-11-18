import { useEffect, useState } from "react"
import { CheckCircle2, Copy, Loader2, QrCode } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatBRL } from "@/lib/money"
import type { StoreOrder } from "@/types"

function useCountdown(expiresAt: string) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const left = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 1000))
  return `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`
}

export function PixPanel({ order }: { order: StoreOrder }) {
  const [copied, setCopied] = useState(false)
  const countdown = useCountdown(order.expiresAt)

  async function copy() {
    if (!order.pix?.qrCode) return
    try {
      await navigator.clipboard.writeText(order.pix.qrCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <section className="border-primary/25 bg-primary/[0.04] flex flex-col items-center gap-4 rounded-2xl border p-5 text-center">
      <p className="flex items-center gap-2 text-sm font-bold">
        <QrCode className="size-4" /> Pague com Pix · {formatBRL(order.totalCents)}
      </p>

      {order.pix?.qrCodeBase64 && <img src={`data:image/png;base64,${order.pix.qrCodeBase64}`} alt="QR Code Pix" className="size-48 rounded-xl bg-white p-2.5 sm:size-52" />}

      {order.pix?.qrCode && (
        <div className="flex w-full flex-col gap-2 text-left">
          <p className="text-muted-foreground text-xs font-medium">Pix copia e cola</p>
          <div className="border-border rounded-lg border bg-white/[0.03] p-2.5 font-mono text-[11px] leading-snug break-all select-all">{order.pix.qrCode}</div>
          <Button variant="outline" onClick={copy}>
            {copied ? <CheckCircle2 className="text-accent" /> : <Copy />}
            {copied ? "Código copiado!" : "Copiar código"}
          </Button>
        </div>
      )}

      <p className="text-muted-foreground flex items-center gap-2 text-xs">
        <Loader2 className="size-3.5 animate-spin" />
        Aguardando pagamento · expira em <span className="text-foreground font-semibold tabular-nums">{countdown}</span>
      </p>
    </section>
  )
}
