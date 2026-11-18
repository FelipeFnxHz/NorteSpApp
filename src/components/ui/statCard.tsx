import type { ReactNode } from 'react'
import './statCard.css'

type Tone = 'primary' | 'accent' | 'blue' | 'red'

export function StatCard({
  icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: ReactNode
  tone: Tone
  label: string
  value: ReactNode
  hint?: string
}) {
  return (
    <div className="stat-card">
      <div className={`stat-card__icon stat-card__icon--${tone}`}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
        {hint && <small>{hint}</small>}
      </div>
    </div>
  )
}