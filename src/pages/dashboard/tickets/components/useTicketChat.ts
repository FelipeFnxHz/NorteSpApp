import { useCallback, useEffect, useState } from "react"
import { ApiError } from "@/api/client"
import { useTicketRealtime } from "@/hooks/useTicketRealtime"
import { ticketsService } from "@/services/tickets.service"
import type { TicketMessage, UploadPayload } from "@/types"

function upsert(list: TicketMessage[], message: TicketMessage): TicketMessage[] {
  const index = list.findIndex(item => item.id === message.id)
  if (index >= 0) {
    const next = [...list]
    next[index] = message
    return next
  }
  return [...list, message].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

/** Histórico + mensagens em tempo real (SSE) de um ticket, com envio pela dashboard. */
export function useTicketChat(codigo: string) {
  const [messages, setMessages] = useState<TicketMessage[]>([])
  const [live, setLive] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (silent: boolean) => {
      if (!silent) setLoading(true)
      try {
        const result = await ticketsService.messages(codigo)
        setMessages(result.messages)
        setLive(result.live)
        setError(null)
      } catch (err) {
        setError(err instanceof ApiError ? err.message : "Falha ao carregar as mensagens.")
      } finally {
        setLoading(false)
      }
    },
    [codigo],
  )

  useEffect(() => {
    setMessages([])
    void load(false)
  }, [load])

  useTicketRealtime({
    onMessage: event => {
      if (event.codigo !== codigo) return
      if (event.kind === "delete") setMessages(current => current.filter(message => message.id !== event.id))
      else setMessages(current => upsert(current, event.message))
    },
    onReconnect: () => void load(true),
  })

  const send = useCallback(
    async (content: string, files: UploadPayload[]) => {
      const result = await ticketsService.send(codigo, content, files)
      if (result.message) setMessages(current => upsert(current, result.message!))
    },
    [codigo],
  )

  return { messages, live, loading, error, send, reload: () => load(true) }
}
