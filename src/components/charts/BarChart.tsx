interface BarChartItem {
  label: string
  value: number
  hint?: string
}

const TONE_GRADIENT: Record<"primary" | "accent", string> = {
  primary: "linear-gradient(90deg, color-mix(in oklch, var(--primary) 55%, transparent), var(--primary))",
  accent: "linear-gradient(90deg, color-mix(in oklch, var(--accent) 55%, transparent), var(--accent))",
}

// Dependency-free horizontal bar chart (no charting library is installed
// in this project, and there's no network access here to add one) — plain
// flexbox + width percentages, styled to match the rest of the dashboard.
export function BarChart({ items, tone = "primary" }: { items: BarChartItem[]; tone?: "primary" | "accent" }) {
  const max = Math.max(1, ...items.map(item => item.value))

  return (
    <div className="flex flex-col gap-3.5">
      {items.map(item => (
        <div key={item.label} className="flex items-center gap-3">
          <span className="text-muted-foreground w-20 shrink-0 truncate sm:w-28 text-xs font-medium" title={item.label}>
            {item.label}
          </span>
          <div className="h-7 flex-1 overflow-hidden rounded-lg bg-white/[0.04]">
            <div
              className="animate-fade-up flex h-full items-center justify-end rounded-lg px-2.5 shadow-[inset_0_1px_0_0_oklch(1_0_0/25%)]"
              style={{ width: `${Math.max(6, (item.value / max) * 100)}%`, background: TONE_GRADIENT[tone] }}
            >
              <span className="text-[11px] font-bold whitespace-nowrap text-white drop-shadow-sm">{item.value}</span>
            </div>
          </div>
          {item.hint && <span className="text-muted-foreground w-10 shrink-0 text-right text-xs">{item.hint}</span>}
        </div>
      ))}
    </div>
  )
}
