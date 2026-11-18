import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"
import { AlertTriangle } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ApiError } from "@/api/client"
import { cn } from "@/lib/utils"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: ReactNode
  /** Extra content between the description and the buttons (e.g. the reason typed by the user). */
  children?: ReactNode
  confirmLabel?: string
  loadingLabel?: string
  cancelLabel?: string
  /** "destructive" (red) for irreversible actions, "default" for reversible ones. */
  variant?: "destructive" | "default"
  /**
   * Runs when the user confirms. The modal shows a loading state while the
   * promise is pending and displays the error message if it throws — closing
   * the modal on success is up to the caller (usually `onOpenChange(false)`).
   */
  onConfirm: () => void | Promise<void>
}

// Replaces the browser's native confirm(): same look as every other dialog on
// the Dashboard, and safe by default (focus starts on "Cancelar", it can't be
// dismissed while the request is running, and failures show up inline).
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  confirmLabel = "Confirmar",
  loadingLabel = "Aguarde...",
  cancelLabel = "Cancelar",
  variant = "default",
  onConfirm,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const destructive = variant === "destructive"

  // Never show the previous attempt's error when the modal is reopened.
  useEffect(() => {
    if (open) setError(null)
  }, [open])

  async function handleConfirm() {
    setError(null)
    setBusy(true)
    try {
      await onConfirm()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível concluir a ação.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={next => !busy && onOpenChange(next)}>
      <DialogContent
        className="max-w-md"
        showCloseButton={false}
        onOpenAutoFocus={event => {
          event.preventDefault()
          cancelRef.current?.focus()
        }}
      >
        <DialogHeader>
          <div
            className={cn(
              "mb-2 flex size-11 items-center justify-center rounded-full",
              destructive ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary",
            )}
          >
            <AlertTriangle className="size-5" />
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {children}

        {error && (
          <p role="alert" className="text-destructive text-sm">
            {error}
          </p>
        )}

        <DialogFooter>
          <Button ref={cancelRef} variant="outline" disabled={busy} onClick={() => onOpenChange(false)}>
            {cancelLabel}
          </Button>
          <Button variant={destructive ? "destructive" : "default"} disabled={busy} onClick={handleConfirm}>
            {busy ? loadingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
