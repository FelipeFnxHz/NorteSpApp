import type { StoreDeliveryStatus, StoreOrderStatus } from "@/types"

type Tone = "success" | "secondary" | "destructive" | "outline" | "default"

export const ORDER_STATUS: Record<StoreOrderStatus, { label: string; tone: Tone }> = {
  pending: { label: "Aguardando pagamento", tone: "outline" },
  paid: { label: "Pago", tone: "success" },
  expired: { label: "Expirado", tone: "secondary" },
  canceled: { label: "Cancelado", tone: "destructive" },
  refunded: { label: "Reembolsado", tone: "secondary" },
}

export const DELIVERY_STATUS: Record<StoreDeliveryStatus, { label: string; tone: Tone }> = {
  waiting: { label: "Aguardando pagamento", tone: "outline" },
  queued: { label: "Entrega em andamento", tone: "outline" },
  delivered: { label: "Entregue", tone: "success" },
  failed: { label: "Falha na entrega", tone: "destructive" },
}

export const DELIVERY_PLACEHOLDERS = ["{citizenid}", "{discordId}", "{quantity}", "{orderCode}"] as const
