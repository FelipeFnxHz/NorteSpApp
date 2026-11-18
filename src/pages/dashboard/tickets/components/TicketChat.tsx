import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { FileText, Loader2, MessageSquareDashed, Radio, Send, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorState } from "@/components/ui/states"
import { ApiError } from "@/api/client"
import { useFileUploads } from "@/hooks/useFileUploads"
import type { TicketMessage } from "@/types"
import { cn } from "@/lib/utils"
import { formatDateTime, formatTime } from "../ticket-meta"
import { FilePicker } from "./FilePicker"
import { useTicketChat } from "./useTicketChat"

const GROUP_WINDOW_MS = 5 * 60_000

function MessageAttachments({ message }: { message: TicketMessage }) {
  if (message.attachments.length === 0) return null
  return (
    <div className="mt-1.5 flex flex-wrap gap-2">
      {message.attachments.map(file =>
        file.isImage ? (
          <a key={file.url} href={file.url} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-lg border border-white/10">
            <img src={file.url} alt={file.name} loading="lazy" className="max-h-52 max-w-full object-cover" />
          </a>
        ) : (
          <a
            key={file.url}
            href={file.url}
            target="_blank"
            rel="noreferrer"
            className="hover:bg-white/[0.08] flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs"
          >
            <FileText className="text-muted-foreground size-4" />
            <span className="max-w-[200px] truncate">{file.name}</span>
          </a>
        ),
      )}
    </div>
  )
}

function MessageRow({ message, grouped }: { message: TicketMessage; grouped: boolean }) {
  if (message.system) {
    return (
      <div className="text-muted-foreground my-2 flex items-center justify-center gap-2 text-center text-xs">
        <ShieldCheck className="size-3.5 shrink-0" />
        <span className="max-w-[90%] break-words">{message.content.replace(/<@!?\d+>/g, "@usuário").replace(/<[^>]+>/g, "")}</span>
      </div>
    )
  }

  return (
    <div className={cn("flex gap-3 px-1", grouped ? "mt-0.5" : "mt-4")}>
      <div className="w-9 shrink-0">
        {!grouped && <img src={message.avatar} alt="" className="size-9 rounded-full bg-white/10 object-cover" />}
      </div>
      <div className="min-w-0 flex-1">
        {!grouped && (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold">{message.authorName}</span>
            {message.isStaff && (
              <span className="bg-primary/15 text-primary rounded px-1.5 py-px text-[10px] font-bold tracking-wide uppercase">Staff</span>
            )}
            {message.viaDashboard && <span className="text-muted-foreground text-[10px]">via dashboard</span>}
            <span className="text-muted-foreground text-[11px]" title={formatDateTime(message.createdAt)}>
              {formatTime(message.createdAt)}
            </span>
          </div>
        )}
        {message.content && (
          <p className="text-foreground/90 text-sm leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
            {message.editedAt && <span className="text-muted-foreground ml-1.5 text-[10px]">(editada)</span>}
          </p>
        )}
        <MessageAttachments message={message} />
      </div>
    </div>
  )
}

function Composer({ onSend }: { onSend: (content: string, files: ReturnType<typeof useFileUploads>["files"]) => Promise<void> }) {
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const uploads = useFileUploads(4)

  async function submit() {
    const content = text.trim()
    if (sending || (!content && uploads.files.length === 0)) return
    setSending(true)
    setError(null)
    try {
      await onSend(content, uploads.files)
      setText("")
      uploads.clear()
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Não foi possível enviar a mensagem.")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex flex-col gap-2 border-t border-white/10 p-3 sm:p-4">
      <FilePicker files={uploads.files} error={uploads.error} onAdd={uploads.add} onRemove={uploads.remove} label="Anexar" disabled={sending} />
      <div className="flex items-end gap-2">
        <textarea
          value={text}
          rows={1}
          maxLength={2000}
          disabled={sending}
          placeholder="Escreva uma mensagem... (Enter envia, Shift+Enter quebra linha)"
          aria-label="Mensagem"
          onChange={event => setText(event.target.value)}
          onKeyDown={event => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              void submit()
            }
          }}
          className="border-input placeholder:text-muted-foreground/70 focus:border-primary/50 focus:ring-primary/15 max-h-36 min-h-10 flex-1 resize-none rounded-xl border bg-white/[0.03] px-3.5 py-2.5 text-sm outline-none transition-all duration-150 [field-sizing:content] focus:bg-white/[0.05] focus:ring-4"
        />
        <Button type="button" size="icon-lg" disabled={sending || (!text.trim() && uploads.files.length === 0)} onClick={() => void submit()} aria-label="Enviar">
          {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        </Button>
      </div>
      {error && <p className="text-destructive text-xs">{error}</p>}
    </div>
  )
}

export function TicketChat({ codigo, canReply }: { codigo: string; canReply: boolean }) {
  const { messages, live, loading, error, send, reload } = useTicketChat(codigo)
  const scrollRef = useRef<HTMLDivElement>(null)
  const stickRef = useRef(true)

  useLayoutEffect(() => {
    const element = scrollRef.current
    if (element && stickRef.current) element.scrollTop = element.scrollHeight
  }, [messages])

  useEffect(() => {
    stickRef.current = true
  }, [codigo])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5 text-xs">
        <span className="text-muted-foreground font-medium">{live ? "Conversa sincronizada com o Discord" : "Histórico do atendimento (transcript)"}</span>
        {live && (
          <span className="text-accent flex items-center gap-1.5 font-semibold">
            <Radio className="size-3.5 animate-pulse" />
            Ao vivo
          </span>
        )}
      </div>

      <div
        ref={scrollRef}
        onScroll={event => {
          const el = event.currentTarget
          stickRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
        }}
        className="min-h-0 flex-1 overflow-y-auto px-3 py-2 sm:px-4 [scrollbar-color:rgb(255_255_255/0.18)_transparent] [scrollbar-width:thin]"
      >
        {loading && (
          <div className="flex flex-col gap-4 py-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}
        {error && <ErrorState message={error} onRetry={reload} />}
        {!loading && !error && messages.length === 0 && (
          <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 py-10 text-sm">
            <MessageSquareDashed className="size-6" />
            Nenhuma mensagem ainda.
          </div>
        )}
        {messages.map((message, index) => {
          const previous = messages[index - 1]
          const grouped =
            !!previous &&
            !previous.system &&
            !message.system &&
            previous.authorId === message.authorId &&
            new Date(message.createdAt).getTime() - new Date(previous.createdAt).getTime() < GROUP_WINDOW_MS
          return <MessageRow key={message.id} message={message} grouped={grouped} />
        })}
      </div>

      {live && canReply ? (
        <Composer onSend={(content, files) => send(content, files.map(({ name, data }) => ({ name, data })))} />
      ) : (
        <div className="text-muted-foreground border-t border-white/10 px-4 py-3 text-center text-xs">
          {live ? "Você não pode responder este ticket." : "Este atendimento foi finalizado."}
        </div>
      )}
    </div>
  )
}
