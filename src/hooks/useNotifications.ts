import { useCallback, useEffect, useRef, useState } from "react"
import { ApiError } from "@/api/client"
import { onRealtime } from "@/lib/realtime-bus"
import { notificationsService } from "@/services/notifications.service"
import type { NotificationItem } from "@/types"

const MAX_ITEMS = 30

function upsert(list: NotificationItem[], item: NotificationItem): NotificationItem[] {
  const index = list.findIndex(current => current.id === item.id)
  const next = index >= 0 ? list.map((current, i) => (i === index ? item : current)) : [item, ...list]
  return next.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, MAX_ITEMS)
}

/** Lista de notificações do usuário: carga inicial + novas chegando por SSE, sem F5. */
export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [arrivals, setArrivals] = useState(0)
  const loadedRef = useRef(false)

  const load = useCallback(async (silent: boolean) => {
    if (!silent) setLoading(true)
    try {
      const { notifications } = await notificationsService.list()
      // Mescla com o que já chegou por SSE durante a carga (evita perder/duplicar).
      setItems(current => notifications.reduce((acc, item) => upsert(acc, item), current).slice(0, MAX_ITEMS))
      setError(null)
      loadedRef.current = true
    } catch (err) {
      if (!silent || !loadedRef.current) setError(err instanceof ApiError ? err.message : "Falha ao carregar.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(false)
  }, [load])

  useEffect(() => {
    const offs = [
      onRealtime("notification", ({ notification }) => {
        setItems(current => upsert(current, notification))
        setArrivals(count => count + 1)
      }),
      onRealtime("notifications-read", ({ all, ids }) => {
        setItems(current => current.map(item => (all || ids?.includes(item.id) ? { ...item, read: true } : item)))
      }),
      // Conexão caiu e voltou: busca o que possa ter sido perdido nesse intervalo.
      onRealtime("stream-reconnected", () => void load(true)),
    ]
    return () => offs.forEach(off => off())
  }, [load])

  const markRead = useCallback(async (id: string) => {
    setItems(current => current.map(item => (item.id === id ? { ...item, read: true } : item)))
    await notificationsService.markRead(id).catch(() => void load(true))
  }, [load])

  const markAllRead = useCallback(async () => {
    setItems(current => current.map(item => ({ ...item, read: true })))
    await notificationsService.markAllRead().catch(() => void load(true))
  }, [load])

  const unreadCount = items.filter(item => !item.read).length

  return { items, loading, error, unreadCount, arrivals, markRead, markAllRead, reload: () => load(false) }
}
