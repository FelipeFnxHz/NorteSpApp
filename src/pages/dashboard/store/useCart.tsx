import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import type { StoreProduct } from "@/types"

const STORAGE_KEY = "nortesp:store-cart"
export const MAX_QUANTITY = 10

type Lines = Record<string, number>

interface CartValue {
  lines: Lines
  count: number
  add: (productId: string) => void
  setQuantity: (productId: string, quantity: number) => void
  remove: (productId: string) => void
  clear: () => void
  resolve: (products: StoreProduct[]) => { items: { product: StoreProduct; quantity: number }[]; totalCents: number }
}

const CartContext = createContext<CartValue | null>(null)

function load(): Lines {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Lines>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines))
    } catch {}
  }, [lines])

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines(current => {
      const next = { ...current }
      if (quantity <= 0) delete next[productId]
      else next[productId] = Math.min(quantity, MAX_QUANTITY)
      return next
    })
  }, [])

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count: Object.values(lines).reduce((sum, quantity) => sum + quantity, 0),
      add: id => setQuantity(id, (lines[id] ?? 0) + 1),
      setQuantity,
      remove: id => setQuantity(id, 0),
      clear: () => setLines({}),
      resolve: products => {
        const items = products.flatMap(product => (lines[product.id] ? [{ product, quantity: lines[product.id] }] : []))
        return { items, totalCents: items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0) }
      },
    }),
    [lines, setQuantity],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error("useCart deve ser usado dentro de <CartProvider>")
  return context
}
