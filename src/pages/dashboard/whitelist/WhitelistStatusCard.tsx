import type { ReactNode } from "react"
import { CalendarCheck, CalendarClock, Clock3, ShieldCheck, UserCheck, Hourglass } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { AnswerList } from "@/components/ui/answer-list"
import type { WhitelistAnswer } from "@/types"

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
}

function waitingTime(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 60) return `${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours} h`
  return `${Math.round(hours / 24)} d`
}

/**
 * One labelled fact. Icon chip, small caps label, value — each on its own line
 * with real spacing, and `min-w-0` + `truncate` so a long staff name can never
 * collide with the next tile (the old inline row glued icon, label and value
 * into a single text run).
 */
function MetaTile({
  icon,
  label,
  value,
  hint,
  tone = "neutral",
}: {
  icon: ReactNode
  label: string
  value: string
  hint?: string
  tone?: "neutral" | "accent" | "primary"
}) {
  return (
    <div className="flex min-w-0 items-center gap-3.5 px-5 py-4">
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset",
          tone === "accent" && "bg-accent/12 text-accent ring-accent/20",
          tone === "primary" && "bg-primary/12 text-primary ring-primary/20",
          tone === "neutral" && "text-muted-foreground bg-white/[0.05] ring-white/10",
        )}
      >
        {icon}
      </span>
      <div className="flex min-w-0 flex-col gap-0.5">
        <dt className="text-muted-foreground text-[10.5px] font-semibold tracking-[0.12em] uppercase">{label}</dt>
        <dd className="truncate text-sm leading-tight font-semibold">{value}</dd>
        {hint && <dd className="text-muted-foreground truncate text-xs">{hint}</dd>}
      </div>
    </div>
  )
}

export function WhitelistStatusCard({
  status,
  answers,
  submittedAt,
  reviewedByName,
  reviewedAt,
}: {
  status: "pending" | "approved"
  answers: WhitelistAnswer[]
  submittedAt: string
  reviewedByName: string | null
  reviewedAt: string | null
}) {
  const isApproved = status === "approved"

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      <Card className="gap-0 overflow-hidden py-0">
        <div
          className={cn(
            "relative overflow-hidden bg-gradient-to-br to-transparent px-4 sm:px-6 py-9 text-center",
            isApproved ? "from-accent/20 via-accent/5" : "from-primary/20 via-primary/5",
          )}
        >
          <div className="bg-grid absolute inset-0 opacity-30" />
          <span
            className={cn(
              "relative mx-auto grid size-14 place-items-center rounded-2xl ring-1 ring-inset",
              isApproved ? "bg-accent/15 text-accent ring-accent/20" : "bg-primary/15 text-primary ring-primary/20",
            )}
          >
            {isApproved ? <ShieldCheck className="size-7" /> : <Hourglass className="size-7 animate-pulse" />}
          </span>
          <h2 className="relative mt-4 text-2xl font-bold">{isApproved ? "Whitelist aprovada!" : "Candidatura em análise"}</h2>
          <p className="text-muted-foreground relative mx-auto mt-2 max-w-sm text-sm leading-relaxed">
            {isApproved ? "Sua entrada na cidade já foi liberada. Bom jogo!" : "A staff vai revisar suas respostas em breve — você recebe um aviso por DM assim que sair o resultado."}
          </p>
          <Badge variant={isApproved ? "success" : "secondary"} className="relative mt-5">
            {isApproved ? "Aprovada" : "Pendente"}
          </Badge>
        </div>

        <dl
          className={cn(
            "border-border grid divide-y border-t sm:divide-x sm:divide-y-0",
            isApproved ? "sm:grid-cols-3" : "sm:grid-cols-2",
            "divide-border",
          )}
        >
          <MetaTile
            icon={<CalendarClock className="size-[18px]" />}
            label="Enviada em"
            value={formatDate(submittedAt)}
            hint={`às ${formatTime(submittedAt)}`}
          />
          {isApproved ? (
            <>
              <MetaTile
                icon={<UserCheck className="size-[18px]" />}
                label="Aprovada por"
                value={reviewedByName ?? "Staff"}
                tone="accent"
              />
              <MetaTile
                icon={<CalendarCheck className="size-[18px]" />}
                label="Decisão em"
                value={reviewedAt ? formatDate(reviewedAt) : "—"}
                hint={reviewedAt ? `às ${formatTime(reviewedAt)}` : undefined}
              />
            </>
          ) : (
            <MetaTile
              icon={<Clock3 className="size-[18px]" />}
              label="Aguardando há"
              value={waitingTime(submittedAt)}
              tone="primary"
            />
          )}
        </dl>
      </Card>

      <Card className="gap-5 px-4 sm:px-6">
        <div>
          <h3 className="text-base font-semibold">Suas respostas</h3>
          <p className="text-muted-foreground text-xs">{answers.length} respostas enviadas na candidatura</p>
        </div>

        <AnswerList answers={answers} className="max-h-[min(34rem,60dvh)]" />
      </Card>
    </div>
  )
}
