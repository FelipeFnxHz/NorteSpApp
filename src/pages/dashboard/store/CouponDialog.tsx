import { useState } from "react"
import { Dices } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { ApiError } from "@/api/client"
import { centsToInput, parseBRLToCents } from "@/lib/money"
import { cn } from "@/lib/utils"
import { storeService } from "@/services/store.service"
import type { CouponType, StoreCoupon } from "@/types"

const TYPES: { value: CouponType; label: string }[] = [
  { value: "percent", label: "Porcentagem (%)" },
  { value: "fixed", label: "Valor fixo (R$)" },
]

const toLocalInput = (iso: string | null) => {
  if (!iso) return ""
  const date = new Date(iso)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

const randomCode = () => Array.from({ length: 8 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[Math.floor(Math.random() * 32)]).join("")

export function CouponDialog({ editing, onClose }: { editing: StoreCoupon | null; onClose: (saved: boolean) => void }) {
  const [code, setCode] = useState(editing?.code ?? "")
  const [type, setType] = useState<CouponType>(editing?.type ?? "percent")
  const [value, setValue] = useState(editing ? (editing.type === "percent" ? String(editing.value) : centsToInput(editing.value)) : "")
  const [maxUses, setMaxUses] = useState(editing?.maxUses ? String(editing.maxUses) : "")
  const [expiresAt, setExpiresAt] = useState(toLocalInput(editing?.expiresAt ?? null))
  const [active, setActive] = useState(editing?.active ?? true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    const amount = type === "percent" ? Number(value) : parseBRLToCents(value)
    if (amount === null || !Number.isFinite(amount) || amount <= 0) return setError("Informe o valor do desconto.")
    if (maxUses && (!/^\d+$/.test(maxUses) || Number(maxUses) < 1)) return setError("O limite de usos deve ser um número inteiro maior que zero.")

    const body = {
      code: code.trim().toUpperCase(), type, value: amount, active,
      maxUses: maxUses ? Number(maxUses) : null,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    }

    setBusy(true)
    setError(null)
    try {
      if (editing) await storeService.updateCoupon(editing.id, body)
      else await storeService.createCoupon(body)
      onClose(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar o cupom.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open onOpenChange={open => !open && !busy && onClose(false)}>
      <DialogContent className="max-h-[92dvh] max-w-lg gap-0 overflow-y-auto p-0 sm:p-0">
        <DialogHeader className="border-border border-b p-5 pr-14">
          <DialogTitle>{editing ? "Editar cupom" : "Novo cupom"}</DialogTitle>
          <DialogDescription>O desconto é aplicado no carrinho antes de gerar o Pix.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Input label="Código" value={code} maxLength={24} className="font-mono uppercase" onChange={e => setCode(e.target.value.toUpperCase())} placeholder="NATAL10" />
            </div>
            <Button type="button" variant="outline" onClick={() => setCode(randomCode())}>
              <Dices /> Gerar
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold">Tipo de desconto</p>
            <div role="radiogroup" aria-label="Tipo de desconto" className="grid grid-cols-2 gap-2">
              {TYPES.map(option => (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={type === option.value}
                  onClick={() => {
                    setType(option.value)
                    setValue("")
                  }}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition-all outline-none focus-visible:ring-primary/20 focus-visible:ring-4",
                    type === option.value ? "border-primary/50 bg-primary/[0.07]" : "border-border bg-white/[0.02] hover:border-white/20",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={type === "percent" ? "Desconto (%)" : "Desconto (R$)"}
              inputMode="decimal"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={type === "percent" ? "10" : "15,00"}
              hint={type === "percent" ? "De 1 a 100." : "Mínimo R$ 1,00."}
            />
            <Input label="Limite de usos" inputMode="numeric" value={maxUses} onChange={e => setMaxUses(e.target.value.replace(/\D/g, ""))} placeholder="Ilimitado" hint="Vazio = sem limite." />
          </div>

          <Input label="Validade (opcional)" type="datetime-local" value={expiresAt} onChange={e => setExpiresAt(e.target.value)} hint="Vazio = não expira." />

          <label className="border-border flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-white/[0.02] px-3.5 py-3">
            <span>
              <span className="block text-sm font-medium">Cupom ativo</span>
              <span className="text-muted-foreground block text-xs">Desative para pausar sem excluir.</span>
            </span>
            <Switch checked={active} onCheckedChange={setActive} />
          </label>
        </div>

        <DialogFooter className="border-border flex-col gap-3 border-t p-5 sm:flex-col">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onClose(false)} disabled={busy}>
              Cancelar
            </Button>
            <Button onClick={submit} disabled={busy}>
              {busy ? "Salvando..." : editing ? "Salvar alterações" : "Criar cupom"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
