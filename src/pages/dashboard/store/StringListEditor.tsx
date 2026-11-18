import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/form"
import { cn } from "@/lib/utils"

export function StringListEditor({
  items,
  onChange,
  max,
  maxLength,
  placeholder,
  addLabel,
  ariaLabel,
  mono,
}: {
  items: string[]
  onChange: (next: string[]) => void
  max: number
  maxLength: number
  placeholder: string
  addLabel: string
  ariaLabel: string
  mono?: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            <div className="min-w-0 flex-1">
              <Input
                value={item}
                maxLength={maxLength}
                className={cn(mono && "font-mono")}
                onChange={event => onChange(items.map((entry, i) => (i === index ? event.target.value : entry)))}
                placeholder={placeholder}
                aria-label={`${ariaLabel} ${index + 1}`}
              />
            </div>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={items.length === 1 && !item}
              onClick={() => onChange(items.length > 1 ? items.filter((_, i) => i !== index) : [""])}
              aria-label={`Remover ${ariaLabel.toLowerCase()} ${index + 1}`}
            >
              <Trash2 className="text-destructive" />
            </Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="sm" className="self-start" disabled={items.length >= max} onClick={() => onChange([...items, ""])}>
        <Plus /> {addLabel}
      </Button>
    </div>
  )
}
