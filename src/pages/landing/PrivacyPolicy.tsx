import { LegalLayout, type LegalSection } from "@/pages/landing/LegalLayout"

const SECTIONS: LegalSection[] = [
  {
    title: "Quem somos",
    content: (
      <p>
        A <strong>NorteSp Roleplay</strong> é uma comunidade de FiveM roleplay que opera um servidor de Discord, um bot
        e um painel web (Dashboard). Esta política explica quais dados pessoais tratamos quando você usa esses serviços,
        para que finalidade e quais são os seus direitos, em conformidade com a Lei Geral de Proteção de Dados (LGPD,
        Lei nº 13.709/2018).
      </p>
    ),
  },
  {
    title: "Dados que coletamos",
    content: (
      <>
        <p>Coletamos apenas o necessário para o funcionamento da comunidade:</p>
        <ul>
          <li>
            <strong>Login com Discord:</strong> ID, nome de usuário, nome de exibição, avatar e os cargos que você possui
            no nosso servidor, usados para autenticar você e definir seu nível de acesso (membro, staff ou admin).
          </li>
          <li>
            <strong>Sessão:</strong> um cookie de sessão (token assinado) que mantém você logado no Dashboard.
          </li>
          <li>
            <strong>Atendimento:</strong> tickets, transcrições de conversas, avaliações e feedbacks enviados por você.
          </li>
          <li>
            <strong>Whitelist e formulários:</strong> respostas enviadas em formulários de entrada e de corporações,
            além do resultado da análise.
          </li>
          <li>
            <strong>Corporações e roleplay:</strong> nome de personagem, ID na cidade, patente, cargo interno, status e
            histórico de ações (contratação, promoção, advertência, demissão).
          </li>
          <li>
            <strong>Dados do servidor de jogo:</strong> informações vinculadas à sua conta no servidor FiveM (como
            identificadores e dados de personagem) quando exibidas no painel.
          </li>
          <li>
            <strong>Loja e boosters:</strong> registros de pedidos e de benefícios. Pagamentos são processados pelo
            Mercado Pago; nós não armazenamos dados de cartão.
          </li>
          <li>
            <strong>Registros de uso:</strong> ações realizadas no painel (por exemplo, logs da staff) para segurança e
            auditoria.
          </li>
        </ul>
      </>
    ),
  },
  {
    title: "Para que usamos seus dados",
    content: (
      <ul>
        <li>Autenticar você e controlar o que cada pessoa pode ver ou fazer no Dashboard.</li>
        <li>Prestar suporte, moderar a comunidade e manter histórico de decisões da staff.</li>
        <li>Analisar solicitações de whitelist e de entrada em corporações.</li>
        <li>Operar economia, loja, boosters e demais sistemas do servidor.</li>
        <li>Garantir a segurança, prevenir fraudes e cumprir obrigações legais.</li>
      </ul>
    ),
  },
  {
    title: "Base legal",
    content: (
      <p>
        Tratamos seus dados com base na execução do serviço que você solicitou ao entrar na comunidade, no nosso
        legítimo interesse em manter o servidor seguro e organizado, no cumprimento de obrigações legais e, quando
        aplicável, no seu consentimento.
      </p>
    ),
  },
  {
    title: "Compartilhamento",
    content: (
      <>
        <p>Não vendemos seus dados. Eles podem ser processados por prestadores necessários à operação:</p>
        <ul>
          <li>
            <strong>Discord:</strong> autenticação (OAuth2) e funcionamento do bot.
          </li>
          <li>
            <strong>Provedores de hospedagem e banco de dados:</strong> onde o Dashboard, a API e os dados ficam
            armazenados.
          </li>
          <li>
            <strong>Mercado Pago:</strong> processamento de pagamentos da loja.
          </li>
        </ul>
        <p>Também podemos divulgar dados quando exigido por lei ou ordem de autoridade competente.</p>
      </>
    ),
  },
  {
    title: "Cookies",
    content: (
      <p>
        Usamos um cookie estritamente necessário para manter sua sessão ativa no Dashboard. Ele é removido quando você
        sai da conta ou quando a sessão expira. Não usamos cookies de publicidade.
      </p>
    ),
  },
  {
    title: "Retenção e segurança",
    content: (
      <p>
        Mantemos os dados pelo tempo necessário para as finalidades descritas ou enquanto houver obrigação legal ou
        necessidade de auditoria (por exemplo, histórico de punições e de corporações). Adotamos medidas técnicas e
        organizacionais para proteger as informações, como sessões assinadas, controle de acesso por cargo e acesso
        restrito à staff autorizada.
      </p>
    ),
  },
  {
    title: "Seus direitos",
    content: (
      <>
        <p>Nos termos da LGPD, você pode solicitar a qualquer momento:</p>
        <ul>
          <li>Confirmação da existência de tratamento e acesso aos seus dados;</li>
          <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>Anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>Informações sobre com quem compartilhamos seus dados;</li>
          <li>Revogação de consentimento, quando o tratamento se basear nele.</li>
        </ul>
        <p>
          Algumas informações (como registros de moderação) podem ser mantidas quando necessário para segurança da
          comunidade ou obrigação legal.
        </p>
      </>
    ),
  },
  {
    title: "Menores de idade",
    content: (
      <p>
        O servidor é destinado a maiores de 14 anos, conforme as regras da comunidade e os Termos de Serviço do
        Discord. Se identificarmos dados de alguém abaixo da idade mínima, poderemos removê-los e restringir o acesso.
      </p>
    ),
  },
  {
    title: "Alterações e contato",
    content: (
      <p>
        Podemos atualizar esta política periodicamente; a data no topo da página indica a versão vigente. Para exercer
        seus direitos ou tirar dúvidas, abra um ticket no nosso servidor do Discord.
      </p>
    ),
  },
]

export function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Política de Privacidade"
      updatedAt="27 de setembro de 2026"
      intro="Sua privacidade importa para nós. Este documento descreve, de forma direta, como a NorteSp Roleplay coleta, usa e protege seus dados."
      sections={SECTIONS}
    />
  )
}
