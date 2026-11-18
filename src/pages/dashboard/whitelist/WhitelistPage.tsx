import { Inbox, ListChecks, Lock, ShieldCheck } from "lucide-react"
import { WhitelistStateToggle, WhitelistStatusPill, useWhitelistOpen } from "@/components/dashboard/WhitelistStateToggle"
import { DashboardLayout } from "@/layouts/DashboardLayout"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/states"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useApi } from "@/hooks/useApi"
import { useWhitelistRealtime } from "@/hooks/useWhitelistRealtime"
import { useAuth } from "@/contexts/AuthContext"
import { whitelistService } from "@/services/whitelist.service"
import type { WhitelistMeActive, WhitelistMeOpen } from "@/types"
import { WhitelistApplyForm } from "./WhitelistApplyForm"
import { WhitelistStatusCard } from "./WhitelistStatusCard"
import { WhitelistPendingQueue } from "./WhitelistPendingQueue"
import { WhitelistQuestionsManager } from "./WhitelistQuestionsManager"

function MyWhitelistTab() {
  const { data, loading, error, refetch } = useApi(() => whitelistService.me(), [])
  useWhitelistRealtime(refetch)
  const whitelistOpen = useWhitelistOpen()

  if (loading && !data) return <Skeleton className="mx-auto h-[28rem] w-full max-w-2xl rounded-2xl" />
  if (error && !data) return <ErrorState message={error} onRetry={refetch} />
  if (!data) return null

  const isActive = data.status === "pending" || data.status === "approved"

  if (isActive) {
    const active = data as WhitelistMeActive
    return (
      <WhitelistStatusCard
        status={active.status}
        answers={active.answers}
        submittedAt={active.submittedAt}
        reviewedByName={active.reviewedByName}
        reviewedAt={active.reviewedAt}
      />
    )
  }

  if (whitelistOpen === false) {
    return (
      <div className="border-border/70 bg-foreground/[0.03] mx-auto flex w-full max-w-2xl flex-col items-center gap-3 rounded-2xl border px-6 py-14 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-[#f0464f]/12 text-[#f0464f]"><Lock className="size-5" /></span>
        <h3 className="text-lg font-semibold">As inscrições estão fechadas</h3>
        <p className="text-muted-foreground max-w-md text-sm">A staff abre a whitelist periodicamente. Assim que abrir, este formulário aparece aqui sozinho — não precisa recarregar.</p>
      </div>
    )
  }

  const open = data as WhitelistMeOpen
  return <WhitelistApplyForm questions={open.questions} previousRejection={open.previous} onSubmitted={refetch} />
}

function StaffWhitelist() {
  const { data, loading, error, refetch } = useApi(() => whitelistService.pending(), [])
  useWhitelistRealtime(refetch)
  const pending = data?.pending ?? []

  return (
    <Tabs defaultValue="pendentes">
      <TabsList>
        <TabsTrigger value="pendentes">
          <Inbox className="size-4" />
          Pendentes
          {pending.length > 0 && (
            <span className="bg-primary text-primary-foreground grid min-w-5 place-items-center rounded-full px-1.5 text-[10.5px] leading-5 font-bold">
              {pending.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="perguntas">
          <ListChecks className="size-4" />
          Perguntas e cargo
        </TabsTrigger>
        <TabsTrigger value="minha">
          <ShieldCheck className="size-4" />
          Minha Whitelist
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pendentes">
        <WhitelistPendingQueue pending={pending} loading={loading} error={error} refetch={refetch} />
      </TabsContent>

      <TabsContent value="perguntas">
        <WhitelistQuestionsManager />
      </TabsContent>

      <TabsContent value="minha">
        <MyWhitelistTab />
      </TabsContent>
    </Tabs>
  )
}

function WhitelistPill() {
  return <WhitelistStatusPill open={useWhitelistOpen()} />
}

export function WhitelistPage() {
  const { isStaff } = useAuth()

  return (
    <DashboardLayout
      title="Whitelist"
      description={isStaff ? "Analise as whitelists, gerencie as perguntas e o cargo de aprovado." : "Sua whitelist para entrar na cidade."}
      actions={isStaff ? <WhitelistStateToggle /> : <WhitelistPill />}
    >
      {isStaff ? <StaffWhitelist /> : <MyWhitelistTab />}
    </DashboardLayout>
  )
}
