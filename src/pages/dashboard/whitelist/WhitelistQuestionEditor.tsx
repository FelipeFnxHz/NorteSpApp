import { useState } from "react"
import { Check, Pencil, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { whitelistService, type QuestionBody } from "@/services/whitelist.service"
import { ApiError } from "@/api/client"
import { cn } from "@/lib/utils"
import { MAX_OPTION_LENGTH, MAX_OPTIONS, MIN_OPTIONS, QUESTION_TYPES, QUESTION_TYPE_META, isChoice, typeOf } from "@/lib/whitelist-questions"
import type { WhitelistQuestion, WhitelistQuestionType } from "@/types"

const EMPTY_OPTIONS = ["", ""]

function TypeSelector({ value, onChange }: { value: WhitelistQuestionType; onChange: (next: WhitelistQuestionType) => void }) {
  return (
    <div role="radiogroup" aria-label="Tipo de resposta" className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1 2xl:grid-cols-3">
      {QUESTION_TYPES.map(type => {
        const meta = QUESTION_TYPE_META[type]
        const selected = value === type
        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(type)}
            className={cn(
              "flex min-w-0 flex-col items-start gap-2 rounded-xl border p-3 text-left transition-all outline-none focus-visible:ring-primary/20 focus-visible:ring-4",
              selected ? "border-primary/50 bg-primary/[0.07]" : "border-border bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]",
            )}
          >
            <span className="flex w-full items-center justify-between">
              <meta.icon className={cn("size-4", selected ? "text-primary" : "text-muted-foreground")} />
              {selected && <Check className="text-primary size-3.5" strokeWidth={3} />}
            </span>
            <span className="min-w-0 break-words">
              <span className={cn("block text-[13px] leading-tight font-semibold", !selected && "text-foreground/90")}>{meta.label}</span>
              <span className="text-muted-foreground mt-0.5 block text-[11px] leading-snug">{meta.hint}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function OptionsEditor({ options, onChange, error }: { options: string[]; onChange: (next: string[]) => void; error: string | null }) {
  const canAdd = options.length < MAX_OPTIONS

  function update(index: number, value: string) {
    onChange(options.map((option, i) => (i === index ? value : option)))
  }

  return (
    <fieldset className="border-border flex min-w-0 flex-col gap-2.5 rounded-xl border bg-white/[0.02] p-3.5">
      <legend className="sr-only">Opções de resposta</legend>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">Opções de resposta</p>
        <span className="text-muted-foreground text-[11px] tabular-nums">
          {options.filter(option => option.trim()).length}/{MAX_OPTIONS}
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {options.map((option, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className="bg-white/[0.06] text-muted-foreground grid size-6 shrink-0 place-items-center rounded-md text-[10px] font-bold tabular-nums">{index + 1}</span>
            <div className="min-w-0 flex-1">
              <Input
                value={option}
                maxLength={MAX_OPTION_LENGTH}
                onChange={event => update(index, event.target.value)}
                placeholder={`Opção ${index + 1}`}
                aria-label={`Opção ${index + 1}`}
              />
            </div>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={options.length <= MIN_OPTIONS}
              onClick={() => onChange(options.filter((_, i) => i !== index))}
              aria-label={`Remover opção ${index + 1}`}
            >
              <Trash2 className="text-destructive size-3.5" />
            </Button>
          </li>
        ))}
      </ul>

      <Button type="button" variant="outline" size="sm" className="self-start" disabled={!canAdd} onClick={() => onChange([...options, ""])}>
        <Plus className="size-3.5" />
        Adicionar opção
      </Button>

      {error && <p className="text-destructive text-xs font-medium">{error}</p>}
    </fieldset>
  )
}

/** Valida as opções no cliente (o servidor valida de novo). Retorna a lista limpa ou a mensagem de erro. */
function cleanOptions(options: string[]): { ok: true; value: string[] } | { ok: false; message: string } {
  const value: string[] = []
  for (const option of options.map(item => item.trim()).filter(Boolean)) {
    if (value.some(existing => existing.toLowerCase() === option.toLowerCase())) return { ok: false, message: `A opção "${option}" está repetida.` }
    value.push(option)
  }
  if (value.length < MIN_OPTIONS) return { ok: false, message: `Preencha pelo menos ${MIN_OPTIONS} opções.` }
  return { ok: true, value }
}

export function WhitelistQuestionEditor({
  editing,
  autoFocus,
  onDone,
}: {
  editing: WhitelistQuestion | null
  /** Foca o campo da pergunta ao montar (usado após criar, para cadastrar a próxima em sequência). */
  autoFocus?: boolean
  /** Chamado após salvar ou cancelar; `saved` indica se a lista precisa ser recarregada. */
  onDone: (saved: boolean) => void
}) {
  const [question, setQuestion] = useState(editing?.question ?? "")
  const [description, setDescription] = useState(editing?.description ?? "")
  const [required, setRequired] = useState(editing?.required ?? true)
  const [type, setType] = useState<WhitelistQuestionType>(editing ? typeOf(editing) : "text")
  const [options, setOptions] = useState<string[]>(editing?.options?.length ? editing.options : EMPTY_OPTIONS)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [optionsError, setOptionsError] = useState<string | null>(null)

  const choice = type !== "text"

  async function handleSubmit() {
    setFormError(null)
    setOptionsError(null)

    if (!question.trim()) return setFormError("Informe o texto da pergunta.")

    const body: QuestionBody = { question: question.trim(), description, required, type }
    if (choice) {
      const cleaned = cleanOptions(options)
      if (!cleaned.ok) return setOptionsError(cleaned.message)
      body.options = cleaned.value
    }

    setBusy(true)
    try {
      if (editing) await whitelistService.updateQuestion(editing.id, body)
      else await whitelistService.addQuestion(body)
      onDone(true)
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Falha ao salvar a pergunta.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="border-border flex w-full min-w-0 flex-col gap-3.5 border-t pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6">
      <p className="flex items-center gap-1.5 text-sm font-bold">
        {editing ? <Pencil className="size-3.5" /> : <Plus className="size-3.5" />}
        {editing ? "Editando pergunta" : "Nova pergunta"}
      </p>

      <Input label="Pergunta" autoFocus={autoFocus} value={question} onChange={e => setQuestion(e.target.value)} placeholder="Ex: Qual sua idade?" />
      <Input label="Descrição (opcional)" value={description} onChange={e => setDescription(e.target.value)} placeholder="Um texto de apoio para o candidato" />

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold">Tipo de resposta</p>
        <TypeSelector value={type} onChange={setType} />
      </div>

      {choice && <OptionsEditor options={options} onChange={setOptions} error={optionsError} />}

      {editing && isChoice(editing) && type === "text" && (
        <Alert>
          <AlertDescription>As opções cadastradas serão descartadas ao salvar como texto livre.</AlertDescription>
        </Alert>
      )}

      <label className="border-border flex min-w-0 cursor-pointer items-center gap-3 rounded-lg border bg-white/[0.02] px-3.5 py-3 text-sm">
        <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} className="accent-primary size-4 shrink-0" />
        <span>
          <span className="block font-medium">Resposta obrigatória</span>
          <span className="text-muted-foreground block text-xs">O candidato não consegue enviar sem responder.</span>
        </span>
      </label>

      {formError && (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSubmit} disabled={busy}>
          {busy ? "Salvando..." : editing ? "Salvar alterações" : "Adicionar pergunta"}
        </Button>
        {editing && (
          <Button variant="outline" onClick={() => onDone(false)} disabled={busy}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  )
}
