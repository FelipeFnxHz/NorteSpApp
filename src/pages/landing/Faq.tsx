import { useState } from "react"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionHeading } from "./SectionHeading"

const QUESTIONS = [
  { q: "Como faço para entrar no servidor?", a: "Entre no nosso Discord, leia as regras no canal de 📋〆𝚁𝚎𝚐𝚛𝚊𝚜 e siga o passo a passo de whitelist. Depois é só conectar pelo FiveM." },
  { q: "É preciso pagar para jogar?", a: "Não. O acesso ao servidor é 100% gratuito. O sistema VIP existe para quem quer apoiar o projeto, mas não é obrigatório." },
  { q: "Como abro um ticket de suporte?", a: "Direto pela nossa Dashboard, depois de fazer login com sua conta do Discord, ou pelo canal de tickets do servidor." },
  { q: "Posso entrar em uma facção ou corporação?", a: "Sim. Facções e corporações (Polícia Militar, Polícia Civil, Bope, Rota, PRF, Samu, Bombeiros) têm processo seletivo próprio, explicado dentro da cidade e no Discord." },
  { q: "Como denuncio outro jogador?", a: "Pela Dashboard, na seção de tickets, escolhendo a categoria de denúncia, ou pelo canal de tickets do servidor. Toda denúncia é analisada pela staff." },
]

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="border-border/70 border-t py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-5 sm:px-6">
        <SectionHeading eyebrow="Perguntas frequentes" title="Ainda com dúvidas?" />

        <div className="mt-14 flex flex-col gap-3">
          {QUESTIONS.map((item, index) => {
            const isOpen = openIndex === index
            return (
              <div
                key={item.q}
                className={cn(
                  "border-border overflow-hidden rounded-2xl border bg-white/[0.02] transition-colors",
                  isOpen && "border-white/15 bg-white/[0.04]",
                )}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-[15px] font-semibold"
                >
                  <span>{item.q}</span>
                  <Plus
                    className={cn("text-muted-foreground size-4 shrink-0 transition-transform duration-300", isOpen && "text-primary rotate-45")}
                  />
                </button>
                <div className={cn("grid transition-all duration-300", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <p className="text-muted-foreground px-6 pb-6 text-sm leading-relaxed">{item.a}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
