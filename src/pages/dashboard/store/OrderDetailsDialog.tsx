import { useCallback, useEffect, useState } from "react"
import { Check, Copy, Gift, ShieldCheck, Tag, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog"
import { useStoreRealtime } from "@/hooks/useStoreRealtime"
import { formatBRL } from "@/lib/money"
import { ORDER_STATUS } from "@/lib/store-meta"
import { storeService } from "@/services/store.service"
import type { StoreOrder } from "@/types"
import { DeliveryTimeline } from "./DeliveryTimeline"
import { PixPanel } from "./PixPanel"
import { ProductImage } from "./ProductCard"

const POLL_MS = 4000
const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" })

function Row({ label, children, strong }: { label: string; children: React.ReactNode; strong?: boolean }) {
  return (
    <div className={strong ? "flex items-baseline justify-between gap-3 text-base font-bold" : "text-muted-foreground flex items-baseline justify-between gap-3 text-sm"}>
      <span>{label}</span>
      <span className={strong ? "tabular-nums" : "text-foreground tabular-nums"}>{children}</span>
    </div>
  )
}

export function OrderDetailsDialog({ initial, onClose }: { initial: StoreOrder | null; onClose: (order: StoreOrder | null) => void }) {
  const [order, setOrder] = useState<StoreOrder | null>(initial)
  const [copied, setCopied] = useState(false)
  const code = initial?.code

  useEffect(() => setOrder(initial), [initial])

  const reload = useCallback(async () => {
    if (!code) return
    try {
      setOrder((await storeService.order(code)).order)
    } catch {}
  }, [code])

  useStoreRealtime({ onOrder: event => (event.code === code || event.code === "*") && reload() })

  useEffect(() => {
    if (!code || order?.status !== "pending") return
    const id = setInterval(reload, POLL_MS)
    return () => clearInterval(id)
  }, [code, order?.status, reload])

  async function copyCode() {
    if (!order) return
    await navigator.clipboard.writeText(order.code).catch(() => null)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const status = order ? ORDER_STATUS[order.status] : null

  return (
    <Dialog open={!!initial} onOpenChange={open => !open && onClose(order)}>
      <DialogContent className="max-h-[92dvh] max-w-xl gap-0 overflow-y-auto p-0 sm:p-0">
        {order && status && (
          <>
            <header className="border-border flex flex-col gap-2 border-b p-5 pr-14">
              <div className="flex flex-wrap items-center gap-2">
                <DialogTitle className="font-mono text-base">{order.code}</DialogTitle>
                <button type="button" onClick={copyCode} aria-label="Copiar código do pedido" className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors">
                  {copied ? <Check className="text-accent size-3.5" /> : <Copy className="size-3.5" />}
                </button>
                <Badge variant={status.tone}>{status.label}</Badge>
              </div>
              <DialogDescription>{dateFormat.format(new Date(order.createdAt))}</DialogDescription>
            </header>

            <div className="flex flex-col gap-6 p-5">
              {order.status === "pending" && <PixPanel order={order} />}

              {(order.status === "expired" || order.status === "canceled" || order.status === "refunded") && (
                <p className="text-muted-foreground flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 text-sm">
                  <XCircle className="text-destructive size-4 shrink-0" />
                  {order.status === "expired" ? "O Pix expirou e nenhuma cobrança foi feita." : order.status === "refunded" ? "Este pedido foi reembolsado." : "Este pedido foi cancelado."}
                </p>
              )}

              {order.status === "paid" && <DeliveryTimeline order={order} />}

              <section className="flex flex-col gap-3">
                <h3 className="text-sm font-bold">O que você comprou</h3>
                <ul className="flex flex-col gap-3">
                  {order.items.map(item => (
                    <li key={item.productId} className="border-border flex flex-col gap-3 rounded-xl border bg-white/[0.02] p-3.5">
                      <div className="flex items-center gap-3">
                        <ProductImage src={item.image} alt="" className="size-14 shrink-0 rounded-lg" />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm leading-snug font-semibold break-words">{item.name}</p>
                          <p className="text-muted-foreground text-xs tabular-nums">
                            {item.quantity} × {formatBRL(item.unitCents)}
                          </p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums">{formatBRL(item.unitCents * item.quantity)}</span>
                      </div>

                      {item.description && <p className="text-muted-foreground text-[13px] leading-relaxed break-words whitespace-pre-wrap">{item.description}</p>}

                      {(item.contents.length > 0 || item.roleName) && (
                        <div className="flex flex-col gap-1.5">
                          <p className="flex items-center gap-1.5 text-xs font-semibold">
                            <Gift className="text-primary size-3.5" /> Inclui
                          </p>
                          <ul className="flex flex-col gap-1">
                            {item.contents.map(entry => (
                              <li key={entry} className="flex items-start gap-2 text-[13px] leading-snug">
                                <Check className="text-accent mt-0.5 size-3.5 shrink-0" strokeWidth={3} />
                                <span className="min-w-0 break-words">{entry}</span>
                              </li>
                            ))}
                            {item.roleName && (
                              <li className="flex items-start gap-2 text-[13px] leading-snug">
                                <ShieldCheck className="text-accent mt-0.5 size-3.5 shrink-0" />
                                <span className="min-w-0 break-words">Cargo no Discord: {item.roleName}</span>
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="border-border flex flex-col gap-2 rounded-xl border bg-white/[0.02] p-4">
                <Row label="Subtotal">{formatBRL(order.subtotalCents)}</Row>
                {order.coupon && order.discountCents > 0 && (
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Tag className="size-3.5" /> Cupom <code className="text-foreground rounded bg-white/[0.07] px-1.5 font-mono text-xs">{order.coupon.code}</code>
                    </span>
                    <span className="text-accent font-semibold tabular-nums">− {formatBRL(order.discountCents)}</span>
                  </div>
                )}
                <div className="border-border my-1 border-t" />
                <Row label="Total" strong>
                  {formatBRL(order.totalCents)}
                </Row>
                {order.paidAt && <p className="text-muted-foreground text-xs">Pago em {dateFormat.format(new Date(order.paidAt))}</p>}
              </section>

              <Button variant={order.status === "pending" ? "ghost" : "default"} onClick={() => onClose(order)}>
                {order.status === "pending" ? "Fechar e pagar depois" : "Concluir"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
