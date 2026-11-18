import { Link } from "@/components/ui/link"
import { cn } from "@/lib/utils"

interface BrandMarkProps {
  to?: string
  logoUrl?: string
  caption?: string
  className?: string
}

export function BrandMark({ to, logoUrl, caption, className }: BrandMarkProps) {
  const content = (
    <>
      <span className="relative shrink-0">
        <img
          src={logoUrl || "/logo.png"}
          alt=""
          className="size-9 rounded-[10px] object-cover ring-1 ring-white/10"
        />
        <span className="bg-primary/25 absolute inset-0 -z-10 rounded-[10px] blur-lg" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[17px] font-bold tracking-tight">
          NorteSp <span className="text-primary">Roleplay</span>
        </span>
        {caption && (
          <span className="text-muted-foreground mt-1 text-[10px] font-semibold tracking-[0.18em] uppercase">
            {caption}
          </span>
        )}
      </span>
    </>
  )

  const classes = cn("flex items-center gap-3", className)
  return to ? (
    <Link to={to} className={classes}>
      {content}
    </Link>
  ) : (
    <div className={classes}>{content}</div>
  )
}
