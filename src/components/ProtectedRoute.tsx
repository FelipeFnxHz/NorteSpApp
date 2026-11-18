import { useEffect } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "@/contexts/RouterContext"
import { StatusPage } from "@/pages/StatusPage"
import type { UserRole } from "@/types"

interface ProtectedRouteProps {
  children: ReactNode
  roles?: UserRole[]
  /** Also let through members holding a corporation permission, even if `roles` doesn't list them. */
  allowCorpAccess?: boolean
}

export function ProtectedRoute({ children, roles, allowCorpAccess }: ProtectedRouteProps) {
  const { user, status, dashboardStatus, isStaff, hasAnyCorpAccess, corpAccessLoading } = useAuth()
  const { navigate } = useRouter()

  const shouldRedirectToLogin = status === "anonymous" || (status === "authenticated" && !user)
  const roleBlocked = status === "authenticated" && !!user && !!roles && !roles.includes(user.role)
  const waitingForCorpAccess = roleBlocked && !!allowCorpAccess && corpAccessLoading
  const shouldRedirectHome = roleBlocked && !waitingForCorpAccess && !(allowCorpAccess && hasAnyCorpAccess)

  useEffect(() => {
    if (shouldRedirectToLogin) navigate("/login", { replace: true })
    else if (shouldRedirectHome) navigate("/dashboard", { replace: true })
  }, [shouldRedirectToLogin, shouldRedirectHome, navigate])

  if (status === "loading" || waitingForCorpAccess) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="border-primary size-6 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    )
  }

  if (shouldRedirectToLogin || shouldRedirectHome || !user) return null

  if (!isStaff && (dashboardStatus === "maintenance" || dashboardStatus === "offline")) {
    return <StatusPage kind={dashboardStatus} />
  }

  return <>{children}</>
}
