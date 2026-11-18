import { ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  index: number
  count: number
  label: string
  disabled?: boolean
  onMove: (delta: -1 | 1) => void
}

export function ReorderButtons({ index, count, label, disabled, onMove }: Props) {
  return (
    <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row">
      <Button size="icon-sm" variant="ghost" disabled={disabled || index === 0} onClick={() => onMove(-1)} aria-label={`Mover ${label} para cima`}>
        <ChevronUp />
      </Button>
      <Button size="icon-sm" variant="ghost" disabled={disabled || index === count - 1} onClick={() => onMove(1)} aria-label={`Mover ${label} para baixo`}>
        <ChevronDown />
      </Button>
    </div>
  )
}
