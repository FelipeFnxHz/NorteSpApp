import { BookOpenText } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { useRouter } from "@/contexts/RouterContext"
import { cn } from "@/lib/utils"

const RULES_PATH = "/dashboard/rules"

export function RulesShortcut() {
  const { path, navigate } = useRouter()
  const active = path.startsWith(RULES_PATH)

  return (
    <button
      type="button"
      onClick={() => navigate(RULES_PATH)}
      aria-label="Regras do servidor"
      aria-current={active ? "page" : undefined}
      title="Regras do servidor"
      className={cn(
        buttonVariants({ variant: "outline", size: "icon" }),
        "group transition-all duration-200 ease-out hover:-translate-y-px hover:border-primary/40 hover:bg-primary/10 hover:text-primary active:translate-y-0 active:scale-95",
        active && "border-primary/40 bg-primary/10 text-primary",
      )}
    >
      <BookOpenText className="size-4 transition-transform duration-200 group-hover:scale-110" />
    </button>
  )
}
