import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Dispara `refetch` (silencioso: mantém os dados na tela) sempre que algo muda numa
 * corporação em tempo real — contratação, demissão, patente, permissões, status.
 * Não executa na montagem inicial.
 */
export function useCorpRealtime(...refetchers: Array<() => void>) {
  const { corpVersion } = useAuth()
  const refetchersRef = useRef(refetchers)
  refetchersRef.current = refetchers
  const lastVersion = useRef(corpVersion)

  useEffect(() => {
    if (lastVersion.current === corpVersion) return
    lastVersion.current = corpVersion
    refetchersRef.current.forEach(refetch => refetch())
  }, [corpVersion])
}
