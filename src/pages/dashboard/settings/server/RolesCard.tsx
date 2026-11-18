import { ShieldCheck } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import type { ServerRoleItem, ServerSettings } from "@/types"
import { BindingRow, type BindingOption } from "./BindingRow"

interface RolesCardProps {
  roles: ServerRoleItem[]
  options: ServerSettings["options"]
  savingKey: string | null
  onChange: (role: ServerRoleItem, roleId: string | null) => void
}

/** Cargos que liberam o acesso (Admin e Staff) e a ordem da hierarquia. Alterar exige confirmação (ver ServerTab). */
export function RolesCard({ roles, options, savingKey, onChange }: RolesCardProps) {
  const selectable: BindingOption[] | null = options
    ? options.roles.map(role => ({ value: role.id, label: `@${role.name}` }))
    : null

  return (
    <Card className="px-4 sm:px-6">
      <h3 className="mb-1 flex items-center gap-2 font-semibold">
        <ShieldCheck className="size-4" />
        Cargos autorizados
      </h3>
      <p className="text-muted-foreground mb-5 text-xs leading-relaxed">
        Quem tem estes cargos acessa a Dashboard como <strong className="text-foreground font-semibold">Admin</strong> (primeiros cinco) ou{" "}
        <strong className="text-foreground font-semibold">Staff</strong>. A ordem é a hierarquia, do mais alto ao mais baixo.
      </p>

      <div className="flex flex-col">
        {roles.map((role, index) => (
          <BindingRow
            key={role.key}
            label={role.label}
            hint={role.status === "ok" ? `${role.members.toLocaleString("pt-BR")} ${role.members === 1 ? "membro" : "membros"} em cache` : undefined}
            leading={
              <span className="relative grid size-8 shrink-0 place-items-center rounded-lg bg-white/[0.05] text-[11px] font-bold">
                <span className="text-muted-foreground">{index + 1}</span>
                {role.color && <span className="border-card absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2" style={{ backgroundColor: role.color }} />}
              </span>
            }
            status={role.status}
            value={role.roleId}
            readOnlyText={role.name ? `@${role.name}` : "—"}
            options={selectable}
            saving={savingKey === role.key}
            placeholder="— Nenhum —"
            onChange={roleId => onChange(role, roleId)}
          />
        ))}
      </div>

      <p className="text-muted-foreground mt-4 flex items-center gap-2 text-xs">
        <Badge variant="outline" className="h-5 px-1.5 text-[10px]">Admin</Badge> posições 1–5
        <Badge variant="outline" className="ml-2 h-5 px-1.5 text-[10px]">Staff</Badge> demais
      </p>
    </Card>
  )
}
