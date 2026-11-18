import { useEffect } from "react"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import { AppearanceProvider } from "@/contexts/AppearanceContext"
import { RouterProvider, useRouter } from "@/contexts/RouterContext"
import { UpdateBanner } from "@/components/layout/UpdateBanner"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { LoginPage } from "@/pages/login/LoginPage"
import { AccessDeniedPage } from "@/pages/login/AccessDeniedPage"
import { PrivacyPolicy } from "@/pages/landing/PrivacyPolicy"
import { TermsOfUse } from "@/pages/landing/TermsOfUse"
import { DashboardOverviewPage } from "@/pages/dashboard/settings/DashboardOverviewPage"
import { TicketsPage } from "@/pages/dashboard/tickets/TicketsPage"
import { TranscriptsPage } from "@/pages/dashboard/transcripts/TranscriptsPage"
import { StaffPage } from "@/pages/dashboard/staff/StaffPage"
import { StaffLogsPage } from "@/pages/dashboard/staff/StaffLogsPage"
import { ProfilePage } from "@/pages/dashboard/profile/ProfilePage"
import { AnalyticsPage } from "@/pages/dashboard/analytics/AnalyticsPage"
import { FeedbackPage } from "@/pages/dashboard/feedback/FeedbackPage"
import { SettingsPage } from "@/pages/dashboard/settings/SettingsPage"
import { CorporationsPage } from "@/pages/dashboard/corporations/CorporationsPage"
import { CorporationDetailPage } from "@/pages/dashboard/corporations/CorporationDetailPage"
import { WhitelistPage } from "@/pages/dashboard/whitelist/WhitelistPage"
import { StorePage } from "@/pages/dashboard/store/StorePage"
import { PunishmentsPage } from "@/pages/dashboard/punishments/PunishmentsPage"
import { ChangelogPage } from "@/pages/dashboard/changelog/ChangelogPage"
import { EventsPage } from "@/pages/dashboard/events/EventsPage"
import { GalleryAdminPage } from "@/pages/dashboard/gallery/GalleryAdminPage"
import { BackupsPage } from "@/pages/dashboard/backups/BackupsPage"
import { SuggestionsPage } from "@/pages/dashboard/suggestions/SuggestionsPage"
import { FinancePage } from "@/pages/dashboard/finance/FinancePage"
import { FactionsPage } from "@/pages/dashboard/factions/FactionsPage"
import { FactionDetailPage } from "@/pages/dashboard/factions/FactionDetailPage"
import { CalculatorPage } from "@/pages/dashboard/tools/CalculatorPage"
import { TaxesPage } from "@/pages/dashboard/tools/TaxesPage"
import { RulesPage } from "@/pages/dashboard/rules/RulesPage"
import { ModerationPage } from "@/pages/dashboard/moderation/ModerationPage"

function OAuthCallbackStuck() {
  return (
    <div className="grid min-h-dvh place-items-center p-6 text-center">
      <div className="max-w-md">
        <h1 className="text-xl font-extrabold">O proxy não interceptou o callback do Discord</h1>
        <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
          Esta URL (<code className="bg-secondary rounded px-1 py-0.5 text-xs">/auth/discord/callback</code>) deveria ser
          entregue pela API, não pelo React. Isso quase sempre significa que o servidor do Vite ainda está rodando com uma
          versão antiga do <code className="bg-secondary rounded px-1 py-0.5 text-xs">vite.config.ts</code> — mudanças no
          proxy exigem parar e rodar <code className="bg-secondary rounded px-1 py-0.5 text-xs">npm run dev</code> de novo,
          não só recarregar a página.
        </p>
      </div>
    </div>
  )
}

function LoginRoute() {
  const { status } = useAuth()
  const { navigate } = useRouter()

  useEffect(() => {
    if (status === "authenticated") navigate("/dashboard", { replace: true })
  }, [status, navigate])

  if (status === "loading") {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    )
  }

  if (status === "authenticated") return null

  return <LoginPage />
}

function AccessDeniedRoute() {
  const { status } = useAuth()
  const { navigate } = useRouter()

  useEffect(() => {
    if (status === "authenticated") navigate("/dashboard", { replace: true })
  }, [status, navigate])

  if (status === "loading") {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    )
  }

  if (status === "authenticated") return null

  return <AccessDeniedPage />
}

function Router() {
  const { path } = useRouter()

  if (path.startsWith("/auth/discord/callback")) return <OAuthCallbackStuck />

  if (path === "/" || path === "/login") return <LoginRoute />

  if (path === "/acesso-negado" || path === "/acesso-negado/") return <AccessDeniedRoute />

  if (path === "/politica-de-privacidade" || path === "/politica-de-privacidade/") return <PrivacyPolicy />

  if (path === "/termos-de-uso" || path === "/termos-de-uso/") return <TermsOfUse />

  if (path === "/dashboard" || path === "/dashboard/") {
    return (
      <ProtectedRoute>
        <DashboardOverviewPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/faccoes")) {
    const slug = path.replace("/dashboard/faccoes", "").split("?")[0].replace(/^\//, "")

    return (
      <ProtectedRoute roles={["staff", "admin"]}>
        {slug ? <FactionDetailPage slug={slug} /> : <FactionsPage />}
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/corporations")) {
    const slug = path.replace("/dashboard/corporations", "").split("?")[0].replace(/^\//, "")

    return (
      <ProtectedRoute roles={["staff", "admin"]} allowCorpAccess>
        {slug ? <CorporationDetailPage slug={slug} /> : <CorporationsPage />}
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/whitelist")) {
    return (
      <ProtectedRoute>
        <WhitelistPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/store")) {
    return (
      <ProtectedRoute>
        <StorePage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/tickets")) {
    return (
      <ProtectedRoute>
        <TicketsPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/transcripts")) {
    return (
      <ProtectedRoute>
        <TranscriptsPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/profile")) {
    return (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/analytics")) {
    return (
      <ProtectedRoute roles={["staff", "admin"]}>
        <AnalyticsPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/feedback")) {
    return (
      <ProtectedRoute roles={["staff", "admin"]}>
        <FeedbackPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/settings")) {
    return (
      <ProtectedRoute>
        <SettingsPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/punishments")) {
    return (
      <ProtectedRoute>
        <PunishmentsPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/changelog")) {
    return (
      <ProtectedRoute>
        <ChangelogPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/events")) {
    return (
      <ProtectedRoute>
        <EventsPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/rules")) {
    return <ProtectedRoute><RulesPage /></ProtectedRoute>
  }

  if (path.startsWith("/dashboard/gallery")) {
    return <ProtectedRoute roles={["staff", "admin"]}><GalleryAdminPage /></ProtectedRoute>
  }

  if (path.startsWith("/dashboard/backups")) {
    return <ProtectedRoute roles={["admin"]}><BackupsPage /></ProtectedRoute>
  }

  if (path.startsWith("/dashboard/suggestions")) {
    return <ProtectedRoute><SuggestionsPage /></ProtectedRoute>
  }

  if (path.startsWith("/dashboard/calculator")) {
    return <ProtectedRoute><CalculatorPage /></ProtectedRoute>
  }

  if (path.startsWith("/dashboard/taxes")) {
    return <ProtectedRoute><TaxesPage /></ProtectedRoute>
  }

  if (path.startsWith("/dashboard/finance")) {
    return <ProtectedRoute roles={["staff", "admin"]} allowCorpAccess><FinancePage /></ProtectedRoute>
  }

  if (path.startsWith("/dashboard/moderation")) {
    return (
      <ProtectedRoute roles={["staff", "admin"]}>
        <ModerationPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/staff-logs")) {
    return (
      <ProtectedRoute roles={["staff", "admin"]}>
        <StaffLogsPage />
      </ProtectedRoute>
    )
  }

  if (path.startsWith("/dashboard/staff")) {
    return (
      <ProtectedRoute roles={["staff", "admin"]}>
        <StaffPage />
      </ProtectedRoute>
    )
  }

  return <LoginRoute />
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppearanceProvider>
          <Router />
          <UpdateBanner />
        </AppearanceProvider>
      </AuthProvider>
    </RouterProvider>
  )
}
