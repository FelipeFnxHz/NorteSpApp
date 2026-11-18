import type { ReactNode } from "react"

function inline(text: string, keyBase: string): ReactNode[] {
  const parts: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*\n]+\*|_[^_\n]+_|`[^`\n]+`)/g
  let last = 0
  let index = 0

  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0
    if (start > last) parts.push(text.slice(last, start))
    const token = match[0]
    const key = `${keyBase}-${index++}`
    if (token.startsWith("**")) parts.push(<strong key={key} className="text-foreground font-semibold">{token.slice(2, -2)}</strong>)
    else if (token.startsWith("__")) parts.push(<u key={key}>{token.slice(2, -2)}</u>)
    else if (token.startsWith("`")) parts.push(<code key={key} className="rounded bg-white/[0.08] px-1.5 py-0.5 font-mono text-[0.85em]">{token.slice(1, -1)}</code>)
    else parts.push(<em key={key}>{token.slice(1, -1)}</em>)
    last = start + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

export function RuleText({ text }: { text: string }) {
  const blocks: ReactNode[] = []
  let list: string[] = []

  const flush = (key: number) => {
    if (!list.length) return
    blocks.push(
      <ul key={`ul-${key}`} className="my-2 list-disc space-y-1 pl-5 marker:text-white/30">
        {list.map((item, i) => <li key={i}>{inline(item, `li-${key}-${i}`)}</li>)}
      </ul>,
    )
    list = []
  }

  text.split("\n").forEach((line, i) => {
    const bullet = line.match(/^\s*[-•*]\s+(.*)$/)
    if (bullet) return void list.push(bullet[1])
    flush(i)
    if (line.trim() === "") return
    const quote = line.match(/^>\s?(.*)$/)
    blocks.push(
      quote
        ? <blockquote key={i} className="border-primary/40 my-2 border-l-2 pl-3 italic">{inline(quote[1], `q-${i}`)}</blockquote>
        : <p key={i} className="my-2 first:mt-0 last:mb-0">{inline(line, `p-${i}`)}</p>,
    )
  })
  flush(text.length)

  return <div className="text-foreground/80 max-w-[68ch] text-[15px] leading-7 break-words">{blocks}</div>
}
