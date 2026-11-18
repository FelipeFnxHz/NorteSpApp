import type { TextareaHTMLAttributes } from "react"
import { cn } from "@/lib/utils"

interface AnswerTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "onChange"> {
  value: string
  onChange: (value: string) => void
  /** When set, shows a live character counter and enforces the limit. */
  maxLength?: number
  invalid?: boolean
}

export function AnswerTextarea({ value, onChange, maxLength, invalid, className, ...rest }: AnswerTextareaProps) {
  const nearLimit = maxLength !== undefined && value.length >= maxLength * 0.9

  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={event => onChange(event.target.value)}
        maxLength={maxLength}
        className={cn(
          "border-input placeholder:text-muted-foreground w-full resize-none rounded-xl border bg-white/[0.03] px-4 py-3 text-[13.5px] leading-relaxed outline-none",
          "transition-[border-color,box-shadow] duration-150",
          "focus:border-primary/50 focus:ring-primary/15 focus:ring-4",
          invalid && "border-destructive/50 focus:border-destructive/60 focus:ring-destructive/15",
          maxLength !== undefined && "pb-7",
          className,
        )}
        {...rest}
      />
      {maxLength !== undefined && (
        <span
          className={cn(
            "pointer-events-none absolute right-3.5 bottom-2 text-[10.5px] tabular-nums transition-colors",
            nearLimit ? "text-primary" : "text-muted-foreground/60",
          )}
        >
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  )
}
