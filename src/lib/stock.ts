import type { StoreProduct } from "@/types"

export interface StockBadge { label: string; tone: "ok" | "warn" | "bad" }

export function stockBadge(product: Pick<StoreProduct, "stock" | "soldOut">, showPlenty = false): StockBadge | null {
  if (product.soldOut) return { label: "Esgotado", tone: "bad" }
  if (product.stock === null) return null
  if (product.stock <= 5) return { label: product.stock === 1 ? "Última unidade" : `Restam ${product.stock}`, tone: "warn" }
  return showPlenty ? { label: `${product.stock} em estoque`, tone: "ok" } : null
}

export const STOCK_TONE_CLASS = {
  ok: "border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]",
  warn: "border-[#f5b94a]/30 bg-[#f5b94a]/10 text-[#f5b94a]",
  bad: "border-[#f0464f]/30 bg-[#f0464f]/10 text-[#f0464f]",
} as const
