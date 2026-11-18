import { useState } from "react"
import { ArrowRight, Clock3, Inbox, Monitor, Bot as BotIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState, ErrorState } from "@/components/ui/states"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { WhitelistPendingItem } from "@/types"
import { WhitelistReviewDialog } from "./WhitelistReviewDialog"

function relative(value: string) {
  const minutes = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 60_000))
  if (minutes < 60) return `há ${minutes} min`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `há ${hours} h`
  return `há ${Math.round(hours / 24)} d`
}

export function WhitelistPendingQueue({
  pending,
  loading,
  error,
  refetch,
}: {
  pending: WhitelistPendingItem[]
  loading: boolean
  error: string | null
  refetch: () => void
}) {
  const [active, setActive] = useState<WhitelistPendingItem | null>(null)
  const oldest = pending[0]

  return (
    <Card className="gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6">
        <div>
          <h3 className="text-lg font-semibold">Whitelists pendentes</h3>
          <p className="text-muted-foreground text-xs">
            {pending.length === 0
              ? "Nenhuma aguardando análise"
              : `${pending.length} aguardando análise · a mais antiga espera ${relative(oldest.createdAt).replace("há ", "")}`}
          </p>
        </div>
        {pending.length > 0 && (
          <Badge variant="secondary" className="gap-1.5">
            <span className="bg-primary size-1.5 animate-pulse rounded-full" />
            {pending.length} na fila
          </Badge>
        )}
      </div>

      <div className="px-4 sm:px-6">
        {loading && pending.length === 0 && <Skeleton className="h-56 w-full rounded-xl" />}
        {error && <ErrorState message={error} onRetry={refetch} />}

        {!loading && !error && pending.length === 0 && (
          <EmptyState icon={<Inbox className="size-6" />} title="Fila vazia" description="Todas as whitelists foram analisadas. Bom trabalho!" />
        )}

        {pending.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Candidato</TableHead>
                <TableHead>Enviada</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pending.map(item => (
                <TableRow key={item._id} className="cursor-pointer" onClick={() => setActive(item)}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 ring-1 ring-white/10">
                        <AvatarImage src={item.avatar} alt="" />
                        <AvatarFallback>{item.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 leading-tight">
                        <p className="truncate text-sm font-semibold">{item.displayName}</p>
                        <p className="text-muted-foreground truncate text-xs">
                          @{item.username} · {item.answers.length} respostas
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{new Date(item.createdAt).toLocaleDateString("pt-BR")}</p>
                    <p className="text-muted-foreground text-xs">{relative(item.createdAt)}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="gap-1.5 font-normal">
                      {item.source === "bot" ? <BotIcon className="size-3" /> : <Monitor className="size-3" />}
                      {item.source === "bot" ? "Bot" : "Dashboard"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      <Clock3 className="size-3" />
                      Pendente
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={event => {
                        event.stopPropagation()
                        setActive(item)
                      }}
                    >
                      Analisar
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <WhitelistReviewDialog
        item={active}
        resolved={!!active && !loading && !error && !pending.some(entry => entry._id === active._id)}
        onOpenChange={open => !open && setActive(null)}
        onReviewed={() => {
          setActive(null)
          refetch()
        }}
      />
    </Card>
  )
}
