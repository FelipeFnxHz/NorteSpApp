import { Check, Plus, ShieldCheck, Terminal } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatBRL } from "@/lib/money"
import { STOCK_TONE_CLASS, stockBadge } from "@/lib/stock"
import { cn } from "@/lib/utils"
import type { StoreProduct } from "@/types"
import { ProductImage } from "./ProductCard"

interface Props {
  product: StoreProduct | null
  categoryName?: string
  inCart: number
  onAdd: () => void
  onClose: () => void
}

export function ProductDetailsDialog({ product, categoryName, inCart, onAdd, onClose }: Props) {
  return (
    <Dialog open={!!product} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-xl gap-5 p-0 sm:p-0">
        {product && (
          <>
            <ProductImage src={product.image} alt={product.name} className="aspect-[16/8] w-full rounded-t-2xl" />

            <div className="flex flex-col gap-5 px-4 pb-1 sm:px-6">
              <DialogHeader>
                <div className="flex flex-wrap items-center gap-2">
                  {categoryName && <Badge variant="secondary">{categoryName}</Badge>}
                  <span className="text-primary text-lg font-bold tabular-nums">{formatBRL(product.priceCents)}</span>
                  {(() => { const badge = stockBadge(product, true); return badge && <span className={cn("ml-2 rounded-full border px-2.5 py-0.5 align-middle text-[11px] font-semibold", STOCK_TONE_CLASS[badge.tone])}>{badge.label}</span> })()}
                </div>
                <DialogTitle className="text-xl leading-snug break-words">{product.name}</DialogTitle>
                <DialogDescription className="text-[13.5px] leading-relaxed break-words whitespace-pre-line">
                  {product.description || "Este produto não tem descrição."}
                </DialogDescription>
              </DialogHeader>

              {product.contents.length > 0 && (
                <section className="flex flex-col gap-2">
                  <h3 className="text-xs font-bold tracking-wide uppercase">O que inclui</h3>
                  <ul className="flex flex-col gap-1.5">
                    {product.contents.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="text-accent mt-0.5 size-4 shrink-0" />
                        <span className="break-words">{item}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {product.rewardRoleName && (
                <p className="border-border flex items-center gap-2 rounded-xl border bg-white/[0.02] px-3 py-2.5 text-sm">
                  <ShieldCheck className="text-primary size-4 shrink-0" />
                  <span>
                    Cargo no Discord: <strong className="font-semibold">{product.rewardRoleName}</strong>
                  </span>
                </p>
              )}

              {product.deliveryCommands && product.deliveryCommands.length > 0 && (
                <section className="border-border flex flex-col gap-2 rounded-xl border bg-white/[0.02] p-3">
                  <h3 className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase">
                    <Terminal className="size-3.5" /> Comandos de entrega (só a staff vê)
                  </h3>
                  <ul className="flex flex-col gap-1">
                    {product.deliveryCommands.map((command, index) => (
                      <li key={index} className="overflow-x-auto rounded-md bg-black/30 px-2.5 py-1.5 font-mono text-[12px] whitespace-nowrap">
                        {command}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <DialogFooter className="border-border border-t px-4 py-4 sm:px-6">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button onClick={onAdd} disabled={product.soldOut || (product.stock !== null && inCart >= product.stock)}>
                {inCart ? <Check /> : <Plus />}
                {product.soldOut ? "Esgotado" : inCart ? `No carrinho · ${inCart} (adicionar mais)` : "Adicionar ao carrinho"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
