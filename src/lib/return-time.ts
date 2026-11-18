const WEEKDAY_TIME = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" })
const FULL = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** "hoje às 22:00", "amanhã às 08:30" ou "12/11 às 14:00". */
export function formatReturnAt(returnAt: number, now = Date.now()): string {
  const target = new Date(returnAt)
  const today = new Date(now)
  const tomorrow = new Date(now + 86_400_000)
  if (sameDay(target, today)) return `hoje às ${WEEKDAY_TIME.format(target)}`
  if (sameDay(target, tomorrow)) return `amanhã às ${WEEKDAY_TIME.format(target)}`
  return FULL.format(target).replace(",", " às")
}

/** "em 2h 15min", "em 8min" ou null quando já passou. */
export function formatCountdown(returnAt: number, now = Date.now()): string | null {
  const diff = returnAt - now
  if (diff <= 0) return null
  const minutes = Math.ceil(diff / 60_000)
  if (minutes < 60) return `em ${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `em ${hours}h${minutes % 60 ? ` ${minutes % 60}min` : ""}`
  const days = Math.floor(hours / 24)
  return `em ${days}d${hours % 24 ? ` ${hours % 24}h` : ""}`
}

/** Valor para <input type="datetime-local"> (fuso do navegador). */
export function toLocalInputValue(epoch: number | null | undefined): string {
  if (!epoch) return ""
  const date = new Date(epoch)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
