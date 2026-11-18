import { Check, Loader2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { StoreOrder } from "@/types"

type StepState = "done" | "active" | "todo" | "error"

function buildSteps(order: StoreOrder): { label: string; state: StepState }[] {
  const { status, delivery } = order
  const paid = status === "paid"
  const hasCommands = delivery.total > 0
  const finished = paid && delivery.status === "delivered"
  const failed = paid && delivery.status === "failed"
  const running = paid && (delivery.status === "queued" || failed) && delivery.done > 0

  const at = (done: boolean, active: boolean, error = false): StepState => (done ? "done" : error ? "error" : active ? "active" : "todo")

  const steps = [
    { label: "Pagamento aprovado", state: at(paid, false) },
    { label: "Entrega na fila", state: at(finished || running, paid && delivery.status === "queued" && delivery.done === 0, failed && delivery.done === 0) },
    ...(hasCommands || !paid
      ? [{ label: "Executando no servidor", state: at(finished, paid && delivery.status === "queued" && delivery.done > 0, failed && delivery.done > 0) }]
      : []),
    { label: "Entregue", state: at(finished, false) },
  ]
  return steps
}

export function DeliveryTimeline({ order }: { order: StoreOrder }) {
  const steps = buildSteps(order)
  const { delivery } = order
  const showBar = order.status === "paid" && delivery.total > 0 && delivery.status !== "delivered"
  const percent = delivery.total ? Math.round((delivery.done / delivery.total) * 100) : 0

  return (
    <section aria-label="Progresso da entrega" className="flex flex-col gap-3">
      <h3 className="text-sm font-bold">Acompanhamento da entrega</h3>
      <ol className="flex flex-col">
        {steps.map((step, index) => (
          <li key={step.label} className="relative flex items-start gap-3 pb-4 last:pb-0">
            {index < steps.length - 1 && <span className={cn("absolute top-6 left-[11px] h-[calc(100%-1.5rem)] w-px", step.state === "done" ? "bg-accent/50" : "bg-white/10")} />}
            <span
              className={cn(
                "relative grid size-6 shrink-0 place-items-center rounded-full border text-[10px] transition-colors",
                step.state === "done" && "border-accent/60 bg-accent/15 text-accent",
                step.state === "active" && "border-primary/60 bg-primary/15 text-primary",
                step.state === "error" && "border-destructive/60 bg-destructive/15 text-destructive",
                step.state === "todo" && "border-white/15 text-white/30",
              )}
            >
              {step.state === "done" ? <Check className="size-3.5" strokeWidth={3} /> : step.state === "active" ? <Loader2 className="size-3.5 animate-spin" /> : step.state === "error" ? <X className="size-3.5" strokeWidth={3} /> : index + 1}
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className={cn("text-[13px] leading-tight font-medium", step.state === "todo" ? "text-muted-foreground" : "text-foreground")}>{step.label}</p>
              {step.state === "error" && <p className="text-destructive mt-0.5 text-xs">Falha na entrega. Informe o código do pedido à staff.</p>}
            </div>
          </li>
        ))}
      </ol>

      {showBar && (
        <div className="flex flex-col gap-1.5">
          <div role="progressbar" aria-valuemin={0} aria-valuemax={delivery.total} aria-valuenow={delivery.done} className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="bg-primary h-full rounded-full transition-[width] duration-500" style={{ width: `${percent}%` }} />
          </div>
          <p className="text-muted-foreground text-xs tabular-nums">
            {delivery.done} de {delivery.total} comando(s) executado(s)
          </p>
        </div>
      )}
    </section>
  )
}
