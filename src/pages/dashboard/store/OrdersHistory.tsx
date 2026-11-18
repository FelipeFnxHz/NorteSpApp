import { useState } from "react"
import { QrCode, ReceiptText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { useApi } from "@/hooks/useApi"
import { useStoreRealtime } from "@/hooks/useStoreRealtime"
import { storeService } from "@/services/store.service"
import type { StoreOrder } from "@/types"
import { OrderCard } from "./OrderCard"
import { OrderDetailsDialog } from "./OrderDetailsDialog"

export function OrdersHistory({ refreshKey }: { refreshKey: number }) {
  const { data, loading, error, refetch } = useApi(() => storeService.myOrders(), [refreshKey])
  const [open, setOpen] = useState<StoreOrder | null>(null)
  useStoreRealtime({ onOrder: refetch })

  if (loading && !data) return <Skeleton className="h-72 w-full rounded-2xl" />
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />

  const orders = data?.orders ?? []
  if (orders.length === 0) return <EmptyState icon={<ReceiptText className="size-6" />} title="Nenhuma compra ainda" description="Seus pedidos e o status das entregas aparecem aqui." />

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
      {orders.map(order => (
        <OrderCard
          key={order.code}
          order={order}
          onOpen={() => setOpen(order)}
          actions={
            order.status === "pending" && (
              <Button size="sm" onClick={() => setOpen(order)}>
                <QrCode /> Pagar agora
              </Button>
            )
          }
        />
      ))}
      <OrderDetailsDialog
        initial={open}
        onClose={() => {
          setOpen(null)
          refetch()
        }}
      />
    </div>
  )
}
