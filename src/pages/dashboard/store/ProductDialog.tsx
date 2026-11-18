import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input, Select } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ApiError } from "@/api/client"
import { centsToInput, parseBRLToCents } from "@/lib/money"
import { cn } from "@/lib/utils"
import { DELIVERY_PLACEHOLDERS } from "@/lib/store-meta"
import { storeService, type ProductBody } from "@/services/store.service"
import type { StoreCategory, StoreProduct } from "@/types"
import { ImageUploader } from "./ImageUploader"
import { StringListEditor } from "./StringListEditor"

const DESCRIPTION_MAX = 2800
const MAX_COMMANDS = 10
const MAX_CONTENTS = 12

export function ProductDialog({
  open,
  editing,
  categories,
  roles,
  onClose,
}: {
  open: boolean
  editing: StoreProduct | null
  categories: StoreCategory[]
  roles: { id: string; name: string }[]
  onClose: (saved: boolean) => void
}) {
  const [name, setName] = useState(editing?.name ?? "")
  const [description, setDescription] = useState(editing?.description ?? "")
  const [price, setPrice] = useState(editing ? centsToInput(editing.priceCents) : "")
  const [image, setImage] = useState(editing?.image ?? "")
  const [categoryId, setCategoryId] = useState(editing?.categoryId ?? categories[0]?.id ?? "")
  const [roleId, setRoleId] = useState(editing?.rewardRoleId ?? "")
  const [active, setActive] = useState(editing?.active ?? true)
  /** Vazio = ilimitado. */
  const [stock, setStock] = useState(editing?.stock != null ? String(editing.stock) : "")
  const [contents, setContents] = useState<string[]>(editing?.contents?.length ? editing.contents : [""])
  const [commands, setCommands] = useState<string[]>(editing?.deliveryCommands?.length ? editing.deliveryCommands : [""])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    const priceCents = parseBRLToCents(price)
    if (!name.trim()) return setError("Informe o nome do produto.")
    if (description.length > DESCRIPTION_MAX) return setError(`A descrição pode ter no máximo ${DESCRIPTION_MAX} caracteres.`)
    if (priceCents === null || priceCents < 100) return setError("Informe um preço válido (mínimo R$ 1,00). Ex.: 29,90")
    if (!categoryId) return setError("Crie uma categoria antes de cadastrar produtos.")
    const stockValue = stock.trim() === "" ? null : Number(stock)
    if (stockValue !== null && (!Number.isInteger(stockValue) || stockValue < 0)) return setError("Estoque inválido: use um número inteiro (0 ou mais) ou deixe vazio para ilimitado.")

    const body: ProductBody = {
      name, description, priceCents, image, categoryId, active,
      contents: contents.map(item => item.trim()).filter(Boolean),
      deliveryCommands: commands.map(command => command.trim()).filter(Boolean),
      rewardRoleId: roleId,
      stock: stockValue,
    }

    setBusy(true)
    setError(null)
    try {
      if (editing) await storeService.updateProduct(editing.id, body)
      else await storeService.createProduct(body)
      onClose(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar o produto.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => !next && !busy && onClose(false)}>
      <DialogContent className="max-h-[92dvh] max-w-2xl gap-0 overflow-y-auto p-0 sm:p-0">
        <DialogHeader className="border-border border-b p-5 pr-14">
          <DialogTitle>{editing ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>Defina o que o jogador vê e o que é entregue ao aprovar o pagamento.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input label="Nome" value={name} maxLength={80} onChange={e => setName(e.target.value)} placeholder="Ex: VIP Ouro (30 dias)" />
          </div>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className="flex items-center justify-between gap-3 text-xs font-semibold">
              Descrição
              <span
                aria-live="polite"
                className={cn("font-mono text-[11px] tabular-nums", description.length >= DESCRIPTION_MAX ? "text-destructive" : description.length >= DESCRIPTION_MAX * 0.9 ? "text-primary" : "text-muted-foreground")}
              >
                {description.length}/{DESCRIPTION_MAX}
              </span>
            </span>
            <Textarea value={description} maxLength={DESCRIPTION_MAX} rows={5} onChange={e => setDescription(e.target.value.slice(0, DESCRIPTION_MAX))} placeholder="O que o jogador recebe, benefícios, duração..." />
          </label>

          <Input label="Preço (R$)" inputMode="decimal" value={price} onChange={e => setPrice(e.target.value)} placeholder="29,90" />
          <Input label="Estoque" inputMode="numeric" value={stock} onChange={e => setStock(e.target.value.replace(/\D/g, ""))} placeholder="Vazio = ilimitado" hint="O bot e o site descontam sozinhos a cada pedido e devolvem se o Pix expirar." />
          <Select
            label="Categoria"
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            options={categories.map(category => ({ value: category.id, label: category.name }))}
            placeholder={categories.length ? undefined : "Nenhuma categoria"}
          />

          <div className="sm:col-span-2">
            <ImageUploader value={image} onChange={setImage} />
          </div>

          <fieldset className="border-border flex min-w-0 flex-col gap-2.5 rounded-xl border bg-white/[0.02] p-3.5 sm:col-span-2">
            <legend className="sr-only">O que inclui</legend>
            <div>
              <p className="text-xs font-semibold">O que inclui (visível ao comprador)</p>
              <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">Liste itens, benefícios e recompensas. Aparece na vitrine do pedido e no recibo.</p>
            </div>
            <StringListEditor items={contents} onChange={setContents} max={MAX_CONTENTS} maxLength={120} placeholder="Ex: 30 dias de VIP Ouro" addLabel="Adicionar item" ariaLabel="Item incluso" />
          </fieldset>

          <fieldset className="border-border flex flex-col gap-2.5 rounded-xl border bg-white/[0.02] p-3.5 sm:col-span-2">
            <legend className="sr-only">Comandos de entrega</legend>
            <div>
              <p className="text-xs font-semibold">Comandos de entrega no servidor</p>
              <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                Executados no console do FiveM ao aprovar o pagamento. Variáveis:{" "}
                {DELIVERY_PLACEHOLDERS.map(item => (
                  <code key={item} className="mr-1 rounded bg-white/[0.07] px-1 py-0.5 font-mono text-[10.5px]">{item}</code>
                ))}
                Sem <code className="rounded bg-white/[0.07] px-1 font-mono text-[10.5px]">{"{quantity}"}</code>, o comando roda uma vez por unidade.
              </p>
            </div>

            <StringListEditor items={commands} onChange={setCommands} max={MAX_COMMANDS} maxLength={200} mono placeholder="giveitem {citizenid} bread {quantity}" addLabel="Adicionar comando" ariaLabel="Comando" />
          </fieldset>

          <div className="sm:col-span-2">
            <Select
              label="Cargo do Discord (opcional)"
              value={roleId}
              onChange={e => setRoleId(e.target.value)}
              placeholder="Nenhum"
              options={roles.map(role => ({ value: role.id, label: role.name }))}
              hint="Concedido junto com a entrega. Precisa de ao menos um comando ou um cargo."
            />
          </div>

          <label className="border-border flex cursor-pointer items-center justify-between gap-3 rounded-lg border bg-white/[0.02] px-3.5 py-3 sm:col-span-2">
            <span>
              <span className="block text-sm font-medium">Visível na loja</span>
              <span className="text-muted-foreground block text-xs">Desative para esconder sem excluir.</span>
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
              {busy ? "Salvando..." : editing ? "Salvar alterações" : "Criar produto"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
