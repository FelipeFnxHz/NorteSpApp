import { HeartHandshake, ShieldCheck, Sparkles } from "lucide-react"
import { ToneIcon, type Tone } from "@/components/ui/tone-icon"
import { SectionHeading } from "./SectionHeading"

const POINTS: { icon: typeof Sparkles; title: string; text: string; tone: Tone }[] = [
  {
    icon: ShieldCheck,
    title: "Staff presente",
    tone: "sky",
    text: "Equipe ativa todos os dias, com atendimento rápido via ticket e moderação justa.",
  },
  {
    icon: Sparkles,
    title: "Sistemas próprios",
    tone: "orange",
    text: "Economia, empresas e corporações desenvolvidas sob medida para a nossa cidade.",
  },
  {
    icon: HeartHandshake,
    title: "Comunidade em primeiro lugar",
    tone: "rose",
    text: "Decisões importantes passam pela comunidade. Feedback sempre é ouvido.",
  },
]

export function About() {
  return (
    <section id="sobre" className="border-border/70 border-t py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl gap-14 px-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <SectionHeading
          align="left"
          eyebrow="Sobre nós"
          title="Séria, organizada e divertida."
          description="A NorteSp Roleplay nasceu da vontade de criar uma cidade de FiveM em que cada jogador tem espaço para construir a própria história — com regras claras e uma staff que responde."
        />

        <div className="flex flex-col gap-3">
          {POINTS.map(point => (
            <div
              key={point.title}
              className="border-border hover:border-white/15 flex gap-4 rounded-2xl border bg-white/[0.02] p-5 transition-colors"
            >
              <ToneIcon icon={point.icon} tone={point.tone} className="size-11" />
              <div>
                <h3 className="text-base font-semibold">{point.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{point.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
