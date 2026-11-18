import { useEffect, useRef, useState } from "react"
import { AlertTriangle, Check, ChevronDown, ChevronUp, Layers, Pencil, Shield, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useApi } from "@/hooks/useApi"
import { dashboardService } from "@/services/dashboard.service"
import { whitelistService } from "@/services/whitelist.service"
import { ApiError } from "@/api/client"
import { cn } from "@/lib/utils"
import { QUESTION_TYPE_META, typeOf } from "@/lib/whitelist-questions"
import type { WhitelistQuestion } from "@/types"
import { WhitelistQuestionEditor } from "./WhitelistQuestionEditor"

const STEP_SIZE = 3

export function WhitelistQuestionsManager() {
  const { data, loading, error, refetch } = useApi(() => whitelistService.config(), [])
  const { data: rolesData } = useApi(() => dashboardService.roles(), [])

  const [roleDraft, setRoleDraft] = useState<string | null>(null)
  const [roleSaving, setRoleSaving] = useState(false)
  const [roleSaved, setRoleSaved] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)

  const [editing, setEditing] = useState<WhitelistQuestion | null>(null)
  // Muda a cada salvamento: remonta o editor e deixa o formulário vazio para a próxima pergunta.
  const [formVersion, setFormVersion] = useState(0)
  const listRef = useRef<HTMLOListElement>(null)
  const lastCount = useRef<number | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [removing, setRemoving] = useState<WhitelistQuestion | null>(null)

  const questions = data?.questions ?? []
  const approvedRole = roleDraft ?? data?.approvedRole ?? ""
  const roleDirty = data !== null && approvedRole !== data.approvedRole
  const selectedRole = rolesData?.roles.find(role => role.id === approvedRole)
  const pages = Math.max(1, Math.ceil(questions.length / STEP_SIZE))

  async function saveApprovedRole() {
    setRoleSaving(true)
    setRoleError(null)
    try {
      await whitelistService.updateApprovedRole(approvedRole)
      setRoleDraft(null)
      setRoleSaved(true)
      refetch()
      setTimeout(() => setRoleSaved(false), 2000)
    } catch (err) {
      setRoleError(err instanceof ApiError ? err.message : "Não foi possível salvar o cargo.")
    } finally {
      setRoleSaving(false)
    }
  }

  function handleEditorDone(saved: boolean) {
    setEditing(null)
    if (saved) {
      setFormVersion(version => version + 1)
      refetch()
    }
  }

  // Ao adicionar uma pergunta, rola a lista até ela (sem mexer na rolagem em outras atualizações).
  useEffect(() => {
    const list = listRef.current
    if (list && lastCount.current !== null && questions.length > lastCount.current) {
      list.scrollTo({ top: list.scrollHeight, behavior: "smooth" })
    }
    lastCount.current = data ? questions.length : null
  }, [data, questions.length])

  async function move(index: number, direction: -1 | 1) {
    const target = index + direction
    if (target < 0 || target >= questions.length) return

    const ids = questions.map(item => item.id)
    ;[ids[index], ids[target]] = [ids[target], ids[index]]

    setMovingId(questions[index].id)
    try {
      await whitelistService.reorderQuestions(ids)
      refetch()
    } finally {
      setMovingId(null)
    }
  }

  async function confirmRemove() {
    if (!removing) return
    await whitelistService.removeQuestion(removing.id)
    if (editing?.id === removing.id) setEditing(null)
    setRemoving(null)
    refetch()
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-5 px-4 sm:px-6">
        <div className="flex items-start gap-3.5">
          <span className="bg-primary/10 text-primary ring-primary/15 grid size-10 shrink-0 place-items-center rounded-xl ring-1 ring-inset">
            <Shield className="size-[18px]" />
          </span>
          <div>
            <h3 className="text-base font-semibold">Cargo de aprovado</h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Concedido automaticamente ao candidato assim que a whitelist é aprovada — pela Dashboard ou pelo bot.
            </p>
          </div>
        </div>

        {loading && !data ? (
          <Skeleton className="h-10 w-full max-w-md" />
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-full max-w-sm">
              <Select
                icon={<Shield className="size-4" />}
                value={approvedRole}
                onChange={event => setRoleDraft(event.target.value)}
                placeholder="Nenhum cargo configurado"
                options={(rolesData?.roles ?? []).map(role => ({ value: role.id, label: role.name }))}
              />
            </div>
            <Button variant={roleDirty ? "default" : "outline"} onClick={saveApprovedRole} disabled={roleSaving || !roleDirty}>
              {roleSaved ? <Check className="size-4" /> : null}
              {roleSaving ? "Salvando..." : roleSaved ? "Salvo" : "Salvar cargo"}
            </Button>
            {selectedRole && !roleDirty && (
              <Badge variant="outline" className="gap-1.5 font-normal">
                <span className="size-2 rounded-full" style={{ backgroundColor: selectedRole.color }} />
                {selectedRole.name}
              </Badge>
            )}
          </div>
        )}

        {data && !approvedRole && (
          <Alert>
            <AlertTriangle className="size-4" />
            <AlertDescription>Sem cargo configurado, aprovar uma candidatura só avisa o candidato — nenhum cargo é concedido.</AlertDescription>
          </Alert>
        )}
        {roleError && (
          <Alert variant="destructive">
            <AlertDescription>{roleError}</AlertDescription>
          </Alert>
        )}
      </Card>

      <Card className="gap-5 px-4 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Perguntas do formulário</h3>
            <p className="text-muted-foreground text-xs">A ordem aqui é a ordem mostrada ao candidato.</p>
          </div>
          <Badge variant="outline" className="gap-1.5 font-normal">
            <Layers className="size-3" />
            {questions.length} {questions.length === 1 ? "pergunta" : "perguntas"}
            {pages > 1 && ` · ${pages} etapas`}
          </Badge>
        </div>

        {questions.length > STEP_SIZE && (
          <p className="text-muted-foreground bg-white/[0.03] border-border rounded-lg border px-3.5 py-2.5 text-xs leading-relaxed">
            Com mais de {STEP_SIZE} perguntas, o candidato preenche em etapas de {STEP_SIZE}, com botões Avançar e Voltar.
          </p>
        )}

        {loading && !data && <Skeleton className="h-40 w-full" />}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {data && (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <ol ref={listRef} className="scroll-dark flex max-h-[26rem] flex-col gap-2 pr-1.5 lg:max-h-[min(70dvh,38rem)]">
              {questions.length === 0 && (
                <li className="text-muted-foreground border-border rounded-xl border border-dashed p-4 sm:p-6 text-center text-sm">
                  Nenhuma pergunta cadastrada ainda. Adicione a primeira ao lado.
                </li>
              )}
              {questions.map((item, index) => (
                <li
                  key={item.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border px-3.5 py-3 transition-colors",
                    editing?.id === item.id ? "border-primary/50 bg-primary/[0.04]" : "border-border bg-white/[0.02]",
                    movingId === item.id && "opacity-60",
                  )}
                >
                  <div className="flex shrink-0 flex-col items-center gap-0.5">
                    <Button size="icon-xs" variant="ghost" disabled={index === 0 || movingId !== null} onClick={() => move(index, -1)} aria-label="Subir pergunta">
                      <ChevronUp />
                    </Button>
                    <span className="text-muted-foreground text-[11px] font-bold tabular-nums">{index + 1}</span>
                    <Button size="icon-xs" variant="ghost" disabled={index === questions.length - 1 || movingId !== null} onClick={() => move(index, 1)} aria-label="Descer pergunta">
                      <ChevronDown />
                    </Button>
                  </div>

                  <div className="min-w-0 flex-1 pt-0.5">
                    <p className="text-sm leading-snug font-medium break-words">{item.question}</p>
                    {item.description && <p className="text-muted-foreground mt-0.5 text-xs break-words">{item.description}</p>}
                    {item.options && item.options.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-1.5">
                        {item.options.map(option => (
                          <li key={option} className="border-border text-muted-foreground max-w-full truncate rounded-md border bg-white/[0.03] px-2 py-0.5 text-[11px]">
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      <Badge variant={item.required ? "secondary" : "outline"} className="text-[10px] font-normal">
                        {item.required ? "obrigatória" : "opcional"}
                      </Badge>
                      {typeOf(item) !== "text" && (
                        <Badge variant="outline" className="border-primary/25 text-primary text-[10px] font-normal">
                          {QUESTION_TYPE_META[typeOf(item)].label}
                        </Badge>
                      )}
                      {pages > 1 && (
                        <Badge variant="outline" className="text-[10px] font-normal">
                          etapa {Math.floor(index / STEP_SIZE) + 1}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Button size="icon-sm" variant="ghost" onClick={() => setEditing(item)} aria-label="Editar pergunta">
                    <Pencil className="size-3.5" />
                  </Button>
                  <Button size="icon-sm" variant="ghost" onClick={() => setRemoving(item)} aria-label="Remover pergunta">
                    <Trash2 className="text-destructive size-3.5" />
                  </Button>
                </li>
              ))}
            </ol>

            <div className="min-w-0 lg:sticky lg:top-4 lg:self-start">
              <WhitelistQuestionEditor
                key={`${editing?.id ?? "new"}:${formVersion}`}
                editing={editing}
                autoFocus={formVersion > 0 && !editing}
                onDone={handleEditorDone}
              />
            </div>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!removing}
        onOpenChange={next => !next && setRemoving(null)}
        variant="destructive"
        title="Remover esta pergunta?"
        description="Ela some do formulário de candidatura. Candidaturas já enviadas mantêm a resposta no histórico."
        confirmLabel="Remover pergunta"
        loadingLabel="Removendo..."
        onConfirm={confirmRemove}
      />
    </div>
  )
}
