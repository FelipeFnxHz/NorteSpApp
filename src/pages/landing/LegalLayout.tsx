import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowLeft, Clock3, List } from "lucide-react"
import { Link } from "@/components/ui/link"
import { BrandMark } from "@/components/ui/brand"
import { cn } from "@/lib/utils"
import { Footer } from "@/pages/landing/Footer"

export interface LegalSection {
  title: string
  content: ReactNode
}

interface LegalLayoutProps {
  title: string
  updatedAt: string
  intro: string
  sections: LegalSection[]
}

function sectionId(index: number) {
  return `secao-${index + 1}`
}

function TableOfContents({ sections, activeId, onNavigate }: { sections: LegalSection[]; activeId: string; onNavigate?: () => void }) {
  return (
    <ol className="flex flex-col gap-0.5 text-sm">
      {sections.map((section, index) => {
        const id = sectionId(index)
        const active = id === activeId
        return (
          <li key={section.title}>
            <a
              href={`#${id}`}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors",
                active ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
              )}
            >
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                  active ? "bg-primary text-primary-foreground" : "bg-white/[0.06]",
                )}
              >
                {index + 1}
              </span>
              <span className="truncate">{section.title}</span>
            </a>
          </li>
        )
      })}
    </ol>
  )
}

export function LegalLayout({ title, updatedAt, intro, sections }: LegalLayoutProps) {
  const [activeId, setActiveId] = useState(sectionId(0))
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = contentRef.current
    if (!container) return

    const headings = Array.from(container.querySelectorAll<HTMLElement>("section[id]"))
    const observer = new IntersectionObserver(
      entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActiveId(visible[0].target.id)
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    )

    headings.forEach(heading => observer.observe(heading))
    return () => observer.disconnect()
  }, [sections])

  return (
    <>
      <header className="border-border bg-background/80 sticky top-0 z-30 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6">
          <BrandMark to="/" />
          <Link to="/" className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm transition-colors">
            <ArrowLeft className="size-4" />
            Voltar ao início
          </Link>
        </div>
      </header>

      <div className="relative isolate overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 -z-10 opacity-40" />
        <div className="bg-primary/[0.1] pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[640px] -translate-x-1/2 rounded-full blur-[120px]" />

        <main className="mx-auto max-w-6xl px-5 py-10 sm:px-6 sm:py-14">
          <span className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
            <span className="bg-primary h-px w-6" />
            Legal
          </span>
          <h1 className="mt-4 text-3xl font-bold sm:text-4xl md:text-5xl">{title}</h1>
          <div className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
            <Clock3 className="size-3.5" />
            Última atualização: {updatedAt}
          </div>
          <p className="text-muted-foreground mt-6 max-w-2xl text-[15px] leading-relaxed">{intro}</p>

          <div className="mt-12 grid gap-10 lg:grid-cols-[240px_1fr]">
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <p className="text-muted-foreground mb-2 flex items-center gap-1.5 px-3 text-xs font-semibold tracking-wide uppercase">
                  <List className="size-3.5" />
                  Índice
                </p>
                <TableOfContents sections={sections} activeId={activeId} />
              </div>
            </aside>

            <details className="border-border bg-white/[0.02] rounded-2xl border p-2 lg:hidden">
              <summary className="text-foreground flex min-h-11 cursor-pointer items-center gap-2 px-3 py-2 text-sm font-semibold">
                <List className="size-4" />
                Índice
              </summary>
              <div className="px-1 pb-1">
                <TableOfContents sections={sections} activeId={activeId} />
              </div>
            </details>

            <div ref={contentRef} className="flex flex-col gap-12">
              {sections.map((section, index) => (
                <section key={section.title} id={sectionId(index)} className="scroll-mt-28">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="bg-primary/10 text-primary grid size-8 shrink-0 place-items-center rounded-lg text-xs font-bold">
                      {index + 1}
                    </span>
                    <h2 className="text-lg font-bold md:text-xl">{section.title}</h2>
                  </div>
                  <div className="text-muted-foreground space-y-3.5 text-[15px] sm:pl-11 leading-relaxed [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
                    {section.content}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </>
  )
}
