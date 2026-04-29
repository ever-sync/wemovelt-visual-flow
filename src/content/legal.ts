export interface LegalSection {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
}

export const privacySections: LegalSection[] = [
  {
    title: "1. Dados que Coletamos",
    paragraphs: ["Coletamos apenas os dados necessarios para cadastro, verificacao 18+, operacao do app, registros de presenca e recursos sociais do WEMOVELT."],
    bullets: [
      "Dados de cadastro e autenticacao: nome, e-mail, data de nascimento, declaracao de maioridade e identificadores de conta.",
      "Dados de perfil: foto/avatar, username, idade, peso, altura, objetivo e nivel de experiencia, quando informados por voce.",
      "Dados de uso: treinos, habitos, metas, registros de presenca e historico de atividade dentro da plataforma.",
      "Midia enviada por voce: avatar e imagens de perfil.",
      "Dados tecnicos e de notificacao: identificadores de push, tipo de dispositivo, navegador e dados tecnicos basicos quando voce ativa notificacoes.",
    ],
  },
  {
    title: "2. Localizacao, Camera e Notificacoes",
    paragraphs: [
      "A localizacao e consultada somente quando voce escolhe validar presenca por GPS. Nao fazemos rastreamento continuo em segundo plano.",
      "A camera e usada apenas quando voce opta por escanear QR Code para validar presenca. O app nao usa a camera fora desse fluxo.",
      "As notificacoes push sao opcionais e dependem da sua permissao no dispositivo.",
    ],
  },
  {
    title: "3. Como Usamos os Dados",
    bullets: [
      "Criar e manter sua conta.",
      "Confirmar que o uso do app atende ao requisito minimo de 18 anos.",
      "Fornecer, operar e melhorar os servicos do WEMOVELT.",
      "Personalizar a experiencia de treino, metas, historicos e estatisticas.",
      "Validar registros de presenca por geolocalizacao ou QR Code.",
      "Exibir seu perfil e informacoes dentro do app.",
      "Enviar notificacoes e comunicacoes relacionadas ao servico, quando autorizadas.",
      "Prevenir fraude, abuso e uso indevido da plataforma.",
    ],
  },
  {
    title: "4. Compartilhamento e Visibilidade",
    paragraphs: ["Nao vendemos dados pessoais. O compartilhamento acontece apenas nos contextos abaixo:"],
    bullets: [
      "Com outros usuarios autenticados apenas quando necessario para funcionalidades internas do app.",
      "Com provedores de infraestrutura, autenticacao, armazenamento, notificacao e mapas estritamente necessarios para operar o servico.",
      "Para cumprimento de obrigacoes legais, regulatorias ou ordens de autoridades competentes.",
      "Com sua autorizacao explicita.",
    ],
  },
  {
    title: "5. Seguranca",
    paragraphs: [
      "Aplicamos controles de acesso, autenticacao, regras de permissao e protecoes de infraestrutura para reduzir risco de exposicao indevida.",
      "Mesmo assim, nenhum sistema conectado a internet e totalmente isento de falhas ou incidentes.",
    ],
  },
  {
    title: "6. Seus Direitos",
    bullets: [
      "Confirmar se tratamos seus dados pessoais.",
      "Acessar seus dados pessoais.",
      "Corrigir dados desatualizados ou incompletos.",
      "Solicitar anonimizacao, bloqueio ou exclusao quando aplicavel.",
      "Revogar consentimentos fornecidos.",
      "Solicitar portabilidade conforme a LGPD.",
      "Solicitar informacoes sobre compartilhamento e tratamento.",
    ],
  },
  {
    title: "7. Retencao",
    paragraphs: [
      "Mantemos os dados enquanto a conta estiver ativa ou enquanto houver necessidade operacional, de seguranca, auditoria e cumprimento legal.",
      "Apos solicitacao de exclusao, os dados sao tratados conforme os prazos legais e tecnicos aplicaveis, incluindo rotinas de backup quando necessario.",
    ],
  },
  {
    title: "8. Cookies, Sessao e Armazenamento Local",
    paragraphs: [
      "Usamos cookies, local storage e mecanismos equivalentes para manter sua sessao autenticada, salvar preferencias e melhorar a experiencia no app, no site e no PWA.",
    ],
  },
  {
    title: "9. Contato e Atualizacoes",
    paragraphs: [
      "Esta politica pode ser atualizada para refletir evolucoes do produto ou exigencias legais.",
      "Para exercer seus direitos ou tirar duvidas sobre privacidade, entre em contato pelo WhatsApp de suporte: +55 11 95213-0972.",
    ],
  },
];

export const termsSections: LegalSection[] = [
  {
    title: "1. Aceitacao",
    paragraphs: [
      "Ao usar o WEMOVELT, voce concorda com estes termos. Se nao concordar com as regras descritas aqui, nao utilize o aplicativo.",
    ],
  },
  {
    title: "2. O que o app entrega",
    paragraphs: [
      "O WEMOVELT organiza registros de presenca, treinos, habitos e interacao entre usuarios em academias e espacos de treino ao ar livre.",
    ],
  },
  {
    title: "3. Cadastro e conta",
    paragraphs: [
      "O WEMOVELT e exclusivo para pessoas com 18 anos ou mais. Ao criar ou manter uma conta, voce declara cumprir esse requisito.",
      "Voce deve manter seus dados corretos e proteger suas credenciais. O uso da conta e de sua responsabilidade.",
      "Contas que nao atendam ao requisito de idade podem ser bloqueadas ou encerradas.",
    ],
  },
  {
    title: "4. Uso adequado",
    bullets: [
      "Nao publicar conteudo ofensivo, ilegal ou fraudulento.",
      "Nao tentar acessar contas ou dados de terceiros.",
      "Nao usar o servico para manipular registros de presenca ou estatisticas.",
      "Respeitar outros usuarios e as regras de convivencia da plataforma.",
    ],
  },
  {
    title: "5. Conteudo publicado",
    paragraphs: [
      "O conteudo continua sendo seu, mas voce autoriza sua exibicao dentro da plataforma para funcionamento das funcionalidades do app.",
    ],
  },
  {
    title: "6. Saude e seguranca",
    paragraphs: [
      "O app nao substitui avaliacao medica nem acompanhamento profissional. Consulte um especialista antes de iniciar treinos intensos.",
    ],
  },
  {
    title: "7. Mudancas",
    paragraphs: [
      "Podemos atualizar o app, os fluxos e estes termos. Mudancas relevantes serao comunicadas pelos canais oficiais do produto.",
    ],
  },
  {
    title: "8. Contato",
    paragraphs: ["Duvidas sobre uso, suporte ou operacao podem ser enviadas pelos canais do aplicativo."],
  },
];

export const privacyLastUpdated = "28 de abril de 2026";
export const termsLastUpdated = "28 de abril de 2026";
