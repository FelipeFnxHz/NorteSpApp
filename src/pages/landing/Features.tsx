import { Ambulance, Briefcase, Building2, Gem, LayoutDashboard, PartyPopper, ShieldAlert, ShieldCheck, Sparkles, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { TONES, ToneIcon, type Tone } from "@/components/ui/tone-icon"
import { SectionHeading } from "./SectionHeading"

const FEATURES: { icon: typeof Users; title: string; text: string; tone: Tone; wide?: boolean }[] = [
  { icon: ShieldCheck, title: "Polícia & BOPE", text: "Corporações organizadas com hierarquia, patentes e manual de conduta próprio.", wide: true, tone: "blue" },
  { icon: Ambulance, title: "Samu & Bombeiros", text: "Atendimento médico simulado com equipe dedicada em tempo real.", tone: "red" },
  { icon: Users, title: "Facções", text: "Organizações criminosas com território e economia própria.", tone: "purple" },
  { icon: Building2, title: "Empresas", text: "Abra e administre seu próprio negócio na economia da cidade.", tone: "green" },
  { icon: Briefcase, title: "Trabalhos", text: "Dezenas de empregos legais para construir sua vida do zero.", tone: "orange" },
  { icon: Gem, title: "Sistema VIP", text: "Benefícios exclusivos para quem ajuda a manter o servidor no ar.", tone: "amber" },
  { icon: Sparkles, title: "Sistema Booster", text: "Recompensas para quem impulsiona o nosso Discord.", tone: "pink" },
  { icon: PartyPopper, title: "Eventos", text: "Eventos semanais organizados pela staff e pela comunidade.", tone: "cyan" },
  { icon: LayoutDashboard, title: "Dashboard administrativa", text: "Tickets, transcripts, corporações, staff e configurações num só lugar.", wide: true, tone: "indigo" },
  { icon: ShieldAlert, title: "Denúncias e suporte", text: "Fluxos claros de atendimento, integrados ao servidor.", tone: "teal" },
]

export function Features() {
  return (
    <section id="recursos" className="border-border/70 border-t py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="Recursos"
          title="Tudo o que uma cidade de verdade precisa."
          description="Sistemas construídos e mantidos sob medida para a NorteSp Roleplay."
        />

        <div className="mt-12 sm:mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(feature => (
            <div
              key={feature.title}
              className={cn(
                "group border-border relative overflow-hidden rounded-2xl border bg-white/[0.02] p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04]",
                feature.wide && "lg:col-span-2",
              )}
            >
              <div
                className="absolute -top-16 -right-16 size-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                style={{ backgroundColor: `color-mix(in oklab, ${TONES[feature.tone]} 14%, transparent)` }}
              />
              <ToneIcon icon={feature.icon} tone={feature.tone} className="mb-5 size-11" />
              <h3 className="text-[17px] font-semibold">{feature.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
