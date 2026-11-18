import type { ReactNode } from "react"
import { Select as SelectPrimitive } from "radix-ui"
import { Check, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectMenuOption {
  value: string
  label: string
  icon?: ReactNode
  group?: string | null
}

const EMPTY = "__empty__"

interface SelectMenuProps {
  value: string
  onValueChange: (value: string) => void
  options: SelectMenuOption[]
  placeholder?: string
  disabled?: boolean
  className?: string
  triggerClassName?: string
  "aria-label"?: string
}

export function SelectMenu({ value, onValueChange, options, placeholder, disabled, className, triggerClassName, ...aria }: SelectMenuProps) {
  const groups = new Map<string, SelectMenuOption[]>()
  for (const option of options) {
    const key = option.group ?? ""
    groups.set(key, [...(groups.get(key) ?? []), option])
  }

  return (
    <SelectPrimitive.Root value={value === "" ? EMPTY : value} onValueChange={next => onValueChange(next === EMPTY ? "" : next)} disabled={disabled}>
      <SelectPrimitive.Trigger
        aria-label={aria["aria-label"]}
        className={cn(
          "text-foreground flex h-8 w-full min-w-0 items-center justify-between gap-2 rounded-md border border-input bg-foreground/[0.04] px-3 text-xs outline-none transition",
          "hover:border-white/20 focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-3 data-[state=open]:border-ring",
          "disabled:cursor-not-allowed disabled:opacity-50 data-[placeholder]:text-muted-foreground",
          triggerClassName,
          className,
        )}
      >
        <span className="truncate">
          <SelectPrimitive.Value placeholder={placeholder} />
        </span>
        <SelectPrimitive.Icon>
          <ChevronDown className="text-muted-foreground size-3.5 shrink-0" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          collisionPadding={12}
          className={cn(
            "z-[100] max-h-[min(22rem,var(--radix-select-content-available-height))] min-w-[max(8rem,var(--radix-select-trigger-width))] overflow-hidden",
            "rounded-xl border border-white/10 bg-[#13151b] text-[#e8eaf2] shadow-2xl shadow-black/50 ring-1 ring-black/40 [color-scheme:dark]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
          )}
        >
          <SelectPrimitive.Viewport className="max-h-[inherit] overflow-y-auto p-1">
            {placeholder && <Item value={EMPTY} label={placeholder} muted />}
            {[...groups.entries()].map(([group, items]) => (
              <SelectPrimitive.Group key={group || "_"}>
                {group && <SelectPrimitive.Label className="text-muted-foreground px-2.5 pt-2 pb-1 text-[10.5px] font-semibold tracking-wider uppercase">{group}</SelectPrimitive.Label>}
                {items.map(option => (
                  <Item key={option.value} value={option.value === "" ? EMPTY : option.value} label={option.label} icon={option.icon} />
                ))}
              </SelectPrimitive.Group>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

function Item({ value, label, icon, muted }: { value: string; label: string; icon?: ReactNode; muted?: boolean }) {
  return (
    <SelectPrimitive.Item
      value={value}
      className={cn(
        "relative flex cursor-pointer items-center gap-2 rounded-lg py-1.5 pr-8 pl-2.5 text-xs outline-none select-none",
        "data-[highlighted]:bg-white/[0.08] data-[highlighted]:text-white data-[state=checked]:text-primary",
        muted && "text-muted-foreground",
      )}
    >
      <SelectPrimitive.ItemText>
        {icon ? <span className="flex min-w-0 items-center gap-2">{icon}<span className="truncate">{label}</span></span> : label}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="absolute right-2.5">
        <Check className="size-3.5" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}
