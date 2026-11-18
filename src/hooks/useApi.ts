import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiError } from '@/api/client'

interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const silentRef = useRef(false)
  const hasDataRef = useRef(false)

  const refetch = useCallback(() => {
    silentRef.current = hasDataRef.current
    setTick(value => value + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    if (!silentRef.current) setLoading(true)
    silentRef.current = false
    setError(null)

    fetcher()
      .then(result => {
        if (!cancelled) {
          hasDataRef.current = true
          setData(result)
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof ApiError ? err.message : 'Falha ao carregar dados.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [...deps, tick])

  return { data, loading, error, refetch }
}