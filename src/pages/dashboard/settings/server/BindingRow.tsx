import { CheckCircle2, CircleDashed, TriangleAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SelectMenu } from "@/components/ui/select"
import type { BindingStatus } from "@/types"

export interface BindingOption {
  value: string
  label: string
  group?: string | null
}

const STATUS_BADGE: Record<BindingStatus, { label: string; variant: "success" | "secondary" | "destructive"; icon: typeof CheckCircle2 }> = {
  ok: { label: "Configurado", variant: "success", icon: CheckCircle2 },
  unset: { label: "Não definido", variant: "secondary", icon: CircleDashed },
  missing: { label: "Removido do Discord", variant: "destructive", icon: TriangleAlert },
}

export function StatusBadge({ status }: { status: BindingStatus }) {
  const meta = STATUS_BADGE[status]
  return (
    <Badge variant={meta.variant}>
      <meta.icon />
      {meta.label}
    </Badge>
  )
}

interface BindingRowProps {
  label: string
  leading?: React.ReactNode
  hint?: string
  status: BindingStatus
  value: string | null
  readOnlyText: string
  options: BindingOption[] | null
  saving: boolean
  placeholder: string
  onChange: (value: string | null) => void
}

export function BindingRow({ label, leading, hint, status, value, readOnlyText, options, saving, placeholder, onChange }: BindingRowProps) {
  const knownValue = value !== null && (options ?? []).some(option => option.value === value)

  return (
    <div className="border-border/60 flex flex-col gap-3 border-b py-4 last:border-0 last:pb-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-center gap-3">
        {leading}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{label}</p>
          {hint && <p className="text-muted-foreground truncate text-xs">{hint}</p>}
        </div>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-2.5 sm:justify-end">
        <StatusBadge status={status} />

        {options ? (
          <div className="w-full sm:w-64" aria-busy={saving}>
            <SelectMenu
              aria-label={label}
              value={value ?? ""}
              disabled={saving}
              placeholder={placeholder}
              onValueChange={next => onChange(next || null)}
              options={[...(value && !knownValue ? [{ value, label: "(indisponível)" }] : []), ...(options ?? [])]}
              triggerClassName="h-10"
            />
          </div>
        ) : (
          <span className="text-muted-foreground max-w-56 truncate text-xs">{readOnlyText}</span>
        )}
      </div>
    </div>
  )
}
