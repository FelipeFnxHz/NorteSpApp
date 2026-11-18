import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Check, Send, ShieldAlert, ShieldCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AnswerTextarea } from "@/components/ui/answer-textarea"
import { OptionPicker } from "@/components/ui/option-picker"
import { whitelistService } from "@/services/whitelist.service"
import { ApiError } from "@/api/client"
import { cn } from "@/lib/utils"
import { hasAnswer, isChoice, typeOf } from "@/lib/whitelist-questions"
import type { WhitelistPreviousReview, WhitelistQuestion } from "@/types"

const STEP_SIZE = 3
const MAX_ANSWER_LENGTH = 600

type AnswerDraft = string | string[]

function ProgressBar({ steps, current }: { steps: number; current: number }) {
  return (
    <div className="flex items-center gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={steps} aria-valuenow={current + 1}>
      {Array.from({ length: steps }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-all duration-500",
            index < current ? "bg-primary" : index === current ? "bg-primary/60" : "bg-white/[0.08]",
          )}
        />
      ))}
    </div>
  )
}

function QuestionField({
  number,
  question,
  value,
  invalid,
  onChange,
}: {
  number: number
  question: WhitelistQuestion
  value: AnswerDraft | undefined
  invalid: boolean
  onChange: (value: AnswerDraft) => void
}) {
  const answered = hasAnswer(value)
  const type = typeOf(question)

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-5 transition-colors",
        invalid ? "border-destructive/40 bg-destructive/[0.03]" : "border-border bg-white/[0.02]",
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold transition-colors",
            answered ? "bg-accent/15 text-accent" : "bg-white/[0.06] text-muted-foreground",
          )}
        >
          {answered ? <Check className="size-3.5" strokeWidth={3} /> : number}
        </span>
        <div className="min-w-0 flex-1">
          <label className="text-[14.5px] leading-snug font-semibold">
            {question.question}
            {question.required && <span className="text-destructive ml-1">*</span>}
          </label>
          {question.description && <p className="text-muted-foreground mt-1 text-xs leading-relaxed">{question.description}</p>}
          {type === "multiple" && <p className="text-muted-foreground/80 mt-1 text-[11px] font-medium">Você pode marcar mais de uma opção.</p>}
        </div>
      </div>

      {isChoice(question) ? (
        <OptionPicker
          mode={type === "multiple" ? "multiple" : "single"}
          options={question.options ?? []}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          invalid={invalid}
          label={question.question}
        />
      ) : (
        <AnswerTextarea
          value={typeof value === "string" ? value : ""}
          onChange={onChange}
          maxLength={MAX_ANSWER_LENGTH}
          invalid={invalid}
          rows={3}
          placeholder="Digite sua resposta..."
          aria-label={question.question}
        />
      )}

      {invalid && <p className="text-destructive -mt-1 text-xs font-medium">{isChoice(question) ? "Selecione ao menos uma opção." : "Essa pergunta é obrigatória."}</p>}
    </div>
  )
}

export function WhitelistApplyForm({
  questions,
  previousRejection,
  onSubmitted,
}: {
  questions: WhitelistQuestion[]
  previousRejection: WhitelistPreviousReview | null
  onSubmitted: () => void
}) {
  const [answers, setAnswers] = useState<Record<string, AnswerDraft>>({})
  const [step, setStep] = useState(0)
  const [flagged, setFlagged] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const paged = questions.length > STEP_SIZE
  const steps = useMemo(() => {
    if (!paged) return [questions]
    const chunks: WhitelistQuestion[][] = []
    for (let i = 0; i < questions.length; i += STEP_SIZE) chunks.push(questions.slice(i, i + STEP_SIZE))
    return chunks
  }, [questions, paged])

  const isLast = step === steps.length - 1
  const answeredCount = questions.filter(question => hasAnswer(answers[question.id])).length
  const currentQuestions = steps[step] ?? []

  const missingIn = (list: WhitelistQuestion[]) => list.filter(question => question.required && !hasAnswer(answers[question.id]))

  function setAnswer(question: WhitelistQuestion, value: AnswerDraft) {
    setAnswers(current => ({ ...current, [question.id]: value }))
    if (flagged.has(question.id) && hasAnswer(value)) {
      setFlagged(current => {
        const next = new Set(current)
        next.delete(question.id)
        return next
      })
    }
  }

  function goNext() {
    const missing = missingIn(currentQuestions)
    if (missing.length > 0) {
      setFlagged(current => new Set([...current, ...missing.map(question => question.id)]))
      setError("Responda as perguntas obrigatórias desta etapa para continuar.")
      return
    }
    setError(null)
    setStep(current => Math.min(current + 1, steps.length - 1))
  }

  function goBack() {
    setError(null)
    setStep(current => Math.max(current - 1, 0))
  }

  async function handleSubmit() {
    setError(null)

    for (let index = 0; index < steps.length; index++) {
      const missing = missingIn(steps[index])
      if (missing.length > 0) {
        setFlagged(current => new Set([...current, ...missing.map(question => question.id)]))
        setStep(index)
        setError(paged ? `Faltam respostas obrigatórias na etapa ${index + 1}.` : "Responda as perguntas obrigatórias para enviar.")
        return
      }
    }

    setSubmitting(true)
    try {
      await whitelistService.apply(
        questions.map(question => {
          const value = answers[question.id]
          return isChoice(question)
            ? { questionId: question.id, values: Array.isArray(value) ? value : [] }
            : { questionId: question.id, answer: typeof value === "string" ? value.trim() : "" }
        }),
      )
      onSubmitted()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Falha ao enviar sua whitelist.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {previousRejection && (
        <Card className="border-destructive/30 flex-row items-start gap-3.5 px-5 py-4">
          <span className="bg-destructive/12 text-destructive grid size-9 shrink-0 place-items-center rounded-xl">
            <ShieldAlert className="size-[18px]" />
          </span>
          <div className="min-w-0">
            <strong className="text-sm font-semibold">Sua última whitelist foi reprovada</strong>
            {previousRejection.reviewReason && (
              <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                <span className="text-foreground font-medium">Motivo:</span> {previousRejection.reviewReason}
              </p>
            )}
            <p className="text-muted-foreground mt-1 text-xs">Você pode se candidatar de novo preenchendo o formulário abaixo.</p>
          </div>
        </Card>
      )}

      <Card className="gap-0 overflow-hidden py-0">
        <div className="from-primary/20 via-primary/5 relative overflow-hidden bg-gradient-to-br to-transparent px-4 sm:px-6 py-7">
          <div className="bg-grid absolute inset-0 opacity-30" />
          <div className="relative flex items-center gap-4">
            <span className="bg-primary/15 text-primary ring-primary/20 grid size-12 shrink-0 place-items-center rounded-2xl ring-1 ring-inset">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <h2 className="text-xl leading-tight font-bold">Formulário de Whitelist</h2>
              <p className="text-muted-foreground mt-0.5 text-sm">Responda com atenção — sua entrada na cidade depende disso.</p>
            </div>
          </div>
        </div>

        {questions.length > 0 && (
          <div className="border-border flex flex-col gap-3 border-t px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between text-xs">
              <span className="text-foreground font-semibold">
                {paged ? `Etapa ${step + 1} de ${steps.length}` : "Formulário"}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {answeredCount} de {questions.length} respondidas
              </span>
            </div>
            {paged && <ProgressBar steps={steps.length} current={step} />}
          </div>
        )}

        <div className="border-border flex flex-col gap-4 border-t px-4 sm:px-6 py-6">
          {questions.length === 0 && (
            <p className="text-muted-foreground py-6 text-center text-sm">Ainda não há perguntas configuradas. Volte mais tarde.</p>
          )}

          {/* keyed by step so each page fades in fresh */}
          <div key={step} className="animate-fade-up flex flex-col gap-4">
            {currentQuestions.map((question, index) => (
              <QuestionField
                key={question.id}
                number={step * STEP_SIZE + index + 1}
                question={question}
                value={answers[question.id]}
                invalid={flagged.has(question.id)}
                onChange={value => setAnswer(question, value)}
              />
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        {questions.length > 0 && (
          <div className="border-border bg-white/[0.02] flex items-center justify-between gap-3 border-t px-4 sm:px-6 py-4">
            {paged ? (
              <Button variant="ghost" onClick={goBack} disabled={step === 0 || submitting}>
                <ArrowLeft className="size-4" />
                Voltar
              </Button>
            ) : (
              <span />
            )}

            {isLast ? (
              <Button onClick={handleSubmit} disabled={submitting} size="lg" className="min-w-0 flex-1 sm:min-w-44 sm:flex-none">
                <Send className="size-4" />
                {submitting ? "Enviando..." : "Enviar whitelist"}
              </Button>
            ) : (
              <Button onClick={goNext} size="lg" className="min-w-0 flex-1 sm:min-w-36 sm:flex-none">
                Avançar
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
