import { Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DELIVERY_STATUS, ORDER_STATUS } from "@/lib/store-meta"
import { formatBRL } from "@/lib/money"
import type { StoreOrder } from "@/types"
import { ProductImage } from "./ProductCard"

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" })

export function OrderCard({ order, actions, showBuyer, onOpen }: { order: StoreOrder; actions?: React.ReactNode; showBuyer?: boolean; onOpen?: () => void }) {
  const status = ORDER_STATUS[order.status]
  const delivery = DELIVERY_STATUS[order.delivery.status]

  return (
    <article className="border-border flex flex-col gap-3.5 rounded-2xl border bg-white/[0.02] p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-[13px] font-semibold">{order.code}</p>
          <p className="text-muted-foreground text-xs">
            {dateFormat.format(new Date(order.createdAt))}
            {showBuyer && order.username && ` · ${order.username}`}
            {showBuyer && order.citizenid && ` · ID ${order.citizenid}`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={status.tone}>{status.label}</Badge>
          {order.status === "paid" && <Badge variant={delivery.tone}>{delivery.label}</Badge>}
        </div>
      </header>

      <ul className="flex flex-col gap-2">
        {order.items.map(item => (
          <li key={item.productId} className="flex items-center gap-3">
            <ProductImage src={item.image} alt="" className="size-10 shrink-0 rounded-lg" />
            <span className="min-w-0 flex-1 text-sm break-words">
              {item.name} <span className="text-muted-foreground">× {item.quantity}</span>
            </span>
            <span className="text-sm tabular-nums">{formatBRL(item.unitCents * item.quantity)}</span>
          </li>
        ))}
      </ul>

      {order.delivery.error && <p className="text-destructive text-xs break-words">Falha: {order.delivery.error}</p>}

      <footer className="border-border flex flex-wrap items-center justify-between gap-3 border-t pt-3">
        <span className="text-base font-bold tabular-nums">{formatBRL(order.totalCents)}</span>
        <div className="flex flex-wrap gap-2">
          {onOpen && (
            <Button size="sm" variant="ghost" onClick={onOpen}>
              <Eye /> Ver detalhes
            </Button>
          )}
          {actions}
        </div>
      </footer>
    </article>
  )
}
