import { useState } from "react"
import { Check, ImageOff, Info, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { assetUrl } from "@/api/client"
import { formatBRL } from "@/lib/money"
import { STOCK_TONE_CLASS, stockBadge } from "@/lib/stock"
import { cn } from "@/lib/utils"
import type { StoreProduct } from "@/types"

export function ProductImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={cn("from-primary/15 via-white/[0.03] to-accent/10 text-muted-foreground/50 grid place-items-center bg-gradient-to-br", className)}>
        <ImageOff className="size-6" />
      </div>
    )
  }
  return <img src={assetUrl(src)} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cn("object-cover", className)} />
}

export function ProductCard({ product, inCart, onAdd, onDetails }: { product: StoreProduct; inCart: number; onAdd: () => void; onDetails: () => void }) {
  const badge = stockBadge(product)
  return (
    <article className="group border-border hover:border-primary/40 flex flex-col overflow-hidden rounded-2xl border bg-white/[0.02] transition-all hover:-translate-y-0.5 hover:bg-white/[0.035] hover:shadow-[0_18px_40px_-24px_color-mix(in_oklch,var(--primary),transparent_40%)]">
      <div className="relative">
        <ProductImage src={product.image} alt={product.name} className={cn("aspect-[16/10] w-full", product.soldOut && "opacity-50 grayscale")} />
        {badge && <span className={cn("absolute top-2.5 left-2.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur", STOCK_TONE_CLASS[badge.tone])}>{badge.label}</span>}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <h3 className="text-[15px] leading-snug font-semibold break-words">{product.name}</h3>
          {product.description && <p className="text-muted-foreground mt-1 line-clamp-2 text-[13px] leading-relaxed break-words">{product.description}</p>}
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-1">
          <span className="text-lg font-bold tracking-tight tabular-nums">{formatBRL(product.priceCents)}</span>
          <div className="flex items-center gap-1.5">
          <Button size="icon-sm" variant="outline" onClick={onDetails} aria-label={`Ver detalhes de ${product.name}`} title="Ver detalhes">
            <Info />
          </Button>
          <Button size="sm" variant={inCart ? "outline" : "default"} onClick={onAdd} disabled={product.soldOut || (product.stock !== null && inCart >= product.stock)} aria-label={`Adicionar ${product.name} ao carrinho`}>
            {inCart ? <Check className="text-accent" /> : <Plus />}
            {product.soldOut ? "Esgotado" : inCart ? `No carrinho · ${inCart}` : "Adicionar"}
          </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
