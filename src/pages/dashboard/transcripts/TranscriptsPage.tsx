import { useEffect, useMemo, useState } from "react"
import { FileText, MessageSquareText, Search, Shield } from "lucide-react"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Card } from "@/components/ui/card"
import { StatCard } from "@/components/ui/stat-card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useApi } from "@/hooks/useApi"
import { useRouter } from "@/contexts/RouterContext"
import { useAuth } from "@/contexts/AuthContext"
import { transcriptsService } from "@/services/transcripts.service"

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
}

function formatClock(value: string) {
  return new Date(value).toLocaleTimeString("pt-BR", { timeStyle: "short" })
}

export function TranscriptsPage() {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const { data, loading, error, refetch } = useApi(() => transcriptsService.list(), [])
  const { path } = useRouter()
  const { isStaff } = useAuth()

  useEffect(() => {
    if (!data) return
    const search = new URLSearchParams(path.split("?")[1] ?? "")
    const codigo = search.get("codigo")
    if (!codigo) return

    const match = data.transcripts.find(item => item.codigo === codigo)
    if (match) setActiveId(match._id)
  }, [data, path])

  const { data: detailData, loading: detailLoading } = useApi(
    () => (activeId ? transcriptsService.detail(activeId) : Promise.resolve(null)),
    [activeId],
  )
  const transcript = detailData?.transcript

  const transcripts = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return data?.transcripts ?? []
    return (data?.transcripts ?? []).filter(
      item => item.codigo.toLowerCase().includes(term) || item.closedByName.toLowerCase().includes(term),
    )
  }, [data, query])

  return (
    <DashboardLayout
      title="Transcrições"
      description={isStaff ? "Histórico completo de atendimentos encerrados." : "Os atendimentos seus que a staff já encerrou."}
    >
      {data && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatCard icon={<MessageSquareText className="size-5" />} tone="secondary" label="Transcrições" value={data.transcripts.length} />
          <StatCard icon={<Search className="size-5" />} tone="primary" label="Exibindo" value={transcripts.length} hint={query ? `para "${query}"` : "todas"} />
        </div>
      )}

      <Card className="gap-0 overflow-hidden py-0">
        <div className="border-border flex flex-wrap items-center justify-between gap-3 border-b px-4 sm:px-6 py-4">
          <div>
            <h3 className="text-sm font-semibold">Todos os transcripts</h3>
            <p className="text-muted-foreground text-xs">Clique em um item para reabrir a conversa completa.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2" />
            <input
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar por código ou staff..."
              aria-label="Buscar transcript"
              className="border-input placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-primary/15 h-10 w-full rounded-xl border bg-white/[0.03] pr-3 pl-10 text-sm outline-none transition-all duration-150 focus:bg-white/[0.05] focus:ring-4"
            />
          </div>
        </div>

        <div>
          {loading && (
            <div className="flex flex-col gap-2 p-4 sm:p-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-11 w-full" />
              ))}
            </div>
          )}
          {error && (
            <div className="p-4 sm:p-6">
              <ErrorState message={error} onRetry={refetch} />
            </div>
          )}

          {data && transcripts.length === 0 && (
            <div className="p-4 sm:p-6">
              <EmptyState icon={<FileText className="size-6" />} title="Nenhum transcript encontrado" />
            </div>
          )}

          {transcripts.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fechado por</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transcripts.map(item => (
                  <TableRow key={item._id} className="group cursor-pointer" onClick={() => setActiveId(item._id)}>
                    <TableCell>
                      <span className="bg-white/[0.04] group-hover:bg-white/[0.07] rounded-md px-2 py-1 font-mono text-xs font-semibold transition-colors">
                        {item.codigo}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{item.typeLabel}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-2 text-sm">
                        <Shield className="text-primary size-3.5" />
                        {item.closedByName}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(item.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </Card>

      <Dialog open={!!activeId} onOpenChange={open => !open && setActiveId(null)}>
        <DialogContent className="flex max-w-xl flex-col gap-0 p-0">
          <DialogHeader className="border-border border-b px-5 py-4">
            <div className="flex items-center gap-2.5">
              <span className="bg-primary/10 text-primary grid size-9 place-items-center rounded-lg">
                <FileText className="size-4" />
              </span>
              <div>
                <DialogTitle className="font-mono">{transcript?.codigo}</DialogTitle>
                {transcript && (
                  <p className="text-muted-foreground text-xs">
                    {transcript.typeLabel} · fechado por {transcript.closedByName}
                  </p>
                )}
              </div>
            </div>
          </DialogHeader>

          {detailLoading && (
            <div className="flex flex-col gap-3 p-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          )}

          {transcript && (
            <div className="flex max-h-[65dvh] flex-col gap-4 overflow-y-auto bg-black/15 p-5">
              {transcript.messages.map((message, index) => (
                <div key={`${message.authorId}-${index}`} className={`flex gap-3 ${message.isStaff ? "flex-row-reverse" : ""}`}>
                  <img src={message.avatar} alt="" className="size-8 shrink-0 rounded-full object-cover ring-1 ring-white/10" />

                  <div className={`flex max-w-[78%] flex-col gap-1 ${message.isStaff ? "items-end" : "items-start"}`}>
                    <div className={`flex items-center gap-2 text-[11px] ${message.isStaff ? "flex-row-reverse" : ""}`}>
                      <span className="font-semibold">{message.displayName}</span>
                      {message.isStaff && (
                        <Badge variant="secondary" className="h-4 px-1.5 text-[9px]">
                          Staff
                        </Badge>
                      )}
                      <span className="text-muted-foreground/70">{formatClock(message.createdAt)}</span>
                    </div>

                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed break-words whitespace-pre-wrap ${
                        message.isStaff
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "text-foreground rounded-tl-sm bg-white/[0.06]"
                      }`}
                    >
                      {message.content || <span className="opacity-60 italic">Anexo enviado</span>}
                    </div>

                    {message.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {message.attachments.map(url => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium hover:underline"
                          >
                            Anexo
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
