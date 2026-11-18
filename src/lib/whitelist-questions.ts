import { AlignLeft, CircleDot, ListChecks, type LucideIcon } from "lucide-react"
import type { WhitelistQuestion, WhitelistQuestionType } from "@/types"

export const MIN_OPTIONS = 2
export const MAX_OPTIONS = 10
export const MAX_OPTION_LENGTH = 100

export const QUESTION_TYPE_META: Record<WhitelistQuestionType, { label: string; hint: string; icon: LucideIcon }> = {
  text: { label: "Texto livre", hint: "O candidato escreve a resposta.", icon: AlignLeft },
  single: { label: "Escolha única", hint: "Seleciona uma opção.", icon: CircleDot },
  multiple: { label: "Múltipla escolha", hint: "Seleciona uma ou mais opções.", icon: ListChecks },
}

export const QUESTION_TYPES = Object.keys(QUESTION_TYPE_META) as WhitelistQuestionType[]

export const typeOf = (question: Pick<WhitelistQuestion, "type">): WhitelistQuestionType => question.type ?? "text"
export const isChoice = (question: Pick<WhitelistQuestion, "type">) => typeOf(question) !== "text"

/** Uma pergunta conta como respondida quando tem texto (livre) ou ao menos uma opção marcada (escolha). */
export function hasAnswer(value: string | string[] | undefined): boolean {
  if (Array.isArray(value)) return value.length > 0
  return (value ?? "").trim().length > 0
}
