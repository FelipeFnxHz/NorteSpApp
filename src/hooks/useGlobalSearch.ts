import { useEffect, useState } from "react"
import { dashboardService } from "@/services/dashboard.service"
import type { SearchResults } from "@/types"

const EMPTY: SearchResults = { tickets: [], transcripts: [], staff: [], feedback: [] }

export function useGlobalSearch(query: string) {
  const [results, setResults] = useState<SearchResults>(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults(EMPTY)
      setLoading(false)
      return
    }

    setLoading(true)
    const timeout = setTimeout(() => {
      dashboardService
        .search(trimmed)
        .then(setResults)
        .catch(() => setResults(EMPTY))
        .finally(() => setLoading(false))
    }, 300)

    return () => clearTimeout(timeout)
  }, [query])

  return { results, loading }
}
