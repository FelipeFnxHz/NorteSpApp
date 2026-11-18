import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, XCircle } from './icons'
import { Link } from './link'
import './primitives.css'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`ui-card ${className}`}>{children}</div>
}

export function PanelHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="ui-panel-header">
      <div>
        <h3>{title}</h3>
        {description && <p>{description}</p>}
      </div>
      {action}
    </div>
  )
}

type Tone = 'success' | 'warning' | 'danger' | 'info' | 'muted'

export function Badge({ tone = 'muted', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`ui-badge ui-badge--${tone}`}>{children}</span>
}

const ALERT_ICON: Record<Tone, typeof Info> = {
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
  info: Info,
  muted: Info,
}

export function Alert({ tone = 'info', title, children }: { tone?: Tone; title?: string; children: ReactNode }) {
  const Icon = ALERT_ICON[tone]
  return (
    <div className={`ui-alert ui-alert--${tone}`}>
      <Icon size={18} />
      <div>
        {title && <strong>{title}</strong>}
        <span>{children}</span>
      </div>
    </div>
  )
}

export function Skeleton({ width = '100%', height = 16 }: { width?: string | number; height?: string | number }) {
  return <div className="ui-skeleton" style={{ width, height }} />
}

export function LoadingState({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="ui-state">
      <span className="ui-spinner" aria-hidden />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="ui-state ui-state--error">
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="ui-state__retry" onClick={onRetry}>
          Tentar novamente
        </button>
      )}
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="ui-empty">
      {icon && <div className="ui-empty__icon">{icon}</div>}
      <strong>{title}</strong>
      {description && <span>{description}</span>}
    </div>
  )
}

export interface Crumb {
  label: string
  to?: string
}

export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav className="ui-breadcrumb" aria-label="breadcrumb">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="ui-breadcrumb__item">
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
          {index < items.length - 1 && <span className="ui-breadcrumb__sep">/</span>}
        </span>
      ))}
    </nav>
  )
}

export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  return (
    <div className="ui-pagination">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </button>
      <span>
        Página {page} de {totalPages}
      </span>
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Próxima
      </button>
    </div>
  )
}