import { useState } from "react"
import { Newspaper, Pencil, Plus, Trash2 } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { useAuth } from "@/contexts/AuthContext"
import { useApi } from "@/hooks/useApi"
import { useLiveRefresh } from "@/hooks/useLiveRefresh"
import { CHANGELOG_CATEGORIES, categoryMeta, formatLongDate } from "@/lib/community"
import { LOG_TONE } from "@/lib/logTypes"
import { cn } from "@/lib/utils"
import { changelogService } from "@/services/community.service"
import type { ChangelogCategory, ChangelogEntry } from "@/types"
import { ChangelogFormDialog } from "./ChangelogFormDialog"

function EntryContent({ content }: { content: string }) {
  const blocks: Array<{ list: boolean; lines: string[] }> = []
  for (const raw of content.split("\n")) {
    const line = raw.trim()
    if (!line) continue
    const bullet = /^[-•*]\s+/.test(line)
    const last = blocks.at(-1)
    if (last && last.list === bullet) last.lines.push(bullet ? line.replace(/^[-•*]\s+/, "") : line)
    else blocks.push({ list: bullet, lines: [bullet ? line.replace(/^[-•*]\s+/, "") : line] })
  }

  return (
    <div className="flex flex-col gap-2.5 text-sm leading-relaxed">
      {blocks.map((block, index) =>
        block.list ? (
          <ul key={index} className="flex flex-col gap-1.5">
            {block.lines.map((line, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="bg-primary mt-2 size-1.5 shrink-0 rounded-full" />
                <span className="min-w-0 break-words">{line}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={index} className="text-foreground/90 break-words">
            {block.lines.join(" ")}
          </p>
        ),
      )}
    </div>
  )
}

export function ChangelogPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === "admin"
  const { data, loading, error, refetch } = useApi(() => changelogService.list(), [])
  useLiveRefresh(refetch, ["changelog-changed"], 120_000)

  const [filter, setFilter] = useState<ChangelogCategory | "all">("all")
  const [editing, setEditing] = useState<ChangelogEntry | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [removing, setRemoving] = useState<ChangelogEntry | null>(null)

  const items = (data?.items ?? []).filter(item => filter === "all" || item.category === filter)

  return (
    <DashboardLayout title="Changelog" description="Notas oficiais de atualização do servidor.">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por categoria">
          {[{ value: "all" as const, label: "Todas" }, ...CHANGELOG_CATEGORIES].map(option => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={filter === option.value}
              className={cn(
                "h-8 rounded-full border px-3 text-xs font-medium transition-colors",
                filter === option.value ? "border-primary/40 bg-primary/12 text-primary" : "border-border text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => {
                setEditing(null)
                setFormOpen(true)
              }}
            >
              <Plus className="size-4" />
              Nova publicação
            </Button>
          )}
        </div>
      </div>

      {loading && !data && (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      )}
      {error && !data && <ErrorState message={error} onRetry={refetch} />}

      {data && items.length === 0 && (
        <EmptyState
          icon={<Newspaper className="size-8" />}
          title={filter === "all" ? "Nenhuma atualização publicada" : "Nada nesta categoria"}
          description={filter === "all" ? "Assim que a administração publicar um patch, ele aparece aqui automaticamente." : "Tente outra categoria."}
        />
      )}

      {items.length > 0 && (
        <ol className="border-border relative ml-2 flex flex-col gap-5 border-l pl-6 sm:ml-3 sm:pl-8">
          {items.map(entry => {
            const meta = categoryMeta(CHANGELOG_CATEGORIES, entry.category)
            const tone = LOG_TONE[meta.tone]
            return (
              <li key={entry.id} className="relative">
                <span className={cn("ring-background absolute top-5 -left-[31px] size-3 rounded-full ring-4 sm:-left-[39px]", tone.dot)} />
                <Card className="gap-4 p-4 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          v{entry.version}
                        </Badge>
                        <span className={cn("rounded-full border px-2.5 py-0.5 text-[11px] font-semibold", tone.badge)}>{meta.label}</span>
                        {entry.edited && <span className="text-muted-foreground text-[11px]">editado</span>}
                      </div>
                      <h3 className="font-display mt-2 text-lg leading-snug font-bold break-words">{entry.title}</h3>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {formatLongDate(entry.publishedAt)} • por {entry.authorName}
                      </p>
                    </div>

                    {isAdmin && (
                      <div className="flex gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`Editar ${entry.title}`}
                          onClick={() => {
                            setEditing(entry)
                            setFormOpen(true)
                          }}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button size="sm" variant="outline" aria-label={`Remover ${entry.title}`} onClick={() => setRemoving(entry)}>
                          <Trash2 className="text-destructive size-3.5" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <EntryContent content={entry.content} />
                </Card>
              </li>
            )
          })}
        </ol>
      )}

      <ChangelogFormDialog open={formOpen} entry={editing} onOpenChange={setFormOpen} onSaved={refetch} />

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={next => !next && setRemoving(null)}
        variant="destructive"
        title={`Remover “${removing?.title}”?`}
        description="A publicação some do mural para todos e a mensagem no canal de atualizações do Discord também é apagada. A ação fica registrada nos logs."
        confirmLabel="Remover"
        loadingLabel="Removendo..."
        onConfirm={async () => {
          if (!removing) return
          await changelogService.remove(removing.id)
          setRemoving(null)
          refetch()
        }}
      />
    </DashboardLayout>
  )
}
