const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export const formatBRL = (cents: number) => brl.format(cents / 100)

/** "29,90" / "29.90" / "29" -> 2990. Retorna null se inválido. */
export function parseBRLToCents(input: string): number | null {
  const normalized = input.trim().replace(/\./g, "").replace(",", ".")
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Math.round(Number(normalized) * 100)
}

export const centsToInput = (cents: number) => (cents / 100).toFixed(2).replace(".", ",")

/** Espelha computeDiscount do servidor para recalcular o carrinho na hora (o servidor continua sendo a fonte da verdade). */
export const MIN_TOTAL_CENTS = 100

export function computeDiscount(coupon: { type: "percent" | "fixed"; value: number }, subtotalCents: number): number {
  const raw = coupon.type === "percent" ? Math.floor((subtotalCents * coupon.value) / 100) : coupon.value
  return Math.max(0, Math.min(raw, subtotalCents - MIN_TOTAL_CENTS))
}

export const formatCouponValue = (coupon: { type: "percent" | "fixed"; value: number }) =>
  coupon.type === "percent" ? `${coupon.value}% off` : `${formatBRL(coupon.value)} off`
