import { Download, LoaderCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppUpdater } from "@/hooks/useAppUpdater"

export function UpdateBanner() {
  const { update, visible, installing, progress, error, install, dismiss } = useAppUpdater()

  if (!visible || !update) return null

  return (
    <div
      role="status"
      className="animate-in fade-in slide-in-from-bottom-2 border-border bg-popover text-popover-foreground fixed right-4 bottom-4 z-[100] w-[calc(100vw-2rem)] max-w-sm rounded-xl border p-4 shadow-2xl duration-300"
    >
      <div className="flex items-start gap-3">
        <span className="bg-primary/12 text-primary grid size-9 shrink-0 place-items-center rounded-lg">
          <Download className="size-4" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Nova versão disponível</p>
          <p className="text-muted-foreground mt-0.5 text-xs">
            NorteSp {update.version} está pronta para instalar.
          </p>
          {update.body && <p className="text-muted-foreground mt-2 line-clamp-3 text-xs whitespace-pre-line">{update.body}</p>}
        </div>

        {!installing && (
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dispensar"
            className="text-muted-foreground hover:text-foreground -mt-1 -mr-1 grid size-7 shrink-0 place-items-center rounded-md transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {installing && (
        <div className="bg-secondary mt-3 h-1.5 overflow-hidden rounded-full">
          <div
            className={`bg-primary h-full rounded-full transition-[width] duration-200 ${progress === null ? "w-1/3 animate-pulse" : ""}`}
            style={progress === null ? undefined : { width: `${progress}%` }}
          />
        </div>
      )}

      {error && <p className="text-destructive mt-3 text-xs">{error}</p>}

      <div className="mt-3 flex items-center justify-end gap-2">
        {!installing && (
          <Button variant="ghost" size="sm" onClick={dismiss}>
            Depois
          </Button>
        )}
        <Button size="sm" onClick={install} disabled={installing}>
          {installing ? <LoaderCircle className="animate-spin" /> : <Download />}
          {installing ? (progress === null ? "Baixando..." : `Baixando ${progress}%`) : "Atualizar e reiniciar"}
        </Button>
      </div>
    </div>
  )
}
