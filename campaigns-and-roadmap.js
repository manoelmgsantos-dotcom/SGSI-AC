// =========================================================================
// AC ENGENHARIA - SGSI & GRC DE OBRAS
// Módulo: Plano Priorizado de Tarefas (19+5 Tarefas) & Campanhas ANPD (52 Semanas)
// =========================================================================

// 1. Catálogo Oficial das 19 Tarefas do Plano de Ação LGPD & Segurança (Fase 1 a Fase 4)
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
    status: "Em Andamento",
    completed: false,
    howTo: "Usar e-mail, intranet ou grupo de comunicação interna para enviar pílulas semanais (dicas de senhas, phishing). Registrar listas de presença ou confirmações de leitura.",
    obs: "Campanha semanal será iniciada",
    linkModule: "raci",
    subtab: "campaigns"
  },
  {
    id: 2,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Comitê, Políticas e Plano de Resposta a Incidentes",
    desc: "Criar documentos e definir responsáveis para casos de vazamento",
    cost: "Zero (Tempo)",
    effort: "Médio",
    status: "Em Andamento",
    completed: false,
    howTo: "Agendar reunião com a diretoria/RH/TI. Redigir um documento simples definindo uma Matriz RACI para incidentes (quem aciona a ANPD, quem avalia o servidor, etc.) e aprovar.",
    obs: "Documentado na Matriz RACI e Política PSI-001.",
    linkModule: "raci",
    subtab: "matrix"
  },
  {
    id: 3,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Política de Privilégio Mínimo (Remover Admin Local)",
    desc: "Retirar privilégios de administrador das máquinas dos usuários",
    cost: "Zero",
    effort: "Médio",
    status: "Em Andamento",
    completed: false,
    howTo: "No Active Directory (AD) ou no gerenciamento local do Windows, alterar o perfil do usuário de 'Administrador' para 'Usuário Padrão'. Aplicar GPOs se usar AD.",
    obs: "Reduz drasticamente o risco de execução de malwares e ransomwares.",
    linkModule: "raci",
    subtab: "policies"
  },
  {
    id: 4,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Criptografia de Disco (BitLocker / FileVault)",
    desc: "Ativar criptografia nativa e gratuita nos notebooks",
    cost: "Zero",
    effort: "Baixo",
    status: "Pendente",
    completed: false,
    howTo: "No Windows Pro, pesquisar por 'Gerenciar BitLocker' e ativar na unidade C:. Salvar as chaves de recuperação no AD ou em cofre de senhas. No Mac, ativar o 'FileVault'.",
    obs: "Proteção obrigatória para notebooks corporativos em caso de perda ou furto.",
    linkModule: "secops",
    subtab: "assets"
  },
  {
    id: 5,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Ativação de MFA nas Contas em Nuvem",
    desc: "Forçar duplo fator em contas do Google Workspace ou Microsoft 365",
    cost: "Zero",
    effort: "Baixo",
    status: "Pendente",
    completed: false,
    howTo: "No painel de administração (Google Workspace ou Microsoft 365), acessar as políticas de segurança e forçar a 'Verificação em duas etapas' (MFA) para todos os usuários.",
    obs: "Previne comprometimento de credenciais e invasão de e-mails corporativos.",
    linkModule: "raci",
    subtab: "policies"
  },
  {
    id: 6,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Mapeamento de Dados (ROPA) e RIPD",
    desc: "Fazer inventário de dados pessoais (pode ser via planilhas)",
    cost: "Zero (Tempo)",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Criar uma planilha mapeando: Setor, Qual o dado pessoal, Finalidade, Onde é armazenado e Quem acessa. Entrevistar gestores de cada área para preencher.",
    obs: "Exigência expressa do Art. 37 da LGPD para comprovação de conformidade.",
    linkModule: "lgpd",
    subtab: "ropa"
  },
  {
    id: 7,
    phase: 1,
    phaseName: "Fase 1: Custo Zero",
    title: "Criptografia em Trânsito (TLS)",
    desc: "Garantir HTTPS e certificados gratuitos em sites e sistemas internos",
    cost: "Zero",
    effort: "Baixo",
    status: "Pendente",
    completed: false,
    howTo: "Em servidores web ou painéis de hospedagem (como cPanel), emitir certificados gratuitos via Let's Encrypt e configurar o redirecionamento forçado de HTTP para HTTPS.",
    obs: "Garante a confidencialidade das comunicações e tráfego seguro de dados.",
    linkModule: "secops",
    subtab: "assets"
  },

  // FASE 2: CUSTO BAIXO A MÉDIO
  {
    id: 8,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "Ajuste de Regras de Firewall e VPN",
    desc: "Revisar regras, fechar portas desnecessárias e configurar VPN com MFA",
    cost: "Tempo Técnico",
    effort: "Baixo",
    status: "Pendente",
    completed: false,
    howTo: "Acessar o console do firewall, desativar regras 'Any-Any' (abertas), bloquear acesso a portas não utilizadas (ex: RDP 3389 para fora) e configurar a VPN para exigir duplo fator.",
    obs: "Evita exposição indevida da infraestrutura interna à internet pública.",
    linkModule: "secops",
    subtab: "assets"
  },
  {
    id: 9,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "Segmentação de Rede (VLANs)",
    desc: "Separar redes via configuração nos switches atuais gerenciáveis",
    cost: "Tempo Técnico",
    effort: "Médio",
    status: "Pendente",
    completed: false,
    howTo: "Acessar a interface dos switches de rede (gerenciáveis). Criar redes lógicas separadas (ex: VLAN 10 para Servidores, VLAN 20 para Estações) e isolar o tráfego entre elas.",
    obs: "Impede movimentação lateral de ameaças na rede interna corporativa.",
    linkModule: "secops",
    subtab: "assets"
  },
  {
    id: 10,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "Logs e Trilhas de Auditoria",
    desc: "Configurar retenção de logs em sistemas atuais (Windows, Linux, ERP)",
    cost: "Tempo Técnico",
    effort: "Médio",
    status: "Pendente",
    completed: false,
    howTo: "Ativar Políticas de Grupo (GPOs) de auditoria no Windows Server (Logon/Logoff, Acesso a Objetos). Nos sistemas (ERP), checar se as trilhas de log nativas estão ligadas.",
    obs: "Atende aos requisitos de rastreabilidade do Art. 37 da LGPD e ISO 27001.",
    linkModule: "audit",
    subtab: ""
  },
  {
    id: 11,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "Controle de Terceiros (Contratos)",
    desc: "Adicionar cláusulas de LGPD em contratos com apoio do jurídico",
    cost: "Apoio Jurídico",
    effort: "Médio",
    status: "Pendente",
    completed: false,
    howTo: "Solicitar ao jurídico um 'Aditivo de LGPD' padrão. Enviar para todos os fornecedores que processam dados da empresa assinarem e embutir em novas contratações.",
    obs: "Garante a responsabilidade solidária/subsidiária prevista na LGPD.",
    linkModule: "lgpd",
    subtab: "dpa"
  },
  {
    id: 12,
    phase: 2,
    phaseName: "Fase 2: Custo Baixo a Médio",
    title: "RBAC (Controle de Acesso Baseado em Função)",
    desc: "Limitar acessos sistêmicos por função (ERP, CRM)",
    cost: "Tempo Técnico",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Mapear perfis no sistema (ex: ERP). Em vez de dar permissões individuais, criar grupos (ex: 'RH_Leitura', 'Fin_Edição') e adicionar os usuários aos grupos correspondentes.",
    obs: "Aplica o princípio do menor privilégio a nível sistêmico.",
    linkModule: "raci",
    subtab: "matrix"
  },

  // FASE 3: CUSTO MÉDIO
  {
    id: 13,
    phase: 3,
    phaseName: "Fase 3: Custo Médio",
    title: "EDR/XDR (Endpoint Detection and Response)",
    desc: "Substituir antivírus por EDR (OPEX - assinatura por máquina)",
    cost: "Licença Mensal",
    effort: "Baixo",
    status: "Pendente",
    completed: false,
    howTo: "Contratar uma ferramenta EDR (ex: Microsoft Defender for Business, Kaspersky). Distribuir o agente de instalação nos computadores e configurar bloqueio automático no console web.",
    obs: "Detecção proativa de anomalias comportamentais e resposta rápida a incidentes.",
    linkModule: "secops",
    subtab: "wazuh"
  },
  {
    id: 14,
    phase: 3,
    phaseName: "Fase 3: Custo Médio",
    title: "Proxy / Web Filter em Nuvem",
    desc: "Assinar serviço DNS em nuvem para bloqueio de sites e phishing",
    cost: "Licença Mensal",
    effort: "Baixo",
    status: "Pendente",
    completed: false,
    howTo: "Assinar um serviço de DNS seguro (ex: Cisco Umbrella, NextDNS). Mudar os apontamentos de DNS do DHCP/Roteador para a nuvem do serviço e criar políticas bloqueando sites nocivos.",
    obs: "Bloqueia tentativas de phishing e comunicação com servidores maliciosos de comando e controle.",
    linkModule: "secops",
    subtab: "assets"
  },
  {
    id: 15,
    phase: 3,
    phaseName: "Fase 3: Custo Médio",
    title: "Mascaramento e Anonimização de BD",
    desc: "Aplicar em ambientes de teste, exige ferramentas ou desenvolvimento",
    cost: "Licença/Desenvolvimento",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Utilizar scripts em SQL ou ferramentas de Data Masking para embaralhar nomes, e-mails e CPFs ao clonar o banco de dados de produção para o ambiente de desenvolvimento/testes.",
    obs: "Atende aos artigos 5º, XI e 12 da LGPD, descaracterizando dados pessoais.",
    linkModule: "lgpd",
    subtab: "ropa"
  },

  // FASE 4: ALTO CUSTO / ALTA COMPLEXIDADE
  {
    id: 16,
    phase: 4,
    phaseName: "Fase 4: Alto Custo / Alta Complexidade",
    title: "Criptografia de Dados em Repouso (TDE)",
    desc: "Exige licenças 'Enterprise' caras de banco de dados (ex: SQL, Oracle)",
    cost: "Licença Enterprise",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Em bancos de dados compatíveis (SQL Server/Oracle Enterprise), gerar uma Master Key, criar certificado e executar o comando para habilitar o TDE (Transparent Data Encryption).",
    obs: "Protege os arquivos de dados (.mdf/.ldf) contra vazamento ou extração direta do disco.",
    linkModule: "secops",
    subtab: "assets"
  },
  {
    id: 17,
    phase: 4,
    phaseName: "Fase 4: Alto Custo / Alta Complexidade",
    title: "IPS/IDS Dedicado",
    desc: "Soluções de prevenção que demandam hardware específico e licenças",
    cost: "Hardware (CAPEX)",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Adquirir e configurar as licenças de IPS/IDS no firewall físico/virtual. Mudar os perfis de inspeção de tráfego de 'Monitoramento' para 'Prevenção/Bloqueio'.",
    obs: "Inspeção profunda de pacotes com bloqueio automático de assinaturas de ataque.",
    linkModule: "secops",
    subtab: "wazuh"
  },
  {
    id: 18,
    phase: 4,
    phaseName: "Fase 4: Alto Custo / Alta Complexidade",
    title: "DLP (Data Loss Prevention) Corporativo",
    desc: "Ferramentas complexas para impedir envio de e-mails, uso de pen drives",
    cost: "Licença Alta",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Instalar agentes DLP nas estações de trabalho e integrar ao e-mail (Exchange/Google). Criar regras buscando padrões (ex: regex para CPF) e bloquear extração (USB, e-mail).",
    obs: "Evita exfiltração não autorizada de dados pessoais e propriedade intelectual.",
    linkModule: "secops",
    subtab: "assets"
  },
  {
    id: 19,
    phase: 4,
    phaseName: "Fase 4: Alto Custo / Alta Complexidade",
    title: "802.1X (Autenticação de Porta)",
    desc: "Pode exigir troca de switches e servidor Radius/NPS",
    cost: "Hardware (CAPEX)",
    effort: "Alto",
    status: "Pendente",
    completed: false,
    howTo: "Subir um servidor de autenticação Radius (ex: NPS no Windows). Configurar os switches para usar o protocolo 802.1X, exigindo certificado do computador antes de liberar a rede.",
    obs: "Controle de acesso à rede física (NAC) restringindo conexões apenas a ativos corporativos autorizados.",
    linkModule: "secops",
    subtab: "assets"
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
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length === ROADMAP_TASKS.length) {
        return parsed;
      }
    }
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
  1: ['rh_sst', 'dpo', 'diretoria'],
  2: ['secops', 'dpo', 'diretoria'],
  3: ['secops', 'gestor_obra'],
  4: ['gestor_obra', 'secops'],
  5: ['secops'],
  6: ['dpo', 'rh_sst'],
  7: ['secops'],
  8: ['secops', 'gestor_obra'],
  9: ['secops', 'gestor_obra'],
  10: ['secops', 'dpo'],
  11: ['dpo', 'diretoria'],
  12: ['secops', 'gestor_obra'],
  13: ['secops', 'dpo'],
  14: ['secops', 'gestor_obra'],
  15: ['secops', 'dpo'],
  16: ['secops'],
  17: ['secops'],
  18: ['secops', 'gestor_obra'],
  19: ['secops', 'gestor_obra']
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
                  <span class="text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${isDone ? 'bg-emerald-200/60 text-emerald-900' : 'bg-slate-200 text-slate-700'}">ID #${task.id}</span>
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
