import { Bot, Building2, Clock, DatabaseBackup, Gavel, MessagesSquare, ShoppingBag, Ticket, UserCheck } from "lucide-react"
import { TONES, ToneIcon, type Tone } from "@/components/ui/tone-icon"
import { SectionHeading } from "./SectionHeading"

const CAPABILITIES: { icon: typeof Ticket; title: string; text: string; tone: Tone }[] = [
  { icon: Ticket, title: "Tickets e transcripts", text: "Atendimento com histórico completo, consultável na dashboard.", tone: "cyan" },
  { icon: UserCheck, title: "Whitelist e formulários", text: "Processos seletivos de entrada e de corporações, dentro do Discord.", tone: "green" },
  { icon: Gavel, title: "Moderação e punições", text: "Advertências e sanções registradas e auditáveis pela staff.", tone: "red" },
  { icon: Clock, title: "Ponto das corporações", text: "Controle de expediente em serviço, direto por comando.", tone: "amber" },
  { icon: ShoppingBag, title: "Loja e boosters", text: "Benefícios de VIP e de impulsionadores, automatizados.", tone: "pink" },
  { icon: DatabaseBackup, title: "Backup do servidor", text: "Cópia da estrutura do Discord para restaurar quando precisar.", tone: "indigo" },
]

function DiscordButton({ children, tone = "primary" }: { children: string; tone?: "primary" | "neutral" }) {
  return (
    <span
      className={
        tone === "primary"
          ? "bg-discord rounded-[4px] px-4 py-1.5 text-[13px] font-medium text-white"
          : "rounded-[4px] bg-white/10 px-4 py-1.5 text-[13px] font-medium text-white/90"
      }
    >
      {children}
    </span>
  )
}

// Static illustration of the bot's messages — not a live embed.
function DiscordMessage() {
  return (
    <div className="glass rounded-2xl p-5 shadow-2xl shadow-black/40">
      <div className="flex gap-3.5">
        <img src="/logo.png" alt="" className="size-10 shrink-0 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold">NorteSp</span>
            <span className="bg-discord inline-flex items-center gap-1 rounded-[3px] px-1.5 py-px text-[10px] font-bold text-white">
              BOT
            </span>
            <span className="text-muted-foreground text-xs">Hoje às 20:41</span>
          </div>

          <div
            className="bg-background/60 mt-2 max-w-md rounded-r-lg border-l-4 p-4"
            style={{ borderLeftColor: TONES.cyan }}
          >
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <Ticket className="size-4" style={{ color: TONES.cyan }} />
              Central de Atendimento
            </p>
            <p className="text-muted-foreground mt-1.5 text-sm leading-relaxed">
              Precisa de ajuda? Escolha uma categoria abaixo e a nossa staff atende você em um canal privado.
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <DiscordButton>Abrir ticket</DiscordButton>
            <DiscordButton tone="neutral">Denúncia</DiscordButton>
            <DiscordButton tone="neutral">Whitelist</DiscordButton>
          </div>
        </div>
      </div>

      <div className="border-border my-5 border-t" />

      <div className="flex gap-3.5">
        <img src="/logo.png" alt="" className="size-10 shrink-0 rounded-full object-cover" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold">NorteSp</span>
            <span className="bg-discord rounded-[3px] px-1.5 py-px text-[10px] font-bold text-white">BOT</span>
            <span className="text-muted-foreground text-xs">Hoje às 20:43</span>
          </div>
          <div
            className="bg-background/60 mt-2 max-w-md rounded-r-lg border-l-4 p-4"
            style={{ borderLeftColor: TONES.green }}
          >
            <p className="flex items-center gap-2 text-[15px] font-semibold">
              <UserCheck className="size-4" style={{ color: TONES.green }} />
              Whitelist aprovada
            </p>
            <p className="text-muted-foreground mt-1.5 text-sm">Bem-vindo à cidade! Seus cargos já foram aplicados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BotShowcase() {
  return (
    <section id="bot" className="border-border/70 relative overflow-hidden border-t py-16 sm:py-24">
      <div className="bg-discord/[0.09] absolute top-1/2 -left-40 -z-10 h-[420px] w-[420px] -translate-y-1/2 rounded-full blur-[120px]" />

      <div className="mx-auto max-w-6xl px-5 sm:px-6">
        <SectionHeading
          eyebrow="Bot oficial"
          title="O bot que faz a cidade funcionar no Discord."
          description="O NorteSp Bot e a dashboard trabalham juntos: tudo que acontece no servidor fica registrado e acessível para quem tem permissão."
        />

        <div className="mt-12 sm:mt-16 grid items-center gap-12 lg:grid-cols-[1fr_1.05fr]">
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {CAPABILITIES.map(item => (
              <div key={item.title} className="flex gap-3.5">
                <ToneIcon icon={item.icon} tone={item.tone} className="size-10" iconClassName="size-[18px]" />
                <div>
                  <h3 className="text-[15px] font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative">
            <DiscordMessage />
            <div className="glass absolute -top-4 right-4 hidden items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium sm:flex">
              <Bot className="size-3.5" style={{ color: TONES.indigo }} />
              Integrado à dashboard
            </div>
            <div className="glass absolute -bottom-4 left-6 hidden items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium sm:flex">
              <Building2 className="size-3.5" style={{ color: TONES.blue }} />
              <MessagesSquare className="size-3.5" style={{ color: TONES.purple }} />
              Corporações sincronizadas
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
