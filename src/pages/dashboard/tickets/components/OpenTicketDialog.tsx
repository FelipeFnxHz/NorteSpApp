import { useEffect, useState } from "react"
import { ArrowLeft, ChevronRight, Loader2, Send } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/states"
import { ToneIcon } from "@/components/ui/tone-icon"
import { ApiError } from "@/api/client"
import { useApi } from "@/hooks/useApi"
import { useFileUploads } from "@/hooks/useFileUploads"
import { ticketsService } from "@/services/tickets.service"
import type { TicketCategoryForm, TicketField } from "@/types"
import { cn } from "@/lib/utils"
import { categoryMeta } from "../ticket-meta"
import { FilePicker } from "./FilePicker"

interface OpenTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (codigo: string) => void
}

const INPUT_CLASS =
  "border-input placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-primary/15 w-full rounded-xl border bg-white/[0.03] px-3.5 text-sm outline-none transition-all duration-150 focus:bg-white/[0.05] focus:ring-4"

function CategoryForm({ category, onBack, onCreated }: { category: TicketCategoryForm; onBack: () => void; onCreated: (codigo: string) => void }) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingCodigo, setExistingCodigo] = useState<string | null>(null)
  const uploads = useFileUploads(5)

  const filesField = category.fields.find(field => field.kind === "files")
  const textFields = category.fields.filter(field => field.kind !== "files")

  function validate(): string | null {
    for (const field of textFields) {
      const value = (answers[field.id] ?? "").trim()
      if (!value) {
        if (field.required) return `Preencha o campo "${field.label}".`
        continue
      }
      if (field.minLength && value.length < field.minLength) return `"${field.label}" precisa de ao menos ${field.minLength} caracteres.`
    }
    if (filesField?.required && uploads.files.length === 0) return `Anexe ao menos um arquivo em "${filesField.label}".`
    return null
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const problem = validate()
    if (problem) {
      setError(problem)
      return
    }

    setSubmitting(true)
    setError(null)
    setExistingCodigo(null)
    try {
      const result = await ticketsService.open({
        category: category.key,
        answers,
        files: uploads.files.map(({ name, data }) => ({ name, data })),
      })
      onCreated(result.codigo)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.status === 409 && typeof err.data?.codigo === "string") setExistingCodigo(err.data.codigo)
      } else {
        setError("Não foi possível abrir o ticket.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  function renderField(field: TicketField) {
    const value = answers[field.id] ?? ""
    const set = (next: string) => setAnswers(current => ({ ...current, [field.id]: next }))
    const common = { id: `field-${field.id}`, value, placeholder: field.placeholder, maxLength: field.maxLength, disabled: submitting }

    return (
      <div key={field.id} className="flex flex-col gap-1.5">
        <label htmlFor={common.id} className="text-sm font-medium">
          {field.label}
          {!field.required && <span className="text-muted-foreground ml-1.5 text-xs font-normal">(opcional)</span>}
        </label>
        {field.description && <p className="text-muted-foreground text-xs">{field.description}</p>}
        {field.kind === "paragraph" ? (
          <textarea {...common} rows={5} onChange={event => set(event.target.value)} className={cn(INPUT_CLASS, "resize-y py-2.5")} />
        ) : (
          <input {...common} onChange={event => set(event.target.value)} className={cn(INPUT_CLASS, "h-10")} />
        )}
        {field.maxLength && field.kind === "paragraph" && (
          <span className="text-muted-foreground self-end text-[11px]">
            {value.length}/{field.maxLength}
          </span>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <button type="button" onClick={onBack} className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-xs font-medium">
        <ArrowLeft className="size-3.5" />
        Trocar categoria
      </button>

      {textFields.map(renderField)}

      {filesField && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">
            {filesField.label}
            {!filesField.required && <span className="text-muted-foreground ml-1.5 text-xs font-normal">(opcional)</span>}
          </span>
          {filesField.description && <p className="text-muted-foreground text-xs">{filesField.description}</p>}
          <FilePicker files={uploads.files} error={uploads.error} onAdd={uploads.add} onRemove={uploads.remove} disabled={submitting} />
        </div>
      )}

      {error && (
        <div className="border-destructive/25 bg-destructive/10 text-destructive flex flex-wrap items-center justify-between gap-2 rounded-xl border px-3.5 py-2.5 text-sm">
          <span>{error}</span>
          {existingCodigo && (
            <Button type="button" size="sm" variant="outline" onClick={() => onCreated(existingCodigo)}>
              Abrir atendimento
            </Button>
          )}
        </div>
      )}

      <Button type="submit" size="lg" disabled={submitting} className="self-end">
        {submitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        {submitting ? "Criando canal..." : "Abrir ticket"}
      </Button>
    </form>
  )
}

export function OpenTicketDialog({ open, onOpenChange, onCreated }: OpenTicketDialogProps) {
  const { data, loading, error, refetch } = useApi(() => ticketsService.categories(), [])
  const [selected, setSelected] = useState<TicketCategoryForm | null>(null)

  useEffect(() => {
    if (!open) setSelected(null)
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{selected ? selected.formTitle : "Abrir ticket"}</DialogTitle>
          <DialogDescription>
            {selected
              ? "As mesmas informações pedidas no Discord. O canal do atendimento é criado automaticamente."
              : "Escolha a categoria do atendimento. Um canal privado será criado no Discord."}
          </DialogDescription>
        </DialogHeader>

        {loading && <Skeleton className="h-52 w-full" />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {data && !selected && (
          <div className="flex flex-col gap-2.5">
            {data.categories.map(category => {
              const meta = categoryMeta(category.key)
              return (
                <button
                  key={category.key}
                  type="button"
                  disabled={!category.configured}
                  onClick={() => setSelected(category)}
                  className="group flex items-center gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition-colors hover:border-white/20 hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <ToneIcon icon={meta.icon} tone={meta.tone} className="size-11" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold">{category.label}</span>
                    <span className="text-muted-foreground block text-xs">
                      {category.configured ? category.description : "Categoria ainda não configurada no servidor."}
                    </span>
                  </span>
                  <ChevronRight className="text-muted-foreground size-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              )
            })}
          </div>
        )}

        {selected && <CategoryForm category={selected} onBack={() => setSelected(null)} onCreated={onCreated} />}
      </DialogContent>
    </Dialog>
  )
}
