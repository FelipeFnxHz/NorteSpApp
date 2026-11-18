import { Clock, UserRound } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { PUNISHMENT_FALLBACK, PUNISHMENT_META, formatDateTime } from "@/lib/community"
import { LOG_TONE } from "@/lib/logTypes"
import { cn } from "@/lib/utils"
import type { PunishmentItem } from "@/types"

function validity(item: PunishmentItem): string | null {
  if (item.type !== "ban") return null
  if (item.permanent) return "Permanente"
  if (!item.expiresAt) return null
  return `${item.active ? "Expira em" : "Expirou em"} ${formatDateTime(item.expiresAt)}`
}

/** Linha do tempo de punições: ícone por tipo, selo "Ativo", motivo, responsável e datas. */
export function PunishmentList({ items, showTarget = false }: { items: PunishmentItem[]; showTarget?: boolean }) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map(item => {
        const meta = PUNISHMENT_META[item.type] ?? PUNISHMENT_FALLBACK
        const tone = LOG_TONE[meta.tone]
        const until = validity(item)

        return (
          <li key={item.id}>
            <Card className={cn("flex-row items-start gap-4 p-4 sm:p-5", item.active && "border-destructive/30")}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset", tone.chip)}>
                <meta.icon className="size-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm font-semibold">{meta.label}</strong>
                  {item.active && <Badge variant="destructive">Ativo</Badge>}
                  {showTarget && <span className="text-muted-foreground truncate text-xs">• {item.targetName}</span>}
                </div>

                <p className="text-foreground/90 mt-1.5 text-sm leading-relaxed break-words whitespace-pre-line">{item.reason}</p>

                <div className="text-muted-foreground mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
                  <span className="flex items-center gap-1.5">
                    <UserRound className="size-3.5" />
                    {item.staffName}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3.5" />
                    {item.createdAt ? formatDateTime(item.createdAt) : "Data não registrada"}
                  </span>
                  {until && <span className={item.active ? "text-destructive font-medium" : undefined}>{until}</span>}
                </div>
              </div>
            </Card>
          </li>
        )
      })}
    </ol>
  )
}
