import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow: string
  title: string
  description?: string
  align?: "center" | "left"
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      <span className="text-primary inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] uppercase">
        <span className="bg-primary h-px w-6" />
        {eyebrow}
      </span>
      <h2 className="mt-4 text-3xl leading-[1.1] font-bold text-balance md:text-[42px]">{title}</h2>
      {description && <p className="text-muted-foreground mt-4 text-base leading-relaxed text-pretty">{description}</p>}
    </div>
  )
}
