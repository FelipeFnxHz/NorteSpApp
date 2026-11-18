import { useState } from "react"
import { Building2, FileText, Lock, ShieldAlert, ShieldCheck, Ticket, TriangleAlert } from "lucide-react"
import { discordLoginUrl } from "@/api/client"
import { Link } from "@/components/ui/link"
import { BrandMark } from "@/components/ui/brand"
import { TONES, ToneIcon, type Tone } from "@/components/ui/tone-icon"
import { DiscordIcon } from "@/components/ui/brand-icons"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { buttonVariants } from "@/components/ui/button"

const FEATURES: { icon: typeof Ticket; title: string; text: string; tone: Tone }[] = [
  { icon: Ticket, title: "Tickets e atendimentos", text: "Acompanhe cada solicitação do início ao fim.", tone: "cyan" },
  { icon: FileText, title: "Transcripts", text: "Todo o histórico de conversas, sempre à mão.", tone: "amber" },
  { icon: Building2, title: "Corporações", text: "Hierarquia, patentes e efetivo organizados.", tone: "blue" },
  { icon: ShieldAlert, title: "Denúncias e bugs", text: "Reporte com segurança e acompanhe a análise.", tone: "teal" },
]

const LOGIN_ERRORS: Record<string, { title: string; text: string }> = {
  oauth_failed: { title: "Não foi possível entrar", text: "O Discord não concluiu o login. Tente novamente em instantes; se continuar, avise a equipe." },
  oauth_not_configured: { title: "Login indisponível", text: "O login com Discord ainda não foi configurado. Avise um administrador do servidor." },
}

/** Lê ?error= uma única vez e limpa a URL, para o aviso não voltar ao atualizar a página. */
function useLoginError() {
  const [error] = useState(() => {
    const code = new URLSearchParams(window.location.search).get("error") ?? ""
    return LOGIN_ERRORS[code] ?? null
  })
  if (error && window.location.search) window.history.replaceState(null, "", window.location.pathname)
  return error
}

function ShowcasePanel() {
  return (
    <aside className="border-border relative hidden flex-col justify-between overflow-hidden border-r p-12 lg:flex">
      <div className="bg-grid absolute inset-0" />
      <div className="bg-primary/[0.16] absolute -top-32 -left-24 h-[460px] w-[460px] rounded-full blur-[120px]" />
      <div className="bg-accent/[0.08] absolute -right-24 bottom-0 h-[360px] w-[360px] rounded-full blur-[120px]" />

      <BrandMark to="/" className="relative" />

      <div className="relative max-w-md">
        <h2 className="text-[40px] leading-[1.08] font-bold text-balance">
          A central de comando da <span className="text-gradient">sua cidade.</span>
        </h2>
        <p className="text-muted-foreground mt-4 text-base leading-relaxed">
          Gerencie atendimentos, corporações e a equipe da NorteSp em um único painel, integrado ao bot do Discord.
        </p>

        <ul className="mt-10 flex flex-col gap-5">
          {FEATURES.map(item => (
            <li key={item.title} className="flex gap-4">
              <ToneIcon icon={item.icon} tone={item.tone} className="size-10" iconClassName="size-[18px]" />
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-muted-foreground text-sm">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-muted-foreground relative text-xs">© {new Date().getFullYear()} NorteSp Roleplay</p>
    </aside>
  )
}

export function LoginPage() {
  const loginError = useLoginError()

  return (
    <section className="relative grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <ShowcasePanel />

      <div className="relative flex flex-col overflow-hidden px-6 py-8 sm:px-10">
        <div className="bg-primary/[0.08] absolute -top-40 left-1/2 h-80 w-[520px] -translate-x-1/2 rounded-full blur-[110px] lg:hidden" />

        <div className="relative flex items-center justify-between">
          <BrandMark to="/" className="lg:invisible" />
        </div>

        <div className="relative m-auto flex w-full max-w-[400px] flex-col py-12">
          <span className="border-primary/25 bg-primary/10 text-primary inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold">
            <ShieldCheck className="size-3.5" />
            Dashboard oficial
          </span>

          <h1 className="mt-5 text-4xl leading-tight font-bold">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
            Entre com a sua conta do Discord para acessar tickets, transcripts, corporações e muito mais.
          </p>

          {loginError && (
            <Alert variant="destructive" className="mt-6">
              <TriangleAlert />
              <AlertTitle className="line-clamp-none">{loginError.title}</AlertTitle>
              <AlertDescription className="text-destructive/80">{loginError.text}</AlertDescription>
            </Alert>
          )}

          <a
            id="loginBtn"
            href={discordLoginUrl()}
            data-in-app
            className={`${buttonVariants({ variant: "discord", size: "xl" })} ${loginError ? "mt-4" : "mt-8"} h-14 w-full text-base`}
          >
            <DiscordIcon className="size-5" />
            Entrar com Discord
          </a>

          <div className="text-muted-foreground mt-6 flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-[13px] leading-relaxed">
            <Lock className="mt-0.5 size-4 shrink-0" style={{ color: TONES.green }} />
            <p>
              Só pedimos acesso ao seu perfil público do Discord. Nunca vemos a sua senha, e apenas membros autorizados
              acessam o painel.
            </p>
          </div>

          <p className="text-muted-foreground mt-8 text-center text-xs leading-relaxed">
            Ao entrar, você concorda com os{" "}
            <Link to="/termos-de-uso" className="text-foreground hover:text-primary underline underline-offset-4">
              Termos de Uso
            </Link>{" "}
            e a{" "}
            <Link to="/politica-de-privacidade" className="text-foreground hover:text-primary underline underline-offset-4">
              Política de Privacidade
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  )
}
