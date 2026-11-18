import { useState } from "react"
import { ReceiptText, RefreshCw, Truck } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/form"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { ApiError } from "@/api/client"
import { useStoreRealtime } from "@/hooks/useStoreRealtime"
import { useApi } from "@/hooks/useApi"
import { ORDER_STATUS } from "@/lib/store-meta"
import { storeService } from "@/services/store.service"
import type { StoreOrderStatus } from "@/types"
import { OrderCard } from "./OrderCard"

export function StoreOrdersAdmin() {
  const [status, setStatus] = useState<StoreOrderStatus | "">("")
  const { data, loading, error, refetch } = useApi(() => storeService.allOrders(status || undefined), [status])
  const [busyCode, setBusyCode] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  useStoreRealtime({ onOrder: refetch })

  async function redeliver(code: string) {
    setBusyCode(code)
    setActionError(null)
    try {
      await storeService.redeliver(code)
      refetch()
    } catch (err) {
      setActionError(err instanceof ApiError ? err.message : "Falha ao reentregar.")
    } finally {
      setBusyCode(null)
    }
  }

  const orders = data?.orders ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div className="w-full max-w-56">
          <Select
            label="Status"
            value={status}
            onChange={e => setStatus(e.target.value as StoreOrderStatus | "")}
            placeholder="Todos"
            options={Object.entries(ORDER_STATUS).map(([value, meta]) => ({ value, label: meta.label }))}
          />
        </div>
        <Button variant="outline" onClick={refetch} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} /> Atualizar
        </Button>
      </div>

      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}

      {loading && !data ? (
        <Skeleton className="h-72 w-full rounded-2xl" />
      ) : error && !data ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : orders.length === 0 ? (
        <EmptyState icon={<ReceiptText className="size-6" />} title="Nenhum pedido" description="Os pedidos da loja aparecem aqui." />
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {orders.map(order => (
            <OrderCard
              key={order.code}
              order={order}
              showBuyer
              actions={
                order.status === "paid" &&
                order.delivery.status !== "delivered" && (
                  <Button size="sm" variant="outline" disabled={busyCode === order.code} onClick={() => redeliver(order.code)}>
                    <Truck /> {busyCode === order.code ? "Reentregando..." : "Reentregar"}
                  </Button>
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
