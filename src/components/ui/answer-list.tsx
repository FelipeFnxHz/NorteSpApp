import { AnswerValue } from "@/components/ui/answer-value"
import { cn } from "@/lib/utils"
import type { WhitelistAnswer } from "@/types"

export function AnswerList({ answers, className }: { answers: WhitelistAnswer[]; className?: string }) {
  return (
    <ol
      tabIndex={0}
      aria-label="Respostas"
      className={cn("scroll-dark focus-visible:ring-primary/40 flex min-w-0 flex-col gap-2.5 rounded-xl pr-2 outline-none focus-visible:ring-2", className)}
    >
      {answers.map((answer, index) => (
        <li key={answer.questionId} className="border-border flex min-w-0 gap-3 rounded-xl border bg-white/[0.02] p-3.5 sm:p-4">
          <span className="bg-white/[0.06] text-muted-foreground mt-0.5 grid size-5 shrink-0 place-items-center rounded-md text-[10px] font-bold sm:size-6 sm:text-[11px]">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
            <p className="text-muted-foreground text-xs leading-snug font-medium">{answer.question}</p>
            <AnswerValue answer={answer} />
          </div>
        </li>
      ))}
    </ol>
  )
}
