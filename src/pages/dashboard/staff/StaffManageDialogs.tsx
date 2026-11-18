import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { ApiError } from "@/api/client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { SelectMenu } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { staffManageService, type StaffCandidate, type StaffHierarchyRole, type StaffMember } from "@/services/staff.service"

interface RoleChoiceProps { roles: StaffHierarchyRole[]; assignable: string[] }

const toOptions = ({ roles, assignable }: RoleChoiceProps) => roles.filter(role => assignable.includes(role.key)).map(role => ({ value: role.key, label: role.name }))

function useSubmit(onDone: () => void) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function run(action: () => Promise<unknown>) {
    setSaving(true)
    setError(null)
    try { await action(); onDone() } catch (err) { setError(err instanceof ApiError ? err.message : "Não foi possível concluir a ação.") } finally { setSaving(false) }
  }
  return { saving, error, run, reset: () => setError(null) }
}

export function AddStaffDialog({ open, onOpenChange, roles, assignable, onDone }: RoleChoiceProps & { open: boolean; onOpenChange: (open: boolean) => void; onDone: () => void }) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<StaffCandidate[]>([])
  const [picked, setPicked] = useState<StaffCandidate | null>(null)
  const [roleKey, setRoleKey] = useState("")
  const { saving, error, run, reset } = useSubmit(() => { onDone(); onOpenChange(false) })

  useEffect(() => { if (open) { setQuery(""); setResults([]); setPicked(null); setRoleKey(""); reset() } }, [open])

  useEffect(() => {
    if (picked || query.trim().length < 2) return setResults([])
    const timer = setTimeout(() => { staffManageService.candidates(query.trim()).then(r => setResults(r.items), () => setResults([])) }, 300)
    return () => clearTimeout(timer)
  }, [query, picked])

  return (
    <Dialog open={open} onOpenChange={next => !saving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar à equipe</DialogTitle>
          <DialogDescription>O cargo é aplicado direto no Discord e o membro recebe uma notificação.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">Membro do servidor</span>
            {picked ? (
              <div className="border-input bg-input/30 flex items-center justify-between gap-3 rounded-xl border p-2">
                <div className="flex min-w-0 items-center gap-2.5"><img src={picked.avatar} alt="" className="size-8 rounded-full" /><div className="min-w-0"><p className="truncate text-sm font-medium">{picked.displayName}</p><p className="text-muted-foreground truncate text-[11px]">@{picked.username}</p></div></div>
                <Button variant="ghost" size="sm" onClick={() => { setPicked(null); setQuery("") }}>Trocar</Button>
              </div>
            ) : (
              <>
                <div className="relative"><Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" /><Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Digite o nome ou @usuário" className="pl-9" autoFocus /></div>
                {query.trim().length >= 2 && (
                  <div className="scroll-dark border-border/70 max-h-52 overflow-y-auto rounded-xl border bg-[#13151b] p-1">
                    {results.length === 0 && <p className="text-muted-foreground px-3 py-3 text-center text-xs">Nenhum membro sem cargo de staff encontrado.</p>}
                    {results.map(item => (
                      <button key={item.id} type="button" onClick={() => setPicked(item)} className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-white/[0.07]">
                        <img src={item.avatar} alt="" className="size-7 rounded-full" /><span className="truncate text-sm">{item.displayName}</span><span className="text-muted-foreground truncate text-[11px]">@{item.username}</span>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium">Cargo</span>
            <SelectMenu value={roleKey} onValueChange={setRoleKey} options={toOptions({ roles, assignable })} placeholder="Escolha o cargo" triggerClassName="h-10" aria-label="Cargo" />
            <span className="text-muted-foreground text-[11px]">Você só pode atribuir cargos abaixo do seu.</span>
          </div>
          {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>Cancelar</Button>
          <Button disabled={saving || !picked || !roleKey} onClick={() => run(() => staffManageService.add(picked!.id, roleKey))}>{saving ? "Adicionando..." : "Adicionar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ChangeRoleDialog({ member, onClose, roles, assignable, onDone }: RoleChoiceProps & { member: StaffMember | null; onClose: () => void; onDone: () => void }) {
  const [roleKey, setRoleKey] = useState("")
  const { saving, error, run, reset } = useSubmit(() => { onDone(); onClose() })
  useEffect(() => { if (member) { setRoleKey(assignable.includes(member.role.key) ? member.role.key : ""); reset() } }, [member]) // eslint-disable-line react-hooks/exhaustive-deps

  const rank = (key: string) => roles.find(role => role.key === key)?.rank ?? 0
  const promoting = roleKey && member && rank(roleKey) < member.role.rank

  return (
    <Dialog open={!!member} onOpenChange={next => !saving && !next && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar cargo de {member?.displayName}</DialogTitle>
          <DialogDescription>Cargo atual: <strong>{member?.role.name}</strong>. Os cargos de staff anteriores deste membro são substituídos pelo novo.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium">Novo cargo</span>
          <SelectMenu value={roleKey} onValueChange={setRoleKey} options={toOptions({ roles, assignable })} placeholder="Escolha o cargo" triggerClassName="h-10" aria-label="Novo cargo" />
          {roleKey && member && roleKey !== member.role.key && <span className={cn("text-[11px] font-medium", promoting ? "text-[#34d399]" : "text-[#f5b94a]")}>{promoting ? "Promoção" : "Rebaixamento"}</span>}
        </div>
        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button disabled={saving || !roleKey || roleKey === member?.role.key} onClick={() => run(() => staffManageService.changeRole(member!.id, roleKey))}>{saving ? "Salvando..." : "Aplicar cargo"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
