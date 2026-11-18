import { Badge } from "@/components/ui/badge"
import type { WhitelistAnswer } from "@/types"

/** Renderiza a resposta de uma pergunta: chips para escolhas, texto preservado para respostas livres. */
export function AnswerValue({ answer }: { answer: WhitelistAnswer }) {
  if (answer.values && answer.values.length > 0) {
    return (
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {answer.values.map(value => (
          <li key={value}>
            <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary h-auto max-w-full py-1 text-xs font-medium break-words whitespace-normal">
              {value}
            </Badge>
          </li>
        ))}
      </ul>
    )
  }

  return <p className="mt-1 text-sm leading-relaxed [overflow-wrap:anywhere] whitespace-pre-wrap">{answer.answer || "—"}</p>
}
