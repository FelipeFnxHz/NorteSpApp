import { useEffect, useState } from "react"
import { Check, ChevronDown, ChevronUp, GripVertical, Loader2, Pencil, Plus, Shield, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input, Select } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { PermissionToggle } from "@/components/patentes/PermissionToggle"
import { useApi } from "@/hooks/useApi"
import { dashboardService } from "@/services/dashboard.service"
import { corporationsService } from "@/services/corporations.service"
import { ApiError } from "@/api/client"
import { cn } from "@/lib/utils"
import type { Corporation, CorpPermission, Patente } from "@/types"

interface ManagePatentesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  corporation: Corporation
  onChanged: () => void
}

const CORP_PERMISSION_OPTIONS: Array<{ value: CorpPermission; label: string }> = [
  { value: "hire", label: "Contratar" },
  { value: "manage_members", label: "Gerenciar membros" },
  { value: "fire", label: "Demitir" },
  { value: "manage_patentes", label: "Gerenciar patentes" },
  { value: "edit_corp", label: "Editar corporação" },
  { value: "view_history", label: "Ver histórico" },
  { value: "view_vault", label: "Ver cofre e financeiro" },
  { value: "manage_vault", label: "Movimentar o cofre" },
]

export function ManagePatentesDialog({ open, onOpenChange, corporation, onChanged }: ManagePatentesDialogProps) {
  const { data: rolesData } = useApi(() => dashboardService.roles(), [open])
  const [roleId, setRoleId] = useState("")
  const [name, setName] = useState("")
  const [permissions, setPermissions] = useState<CorpPermission[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [removing, setRemoving] = useState<Patente | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const rankedPatentes = corporation.patentes.slice().sort((a, b) => b.order - a.order)
  const [pendingOrder, setPendingOrder] = useState<string[] | null>(null)
  const [savingOrder, setSavingOrder] = useState(false)
  const [orderSaved, setOrderSaved] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)

  useEffect(() => {
    setPendingOrder(null)
  }, [corporation.patentes])

  const sortedPatentes =
    pendingOrder && pendingOrder.length === rankedPatentes.length
      ? pendingOrder.map(id => rankedPatentes.find(p => p._id === id)).filter((p): p is Patente => !!p)
      : rankedPatentes

  async function persistOrder(ids: string[]) {
    setError(null)
    setOrderSaved(false)
    setPendingOrder(ids)
    setSavingOrder(true)
    try {
      await corporationsService.reorderPatentes(corporation.slug, ids)
      setOrderSaved(true)
      onChanged()
    } catch (err) {
      setPendingOrder(null)
      setError(err instanceof ApiError ? err.message : "Não foi possível salvar a nova ordem.")
    } finally {
      setSavingOrder(false)
    }
  }

  function moveBy(index: number, direction: -1 | 1) {
    const target = index + direction
    if (savingOrder || target < 0 || target >= sortedPatentes.length) return
    const ids = sortedPatentes.map(p => p._id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    void persistOrder(ids)
  }

  function dropOn(targetId: string) {
    const sourceId = dragId
    setDragId(null)
    setOverId(null)
    if (!sourceId || sourceId === targetId || savingOrder) return
    const ids = sortedPatentes.map(p => p._id)
    const from = ids.indexOf(sourceId)
    const to = ids.indexOf(targetId)
    if (from < 0 || to < 0) return
    ids.splice(to, 0, ids.splice(from, 1)[0])
    void persistOrder(ids)
  }
  const usedRoleIds = new Set(
    corporation.patentes.filter(p => p._id !== editingId).map(p => p.roleId).filter(Boolean),
  )
  const availableRoles = (rolesData?.roles ?? []).filter(role => !usedRoleIds.has(role.id))

  function togglePermission(permission: CorpPermission) {
    setPermissions(current =>
      current.includes(permission) ? current.filter(p => p !== permission) : [...current, permission],
    )
  }

  function resetForm() {
    setEditingId(null)
    setRoleId("")
    setName("")
    setPermissions([])
    setError(null)
  }

  function startEdit(patente: Patente) {
    setError(null)
    setEditingId(patente._id)
    setRoleId(patente.roleId ?? "")
    setName(patente.name)
    setPermissions(patente.permissions ?? [])
  }

  async function handleSubmit() {
    setError(null)

    if (!name.trim()) {
      setError("Informe o nome da patente.")
      return
    }

    setBusy(true)
    try {
      if (editingId) {
        await corporationsService.updatePatente(corporation.slug, editingId, {
          name: name.trim(),
          roleId,
          permissions,
        })
      } else {
        await corporationsService.addPatente(corporation.slug, {
          roleId: roleId || undefined,
          name: name.trim(),
          permissions,
        })
      }
      resetForm()
      onChanged()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao salvar patente.")
    } finally {
      setBusy(false)
    }
  }

  async function confirmRemove() {
    if (!removing) return
    await corporationsService.removePatente(corporation.slug, removing._id)
    if (editingId === removing._id) resetForm()
    setRemoving(null)
    onChanged()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) resetForm()
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <div className="flex min-w-0 items-center gap-3 pr-6">
            <span className="bg-primary/10 text-primary ring-primary/15 grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset">
              <Shield className="size-[18px]" />
            </span>
            <div className="min-w-0">
              <DialogTitle className="truncate">Patentes de {corporation.name}</DialogTitle>
              <DialogDescription>A mesma hierarquia usada no Bot e na contratação.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="flex min-w-0 flex-col gap-2">
            {sortedPatentes.length > 1 && (
              <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-1 text-[11px]">
                <span>Arraste ou use as setas · do maior ao menor posto</span>
                <span className="flex items-center gap-1" aria-live="polite">
                  {savingOrder ? (
                    <>
                      <Loader2 className="size-3 animate-spin" /> Salvando...
                    </>
                  ) : orderSaved ? (
                    <>
                      <Check className="size-3 text-emerald-400" /> Ordem salva
                    </>
                  ) : null}
                </span>
              </div>
            )}
            {sortedPatentes.length === 0 && (
              <p className="text-muted-foreground border-border rounded-lg border border-dashed p-4 text-center text-sm">
                Nenhuma patente cadastrada ainda.
              </p>
            )}
            {sortedPatentes.map((patente, index) => (
              <div
                key={patente._id}
                draggable={!savingOrder && sortedPatentes.length > 1}
                onDragStart={event => {
                  setDragId(patente._id)
                  event.dataTransfer.effectAllowed = "move"
                }}
                onDragOver={event => {
                  if (!dragId) return
                  event.preventDefault()
                  if (overId !== patente._id) setOverId(patente._id)
                }}
                onDrop={event => {
                  event.preventDefault()
                  dropOn(patente._id)
                }}
                onDragEnd={() => {
                  setDragId(null)
                  setOverId(null)
                }}
                className={cn(
                  "flex flex-col gap-2 rounded-xl border px-3.5 py-3 transition-all",
                  editingId === patente._id ? "border-primary/50 bg-primary/[0.04]" : "border-border bg-white/[0.02]",
                  dragId === patente._id && "opacity-40",
                  overId === patente._id && dragId !== patente._id && "border-primary ring-primary/30 ring-2",
                )}
              >
                <div className="flex items-center gap-2.5">
                  {sortedPatentes.length > 1 && (
                    <GripVertical className="text-muted-foreground/60 size-4 shrink-0 cursor-grab active:cursor-grabbing" aria-hidden />
                  )}
                  <span className="bg-white/[0.06] text-muted-foreground grid size-6 shrink-0 place-items-center rounded-md text-[11px] font-bold">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{patente.name}</span>
                  {sortedPatentes.length > 1 && (
                    <>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={savingOrder || index === 0}
                        onClick={() => moveBy(index, -1)}
                        aria-label={`Subir ${patente.name}`}
                      >
                        <ChevronUp className="size-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        disabled={savingOrder || index === sortedPatentes.length - 1}
                        onClick={() => moveBy(index, 1)}
                        aria-label={`Descer ${patente.name}`}
                      >
                        <ChevronDown className="size-3.5" />
                      </Button>
                    </>
                  )}
                  <Button size="icon-sm" variant="ghost" disabled={busy} onClick={() => startEdit(patente)} aria-label="Editar patente">
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button size="icon-sm" variant="ghost" disabled={busy} onClick={() => setRemoving(patente)} aria-label="Remover patente">
                    <Trash2 className="text-destructive size-3.5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 pl-[34px]">
                  {!patente.roleId && (
                    <Badge variant="outline" className="text-[11px] font-normal">
                      sem cargo vinculado
                    </Badge>
                  )}
                  {patente.permissions?.map(permission => (
                    <Badge key={permission} variant="outline" className="text-[11px] font-normal">
                      {CORP_PERMISSION_OPTIONS.find(option => option.value === permission)?.label ?? permission}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="border-border flex min-w-0 flex-col gap-3.5 border-t pt-5 md:border-t-0 md:border-l md:pt-0 md:pl-6">
            <p className="flex items-center gap-1.5 text-sm font-bold">
              {editingId ? <Pencil className="size-3.5" /> : <Plus className="size-3.5" />}
              {editingId ? "Editando patente" : "Nova patente"}
            </p>
            <Input
              label="Nome da patente"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Soldado, Cabo, Sargento..."
            />
            <Select
              label="Cargo do Discord (opcional)"
              icon={<Shield className="size-4" />}
              value={roleId}
              onChange={e => setRoleId(e.target.value)}
              placeholder="Sem cargo vinculado"
              hint="Deixe em branco para uma patente que existe só como rótulo/permissão."
              options={availableRoles.map(role => ({ value: role.id, label: role.name }))}
            />
            <div className="flex flex-col gap-2">
              <span className="text-muted-foreground text-xs font-semibold">Permissões no Dashboard</span>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-1.5">
                {CORP_PERMISSION_OPTIONS.map(option => (
                  <PermissionToggle
                    key={option.value}
                    label={option.label}
                    checked={permissions.includes(option.value)}
                    onToggle={() => togglePermission(option.value)}
                  />
                ))}
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSubmit} disabled={busy}>
                {busy ? "Salvando..." : editingId ? "Salvar alterações" : "Adicionar patente"}
              </Button>
              {editingId && (
                <Button variant="outline" onClick={resetForm} disabled={busy}>
                  Cancelar edição
                </Button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={next => !next && setRemoving(null)}
        variant="destructive"
        title={`Remover a patente ${removing?.name ?? ""}?`}
        description="Quem tem essa patente fica sem patente até ser reatribuído, e as permissões dela deixam de valer. Essa ação não pode ser desfeita."
        confirmLabel="Remover patente"
        loadingLabel="Removendo..."
        onConfirm={confirmRemove}
      />
    </Dialog>
  )
}
