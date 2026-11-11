// =========================================================================
// AC ENGENHARIA - SGSI & GRC DE OBRAS
// Módulo: Plano Priorizado de Tarefas (19+5 Tarefas) & Campanhas ANPD (52 Semanas)
// =========================================================================

// 1. Catálogo Completo das 24 Tarefas do Plano Priorizado (Fase 1 a Fase 4)
const ROADMAP_TASKS = [
  // FASE 1: CUSTO ZERO
  {
    id: 1,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Treinamento e Conscientização Contínuos",
    desc: "Manter programa anual de envio de avisos sobre LGPD e Segurança",
    cost: "Zero",
    effort: "Baixo",
    howTo: "Usar e-mail, intranet ou WhatsApp corporativo para enviar pílulas semanais (dicas de senhas, phishing). Registrar confirmações de leitura.",
    obs: "Campanha semanal das 52 semanas conectada à aba de Campanhas ANPD.",
    linkModule: "raci",
    subtab: "campaigns",
    completed: false
  },
  {
    id: 2,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Comitê, Políticas e Matriz RACI para Incidentes",
    desc: "Criar documentos e definir responsáveis para casos de vazamento",
    cost: "Zero (Tempo)",
    effort: "Médio",
    howTo: "Agendar reunião com a diretoria/RH/TI. Redigir Matriz RACI para incidentes (quem aciona a ANPD, quem avalia o servidor, etc.) e aprovar.",
    obs: "Documentado na Matriz RACI e Política PSI-001.",
    linkModule: "raci",
    subtab: "matrix",
    completed: false
  },
  {
    id: 3,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Política de Privilégio Mínimo (Remover Admin Local)",
    desc: "Retirar privilégios de administrador das máquinas dos usuários",
    cost: "Zero",
    effort: "Médio",
    howTo: "No Active Directory (AD) ou no gerenciamento local do Windows, alterar o perfil do usuário de 'Administrador' para 'Usuário Padrão'. Aplicar GPOs.",
    obs: "Reduz em 85% o risco de execução de ransomware em estações.",
    linkModule: "raci",
    subtab: "policies",
    completed: false
  },
  {
    id: 4,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Criptografia de Disco Nativa (BitLocker / FileVault)",
    desc: "Ativar criptografia nativa e gratuita nos notebooks de engenheiros e fiscais",
    cost: "Zero",
    effort: "Baixo",
    howTo: "No Windows Pro, pesquisar por 'Gerenciar BitLocker' e ativar na unidade C:. Salvar as chaves de recuperação no AD ou em cofre de senhas.",
    obs: "Item obrigatório para equipamentos de canteiro que saem a campo.",
    linkModule: "secops",
    subtab: "assets",
    completed: false
  },
  {
    id: 5,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Ativação de MFA nas Contas em Nuvem",
    desc: "Forçar duplo fator em contas do Google Workspace ou Microsoft 365",
    cost: "Zero",
    effort: "Baixo",
    howTo: "No painel de administração (Google Workspace ou Microsoft 365), acessar as políticas de segurança e forçar a 'Verificação em duas etapas' para todos os usuários.",
    obs: "Protege o e-mail corporativo contra invasão e envio de boletos falsos.",
    linkModule: "raci",
    subtab: "policies",
    completed: false
  },
  {
    id: 6,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Mapeamento de Dados (ROPA) e RIPD",
    desc: "Fazer inventário de dados pessoais da construtora (Art. 37 LGPD)",
    cost: "Zero (Tempo)",
    effort: "Alto",
    howTo: "Mapear: Setor, Qual o dado pessoal, Finalidade, Onde é armazenado e Quem acessa. Entrevistar gestores de RH/SST, Vendas e Obras.",
    obs: "Alimentado no módulo LGPD & RoPA com prazos decenais e NR-07.",
    linkModule: "lgpd",
    subtab: "ropa",
    completed: false
  },
  {
    id: 7,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Criptografia em Trânsito (TLS / HTTPS)",
    desc: "Garantir HTTPS e certificados gratuitos em sites e sistemas internos",
    cost: "Zero",
    effort: "Baixo",
    howTo: "Em servidores web ou painéis de hospedagem, emitir certificados gratuitos via Let's Encrypt e configurar redirecionamento forçado de HTTP para HTTPS.",
    obs: "Evita interceptação de dados de compradores em formulários.",
    linkModule: "secops",
    subtab: "assets",
    completed: false
  },
  {
    id: 8,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Nomeação Formal do DPO e Divulgação Pública do Canal (Art. 41 LGPD)",
    desc: "Portaria interna de designação e publicação do e-mail do encarregado de dados",
    cost: "Zero",
    effort: "Baixo",
    howTo: "Elaborar portaria assinada pela Diretoria nomeando o DPO (ex: dpo@acengenhariase.com.br) e publicar em página visível no site institucional e estandes.",
    obs: "Exigência direta de fiscalização obrigatória da ANPD.",
    linkModule: "lgpd",
    subtab: "dsar",
    completed: false
  },
  {
    id: 9,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Fluxo de Comunicação de Incidentes à ANPD em 3 Dias Úteis",
    desc: "Procedimento operacional para cumprimento da Resolução CD/ANPD nº 15/2024",
    cost: "Zero",
    effort: "Médio",
    howTo: "Definir gatilho no CSIRT: ao identificar vazamento com risco relevante a titulares, abrir contagem de 3 dias úteis para preenchimento do formulário da ANPD.",
    obs: "Resolução CD/ANPD nº 15/2024 substituiu o prazo genérico anterior.",
    linkModule: "secops",
    subtab: "incidents",
    completed: false
  },
  {
    id: 10,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Termo de Não Repasse de Leads e NDA Comercial (Prevenção Risco Cyrela)",
    desc: "Vedação expressa de repasse de contatos de clientes para decoradores/marcenarias",
    cost: "Zero",
    effort: "Baixo",
    howTo: "Aditar contratos com imobiliárias parceiras e corretores de estande com cláusula de proibição de repasse de dados de compradores sem opt-in explícito.",
    obs: "Evita sanções idênticas à condenação histórica da Cyrela no TJSP.",
    linkModule: "raci",
    subtab: "policies",
    completed: false
  },

  // FASE 2: CUSTO BAIXO A MÉDIO
  {
    id: 11,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "Ajuste de Regras de Firewall e VPN",
    desc: "Revisar regras, fechar portas desnecessárias e configurar VPN com MFA",
    cost: "Tempo Técnico",
    effort: "Baixo",
    howTo: "Acessar o console do firewall/MikroTik, desativar regras 'Any-Any', bloquear portas não utilizadas (RDP 3389 para fora) e exigir MFA na VPN.",
    obs: "Isola os canteiros da internet pública.",
    linkModule: "secops",
    subtab: "assets",
    completed: false
  },
  {
    id: 12,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "Segmentação de Rede (VLANs nos Canteiros e Sede)",
    desc: "Separar redes via switches gerenciáveis (VLAN 10 Engenharia, 20 ERP, 30 Catracas)",
    cost: "Tempo Técnico",
    effort: "Médio",
    howTo: "Criar redes lógicas separadas isolando o tráfego de operários, câmeras CFTV e sistemas corporativos. Bloquear roteamento entre VLAN de catracas e rede de escritório.",
    obs: "Controlado no módulo SecOps & Ativos.",
    linkModule: "secops",
    subtab: "assets",
    completed: false
  },
  {
    id: 13,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "Logs e Trilhas de Auditoria",
    desc: "Configurar retenção de logs em sistemas atuais (Windows, Linux, ERP Sienge)",
    cost: "Tempo Técnico",
    effort: "Médio",
    howTo: "Ativar Políticas de Grupo (GPOs) de auditoria no Windows Server (Logon/Logoff, Acesso a Objetos). Nos sistemas (ERP), checar se as trilhas nativas estão ligadas.",
    obs: "Integrado à Trilha de Auditoria Forense SHA-256 encadeada.",
    linkModule: "audit",
    subtab: "",
    completed: false
  },
  {
    id: 14,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "Controle de Terceiros e DPA em Contratos de Empreiteiras",
    desc: "Adicionar cláusulas de LGPD em contratos de empreiteiras (NR-18)",
    cost: "Apoio Jurídico",
    effort: "Médio",
    howTo: "Solicitar ao jurídico um 'Aditivo de LGPD' (DPA) padrão. Enviar para todos os fornecedores e empreiteiras que processam dados de operários assinarem.",
    obs: "Mapeado na aba Operadores & DPA.",
    linkModule: "lgpd",
    subtab: "dpa",
    completed: false
  },
  {
    id: 15,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "RBAC (Controle de Acesso Baseado em Função)",
    desc: "Limitar acessos sistêmicos por função no ERP Sienge e CRM CV",
    cost: "Tempo Técnico",
    effort: "Alto",
    howTo: "Mapear perfis no Sienge e CV. Em vez de dar permissões individuais, criar grupos (ex: 'RH_Leitura', 'Fin_Edicao', 'Engenharia_Obras') e vincular aos cargos.",
    obs: "Evita que engenheiros tenham acesso a prontuários médicos ou dados de renda de clientes.",
    linkModule: "raci",
    subtab: "matrix",
    completed: false
  },
  {
    id: 16,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "Rotina de Expurgo de Biometria Facial pós-Habite-se (Art. 11 LGPD)",
    desc: "Eliminação segura de templates biométricos ao término da obra",
    cost: "Tempo Técnico",
    effort: "Médio",
    howTo: "Criar rotina formal para que, na emissão do Habite-se ou desmobilização do canteiro, o gestor de obra e a TI façam o reset de fábrica e expurgo das catracas.",
    obs: "Evita passivo trabalhista e vazamento de dados sensíveis de ex-operários.",
    linkModule: "raci",
    subtab: "policies",
    completed: false
  },
  {
    id: 17,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "Canal e SLA de Atendimento aos Direitos dos Titulares em 15 Dias (Art. 18)",
    desc: "Fluxo formal para responder solicitações de titulares no prazo da LGPD",
    cost: "Tempo Técnico",
    effort: "Médio",
    howTo: "Padronizar respostas no módulo DSAR para confirmação de dados, exclusão ou revogação de consentimento, garantindo resposta em até 15 dias corridos.",
    obs: "Monitorado no painel DSAR com contagem regressiva de dias decorridos.",
    linkModule: "lgpd",
    subtab: "dsar",
    completed: false
  },

  // FASE 3: CUSTO MÉDIO
  {
    id: 18,
    phase: 3,
    phaseName: "Fase 3: Custo Médio",
    title: "EDR/XDR (Endpoint Detection and Response)",
    desc: "Substituir antivírus comum por EDR contra ransomware em servidores BIM e Sienge",
    cost: "Licença Mensal",
    effort: "Baixo",
    howTo: "Contratar ferramenta EDR (ex: Wazuh Agent, Defender for Business). Distribuir agente nas estações de engenheiros e servidores e configurar bloqueio automático.",
    obs: "Monitorado em tempo real no console de alertas Wazuh.",
    linkModule: "secops",
    subtab: "wazuh",
    completed: false
  },
  {
    id: 19,
    phase: 3,
    phaseName: "Fase 3: Custo Médio",
    title: "Proxy / Web Filter em Nuvem (DNS Seguro)",
    desc: "Assinar serviço DNS em nuvem para bloqueio de sites e phishing",
    cost: "Licença Mensal",
    effort: "Baixo",
    howTo: "Assinar serviço de DNS seguro (NextDNS, Cisco Umbrella). Mudar apontamentos de DNS do DHCP/MikroTik para a nuvem do serviço e criar políticas bloqueando phishing.",
    obs: "Protege o ambiente de canteiro contra cliques em links falsos.",
    linkModule: "secops",
    subtab: "assets",
    completed: false
  },
  {
    id: 20,
    phase: 3,
    phaseName: "Fase 3: Custo Médio",
    title: "Mascaramento e Anonimização de BD",
    desc: "Aplicar anonimização em ambientes de homologação e teste do Sienge/CV",
    cost: "Licença/Desenvolvimento",
    effort: "Alto",
    howTo: "Utilizar scripts SQL ou ferramentas de Data Masking para embaralhar nomes, e-mails e CPFs de clientes ao clonar o banco de produção para testes de novos módulos.",
    obs: "Atende ao Art. 12 da LGPD (dados anonimizados não são considerados dados pessoais).",
    linkModule: "lgpd",
    subtab: "ropa",
    completed: false
  },

  // FASE 4: ALTO CUSTO / ALTA COMPLEXIDADE
  {
    id: 21,
    phase: 4,
    phaseName: "Fase 4: Alto Custo / Complexidade",
    title: "Criptografia de Dados em Repouso (TDE)",
    desc: "Criptografar arquivos de banco de dados corporativo em disco",
    cost: "Licença Enterprise",
    effort: "Alto",
    howTo: "Em bancos compatíveis (SQL Server/Oracle Enterprise), gerar Master Key, criar certificado e executar comando para habilitar TDE (Transparent Data Encryption).",
    obs: "Protege o banco contra roubo físico ou cópia não autorizada do arquivo .mdf/.db.",
    linkModule: "secops",
    subtab: "assets",
    completed: false
  },
  {
    id: 22,
    phase: 4,
    phaseName: "Fase 4: Alto Custo / Complexidade",
    title: "IPS/IDS Dedicado de Borda",
    desc: "Solução de prevenção ativa de invasão por hardware e licença dedicada",
    cost: "Hardware (CAPEX)",
    effort: "Alto",
    howTo: "Adquirir e configurar licenças de IPS/IDS no firewall físico/virtual. Mudar perfis de inspeção de tráfego de 'Monitoramento' para 'Prevenção/Bloqueio Ativo'.",
    obs: "Protege o gateway da sede contra scanners e tentativas de exploração externa.",
    linkModule: "secops",
    subtab: "wazuh",
    completed: false
  },
  {
    id: 23,
    phase: 4,
    phaseName: "Fase 4: Alto Custo / Complexidade",
    title: "DLP (Data Loss Prevention) Corporativo",
    desc: "Ferramenta para impedir envio de projetos DWG e planilhas por pen drives ou e-mails pessoais",
    cost: "Licença Alta",
    effort: "Alto",
    howTo: "Instalar agentes DLP nas estações de trabalho e integrar ao e-mail. Criar regras buscando padrões (extensões .dwg, .rvt e regex de CPF) e bloquear extração USB.",
    obs: "Impede vazamento de propriedade intelectual de projetos de engenharia e orçamentos.",
    linkModule: "secops",
    subtab: "assets",
    completed: false
  },
  {
    id: 24,
    phase: 4,
    phaseName: "Fase 4: Alto Custo / Complexidade",
    title: "802.1X (Autenticação de Porta e Certificados Digitais)",
    desc: "Exigência de certificado digital de máquina antes de liberar acesso à rede física",
    cost: "Hardware/Servidor",
    effort: "Alto",
    howTo: "Subir servidor Radius/NPS no Windows Server. Configurar switches gerenciáveis para usar 802.1X, exigindo certificado do computador antes de liberar a porta ethernet.",
    obs: "Evita que visitantes conectem notebooks pessoais nos pontos de rede da obra ou sede.",
    linkModule: "secops",
    subtab: "assets",
    completed: false
  }
];

// 2. Catálogo Oficial das 52 Semanas de Campanhas ANPD & Cultura de Privacidade (Início Limpo 0% Enviado)
const ANPD_CAMPAIGNS_DATA = [
  { week: 1, phase: "Fundações e Riscos Modernos", title: "O Pilar da LGPD e as Sanções da ANPD", desc: "Os riscos do uso incorreto de dados no dia a dia da AC Engenharia e as consequências legais e financeiras de um vazamento.", legalBasis: "Arts. 42 e 52 a 54", completed: false, sentDate: null },
  { week: 2, phase: "Fundações e Riscos Modernos", title: "IA e o Vazamento Invisível", desc: "Por que não inserir dados reais de clientes, plantas executivas ou dados financeiros em IAs públicas não homologadas.", legalBasis: "Art. 6º, III; Art. 33; Art. 46", completed: false, sentDate: null },
  { week: 3, phase: "Fundações e Riscos Modernos", title: "Senhas Fortes sem Complicação", desc: "Criação de frases-senha, importância do duplo fator de autenticação (MFA) e o perigo de reutilizar senhas.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 4, phase: "Fundações e Riscos Modernos", title: "O Golpe do Boleto no Sienge", desc: "Cuidados na extração de dados financeiros, envio de boletos e a proteção contra fraudes financeiras e boletos adulterados.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 5, phase: "Ameaças Externas e Atendimento", title: "Phishing: Pescando Informações", desc: "Como identificar e-mails falsos com comprovantes de medição adulterados, links maliciosos e falsos gatilhos de urgência.", legalBasis: "Art. 6º, VII e VIII; Art. 46", completed: false, sentDate: null },
  { week: 6, phase: "Ameaças Externas e Atendimento", title: "Direitos dos Titulares (CV)", desc: "O que fazer quando um lead ou comprador pede para acessar, alterar ou excluir seus dados do sistema comercial CV.", legalBasis: "Arts. 18 e 19", completed: false, sentDate: null },
  { week: 7, phase: "Ameaças Externas e Atendimento", title: "Compartilhamento Seguro", desc: "Regras e canais oficiais para o envio de contratos, plantas de engenharia e informações estratégicas para fornecedores.", legalBasis: "Art. 6º, III e VII; Art. 46", completed: false, sentDate: null },
  { week: 8, phase: "Ameaças Externas e Atendimento", title: "Mistura Pessoal vs. Profissional", desc: "Os riscos de usar o e-mail corporativo em cadastros de compras ou salvar arquivos de trabalho no WhatsApp pessoal.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 9, phase: "Hábitos Diários de Segurança", title: "A Cultura do 'Não Esconda o Erro'", desc: "O que fazer (e quem avisar na TI/DPO) se você clicar em um link suspeito ou enviar um contrato para o destinatário errado.", legalBasis: "Art. 48; Art. 50", completed: false, sentDate: null },
  { week: 10, phase: "Hábitos Diários de Segurança", title: "Tela Bloqueada e Mesa Limpa", desc: "O hábito do atalho (Win + L) ao levantar da mesa e o perigo de deixar planilhas impressas de clientes à vista nos estandes.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 11, phase: "Hábitos Diários de Segurança", title: "O Perigo do Wi-Fi Público", desc: "Por que evitar acessar o Sienge, o CV ou o e-mail corporativo usando redes abertas de cafés, hotéis ou aeroportos sem VPN.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 12, phase: "Hábitos Diários de Segurança", title: "Descarte e Limpeza de Dados", desc: "A importância de excluir arquivos antigos (retenção) e não acumular PDFs de documentos de compradores na área de trabalho.", legalBasis: "Arts. 15 e 16; Art. 6º, III", completed: false, sentDate: null },
  { week: 13, phase: "Engenharia Social e Golpes", title: "O Hacker sem Computador", desc: "O que é Engenharia Social e como golpistas manipulam colaboradores por telefone para obter informações confidenciais.", legalBasis: "Art. 6º, VIII; Art. 46", completed: false, sentDate: null },
  { week: 14, phase: "Engenharia Social e Golpes", title: "O Falso Suporte de TI", desc: "Como identificar ligações ou mensagens de falsos técnicos pedindo senhas, códigos de SMS ou acesso remoto ao computador.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 15, phase: "Engenharia Social e Golpes", title: "O Gatilho da Falsa Urgência", desc: "Como cibercriminosos usam urgência para forçar equipes de compras ou financeiro a pular processos de conferência.", legalBasis: "Art. 6º, VIII; Art. 46", completed: false, sentDate: null },
  { week: 16, phase: "Engenharia Social e Golpes", title: "Superexposição nas Redes Sociais", desc: "Os cuidados com o que postamos no Instagram/LinkedIn que pode facilitar ataques direcionados e spear-phishing à construtora.", legalBasis: "Art. 6º, VIII; Art. 46", completed: false, sentDate: null },
  { week: 17, phase: "Blindando a Operação", title: "Permissões Mínimas no Sienge e CV", desc: "Entendendo por que não temos acesso irrestrito a todos os módulos do ERP (Princípio do Privilégio Mínimo).", legalBasis: "Art. 6º, III; Art. 46", completed: false, sentDate: null },
  { week: 18, phase: "Blindando a Operação", title: "Relatórios e Planilhas Excel", desc: "O risco de extrair grandes volumes de dados do ERP para planilhas locais e perdê-las ou compartilhá-las indevidamente.", legalBasis: "Art. 6º, III; Art. 46", completed: false, sentDate: null },
  { week: 19, phase: "Blindando a Operação", title: "Atendimento Oficial no WhatsApp", desc: "Por que toda comunicação de vendas e cobrança deve ocorrer nos canais homologados da empresa, nunca no celular particular.", legalBasis: "Art. 6º, VII; Art. 46; Art. 50", completed: false, sentDate: null },
  { week: 20, phase: "Blindando a Operação", title: "Validação de Identidade de Clientes", desc: "Como confirmar que a pessoa solicitando informações financeiras no WhatsApp é realmente o titular do contrato de compra.", legalBasis: "Art. 18; Art. 46", completed: false, sentDate: null },
  { week: 21, phase: "LGPD na Prática", title: "O que é Consentimento no CV?", desc: "Como registrar corretamente a autorização de um novo cliente para receber contatos comerciais no CRM de vendas.", legalBasis: "Art. 7º, I; Art. 8º", completed: false, sentDate: null },
  { week: 22, phase: "LGPD na Prática", title: "O Fim do Contrato (Tabela de Retenção)", desc: "Por que não apagamos os dados no dia seguinte: os prazos legais de guarda (10 anos do Código Civil e 20 anos da NR-07).", legalBasis: "Art. 7º, II; Arts. 15 e 16", completed: false, sentDate: null },
  { week: 23, phase: "LGPD na Prática", title: "Anonimização de Dados em Obras", desc: "Ocultando dados pessoais que não precisam ser exibidos em relatórios de medição física de canteiros.", legalBasis: "Art. 5º, XI; Art. 12; Art. 6º, III", completed: false, sentDate: null },
  { week: 24, phase: "LGPD na Prática", title: "Descarte Físico Correto (Fragmentadora)", desc: "A fragmentadora de papel como ferramenta essencial para destruir cópias impressas de RGs, CPFs e fichas de canteiro.", legalBasis: "Art. 16; Art. 46", completed: false, sentDate: null },
  { week: 25, phase: "Infraestrutura e Acessos", title: "O Perigo dos Pen Drives e Mídias USB", desc: "Os riscos de conectar dispositivos USB desconhecidos ou não autorizados nos computadores da construtora.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 26, phase: "Infraestrutura e Acessos", title: "Segurança no Celular Corporativo", desc: "Regras de uso, bloqueio de tela com PIN forte e proibição de instalação de aplicativos externos não homologados.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 27, phase: "Infraestrutura e Acessos", title: "Visitantes no Escritório e Canteiros", desc: "Atenção a quem circula nas áreas de trabalho e cuidado com informações sigilosas exibidas em telas durante reuniões.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 28, phase: "Infraestrutura e Acessos", title: "Atualizações de Sistema e Antivírus", desc: "Por que você nunca deve adiar as atualizações do Windows, dos navegadores e dos softwares de engenharia.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 29, phase: "Resposta a Incidentes", title: "O que é um Incidente de Segurança?", desc: "Exemplos reais (desde uma senha comprometida até um sistema fora do ar) e como agir com rapidez.", legalBasis: "Art. 46; Art. 48", completed: false, sentDate: null },
  { week: 30, phase: "Resposta a Incidentes", title: "Sequestro de Dados (Ransomware)", desc: "Como funciona esse ataque em arquivos DWG/RVT e por que a prevenção e o backup imutável são as defesas reais.", legalBasis: "Art. 6º, VIII; Arts. 46 e 48", completed: false, sentDate: null },
  { week: 31, phase: "Resposta a Incidentes", title: "Notificando a Equipe Certa (DPO e TI)", desc: "Os canais oficiais internos para relatar suspeitas de vazamento sem medo de represálias.", legalBasis: "Art. 41; Art. 48", completed: false, sentDate: null },
  { week: 32, phase: "Resposta a Incidentes", title: "Plano de Contingência Operacional", desc: "O que a equipe deve fazer caso o Sienge ou o CV fiquem inacessíveis para manter as operações de obra seguras.", legalBasis: "Art. 46; Art. 50", completed: false, sentDate: null },
  { week: 33, phase: "Navegação e Ferramentas", title: "Como Identificar Sites Falsos", desc: "Dicas para verificar o cadeado de segurança e inspecionar a URL oficial antes de inserir credenciais de acesso.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 34, phase: "Navegação e Ferramentas", title: "Downloads Perigosos da Internet", desc: "O risco oculto em arquivos PDF, executáveis e arquivos compactados recebidos de remetentes desconhecidos.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 35, phase: "Navegação e Ferramentas", title: "Extensões Maliciosas de Navegador", desc: "O perigo de instalar plugins não autorizados que podem capturar dados digitados no navegador.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 36, phase: "Navegação e Ferramentas", title: "Cofres de Senhas Corporativos", desc: "Como e por que usar gerenciadores de senhas homologados em vez de anotações em papéis ou blocos de notas.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 37, phase: "Relacionamento com Terceiros", title: "LGPD para Empreiteiras e Parceiros", desc: "Por que exigimos o mesmo padrão rigoroso de proteção de dados de empresas prestadoras de serviço no canteiro.", legalBasis: "Art. 39; Art. 42, §1º; Art. 46", completed: false, sentDate: null },
  { week: 38, phase: "Relacionamento com Terceiros", title: "Cláusulas de Confidencialidade (NDAs)", desc: "O papel dos acordos de não divulgação e por que orçamentos e plantas da empresa não devem ser divulgados.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 39, phase: "Relacionamento com Terceiros", title: "Auditoria e Transparência de Logs", desc: "Como o sistema registra quem acessou o quê e por que o login pessoal é a assinatura digital intransferível do colaborador.", legalBasis: "Art. 6º, X; Art. 37", completed: false, sentDate: null },
  { week: 40, phase: "Relacionamento com Terceiros", title: "Offboarding Imediato de Terceirizados", desc: "A importância de avisar a TI no momento exato em que um prestador ou empreiteira encerra suas atividades na obra.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 41, phase: "Golpes Avançados (Linguagem Simples)", title: "Deepfakes e Clonagem de Voz", desc: "O novo cenário de golpes em que criminosos simulam a voz de diretores no WhatsApp solicitando pagamentos urgentes.", legalBasis: "Art. 6º, VIII; Art. 46", completed: false, sentDate: null },
  { week: 42, phase: "Golpes Avançados (Linguagem Simples)", title: "Interceptação de Rede e VPN", desc: "Como túneis seguros VPN protegem os dados enquanto trafegam da casa do colaborador para os servidores da empresa.", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 43, phase: "Golpes Avançados (Linguagem Simples)", title: "Ataques de Força Bruta", desc: "Por que as contas são bloqueadas temporariamente após erros repetidos de senha (mecanismo preventivo de defesa).", legalBasis: "Art. 6º, VII; Art. 46", completed: false, sentDate: null },
  { week: 44, phase: "Golpes Avançados (Linguagem Simples)", title: "Quando um Fornecedor Externo Vaza", desc: "O que acontece quando os dados vazam da imobiliária parceira e como a AC Engenharia protege sua base central.", legalBasis: "Art. 39; Art. 42; Art. 48", completed: false, sentDate: null },
  { week: 45, phase: "Consolidação da Cultura", title: "Revisão: Riscos no Financeiro (Sienge)", desc: "Resumo das práticas obrigatórias para quem lida diariamente com pagamentos, contas a receber e emissão de boletos.", legalBasis: "Art. 6º; Art. 46; Art. 50", completed: false, sentDate: null },
  { week: 46, phase: "Consolidação da Cultura", title: "Revisão: O Ciclo de Vendas (CV)", desc: "Resumo de segurança focado na equipe comercial: captação segura, sigilo da negociação e uso ético de contatos.", legalBasis: "Art. 6º; Art. 46; Art. 50", completed: false, sentDate: null },
  { week: 47, phase: "Consolidação da Cultura", title: "O Papel do DPO na Construtora", desc: "Relembrando quem é o encarregado de dados e quando ele deve ser acionado no dia a dia da obra e dos estandes.", legalBasis: "Art. 41", completed: false, sentDate: null },
  { week: 48, phase: "Consolidação da Cultura", title: "Conhecimento Aplicado (Quiz de Segurança)", desc: "Desafio interativo gamificado para a equipe testar o que aprendeu ao longo do ano de conscientização.", legalBasis: "Art. 50", completed: false, sentDate: null },
  { week: 49, phase: "Consolidação da Cultura", title: "Nossas Vitórias na Segurança da Informação", desc: "Compartilhamento de exemplos positivos de ameaças, golpes e phishings que o time evitou ao longo do ano.", legalBasis: "Art. 6º, X; Art. 50", completed: false, sentDate: null },
  { week: 50, phase: "Consolidação da Cultura", title: "Privacidade e Segurança em Casa", desc: "Levando as lições da empresa para a vida: como proteger seus familiares de golpes virtuais e fraudes bancárias.", legalBasis: "Art. 50", completed: false, sentDate: null },
  { week: 51, phase: "Consolidação da Cultura", title: "Tendências de Segurança para o Próximo Ano", desc: "Uma visão simples e prática sobre como a segurança e a governança continuarão evoluindo na AC Engenharia.", legalBasis: "Art. 50; Art. 6º, VIII", completed: false, sentDate: null },
  { week: 52, phase: "Consolidação da Cultura", title: "Certificação e Fechamento do Ciclo Anual", desc: "Agradecimento pelo engajamento de todos, reforço do compromisso e conclusão oficial do ciclo anual de capacitação.", legalBasis: "Art. 6º, X; Art. 50", completed: false, sentDate: null }
];

// =========================================================================
// GESTÃO DE ESTADO E PERSISTÊNCIA LOCALSTORAGE
// =========================================================================

function getStoredRoadmapTasks() {
  try {
    const saved = localStorage.getItem("AC_ENGENHARIA_ROADMAP_V1");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Falha ao ler roadmap tasks", e);
  }
  localStorage.setItem("AC_ENGENHARIA_ROADMAP_V1", JSON.stringify(ROADMAP_TASKS));
  return JSON.parse(JSON.stringify(ROADMAP_TASKS));
}

function saveStoredRoadmapTasks(tasks) {
  localStorage.setItem("AC_ENGENHARIA_ROADMAP_V1", JSON.stringify(tasks));
}

function toggleRoadmapTask(taskId) {
  const tasks = getStoredRoadmapTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    saveStoredRoadmapTasks(tasks);
    renderRoadmapUI();
    const actorName = window.AuthState && window.AuthState.currentUser ? window.AuthState.currentUser.name : "Operador SGSI";
    if (window.ApiService && window.ApiService.addAuditRecord) {
      window.ApiService.addAuditRecord({
        category: "PLANO_DE_ACAO",
        severity: "INFO",
        actor: actorName,
        description: `Tarefa [ID #${task.id}] "${task.title}" marcada como [${task.completed ? 'CONCLUÍDA' : 'PENDENTE'}].`,
        target_module: "Plano de Ação e Roadmap"
      });
    }
    showToast(`Tarefa [${task.id}] ${task.completed ? 'concluída' : 'marcada como pendente'}!`, task.completed ? "success" : "info");
  }
}

function handleCreateTask(e) {
  e.preventDefault();
  const title = document.getElementById("task-input-title").value.trim();
  const phase = parseInt(document.getElementById("task-input-phase").value, 10) || 1;
  const cost = document.getElementById("task-input-cost").value.trim();
  const effort = document.getElementById("task-input-effort").value;
  const moduleLink = document.getElementById("task-input-module").value;
  const responsible = document.getElementById("task-input-responsible").value.trim() || (window.AuthState && window.AuthState.currentUser ? window.AuthState.currentUser.name : "Gestão SGSI");
  const howTo = document.getElementById("task-input-howto").value.trim();
  const desc = document.getElementById("task-input-desc").value.trim();

  const tasks = getStoredRoadmapTasks();
  const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

  const newTask = {
    id: nextId,
    phase: phase,
    title: title,
    cost: cost || "Custo Zero",
    effort: effort || "Baixo",
    linkModule: moduleLink || "raci",
    desc: desc,
    howTo: howTo || "Executar as diretrizes técnicas e operacionais estabelecidas pelo SGSI.",
    obs: `Responsável designado: ${responsible}`,
    completed: false
  };

  tasks.push(newTask);
  saveStoredRoadmapTasks(tasks);

  if (window.closeModal) window.closeModal("modal-new-task");
  document.getElementById("form-new-task").reset();

  activeRoadmapPhase = phase;
  setRoadmapPhaseTab(phase);
  renderRoadmapUI();

  if (window.showToast) {
    window.showToast(`Nova tarefa #${nextId} cadastrada com sucesso!`, "success");
  }

  if (window.ApiService && typeof window.ApiService.addAuditRecord === 'function') {
    window.ApiService.addAuditRecord({
      category: "PLANO_DE_ACAO",
      severity: "INFO",
      actor: responsible,
      description: `Nova tarefa de implantação cadastrada: [ID #${nextId}] "${title}" na Fase ${phase} (${cost}).`,
      target_module: "Plano de Ação e Roadmap"
    });
  }
}

async function deleteRoadmapTask(taskId) {
  const ok = await (window.showConfirmDialog ? window.showConfirmDialog({
    title: "Remover Tarefa do Cronograma",
    message: `Deseja realmente remover a tarefa <span class="font-bold text-slate-900 font-mono">#${taskId}</span> do plano de ação?`,
    detail: "O progresso percentual das tarefas de adequação do SGSI & LGPD será recalculado automaticamente.",
    confirmText: "Sim, Remover Tarefa",
    cancelText: "Cancelar",
    type: "danger"
  }) : Promise.resolve(confirm(`Deseja realmente remover a tarefa #${taskId} do plano de ação?`)));

  if (!ok) return;

  let tasks = getStoredRoadmapTasks();
  tasks = tasks.filter(t => t.id !== taskId);
  saveStoredRoadmapTasks(tasks);
  renderRoadmapUI();
  if (window.showToast) {
    window.showToast(`Tarefa #${taskId} removida do plano de ação.`, "info");
  }
}

const TASK_ROLES_MAP = {
  1: ['rh_sst', 'dpo', 'diretoria'],
  2: ['secops', 'dpo', 'diretoria'],
  3: ['secops', 'gestor_obra'],
  4: ['gestor_obra', 'secops'],
  5: ['secops'],
  6: ['dpo', 'rh_sst'],
  7: ['secops'],
  8: ['dpo', 'diretoria'],
  9: ['secops', 'dpo'],
  10: ['dpo', 'gestor_obra'],
  11: ['secops', 'gestor_obra'],
  12: ['secops', 'gestor_obra'],
  13: ['secops', 'dpo'],
  14: ['dpo', 'gestor_obra'],
  15: ['secops', 'rh_sst'],
  16: ['gestor_obra', 'rh_sst'],
  17: ['dpo'],
  18: ['secops', 'gestor_obra'],
  19: ['secops', 'gestor_obra'],
  20: ['secops', 'dpo'],
  21: ['secops'],
  22: ['secops'],
  23: ['secops', 'gestor_obra'],
  24: ['secops', 'gestor_obra']
};

let activeRoadmapPhase = 1;
let activeRoadmapStatusFilter = 'all';
let activeRoadmapOnlyRole = false;

function toggleRoadmapRoleFilter() {
  activeRoadmapOnlyRole = !activeRoadmapOnlyRole;
  const btn = document.getElementById("btn-roadmap-role-filter");
  if (btn) {
    if (activeRoadmapOnlyRole) {
      btn.className = "px-2.5 py-1 font-bold rounded-lg bg-[#004b93] text-white text-[11px] transition-colors cursor-pointer shadow-2xs flex items-center gap-1";
    } else {
      btn.className = "px-2.5 py-1 font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-[11px] transition-colors cursor-pointer flex items-center gap-1";
    }
  }
  renderRoadmapUI();
}

function setRoadmapPhaseTab(phaseNum) {
  activeRoadmapPhase = phaseNum;
  for (let p = 1; p <= 4; p++) {
    const btn = document.getElementById(`btn-phase-tab-${p}`);
    if (btn) {
      if (p === phaseNum) {
        btn.className = "px-3 py-1.5 font-bold rounded-lg bg-[#004b93] text-white shadow-2xs text-xs whitespace-nowrap transition-colors";
      } else {
        btn.className = "px-3 py-1.5 font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs whitespace-nowrap transition-colors";
      }
    }
  }
  renderRoadmapUI();
}

function setRoadmapStatusFilter(filter) {
  activeRoadmapStatusFilter = filter;
  ['all', 'pending', 'done'].forEach(f => {
    const btn = document.getElementById(`btn-roadmap-filter-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = "px-2.5 py-1 font-bold rounded-lg bg-[#004b93] text-white text-[11px] transition-colors cursor-pointer shadow-2xs";
      } else {
        btn.className = "px-2.5 py-1 font-medium rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-[11px] transition-colors cursor-pointer";
      }
    }
  });
  renderRoadmapUI();
}

function renderRoadmapUI() {
  const tasks = getStoredRoadmapTasks();
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Top Progress in Full Roadmap Card
  const txt = document.getElementById("roadmap-progress-text");
  const bar = document.getElementById("roadmap-progress-bar");
  const badge = document.getElementById("roadmap-badge-status");

  if (txt) txt.textContent = `${done} de ${total} Concluídos (${pct}%)`;
  if (bar) {
    bar.style.width = `${pct}%`;
    bar.className = pct === 100 
      ? "bg-emerald-600 h-full rounded-full transition-all duration-500" 
      : "bg-[#004b93] h-full rounded-full transition-all duration-500";
  }
  if (badge) {
    if (pct === 100) {
      badge.className = "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300";
      badge.textContent = "100% Concluído";
    } else {
      badge.className = "px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200";
      badge.textContent = `${pct}% Concluído`;
    }
  }

  // Cockpit Summary Progress (Aba Executiva)
  const cockpitTxt = document.getElementById("roadmap-cockpit-progress-text");
  const cockpitBar = document.getElementById("roadmap-cockpit-progress-bar");
  if (cockpitTxt) cockpitTxt.textContent = `${done} de ${total} Concluídas (${pct}%)`;
  if (cockpitBar) {
    cockpitBar.style.width = `${pct}%`;
    cockpitBar.className = pct === 100 
      ? "bg-emerald-600 h-full rounded-full transition-all duration-500" 
      : "bg-[#004b93] h-full rounded-full transition-all duration-500";
  }

  // Phase Tab Counts
  for (let p = 1; p <= 4; p++) {
    const phaseTasks = tasks.filter(t => t.phase === p);
    const pDone = phaseTasks.filter(t => t.completed).length;
    const badgeEl = document.getElementById(`phase-badge-count-${p}`);
    if (badgeEl) badgeEl.textContent = `${pDone}/${phaseTasks.length}`;
  }

  // Update Filter Buttons Text with Counts for Active Phase
  const currentPhaseAll = tasks.filter(t => t.phase === activeRoadmapPhase);
  const currentPhasePending = currentPhaseAll.filter(t => !t.completed);
  const currentPhaseDone = currentPhaseAll.filter(t => t.completed);

  const btnAll = document.getElementById("btn-roadmap-filter-all");
  const btnPending = document.getElementById("btn-roadmap-filter-pending");
  const btnDone = document.getElementById("btn-roadmap-filter-done");
  if (btnAll) btnAll.textContent = `Todas (${currentPhaseAll.length})`;
  if (btnPending) btnPending.textContent = `Pendentes (${currentPhasePending.length})`;
  if (btnDone) btnDone.textContent = `Concluídas (${currentPhaseDone.length})`;

  // Render Tasks for Active Phase & Filter
  const container = document.getElementById("roadmap-phase-tasks-list");
  if (container) {
    container.innerHTML = "";

    const currentRole = (window.State && window.State.currentRole) || 'gestor_obra';
    let filteredTasks = currentPhaseAll;
    if (activeRoadmapOnlyRole) {
      filteredTasks = filteredTasks.filter(t => (TASK_ROLES_MAP[t.id] || []).includes(currentRole));
    }
    if (activeRoadmapStatusFilter === 'pending') {
      filteredTasks = filteredTasks.filter(t => !t.completed);
    } else if (activeRoadmapStatusFilter === 'done') {
      filteredTasks = filteredTasks.filter(t => t.completed);
    }

    if (filteredTasks.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <i data-lucide="inbox" class="w-6 h-6 mx-auto mb-1 text-slate-400"></i>
          Nenhuma tarefa encontrada neste filtro (${activeRoadmapOnlyRole ? 'nenhuma tarefa desta fase para o seu papel' : activeRoadmapStatusFilter === 'pending' ? 'todas estão concluídas!' : 'nenhuma tarefa'}).
        </div>
      `;
    } else {
      filteredTasks.forEach(task => {
        const isDone = task.completed;
        const itemEl = document.createElement("div");
        itemEl.className = `p-3.5 rounded-xl border transition-all ${isDone ? 'bg-emerald-50/30 border-emerald-200/90' : 'bg-white border-slate-200/90 hover:border-blue-300 shadow-2xs'}`;

        const costBadgeColor = task.cost.includes("Zero") ? "bg-emerald-100 text-emerald-800 border-emerald-200" : task.cost.includes("Tempo") ? "bg-blue-100 text-[#004b93] border-blue-200" : "bg-purple-100 text-purple-800 border-purple-200";
        const effortBadgeColor = task.effort === "Baixo" ? "bg-slate-100 text-slate-700" : task.effort === "Médio" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800";

        itemEl.innerHTML = `
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleRoadmapTask(${task.id})" class="mt-1 w-4 h-4 rounded text-[#004b93] focus:ring-[#004b93] border-slate-300 cursor-pointer shrink-0" title="${isDone ? 'Marcar como pendente' : 'Marcar como concluída'}" />
              <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${isDone ? 'bg-emerald-200/60 text-emerald-900' : 'bg-slate-200 text-slate-700'}">ID #${task.id}</span>
                  <h4 class="text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}">${task.title}</h4>
                </div>
                <p class="text-xs text-slate-600 leading-snug">${task.desc}</p>
                
                <!-- Passo a passo colapsável com <details> para não poluir visualmente a tela -->
                <details class="group mt-1.5">
                  <summary class="text-[11px] font-semibold text-[#004b93] hover:text-[#003d78] cursor-pointer flex items-center gap-1 select-none py-0.5">
                    <i data-lucide="chevron-right" class="w-3.5 h-3.5 transition-transform group-open:rotate-90 text-[#004b93]"></i>
                    <span>Ver Passo a Passo & Instruções Técnicas</span>
                  </summary>
                  <div class="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 space-y-1 mt-1">
                    <div class="font-semibold text-slate-800 flex items-center gap-1">
                      <i data-lucide="wrench" class="w-3.5 h-3.5 text-[#004b93]"></i>
                      <span>Como Fazer / Passo a Passo:</span>
                    </div>
                    <p class="text-slate-600 leading-relaxed">${task.howTo}</p>
                    ${task.obs ? `<div class="text-[10px] text-blue-900 font-medium pt-0.5">💡 <em>${task.obs}</em></div>` : ''}
                  </div>
                </details>
              </div>
            </div>

            <div class="flex flex-col items-end gap-1.5 shrink-0 text-right">
              <div class="flex items-center gap-1">
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${costBadgeColor}">${task.cost}</span>
                <span class="text-[10px] font-medium px-2 py-0.5 rounded-full ${effortBadgeColor}">Esf: ${task.effort}</span>
              </div>
              <div class="flex items-center gap-1.5 pt-1">
                <button onclick="deleteRoadmapTask(${task.id})" class="p-1 text-slate-300 hover:text-rose-600 rounded transition-colors cursor-pointer" title="Remover Tarefa">
                  <i data-lucide="trash" class="w-3 h-3"></i>
                </button>
                <button onclick="switchTab('${task.linkModule}')${task.subtab ? `; if (typeof switch${capitalize(task.linkModule)}Subtab === 'function') switch${capitalize(task.linkModule)}Subtab('${task.subtab}')` : ''}" class="text-[11px] font-semibold text-[#004b93] hover:underline flex items-center gap-1 cursor-pointer">
                  <span>Abrir Módulo</span>
                  <i data-lucide="arrow-right" class="w-3 h-3"></i>
                </button>
              </div>
            </div>
          </div>
        `;
        container.appendChild(itemEl);
      });
    }
  }

  // Render Top 3 Pending Tasks in Executive Cockpit Mini-Widget
  const cockpitTasksContainer = document.getElementById("roadmap-cockpit-tasks");
  if (cockpitTasksContainer) {
    cockpitTasksContainer.innerHTML = "";
    const currentRole = (window.State && window.State.currentRole) || 'gestor_obra';
    const rolePendingList = tasks.filter(t => !t.completed && (TASK_ROLES_MAP[t.id] || []).includes(currentRole));
    const pendingList = rolePendingList.length > 0 ? rolePendingList.slice(0, 3) : tasks.filter(t => !t.completed).slice(0, 3);
    if (pendingList.length === 0) {
      cockpitTasksContainer.innerHTML = `
        <div class="p-3 text-center text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center gap-2">
          <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
          <span>Todas as suas tarefas prioritárias foram concluídas com sucesso!</span>
        </div>
      `;
    } else {
      pendingList.forEach(t => {
        const row = document.createElement("div");
        row.className = "p-2.5 rounded-xl bg-slate-50/90 border border-slate-200/80 hover:bg-blue-50/40 hover:border-blue-200 transition-all flex items-start gap-2.5 text-xs shadow-2xs";
        row.innerHTML = `
          <input type="checkbox" onchange="toggleRoadmapTask(${t.id})" class="mt-0.5 w-4 h-4 rounded text-[#004b93] border-slate-300 cursor-pointer shrink-0" title="Marcar como concluída" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold bg-blue-100/70 text-[#004b93]">Fase ${t.phase}</span>
              <h5 class="font-bold text-slate-800 text-[11px] truncate">${t.title}</h5>
            </div>
            <p class="text-[10px] text-slate-500 truncate mt-0.5">${t.desc}</p>
          </div>
          <span class="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 shrink-0">${t.cost}</span>
        `;
        cockpitTasksContainer.appendChild(row);
      });
    }
  }

  if (window.lucide) window.lucide.createIcons();
}

function capitalize(s) {
  if (!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// =========================================================================
// GESTÃO DE ESTADO DAS 52 SEMANAS DE CAMPANHAS ANPD
// =========================================================================

function getStoredCampaigns() {
  try {
    const saved = localStorage.getItem("AC_ENGENHARIA_CAMPAIGNS_V1");
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn("Falha ao ler campanhas", e);
  }
  localStorage.setItem("AC_ENGENHARIA_CAMPAIGNS_V1", JSON.stringify(ANPD_CAMPAIGNS_DATA));
  return JSON.parse(JSON.stringify(ANPD_CAMPAIGNS_DATA));
}

function saveStoredCampaigns(campaigns) {
  localStorage.setItem("AC_ENGENHARIA_CAMPAIGNS_V1", JSON.stringify(campaigns));
}

function toggleCampaignStatus(weekNum) {
  const campaigns = getStoredCampaigns();
  const c = campaigns.find(item => item.week === weekNum);
  if (c) {
    c.completed = !c.completed;
    c.sentDate = c.completed ? new Date().toLocaleDateString('pt-BR') : null;
    saveStoredCampaigns(campaigns);
    renderCampaignsModule();
    if (window.ApiService && window.ApiService.logAudit) {
      window.ApiService.logAudit(`CAMPANHA_ANPD_DISPARADA: Semana ${c.week} - "${c.title}" (${c.completed ? 'ENVIADA' : 'CANCELADA'})`, "LGPD_TREINAMENTO");
    }
    showToast(`Pílula Semana #${c.week} ${c.completed ? 'registrada como disparada aos colaboradores!' : 'marcada como pendente.'}`, c.completed ? "success" : "info");
  }
}

const CampaignFilterState = {
  search: "",
  phase: "all",
  status: "all"
};

function applyCampaignFilters() {
  const searchInput = document.getElementById("filter-campaign-search");
  const phaseSelect = document.getElementById("filter-campaign-phase");
  const statusSelect = document.getElementById("filter-campaign-status");

  if (searchInput) CampaignFilterState.search = searchInput.value.trim().toLowerCase();
  if (phaseSelect) CampaignFilterState.phase = phaseSelect.value;
  if (statusSelect) CampaignFilterState.status = statusSelect.value;

  renderCampaignsModule();
}

function clearCampaignFilters() {
  const searchInput = document.getElementById("filter-campaign-search");
  const phaseSelect = document.getElementById("filter-campaign-phase");
  const statusSelect = document.getElementById("filter-campaign-status");

  if (searchInput) searchInput.value = "";
  if (phaseSelect) phaseSelect.value = "all";
  if (statusSelect) statusSelect.value = "all";

  CampaignFilterState.search = "";
  CampaignFilterState.phase = "all";
  CampaignFilterState.status = "all";

  renderCampaignsModule();
}

function renderCampaignsModule() {
  const campaigns = getStoredCampaigns();
  const tbody = document.getElementById("campaign-table-body");
  if (!tbody) return;
  tbody.innerHTML = "";

  const total = campaigns.length;
  const done = campaigns.filter(c => c.completed).length;
  const pct = Math.round((done / total) * 100);

  // KPIs
  const kpiDone = document.getElementById("campaign-kpi-done");
  const kpiBar = document.getElementById("campaign-kpi-bar");
  const countEl = document.getElementById("campaign-table-count");

  if (kpiDone) kpiDone.textContent = `${done} / ${total} (${pct}%)`;
  if (kpiBar) kpiBar.style.width = `${pct}%`;

  // Filter
  const filtered = campaigns.filter(c => {
    const q = CampaignFilterState.search;
    const matchQ = !q || c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q) || c.legalBasis.toLowerCase().includes(q) || String(c.week).includes(q);
    const matchPhase = CampaignFilterState.phase === "all" || c.phase === CampaignFilterState.phase;
    const matchStatus = CampaignFilterState.status === "all" || (CampaignFilterState.status === "done" ? c.completed : !c.completed);
    return matchQ && matchPhase && matchStatus;
  });

  if (countEl) countEl.textContent = `${filtered.length} de ${total} Semanas`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-400 text-xs">Nenhuma pílula encontrada com os filtros aplicados.</td></tr>`;
    return;
  }

  filtered.forEach(c => {
    const tr = document.createElement("tr");
    tr.className = `hover:bg-blue-50/40 transition-colors ${c.completed ? 'bg-emerald-50/20' : ''}`;

    const statusBadge = c.completed
      ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200"><i data-lucide="check" class="w-3 h-3"></i> Enviada (${c.sentDate || '2026'})</span>`
      : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-slate-100 text-slate-600 border border-slate-200"><i data-lucide="clock" class="w-3 h-3"></i> Pendente</span>`;

    tr.innerHTML = `
      <td class="py-3 px-3 text-center font-mono font-bold text-slate-700">${c.week}</td>
      <td class="py-3 px-3">
        <span class="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 block truncate max-w-[170px]" title="${c.phase}">${c.phase}</span>
      </td>
      <td class="py-3 px-4 font-semibold text-slate-900 text-xs">${c.title}</td>
      <td class="py-3 px-4 text-xs text-slate-600 leading-snug">${c.desc}</td>
      <td class="py-3 px-3 font-mono text-[11px] text-[#004b93] font-medium whitespace-nowrap">${c.legalBasis}</td>
      <td class="py-3 px-3 text-center">${statusBadge}</td>
      <td class="py-3 px-3 text-right">
        <button onclick="toggleCampaignStatus(${c.week})" class="px-2.5 py-1 text-xs font-semibold rounded ${c.completed ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300' : 'bg-[#004b93] hover:bg-[#003d78] text-white shadow-2xs'} transition-colors cursor-pointer">
          ${c.completed ? 'Reabrir' : 'Disparar'}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  if (window.lucide) window.lucide.createIcons();
}

// Exposição global explícita
window.renderCampaignsModule = renderCampaignsModule;
window.toggleCampaignStatus = toggleCampaignStatus;
window.applyCampaignFilters = applyCampaignFilters;
window.clearCampaignFilters = clearCampaignFilters;
window.setRoadmapPhaseTab = setRoadmapPhaseTab;
window.setRoadmapStatusFilter = setRoadmapStatusFilter;
window.toggleRoadmapTask = toggleRoadmapTask;
window.renderRoadmapUI = renderRoadmapUI;
window.handleCreateTask = handleCreateTask;
window.deleteRoadmapTask = deleteRoadmapTask;
window.TASK_ROLES_MAP = TASK_ROLES_MAP;

// Inicializadores
document.addEventListener("DOMContentLoaded", () => {
  renderRoadmapUI();
  if (document.getElementById("campaign-table-body")) {
    renderCampaignsModule();
  }
});
