import { LegalLayout, type LegalSection } from "@/pages/landing/LegalLayout"

const SECTIONS: LegalSection[] = [
  {
    title: "Aceitação dos termos",
    content: (
      <p>
        Ao entrar no servidor de Discord, conectar ao servidor de FiveM ou acessar o Dashboard da{" "}
        <strong>NorteSp Roleplay</strong>, você declara que leu e concorda com estes Termos de Uso. Se não concordar,
        não utilize os serviços.
      </p>
    ),
  },
  {
    title: "Elegibilidade e conta",
    content: (
      <ul>
        <li>Você deve cumprir a idade mínima exigida pelo Discord e pelas regras da comunidade.</li>
        <li>O acesso ao Dashboard é feito exclusivamente pela sua conta do Discord.</li>
        <li>Você é responsável por tudo que ocorre com a sua conta; não a compartilhe.</li>
      </ul>
    ),
  },
  {
    title: "Regras da comunidade",
    content: (
      <>
        <p>Ao participar, você se compromete a:</p>
        <ul>
          <li>Respeitar os demais jogadores e a staff, sem assédio, discriminação ou discurso de ódio;</li>
          <li>Seguir as regras de roleplay e as regras específicas de cada corporação;</li>
          <li>Não usar cheats, exploits, bugs ou qualquer vantagem indevida;</li>
          <li>Não divulgar dados pessoais de terceiros nem conteúdo ilegal ou impróprio.</li>
        </ul>
        <p>As regras completas ficam disponíveis no servidor de Discord e podem ser atualizadas pela staff.</p>
      </>
    ),
  },
  {
    title: "Uso do Dashboard",
    content: (
      <ul>
        <li>O que você vê e pode fazer depende do seu cargo (membro, staff ou admin) e, nas corporações, da sua patente.</li>
        <li>É proibido tentar burlar permissões, acessar dados de outras pessoas ou sobrecarregar a API.</li>
        <li>Ações realizadas no painel podem ser registradas em logs para auditoria.</li>
        <li>Quem recebe permissões (contratar, promover, demitir, etc.) deve usá-las com responsabilidade e apenas dentro da sua função.</li>
      </ul>
    ),
  },
  {
    title: "Corporações e cargos",
    content: (
      <p>
        Patentes, cargos e permissões em corporações são internos ao roleplay e à gestão da comunidade. Podem ser
        alterados, suspensos ou removidos pela staff a qualquer momento, inclusive por descumprimento de regras.
      </p>
    ),
  },
  {
    title: "Loja, boosters e itens virtuais",
    content: (
      <>
        <p>
          Benefícios e itens vendidos ou concedidos são de natureza virtual, de uso exclusivo no servidor e sem valor
          monetário fora dele. Pagamentos são processados pelo Mercado Pago.
        </p>
        <p>
          Benefícios podem ser revogados em caso de violação das regras. Solicitações de reembolso devem ser abertas por
          ticket e analisadas conforme a legislação de defesa do consumidor aplicável.
        </p>
      </>
    ),
  },
  {
    title: "Punições",
    content: (
      <p>
        O descumprimento destes termos ou das regras pode resultar em advertência, suspensão, banimento do servidor ou
        remoção de acessos ao Dashboard, a critério da staff, com registro no histórico.
      </p>
    ),
  },
  {
    title: "Propriedade intelectual",
    content: (
      <p>
        A identidade visual, o bot, o Dashboard e os sistemas próprios da NorteSp Roleplay pertencem à comunidade.
        Rockstar Games, Cfx.re/FiveM e Discord são marcas de seus respectivos titulares; não somos afiliados a eles.
      </p>
    ),
  },
  {
    title: "Disponibilidade e limitação de responsabilidade",
    content: (
      <p>
        Os serviços são oferecidos “como estão”. Podem ocorrer instabilidades, manutenções ou interrupções, e não
        garantimos disponibilidade ininterrupta. Não nos responsabilizamos por perdas decorrentes de falhas de terceiros
        (Discord, hospedagem, FiveM) ou de uso indevido da sua conta.
      </p>
    ),
  },
  {
    title: "Alterações e contato",
    content: (
      <p>
        Estes termos podem ser atualizados a qualquer momento; o uso continuado após a mudança indica concordância. Dúvidas
        podem ser enviadas por ticket no nosso Discord. Veja também nossa Política de Privacidade.
      </p>
    ),
  },
]

export function TermsOfUse() {
  return (
    <LegalLayout
      title="Termos de Uso"
      updatedAt="27 de setembro de 2026"
      intro="Estes termos definem as condições para usar o servidor, o bot e o Dashboard da NorteSp Roleplay."
      sections={SECTIONS}
    />
  )
}
