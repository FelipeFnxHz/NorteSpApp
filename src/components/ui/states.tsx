import type { ReactNode } from "react"
import { ChevronRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "@/components/ui/link"
import { Button } from "@/components/ui/button"

export function LoadingState({ label = "Carregando...", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 py-10 text-sm text-muted-foreground", className)}>
      <Loader2 className="size-4 animate-spin" />
      <span>{label}</span>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <span className="text-sm text-destructive">{message}</span>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar novamente
        </Button>
      )}
    </div>
  )
}

export function EmptyState({ icon, title, description }: { icon?: ReactNode; title: string; description?: string }) {
  return (
    <div className="border-border/80 flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-dashed px-6 py-14 text-center">
      {icon && (
        <div className="bg-primary/10 text-primary ring-primary/15 mb-3 grid size-12 place-items-center rounded-xl ring-1 ring-inset">
          {icon}
        </div>
      )}
      <strong className="font-display text-base font-semibold">{title}</strong>
      {description && <span className="text-muted-foreground max-w-sm text-sm">{description}</span>}
    </div>
  )
}

export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null

  return (
    <div className="mt-5 flex items-center justify-center gap-4 text-sm text-muted-foreground">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Anterior
      </Button>
      <span>
        Página {page} de {totalPages}
      </span>
      <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Próxima
      </Button>
    </div>
  )
}

export function Breadcrumb({ items }: { items: Array<{ label: string; to?: string }> }) {
  return (
    <nav aria-label="Você está em" className="text-muted-foreground mb-4 flex items-center gap-1.5 text-xs">
      {items.map((item, index) => (
        <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
          {item.to && index < items.length - 1 ? (
            <Link to={item.to} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className={index === items.length - 1 ? "text-foreground font-medium" : ""}>{item.label}</span>
          )}
          {index < items.length - 1 && <ChevronRight className="size-3 opacity-60" />}
        </span>
      ))}
    </nav>
  )
}
