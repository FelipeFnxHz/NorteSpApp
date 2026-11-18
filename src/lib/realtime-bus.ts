import type { NotificationItem, TicketMessage } from "@/types"
import type { AppearancePrefs } from "@/lib/appearance"
import type { ServerStatus } from "@/types/modules"

export interface RealtimeEvents {
  "ticket-changed": { codigo: string; reason: "created" | "claimed" | "dropped" | "closed" | "deleted" }
  "ticket-message":
    | { codigo: string; kind: "create" | "update"; message: TicketMessage }
    | { codigo: string; kind: "delete"; id: string }
  notification: { notification: NotificationItem }
  "notifications-read": { all?: boolean; ids?: string[] }
  "preferences-changed": { appearance: AppearancePrefs }
  "store-catalog": Record<string, never>
  "store-coupons": Record<string, never>
  "store-order": { code: string; status: string; delivery: string }
  "store-log": Record<string, never>
  "whitelist-changed": Record<string, never>
  "punishments-changed": Record<string, never>
  "changelog-changed": { id?: string; kind?: "created" | "updated" | "deleted" }
  "events-changed": { id?: string; kind?: "created" | "updated" | "cancelled" }
  "analytics-changed": Record<string, never>
  "gallery-changed": { kind?: "uploaded" | "removed" }
  "backups-changed": Record<string, never>
  "server-status": ServerStatus
  "suggestions-changed": { id?: string; kind?: "created" | "voted" | "status" | "deleted" }
  "vault-changed": { corpSlug?: string; scope?: "faction" }
  "factions-changed": { slug?: string; kind?: string }
  "whitelist-status": { open: boolean; byName?: string; at?: string }
  "taxes-changed": { corpSlug?: string }
  "profile-changed": Record<string, never>
  "rules-changed": { type?: string; kind?: "created" | "updated" | "reordered" | "deleted" }
  "staff-changed": Record<string, never>
  "stream-reconnected": Record<string, never>
}

type Listener<K extends keyof RealtimeEvents> = (payload: RealtimeEvents[K]) => void

const listeners = new Map<string, Set<Listener<never>>>()

export function onRealtime<K extends keyof RealtimeEvents>(event: K, listener: Listener<K>): () => void {
  const set = listeners.get(event) ?? new Set()
  set.add(listener as Listener<never>)
  listeners.set(event, set)
  return () => {
    set.delete(listener as Listener<never>)
  }
}

export function emitRealtime<K extends keyof RealtimeEvents>(event: K, payload: RealtimeEvents[K]): void {
  listeners.get(event)?.forEach(listener => (listener as Listener<K>)(payload))
}
