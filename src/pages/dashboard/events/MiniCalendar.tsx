import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { startOfDayKey } from "@/lib/community"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["D", "S", "T", "Q", "Q", "S", "S"]
const MONTH = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" })

interface Props {
  month: Date
  counts: Map<string, number>
  selected: string | null
  onSelect: (key: string | null) => void
  onMonthChange: (month: Date) => void
}

/** Calendário mensal compacto: pontos nos dias com evento; clicar filtra a lista, clicar de novo limpa. */
export function MiniCalendar({ month, counts, selected, onSelect, onMonthChange }: Props) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const todayKey = startOfDayKey(new Date())
  const cells: Array<Date | null> = [
    ...Array.from({ length: first.getDay() }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(month.getFullYear(), month.getMonth(), index + 1)),
  ]
  const shift = (delta: number) => onMonthChange(new Date(month.getFullYear(), month.getMonth() + delta, 1))

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <strong className="text-sm font-semibold capitalize">{MONTH.format(month)}</strong>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" aria-label="Mês anterior" onClick={() => shift(-1)}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button size="sm" variant="ghost" aria-label="Próximo mês" onClick={() => shift(1)}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((label, index) => (
          <span key={index} className="text-muted-foreground/70 py-1 text-[10px] font-semibold">
            {label}
          </span>
        ))}

        {cells.map((date, index) => {
          if (!date) return <span key={`empty-${index}`} />
          const key = startOfDayKey(date)
          const count = counts.get(key) ?? 0
          const isSelected = selected === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(isSelected ? null : key)}
              aria-pressed={isSelected}
              aria-label={`${date.getDate()}${count ? `, ${count} evento${count > 1 ? "s" : ""}` : ""}`}
              className={cn(
                "relative grid aspect-square place-items-center rounded-lg text-xs font-medium transition-colors",
                isSelected ? "bg-primary text-primary-foreground" : "hover:bg-white/[0.06]",
                !isSelected && key === todayKey && "ring-primary/50 text-primary ring-1",
                !isSelected && count === 0 && key !== todayKey && "text-muted-foreground",
              )}
            >
              {date.getDate()}
              {count > 0 && <span className={cn("absolute bottom-1 size-1 rounded-full", isSelected ? "bg-primary-foreground" : "bg-primary")} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
