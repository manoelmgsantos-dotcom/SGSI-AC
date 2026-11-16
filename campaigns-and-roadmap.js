// =========================================================================
// AC ENGENHARIA - SGSI & GRC DE OBRAS
// Módulo: Plano Priorizado de Tarefas (19+5 Tarefas) & Campanhas ANPD (52 Semanas)
// =========================================================================

// 1. Catálogo Oficial das 17 Tarefas do Plano de Ação Estrutural (Fase 1 a Fase 4)
const ROADMAP_TASKS = [
  // FASE 1: PROTEÇÃO DE INFRAESTRUTURA E IDENTIDADE (FUNDAÇÃO)
  {
    id: 1,
    code: "1.1",
    phase: 1,
    phaseName: "Fase 1: Infraestrutura & Identidade (Fundação)",
    title: "Controle de Privilégios e Identidade",
    desc: "Aplicar o princípio do menor privilégio, garantindo que usuários comuns não tenham direitos administrativos e limitando a superfície de ataque lateral.",
    cost: "Zero / GPO",
    effort: "Médio",
    status: "Concluído",
    completed: true,
    howTo: "Configuração de GPOs no Active Directory para gerenciar estritamente os grupos de administradores locais. Criação de contas táticas segregadas para a equipe de TI e manutenção de contas locais isoladas apenas para uso como fallback em manutenções físicas.",
    obs: "Evidência: Relatório do AD mostrando grupos de segurança atualizados e GPOs ativas bloqueando contas e heranças não autorizadas nos endpoints. [Modelos: MOD-USR-01 e MOD-USR-03]",
    linkModule: "users",
    subtab: ""
  },
  {
    id: 2,
    code: "1.2",
    phase: 1,
    phaseName: "Fase 1: Infraestrutura & Identidade (Fundação)",
    title: "Segregação Lógica de Redes",
    desc: "Isolar totalmente dispositivos não gerenciados do tráfego corporativo e dos servidores internos.",
    cost: "Zero / Firewall",
    effort: "Médio",
    status: "Concluído",
    completed: true,
    howTo: "Configuração de interfaces dedicadas no roteador de borda/firewall (como o MikroTik) com pools de DHCP independentes e regras de drop restritivas que impedem o roteamento entre o range de IPs de visitantes e as sub-redes corporativas.",
    obs: "Evidência: Tabela de regras de firewall exportada demonstrando as políticas de negação e logs de bloqueio de tráfego inter-redes. [Modelos: MOD-SEC-01 e MOD-OBR-01]",
    linkModule: "secops",
    subtab: "assets"
  },
  {
    id: 3,
    code: "1.3",
    phase: 1,
    phaseName: "Fase 1: Infraestrutura & Identidade (Fundação)",
    title: "Proteção e Monitoramento de Endpoints",
    desc: "Detectar, bloquear e registrar comportamentos anômalos, malwares e tentativas de intrusão em tempo real.",
    cost: "Licença EDR",
    effort: "Médio",
    status: "Concluído",
    completed: true,
    howTo: "Implantação de EDR (como Bitdefender) em todas as estações e servidores, com integração de logs a um SIEM/XDR (como Wazuh) para centralização e correlação de eventos de segurança.",
    obs: "Evidência: Dashboards demonstrando a integridade dos agentes, ausência de falhas de comunicação e retenção do histórico de alertas centralizados. [Modelo: MOD-SEC-04]",
    linkModule: "secops",
    subtab: "wazuh"
  },
  {
    id: 4,
    code: "1.4",
    phase: 1,
    phaseName: "Fase 1: Infraestrutura & Identidade (Fundação)",
    title: "Inventário Centralizado de Ativos",
    desc: "Manter visibilidade absoluta sobre a infraestrutura técnica. Não é possível proteger um ambiente sem mapear sua totalidade.",
    cost: "Tempo Técnico / CMDB",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Levantamento exaustivo (via ferramenta de ITSM ou planilha estruturada) de todo hardware corporativo, licenças de software e serviços autorizados em nuvem.",
    obs: "Evidência: Base de dados (CMDB) atualizada contendo hostname, endereço MAC, IP, sistema operacional e proprietário associado ao ativo. [Modelo: MOD-SEC-05]",
    linkModule: "secops",
    subtab: "assets"
  },

  // FASE 2: ESTRUTURAÇÃO LGPD E FATOR HUMANO
  {
    id: 5,
    code: "2.1",
    phase: 2,
    phaseName: "Fase 2: Estruturação LGPD & Fator Humano",
    title: "Conscientização Contínua em Segurança",
    desc: "Mitigar o risco associado a falhas humanas, engenharia social e uso inadvertido de tecnologias não homologadas.",
    cost: "Zero / Campanha",
    effort: "Baixo",
    status: "Concluído",
    completed: true,
    howTo: "Execução de trilha de capacitação periódica (campanha anual de 52 semanas) abordando criação de senhas seguras, identificação de phishing, riscos no uso de IAs públicas e manuseio de fraudes financeiras (ex: golpes de boletos).",
    obs: "Evidência: Cronograma documentado das campanhas executadas, listas de presença/confirmação de leitura e material de apoio arquivado. [Modelo: MOD-GOV-04]",
    linkModule: "raci",
    subtab: "campaigns"
  },
  {
    id: 6,
    code: "2.2",
    phase: 2,
    phaseName: "Fase 2: Estruturação LGPD & Fator Humano",
    title: "Mapeamento de Fluxos de Dados",
    desc: "Mapear o ciclo de vida da informação (coleta, uso, armazenamento e descarte) dentro dos processos de negócio.",
    cost: "Tempo Técnico",
    effort: "Médio",
    status: "Concluído",
    completed: true,
    howTo: "Rastreamento técnico de como os dados pessoais e financeiros trafegam, com foco especial nas plataformas críticas de gestão (como ERP Sienge, ferramentas de CRM e portais de recrutamento).",
    obs: "Evidência: Diagramas de fluxo de dados (DFD) formalizados, identificando os sistemas de origem e destino das informações críticas. [Modelo: MOD-LGP-01]",
    linkModule: "integrations",
    subtab: ""
  },
  {
    id: 7,
    code: "2.3",
    phase: 2,
    phaseName: "Fase 2: Estruturação LGPD & Fator Humano",
    title: "ROPA (Registro de Operações de Tratamento de Dados)",
    desc: "Cumprir o Artigo 37 da LGPD, que exige a manutenção de um registro detalhado de todas as operações de tratamento de dados pessoais.",
    cost: "Tempo DPO",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Preenchimento de documento formal detalhando o processo de negócio, a finalidade do tratamento, a base legal aplicável (ex: execução de contrato, legítimo interesse), a categoria de dados coletados e o prazo de retenção.",
    obs: "Evidência: Planilha ou sistema de ROPA atualizado e aprovado pela alta gestão/DPO. [Modelo: MOD-LGP-04]",
    linkModule: "lgpd",
    subtab: "ropa"
  },
  {
    id: 8,
    code: "2.4",
    phase: 2,
    phaseName: "Fase 2: Estruturação LGPD & Fator Humano",
    title: "Matriz de Responsabilidades (RACI)",
    desc: "Eliminar ambiguidades sobre papéis, governança e alçadas de decisão técnica e legal.",
    cost: "Governança",
    effort: "Médio",
    status: "Pendente",
    completed: false,
    howTo: "Criação de matriz definindo claramente quem é Responsável (R), Aprovador (A), Consultado (C) e Informado (I) para cada processo do SGSI (desde a aprovação de acessos até a resposta a vazamentos).",
    obs: "Evidência: Documento RACI assinado e disponibilizado para consulta interna. [Modelo: MOD-GOV-06]",
    linkModule: "raci",
    subtab: "matrix"
  },

  // FASE 3: DOCUMENTAÇÃO E GOVERNANÇA CENTRALIZADA
  {
    id: 9,
    code: "3.1",
    phase: 3,
    phaseName: "Fase 3: Documentação & Governança Centralizada",
    title: "Política de Segurança da Informação (PSI)",
    desc: "Formalizar as diretrizes e regras internas da empresa para o uso aceitável de recursos tecnológicos e proteção da propriedade intelectual.",
    cost: "Governança",
    effort: "Médio",
    status: "Pendente",
    completed: false,
    howTo: "Redação de um documento oficial proibindo práticas de risco e detalhando as expectativas de segurança para e-mail corporativo, acesso remoto e manuseio de equipamentos físicos.",
    obs: "Evidência: Documento mestre da PSI com termo de aceite (físico ou digital) assinado por todos os colaboradores diretos e indiretos. [Modelo: MOD-GOV-05]",
    linkModule: "raci",
    subtab: "policies"
  },
  {
    id: 10,
    code: "3.2",
    phase: 3,
    phaseName: "Fase 3: Documentação & Governança Centralizada",
    title: "Política de Controle de Acesso",
    desc: "Padronizar e documentar a justificativa para concessão, revisão periódica e revogação de acessos lógicos.",
    cost: "Tempo Técnico",
    effort: "Médio",
    status: "Pendente",
    completed: false,
    howTo: "Estabelecer fluxo exigindo aprovação formal dos gestores antes da criação de contas no AD ou permissões no ERP, atrelado a processo rigoroso de bloqueio imediato no ato de desligamentos.",
    obs: "Evidência: Histórico de tickets/requisições de acesso com aprovação formal e logs de auditoria semestral atestando a ausência de contas órfãs. [Modelos: MOD-GOV-07 e MOD-USR-02]",
    linkModule: "users",
    subtab: ""
  },
  {
    id: 11,
    code: "3.3",
    phase: 3,
    phaseName: "Fase 3: Documentação & Governança Centralizada",
    title: "Plano de Resposta a Incidentes (PRI)",
    desc: "Garantir uma reação estruturada, rápida e legalmente embasada durante crises cibernéticas (ransomware, invasões ou vazamentos).",
    cost: "Tempo Técnico / DPO",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Manual operacional listando a cadeia hierárquica de acionamento, os passos técnicos para isolamento de rede, os procedimentos de contenção, e o fluxo de notificação à ANPD em caso de incidente com dados pessoais.",
    obs: "Evidência: Documento do PRI finalizado e relatórios de execução de exercícios de simulação de crise (Tabletop exercises). [Modelos: MOD-SEC-02 e MOD-LGP-05]",
    linkModule: "secops",
    subtab: "incidents"
  },
  {
    id: 12,
    code: "3.4",
    phase: 3,
    phaseName: "Fase 3: Documentação & Governança Centralizada",
    title: "Política de Retenção e Descarte Seguro",
    desc: "Evitar a manutenção de dados sensíveis além do período necessário ou permitido pela legislação, reduzindo a exposição passiva ao risco.",
    cost: "Governança / TI",
    effort: "Médio",
    status: "Pendente",
    completed: false,
    howTo: "Definição em política dos prazos máximos para guarda de arquivos (currículos, contratos inativos, logs de sistema) e estabelecimento de procedimentos técnicos para exclusão irreversível ou destruição física de mídias de armazenamento.",
    obs: "Evidência: Rotinas sistêmicas de deleção em massa documentadas e laudos ou recibos de destruição física de HDDs/SSDs. [Modelos: MOD-OBR-02, MOD-OBR-03B e MOD-SEC-03]",
    linkModule: "evidence",
    subtab: "templates"
  },
  {
    id: 13,
    code: "3.5",
    phase: 3,
    phaseName: "Fase 3: Documentação & Governança Centralizada",
    title: "Processo de Due Diligence de Terceiros",
    desc: "Avaliar preventivamente a postura de segurança de parceiros de negócio e fornecedores que se conectam ao ambiente corporativo.",
    cost: "Jurídico / Suprimentos",
    effort: "Médio",
    status: "Pendente",
    completed: false,
    howTo: "Criação de um questionário obrigatório de avaliação de conformidade cibernética e de adequação à LGPD, aplicado como pré-requisito para contratação ou integração de sistemas.",
    obs: "Evidência: Questionários respondidos, avaliados por risco e anexados aos contratos de prestação de serviço. [Modelos: MOD-LGP-03 e MOD-SEC-06]",
    linkModule: "lgpd",
    subtab: "dpa"
  },

  // FASE 4: GESTÃO DE RISCOS E CONTINUIDADE
  {
    id: 14,
    code: "4.1",
    phase: 4,
    phaseName: "Fase 4: Gestão de Riscos & Continuidade",
    title: "Matriz de Riscos de TI e Privacidade",
    desc: "Identificar, classificar e tratar formalmente as ameaças ao negócio, traduzindo problemas técnicos em impacto financeiro/operacional.",
    cost: "Governança ISO 27005",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Mapeamento visual em formato de Heatmap (Probabilidade vs. Impacto) abordando ameaças reais, avaliando o grau de exposição e definindo se o risco será mitigado, transferido (seguro cyber), evitado ou aceito.",
    obs: "Evidência: Matriz de riscos formalizada e atualizada, contendo os planos de ação associados a cada risco crítico. [Modelos: MOD-RSK-01 e MOD-RSK-03]",
    linkModule: "risks",
    subtab: "list"
  },
  {
    id: 15,
    code: "4.2",
    phase: 4,
    phaseName: "Fase 4: Gestão de Riscos & Continuidade",
    title: "Relatório de Impacto à Proteção de Dados (RIPD)",
    desc: "Demonstrar à ANPD, quando requisitado, a avaliação prévia e as salvaguardas aplicadas a operações de alto risco aos titulares.",
    cost: "Tempo DPO / Art. 38",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Elaboração do relatório sempre que novos sistemas, ferramentas ou processos de negócio que manipulem grande volume de dados sensíveis forem propostos.",
    obs: "Evidência: Documentos de RIPD elaborados, preenchidos e assinados pela alta gestão. [Modelo: MOD-LGP-07]",
    linkModule: "lgpd",
    subtab: "ropa"
  },
  {
    id: 16,
    code: "4.3",
    phase: 4,
    phaseName: "Fase 4: Gestão de Riscos & Continuidade",
    title: "Plano de Recuperação de Desastres (DRP)",
    desc: "Garantir o retorno rápido à operação funcional após falhas críticas de infraestrutura ou ataques destrutivos.",
    cost: "Infra / Backup AWS",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Documentação detalhando a arquitetura de backups (frequência, retenção, isolamento lógico/físico) e o roteiro exato, passo a passo, para religamento e restauração de servidores e bancos de dados a partir do zero.",
    obs: "Evidência: Logs evidenciando o sucesso das rotinas de backup e relatórios de testes semestrais práticos de restauração em ambiente isolado (restore tests). [Modelos: MOD-SEC-07 e MOD-SEC-08]",
    linkModule: "secops",
    subtab: "assets"
  },
  {
    id: 17,
    code: "4.4",
    phase: 4,
    phaseName: "Fase 4: Gestão de Riscos & Continuidade",
    title: "Auditoria Contínua de Controles",
    desc: "Prevenir a degradação da postura de segurança ao longo do tempo, garantindo que o SGSI opere como um organismo vivo.",
    cost: "Auditoria ISO 27001",
    effort: "Médio",
    status: "Pendente",
    completed: false,
    howTo: "Calendário periódico exigindo a revisão de regras de firewall, execução de scans de vulnerabilidade e recertificação dos acessos lógicos.",
    obs: "Evidência: Atas de reunião da gestão de TI comprovando a revisão periódica das métricas, além de relatórios internos ou externos atestando a eficácia dos controles implantados. [Modelos: MOD-AUD-01 e MOD-AUD-02]",
    linkModule: "audit",
    subtab: ""
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
    const saved = localStorage.getItem("AC_ENGENHARIA_ROADMAP_V3");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === ROADMAP_TASKS.length) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn("Falha ao ler roadmap tasks", e);
  }
  localStorage.setItem("AC_ENGENHARIA_ROADMAP_V3", JSON.stringify(ROADMAP_TASKS));
  return JSON.parse(JSON.stringify(ROADMAP_TASKS));
}

function saveStoredRoadmapTasks(tasks) {
  localStorage.setItem("AC_ENGENHARIA_ROADMAP_V3", JSON.stringify(tasks));
}

function toggleRoadmapTask(taskId) {
  const tasks = getStoredRoadmapTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.completed = !task.completed;
    if (task.completed) {
      task.status = "Concluído";
    } else {
      task.status = (task.id <= 3 ? "Em Andamento" : "Pendente");
    }
    saveStoredRoadmapTasks(tasks);
    renderRoadmapUI();
    const actorName = window.AuthState && window.AuthState.currentUser ? window.AuthState.currentUser.name : "Operador SGSI";
    if (window.ApiService && window.ApiService.addAuditRecord) {
      window.ApiService.addAuditRecord({
        category: "PLANO_DE_ACAO",
        severity: "INFO",
        actor: actorName,
        description: `Tarefa [ID #${task.id}] "${task.title}" marcada como [${(task.status || 'PENDENTE').toUpperCase()}].`,
        target_module: "Plano de Ação e Roadmap"
      });
    }
    if (window.showToast) {
      window.showToast(`Tarefa [${task.id}] ${task.completed ? 'concluída' : 'marcada como ' + task.status}!`, task.completed ? "success" : "info");
    }
  }
}

function setRoadmapTaskStatus(taskId, newStatus) {
  const tasks = getStoredRoadmapTasks();
  const task = tasks.find(t => t.id === taskId);
  if (task) {
    task.status = newStatus;
    task.completed = (newStatus === "Concluído");
    saveStoredRoadmapTasks(tasks);
    renderRoadmapUI();
    const actorName = window.AuthState && window.AuthState.currentUser ? window.AuthState.currentUser.name : "Operador SGSI";
    if (window.ApiService && window.ApiService.addAuditRecord) {
      window.ApiService.addAuditRecord({
        category: "PLANO_DE_ACAO",
        severity: "INFO",
        actor: actorName,
        description: `Tarefa [ID #${task.id}] "${task.title}" teve status atualizado para [${newStatus.toUpperCase()}].`,
        target_module: "Plano de Ação e Roadmap"
      });
    }
    if (window.showToast) {
      window.showToast(`Status da tarefa #${task.id} alterado para "${newStatus}"!`, task.completed ? "success" : "info");
    }
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
  1: ['secops', 'diretoria'],                // 1.1 Controle de Privilégios e Identidade
  2: ['secops', 'gestor_obra'],             // 1.2 Segregação Lógica de Redes
  3: ['secops'],                            // 1.3 Proteção e Monitoramento de Endpoints
  4: ['secops', 'gestor_obra'],             // 1.4 Inventário Centralizado de Ativos
  5: ['rh_sst', 'dpo', 'diretoria'],        // 2.1 Conscientização Contínua em Segurança
  6: ['dpo', 'secops', 'comercial'],        // 2.2 Mapeamento de Fluxos de Dados
  7: ['dpo', 'rh_sst'],                     // 2.3 ROPA (Art. 37 LGPD)
  8: ['secops', 'dpo', 'diretoria'],        // 2.4 Matriz de Responsabilidades (RACI)
  9: ['secops', 'dpo', 'diretoria'],        // 3.1 Política de Segurança da Informação (PSI)
  10: ['secops', 'rh_sst', 'diretoria'],    // 3.2 Política de Controle de Acesso
  11: ['secops', 'dpo', 'diretoria'],       // 3.3 Plano de Resposta a Incidentes (PRI)
  12: ['dpo', 'gestor_obra', 'secops'],     // 3.4 Política de Retenção e Descarte Seguro
  13: ['suprimentos', 'dpo'],               // 3.5 Processo de Due Diligence de Terceiros
  14: ['secops', 'gestor_obra', 'diretoria'],// 4.1 Matriz de Riscos de TI e Privacidade
  15: ['dpo', 'diretoria'],                 // 4.2 Relatório de Impacto à Proteção de Dados (RIPD)
  16: ['secops', 'diretoria'],              // 4.3 Plano de Recuperação de Desastres (DRP)
  17: ['auditoria', 'secops', 'dpo']        // 4.4 Auditoria Contínua de Controles
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
  ['all', 'in_progress', 'pending', 'done'].forEach(f => {
    const btn = document.getElementById(`btn-roadmap-filter-${f}`);
    if (btn) {
      if (f === filter) {
        btn.className = "px-2.5 py-1 font-bold rounded-md bg-[#004b93] text-white text-[11px] transition-colors cursor-pointer shadow-2xs";
      } else {
        btn.className = "px-2.5 py-1 font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-200 text-[11px] transition-colors cursor-pointer";
      }
    }
  });
  renderRoadmapUI();
}

function renderRoadmapUI() {
  const tasks = getStoredRoadmapTasks();
  const total = tasks.length;
  const done = tasks.filter(t => t.completed || t.status === "Concluído").length;
  const inProgress = tasks.filter(t => t.status === "Em Andamento" && !t.completed).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Top Progress in Full Roadmap Card
  const txt = document.getElementById("roadmap-progress-text");
  const bar = document.getElementById("roadmap-progress-bar");
  const badge = document.getElementById("roadmap-badge-status");

  if (txt) txt.textContent = `${done} de ${total} Concluídas (${pct}%) • ${inProgress} Em Andamento`;
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
      badge.textContent = `${pct}% Concluído (${inProgress} Em Andamento)`;
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
    const pDone = phaseTasks.filter(t => t.completed || t.status === "Concluído").length;
    const badgeEl = document.getElementById(`phase-badge-count-${p}`);
    if (badgeEl) badgeEl.textContent = `${pDone}/${phaseTasks.length}`;
  }

  // Update Filter Buttons Text with Counts for Active Phase
  const currentPhaseAll = tasks.filter(t => t.phase === activeRoadmapPhase);
  const currentPhaseInProgress = currentPhaseAll.filter(t => t.status === "Em Andamento" && !t.completed);
  const currentPhasePending = currentPhaseAll.filter(t => (t.status === "Pendente" || !t.status) && !t.completed);
  const currentPhaseDone = currentPhaseAll.filter(t => t.completed || t.status === "Concluído");

  const btnAll = document.getElementById("btn-roadmap-filter-all");
  const btnInProgress = document.getElementById("btn-roadmap-filter-in_progress");
  const btnPending = document.getElementById("btn-roadmap-filter-pending");
  const btnDone = document.getElementById("btn-roadmap-filter-done");

  if (btnAll) btnAll.textContent = `Todas (${currentPhaseAll.length})`;
  if (btnInProgress) btnInProgress.textContent = `Em Andamento (${currentPhaseInProgress.length})`;
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
    if (activeRoadmapStatusFilter === 'in_progress') {
      filteredTasks = filteredTasks.filter(t => t.status === "Em Andamento" && !t.completed);
    } else if (activeRoadmapStatusFilter === 'pending') {
      filteredTasks = filteredTasks.filter(t => (t.status === "Pendente" || !t.status) && !t.completed);
    } else if (activeRoadmapStatusFilter === 'done') {
      filteredTasks = filteredTasks.filter(t => t.completed || t.status === "Concluído");
    }

    if (filteredTasks.length === 0) {
      container.innerHTML = `
        <div class="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
          <i data-lucide="inbox" class="w-6 h-6 mx-auto mb-1 text-slate-400"></i>
          Nenhuma tarefa encontrada neste filtro.
        </div>
      `;
    } else {
      filteredTasks.forEach(task => {
        const isDone = Boolean(task.completed || task.status === "Concluído");
        const isInProgress = task.status === "Em Andamento" && !isDone;
        const itemEl = document.createElement("div");
        itemEl.className = `p-3.5 rounded-xl border transition-all ${
          isDone
            ? 'bg-emerald-50/40 border-emerald-300'
            : isInProgress
            ? 'bg-amber-50/40 border-amber-300 shadow-2xs'
            : 'bg-white border-slate-200 hover:border-blue-300 shadow-2xs'
        }`;

        const costBadgeColor = task.cost.includes("Zero")
          ? "bg-emerald-100 text-emerald-800 border-emerald-200"
          : task.cost.includes("Tempo")
          ? "bg-blue-100 text-[#004b93] border-blue-200"
          : "bg-purple-100 text-purple-800 border-purple-200";

        const effortBadgeColor = task.effort === "Baixo"
          ? "bg-slate-100 text-slate-700"
          : task.effort === "Médio"
          ? "bg-amber-100 text-amber-800"
          : "bg-rose-100 text-rose-800";

        const statusBadgeColor = isDone
          ? "bg-emerald-100 text-emerald-900 border-emerald-300"
          : isInProgress
          ? "bg-amber-100 text-amber-900 border-amber-300"
          : "bg-slate-100 text-slate-700 border-slate-300";

        itemEl.innerHTML = `
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-start gap-3 flex-1 min-w-0">
              <input type="checkbox" ${isDone ? 'checked' : ''} onchange="toggleRoadmapTask(${task.id})" class="mt-1 w-4 h-4 rounded text-[#004b93] focus:ring-[#004b93] border-slate-300 cursor-pointer shrink-0" title="${isDone ? 'Marcar como não concluída' : 'Marcar como concluída'}" />
              <div class="min-w-0 flex-1 space-y-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${isDone ? 'bg-emerald-200/60 text-emerald-900' : 'bg-slate-200 text-slate-700'}">${task.code ? 'Item ' + task.code : 'ID #' + task.id}</span>
                  <h4 class="text-xs font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}">${task.title}</h4>

                  <!-- Seletor Rápido de Status -->
                  <select onchange="setRoadmapTaskStatus(${task.id}, this.value)" class="text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer focus:outline-none transition-colors ${statusBadgeColor}" title="Alterar status operacional">
                    <option value="Em Andamento" ${isInProgress ? 'selected' : ''}>⏳ Em Andamento</option>
                    <option value="Pendente" ${!isInProgress && !isDone ? 'selected' : ''}>⚪ Pendente</option>
                    <option value="Concluído" ${isDone ? 'selected' : ''}>✅ Concluído</option>
                  </select>
                </div>
                <p class="text-xs text-slate-600 leading-snug">${task.desc}</p>
                
                <!-- Passo a passo colapsável com <details> -->
                <details class="group mt-1.5" ${isInProgress ? 'open' : ''}>
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
                    ${task.obs ? `<div class="text-[10px] text-blue-900 font-medium pt-0.5">💡 <em>Observação: ${task.obs}</em></div>` : ''}
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

  // Render Top 3 In Progress / Pending Tasks in Executive Cockpit Mini-Widget
  const cockpitTasksContainer = document.getElementById("roadmap-cockpit-tasks");
  if (cockpitTasksContainer) {
    cockpitTasksContainer.innerHTML = "";
    const currentRole = (window.State && window.State.currentRole) || 'gestor_obra';
    const activeTasks = tasks.filter(t => !t.completed && t.status !== "Concluído");
    const roleActiveList = activeTasks.filter(t => (TASK_ROLES_MAP[t.id] || []).includes(currentRole));
    const pendingList = roleActiveList.length > 0 ? roleActiveList.slice(0, 3) : activeTasks.slice(0, 3);
    if (pendingList.length === 0) {
      cockpitTasksContainer.innerHTML = `
        <div class="p-3 text-center text-xs text-emerald-800 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-center gap-2">
          <i data-lucide="check-circle" class="w-4 h-4 text-emerald-600"></i>
          <span>Todas as suas tarefas prioritárias foram concluídas com sucesso!</span>
        </div>
      `;
    } else {
      pendingList.forEach(t => {
        const isProg = t.status === "Em Andamento";
        const row = document.createElement("div");
        row.className = `p-2.5 rounded-xl border transition-all flex items-start gap-2.5 text-xs shadow-2xs ${
          isProg ? 'bg-amber-50/50 border-amber-300' : 'bg-slate-50/90 border-slate-200/80 hover:bg-blue-50/40'
        }`;
        row.innerHTML = `
          <input type="checkbox" onchange="toggleRoadmapTask(${t.id})" class="mt-0.5 w-4 h-4 rounded text-[#004b93] border-slate-300 cursor-pointer shrink-0" title="Marcar como concluída" />
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${isProg ? 'bg-amber-100 text-amber-800' : 'bg-blue-100/70 text-[#004b93]'}">Fase ${t.phase}</span>
              <h5 class="font-bold text-slate-800 text-[11px] truncate">${t.title}</h5>
              ${isProg ? '<span class="text-[9px] font-bold text-amber-700">⏳ Em Andamento</span>' : ''}
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
window.setRoadmapTaskStatus = setRoadmapTaskStatus;
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
