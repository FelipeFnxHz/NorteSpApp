// Tiny inline SVG trend line — no charting library needed for a hint of shape.
export function Sparkline({ values, tone = "primary" }: { values: number[]; tone?: "primary" | "accent" }) {
  if (values.length < 2) return null

  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const range = max - min || 1
  const step = 100 / (values.length - 1)

  const points = values.map((value, index) => `${index * step},${28 - ((value - min) / range) * 26}`).join(" ")
  const stroke = tone === "primary" ? "var(--primary)" : "var(--accent)"

  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="h-7 w-full">
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
