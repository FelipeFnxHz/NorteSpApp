import { useEffect, useMemo, useRef, useState } from "react"
import type { ReactNode } from "react"
import { CornerDownLeft, FileText, Loader2, MessageSquare, Search, Ticket, User as UserIcon, X } from "lucide-react"
import { useGlobalSearch } from "@/hooks/useGlobalSearch"
import { useRouter } from "@/contexts/RouterContext"
import { cn } from "@/lib/utils"

type Tone = "primary" | "blue" | "violet" | "accent"

const TONE_CLASS: Record<Tone, string> = {
  primary: "bg-primary/12 text-primary",
  blue: "bg-[#4c8dff]/12 text-[#4c8dff]",
  violet: "bg-[#a78bfa]/12 text-[#a78bfa]",
  accent: "bg-accent/12 text-accent",
}

interface SearchEntry {
  id: string
  group: string
  icon: typeof Ticket
  tone: Tone
  title: string
  subtitle: string
  path: string
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function Highlight({ text, query }: { text: string; query: string }) {
  const term = query.trim()
  if (!term) return <>{text}</>

  const parts = text.split(new RegExp(`(${escapeRegExp(term)})`, "ig"))
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <span key={index} className="text-primary font-semibold">
            {part}
          </span>
        ) : (
          <span key={index}>{part}</span>
        ),
      )}
    </>
  )
}

export function GlobalSearch({ autoFocus = false, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const { results, loading } = useGlobalSearch(query)
  const { navigate } = useRouter()

  const entries = useMemo<SearchEntry[]>(
    () => [
      ...results.tickets.slice(0, 5).map(ticket => ({
        id: `ticket-${ticket._id}`,
        group: "Tickets",
        icon: Ticket,
        tone: "primary" as const,
        title: ticket.codigo,
        subtitle: ticket.motivo ?? ticket.type,
        path: "/dashboard/tickets",
      })),
      ...results.transcripts.slice(0, 5).map(transcript => ({
        id: `transcript-${transcript._id}`,
        group: "Transcripts",
        icon: FileText,
        tone: "blue" as const,
        title: transcript.codigo,
        subtitle: transcript.typeLabel,
        path: "/dashboard/transcripts",
      })),
      ...results.staff.slice(0, 5).map(member => ({
        id: `staff-${member.id}`,
        group: "Staff",
        icon: UserIcon,
        tone: "violet" as const,
        title: member.displayName,
        subtitle: `@${member.username}`,
        path: "/dashboard/staff",
      })),
      ...results.feedback.slice(0, 5).map(item => ({
        id: `feedback-${item._id}`,
        group: "Feedback",
        icon: MessageSquare,
        tone: "accent" as const,
        title: item.staffName || "Staff",
        subtitle: item.comment || "Sem comentário",
        path: "/dashboard/feedback",
      })),
    ],
    [results],
  )

  useEffect(() => setActive(0), [entries])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)

      if ((event.key === "/" && !typing) || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k")) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  function goTo(path: string) {
    setOpen(false)
    setQuery("")
    inputRef.current?.blur()
    navigate(path)
    onDone?.()
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (entries.length === 0) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActive(current => (current + 1) % entries.length)
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive(current => (current - 1 + entries.length) % entries.length)
    } else if (event.key === "Enter") {
      event.preventDefault()
      goTo(entries[active].path)
    }
  }

  const trimmed = query.trim()
  const panelOpen = open && trimmed.length > 0

  const groups: Array<{ label: string; items: Array<{ entry: SearchEntry; index: number }> }> = []
  entries.forEach((entry, index) => {
    const last = groups[groups.length - 1]
    if (last && last.label === entry.group) last.items.push({ entry, index })
    else groups.push({ label: entry.group, items: [{ entry, index }] })
  })

  return (
    <div className="relative w-full sm:w-[22rem] lg:w-[28rem]">
      <div
        className={cn(
          "group flex h-10 items-center gap-2.5 rounded-xl border px-3.5 transition-all duration-200",
          "bg-white/[0.03] hover:bg-white/[0.05]",
          open
            ? "border-primary/50 bg-white/[0.06] ring-primary/15 shadow-[0_0_24px_-6px_var(--glow)] ring-4"
            : "border-white/10 hover:border-white/20",
        )}
      >
        {loading && trimmed ? (
          <Loader2 className="text-primary size-4 shrink-0 animate-spin" />
        ) : (
          <Search className={cn("size-4 shrink-0 transition-colors", open ? "text-primary" : "text-muted-foreground")} />
        )}

        <input
          ref={inputRef}
          autoFocus={autoFocus}
          value={query}
          onChange={event => {
            setQuery(event.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => { setOpen(false); onDone?.() }, 150)}
          onKeyDown={onInputKeyDown}
          placeholder="Pesquisar tickets, transcripts, staff..."
          aria-label="Pesquisa global"
          autoComplete="off"
          spellCheck={false}
          className="placeholder:text-muted-foreground/70 min-w-0 flex-1 bg-transparent text-sm outline-none"
        />

        {query ? (
          <button
            type="button"
            onMouseDown={event => event.preventDefault()}
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            aria-label="Limpar pesquisa"
            className="text-muted-foreground hover:text-foreground grid size-7 shrink-0 place-items-center rounded-md transition-colors hover:bg-white/10"
          >
            <X className="size-3.5" />
          </button>
        ) : (
          <kbd className="text-muted-foreground/80 hidden shrink-0 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[10px] leading-none sm:block">
            /
          </kbd>
        )}
      </div>

      {panelOpen && (
        <div className="bg-popover/95 border-border animate-fade-up absolute top-[calc(100%+10px)] right-0 left-0 z-50 overflow-hidden rounded-2xl border shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="max-h-[min(26rem,60dvh)] overflow-y-auto p-2">
            {loading && entries.length === 0 && (
              <p className="text-muted-foreground flex items-center justify-center gap-2 p-6 text-sm">
                <Loader2 className="size-4 animate-spin" />
                Buscando...
              </p>
            )}

            {!loading && entries.length === 0 && (
              <div className="flex flex-col items-center gap-1.5 p-8 text-center">
                <span className="bg-white/[0.05] text-muted-foreground grid size-10 place-items-center rounded-full">
                  <Search className="size-4" />
                </span>
                <p className="text-sm font-medium">Nenhum resultado</p>
                <p className="text-muted-foreground text-xs">Nada encontrado para "{trimmed}".</p>
              </div>
            )}

            {groups.map(group => (
              <SearchGroup key={group.label} label={group.label}>
                {group.items.map(({ entry, index }) => (
                  <SearchResultItem
                    key={entry.id}
                    entry={entry}
                    query={trimmed}
                    active={index === active}
                    onHover={() => setActive(index)}
                    onClick={() => goTo(entry.path)}
                  />
                ))}
              </SearchGroup>
            ))}
          </div>

          {entries.length > 0 && (
            <div className="border-border text-muted-foreground/80 flex items-center gap-4 border-t bg-black/20 px-4 py-2 text-[11px]">
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 font-mono">↑↓</kbd>
                navegar
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 font-mono">
                  <CornerDownLeft className="inline size-2.5" />
                </kbd>
                abrir
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-white/10 bg-white/[0.04] px-1 font-mono">esc</kbd>
                fechar
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SearchGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="py-1">
      <p className="text-muted-foreground px-3 pt-1 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase">{label}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function SearchResultItem({
  entry,
  query,
  active,
  onHover,
  onClick,
}: {
  entry: SearchEntry
  query: string
  active: boolean
  onHover: () => void
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onMouseDown={event => event.preventDefault()}
      onMouseEnter={onHover}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
        active ? "bg-white/[0.07]" : "hover:bg-white/[0.04]",
      )}
    >
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg", TONE_CLASS[entry.tone])}>
        <entry.icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">
          <Highlight text={entry.title} query={query} />
        </span>
        <span className="text-muted-foreground block truncate text-xs">{entry.subtitle}</span>
      </span>
      {active && <CornerDownLeft className="text-muted-foreground size-3.5 shrink-0" />}
    </button>
  )
}
