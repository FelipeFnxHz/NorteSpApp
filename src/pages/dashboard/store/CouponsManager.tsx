import { useState } from "react"
import { Pencil, Plus, Tag, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { useApi } from "@/hooks/useApi"
import { useStoreRealtime } from "@/hooks/useStoreRealtime"
import { formatCouponValue } from "@/lib/money"
import { storeService } from "@/services/store.service"
import type { StoreCoupon } from "@/types"
import { CouponDialog } from "./CouponDialog"

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" })

function couponState(coupon: StoreCoupon): { label: string; tone: "success" | "secondary" | "destructive" } {
  if (!coupon.active) return { label: "Inativo", tone: "secondary" }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= Date.now()) return { label: "Expirado", tone: "destructive" }
  if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) return { label: "Esgotado", tone: "destructive" }
  return { label: "Ativo", tone: "success" }
}

export function CouponsManager() {
  const { data, loading, error, refetch } = useApi(() => storeService.coupons(), [])
  const [dialog, setDialog] = useState<{ editing: StoreCoupon | null } | null>(null)
  const [removing, setRemoving] = useState<StoreCoupon | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useStoreRealtime({ onCoupons: refetch })

  async function toggle(coupon: StoreCoupon) {
    setTogglingId(coupon.id)
    try {
      await storeService.updateCoupon(coupon.id, { code: coupon.code, type: coupon.type, value: coupon.value, maxUses: coupon.maxUses, expiresAt: coupon.expiresAt, active: !coupon.active })
      refetch()
    } finally {
      setTogglingId(null)
    }
  }

  if (loading && !data) return <Skeleton className="h-72 w-full rounded-2xl" />
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />
  const coupons = data?.coupons ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold">Cupons ({coupons.length})</p>
        <Button onClick={() => setDialog({ editing: null })}>
          <Plus /> Novo cupom
        </Button>
      </div>

      {coupons.length === 0 ? (
        <EmptyState icon={<Tag className="size-6" />} title="Nenhum cupom" description="Crie cupons de desconto por porcentagem ou valor fixo." />
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {coupons.map(coupon => {
            const state = couponState(coupon)
            const percent = coupon.maxUses ? Math.min(100, Math.round((coupon.uses / coupon.maxUses) * 100)) : 0
            return (
              <li key={coupon.id} className="border-border flex flex-col gap-3 rounded-2xl border bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-base font-bold tracking-wide break-all">{coupon.code}</p>
                    <p className="text-muted-foreground text-xs">{formatCouponValue(coupon)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge variant={state.tone}>{state.label}</Badge>
                    <Switch checked={coupon.active} disabled={togglingId === coupon.id} onCheckedChange={() => toggle(coupon)} aria-label={`Ativar ${coupon.code}`} />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="text-muted-foreground flex justify-between text-xs tabular-nums">
                    <span>{coupon.maxUses ? `${coupon.uses} de ${coupon.maxUses} usos` : `${coupon.uses} uso(s) · ilimitado`}</span>
                    <span>{coupon.expiresAt ? `Expira em ${dateFormat.format(new Date(coupon.expiresAt))}` : "Sem validade"}</span>
                  </div>
                  {coupon.maxUses && (
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]" role="progressbar" aria-valuemin={0} aria-valuemax={coupon.maxUses} aria-valuenow={coupon.uses}>
                      <div className="bg-primary h-full rounded-full transition-[width] duration-500" style={{ width: `${percent}%` }} />
                    </div>
                  )}
                </div>

                <div className="border-border flex justify-end gap-1 border-t pt-2.5">
                  <Button size="sm" variant="ghost" onClick={() => setDialog({ editing: coupon })}>
                    <Pencil /> Editar
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setRemoving(coupon)}>
                    <Trash2 className="text-destructive" /> Excluir
                  </Button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {dialog && (
        <CouponDialog
          key={dialog.editing?.id ?? "new"}
          editing={dialog.editing}
          onClose={saved => {
            setDialog(null)
            if (saved) refetch()
          }}
        />
      )}

      <ConfirmDialog
        open={!!removing}
        onOpenChange={open => !open && setRemoving(null)}
        title="Excluir cupom"
        description={`Excluir "${removing?.code}"? Pedidos que já usaram este cupom não são afetados.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={async () => {
          await storeService.removeCoupon(removing!.id)
          setRemoving(null)
          refetch()
        }}
      />
    </div>
  )
}
