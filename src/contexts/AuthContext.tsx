import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError, realtimeStreamUrl } from '@/api/client'
import { authService } from '@/services/auth.service'
import { emitRealtime } from '@/lib/realtime-bus'
import { corporationsService } from '@/services/corporations.service'
import { userService } from '@/services/user.service'
import type { CorpPermission, DashboardConfig, DashboardStatus, DiscordRole, SessionUser } from '@/types'

type SessionStatus = 'loading' | 'authenticated' | 'anonymous'

interface AuthContextValue {
  user: SessionUser | null
  status: SessionStatus
  dashboardStatus: DashboardStatus | null
  dashboardConfig: DashboardConfig
  isStaff: boolean
  isAdmin: boolean
  corpAccessLoading: boolean
  discordRole: DiscordRole | null
  discordRoleLoading: boolean
  isInAnyCorp: boolean
  memberCorpSlugs: string[]
  refreshCorpAccess: () => void
  corpVersion: number
  hasAnyCorpAccess: boolean
  isCorpMember: (slug: string) => boolean
  hasAnyPermissionIn: (slug: string) => boolean
  hasCorpPermission: (slug: string, permission: CorpPermission) => boolean
  refresh: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [status, setStatus] = useState<SessionStatus>('loading')
  const [dashboardStatus, setDashboardStatus] = useState<DashboardStatus | null>(null)
  const [dashboardConfig, setDashboardConfig] = useState<DashboardConfig>({})
  const [tick, setTick] = useState(0)
  const [corpPermissions, setCorpPermissions] = useState<Record<string, CorpPermission[]>>({})
  const [memberOf, setMemberOf] = useState<string[]>([])
  const [corpTick, setCorpTick] = useState(0)
  const [corpVersion, setCorpVersion] = useState(0)
  const [roleTick, setRoleTick] = useState(0)
  const userId = user?.id ?? null
  const notifyRef = useRef(false)
  const snapshotRef = useRef<string | null>(null)
  const corpStateRef = useRef({ isPrivileged: false, memberOf: [] as string[] })
  const [corpLoadedFor, setCorpLoadedFor] = useState<string | null>(null)
  const [discordRole, setDiscordRole] = useState<DiscordRole | null>(null)
  const [roleLoadedFor, setRoleLoadedFor] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      setStatus('loading')

      try {
        const [{ user: sessionUser }, statusInfo, config] = await Promise.all([
          authService.me(),
          authService.status().catch(() => ({ status: 'online' as const })),
          authService.config().catch(() => ({})),
        ])

        if (cancelled) return

        setUser(sessionUser)
        setDashboardStatus(statusInfo.status)
        setDashboardConfig(config)
        setStatus('authenticated')
      } catch {
        if (cancelled) return
        setUser(null)
        setStatus('anonymous')
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
  }, [tick])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    corporationsService
      .myPermissions()
      .catch(() => new Promise(resolve => setTimeout(resolve, 1200)).then(() => corporationsService.myPermissions()))
      .then(result => {
        if (cancelled) return
        setCorpPermissions(result.bySlug)
        setMemberOf(result.memberOf ?? [])

        const snapshot = JSON.stringify(result)
        const changed = snapshotRef.current !== null && snapshotRef.current !== snapshot
        snapshotRef.current = snapshot
        if (corpTick > 0 && (notifyRef.current || changed)) setCorpVersion(value => value + 1)
      })
      .catch(() => {
        if (cancelled) return
        if (snapshotRef.current === null) {
          setCorpPermissions({})
          setMemberOf([])
        }
      })
      .finally(() => {
        notifyRef.current = false
        if (!cancelled) setCorpLoadedFor(user.id)
      })

    return () => {
      cancelled = true
    }
  }, [userId, tick, corpTick])

  useEffect(() => {
    if (!user) {
      setDiscordRole(null)
      setRoleLoadedFor(null)
      return
    }
    let cancelled = false

    userService
      .discordRole()
      .then(result => {
        if (!cancelled) setDiscordRole(result.role)
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setRoleLoadedFor(user.id)
      })

    return () => {
      cancelled = true
    }
  }, [userId, tick, roleTick])

  const syncUser = useCallback(async () => {
    try {
      const { user: fresh } = await authService.me()
      setUser(previous => (previous && JSON.stringify(previous) === JSON.stringify(fresh) ? previous : fresh))
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null)
        setStatus('anonymous')
      }
    }
  }, [])

  const refreshCorpAccess = useCallback(() => {
    notifyRef.current = true
    setCorpTick(value => value + 1)
  }, [])

  corpStateRef.current = {
    isPrivileged: user?.role === 'staff' || user?.role === 'admin',
    memberOf,
  }

  useEffect(() => {
    if (!user) return

    const stream = new EventSource(realtimeStreamUrl(), { withCredentials: true })
    let connectedOnce = false
    let lastSync = 0

    let pending: ReturnType<typeof setTimeout> | null = null
    const syncAccess = (notify: boolean) => {
      notifyRef.current = notifyRef.current || notify
      if (pending) clearTimeout(pending)
      pending = setTimeout(() => {
        pending = null
        lastSync = Date.now()
        void syncUser()
        setRoleTick(value => value + 1)
        setCorpTick(value => value + 1)
      }, 200)
    }

    stream.addEventListener('ready', () => {
      if (connectedOnce) {
        syncAccess(false)
        emitRealtime('stream-reconnected', {})
      }
      connectedOnce = true
    })

    stream.addEventListener('ticket-changed', event => {
      try {
        emitRealtime('ticket-changed', JSON.parse((event as MessageEvent<string>).data))
      } catch {}
    })
    stream.addEventListener('ticket-message', event => {
      try {
        emitRealtime('ticket-message', JSON.parse((event as MessageEvent<string>).data))
      } catch {}
    })

    stream.addEventListener('notification', event => {
      try {
        emitRealtime('notification', JSON.parse((event as MessageEvent<string>).data))
      } catch {}
    })
    for (const name of ['store-catalog', 'store-coupons', 'store-order', 'store-log', 'whitelist-changed', 'punishments-changed', 'changelog-changed', 'events-changed', 'analytics-changed', 'gallery-changed', 'backups-changed', 'server-status', 'suggestions-changed', 'vault-changed', 'whitelist-status', 'taxes-changed', 'profile-changed', 'rules-changed', 'staff-changed', 'factions-changed'] as const) {
      stream.addEventListener(name, event => {
        try {
          emitRealtime(name, JSON.parse((event as MessageEvent<string>).data))
        } catch {}
      })
    }
    stream.addEventListener('notifications-read', event => {
      try {
        emitRealtime('notifications-read', JSON.parse((event as MessageEvent<string>).data))
      } catch {}
    })

    stream.addEventListener('preferences-changed', event => {
      try {
        emitRealtime('preferences-changed', JSON.parse((event as MessageEvent<string>).data))
      } catch {}
    })

    stream.addEventListener('corp-access', () => syncAccess(true))
    stream.addEventListener('session', () => syncAccess(true))
    stream.addEventListener('session-revoked', () => syncAccess(false))

    stream.addEventListener('dashboard-changed', () => {
      void Promise.all([
        authService.status().catch(() => null),
        authService.config().catch(() => null),
      ]).then(([statusInfo, config]) => {
        if (statusInfo) setDashboardStatus(statusInfo.status)
        if (config) setDashboardConfig(config)
      })
    })

    stream.addEventListener('corp-changed', event => {
      let slug: string | undefined
      try {
        slug = (JSON.parse((event as MessageEvent<string>).data) as { corpSlug?: string }).corpSlug
      } catch {}
      const { isPrivileged, memberOf: slugs } = corpStateRef.current
      if (isPrivileged || !slug || slugs.includes(slug)) setCorpVersion(value => value + 1)
    })

    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - lastSync > 15_000) syncAccess(false)
    }
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)

    return () => {
      if (pending) clearTimeout(pending)
      stream.close()
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [userId, syncUser])

  const refresh = useCallback(() => setTick(value => value + 1), [])

  const logout = useCallback(async () => {
    await authService.logout().catch((err: unknown) => {
      if (!(err instanceof ApiError && err.status === 401)) throw err
    })
    setUser(null)
    setStatus('anonymous')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      dashboardStatus,
      dashboardConfig,
      isStaff: user?.role === 'staff' || user?.role === 'admin',
      isAdmin: user?.role === 'admin',
      corpAccessLoading: !!user && corpLoadedFor !== user.id,
      discordRole,
      discordRoleLoading: !!user && roleLoadedFor !== user.id,
      isInAnyCorp: memberOf.length > 0,
      memberCorpSlugs: memberOf,
      refreshCorpAccess,
      corpVersion,
      hasAnyCorpAccess: user?.role === 'staff' || user?.role === 'admin' || memberOf.length > 0,
      isCorpMember: slug => user?.role === 'staff' || user?.role === 'admin' || memberOf.includes(slug),
      hasAnyPermissionIn: slug =>
        user?.role === 'staff' || user?.role === 'admin' || (corpPermissions[slug]?.length ?? 0) > 0,
      hasCorpPermission: (slug, permission) =>
        user?.role === 'staff' || user?.role === 'admin' || !!corpPermissions[slug]?.includes(permission),
      refresh,
      logout,
    }),
    [user, status, dashboardStatus, dashboardConfig, corpPermissions, memberOf, corpLoadedFor, discordRole, roleLoadedFor, refresh, refreshCorpAccess, corpVersion, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}