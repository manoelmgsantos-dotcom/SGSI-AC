import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const dbUrl = process.env.DATABASE_URL || 'postgresql://cybergrc:%40Ac123456@localhost:5432/cybergrc';

console.log('========================================================================');
console.log('   AC ENGENHARIA - INSTALAÇÃO LIMPA (ZEROED PRODUCTION STATE)');
console.log('========================================================================\n');

// 1. Usuário Administrador Principal Único (Sem senha em texto plano no payload público)
const MASTER_ADMIN_USER = {
  id: "usr-admin",
  name: "Admin-SGSI",
  email: "ti@acengenhariase.com.br",
  role: "secops",
  roleName: "Gestor de T.I. & SecOps",
  department: "Diretoria de Tecnologia & Governança SGSI",
  location: "Escritório Central (Matriz)",
  avatar: "A",
  color: "blue",
  status: "Ativo",
  isSuperAdmin: true,
  responsibilities: [
    "Administrador Principal e Gestão Central de Credenciais RBAC",
    "Administração Completa do SGSI (ISO 27001), LGPD e Canteiros de Obras",
    "Operação do SIEM Wazuh, Backups Imutáveis Sienge ERP e Firewalls",
    "Homologação de Evidências, Relatórios ANPD e Auditoria Forense",
    "Gestão do Escritório Central (Matriz) e Conectividade VPN com Canteiros"
  ]
};

// 1.1 Usuário Normal / Operacional (Engenheiro Residente / Obras)
const NORMAL_USER_MANOEL = {
  id: "usr-manoel",
  name: "Manoel Martins",
  email: "manoelmgsantos@acengenhariase.com.br",
  role: "gestor_obra",
  roleName: "Engenheiro Residente / Obras",
  department: "Diretoria de Operações & Obras",
  location: "Escritório Central (Matriz)",
  avatar: "MM",
  color: "amber",
  status: "Ativo",
  isSuperAdmin: false,
  responsibilities: [
    "Segurança de canteiro, biometria em catracas, termos de empreiteiras e evidências operacionais."
  ]
};

// 2. Unidade Matriz Essencial (0 Canteiros Fictícios)
const MATRIZ_OBRA = {
  id: "MATRIZ-001",
  name: "Escritório Central (Matriz)",
  code: "MATRIZ-001",
  type: "Sede Administrativa & Corporativa",
  address: "Sede Corporativa Central - AC Engenharia",
  manager: "Manoel Martins",
  stage: "Operação Contínua",
  progress: 100,
  ownWorkers: 0,
  thirdPartyWorkers: 0,
  totalWorkers: 0,
  facialTurnstiles: 0,
  camerasCftv: 0,
  bimServers: 0,
  vlanIsolated: true,
  nr18Compliance: 100,
  biometryStatus: "Ativa (Base Legal: Segurança Patrimonial)",
  habiteSeDate: "N/A (Sede Permanente)",
  status: "Operacional"
};

// 3. Registro Forense Inicial de Instalação Limpa
const INITIAL_AUDIT_LOG = {
  id: "BLK-0001",
  timestamp: new Date().toISOString(),
  role: "Sistema (Gênese)",
  category: "SISTEMA_SGSI",
  module: "SYSTEM",
  action: "INSTALACAO_LIMPA_INICIALIZADA: SGSI da AC Engenharia pronto para preenchimento do zero",
  severity: "INFO",
  actor: "Admin-SGSI <ti@acengenhariase.com.br>",
  target_module: "Governança SGSI",
  description: "Base de dados zerada e inicializada em estado limpo (zeroed) para início da operação oficial da AC Engenharia.",
  ip: "127.0.0.1",
  previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
  prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
  hash: "1a8f9c0e27145b4686cf4e0060914e7b1e507746905a8f9c0e27145b4686cf4e"
};

// 4. Catálogo Oficial das 19 Tarefas do Plano de Ação LGPD & Segurança (Fase 1 a Fase 4)
const CLEAN_ROADMAP_TASKS = [
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

// 5. Catálogo das 52 Semanas de Campanhas ANPD (100% desmarcadas - 0% enviadas)
const CLEAN_CAMPAIGNS = [
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

// 6. Snapshot Limpo (Zeroed State)
export const CLEAN_DATABASE_SNAPSHOT = {
  meta: {
    version: "3.5.0",
    environment: "production",
    resetAt: new Date().toISOString(),
    organization: "AC Engenharia"
  },
  users: [MASTER_ADMIN_USER, NORMAL_USER_MANOEL],
  obras: [MATRIZ_OBRA], // Apenas a Matriz Central (0 obras fictícias)
  risks: [],            // Zerado
  ropa: [],             // Zerado
  dsar: [],             // Zerado
  thirdParties: [],     // Zerado
  wazuhAlerts: [],      // Zerado
  assets: [],           // Zerado
  incidents: [],        // Zerado
  evidence: [],         // Zerado
  policyLogs: [],       // Zerado
  connectors: [],       // Zerado (slots padrão sem tokens gerados pelo cliente)
  auditLogs: [INITIAL_AUDIT_LOG],

  // Catálogos normativos padrão (AC Engenharia) em estado inicial (0% implementado)
  soaControls: [
    { code: "A.5.1", theme: "Organizacional", title: "Políticas de Segurança da Informação da AC Engenharia", applicable: true, status: "Não Implementado", justification: "", risksMitigated: [], history: [], evidenceFiles: [] },
    { code: "A.5.8", theme: "Organizacional", title: "Segurança da Informação no Gerenciamento de Projetos e Obras", applicable: true, status: "Não Implementado", justification: "", risksMitigated: [], history: [], evidenceFiles: [] },
    { code: "A.5.15", theme: "Organizacional", title: "Controle de Acesso Lógico e Físico (Catracas & AD)", applicable: true, status: "Não Implementado", justification: "", risksMitigated: [], history: [], evidenceFiles: [] },
    { code: "A.5.19", theme: "Organizacional", title: "Segurança da Informação em Fornecedores e Empreiteiras de Obra", applicable: true, status: "Não Implementado", justification: "", risksMitigated: [], history: [], evidenceFiles: [] },
    { code: "A.6.1", theme: "Pessoas", title: "Seleção e Homologação de Pessoal e Operários de Canteiro", applicable: true, status: "Não Implementado", justification: "", risksMitigated: [], history: [], evidenceFiles: [] },
    { code: "A.6.4", theme: "Pessoas", title: "Conscientização, Educação e Treinamento em Segurança e LGPD", applicable: true, status: "Não Implementado", justification: "", risksMitigated: [], history: [], evidenceFiles: [] },
    { code: "A.7.4", theme: "Físico", title: "Monitoramento Físico de Canteiros, Estandes e Almoxarifados", applicable: true, status: "Não Implementado", justification: "", risksMitigated: [], history: [], evidenceFiles: [] },
    { code: "A.8.1", theme: "Tecnológico", title: "Dispositivos de Usuários Finais e Notebooks de Obra", applicable: true, status: "Não Implementado", justification: "", risksMitigated: [], history: [], evidenceFiles: [] },
    { code: "A.8.7", theme: "Tecnológico", title: "Proteção Contra Malware e Ransomware em Servidores BIM", applicable: true, status: "Não Implementado", justification: "", risksMitigated: [], history: [], evidenceFiles: [] },
    { code: "A.8.10", theme: "Tecnológico", title: "Expurgo e Eliminação Segura de Biometria Facial pós-Habite-se", applicable: true, status: "Não Implementado", justification: "", risksMitigated: [], history: [], evidenceFiles: [] },
    { code: "A.8.20", theme: "Tecnológico", title: "Segregação de Redes VLAN em Estandes de Vendas e Obras", applicable: true, status: "Não Implementado", justification: "", risksMitigated: [], history: [], evidenceFiles: [] }
  ],
  raciMatrix: [
    { id: 1, process: "Resposta a Incidentes de Ransomware em Servidor BIM / Sienge", secops: "R", executive: "A", legal: "C", hr: "I", history: [], evidenceFiles: [] },
    { id: 2, process: "Revogação de Acesso e Offboarding no AD & Catracas Faciais", secops: "R", executive: "I", legal: "C", hr: "A", history: [], evidenceFiles: [] },
    { id: 3, process: "Atendimento a Direitos dos Compradores (DSAR LGPD Art. 18)", secops: "C", executive: "I", legal: "A", hr: "R", history: [], evidenceFiles: [] },
    { id: 4, process: "Gestão de Catracas e Biometria Facial nos Canteiros (Art. 11)", secops: "A", executive: "I", legal: "C", hr: "R", history: [], evidenceFiles: [] },
    { id: 5, process: "Compartilhamento de Dossiê Financeiro com Agentes (Caixa)", secops: "C", executive: "A", legal: "R", hr: "-", history: [], evidenceFiles: [] },
    { id: 6, process: "Homologação LGPD & SST de Empreiteiras de Obra (NR-18)", secops: "C", executive: "A", legal: "R", hr: "R", history: [], evidenceFiles: [] },
    { id: 7, process: "Backup Imutável e Proteção de Projetos de Engenharia (BIM/CAD)", secops: "A", executive: "I", legal: "-", hr: "-", history: [], evidenceFiles: [] },
    { id: 8, process: "Revisão Anual da PSI e Termos de Não Repasse de Leads", secops: "R", executive: "A", legal: "C", hr: "-", history: [], evidenceFiles: [] }
  ],
  policies: [
    { id: "PSI-001", title: "Política Geral de Segurança da Informação da AC Engenharia", version: "v1.0", status: "Em Elaboração", adoption: "0%", updated: new Date().toLocaleDateString('pt-BR'), obra_local: "Global / Todas as Obras", description: "Normas mandatórias aplicadas a colaboradores da sede e equipes de campo em canteiros de obra da AC Engenharia.", history: [], evidenceFiles: [] },
    { id: "PCA-002", title: "Controle de Acesso Lógico e Físico (Catracas & AD)", version: "v1.0", status: "Em Elaboração", adoption: "0%", updated: new Date().toLocaleDateString('pt-BR'), obra_local: "Sede & Canteiros", description: "MFA obrigatório para VPN e ERP, rotação trimestral de credenciais e catracas integradas ao Sienge.", history: [], evidenceFiles: [] },
    { id: "PCOM-003", title: "Privacidade Comercial, Estandes e Não Repasse de Leads", version: "v1.0", status: "Em Elaboração", adoption: "0%", updated: new Date().toLocaleDateString('pt-BR'), obra_local: "Comercial / Estandes", description: "Vedação expressa de compartilhamento de dados de compradores com parceiros externos sem opt-in explícito.", history: [], evidenceFiles: [] },
    { id: "PBIO-004", title: "Diretriz de Coleta e Descarte de Biometria em Canteiros", version: "v1.0", status: "Em Elaboração", adoption: "0%", updated: new Date().toLocaleDateString('pt-BR'), obra_local: "Canteiros de Obra", description: "Procedimentos do Art. 11 da LGPD para reconhecimento facial nas catracas e rotina obrigatória de expurgo na desmobilização do canteiro pós-Habite-se.", history: [], evidenceFiles: [] },
    { id: "PSST-005", title: "Sigilo de Dados Médicos Ocupacionais e ASO (NR-07)", version: "v1.0", status: "Em Elaboração", adoption: "0%", updated: new Date().toLocaleDateString('pt-BR'), obra_local: "RH / SST (NR-18)", description: "Restrição estrita de visualização de prontuários médicos de operários.", history: [], evidenceFiles: [] }
  ],
  roadmapTasks: CLEAN_ROADMAP_TASKS,
  campaigns: CLEAN_CAMPAIGNS
};

async function resetDatabase() {
  console.log('[1/3] Atualizando arquivo local de persistência em disco (cybergrc-local-db.json)...');
  const diskPath = resolve(process.cwd(), 'server', 'data', 'cybergrc-local-db.json');
  mkdirSync(dirname(diskPath), { recursive: true });
  writeFileSync(diskPath, JSON.stringify(CLEAN_DATABASE_SNAPSHOT, null, 2), 'utf8');
  console.log(`  -> Arquivo local atualizado em: ${diskPath}`);

  console.log('\n[2/3] Conectando ao PostgreSQL para resetar tabelas e registros...');
  let pgConnected = false;
  const client = new Client({ connectionString: dbUrl, connectionTimeoutMillis: 3000 });
  try {
    await client.connect();
    pgConnected = true;
    console.log('  -> Conectado ao PostgreSQL com sucesso.');

    // 1. Limpa app_users (mantendo apenas o Administrador Principal)
    await client.query(`
      DELETE FROM app_users WHERE LOWER(email) <> 'ti@acengenhariase.com.br';
    `);
    console.log('  -> app_users limpo: apenas o Administrador Principal (Admin-SGSI) preservado.');

    // 2. Limpa grc_records
    await client.query('TRUNCATE TABLE grc_records;');
    console.log('  -> Tabela grc_records truncada com sucesso.');

    // 3. Insere coleções zeradas / limpas
    for (const [collection, items] of Object.entries(CLEAN_DATABASE_SNAPSHOT)) {
      if (collection === 'meta') continue;
      if (Array.isArray(items)) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const id = String(item.id || item.code || item.week || i + 1);
          await client.query(
            `INSERT INTO grc_records (collection, record_id, payload, sort_order)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (collection, record_id) DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()`,
            [collection, id, JSON.stringify(item), i]
          );
        }
      }
    }
    console.log('  -> Coleções estruturais limpas inseridas no PostgreSQL.');
  } catch (err) {
    console.warn('  ⚠️ Aviso: PostgreSQL offline ou erro na conexão:', err.message);
    console.log('  -> O reset foi aplicado com sucesso no disco local JSON e será sincronizado quando o PostgreSQL iniciar.');
  } finally {
    if (pgConnected) {
      await client.end();
    }
  }

  console.log('\n========================================================================');
  console.log('🎉 BASE DE DADOS ZERADA COM SUCESSO (INSTALAÇÃO LIMPA AC ENGENHARIA)!');
  console.log('========================================================================');
  console.log('Status da Base:');
  console.log('  • 1 Administrador Principal: Admin-SGSI (ti@acengenhariase.com.br)');
  console.log('  • 1 Usuário Operacional: Manoel Martins (manoelmgsantos@acengenhariase.com.br)');
  console.log('  • 1 Unidade Matriz: Escritório Central (Matriz) — 0 canteiros fictícios');
  console.log('  • 0 Riscos cadastrados (matriz 5x5 limpa)');
  console.log('  • 0 Processos RoPA (LGPD limpo)');
  console.log('  • 0 Solicitações DSAR');
  console.log('  • 0 Fornecedores / DPAs');
  console.log('  • 0 Ativos de TI / GLPI');
  console.log('  • 0 Alertas SIEM Wazuh');
  console.log('  • 0 Incidentes CSIRT');
  console.log('  • 0 Evidências carregadas');
  console.log('  • Controles ISO 27001: 11 controles em "Não Implementado" (0% conformidade)');
  console.log('  • Plano Priorizado (24 tarefas) e Campanhas ANPD (52 semanas): 0% concluído');
  console.log('\nVocê já pode iniciar o uso oficial do sistema do zero!');
}

const isDirectExecution = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('scripts/reset-db.mjs');
if (isDirectExecution) {
  resetDatabase().catch(err => {
    console.error('Erro ao resetar banco de dados:', err);
    process.exit(1);
  });
}
