import { useCallback, useEffect, useRef, useState } from "react"
import { Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/states"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { ApiError } from "@/api/client"
import { useStoreRealtime } from "@/hooks/useStoreRealtime"
import { computeDiscount, formatBRL, formatCouponValue } from "@/lib/money"
import { storeService } from "@/services/store.service"
import type { CouponPreview, StoreCatalog, StoreOrder } from "@/types"
import { ProductImage } from "./ProductCard"
import { MAX_QUANTITY, useCart } from "./useCart"

type AppliedCoupon = CouponPreview["coupon"]

export function CartSheet({
  open,
  onOpenChange,
  catalog,
  onOrderCreated,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  catalog: StoreCatalog
  onOrderCreated: (order: StoreOrder) => void
}) {
  const cart = useCart()
  const { items, totalCents: subtotalCents } = cart.resolve(catalog.products)
  const payload = items.map(({ product, quantity }) => ({ productId: product.id, quantity }))
  const payloadRef = useRef(payload)
  payloadRef.current = payload

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [applied, setApplied] = useState<AppliedCoupon | null>(null)
  const [couponError, setCouponError] = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  const discountCents = applied ? computeDiscount(applied, subtotalCents) : 0
  const totalCents = subtotalCents - discountCents

  async function applyCoupon() {
    const code = input.trim()
    if (!code) return
    setChecking(true)
    setCouponError(null)
    try {
      const preview = await storeService.previewCoupon(payload, code)
      setApplied(preview.coupon)
      setInput("")
    } catch (err) {
      setCouponError(err instanceof ApiError ? err.message : "Não foi possível validar o cupom.")
    } finally {
      setChecking(false)
    }
  }

  const revalidate = useCallback(async () => {
    if (!applied || payloadRef.current.length === 0) return
    try {
      setApplied((await storeService.previewCoupon(payloadRef.current, applied.code)).coupon)
    } catch {
      setApplied(null)
      setCouponError("O cupom aplicado não está mais válido.")
    }
  }, [applied])
  useStoreRealtime({ onCoupons: revalidate, onCatalog: revalidate })

  useEffect(() => {
    if (items.length === 0 && applied) setApplied(null)
  }, [items.length, applied])

  async function checkout() {
    setBusy(true)
    setError(null)
    try {
      const { order } = await storeService.checkout(payload, applied?.code)
      cart.clear()
      setApplied(null)
      onOpenChange(false)
      onOrderCreated(order)
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Não foi possível finalizar a compra."
      if (err instanceof ApiError && err.status === 422) setApplied(null)
      setError(message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-border border-b p-5 pr-14">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="size-4" /> Seu carrinho
          </SheetTitle>
          <SheetDescription>Revise os itens antes de pagar com Pix.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <EmptyState icon={<ShoppingBag className="size-6" />} title="Carrinho vazio" description="Adicione produtos da loja para continuar." />
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map(({ product, quantity }) => (
                <li key={product.id} className="border-border flex gap-3 rounded-xl border bg-white/[0.02] p-3">
                  <ProductImage src={product.image} alt="" className="size-16 shrink-0 rounded-lg" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm leading-snug font-medium break-words">{product.name}</p>
                      <button type="button" onClick={() => cart.remove(product.id)} aria-label={`Remover ${product.name}`} className="text-muted-foreground hover:text-destructive -m-1 shrink-0 rounded-md p-1 transition-colors">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="border-border inline-flex items-center rounded-lg border bg-white/[0.03]">
                        <Button size="icon-xs" variant="ghost" onClick={() => cart.setQuantity(product.id, quantity - 1)} aria-label="Diminuir quantidade">
                          <Minus />
                        </Button>
                        <span className="w-7 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                        <Button size="icon-xs" variant="ghost" disabled={quantity >= MAX_QUANTITY} onClick={() => cart.setQuantity(product.id, quantity + 1)} aria-label="Aumentar quantidade">
                          <Plus />
                        </Button>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{formatBRL(product.priceCents * quantity)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="border-border mt-0 flex-col gap-3 border-t p-5">
            {/* Cupom */}
            {applied ? (
              <div className="border-accent/30 bg-accent/[0.07] flex items-center gap-2.5 rounded-xl border px-3 py-2.5">
                <Tag className="text-accent size-4 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[13px] font-semibold">{applied.code}</p>
                  <p className="text-muted-foreground text-xs">{formatCouponValue(applied)}</p>
                </div>
                <Button size="icon-xs" variant="ghost" onClick={() => setApplied(null)} aria-label="Remover cupom">
                  <X />
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <form
                  onSubmit={event => {
                    event.preventDefault()
                    applyCoupon()
                  }}
                  className="flex gap-2"
                >
                  <input
                    value={input}
                    onChange={event => setInput(event.target.value.toUpperCase())}
                    placeholder="Cupom de desconto"
                    aria-label="Cupom de desconto"
                    maxLength={24}
                    autoCapitalize="characters"
                    className="border-border placeholder:text-muted-foreground focus:border-primary/50 focus:ring-primary/15 h-10 min-w-0 flex-1 rounded-xl border bg-white/[0.03] px-3 font-mono text-base uppercase outline-none focus:ring-4 sm:text-sm"
                  />
                  <Button type="submit" variant="outline" disabled={!input.trim() || checking}>
                    {checking ? "Validando..." : "Aplicar"}
                  </Button>
                </form>
                {couponError && <p className="text-destructive text-xs font-medium">{couponError}</p>}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {!catalog.checkoutEnabled && (
              <Alert>
                <AlertDescription>{catalog.paused ? "A loja está pausada no momento. Volte em breve." : "A loja ainda não está recebendo pagamentos. Volte em breve."}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              {discountCents > 0 && (
                <>
                  <div className="text-muted-foreground flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatBRL(subtotalCents)}</span>
                  </div>
                  <div className="text-accent flex justify-between text-sm font-medium">
                    <span>Desconto</span>
                    <span className="tabular-nums">− {formatBRL(discountCents)}</span>
                  </div>
                </>
              )}
              <div className="flex items-baseline justify-between">
                <span className="text-muted-foreground text-sm">Total</span>
                <span className="text-2xl font-bold tracking-tight tabular-nums">{formatBRL(totalCents)}</span>
              </div>
            </div>

            <Button size="xl" onClick={checkout} disabled={busy || !catalog.checkoutEnabled}>
              {busy ? "Gerando Pix..." : "Pagar com Pix"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
