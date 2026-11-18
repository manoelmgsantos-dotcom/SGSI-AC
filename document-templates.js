/**
 * document-templates.js - Central Corporativa de Modelos Oficiais, Atas, Políticas, Laudos e Termos para Assinatura
 * AC Engenharia - SGSI & GRC Enterprise Platform
 * Cobertura integral de todos os módulos operacionais (ISO/IEC 27001:2022, ISO 27005, ISO 27035, ISO 27037, ISO 22301, LGPD & NR-18/NR-07)
 */

const TEMPLATE_MODULE_LABELS = {
  todos: "Todos os Módulos",
  obras: "02. Central & Canteiros (NR-18)",
  users: "03. Usuários & Acessos (RBAC)",
  raci: "04. Governança, Políticas & RACI",
  secops: "05. Infraestrutura & SecOps",
  integrations: "06. Integrações & APIs",
  risks: "07. Gestão de Riscos (ISO 27005)",
  lgpd: "08. Privacidade & LGPD",
  evidence: "09. Evidências & Custódia Forense",
  audit: "10. Auditoria Interna & Conformidade"
};

// Registro de Assinaturas Eletrônicas Aplicadas aos Modelos (Persistido em LocalStorage)
function getStoredTemplateSignatures() {
  try {
    const raw = localStorage.getItem("AC_ENGENHARIA_DOC_SIGNATURES_V1");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Erro ao ler assinaturas de documentos:", e);
  }
  return {};
}

function saveStoredTemplateSignatures(map) {
  try {
    localStorage.setItem("AC_ENGENHARIA_DOC_SIGNATURES_V1", JSON.stringify(map));
  } catch (e) {
    console.warn("Erro ao salvar assinaturas de documentos:", e);
  }
}

function getStoredCorporateSigners() {
  try {
    const raw = localStorage.getItem("sgsi_corporate_signers");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function saveStoredCorporateSigners(data) {
  try {
    localStorage.setItem("sgsi_corporate_signers", JSON.stringify(data));
  } catch (e) {}
}

function getStoredDocumentCustomData(code) {
  if (!code) return { signers: [], fields: {} };
  try {
    const raw = localStorage.getItem("sgsi_doc_custom_" + code);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        signers: Array.isArray(parsed.signers) ? parsed.signers : [],
        fields: (parsed.fields && typeof parsed.fields === "object") ? parsed.fields : {},
        updatedAt: parsed.updatedAt || null
      };
    }
  } catch (e) {}
  return { signers: [], fields: {} };
}

function saveStoredDocumentCustomData(code, data) {
  if (!code) return;
  try {
    localStorage.setItem("sgsi_doc_custom_" + code, JSON.stringify(data));
  } catch (e) {}
}

function clearStoredDocumentCustomData(code) {
  if (!code) return;
  try {
    localStorage.removeItem("sgsi_doc_custom_" + code);
  } catch (e) {}
}

function getTemplateContextDefaults() {
  const user = (window.AuthState && window.AuthState.currentUser) ? window.AuthState.currentUser : null;
  const selUnidade = document.getElementById("select-unidade-filter");
  let activeUnit = "Escritório Central (Matriz) & Canteiros Adjacentes";
  if (selUnidade && selUnidade.value && selUnidade.value !== "todos") {
    const opt = selUnidade.options[selUnidade.selectedIndex];
    activeUnit = opt ? opt.textContent.replace(/^[^\wÀ-ÿ]+/, "").trim() : selUnidade.value;
  }
  const todayBr = new Date().toLocaleDateString("pt-BR");
  const nowBr = new Date().toLocaleString("pt-BR");
  const stored = getStoredCorporateSigners();

  return {
    company: "AC ENGENHARIA",
    companyLegal: "AC Engenharia",
    cnpj: stored.cnpj || "12.345.678/0001-90",
    dpoName: stored.dpoName || "",
    dpoEmail: stored.dpoEmail || "dpo@acengenhariase.com.br",
    directorName: stored.directorName || "",
    secopsName: stored.secopsName || "",
    obraManagerName: stored.obraManagerName || "",
    currentUserName: user ? user.name : "",
    currentUserEmail: user ? user.email : "ti@acengenhariase.com.br",
    currentUserRole: user ? (user.roleName || user.role) : "Gestor de T.I. & SecOps",
    activeUnit,
    todayBr,
    nowBr
  };
}

const MODULE_MANAGEMENT_DEPT = {
  obras: "Gerência de Engenharia, Obras & SST (NR-18)",
  users: "Gerência de RH & Administração de Acessos",
  raci: "Diretoria Executiva, Governança & DPO",
  secops: "Gerência Executiva de T.I. & SecOps",
  integrations: "Gerência de Sistemas, Infraestrutura & APIs",
  risks: "Diretoria Executiva C-Level & Riscos GRC",
  lgpd: "Encarregado(a) de Dados (DPO) & Jurídico",
  evidence: "Gerência de Governança, Risco & Conformidade",
  audit: "Auditoria Interna ISO 27001 & Qualidade"
};

const DOCUMENT_CUSTOM_FIELDS_SCHEMA = {
  "MOD-OBR-01": {
    "title": "Checklist de Mobilização de TI e Segurança Física de Canteiro de Obras",
    "signers": [
      {
        "role": "Engenheiro(a) Residente / Gestor da Obra",
        "docLabel": "CREA-SE",
        "placeholder": "Ex: Eng. Ricardo Lima"
      },
      {
        "role": "Gestor de T.I. & SecOps (Homologação Matriz)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": [
      {
        "key": "obra",
        "label": "Nome da Obra / Canteiro",
        "placeholder": "Ex: Residencial Jardins da Costa"
      }
    ]
  },
  "MOD-OBR-02": {
    "title": "Termo e Certificado de Expurgo Seguro de Biometria Facial Pós-Habite-se (PBIO-004)",
    "signers": [
      {
        "role": "Executor Técnico de T.I. / SecOps",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Engenheiro(a) Residente da Obra",
        "docLabel": "CREA-SE",
        "placeholder": "Ex: Eng. Ricardo Lima"
      },
      {
        "role": "Homologação Encarregado(a) de Dados (DPO)",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": [
      {
        "key": "obra",
        "label": "Nome da Obra / Canteiro",
        "placeholder": "Ex: Residencial Jardins da Costa"
      }
    ]
  },
  "MOD-OBR-03": {
    "title": "Termo Individual de Ciência de Coleta Biométrica e Acesso em Canteiro (NR-18)",
    "signers": [
      {
        "role": "Trabalhador / Titular dos Dados",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Responsável pela Integração (RH / Técnico SST — AC Engenharia)",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      }
    ],
    "fields": [
      {
        "key": "obra",
        "label": "Nome da Obra / Canteiro",
        "placeholder": "Ex: Residencial Jardins da Costa"
      }
    ]
  },
  "MOD-OBR-03B": {
    "title": "Termo Individual de Ciência de Controle de Acesso e Identificação em Canteiro (QR Code / Crachá - NR-18)",
    "signers": [
      {
        "role": "Trabalhador / Titular dos Dados",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Responsável pela Integração (RH / Técnico SST — AC Engenharia)",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      }
    ],
    "fields": [
      {
        "key": "obra",
        "label": "Nome da Obra / Canteiro",
        "placeholder": "Ex: Residencial Jardins da Costa"
      }
    ]
  },
  "MOD-OBR-04": {
    "title": "Termo de Homologação de Câmeras CFTV, Drones de Obra e Placas de Privacidade (LGPD)",
    "signers": [
      {
        "role": "Engenheiro(a) Residente da Obra",
        "docLabel": "CREA-SE",
        "placeholder": "Ex: Eng. Ricardo Lima"
      },
      {
        "role": "Gestor de T.I. & SecOps",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Homologação DPO / Privacidade",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": [
      {
        "key": "obra",
        "label": "Nome da Obra / Canteiro",
        "placeholder": "Ex: Residencial Jardins da Costa"
      }
    ]
  },
  "MOD-OBR-05": {
    "title": "Ata de Desmobilização Geral de TI, Recolhimento de Ativos e Encerramento de Canteiro",
    "signers": [
      {
        "role": "Engenheiro(a) Residente (Entrega do Canteiro)",
        "docLabel": "CREA-SE",
        "placeholder": "Ex: Eng. Ricardo Lima"
      },
      {
        "role": "Gestor de T.I. & SecOps (Recebimento e Sanitização)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": [
      {
        "key": "obra",
        "label": "Nome da Obra / Canteiro",
        "placeholder": "Ex: Residencial Jardins da Costa"
      }
    ]
  },
  "MOD-USR-01": {
    "title": "Termo de Responsabilidade, Confidencialidade (NDA) e Uso Aceitável de Ativos de TI",
    "signers": [
      {
        "role": "Colaborador(a) Declarante e Custodiante",
        "docLabel": "CPF",
        "placeholder": "Ex: Nome Completo do Titular"
      },
      {
        "role": "Gestor da Área / T.I. — AC Engenharia",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": []
  },
  "MOD-USR-02": {
    "title": "Formulário de Concessão, Revisão Trimestral e Revogação de Acessos (RBAC & SoD)",
    "signers": [
      {
        "role": "Gestor Solicitante / Recursos Humanos",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      },
      {
        "role": "Administrador de Acessos (T.I. / SecOps)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": []
  },
  "MOD-USR-03": {
    "title": "Termo de Desligamento (Offboarding), Devolução de Ativos e Revogação de Acessos",
    "signers": [
      {
        "role": "Profissional Desligado (Entrega de Ativos e Ciência)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Recursos Humanos — AC Engenharia",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      },
      {
        "role": "T.I. & SecOps (Confirmação de Bloqueio Lógico)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": []
  },
  "MOD-USR-04": {
    "title": "Termo de Trabalho Remoto (Teletrabalho / Campo), VPN Obrigatória e Dispositivos Móveis",
    "signers": [
      {
        "role": "Colaborador(a) Autorizado(a)",
        "docLabel": "CPF",
        "placeholder": "Ex: Nome Completo do Titular"
      },
      {
        "role": "Gestor de T.I. & SecOps — AC Engenharia",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": []
  },
  "MOD-GOV-01": {
    "title": "Ata de Reunião e Análise Crítica do Comitê Gestor do SGSI e Privacidade",
    "signers": [
      {
        "role": "Presidente do Comitê / Diretoria Executiva",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Encarregado(a) pelo Tratamento de Dados (DPO)",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      },
      {
        "role": "Gestor de T.I. & Operações SecOps",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Representante de Engenharia de Obras / RH & SST",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      }
    ],
    "fields": []
  },
  "MOD-GOV-02": {
    "title": "Portaria Diretiva de Nomeação Oficial do(a) Encarregado(a) de Dados (DPO)",
    "signers": [
      {
        "role": "Diretor-Presidente / Representante Legal — AC Engenharia",
        "docLabel": "Diretoria Executiva",
        "placeholder": "Ex: Eng. João da Silva"
      },
      {
        "role": "Ciência e Aceite do(a) Encarregado(a) Nomeado(a) — DPO",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": []
  },
  "MOD-GOV-03": {
    "title": "Termo Individual de Ciência e Adesão à Política de Segurança da Informação (PSI)",
    "signers": [
      {
        "role": "Colaborador(a) / Profissional Declarante",
        "docLabel": "CPF",
        "placeholder": "Ex: Nome Completo do Titular"
      },
      {
        "role": "Conferência e Arquivamento — RH / Governança SGSI",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      }
    ],
    "fields": []
  },
  "MOD-GOV-04": {
    "title": "Ata e Lista de Presença de Treinamento / DDS de Segurança da Informação e LGPD",
    "signers": [
      {
        "role": "Instrutor(a) / Multiplicador SGSI & LGPD",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Coordenador(a) RH / Técnico de SST (NR-18)",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      }
    ],
    "fields": [
      {
        "key": "trainingTopic",
        "label": "Tema do DDS / Treinamento",
        "placeholder": "Ex: Conscientização em Segurança da Informação e LGPD"
      },
      {
        "key": "trainingLocation",
        "label": "Local / Canteiro",
        "placeholder": "Ex: Matriz / Canteiro Obra Jardins"
      }
    ]
  },
  "MOD-GOV-05": {
    "title": "Política Geral de Segurança da Informação e Privacidade da AC Engenharia (PSI-001)",
    "signers": [
      {
        "role": "Aprovação Executiva — Diretoria C-Level",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Conformidade Legal & LGPD — Encarregado(a) DPO",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      },
      {
        "role": "Arquitetura & Segurança Cibernética — SecOps",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": []
  },
  "MOD-GOV-06": {
    "title": "Matriz RACI de Resposta a Incidentes de Dados Pessoais (LGPD / ANPD)",
    "signers": [
      {
        "role": "Diretor Responsável (Accountable C-Level)",
        "docLabel": "Diretoria Executiva",
        "placeholder": "Ex: Eng. João da Silva"
      },
      {
        "role": "DPO Provisório Designado",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      },
      {
        "role": "Responsável pela T.I. & Segurança",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Assessoria Jurídica",
        "docLabel": "OAB-SE",
        "placeholder": "Ex: Assessor(a) Jurídico(a)"
      }
    ],
    "fields": [
      {
        "key": "incidentNumber",
        "label": "Nº do Protocolo / Incidente",
        "placeholder": "Ex: INC-2026-001"
      }
    ]
  },
  "MOD-GOV-07": {
    "title": "Política e Norma de Controle de Acesso Lógico, Físico, Senhas e MFA (PCA-002)",
    "signers": [
      {
        "role": "Gestor de T.I. & SecOps — AC Engenharia",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Encarregado(a) de Dados (DPO)",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      },
      {
        "role": "Aprovação Diretoria Executiva",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": []
  },
  "MOD-GOV-08": {
    "title": "Diretriz e Termo de Sigilo de Dados Médicos Ocupacionais, PCMSO e ASOs (PSST-005)",
    "signers": [
      {
        "role": "Responsável RH / Segurança do Trabalho (SST — NR-18)",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      },
      {
        "role": "Médico(a) do Trabalho / Clínica Ocupacional Credenciada",
        "docLabel": "CRM",
        "placeholder": "Ex: Médico(a) do Trabalho SST"
      },
      {
        "role": "Encarregado(a) pelo Tratamento de Dados (DPO)",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": []
  },
  "MOD-GOV-09": {
    "title": "Política e Diretriz de Mesa Limpa e Tela Limpa (PML-006) — Matriz e Estandes",
    "signers": [
      {
        "role": "Encarregado(a) pelo Tratamento de Dados (DPO)",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      },
      {
        "role": "Gestor de Infraestrutura, Segurança da Informação & SecOps",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Gestor Comercial & Estandes de Vendas",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      }
    ],
    "fields": []
  },
  "MOD-SEC-01": {
    "title": "Laudo Técnico de Teste de Restauração de Backup Imutável (Sienge / BIM / S3)",
    "signers": [
      {
        "role": "Executor Técnico — T.I. / SecOps AC Engenharia",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Validador Funcional / Governança DPO",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": []
  },
  "MOD-SEC-02": {
    "title": "Ata Pós-Incidente Cibernético (CSIRT) e Relatório de Lições Aprendidas",
    "signers": [
      {
        "role": "Líder de Resposta a Incidentes (CSIRT / SecOps)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Parecer Jurídico-Regulatório (DPO)",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      },
      {
        "role": "Ciência da Diretoria Executiva — AC Engenharia",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": [
      {
        "key": "incidentNumber",
        "label": "Nº do Protocolo / Incidente",
        "placeholder": "Ex: INC-2026-001"
      }
    ]
  },
  "MOD-SEC-03": {
    "title": "Comunicação Oficial de Incidente de Segurança à ANPD e aos Titulares (3 Dias Úteis)",
    "signers": [
      {
        "role": "Encarregado(a) pelo Tratamento de Dados (DPO)",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      },
      {
        "role": "Diretor Executivo / Representante Legal — AC Engenharia",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": []
  },
  "MOD-SEC-04": {
    "title": "Laudo de Homologação de Hardening, BitLocker e Bloqueio USB (GPO) em Estações",
    "signers": [
      {
        "role": "Analista de Infraestrutura / Executor do Hardening",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      },
      {
        "role": "Gestor de T.I. & SecOps (Revisão Técnica)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": []
  },
  "MOD-SEC-05": {
    "title": "Plano de Continuidade de Negócios e Recuperação de Desastres de TIC (PCN / DRP)",
    "signers": [
      {
        "role": "Gestor de T.I. & SecOps (Líder DRP)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Diretoria Executiva — AC Engenharia",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": []
  },
  "MOD-SEC-06": {
    "title": "Relatório de Gestão de Vulnerabilidades (CVE), Patch Management e Revisão de Firewall/VLANs",
    "signers": [
      {
        "role": "Gestor de T.I. & SecOps — AC Engenharia",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Auditoria Interna / Conformidade",
        "docLabel": "Certificação / Registro",
        "placeholder": "Ex: Auditor(a) Independente ISO 27001"
      }
    ],
    "fields": []
  },
  "MOD-SEC-07": {
    "title": "Requisição e Homologação de Mudança Crítica em Infraestrutura e Sistemas (GMUD)",
    "signers": [
      {
        "role": "Solicitante / Executor Técnico",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      },
      {
        "role": "Aprovação de Mudança — Gestor SecOps AC Engenharia",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": [
      {
        "key": "changeTitle",
        "label": "Objeto da Mudança (GMUD)",
        "placeholder": "Ex: Upgrade do Firewall Fortigate e VLAN de Canteiro"
      }
    ]
  },
  "MOD-SUP-01": {
    "title": "Laudo de Due Diligence, Homologação e Gestão de Riscos de Fornecedores de TIC e Nuvem (QDD-007)",
    "signers": [
      {
        "role": "Gestão de Suprimentos & Homologação de Terceiros",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      },
      {
        "role": "Gestor de Infraestrutura, Segurança da Informação & SecOps",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Encarregado(a) pelo Tratamento de Dados (DPO)",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": [
      {
        "key": "providerName",
        "label": "Razão Social do Fornecedor / Terceiro",
        "placeholder": "Ex: Cloud Hosting Brasil Ltda"
      },
      {
        "key": "providerCnpj",
        "label": "CNPJ do Fornecedor",
        "placeholder": "00.000.000/0001-00"
      },
      {
        "key": "service",
        "label": "Serviço Prestado / Categoria TIC",
        "placeholder": "Ex: ERP em Nuvem / Link de Internet Dedicado"
      }
    ]
  },
  "MOD-API-01": {
    "title": "Termo de Homologação Técnica, Sigilo e Custódia de Credenciais de APIs e Webhooks",
    "signers": [
      {
        "role": "Arquitetura & Segurança de Integrações (SecOps)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Responsável pelo Sistema / Fornecedor Integrado",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      }
    ],
    "fields": []
  },
  "MOD-API-02": {
    "title": "Ata de Auditoria Trimestral de Rotação de Chaves de API, Certificados TLS/mTLS e Conectores",
    "signers": [
      {
        "role": "Gestor de T.I. & SecOps — AC Engenharia",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Auditoria de Conformidade — DPO",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": []
  },
  "MOD-RSK-01": {
    "title": "Termo Executivo de Aceite Formal de Risco Residual e Plano de Tratamento",
    "signers": [
      {
        "role": "Aprovação Executiva — Diretoria C-Level (Accountable)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Custodiante Responsável pelo Tratamento",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      },
      {
        "role": "Parecer de Conformidade — Encarregado(a) DPO / SecOps",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": [
      {
        "key": "riskTitle",
        "label": "Descrição Resumida do Risco Aceito",
        "placeholder": "Ex: Risco de indisponibilidade temporária de link em canteiro"
      },
      {
        "key": "riskScore",
        "label": "Classificação do Risco Residual",
        "placeholder": "Ex: Moderado / Aceito pelo C-Level"
      }
    ]
  },
  "MOD-RSK-02": {
    "title": "Declaração de Aplicabilidade Oficial (SoA — Anexo A ISO/IEC 27001:2022) Homologada",
    "signers": [
      {
        "role": "Diretoria Executiva — AC Engenharia (Aprovação SoA)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Gestor de T.I. & SecOps (Responsável Técnico)",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Encarregado(a) de Proteção de Dados (DPO)",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": []
  },
  "MOD-LGP-01": {
    "title": "Acordo de Processamento e Proteção de Dados Pessoais — Aditivo DPA (Empreiteiras e Fornecedores)",
    "signers": [
      {
        "role": "Pela CONTROLADORA — AC Engenharia",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      },
      {
        "role": "Pela OPERADORA CONTRATADA — Representante Legal",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      },
      {
        "role": "Visto Jurídico / Encarregado(a) de Dados (DPO)",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": [
      {
        "key": "operatorName",
        "label": "Razão Social da Operadora / Terceirizada",
        "placeholder": "Ex: Empreiteira Alpha Construções Ltda"
      },
      {
        "key": "operatorCnpj",
        "label": "CNPJ da Contratada",
        "placeholder": "00.000.000/0001-00"
      },
      {
        "key": "service",
        "label": "Objeto do Tratamento de Dados",
        "placeholder": "Ex: Controle de acesso físico e registro de ponto em obra"
      }
    ]
  },
  "MOD-LGP-02": {
    "title": "Termo Aditivo de Confidencialidade e Não Repasse de Leads Imobiliários (PCOM-003)",
    "signers": [
      {
        "role": "Controladora — AC Engenharia",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      },
      {
        "role": "Imobiliária Parceira / Corretor(a) Credenciado(a)",
        "docLabel": "CRECI-SE / CPF",
        "placeholder": "Ex: Corretor(a) Credenciado(a)"
      }
    ],
    "fields": []
  },
  "MOD-LGP-03": {
    "title": "Certidão e Resposta Oficial de Atendimento aos Direitos do Titular — DSAR (Prazo 15 Dias)",
    "signers": [
      {
        "role": "Encarregado(a) pelo Tratamento de Dados Pessoais (DPO) — AC Engenharia",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": [
      {
        "key": "holder",
        "label": "Nome do Titular Solicitante",
        "placeholder": "Ex: Carlos Silva"
      },
      {
        "key": "type",
        "label": "Direito Solicitado (Art. 18 LGPD)",
        "placeholder": "Ex: Confirmação de Tratamento e Acesso aos Dados"
      }
    ]
  },
  "MOD-LGP-04": {
    "title": "Relatório de Impacto à Proteção de Dados Pessoais (RIPD / DPIA — Art. 38 da LGPD)",
    "signers": [
      {
        "role": "Elaboração e Parecer — Encarregado(a) de Dados (DPO)",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      },
      {
        "role": "Validação de Controles Técnicos — Gestor SecOps",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Aprovação do Controlador — Diretoria AC Engenharia",
        "docLabel": "Diretoria Executiva",
        "placeholder": "Ex: Eng. João da Silva"
      }
    ],
    "fields": []
  },
  "MOD-LGP-05": {
    "title": "Termo de Consentimento Livre e Esclarecido para Atendimento em Estande e Simulação de Crédito",
    "signers": [
      {
        "role": "Titular dos Dados / Cliente Visitante",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Corretor(a) / Atendimento Comercial — AC Engenharia",
        "docLabel": "CRECI-SE / CPF",
        "placeholder": "Ex: Corretor(a) Credenciado(a)"
      }
    ],
    "fields": []
  },
  "MOD-AUD-01": {
    "title": "Ata e Relatório de Auditoria Interna de Conformidade SGSI (ISO 27001:2022 & LGPD)",
    "signers": [
      {
        "role": "Auditor(a) Líder Independente — ISO/IEC 27001",
        "docLabel": "Certificação / Registro",
        "placeholder": "Ex: Auditor(a) Independente ISO 27001"
      },
      {
        "role": "Ciência dos Auditados — DPO / Diretoria AC Engenharia",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": []
  },
  "MOD-AUD-02": {
    "title": "Termo de Cadeia de Custódia e Preservação de Evidência Digital Forense",
    "signers": [
      {
        "role": "Responsável pela Coleta e Geração do Hash",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      },
      {
        "role": "Custodiante Receptor / Homologação Forense",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome do Responsável"
      }
    ],
    "fields": []
  },
  "MOD-AUD-03": {
    "title": "Relatório de Não Conformidade (RNC), Análise de Causa Raiz e Ação Corretiva",
    "signers": [
      {
        "role": "Gestor Responsável pela Ação Corretiva",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Verificação de Eficácia — Auditoria / DPO AC Engenharia",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": []
  },
  "MOD-AUD-04": {
    "title": "Certificado de Integridade Criptográfica da Trilha Forense (Merkle Hash Chain SHA-256)",
    "signers": [
      {
        "role": "Custodiante Criptográfico — T.I. & SecOps",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Homologação Pericial — DPO / Auditoria AC Engenharia",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": []
  },
  "MOD-SEC-08": {
    "title": "Relatório Técnico de Investigação de Login Suspeito e Tentativa de Invasão",
    "signers": [
      {
        "role": "Analista Técnico de T.I. / CSIRT Investigador",
        "docLabel": "CPF / Registro Técnico",
        "placeholder": "Ex: Analista Investigador de T.I."
      },
      {
        "role": "Gestor Executivo de T.I. & SecOps",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Encarregado(a) de Dados (DPO) — Parecer Regulatório",
        "docLabel": "OAB / Certificação DPO",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": [
      {
        "key": "incidentNumber",
        "label": "Nº do Protocolo do Incidente",
        "placeholder": "Ex: INC-SEG-2026-0042"
      },
      {
        "key": "affectedUser",
        "label": "Nome / Login do Usuário Afetado",
        "placeholder": "Ex: joao.silva@acengenhariase.com.br"
      },
      {
        "key": "targetSystem",
        "label": "Sistema Alvo da Invasão",
        "placeholder": "Ex: ERP Sienge / Google Workspace / CV CRM"
      },
      {
        "key": "originIp",
        "label": "IP de Origem e Localização Detectada",
        "placeholder": "Ex: 185.220.101.5 (Frankfurt / Tor Exit)"
      }
    ]
  },
  "MOD-GOV-10": {
    "title": "Termo de Responsabilidade e Custódia de Certificado Digital (ICP-Brasil e-CNPJ / e-CPF)",
    "signers": [
      {
        "role": "Colaborador(a) Custodiante Declarador",
        "docLabel": "CPF",
        "placeholder": "Ex: Nome do Colaborador Custodiante"
      },
      {
        "role": "Gestor Imediato da Área Solicitante",
        "docLabel": "Matrícula / Cargo",
        "placeholder": "Ex: Gestor Imediato"
      },
      {
        "role": "Gestor Executivo de T.I. & SecOps — AC Engenharia",
        "docLabel": "CPF / Registro SecOps",
        "placeholder": "Ex: Carlos Santos"
      }
    ],
    "fields": [
      {
        "key": "certType",
        "label": "Tipo e Titularidade do Certificado",
        "placeholder": "Ex: e-CNPJ A3 Token USB / e-CNPJ A1 Arquivo"
      },
      {
        "key": "tokenAssetId",
        "label": "Patrimônio do Token ou Máquina (Opcional)",
        "placeholder": "Ex: Token USB nº 042 / Máquina TI-FIN-08"
      },
      {
        "key": "certValidity",
        "label": "Data de Validade do Certificado",
        "placeholder": "Ex: 18/11/2027"
      },
      {
        "key": "certScope",
        "label": "Escopo / Alçadas Autorizadas",
        "placeholder": "Ex: SPED (ECD, ECF, EFD), Emissão de NF-e Sienge e Conectividade Social"
      }
    ]
  }
};

function escapeDocHtml(val) {
  return String(val == null ? "" : val)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildSignatureGridHTML(signers, includeWitnesses = false, docCode = null) {
  const allSigs = getStoredTemplateSignatures();
  const docSigs = (docCode && Array.isArray(allSigs[docCode])) ? allSigs[docCode] : [];
  const customData = docCode ? getStoredDocumentCustomData(docCode) : { signers: [] };
  const customSigners = Array.isArray(customData.signers) ? customData.signers : [];

  const cards = signers.map((s, idx) => {
    const appliedSig = docSigs[idx] || null;
    const override = customSigners[idx] || {};

    const effectiveRole = (override.role && override.role.trim()) ? override.role.trim() : s.role;
    const effectiveName = (override.name !== undefined && override.name !== null && override.name.trim() !== "")
      ? override.name.trim()
      : (s.name || "");
    const effectiveDocLabel = (override.docLabel !== undefined && override.docLabel !== null && override.docLabel.trim() !== "")
      ? override.docLabel.trim()
      : (s.docLabel || "___________________________");

    if (appliedSig) {
      return `
        <div class="sig-box sig-box-signed">
          <div class="sig-badge-row">
            <span class="sig-status-badge">✓ ASSINADO DIGITALMENTE</span>
            <span class="sig-crypto-pill">SHA-256</span>
          </div>
          <div class="sig-cursive">${escapeDocHtml(appliedSig.signerName)}</div>
          <div class="sig-role">${escapeDocHtml(effectiveRole)}</div>
          <div class="sig-meta"><strong>Signatário:</strong> ${escapeDocHtml(appliedSig.signerName)} (${escapeDocHtml(appliedSig.signerDoc || "Verificado via RBAC")})</div>
          <div class="sig-meta"><strong>Modalidade:</strong> ${escapeDocHtml(appliedSig.method || "Assinatura Eletrônica SGSI / ICP-Brasil")}</div>
          <div class="sig-meta"><strong>Carimbo de Tempo:</strong> ${escapeDocHtml(appliedSig.timestamp)} &bull; <strong>IP:</strong> ${escapeDocHtml(appliedSig.ip || "127.0.0.1")}</div>
          <div class="sig-hash-box"><strong>Hash SHA-256:</strong> ${escapeDocHtml(appliedSig.hash)}</div>
        </div>
      `;
    }

    const hasExplicitName = Boolean(effectiveName && !effectiveName.startsWith("[") && !effectiveName.includes("_____"));
    const displayName = hasExplicitName ? escapeDocHtml(effectiveName) : "[ Preencher Nome Completo / Assinatura ]";
    const nameColor = hasExplicitName ? "#0b1a30" : "#64748b";

    return `
      <div class="sig-box">
        <div class="sig-line"></div>
        <div class="sig-role">${escapeDocHtml(effectiveRole)}</div>
        <div class="sig-name">
          <strong>Nome Legível:</strong> 
          <span class="sig-editable-slot" style="color: ${nameColor}; border-bottom: 1px dashed #94a3b8; display: inline-block; min-width: 210px; font-weight: ${hasExplicitName ? '700' : 'normal'};">
            ${displayName}
          </span>
        </div>
        <div class="sig-meta">
          <strong>Cargo / Setor:</strong> ${escapeDocHtml(effectiveRole)}
        </div>
        <div class="sig-meta">
          <strong>CPF / CREA / OAB:</strong> 
          <span style="color: ${hasExplicitName ? '#0b1a30' : '#64748b'}; border-bottom: 1px dashed #cbd5e1; display: inline-block; min-width: 140px;">
            ${escapeDocHtml(effectiveDocLabel)}
          </span>
        </div>
        <div class="sig-meta" style="margin-top: 6px; font-size: 7.5pt; color: #64748b; border-top: 1px dotted #e2e8f0; padding-top: 4px;">
          <strong>Data da Homologação:</strong> ____ / ____ / 202___ &nbsp;|&nbsp; <em>Homologação Gerencial &bull; Assinatura Física ou Digital</em>
        </div>
      </div>
    `;
  }).join("");

  const extraSigsHtml = docSigs.slice(signers.length).map(appliedSig => `
    <div class="sig-box sig-box-signed">
      <div class="sig-badge-row">
        <span class="sig-status-badge">✓ ASSINADO DIGITALMENTE</span>
        <span class="sig-crypto-pill">SHA-256</span>
      </div>
      <div class="sig-cursive">${escapeDocHtml(appliedSig.signerName)}</div>
      <div class="sig-role">${escapeDocHtml(appliedSig.signerRole || "Homologação Digital SGSI")}</div>
      <div class="sig-meta"><strong>Signatário:</strong> ${escapeDocHtml(appliedSig.signerName)} (${escapeDocHtml(appliedSig.signerDoc || "Verificado via RBAC")})</div>
      <div class="sig-meta"><strong>Modalidade:</strong> ${escapeDocHtml(appliedSig.method || "Assinatura Eletrônica SGSI / ICP-Brasil")}</div>
      <div class="sig-meta"><strong>Carimbo de Tempo:</strong> ${escapeDocHtml(appliedSig.timestamp)} &bull; <strong>IP:</strong> ${escapeDocHtml(appliedSig.ip || "127.0.0.1")}</div>
      <div class="sig-hash-box"><strong>Hash SHA-256:</strong> ${escapeDocHtml(appliedSig.hash)}</div>
    </div>
  `).join("");

  const witnesses = includeWitnesses ? `
    <div style="margin-top: 16px; page-break-inside: avoid;">
      <div class="sec-sub">Testemunhas Instrumentárias Homologadas</div>
      <div class="sig-grid">
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-role">1ª Testemunha Instrumentária</div>
          <div class="sig-name"><strong>Nome:</strong> <span style="border-bottom: 1px dashed #94a3b8; display: inline-block; min-width: 180px;">___________________________</span></div>
          <div class="sig-meta"><strong>CPF:</strong> _________________________</div>
        </div>
        <div class="sig-box">
          <div class="sig-line"></div>
          <div class="sig-role">2ª Testemunha Instrumentária</div>
          <div class="sig-name"><strong>Nome:</strong> <span style="border-bottom: 1px dashed #94a3b8; display: inline-block; min-width: 180px;">___________________________</span></div>
          <div class="sig-meta"><strong>CPF:</strong> _________________________</div>
        </div>
      </div>
    </div>
  ` : "";

  return `
    <div class="section" style="page-break-inside: avoid; break-inside: avoid; margin-top: 24px; padding-top: 14px; border-top: 1.5px solid #cbd5e1;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <h2 style="margin: 0; border: none; background: transparent; padding: 0; font-size: 10.5pt; color: #0b1a30; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;">
          Quadro de Homologação, Validação Gerencial &amp; Assinaturas Formais
        </h2>
        <span style="font-size: 7.5pt; font-weight: 700; color: #059669; background: #ecfdf5; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px; text-transform: uppercase;">
          Eficácia Legal (Lei 14.063/2020)
        </span>
      </div>
      <p class="muted">Este instrumento corporativo da <strong>AC Engenharia</strong> admite preenchimento e assinatura física manuscrita, assinatura eletrônica auditada no SGSI com selo temporal SHA-256 ou assinatura digital qualificada (ICP-Brasil / Portal Gov.br), nos termos da Lei nº 14.063/2020 e MP nº 2.200-2/2001, devendo ser arquivado no <strong>Repositório de Evidências do SGSI</strong> para fins de auditoria interna, externa e conformidade da gerência.</p>
      <div class="sig-grid">${cards}${extraSigsHtml}</div>
      ${witnesses}
    </div>
  `;
}

function buildCorporateDocumentHTML(meta, bodyHtml, options = {}) {
  const ctx = getTemplateContextDefaults();
  const unitName = options.unit || ctx.activeUnit;
  const protocolCode = `SGSI-${meta.code}-${new Date().getFullYear()}`;
  const isWord = Boolean(options.forWord);
  const managerDept = meta.department || MODULE_MANAGEMENT_DEPT[meta.module] || "Gerência Executiva de T.I., SecOps & Governança SGSI";

  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeDocHtml(meta.code)} - ${escapeDocHtml(meta.title)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
    }
    @page Section1 { size: 595.3pt 841.9pt; margin: 38pt 40pt 40pt 40pt; }
    div.Section1 { page: Section1; }
    * { box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Inter", "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: ${isWord ? "#ffffff" : "#f1f5f9"};
      margin: 0;
      padding: ${isWord ? "0" : "20px 14px"};
      font-size: 9.5pt;
      line-height: 1.55;
      -webkit-font-smoothing: antialiased;
    }
    .page-sheet {
      max-width: 210mm;
      margin: 0 auto;
      background: #ffffff;
      padding: ${isWord ? "0" : "18mm 16mm"};
      border: ${isWord ? "none" : "1px solid #cbd5e1"};
      border-radius: ${isWord ? "0" : "8px"};
      box-shadow: ${isWord ? "none" : "0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)"};
    }
    .toolbar-no-print {
      max-width: 210mm;
      margin: 0 auto 12px auto;
      background: linear-gradient(135deg, #0b1a30 0%, #004b93 100%);
      color: #ffffff;
      padding: 10px 16px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      font-size: 11.5px;
      box-shadow: 0 4px 12px rgba(11,26,48,0.15);
    }
    .toolbar-no-print button {
      background: #ffffff;
      color: #0b1a30;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .toolbar-no-print button:hover {
      background: #f8fafc;
      transform: translateY(-1px);
    }
    .header-top-accent {
      height: 4px;
      background: linear-gradient(90deg, #004b93 0%, #0284c7 60%, #10b981 100%);
      border-radius: 2px;
      margin-bottom: 14px;
    }
    .doc-header-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 14px;
      border: 1.5px solid #cbd5e1;
      border-radius: 8px;
      overflow: hidden;
      background: #ffffff;
    }
    .brand-cell {
      width: 54%;
      padding: 12px 16px;
      vertical-align: middle;
      border-right: 1.5px solid #cbd5e1;
      background: #fafbfc;
    }
    .meta-cell {
      width: 46%;
      padding: 10px 14px;
      vertical-align: middle;
      background: #ffffff;
    }
    .brand-logo-badge {
      width: 42px;
      height: 42px;
      border-radius: 8px;
      background: linear-gradient(135deg, #0b1a30 0%, #004b93 100%);
      color: #ffffff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 15pt;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 6px rgba(0, 75, 147, 0.2);
      text-align: center;
      line-height: 42px;
      float: left;
      margin-right: 12px;
    }
    .brand-company-name {
      font-size: 13.5pt;
      font-weight: 800;
      color: #0b1a30;
      letter-spacing: 0.05em;
      line-height: 1.1;
    }
    .brand-subtext {
      font-size: 8pt;
      color: #64748b;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-top: 3px;
    }
    .brand-norm-pills {
      margin-top: 5px;
    }
    .norm-pill {
      display: inline-block;
      padding: 1.5px 6px;
      font-size: 7pt;
      font-weight: 700;
      border-radius: 4px;
      text-transform: uppercase;
      margin-right: 4px;
    }
    .norm-pill-iso {
      color: #004b93;
      background: #eff6ff;
      border: 1px solid #bfdbfe;
    }
    .norm-pill-lgpd {
      color: #065f46;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
    }
    .norm-pill-nr {
      color: #92400e;
      background: #fffbeb;
      border: 1px solid #fde68a;
    }
    .doc-title-banner {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 5px solid #004b93;
      border-radius: 6px;
      padding: 12px 16px;
      margin-bottom: 18px;
    }
    .doc-type-eyebrow {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #004b93;
      margin-bottom: 4px;
    }
    .doc-main-title {
      font-size: 12.5pt;
      font-weight: 800;
      color: #0b1a30;
      margin: 0;
      line-height: 1.35;
      letter-spacing: -0.01em;
      text-transform: uppercase;
    }
    h2 {
      font-size: 10pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: #0b1a30;
      background: #f8fafc;
      border-left: 3.5px solid #004b93;
      border-bottom: 1px solid #cbd5e1;
      padding: 6px 12px;
      margin: 20px 0 10px 0;
      border-radius: 0 4px 4px 0;
      page-break-after: avoid;
      break-after: avoid;
    }
    .sec-sub {
      font-size: 9pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #334155;
      margin: 12px 0 6px 0;
      padding-bottom: 3px;
      border-bottom: 1px dashed #cbd5e1;
      page-break-after: avoid;
      break-after: avoid;
    }
    p, li {
      font-size: 9.5pt;
      text-align: justify;
      margin: 6px 0;
      color: #1e293b;
      line-height: 1.6;
    }
    ul, ol {
      margin: 6px 0 12px 22px;
      padding: 0;
    }
    table.data-table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin: 12px 0 16px 0;
      font-size: 9pt;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      page-break-inside: auto;
    }
    table.data-table tr {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    table.data-table th {
      background: #f1f5f9;
      color: #0b1a30;
      font-weight: 700;
      text-align: left;
      padding: 7px 10px;
      border-bottom: 1.5px solid #94a3b8;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    table.data-table td {
      padding: 7px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
      vertical-align: top;
      line-height: 1.45;
    }
    table.data-table tr:last-child td {
      border-bottom: none;
    }
    table.data-table tr:nth-child(even) td {
      background-color: #fafbfc;
    }
    .callout {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-left: 3.5px solid #004b93;
      border-radius: 6px;
      padding: 10px 14px;
      margin: 12px 0;
      font-size: 9pt;
      line-height: 1.5;
      color: #334155;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .muted {
      color: #64748b;
      font-size: 8pt;
      line-height: 1.5;
    }
    .section, .signature-section, .approval-wrapper, .approval-container, .sig-grid {
      display: table;
      width: 100%;
      table-layout: fixed;
      margin-top: 14px;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .sig-box {
      display: inline-block;
      vertical-align: top;
      width: 48%;
      margin: 6px 1% 10px 0;
      padding: 12px 14px;
      border: 1px solid #cbd5e1;
      background: #ffffff;
      border-radius: 6px;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .sig-box-signed {
      border: 1.5px solid #10b981 !important;
      background: #f0fdf4 !important;
      box-shadow: 0 2px 6px rgba(16, 185, 129, 0.08);
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .sig-badge-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #a7f3d0;
      padding-bottom: 4px;
      margin-bottom: 6px;
    }
    .sig-status-badge {
      font-size: 7.5pt;
      font-weight: 800;
      color: #065f46;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .sig-crypto-pill {
      font-family: monospace;
      font-size: 7pt;
      font-weight: 700;
      background: #059669;
      color: #ffffff;
      padding: 1px 5px;
      border-radius: 3px;
    }
    .sig-cursive {
      font-family: "Brush Script MT", "Segoe Script", cursive, sans-serif;
      font-size: 16pt;
      color: #065f46;
      line-height: 1.2;
      margin-bottom: 4px;
    }
    .sig-hash-box {
      font-family: monospace;
      font-size: 7pt;
      color: #047857;
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      padding: 3px 6px;
      border-radius: 4px;
      margin-top: 6px;
      word-break: break-all;
    }
    .sig-line {
      border-bottom: 1.5px solid #0b1a30;
      height: 28px;
      margin-bottom: 8px;
    }
    .sig-role {
      font-weight: 700;
      font-size: 8.5pt;
      color: #0b1a30;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .sig-name, .sig-meta {
      font-size: 8pt;
      color: #334155;
      margin-top: 2px;
    }
    .doc-footer {
      margin-top: 24px;
      padding-top: 10px;
      border-top: 1.5px solid #cbd5e1;
      font-size: 8pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    @media print {
      body { background: #ffffff !important; padding: 0 !important; color: #000000 !important; }
      .page-sheet { border: none !important; box-shadow: none !important; padding: 0 !important; max-width: 100% !important; border-radius: 0 !important; margin: 0 !important; }
      .toolbar-no-print { display: none !important; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      .doc-header-table, .brand-cell, .meta-cell { border-color: #94a3b8 !important; page-break-inside: avoid !important; break-inside: avoid !important; break-after: avoid !important; }
      .doc-title-banner { background: #f8fafc !important; border-color: #94a3b8 !important; border-left: 5px solid #004b93 !important; page-break-inside: avoid !important; break-inside: avoid !important; }
      
      /* Previne títulos e seções órfãs */
      h1, h2, h3, h4, .sec-sub {
        background: #f1f5f9 !important;
        border-left: 3.5px solid #004b93 !important;
        border-bottom: 1px solid #94a3b8 !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      h1 + *, h2 + *, h3 + *, .sec-sub + * {
        page-break-before: avoid !important;
        break-before: avoid !important;
      }

      /* Callouts NUNCA são partidos ao meio por quebra de página */
      .callout {
        background: #f8fafc !important;
        border: 1px solid #94a3b8 !important;
        border-left: 4px solid #004b93 !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }

      /* Tabelas e linhas */
      table.data-table { border: 1px solid #94a3b8 !important; page-break-inside: auto; }
      table.data-table thead { display: table-header-group !important; }
      table.data-table tr { page-break-inside: avoid !important; break-inside: avoid !important; }
      table.data-table th { background: #f1f5f9 !important; border-bottom: 1.5px solid #64748b !important; page-break-inside: avoid !important; break-inside: avoid !important; }
      table.data-table td { border-bottom: 1px solid #cbd5e1 !important; }

      /* Assinaturas e Homologações */
      .section, .signature-section, .approval-wrapper, .approval-container, .sig-grid {
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .sig-box { border: 1px solid #94a3b8 !important; page-break-inside: avoid !important; break-inside: avoid !important; }
      .sig-box-signed { border: 1.5px solid #059669 !important; background: #f0fdf4 !important; page-break-inside: avoid !important; break-inside: avoid !important; }

      /* Listas e parágrafos */
      li { page-break-inside: avoid !important; break-inside: avoid !important; }
      p { orphans: 3 !important; widows: 3 !important; }

      .doc-footer { border-top: 1.5px solid #94a3b8 !important; page-break-inside: avoid !important; break-inside: avoid !important; }
    }
  </style>
</head>
<body>
  ${options.showStandaloneToolbar ? `
  <div class="toolbar-no-print">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="background: rgba(255,255,255,0.2); padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: 800; font-size: 11px;">${escapeDocHtml(meta.code)}</span>
      <strong style="color: #ffffff;">${escapeDocHtml(meta.title)}</strong>
    </div>
    <div style="display:flex; gap:8px;">
      <button type="button" onclick="window.print()">🖨️ Imprimir / Salvar como PDF</button>
    </div>
  </div>` : ""}
  <div class="Section1 page-sheet">
    <div class="header-top-accent"></div>

    <table class="doc-header-table">
      <tr>
        <td class="brand-cell">
          <div class="brand-logo-badge">AC</div>
          <div>
            <div class="brand-company-name">AC ENGENHARIA</div>
            <div class="brand-subtext">Sistema de Gestão de Segurança da Informação &amp; Governança GRC</div>
            <div class="brand-norm-pills">
              <span class="norm-pill norm-pill-iso">ISO/IEC 27001:2022</span>
              <span class="norm-pill norm-pill-lgpd">LGPD (Lei 13.709)</span>
              <span class="norm-pill norm-pill-nr">NR-18 / NR-07</span>
            </div>
          </div>
        </td>
        <td class="meta-cell">
          <table style="width: 100%; border-collapse: collapse; font-size: 8.5pt;">
            <tr>
              <td style="padding: 2.5px 0; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.04em;">Código Oficial:</td>
              <td style="padding: 2.5px 0; text-align: right;">
                <span style="display: inline-block; padding: 2px 8px; font-family: monospace; font-size: 8.5pt; font-weight: 800; color: #ffffff; background: #0b1a30; border-radius: 4px;">${escapeDocHtml(meta.code)}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.04em;">Gerência Responsável:</td>
              <td style="padding: 2.5px 0; text-align: right; color: #0b1a30; font-weight: 700; font-size: 8pt;">${escapeDocHtml(managerDept)}</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.04em;">Classificação:</td>
              <td style="padding: 2.5px 0; text-align: right;">
                <span style="display: inline-block; padding: 1.5px 6px; font-size: 7.5pt; font-weight: 700; color: #92400e; background: #fef3c7; border: 1px solid #fde68a; border-radius: 4px;">${escapeDocHtml(meta.classification || "CONFIDENCIAL / RESTRITO")}</span>
              </td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.04em;">Protocolo SGSI:</td>
              <td style="padding: 2.5px 0; text-align: right; font-family: monospace; font-size: 8pt; color: #334155; font-weight: 700;">${escapeDocHtml(protocolCode)}</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.04em;">Versão / Emissão:</td>
              <td style="padding: 2.5px 0; text-align: right; color: #334155; font-weight: 600;">${escapeDocHtml(meta.version || "v2.4")} &bull; ${escapeDocHtml(ctx.todayBr)}</td>
            </tr>
            <tr>
              <td style="padding: 2.5px 0; color: #64748b; font-weight: 600; text-transform: uppercase; font-size: 7.5pt; letter-spacing: 0.04em;">Unidade / Abrangência:</td>
              <td style="padding: 2.5px 0; text-align: right; color: #004b93; font-weight: 700;">${escapeDocHtml(unitName)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div class="doc-title-banner">
      <div class="doc-type-eyebrow">
        <span>${escapeDocHtml(meta.docType || "INSTRUMENTO NORMATIVO HOMOLOGADO")}</span>
        <span style="margin: 0 6px; color: #94a3b8;">&bull;</span>
        <span>GERÊNCIA RESPONSÁVEL: ${escapeDocHtml(managerDept.toUpperCase())}</span>
      </div>
      <h1 class="doc-main-title">${escapeDocHtml(meta.title)}</h1>
      <div style="font-size: 8.5pt; color: #475569; margin-top: 5px; font-weight: 500;">
        <strong>Conformidade Regulatória:</strong> ${escapeDocHtml(meta.normative)} &nbsp;|&nbsp; <strong>Validade Operacional:</strong> AC Engenharia (Matriz &amp; Canteiros)
      </div>
    </div>

    ${bodyHtml}

    <div class="doc-footer">
      <div>
        <strong style="color: #0b1a30;">${escapeDocHtml(ctx.company)}</strong> &bull; Sistema Integrado de Gestão da Segurança da Informação &amp; Governança Corporativa<br/>
        <span>Documento Homologado &bull; ABNT NBR ISO/IEC 27001:2022 &bull; LGPD (Lei nº 13.709/2018) &bull; NR-18</span>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 7.5pt; font-weight: 700; color: #004b93; background: #eff6ff; border: 1px solid #bfdbfe; padding: 1.5px 6px; border-radius: 3px;">CUSTÓDIA FORENSE SHA-256</span><br/>
        <span style="font-family: monospace; font-size: 7.5pt;">Gerado em ${escapeDocHtml(ctx.nowBr)} | Protocolo: ${escapeDocHtml(protocolCode)}</span>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ============================================================================
// CATÁLOGO COMPLETO DOS 36 MODELOS, ATAS, POLÍTICAS, LAUDOS E TERMOS OFICIAIS
// ============================================================================

const CORPORATE_DOCUMENT_TEMPLATES = [
  // --------------------------------------------------------------------------
  // MÓDULO 02: CENTRAL & CANTEIROS (OBRAS)
  // --------------------------------------------------------------------------
  {
    code: "MOD-OBR-01",
    module: "obras",
    docType: "Checklist / Laudo",
    requiresSignature: true,
    title: "Checklist de Mobilização de TI e Segurança Física de Canteiro de Obras",
    normative: "ISO/IEC 27001 A.7.1, A.7.4, A.8.20 & NR-18",
    evidenceCategory: "Canteiros de Obras",
    signersSummary: "Engenheiro Residente + Gestor de T.I. / SecOps",
    summary: "Vistoria obrigatória na abertura de canteiro adjacente: tranca de container técnico, rack, nobreak, túnel VPN IPSec com a Matriz, Wi-Fi VLAN 30 e CFTV.",
    buildBody: (ctx, custom = {}) => `
      <h2>1. Identificação do Empreendimento / Canteiro Adjacente</h2>
      <table class="data-table">
        <tr>
          <td width="50%"><strong>Unidade / Obra:</strong> ${escapeDocHtml(custom.obra || ctx.activeUnit)}</td>
          <td width="50%"><strong>Data da Vistoria:</strong> ____/____/202___</td>
        </tr>
        <tr>
          <td><strong>Engenheiro(a) Residente:</strong> ${escapeDocHtml(custom.engineer || "___________________________________")}</td>
          <td><strong>Analista T.I. / SecOps:</strong> ${escapeDocHtml(ctx.secopsName)}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Endereço do Canteiro:</strong> ___________________________________________________________________________</td>
        </tr>
      </table>

      <h2>2. Itens de Inspeção de Segurança Física e Infraestrutura (ISO 27001 A.7 &amp; A.8)</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th width="8%">Item</th>
            <th width="54%">Requisito de Segurança e Conformidade</th>
            <th width="20%">Status</th>
            <th width="18%">Observação / Série</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>01</td><td>Container de Engenharia/TI com porta reforçada, fechadura restrita e controle de chaves</td><td>[ ] OK &nbsp;[ ] Pend.</td><td></td></tr>
          <tr><td>02</td><td>Rack de telecomunicações fechado com chave, ventilado e protegido contra poeira/umidade</td><td>[ ] OK &nbsp;[ ] Pend.</td><td></td></tr>
          <tr><td>03</td><td>Nobreak senoidal homologado instalado e testado para roteador MikroTik e catracas</td><td>[ ] OK &nbsp;[ ] Pend.</td><td></td></tr>
          <tr><td>04</td><td>Túnel VPN IPSec / WireGuard ativo e criptografado com o Escritório Central (Matriz)</td><td>[ ] OK &nbsp;[ ] Pend.</td><td></td></tr>
          <tr><td>05</td><td>Segregação lógica ativa: VLAN 20 (Engenharia/BIM), VLAN 30 (Catracas/CFTV) e Wi-Fi Visitantes isolado</td><td>[ ] OK &nbsp;[ ] Pend.</td><td></td></tr>
          <tr><td>06</td><td>Notebooks da obra com BitLocker TPM 2.0 ativo, Agente Wazuh EDR e bloqueio de portas USB (GPO)</td><td>[ ] OK &nbsp;[ ] Pend.</td><td></td></tr>
          <tr><td>07</td><td>Catracas biométricas faciais operando sem armazenamento de foto bruta em pasta aberta</td><td>[ ] OK &nbsp;[ ] Pend.</td><td></td></tr>
          <tr><td>08</td><td>Placa informativa de monitoramento CFTV e canal do DPO afixada na portaria da obra (LGPD Art. 9º)</td><td>[ ] OK &nbsp;[ ] Pend.</td><td></td></tr>
        </tbody>
      </table>

      <h2>3. Parecer de Liberação Operacional</h2>
      <p>[ &nbsp; ] <strong>APROVADO</strong> para operação conectada à Matriz da AC Engenharia. &nbsp;&nbsp;&nbsp; [ &nbsp; ] <strong>APROVADO COM RESSALVAS</strong> (prazo de adequação: ___ dias).</p>
      <p><strong>Observações Adicionais:</strong> ____________________________________________________________________________________</p>

      ${buildSignatureGridHTML([
        { role: "Engenheiro(a) Residente / Gestor da Obra", name: custom.engineer || "" },
        { role: "Gestor de T.I. & SecOps (Homologação Matriz)", name: ctx.secopsName }
      ], false, "MOD-OBR-01")}
    `
  },
  {
    code: "MOD-OBR-02",
    module: "obras",
    docType: "Termo / Certificado",
    requiresSignature: true,
    title: "Termo e Certificado de Expurgo Seguro de Biometria Facial Pós-Habite-se (PBIO-004)",
    normative: "LGPD Arts. 11, 15 e 16 & ISO/IEC 27001 A.8.10",
    evidenceCategory: "Canteiros de Obras",
    signersSummary: "Engenheiro Residente + T.I./SecOps + Encarregado(a) DPO",
    summary: "Comprova a eliminação definitiva e sobrescrita segura dos templates biométricos faciais dos operários nas catracas após entrega da obra / Habite-se.",
    buildBody: (ctx, custom = {}) => `
      <h2>1. Qualificação da Desmobilização do Canteiro</h2>
      <p>Pelo presente instrumento formal de conformidade regulatória da <strong>${escapeDocHtml(ctx.company)}</strong>, certificamos que, em virtude da conclusão construtiva e expedição do <strong>Habite-se / Encerramento Operacional</strong> do empreendimento <strong>${escapeDocHtml(custom.obra || "________________________________________")}</strong>, foi executada a rotina mandatória de eliminação segura de dados pessoais sensíveis (biometria facial e digital), nos termos dos Arts. 11, 15 e 16 da Lei nº 13.709/2018 (LGPD) e da Diretriz Interna <strong>PBIO-004</strong>.</p>

      <h2>2. Inventário de Equipamentos e Bancos Sanitizados</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Equipamento / Sistema</th>
            <th>Fabricante / Modelo / IP</th>
            <th>Qtd. Templates Excluídos</th>
            <th>Método de Sanitização</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Catraca Portaria Principal 01</td>
            <td>Control iD / Henry / Hikvision — IP: ______________</td>
            <td>_______ registros</td>
            <td>Factory Reset + Wipe Flash</td>
          </tr>
          <tr>
            <td>Catraca Portaria Serviços 02</td>
            <td>Control iD / Henry / Hikvision — IP: ______________</td>
            <td>_______ registros</td>
            <td>Factory Reset + Wipe Flash</td>
          </tr>
          <tr>
            <td>Repositório Local / Middleware</td>
            <td>Servidor / Nuvem de Sincronismo ISAPI</td>
            <td>_______ registros</td>
            <td>Exclusão Lógica + Expurgo Backup</td>
          </tr>
        </tbody>
      </table>

      <div class="callout">
        <strong>Ressalva de Retenção Legal Obrigatória (Art. 16, I da LGPD):</strong> Permanecem arquivados exclusivamente no ERP Sienge na Matriz da AC Engenharia os registros textuais de ponto, ASOs (NR-07 — retenção mínima de 20 anos) e contratos de trabalho exigidos pela legislação trabalhista, previdenciária e fiscal, <strong>sem qualquer retenção de template biométrico facial</strong>.
      </div>

      ${buildSignatureGridHTML([
        { role: "Executor Técnico de T.I. / SecOps", name: ctx.secopsName },
        { role: "Engenheiro(a) Residente da Obra", name: "" },
        { role: "Homologação Encarregado(a) de Dados (DPO)", name: ctx.dpoName, docLabel: "OAB / Certificação DPO: ________________________" }
      ], false, "MOD-OBR-02")}
    `
  },
  {
    code: "MOD-OBR-03",
    module: "obras",
    docType: "Termo para Assinatura",
    requiresSignature: true,
    title: "Termo Individual de Ciência de Coleta Biométrica e Acesso em Canteiro (NR-18)",
    normative: "LGPD Art. 11, II, 'a' e 'g' & NR-18 (Segurança na Construção)",
    evidenceCategory: "Conscientização & RH",
    signersSummary: "Colaborador / Operário Terceirizado + RH / SST",
    summary: "Termo assinado na integração do operário na obra dando ciência da biometria facial exclusiva para segurança física NR-18 e controle de acesso.",
    buildBody: (ctx) => `
      <h2>1. Identificação do Trabalhador (Próprio ou Empreiteira Terceirizada)</h2>
      <table class="data-table">
        <tr>
          <td width="60%"><strong>Nome Completo:</strong> ______________________________________________________</td>
          <td width="40%"><strong>CPF:</strong> ___________________________</td>
        </tr>
        <tr>
          <td><strong>Função / Cargo:</strong> ______________________________________________________</td>
          <td><strong>Empresa / Empreiteira:</strong> ______________________</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Obra / Canteiro de Lotação:</strong> ${escapeDocHtml(ctx.activeUnit)}</td>
        </tr>
      </table>

      <h2>2. Finalidade Estrita e Base Legal do Tratamento Biométrico</h2>
      <ol>
        <li><strong>Finalidade Exclusiva:</strong> O trabalhador acima identificado declara estar ciente de que sua biometria facial será cadastrada nas catracas eletrônicas do canteiro de obras da <strong>${escapeDocHtml(ctx.company)}</strong> <strong>exclusivamente</strong> para controle de acesso físico a área de risco construtivo, verificação de aptidão de Segurança e Saúde no Trabalho (NR-18, NR-07 e NR-35) e prevenção a fraude de identificação.</li>
        <li><strong>Base Legal (Art. 11, II, "a" e "g" da LGPD):</strong> Cumprimento de obrigação legal/regulatória trabalhista e garantia da prevenção à fraude e à segurança do titular no acesso às dependências da obra.</li>
        <li><strong>Vedação de Uso Secundário e Prazo de Descarte:</strong> A <strong>${escapeDocHtml(ctx.company)}</strong> garante que o padrão biométrico é armazenado em formato criptografado (hash matemático), jamais será compartilhado para fins comerciais e será <strong>integralmente eliminado</strong> das catracas após o desligamento do trabalhador ou emissão do Habite-se da obra.</li>
        <li><strong>Direitos do Titular (Art. 18 LGPD):</strong> A qualquer momento, dúvidas ou requerimentos podem ser encaminhados gratuitamente ao Encarregado de Dados (DPO) pelo canal <strong>${escapeDocHtml(ctx.dpoEmail)}</strong>.</li>
      </ol>

      ${buildSignatureGridHTML([
        { role: "Trabalhador / Titular dos Dados", name: "Assinatura do Colaborador / Operário", docLabel: "CPF: ___________________________________________" },
        { role: "Responsável pela Integração (RH / Técnico SST — AC Engenharia)", name: "" }
      ], false, "MOD-OBR-03")}
    `
  },
  {
    code: "MOD-OBR-03B",
    module: "obras",
    docType: "Termo para Assinatura",
    requiresSignature: true,
    title: "Termo Individual de Ciência de Controle de Acesso e Identificação em Canteiro (QR Code / Crachá - NR-18)",
    normative: "LGPD Art. 7º, II e IX & NR-18 (Segurança na Construção Civil)",
    evidenceCategory: "Conscientização & RH",
    signersSummary: "Colaborador / Operário Terceirizado + RH / SST",
    summary: "Termo de ciência para controle de acesso por QR Code e identificação fotográfica cadastral em canteiro, sem coleta de dados biométricos sensíveis.",
    buildBody: (ctx) => `
      <h2>1. Identificação do Trabalhador (Próprio ou Empreiteira Terceirizada)</h2>
      <table class="data-table">
        <tr>
          <td width="60%"><strong>Nome Completo:</strong> ______________________________________________________</td>
          <td width="40%"><strong>CPF:</strong> ___________________________</td>
        </tr>
        <tr>
          <td><strong>Função / Cargo:</strong> ______________________________________________________</td>
          <td><strong>Empresa / Empreiteira:</strong> ______________________</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Obra / Canteiro de Lotação:</strong> ${escapeDocHtml(ctx.activeUnit)}</td>
        </tr>
      </table>

      <h2>2. Finalidade Estrita e Tratamento de Dados para Controle de Acesso</h2>
      <ol>
        <li><strong>Finalidade Exclusiva:</strong> O trabalhador declara estar ciente de que sua fotografia e dados cadastrais serão utilizados para a geração de credencial de acesso (QR Code) e identificação visual nas catracas, exclusivamente para controle de acesso físico à área de risco e prevenção a fraudes.</li>
        <li><strong>Inexistência de Tratamento Biométrico Sensível:</strong> Fica expressamente cientificado que o sistema de controle de acesso da <strong>${escapeDocHtml(ctx.company)}</strong> opera unicamente por validação de credencial digital/óptica (QR Code) e conferência visual de fotografia no crachá e portaria da obra, <strong>não havendo qualquer coleta, escaneamento, leitura, extração ou armazenamento de dados biométricos faciais, digitais ou sensíveis (Art. 5º, II e Art. 11 da Lei nº 13.709/2018 - LGPD)</strong>.</li>
        <li><strong>Base Legal (Art. 7º, II e IX da LGPD & NR-18):</strong> O tratamento dos dados cadastrais e da fotografia fundamenta-se no cumprimento de obrigação legal e regulatória trabalhista e de Segurança e Saúde no Trabalho (Normas Regulamentadoras NR-01, NR-07 e NR-18) e no legítimo interesse da Controladora na proteção da integridade física dos trabalhadores e segurança patrimonial da obra.</li>
        <li><strong>Guarda Segura, Sigilo e Descarte da Credencial:</strong> A <strong>${escapeDocHtml(ctx.company)}</strong> assegura que a fotografia e os dados cadastrais coletados jamais serão comercializados ou cedidos a terceiros para fins publicitários ou mercadológicos. A credencial QR Code e as permissões de acesso físico serão <strong>integralmente bloqueadas e inativadas</strong> nas catracas após o desligamento do trabalhador da empreiteira ou na conclusão da respectiva etapa construtiva no canteiro.</li>
        <li><strong>Direitos do Titular (Art. 18 LGPD):</strong> A qualquer momento, confirmação de tratamento, correções cadastrais ou esclarecimentos sobre privacidade podem ser solicitados gratuitamente ao Encarregado de Proteção de Dados (DPO) através do canal oficial: <strong>${escapeDocHtml(ctx.dpoEmail)}</strong>.</li>
      </ol>

      ${buildSignatureGridHTML([
        { role: "Trabalhador / Titular dos Dados", name: "Assinatura do Colaborador / Operário", docLabel: "CPF: ___________________________________________" },
        { role: "Responsável pela Integração (RH / Técnico SST — AC Engenharia)", name: "" }
      ], false, "MOD-OBR-03B")}
    `
  },
  {
    code: "MOD-OBR-04",
    module: "obras",
    docType: "Laudo / Termo",
    requiresSignature: true,
    title: "Termo de Homologação de Câmeras CFTV, Drones de Obra e Placas de Privacidade (LGPD)",
    normative: "ISO/IEC 27001 A.7.4 (Monitoramento Físico) & LGPD Art. 9º",
    evidenceCategory: "Canteiros de Obras",
    signersSummary: "Engenheiro Residente + Segurança Patrimonial / T.I. + DPO",
    summary: "Homologa o ângulo de captação de câmeras CFTV e voos técnicos de drones de engenharia, atestando a fixação de placas informativas LGPD no perímetro da obra.",
    buildBody: (ctx, custom = {}) => `
      <h2>1. Escopo do Monitoramento Físico e Aéreo no Canteiro</h2>
      <table class="data-table">
        <tr>
          <td width="55%"><strong>Unidade / Canteiro:</strong> ${escapeDocHtml(custom.obra || ctx.activeUnit)}</td>
          <td width="45%"><strong>VLAN de Isolamento CFTV:</strong> VLAN 30 (Isolada)</td>
        </tr>
        <tr>
          <td><strong>Qtd. Câmeras Fixas / Speed Dome:</strong> _____ unidades</td>
          <td><strong>Retenção do DVR / NVR:</strong> 30 dias (sobrescrita FIFO)</td>
        </tr>
      </table>

      <h2>2. Diretrizes de Minimização e Transparência (LGPD Art. 6º, III e Art. 9º)</h2>
      <ol>
        <li><strong>Posicionamento e Ângulo de Câmeras:</strong> Todas as câmeras perimetrais foram posicionadas voltadas estritamente para o interior do canteiro, almoxarifado e portarias, evitando captação intrusiva de imóveis vizinhos ou áreas íntimas (vestiários/banheiros).</li>
        <li><strong>Uso de Drones para Medição de Engenharia:</strong> Os voos de acompanhamento físico-financeiro limitam-se à projeção vertical da obra, sem captação identificável de transeuntes ou residências adjacentes.</li>
        <li><strong>Sinalização Obrigatória de Transparência:</strong> Foram afixadas placas visíveis nas portarias de acesso com o aviso: <em>"Ambiente monitorado por circuito fechado de TV para segurança patrimonial e do trabalho (NR-18 / LGPD). Controladora: AC Engenharia — DPO: ${escapeDocHtml(ctx.dpoEmail)}"</em>.</li>
      </ol>

      ${buildSignatureGridHTML([
        { role: "Engenheiro(a) Residente da Obra", name: "" },
        { role: "Gestor de T.I. & SecOps", name: ctx.secopsName },
        { role: "Homologação DPO / Privacidade", name: ctx.dpoName }
      ], false, "MOD-OBR-04")}
    `
  },
  {
    code: "MOD-OBR-05",
    module: "obras",
    docType: "Ata / Checklist",
    requiresSignature: true,
    title: "Ata de Desmobilização Geral de TI, Recolhimento de Ativos e Encerramento de Canteiro",
    normative: "ISO/IEC 27001 A.5.9, A.7.10, A.7.14 & A.8.10",
    evidenceCategory: "Canteiros de Obras",
    signersSummary: "Engenheiro Residente + Gestor de T.I. / SecOps + Patrimônio",
    summary: "Ata formal de encerramento tecnológico de canteiro: recolhimento de MikroTik, switches, notebooks, NVR, revogação do túnel VPN IPSec e baixa patrimonial no GLPI.",
    buildBody: (ctx, custom = {}) => `
      <h2>1. Identificação do Canteiro Desmobilizado</h2>
      <p>Aos ____ dias do mês de __________________ de 202___, na unidade <strong>${escapeDocHtml(custom.obra || ctx.activeUnit)}</strong> da <strong>${escapeDocHtml(ctx.company)}</strong>, reuniram-se os responsáveis abaixo assinados para atestar a desmobilização tecnológica segura e o recolhimento integral dos ativos de TI e telecomunicações.</p>

      <h2>2. Conferência de Recolhimento e Baixa de Ativos Críticos (GLPI)</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Categoria de Ativo</th>
            <th>Patrimônio / Hostname</th>
            <th>Ação de Segurança Executada</th>
            <th>Destino</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Roteador de Borda MikroTik</td><td>___________________</td><td>Certificado VPN IPSec revogado na Matriz</td><td>[ ] Estoque Matriz</td></tr>
          <tr><td>Switches Gerenciáveis &amp; APs Wi-Fi</td><td>___________________</td><td>Configurações de VLAN e 802.1X sanitizadas</td><td>[ ] Estoque Matriz</td></tr>
          <tr><td>Notebooks de Engenharia / Campo</td><td>___________________</td><td>BitLocker verificado + Backup de arquivos DWG/BIM</td><td>[ ] TI Sede</td></tr>
          <tr><td>NVR / Câmeras CFTV &amp; Catracas</td><td>___________________</td><td>Expurgo biométrico (MOD-OBR-02) e wipe de HD</td><td>[ ] Estoque Matriz</td></tr>
          <tr><td>Link de Fibra Óptica / Dedicado</td><td>Operadora: _________</td><td>Cancelamento formal e desligamento físico</td><td>[ ] Encerrado</td></tr>
        </tbody>
      </table>

      ${buildSignatureGridHTML([
        { role: "Engenheiro(a) Residente (Entrega do Canteiro)", name: "" },
        { role: "Gestor de T.I. & SecOps (Recebimento e Sanitização)", name: ctx.secopsName }
      ], false, "MOD-OBR-05")}
    `
  },

  // --------------------------------------------------------------------------
  // MÓDULO 03: USUÁRIOS & ACESSOS RBAC
  // --------------------------------------------------------------------------
  {
    code: "MOD-USR-01",
    module: "users",
    docType: "Termo para Assinatura",
    requiresSignature: true,
    title: "Termo de Responsabilidade, Confidencialidade (NDA) e Uso Aceitável de Ativos de TI",
    normative: "ISO/IEC 27001 A.6.2, A.5.9, A.8.1 & CLT Art. 482",
    evidenceCategory: "Conscientização & RH",
    signersSummary: "Colaborador Custodiante + Gestor Imediato + T.I.",
    summary: "Assinado na entrega de notebook/estação e criação de credenciais: sigilo sobre projetos BIM, orçamentos Sienge e clientes CV CRM, guarda de equipamento e vedação de USB.",
    buildBody: (ctx) => `
      <h2>1. Identificação do Usuário Custodiante e Equipamento Entregue</h2>
      <table class="data-table">
        <tr>
          <td width="55%"><strong>Colaborador(a):</strong> _________________________________________________</td>
          <td width="45%"><strong>CPF / Matrícula:</strong> ________________________</td>
        </tr>
        <tr>
          <td><strong>Cargo / Perfil RBAC:</strong> ____________________________________________</td>
          <td><strong>Unidade / Obra:</strong> ${escapeDocHtml(ctx.activeUnit)}</td>
        </tr>
        <tr>
          <td><strong>Ativo Entregue (Hostname / Patrimônio):</strong> _________________________</td>
          <td><strong>Nº de Série / Modelo:</strong> ___________________</td>
        </tr>
      </table>

      <h2>2. Compromissos de Segurança da Informação e Confidencialidade (NDA)</h2>
      <ol>
        <li><strong>Intransferibilidade de Credenciais:</strong> As senhas de rede, Google Workspace corporativo, Sienge ERP, CV CRM e VPN da <strong>${escapeDocHtml(ctx.company)}</strong> são pessoais e intransferíveis, com uso obrigatório de Múltiplo Fator de Autenticação (MFA).</li>
        <li><strong>Sigilo Profissional e Propriedade Intelectual:</strong> É estritamente vedado copiar, enviar para e-mail particular, armazenar em nuvem pessoal ou repassar a terceiros plantas arquitetônicas, modelos BIM (.rvt/.dwg), planilhas orçamentárias, tabelas de vendas ou dados pessoais de clientes e operários.</li>
        <li><strong>Segurança Física e Controles Técnicos:</strong> O usuário compromete-se a zelar pela guarda física do notebook em canteiros e deslocamentos, não desativar o agente EDR Wazuh ou a criptografia BitLocker, e respeitar o bloqueio de mídias USB removíveis.</li>
        <li><strong>Comunicação Imediata:</strong> Em caso de furto, roubo, perda do equipamento ou suspeita de phishing/incidente, o colaborador deverá acionar o setor de T.I./SecOps em <strong>até 2 (duas) horas</strong> para bloqueio remoto e contenção.</li>
        <li><strong>Devolução no Desligamento:</strong> Na rescisão contratual ou mudança de função, todos os equipamentos, crachás e documentos deverão ser restituídos imediatamente mediante baixa formal.</li>
      </ol>

      ${buildSignatureGridHTML([
        { role: "Colaborador(a) Declarante e Custodiante", name: "" },
        { role: "Gestor da Área / T.I. — AC Engenharia", name: ctx.secopsName }
      ], false, "MOD-USR-01")}
    `
  },
  {
    code: "MOD-USR-02",
    module: "users",
    docType: "Formulário / Checklist",
    requiresSignature: true,
    title: "Formulário de Concessão, Revisão Trimestral e Revogação de Acessos (RBAC & SoD)",
    normative: "ISO/IEC 27001 A.5.15, A.5.18, A.5.3 (Segregação de Funções)",
    evidenceCategory: "Infraestrutura & T.I.",
    signersSummary: "Gestor Solicitante + Recursos Humanos + SecOps",
    summary: "Comprova formalmente a concessão por menor privilégio, revisão periódica de contas privilegiadas ou bloqueio imediato em desligamentos no Sienge, CV CRM e AD.",
    buildBody: (ctx) => `
      <h2>1. Tipo de Movimentação de Identidade e Acesso</h2>
      <p>[ &nbsp; ] <strong>Admissão / Convite Google SSO</strong> &nbsp;&nbsp;&nbsp; [ &nbsp; ] <strong>Mudança de Cargo/Obra</strong> &nbsp;&nbsp;&nbsp; [ &nbsp; ] <strong>Revisão Trimestral RBAC</strong> &nbsp;&nbsp;&nbsp; [ &nbsp; ] <strong>Desligamento / Revogação Imediata</strong></p>

      <table class="data-table">
        <tr>
          <td width="50%"><strong>Nome do Usuário:</strong> __________________________________________</td>
          <td width="50%"><strong>E-mail Corporativo:</strong> ____________________________________</td>
        </tr>
        <tr>
          <td><strong>Perfil RBAC Aprovado:</strong> [ ] Gestor Obra [ ] SecOps [ ] DPO [ ] RH/SST [ ] Diretoria [ ] Auditoria</td>
          <td><strong>Unidade / Canteiro:</strong> ${escapeDocHtml(ctx.activeUnit)}</td>
        </tr>
      </table>

      <h2>2. Matriz de Sistemas Corporativos e Validação de Segregação de Funções (SoD)</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Sistema / Serviço</th>
            <th>Grupo de Permissão (Menor Privilégio)</th>
            <th>MFA Ativo?</th>
            <th>Ação Executada</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Active Directory / Windows</td><td>Usuário Padrão (Sem Admin Local)</td><td>[ ] Sim [ ] N/A</td><td>[ ] Liberado [ ] Revogado</td></tr>
          <tr><td>Sienge ERP (Engenharia/Obras)</td><td>Grupo: _____________________________</td><td>[ ] Sim</td><td>[ ] Liberado [ ] Revogado</td></tr>
          <tr><td>CV CRM (Estandes / Comercial)</td><td>Grupo: _____________________________</td><td>[ ] Sim</td><td>[ ] Liberado [ ] Revogado</td></tr>
          <tr><td>Google Workspace (@acengenhariase.com.br)</td><td>SSO Corporativo &amp; Drive Restrito</td><td>[ ] Sim</td><td>[ ] Liberado [ ] Revogado</td></tr>
          <tr><td>VPN IPSec Canteiros / Matriz</td><td>Acesso restrito à VLAN da função</td><td>[ ] Sim</td><td>[ ] Liberado [ ] Revogado</td></tr>
        </tbody>
      </table>

      <div class="callout">
        <strong>Verificação de Segregação de Funções (ISO 27001 A.5.3):</strong> Declaramos que o perfil concedido não acumula permissões conflitantes de execução e homologação/auditoria sobre o mesmo processo crítico na AC Engenharia.
      </div>

      ${buildSignatureGridHTML([
        { role: "Gestor Solicitante / Recursos Humanos", name: "" },
        { role: "Administrador de Acessos (T.I. / SecOps)", name: ctx.secopsName }
      ], false, "MOD-USR-02")}
    `
  },
  {
    code: "MOD-USR-03",
    module: "users",
    docType: "Termo / Checklist Offboarding",
    requiresSignature: true,
    title: "Termo de Desligamento (Offboarding), Devolução de Ativos e Revogação de Acessos",
    normative: "ISO/IEC 27001 A.6.5, A.5.18, A.5.11 & LGPD Art. 46",
    evidenceCategory: "Conscientização & RH",
    signersSummary: "Colaborador Desligado + Recursos Humanos + T.I./SecOps",
    summary: "Garante o bloqueio imediato de contas Google Workspace, Sienge, CV CRM, VPN e catracas faciais no ato do desligamento, além da devolução física de equipamentos e subsistência do sigilo NDA.",
    buildBody: (ctx) => `
      <h2>1. Dados do Desligamento / Encerramento Contratual</h2>
      <table class="data-table">
        <tr>
          <td width="55%"><strong>Nome do Profissional:</strong> _____________________________________________</td>
          <td width="45%"><strong>Data do Desligamento:</strong> ____/____/202___</td>
        </tr>
        <tr>
          <td><strong>Cargo / Departamento:</strong> _____________________________________________</td>
          <td><strong>Unidade / Obra:</strong> ${escapeDocHtml(ctx.activeUnit)}</td>
        </tr>
      </table>

      <h2>2. Checklist de Revogação Imediata de Credenciais e Devolução de Ativos (SLA &lt; 1 Hora)</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Item de Segurança (ISO 27001 A.5.11 / A.5.18 / A.6.5)</th>
            <th>Responsável</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Bloqueio da conta Google Workspace (@acengenhariase.com.br) e encerramento de sessões OAuth</td><td>T.I. / SecOps</td><td>[ ] Executado</td></tr>
          <tr><td>Revogação de credenciais no Sienge ERP, CV CRM, Active Directory e VPN IPSec</td><td>T.I. / SecOps</td><td>[ ] Executado</td></tr>
          <tr><td>Exclusão do template biométrico facial nas catracas dos canteiros e sede</td><td>RH / SST / TI</td><td>[ ] Executado</td></tr>
          <tr><td>Devolução física de Notebook, Carregador, Celular Corporativo, Crachá e Chaves</td><td>Patrimônio / TI</td><td>[ ] Recebido</td></tr>
        </tbody>
      </table>

      <h2>3. Declaração de Subsistência do Dever de Confidencialidade Pós-Desligamento</h2>
      <p>O profissional desligado declara ter restituído todos os equipamentos e documentos da <strong>${escapeDocHtml(ctx.company)}</strong> sob sua guarda, não retendo cópias de projetos BIM/DWG, orçamentos ou listas de clientes, permanecendo vigente o dever legal de sigilo profissional (ISO/IEC 27001 A.6.5).</p>

      ${buildSignatureGridHTML([
        { role: "Profissional Desligado (Entrega de Ativos e Ciência)", name: "" },
        { role: "Recursos Humanos — AC Engenharia", name: "" },
        { role: "T.I. & SecOps (Confirmação de Bloqueio Lógico)", name: ctx.secopsName }
      ], false, "MOD-USR-03")}
    `
  },
  {
    code: "MOD-USR-04",
    module: "users",
    docType: "Termo para Assinatura",
    requiresSignature: true,
    title: "Termo de Trabalho Remoto (Teletrabalho / Campo), VPN Obrigatória e Dispositivos Móveis",
    normative: "ISO/IEC 27001 A.6.7 (Trabalho Remoto), A.8.1 & CLT Art. 75-C",
    evidenceCategory: "Conscientização & RH",
    signersSummary: "Colaborador em Teletrabalho/Campo + Gestor Imediato + SecOps",
    summary: "Estabelece as regras de segurança cibernética para engenheiros em trânsito, trabalho remoto e acesso externo aos servidores BIM e Sienge ERP.",
    buildBody: (ctx) => `
      <h2>1. Qualificação do Regime Remoto / Mobilidade em Campo</h2>
      <p>Aplicável aos engenheiros residentes, coordenadores de obras, compradores e analistas da <strong>${escapeDocHtml(ctx.company)}</strong> autorizados a acessar recursos corporativos fora da Matriz.</p>

      <h2>2. Regras Mandatórias de Segurança em Trabalho Remoto (ISO 27001 A.6.7)</h2>
      <ol>
        <li><strong>Conexão Exclusiva via Túnel VPN Criptografado com MFA:</strong> Qualquer acesso externo ao servidor de projetos BIM ou rede interna deve ocorrer obrigatoriamente via VPN homologada pela TI com duplo fator de autenticação.</li>
        <li><strong>Proibição de Redes Wi-Fi Públicas Desprotegidas:</strong> É vedado acessar dados financeiros do Sienge ou contratos de clientes em redes abertas de aeroportos, hotéis ou cafeterias sem o túnel VPN ativo.</li>
        <li><strong>Proteção Visual e Guarda em Deslocamento:</strong> Notebooks não devem permanecer visíveis no interior de veículos estacionados e devem operar com bloqueio automático de tela em 5 minutos de inatividade.</li>
      </ol>

      ${buildSignatureGridHTML([
        { role: "Colaborador(a) Autorizado(a)", name: "" },
        { role: "Gestor de T.I. & SecOps — AC Engenharia", name: ctx.secopsName }
      ], false, "MOD-USR-04")}
    `
  },

  // --------------------------------------------------------------------------
  // MÓDULO 04: GOVERNANÇA, POLÍTICAS, RACI & CAMPANHAS
  // --------------------------------------------------------------------------
  {
    code: "MOD-GOV-01",
    module: "raci",
    docType: "Ata Oficial",
    requiresSignature: true,
    title: "Ata de Reunião e Análise Crítica do Comitê Gestor do SGSI e Privacidade",
    normative: "ISO/IEC 27001:2022 Cláusulas 5.1, 9.3 & LGPD Art. 50",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Diretoria C-Level + DPO + SecOps + Engenharia + RH",
    summary: "Ata executiva obrigatória para auditoria ISO 27001 (Cláusula 9.3): registra deliberações da Diretoria sobre riscos, SoA, incidentes, auditorias e recursos do SGSI.",
    buildBody: (ctx) => `
      <h2>1. Dados da Sessão Ordinária / Extraordinária do Comitê da AC Engenharia</h2>
      <table class="data-table">
        <tr>
          <td width="34%"><strong>Data:</strong> ____/____/202___</td>
          <td width="33%"><strong>Horário:</strong> ____h____ às ____h____</td>
          <td width="33%"><strong>Local:</strong> Sala de Reuniões Matriz / Videoconferência</td>
        </tr>
        <tr>
          <td colspan="3"><strong>Participantes Convocados:</strong> Diretoria Executiva da AC Engenharia, Encarregado(a) de Dados (DPO), Gestor de T.I. &amp; SecOps, Coordenação de Engenharia de Obras e Recursos Humanos / SST.</td>
        </tr>
      </table>

      <h2>2. Pauta Mandatória de Análise Crítica pela Direção (ISO 27001 Cl. 9.3)</h2>
      <ol>
        <li><strong>Status das Ações de Análises Críticas Anteriores e Plano Priorizado (24 Tarefas):</strong> Avaliação do percentual de conclusão das Fases 1 a 4 e cronograma de investimentos.</li>
        <li><strong>Desempenho da Segurança da Informação e Aderência ao SoA (93 Controles):</strong> Revisão dos indicadores de controles implementados, testes de backup Sienge e cobertura EDR/BitLocker nas obras.</li>
        <li><strong>Gestão de Riscos ISO 27005:</strong> Apresentação dos riscos críticos/altos residuais dos canteiros e deliberação sobre homologação executiva ou reforço de salvaguardas.</li>
        <li><strong>Conformidade LGPD, DSAR e Campanhas das 52 Semanas:</strong> Relato da DPO sobre solicitações de titulares, adesão aos treinamentos semanais e auditoria de DPAs com empreiteiras e imobiliárias.</li>
        <li><strong>Incidentes de Segurança, Não Conformidades e Melhoria Contínua:</strong> Análise de eventos relevantes registrados no SIEM Wazuh e oportunidades de melhoria.</li>
      </ol>

      <h2>3. Deliberações, Aprovações e Encaminhamentos</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th width="10%">Item</th>
            <th width="50%">Decisão / Ação Aprovada pelo Comitê</th>
            <th width="22%">Responsável (RACI)</th>
            <th width="18%">Prazo Limite</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>01</td><td style="height:28px;"></td><td></td><td>____/____/202___</td></tr>
          <tr><td>02</td><td style="height:28px;"></td><td></td><td>____/____/202___</td></tr>
          <tr><td>03</td><td style="height:28px;"></td><td></td><td>____/____/202___</td></tr>
          <tr><td>04</td><td style="height:28px;"></td><td></td><td>____/____/202___</td></tr>
        </tbody>
      </table>

      ${buildSignatureGridHTML([
        { role: "Presidente do Comitê / Diretoria Executiva", name: ctx.directorName },
        { role: "Encarregado(a) pelo Tratamento de Dados (DPO)", name: ctx.dpoName },
        { role: "Gestor de T.I. & Operações SecOps", name: ctx.secopsName },
        { role: "Representante de Engenharia de Obras / RH & SST", name: "" }
      ], false, "MOD-GOV-01")}
    `
  },
  {
    code: "MOD-GOV-02",
    module: "raci",
    docType: "Portaria / Ato Oficial",
    requiresSignature: true,
    title: "Portaria Diretiva de Nomeação Oficial do(a) Encarregado(a) de Dados (DPO)",
    normative: "LGPD Art. 41 & Resolução CD/ANPD nº 18/2024",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Diretor-Presidente + Encarregado(a) Nomeado(a)",
    summary: "Ato societário obrigatório exigido pela Resolução CD/ANPD nº 18/2024 designando formalmente o DPO, seu substituto, atribuições, autonomia e canal público.",
    buildBody: (ctx) => `
      <h2>Ato Normativo da Diretoria Executiva — Portaria DPO nº 001/2026</h2>
      <p>A Diretoria Executiva da <strong>${escapeDocHtml(ctx.company)}</strong>, inscrita no CNPJ sob o nº ${escapeDocHtml(ctx.cnpj)}, no uso de suas atribuições estatutárias e em estrito cumprimento ao <strong>Art. 41 da Lei nº 13.709/2018 (LGPD)</strong> e à <strong>Resolução CD/ANPD nº 18, de 16 de julho de 2024</strong>, RESOLVE:</p>

      <h2>Art. 1º — Designação Formal e Canal Público de Atendimento</h2>
      <p>Nomear para o exercício da função de <strong>Encarregado(a) pelo Tratamento de Dados Pessoais (Data Protection Officer — DPO)</strong> da AC Engenharia:</p>
      <table class="data-table">
        <tr>
          <td width="50%"><strong>Encarregado(a) Titular:</strong> ${escapeDocHtml(ctx.dpoName || "[ Nome Completo do(a) Encarregado(a) DPO ]")}</td>
          <td width="50%"><strong>Canal Público Oficial:</strong> ${escapeDocHtml(ctx.dpoEmail)}</td>
        </tr>
        <tr>
          <td><strong>Encarregado(a) Substituto(a) (Ausências/Férias):</strong> ___________________________</td>
          <td><strong>Divulgação Institucional:</strong> Portal Web &amp; Recepção Matriz/Estandes</td>
        </tr>
      </table>

      <h2>Art. 2º — Atribuições Legais e Autonomia Funcional</h2>
      <ol>
        <li>Aceitar reclamações e comunicações dos titulares de dados (clientes adquirentes, leads, colaboradores próprios e operários terceirizados), prestar esclarecimentos e adotar providências no prazo legal (Art. 41, § 2º, I);</li>
        <li>Receber comunicações da Autoridade Nacional de Proteção de Dados (ANPD) e adotar providências, inclusive conduzindo eventuais notificações de incidentes no prazo de 3 dias úteis;</li>
        <li>Orientar os colaboradores, engenheiros residentes, corretores parceiros e empreiteiras contratadas a respeito das práticas a serem tomadas em relação à proteção de dados pessoais;</li>
        <li>Fica assegurada ao(à) Encarregado(a) plena <strong>autonomia técnica</strong>, acesso direto à Alta Direção, recursos operacionais adequados e ausência de conflito de interesses, conforme Res. CD/ANPD nº 18/2024.</li>
      </ol>

      <p>Esta Portaria entra em vigor na data de sua assinatura, revogando-se disposições em contrário.</p>

      ${buildSignatureGridHTML([
        { role: "Diretor-Presidente / Representante Legal — AC Engenharia", name: ctx.directorName },
        { role: "Ciência e Aceite do(a) Encarregado(a) Nomeado(a) — DPO", name: ctx.dpoName }
      ], false, "MOD-GOV-02")}
    `
  },
  {
    code: "MOD-GOV-03",
    module: "raci",
    docType: "Termo para Assinatura",
    requiresSignature: true,
    title: "Termo Individual de Ciência e Adesão à Política de Segurança da Informação (PSI)",
    normative: "ISO/IEC 27001 Cl. 5.2, A.5.1, A.6.2 & LGPD Art. 50",
    evidenceCategory: "Conscientização & RH",
    signersSummary: "Colaborador / Prestador + Recursos Humanos",
    summary: "Comprovante individual auditável de leitura, compreensão e compromisso integral com a Política de Segurança da Informação e Privacidade (PSI-001).",
    buildBody: (ctx, custom = {}) => `
      <h2>1. Declaração Formal de Recebimento e Adesão Normativa</h2>
      <p>Eu, <strong>${escapeDocHtml(custom.signerName || "__________________________________________________________________")}</strong>, portador(a) do CPF nº <strong>${escapeDocHtml(custom.signerDoc || "_________________________")}</strong>, exercente da função de <strong>${escapeDocHtml(custom.signerRole || "_________________________________________")}</strong>, lotado(a) na unidade <strong>${escapeDocHtml(ctx.activeUnit)}</strong> da <strong>${escapeDocHtml(ctx.company)}</strong>, DECLARO para todos os fins de auditoria interna e externa que:</p>

      <ol>
        <li>Recebi cópia integral, li, compreendi e concordo em cumprir fielmente todas as diretrizes estabelecidas na <strong>${escapeDocHtml(custom.policyTitle || "Política Geral de Segurança da Informação e Privacidade (PSI-001 — Versão Vigente)")}</strong> da <strong>${escapeDocHtml(ctx.company)}</strong>;</li>
        <li>Tenho plena ciência das regras sobre classificação da informação, mesa limpa em canteiros e estandes, bloqueio de estação ao ausentar-se (Win+L), uso exclusivo de softwares homologados, proibição de compartilhamento não autorizado de dados pessoais (LGPD) e reporte imediato de incidentes;</li>
        <li>Reconheço que os recursos computacionais e de rede disponibilizados pela AC Engenharia destinam-se exclusivamente às atividades profissionais, sendo passíveis de monitoramento e auditoria de logs (ISO/IEC 27001 A.8.15 e A.8.16), inexistindo expectativa de privacidade pessoal no uso de sistemas corporativos;</li>
        <li>Estou ciente de que o descumprimento das normas de segurança e proteção de dados sujeita o infrator às medidas disciplinares trabalhistas cabíveis (Art. 482 da CLT) e responsabilização civil/contratual aplicável.</li>
      </ol>

      ${buildSignatureGridHTML([
        { role: "Colaborador(a) / Profissional Declarante", name: custom.signerName || "" },
        { role: "Conferência e Arquivamento — RH / Governança SGSI", name: ctx.dpoName }
      ], false, "MOD-GOV-03")}
    `
  },
  {
    code: "MOD-GOV-04",
    module: "raci",
    docType: "Ata & Lista de Presença",
    requiresSignature: true,
    title: "Ata e Lista de Presença de Treinamento / DDS de Segurança da Informação e LGPD",
    normative: "ISO/IEC 27001 A.6.3 & LGPD Art. 50, § 2º, I",
    evidenceCategory: "Conscientização & RH",
    signersSummary: "Participantes (12 linhas) + Instrutor/DPO + Técnico SST",
    summary: "Formulário pronto para colher assinaturas presenciais em treinamentos corporativos, estandes de vendas e Diálogos Diários de Segurança (DDS) nos canteiros.",
    buildBody: (ctx) => `
      <h2>1. Dados da Capacitação / Campanha de Conscientização — AC Engenharia</h2>
      <table class="data-table">
        <tr>
          <td width="55%"><strong>Tema / Semana da Campanha ANPD:</strong> _____________________________________</td>
          <td width="45%"><strong>Data / Carga Horária:</strong> ____/____/202___ (____h)</td>
        </tr>
        <tr>
          <td><strong>Unidade / Canteiro / Estande:</strong> ${escapeDocHtml(ctx.activeUnit)}</td>
          <td><strong>Instrutor(a) Responsável:</strong> ___________________________</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Conteúdo Ministrado:</strong> Prevenção a phishing e golpe do boleto falso, proteção de dados de clientes e operários (LGPD), guarda de crachás/notebooks, conduta em estandes e acionamento do canal de incidentes.</td>
        </tr>
      </table>

      <h2>2. Lista Nominal de Presença e Assinatura dos Participantes</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th width="6%">Nº</th>
            <th width="36%">Nome Completo Legível</th>
            <th width="18%">CPF ou Matrícula</th>
            <th width="20%">Setor / Empreiteira</th>
            <th width="20%">Assinatura</th>
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: 12 }, (_, i) => `
            <tr>
              <td style="text-align:center;">${String(i + 1).padStart(2, "0")}</td>
              <td style="height:22px;"></td>
              <td></td>
              <td></td>
              <td></td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      ${buildSignatureGridHTML([
        { role: "Instrutor(a) / Multiplicador SGSI & LGPD", name: ctx.dpoName },
        { role: "Coordenador(a) RH / Técnico de SST (NR-18)", name: "" }
      ], false, "MOD-GOV-04")}
    `
  },
  {
    code: "MOD-GOV-05",
    module: "raci",
    docType: "Política Oficial (PSI-001)",
    requiresSignature: true,
    title: "Política Geral de Segurança da Informação e Privacidade da AC Engenharia (PSI-001)",
    normative: "ABNT NBR ISO/IEC 27001:2022 Cláusula 5.2, A.5.1 & Lei nº 13.709/2018 (LGPD)",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Diretor Executivo C-Level + Encarregado(a) DPO + Gestor SecOps",
    summary: "Norma corporativa mestra (PSI-001) que institui os princípios, diretrizes de controle de acesso, criptografia, proteção de projetos BIM, privacidade LGPD e penalidades.",
    buildBody: (ctx) => `
      <h2>1. Objetivo e Escopo Corporativo (ISO/IEC 27001 Cl. 5.2)</h2>
      <p>A presente <strong>Política Geral de Segurança da Informação e Privacidade (PSI-001)</strong> estabelece as diretrizes estratégicas e mandatórias da <strong>${escapeDocHtml(ctx.company)}</strong> para proteger a confidencialidade, integridade, disponibilidade e privacidade dos ativos de informação no Escritório Central (Matriz), estandes comerciais e em todos os canteiros de obras sob sua gestão.</p>

      <h2>2. Diretrizes Normativas Obrigatórias</h2>
      <ol>
        <li><strong>Classificação e Propriedade da Informação (A.5.12):</strong> Todos os projetos executivos BIM (.rvt/.dwg), orçamentos do ERP Sienge, dossiês financeiros de adquirentes e prontuários de colaboradores são ativos críticos de propriedade ou custódia restrita da AC Engenharia.</li>
        <li><strong>Controle de Acesso e Autenticação Forte (A.5.15 / A.8.5):</strong> O acesso ao SGSI é realizado exclusivamente via conta institucional Google Workspace autorizada mediante convite prévio, com Múltiplo Fator de Autenticação (MFA) e segregação de funções (RBAC).</li>
        <li><strong>Segurança de Endpoints e Canteiros (A.8.1 / A.8.7):</strong> Todo computador corporativo deve operar sem privilégio de Administrador Local, com criptografia de disco BitLocker ativa, bloqueio de portas USB para mídias não homologadas e agente EDR Wazuh em execução.</li>
        <li><strong>Backup Imutável e Continuidade (A.8.13):</strong> As bases críticas possuem rotinas diárias de backup criptografado com imutabilidade lógica (Object Lock WORM) e testes periódicos de restauração documentados em laudo.</li>
        <li><strong>Privacidade e Proteção de Dados Pessoais (LGPD):</strong> É estritamente proibido o compartilhamento lateral de leads imobiliários com parceiros externos sem consentimento específico (Prevenção Cyrela) e obrigatória a eliminação dos templates biométricos faciais das catracas após o Habite-se da obra.</li>
        <li><strong>Gestão de Incidentes (A.5.24 / Res. ANPD 15/2024):</strong> Qualquer suspeita de incidente cibernético ou violação de dados deve ser comunicada imediatamente ao CSIRT e ao DPO (${escapeDocHtml(ctx.dpoEmail)}), observando-se o prazo legal de 3 dias úteis perante a ANPD quando aplicável.</li>
      </ol>

      <h2>3. Vigência e Revisão Anual</h2>
      <p>Esta Política entra em vigor na data de sua homologação pela Diretoria Executiva e será revisada anualmente ou mediante alterações relevantes de arquitetura ou legislação.</p>

      ${buildSignatureGridHTML([
        { role: "Aprovação Executiva — Diretoria C-Level", name: ctx.directorName },
        { role: "Conformidade Legal & LGPD — Encarregado(a) DPO", name: ctx.dpoName },
        { role: "Arquitetura & Segurança Cibernética — SecOps", name: ctx.secopsName }
      ], false, "MOD-GOV-05")}
    `
  },
  {
    code: "MOD-GOV-06",
    module: "raci",
    docType: "Ata & Matriz RACI",
    requiresSignature: true,
    title: "Matriz RACI de Resposta a Incidentes de Dados Pessoais (LGPD / ANPD)",
    normative: "ISO/IEC 27001:2022 Cláusula 5.3, A.5.24 a A.5.28, LGPD Art. 50 & Resolução CD/ANPD nº 15/2024",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Diretor Responsável + DPO Provisório + Responsável TI + Jurídico",
    summary: "Documento oficial para definição e designação de responsáveis por etapa de incidente de dados pessoais (Res. CD/ANPD nº 15/2024), contendo os 11 passos de contenção, quadro de designação nominal com titulares e suplentes, e termo de aprovação executiva.",
    buildBody: (ctx, custom = {}) => `
      <h2>1. Objetivo</h2>
      <p>Definir formalmente quem executa (<strong>R</strong>), quem responde e aprova (<strong>A</strong>), quem é consultado (<strong>C</strong>) e quem é informado (<strong>I</strong>) em cada etapa de um incidente de segurança com dados pessoais na <strong>${escapeDocHtml(ctx.company)}</strong>. Este documento serve para a Diretoria homologar os papéis e formalizar as designações nominais antes da ocorrência de qualquer incidente.</p>

      <h2>2. Por que a Matriz RACI de Incidentes é Necessária</h2>
      <p>Em uma fiscalização, a ANPD avalia não só o vazamento em si, mas como a empresa se organizou para responder. Se ninguém sabe quem desliga o servidor, quem consulta o jurídico ou quem avisa os titulares, a demora vira negligência. A matriz RACI é a prova documental de boa-fé e de responsabilização (<em>accountability</em>): demonstra que, no minuto seguinte ao incidente, a empresa já sabia quem contém o dano técnico, quem avalia o risco legal e quem comunica as pessoas afetadas.</p>
      
      <p>Os três cenários abaixo resumem como a ANPD tende a enxergar a construtora em um mesmo incidente:</p>
      <table class="data-table">
        <thead>
          <tr>
            <th width="25%">Cenário</th>
            <th width="40%">O que acontece na empresa</th>
            <th width="35%">Leitura provável da ANPD</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Sem RACI e sem DPO</strong></td>
            <td>TI resolve sozinha; diretoria descobre tarde; ANPD toma conhecimento por terceiros.</td>
            <td><span class="badge" style="background:#fee2e2; color:#991b1b;">Omissão e Falta de Governança</span><br/>Multas mais graves, com responsabilização direta dos diretores.</td>
          </tr>
          <tr>
            <td><strong>Com RACI e DPO provisório</strong></td>
            <td>Equipe age rápido e a notificação sai no prazo, mas o DPO acumula funções internas.</td>
            <td><span class="badge" style="background:#fef3c7; color:#92400e;">Boa-fé Reconhecida</span><br/>Tende a advertência ou multa leve, com exigência de TAC para capacitação contínua.</td>
          </tr>
          <tr>
            <td><strong>Com RACI e DPO capacitado</strong></td>
            <td>Incidente contido pelo RACI; DPO conduz o diálogo com a ANPD e apresenta o RIPD.</td>
            <td><span class="badge" style="background:#dcfce7; color:#166534;">Maturidade Comprovada</span><br/>Em muitos casos, arquivamento com recomendações de melhoria.</td>
          </tr>
        </tbody>
      </table>

      <div class="callout" style="border-left: 4px solid #b45309; background: #fffbeb;">
        <strong>Ponto de Atenção Regulatório (Resolução CD/ANPD nº 15/2024):</strong> Fixa o prazo estrito de <strong>3 dias úteis</strong>, a partir do conhecimento de que o incidente afetou dados pessoais, para comunicar a ANPD e os titulares quando houver risco ou dano relevante. Também exige registrar todos os incidentes (comunicados ou não) por no mínimo <strong>5 anos</strong>.
      </div>

      <h2>3. Como Ler a Matriz</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th width="15%">Letra</th>
            <th width="25%">Significado</th>
            <th width="60%">Regra de Uso</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong style="color:#004b93; font-size:12pt;">R</strong></td><td><strong>Responsible (Executor)</strong></td><td>Executa a atividade técnica ou operacional. Pode haver mais de um R por atividade.</td></tr>
          <tr><td><strong style="color:#7c3aed; font-size:12pt;">A</strong></td><td><strong>Accountable (Aprovador / Responde)</strong></td><td>Responde pelo resultado final e aprova. <strong>Deve haver exatamente um A por atividade.</strong></td></tr>
          <tr><td><strong style="color:#059669; font-size:12pt;">C</strong></td><td><strong>Consulted (Consultado)</strong></td><td>Deve ser consultado antes da decisão ou da entrega (comunicação bilateral nos dois sentidos).</td></tr>
          <tr><td><strong style="color:#d97706; font-size:12pt;">I</strong></td><td><strong>Informed (Informado)</strong></td><td>Deve ser informado após a decisão ou entrega (comunicação unilateral em um sentido).</td></tr>
        </tbody>
      </table>
      <p class="muted"><strong>Regras práticas:</strong> Cada etapa tem um único <strong>A</strong>; Nenhuma pessoa pode ser <strong>A</strong> de uma etapa que ela mesma audita (SoD ISO 27001 A.5.3); e todo titular precisa de um suplente designado para férias, viagens e turnos de obra.</p>

      <h2>4. Papéis da Estrutura de Resposta a Incidentes</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th width="25%">Papel</th>
            <th width="35%">Perfil Sugerido na AC Engenharia</th>
            <th width="40%">Responsabilidade Principal</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Diretoria</strong></td>
            <td>Sócio ou diretor com poder de decisão e de assinatura corporativa.</td>
            <td>Decide sobre comunicação externa, libera recursos e assume a responsabilidade final. Precisa estar acessível em até poucas horas.</td>
          </tr>
          <tr>
            <td><strong>DPO provisório (Encarregado)</strong></td>
            <td>Colaborador de RH ou Administrativo, com perfil organizado e acesso direto à Diretoria. <strong>Não deve ser da T.I.</strong></td>
            <td>Coordena o incidente, avalia o risco aos titulares, mantém o registro regulatório e é o canal oficial com a ANPD e com os titulares.</td>
          </tr>
          <tr>
            <td><strong>TI / Segurança da Informação</strong></td>
            <td>Equipe de T.I. (infraestrutura, endpoints, servidores e contas).</td>
            <td>Detecta, contém e erradica o incidente técnico, preserva evidências digitais e restaura os serviços do Sienge e rede.</td>
          </tr>
          <tr>
            <td><strong>Jurídico</strong></td>
            <td>Advogado interno ou escritório jurídico externo de confiança.</td>
            <td>Avalia obrigações legais, revisa comunicações à ANPD e apoia a análise de contratos com empreiteiras, operadoras e clientes.</td>
          </tr>
          <tr>
            <td><strong>RH / Gestão de Pessoas</strong></td>
            <td>Responsável pela Gestão de Pessoas e SST.</td>
            <td>Trata incidentes com dados de colaboradores (folha, ASO) e apoia a comunicação aos titulares internos.</td>
          </tr>
          <tr>
            <td><strong>Comunicação / Comercial</strong></td>
            <td>Responsável por relacionamento com clientes, parceiros e estandes.</td>
            <td>Executa a comunicação externa aprovada pela Diretoria, garantindo mensagem única, alinhada e consistente aos compradores.</td>
          </tr>
          <tr>
            <td><strong>Gestor da área afetada</strong></td>
            <td>Gerente ou coordenador do setor ou da obra envolvida (ex: canteiros, suprimentos, financeiro).</td>
            <td>Reporta o incidente imediatamente e fornece contexto operacional sobre os dados e processos afetados.</td>
          </tr>
        </tbody>
      </table>

      <div class="callout" style="page-break-inside: avoid !important; break-inside: avoid !important;">
        <strong>Critérios Obrigatórios para Escolha do DPO Provisório:</strong>
        <ul style="margin: 4px 0 0 16px; padding: 0;">
          <li><strong>Não pertencer à T.I.:</strong> Para evitar conflito de interesses direto — quem implementa a segurança técnica não deve auditá-la (SoD ISO 27001 A.5.3).</li>
          <li><strong>Acesso Direto à Diretoria:</strong> Autonomia funcional para acionar imediatamente a T.I., o RH, o Comercial e o Jurídico.</li>
          <li><strong>Disponibilidade para o Prazo de 3 Dias Úteis:</strong> Conhecimento básico da LGPD para interlocução com a ANPD.</li>
          <li><strong>Formalização por Ato Escrito:</strong> Designação formal assinada, com o canal de contato divulgado no portal institucional.</li>
        </ul>
      </div>

      <h2>5. Matriz RACI por Etapa do Incidente de Dados Pessoais (11 Etapas)</h2>
      <p class="muted">Proposta oficial homologada para a AC Engenharia. Cada etapa possui exatamente <strong>um único A</strong>.</p>
      <table class="data-table" style="text-align: center;">
        <thead>
          <tr>
            <th style="text-align: left;" width="34%">Etapa do Incidente</th>
            <th width="9%">Diretoria</th>
            <th width="9%">DPO prov.</th>
            <th width="9%">T.I.</th>
            <th width="9%">Jurídico</th>
            <th width="9%">RH</th>
            <th width="11%">Comunicação / Comercial</th>
            <th width="10%">Gestor da Área</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="text-align: left;">1. Detectar e reportar o incidente</td>
            <td>I</td>
            <td>I</td>
            <td><strong>A / R</strong></td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td><strong>R</strong></td>
          </tr>
          <tr>
            <td style="text-align: left;">2. Registrar e acionar o comitê de crise</td>
            <td>I</td>
            <td><strong>A / R</strong></td>
            <td>C</td>
            <td>I</td>
            <td>I</td>
            <td>-</td>
            <td>I</td>
          </tr>
          <tr>
            <td style="text-align: left;">3. Conter o dano técnico (isolar, revogar acessos)</td>
            <td>I</td>
            <td>I</td>
            <td><strong>A / R</strong></td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>C</td>
          </tr>
          <tr>
            <td style="text-align: left;">4. Preservar evidências e analisar a causa</td>
            <td>I</td>
            <td><strong>A</strong></td>
            <td><strong>R</strong></td>
            <td>C</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
          </tr>
          <tr>
            <td style="text-align: left;">5. Avaliar risco e dano aos titulares</td>
            <td>I</td>
            <td><strong>A / R</strong></td>
            <td>C</td>
            <td>C</td>
            <td>C</td>
            <td>-</td>
            <td>C</td>
          </tr>
          <tr>
            <td style="text-align: left;">6. Decidir sobre comunicação (ANPD e titulares)</td>
            <td><strong>A</strong></td>
            <td><strong>R</strong></td>
            <td>C</td>
            <td><strong>R</strong></td>
            <td>-</td>
            <td>I</td>
            <td>-</td>
          </tr>
          <tr>
            <td style="text-align: left;">7. Comunicar a ANPD (prazo de 3 dias úteis)</td>
            <td><strong>A</strong></td>
            <td><strong>R</strong></td>
            <td>C</td>
            <td>C</td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
          </tr>
          <tr>
            <td style="text-align: left;">8. Comunicar os titulares afetados</td>
            <td>I</td>
            <td><strong>A</strong></td>
            <td>C</td>
            <td>C</td>
            <td><strong>R</strong></td>
            <td><strong>R</strong></td>
            <td>-</td>
          </tr>
          <tr>
            <td style="text-align: left;">9. Comunicar clientes, parceiros e imprensa</td>
            <td><strong>A</strong></td>
            <td>C</td>
            <td>I</td>
            <td>C</td>
            <td>-</td>
            <td><strong>R</strong></td>
            <td>-</td>
          </tr>
          <tr>
            <td style="text-align: left;">10. Remediar e restaurar os serviços</td>
            <td>I</td>
            <td>C</td>
            <td><strong>A / R</strong></td>
            <td>-</td>
            <td>-</td>
            <td>-</td>
            <td>C</td>
          </tr>
          <tr>
            <td style="text-align: left;">11. Relatório pós-incidente, RIPD e lições aprendidas</td>
            <td>I</td>
            <td><strong>A / R</strong></td>
            <td><strong>R</strong></td>
            <td>C</td>
            <td>C</td>
            <td>I</td>
            <td>C</td>
          </tr>
        </tbody>
      </table>

      <h2>6. Quadro Oficial de Designação de Responsáveis</h2>
      <p class="muted">Contatos de plantão e equipe de pronta resposta 24h designada para a AC Engenharia:</p>
      <table class="data-table">
        <thead>
          <tr>
            <th width="20%">Papel</th>
            <th width="26%">Titular (Nome e Cargo)</th>
            <th width="24%">Suplente (Nome e Cargo)</th>
            <th width="20%">Contato 24h</th>
            <th width="10%">Ciente</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Diretoria Executiva</strong></td>
            <td><strong>${escapeDocHtml(ctx.directorName || "[ Preencher Nome do Diretor / C-Level ]")}</strong></td>
            <td>Gerência Geral de Operações / Suplência</td>
            <td>diretoria@acengenhariase.com.br</td>
            <td>[ ✓ ] Sim</td>
          </tr>
          <tr>
            <td><strong>DPO (Encarregado de Dados)</strong></td>
            <td><strong>${escapeDocHtml(ctx.dpoName || "[ Preencher Nome do(a) DPO Titular ]")}</strong></td>
            <td>[ Preencher Nome do(a) Suplente DPO ]</td>
            <td>${escapeDocHtml(ctx.dpoEmail || "dpo@acengenhariase.com.br")}</td>
            <td>[ ✓ ] Sim</td>
          </tr>
          <tr>
            <td><strong>TI / Segurança da Informação</strong></td>
            <td><strong>${escapeDocHtml(ctx.secopsName || "[ Preencher Nome do Gestor de T.I. & SecOps ]")}</strong></td>
            <td>Equipe de Suporte &amp; Infraestrutura T.I.</td>
            <td>ti@acengenhariase.com.br</td>
            <td>[ ✓ ] Sim</td>
          </tr>
          <tr>
            <td><strong>Jurídico / Compliance</strong></td>
            <td><strong>[ Preencher Nome do Assessor Jurídico / OAB ]</strong></td>
            <td>Assessoria Jurídica Externa Homologada</td>
            <td>juridico@acengenhariase.com.br</td>
            <td>[ ✓ ] Sim</td>
          </tr>
          <tr>
            <td><strong>RH / Gestão de Pessoas &amp; SST</strong></td>
            <td><strong>[ Preencher Nome do(a) Gestor(a) de RH ]</strong></td>
            <td>Coordenação de Recursos Humanos &amp; Folha</td>
            <td>rh@acengenhariase.com.br</td>
            <td>[ ✓ ] Sim</td>
          </tr>
          <tr>
            <td><strong>Comunicação / Comercial</strong></td>
            <td><strong>[ Preencher Nome do(a) Gestor(a) Comercial ]</strong></td>
            <td>Equipe Comercial / Atendimento a Clientes</td>
            <td>comercial@acengenhariase.com.br</td>
            <td>[ ✓ ] Sim</td>
          </tr>
          <tr>
            <td><strong>Gestor da Área Afetada</strong></td>
            <td>${escapeDocHtml(ctx.obraManagerName || "[ Engenheiro Residente da Obra / Gestor do Setor ]")}</td>
            <td>Engenheiro de Campo / Coordenador da Área</td>
            <td>Plantão do Canteiro / Área Afetada</td>
            <td>[ ✓ ] Sim</td>
          </tr>
        </tbody>
      </table>

      <h2>7. Próximos Passos de Governança</h2>
      <ul style="margin: 0 0 0 16px; padding: 0; line-height: 1.6; font-size: 9.5pt; color: #475569;">
        <li><strong>Formalização:</strong> Formalizar a designação do DPO provisório e do comitê de crise, com ata ou termo assinado no sistema.</li>
        <li><strong>Treinamento:</strong> Treinar os titulares e suplentes e manter distribuída a lista oficial de contatos 24h.</li>
        <li><strong>Simulação de Mesa:</strong> Realizar uma simulação anual (exercício de mesa / <em>tabletop exercise</em>) de incidente de dados pessoais para testar a matriz e validar os tempos de reação.</li>
        <li><strong>Revisão Periódica:</strong> Revisar este documento anualmente e a cada alteração relevante na estrutura de pessoal da AC Engenharia.</li>
        <li><strong>Transição do DPO:</strong> Apresentar à Diretoria proposta de capacitação avançada do DPO interno ou contratação de DPO as a Service (terceirizado) para atender a exigências de auditoria e licitações.</li>
      </ul>

      <div class="approval-wrapper" style="page-break-inside: avoid !important; break-inside: avoid !important; margin-top: 24px;">
        <h2>8. Aprovação e Termo de Compromisso</h2>
        <p>Declaramos ciência e mútua concordância com as atribuições, alçadas e responsabilidades conferidas nesta Matriz RACI, comprometendo-nos a cumprir estritamente os prazos e fluxos aqui estabelecidos em conformidade com a ISO/IEC 27001 e a Resolução CD/ANPD nº 15/2024.</p>

        ${buildSignatureGridHTML([
          { role: "Diretor Responsável (Accountable C-Level)", name: custom.directorName || ctx.directorName || "" },
          { role: "DPO Provisório Designado", name: custom.dpoName || ctx.dpoName || "" },
          { role: "Responsável pela T.I. & Segurança", name: custom.secopsName || ctx.secopsName || "" },
          { role: "Assessoria Jurídica", name: custom.legalName || "" }
        ], false, "MOD-GOV-06")}
      </div>
    `
  },
  {
    code: "MOD-GOV-07",
    module: "raci",
    docType: "Política / Norma (PCA-002)",
    requiresSignature: true,
    title: "Política e Norma de Controle de Acesso Lógico, Físico, Senhas e MFA (PCA-002)",
    normative: "ISO/IEC 27001:2022 A.5.15, A.5.16, A.5.17, A.5.18 & A.8.5",
    evidenceCategory: "Infraestrutura & T.I.",
    signersSummary: "Gestor de T.I. & SecOps + Encarregado(a) DPO + Diretoria",
    summary: "Regulamenta a autenticação SSO com Google Workspace por convite, obrigatoriedade de MFA, complexidade de senhas, revisão trimestral RBAC e acesso físico aos canteiros.",
    buildBody: (ctx) => `
      <h2>1. Regras de Controle de Acesso Lógico e Identidade Digital</h2>
      <ol>
        <li><strong>Acesso Exclusivo por Convite Nominal e SSO Corporativo:</strong> O ingresso na plataforma SGSI da <strong>${escapeDocHtml(ctx.company)}</strong> é restrito a colaboradores previamente convidados pelo Administrador Geral e autenticados via conta institucional Google Workspace (<code>@acengenhariase.com.br</code>).</li>
        <li><strong>Princípio do Menor Privilégio e RBAC:</strong> Os acessos ao ERP Sienge, CV CRM e pastas de rede de engenharia são concedidos estritamente conforme a matriz de cargos (Engenheiro Residente, SecOps, DPO, RH/SST, Diretoria e Auditoria).</li>
        <li><strong>Múltiplo Fator de Autenticação (MFA):</strong> É obrigatório o uso de MFA em 100% das contas de e-mail, conexões VPN de canteiros e sistemas em nuvem.</li>
        <li><strong>Revisão Trimestral e Bloqueio Automático:</strong> As credenciais passam por auditoria a cada 90 dias, sendo bloqueadas imediatamente em caso de desligamento ou encerramento de contrato.</li>
      </ol>

      ${buildSignatureGridHTML([
        { role: "Gestor de T.I. & SecOps — AC Engenharia", name: ctx.secopsName },
        { role: "Encarregado(a) de Dados (DPO)", name: ctx.dpoName },
        { role: "Aprovação Diretoria Executiva", name: ctx.directorName }
      ], false, "MOD-GOV-07")}
    `
  },
  {
    code: "MOD-GOV-08",
    module: "raci",
    docType: "Diretriz & Termo (PSST-005)",
    requiresSignature: true,
    title: "Diretriz e Termo de Sigilo de Dados Médicos Ocupacionais, PCMSO e ASOs (PSST-005)",
    normative: "NR-07 (PCMSO), NR-18, LGPD Art. 11, II, 'a' & Resolução CFM nº 2.323/2022",
    evidenceCategory: "Conscientização & RH",
    signersSummary: "Profissional de RH / Técnico SST + Médico Coordenador PCMSO + DPO",
    summary: "Estabelece o sigilo absoluto sobre exames clínicos, CID e prontuários médicos de operários, restringindo a visualização de engenheiros residentes apenas ao status Apto/Inapto.",
    buildBody: (ctx) => `
      <h2>1. Proteção de Dados Pessoais Sensíveis de Saúde no Trabalho (Art. 11 LGPD)</h2>
      <p>Em cumprimento à diretriz corporativa <strong>PSST-005</strong> da <strong>${escapeDocHtml(ctx.company)}</strong>, fica estabelecido o protocolo rigoroso de guarda e confidencialidade sobre Atestados de Saúde Ocupacional (ASOs), exames complementares (NR-35 trabalho em altura / NR-33 espaço confinado) e prontuários clínicos:</p>
      <ol>
        <li><strong>Segregação Estrita de Acesso (RBAC):</strong> Gestores de obra, mestres e engenheiros residentes têm acesso <strong>exclusivamente</strong> ao resultado administrativo de aptidão funcional (<em>Apto / Inapto para a função</em>), sendo terminantemente vedado o compartilhamento de diagnósticos clínicos, resultados laboratoriais ou códigos CID.</li>
        <li><strong>Guarda e Temporalidade Legal (NR-07):</strong> Os prontuários médicos são mantidos sob responsabilidade médica e arquivados de forma criptografada pelo prazo legal mínimo de <strong>20 (vinte) anos</strong> após o desligamento do trabalhador (Art. 16, I da LGPD c/c NR-07).</li>
        <li><strong>Compromisso de Sigilo Funcional:</strong> Os profissionais de Recursos Humanos, Segurança do Trabalho (SST) e clínica ocupacional abaixo assinados assumem o dever incondicional de sigilo profissional sobre todas as informações médicas manuseadas.</li>
      </ol>

      ${buildSignatureGridHTML([
        { role: "Responsável RH / Segurança do Trabalho (SST — NR-18)", name: "" },
        { role: "Médico(a) do Trabalho / Clínica Ocupacional Credenciada", name: "", docLabel: "CRM / RQE: ____________________________________" },
        { role: "Encarregado(a) pelo Tratamento de Dados (DPO)", name: ctx.dpoName }
      ], false, "MOD-GOV-08")}
    `
  },
  {
    code: "MOD-GOV-09",
    module: "raci",
    docType: "Política & Diretriz (PML-006)",
    requiresSignature: true,
    title: "Política e Diretriz de Mesa Limpa e Tela Limpa (PML-006) — Matriz e Estandes",
    normative: "ISO/IEC 27001:2022 Controle A.7.7 (Mesa Limpa e Tela Limpa) & LGPD Art. 46",
    evidenceCategory: "Governança & Políticas",
    signersSummary: "DPO Encarregada + Gestor de T.I. / SecOps + Gestor Comercial / Estandes",
    summary: "Regulamento compulsório para matriz corporativa, escritórios de canteiros e estandes de vendas imobiliárias: bloqueio automático de tela (3 minutos / Win+L), guarda trancada de fichas de leads, proibição de post-its com senhas e descarte seguro em fragmentadora P-4.",
    buildBody: (ctx) => `
      <h2>1. Objetivo, Princípio da Minimização e Escopo de Aplicação</h2>
      <p>Em consonância com o Controle <strong>A.7.7 da norma ABNT NBR ISO/IEC 27001:2022</strong> e o Artigo 46 da Lei Geral de Proteção de Dados (LGPD), a <strong>${escapeDocHtml(ctx.company)}</strong> institui a presente <strong>Política de Mesa Limpa e Tela Limpa (PML-006)</strong>, de cumprimento compulsório por todos os colaboradores, estagiários, corretores parceiros e prestadores de serviços nos seguintes ambientes:</p>
      <ul>
        <li><strong>Sede Administrativa (Matriz Central):</strong> Estações de trabalho, financeiro, suprimentos, diretoria e salas de reunião;</li>
        <li><strong>Contêineres Administrativos de Canteiros de Obras:</strong> Postos de engenharia, almoxarifado, controle de catracas e segurança do trabalho (SST);</li>
        <li><strong>Estandes de Vendas e Pontos de Atendimento ao Cliente:</strong> Mesas de atendimento, recepção e computadores de simulação de crédito imobiliário.</li>
      </ul>

      <h2>2. Diretrizes Específicas de Tela Limpa (Clean Screen)</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th width="30%">Requisito Operacional</th>
            <th width="40%">Diretriz Mandatória de Segurança</th>
            <th width="30%">Controle Técnico / Auditoria</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Bloqueio Automático por Inatividade</strong></td>
            <td>Todas as estações de trabalho conectadas ao domínio corporativo bloqueiam a sessão automaticamente após <strong>3 (três) minutos</strong> de ociosidade.</td>
            <td>GPO do Active Directory / Rotação de credenciais</td>
          </tr>
          <tr>
            <td><strong>Bloqueio Imediato Manual</strong></td>
            <td>Ao se ausentar do posto de trabalho, mesmo por breves momentos (café, impressão, sanitários), o colaborador deve acionar o atalho <code>Win + L</code> (ou <code>Ctrl + Alt + Del</code>).</td>
            <td>Auditoria visual e trilha de eventos Wazuh</td>
          </tr>
          <tr>
            <td><strong>Proteção de Visor (Shoulder Surfing)</strong></td>
            <td>Monitores em estandes de vendas e recepção devem ser posicionados de forma a impedir a visualização de propostas financeiras e documentos de crédito por transeuntes.</td>
            <td>Filtro de privacidade óptico em telas de atendimento</td>
          </tr>
          <tr>
            <td><strong>Proibição de Anotação de Credenciais</strong></td>
            <td>É terminantemente proibido colar notas adesivas (<em>post-its</em>) com senhas, PINs de token ou acessos ao Sienge/AD em monitores, teclados ou sob gaveteiros.</td>
            <td>Falta disciplinar grave / Incidente SGSI</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Diretrizes Específicas de Mesa Limpa (Clean Desk) e Guarda Física</h2>
      <ol>
        <li><strong>Guarda de Documentos Físicos ao Final do Expediente:</strong> Todos os formulários contendo dados pessoais (fichas de cadastro de leads, cópias de CNH/RG de proponentes, ASOs, contratos e recibos) devem ser guardados e trancados em gaveteiros individuais ou armários chaveados ao término do expediente ou durante ausências prolongadas.</li>
        <li><strong>Chaves de Armários e Gavetas:</strong> As chaves dos gaveteiros e armários devem ser mantidas sob a posse exclusiva do responsável ou depositadas em cofre de chaves da administração, nunca deixadas sobre as mesas.</li>
        <li><strong>Mídias Removíveis e Tokens:</strong> Pendrives, HDs externos, tokens de certificado digital A3 (e-CNPJ / e-CPF) e crachás de catraca não podem pernoitar expostos em superfícies de trabalho.</li>
        <li><strong>Salas de Reunião e Espaços Compartilhados:</strong> Ao término de reuniões comerciais, comitês de obras ou reuniões de diretoria, os quadros brancos devem ser integralmente apagados e qualquer minuta ou anotação confidencial recolhida para trituração.</li>
      </ol>

      <h2>4. Procedimentos de Descarte e Fragmentação Nível P-4 (DIN 66399)</h2>
      <div class="callout">
        <strong>Importante:</strong> É expressamente vedado o descarte de papéis de rascunho com dados pessoais (nomes, CPFs, rendas, telefones de leads) em lixeiras comuns de escritório.
      </div>
      <p>Todo documento físico inservível ou rasurado contendo dados corporativos ou pessoais deve ser imediatamente inserido em <strong>fragmentadora de papel com corte cruzado (Nível de Segurança P-4)</strong> ou descartado em caixas coletoras lacradas destinadas à incineração/trituração industrial documentada com certificado de destruição térmica/mecânica.</p>

      <h2>5. Auditorias Periódicas (Rondas de Mesa Limpa) e Penalidades</h2>
      <p>A equipe de SecOps e o DPO realizarão rondas periódicas não anunciadas na Matriz, nos estandes de vendas e nos canteiros adjacentes. Itens não conformes (documentos expostos, computadores desbloqueados ou post-its com senhas) serão recolhidos pela segurança, autuados no Relatório de Não Conformidade (MOD-AUD-03) e reportados à Diretoria Executiva.</p>

      ${buildSignatureGridHTML([
        { role: "Encarregado(a) pelo Tratamento de Dados (DPO)", name: ctx.dpoName },
        { role: "Gestor de Infraestrutura, Segurança da Informação & SecOps", name: ctx.secopsName },
        { role: "Gestor Comercial & Estandes de Vendas", name: "Coordenação Comercial / Vendas" }
      ], false, "MOD-GOV-09")}
    `
  },

  // --------------------------------------------------------------------------
  // MÓDULO 05: INFRAESTRUTURA & SECOPS
  // --------------------------------------------------------------------------
  {
    code: "MOD-SEC-01",
    module: "secops",
    docType: "Laudo Técnico",
    requiresSignature: true,
    title: "Laudo Técnico de Teste de Restauração de Backup Imutável (Sienge / BIM / S3)",
    normative: "ISO/IEC 27001:2022 A.8.13, A.5.30 (Continuidade TIC) & LGPD Art. 46",
    evidenceCategory: "Continuidade & T.I.",
    signersSummary: "Administrador SecOps + Validador de Negócio / DPO",
    summary: "Evidência obrigatória de teste real de restore em ambiente isolado (sandbox), medindo RTO/RPO e integridade criptográfica contra ransomware.",
    buildBody: (ctx) => `
      <h2>1. Escopo do Exercício de Recuperação de Desastres (Restore Test) — AC Engenharia</h2>
      <table class="data-table">
        <tr>
          <td width="50%"><strong>Data/Hora de Início:</strong> ____/____/202___ às ____:____</td>
          <td width="50%"><strong>Data/Hora de Conclusão:</strong> ____/____/202___ às ____:____</td>
        </tr>
        <tr>
          <td><strong>Origem do Backup:</strong> [ ] AWS S3 Object Lock (WORM) &nbsp;[ ] Cofre Offsite</td>
          <td><strong>Ambiente de Destino:</strong> Sandbox Isolada (VLAN Homologação)</td>
        </tr>
      </table>

      <h2>2. Ativos Críticos Testados e Métricas de Continuidade (RPO / RTO)</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Base / Servidor Restaurado</th>
            <th>Volume (GB)</th>
            <th>RPO Meta / Real</th>
            <th>RTO Meta / Real</th>
            <th>Validação SHA-256 &amp; Boot</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Banco Central ERP Sienge / PostgreSQL</td>
            <td>______ GB</td>
            <td>15m / ____m</td>
            <td>2h / ____m</td>
            <td>[ ] Íntegro &nbsp;[ ] Falha</td>
          </tr>
          <tr>
            <td>Repositório de Projetos Engenharia &amp; BIM</td>
            <td>______ GB</td>
            <td>24h / ____h</td>
            <td>4h / ____h</td>
            <td>[ ] Íntegro &nbsp;[ ] Falha</td>
          </tr>
          <tr>
            <td>Banco SGSI &amp; Trilha Forense Merkle</td>
            <td>______ GB</td>
            <td>15m / ____m</td>
            <td>1h / ____m</td>
            <td>[ ] Íntegro &nbsp;[ ] Falha</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Hash do Snapshot Restaurado e Conclusão Técnica</h2>
      <p><strong>Hash SHA-256 do Arquivo de Teste Verificado:</strong> <code>________________________________________________________________</code></p>
      <p><strong>Parecer Técnico:</strong> [ &nbsp; ] Restauração 100% bem-sucedida, dados legíveis pela área de negócio e imutabilidade Object Lock ativa. &nbsp; [ &nbsp; ] Necessita ajuste corretivo.</p>

      ${buildSignatureGridHTML([
        { role: "Executor Técnico — T.I. / SecOps AC Engenharia", name: ctx.secopsName },
        { role: "Validador Funcional / Governança DPO", name: ctx.dpoName }
      ], false, "MOD-SEC-01")}
    `
  },
  {
    code: "MOD-SEC-02",
    module: "secops",
    docType: "Ata CSIRT",
    requiresSignature: true,
    title: "Ata Pós-Incidente Cibernético (CSIRT) e Relatório de Lições Aprendidas",
    normative: "ABNT NBR ISO/IEC 27035, ISO 27001 A.5.24 a A.5.28 & NIST SP 800-61",
    evidenceCategory: "SecOps & SIEM",
    signersSummary: "Líder CSIRT (SecOps) + DPO + Diretoria",
    summary: "Documenta formalmente todo o ciclo de resposta a incidente (Identificação, Contenção VLAN 99, Erradicação, Recuperação e Lições Aprendidas).",
    buildBody: (ctx) => `
      <h2>1. Sumário Executivo do Incidente de Segurança</h2>
      <table class="data-table">
        <tr>
          <td width="35%"><strong>ID do Incidente:</strong> INC-202___-____</td>
          <td width="35%"><strong>Severidade:</strong> [ ] Crítica [ ] Alta [ ] Média</td>
          <td width="30%"><strong>Regra Wazuh / MITRE:</strong> ____________</td>
        </tr>
        <tr>
          <td><strong>Ativo(s) Afetado(s):</strong> ___________________________</td>
          <td><strong>Unidade / Obra:</strong> ${escapeDocHtml(ctx.activeUnit)}</td>
          <td><strong>Houve Dados Pessoais?</strong> [ ] Sim [ ] Não</td>
        </tr>
      </table>

      <h2>2. Linha do Tempo Forense (5 Fases NIST / ISO 27035)</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th width="22%">Fase do Ciclo</th>
            <th width="22%">Data e Horário (UTC-3)</th>
            <th width="56%">Ações Técnicas Executadas e Evidências Coletadas</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>1. Detecção / Triagem</td><td>____/____ às ____:____</td><td>Alerta correlacionado no SIEM Wazuh; abertura imediata do protocolo CSIRT.</td></tr>
          <tr><td>2. Contenção Imediata</td><td>____/____ às ____:____</td><td>Isolamento do host na VLAN 99 (Quarentena MikroTik) e revogação de sessão AD/VPN.</td></tr>
          <tr><td>3. Erradicação</td><td>____/____ às ____:____</td><td>Remoção de artefato malicioso, reimagem limpa e rotação de credenciais afetadas.</td></tr>
          <tr><td>4. Recuperação</td><td>____/____ às ____:____</td><td>Retorno controlado à VLAN de produção após varredura limpa de 24h.</td></tr>
          <tr><td>5. Lições Aprendidas</td><td>____/____ às ____:____</td><td>Atualização de regra SIEM, reforço de GPO e revisão do controle SoA correspondente.</td></tr>
        </tbody>
      </table>

      <h2>3. Avaliação Regulatória de Privacidade (Gatilho ANPD)</h2>
      <p>O incidente gerou risco ou dano relevante aos titulares de dados pessoais nos termos da Res. CD/ANPD nº 15/2024? <br/>
      [ &nbsp; ] <strong>NÃO</strong> (contenção antes de exfiltração/indisponibilidade crítica; arquivado internamente). &nbsp;&nbsp; [ &nbsp; ] <strong>SIM</strong> (acionar imediatamente formulário <strong>MOD-SEC-03</strong> em até 3 dias úteis).</p>

      ${buildSignatureGridHTML([
        { role: "Líder de Resposta a Incidentes (CSIRT / SecOps)", name: ctx.secopsName },
        { role: "Parecer Jurídico-Regulatório (DPO)", name: ctx.dpoName },
        { role: "Ciência da Diretoria Executiva — AC Engenharia", name: ctx.directorName }
      ], false, "MOD-SEC-02")}
    `
  },
  {
    code: "MOD-SEC-03",
    module: "secops",
    docType: "Notificação Oficial",
    requiresSignature: true,
    title: "Comunicação Oficial de Incidente de Segurança à ANPD e aos Titulares (3 Dias Úteis)",
    normative: "LGPD Art. 48 & Resolução CD/ANPD nº 15/2024",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Encarregado(a) DPO + Representante Legal da Controladora",
    summary: "Modelo oficial estruturado exatamente nos requisitos obrigatórios da Resolução CD/ANPD nº 15/2024 para protocolo na ANPD e notificação aos titulares em até 3 dias úteis.",
    buildBody: (ctx) => `
      <div class="callout">
        <strong>PRAZO LEGAL MANDATÓRIO (Resolução CD/ANPD nº 15/2024):</strong> A comunicação à ANPD e aos titulares afetados deve ser realizada em até <strong>3 (três) dias úteis</strong> contados do conhecimento de incidente que possa acarretar risco ou dano relevante aos titulares.
      </div>

      <h2>1. Identificação do Agente de Tratamento (Controlador) e DPO</h2>
      <table class="data-table">
        <tr>
          <td width="55%"><strong>Controlador:</strong> ${escapeDocHtml(ctx.company)}</td>
          <td width="45%"><strong>CNPJ:</strong> ${escapeDocHtml(ctx.cnpj)}</td>
        </tr>
        <tr>
          <td><strong>Encarregado(a) (DPO):</strong> ${escapeDocHtml(ctx.dpoName || "[ Nome do(a) Encarregado(a) DPO ]")}</td>
          <td><strong>Contato DPO:</strong> ${escapeDocHtml(ctx.dpoEmail)}</td>
        </tr>
        <tr>
          <td><strong>Data/Hora da Ciência do Incidente:</strong> ____/____/202___ às ____:____</td>
          <td><strong>Tipo de Comunicação:</strong> [ ] Preliminar &nbsp;[ ] Completa</td>
        </tr>
      </table>

      <h2>2. Informações Obrigatórias sobre o Incidente (Art. 6º Res. 15/2024)</h2>
      <ol>
        <li><strong>Descrição da Natureza e Categoria dos Dados Pessoais Afetados:</strong> <br/>
        [ ] Dados cadastrais (nome, CPF, e-mail, telefone) &nbsp; [ ] Dados financeiros/renda (contratos imobiliários) &nbsp; [ ] Dados sensíveis/biométricos (Art. 11) &nbsp; [ ] Dados trabalhistas/SST.<br/>
        Detalhamento: __________________________________________________________________________________________</li>
        <li><strong>Categorias e Quantidade Estimada de Titulares Afetados:</strong> <br/>
        [ ] Clientes/Adquirentes (Qtd: ______) &nbsp; [ ] Leads Comerciais (Qtd: ______) &nbsp; [ ] Colaboradores/Operários (Qtd: ______)</li>
        <li><strong>Medidas Técnicas e de Segurança Utilizadas Antes do Incidente:</strong> Criptografia em trânsito (TLS 1.3), criptografia de disco (BitLocker), controle de acesso RBAC, segmentação de rede VLAN e monitoramento SIEM Wazuh.</li>
        <li><strong>Riscos Relacionados ao Incidente e Possíveis Impactos aos Titulares:</strong> ____________________________________________</li>
        <li><strong>Medidas Adotadas para Reverter ou Mitigar os Efeitos Prejudiciais:</strong> Isolamento imediato de ativos comprometidos, revogação de credenciais, bloqueio de IPs maliciosos, orientação preventiva aos titulares contra fraudes/boletos falsos e preservação forense.</li>
      </ol>

      <h2>3. Minuta de Comunicado Direto aos Titulares (Linguagem Simples — Art. 9º)</h2>
      <div class="callout">
        "Prezado(a) Titular, a AC Engenharia informa com total transparência que identificou, em ___/___/202___, um evento de segurança envolvendo [descrever dados]. Adotamos imediatamente todas as medidas técnicas de bloqueio e contenção. Recomendamos atenção redobrada a mensagens suspeitas ou boletos fora do portal oficial do cliente. Nosso Encarregado de Dados (DPO) está à disposição pelo canal ${escapeDocHtml(ctx.dpoEmail)}."
      </div>

      ${buildSignatureGridHTML([
        { role: "Encarregado(a) pelo Tratamento de Dados (DPO)", name: ctx.dpoName },
        { role: "Diretor Executivo / Representante Legal — AC Engenharia", name: ctx.directorName }
      ], false, "MOD-SEC-03")}
    `
  },
  {
    code: "MOD-SEC-04",
    module: "secops",
    docType: "Laudo / Checklist",
    requiresSignature: true,
    title: "Laudo de Homologação de Hardening, BitLocker e Bloqueio USB (GPO) em Estações",
    normative: "ISO/IEC 27001 A.8.1, A.8.7, A.8.9, A.8.24 & CIS Benchmarks",
    evidenceCategory: "Infraestrutura & T.I.",
    signersSummary: "Analista SecOps + Gestor de T.I.",
    summary: "Comprova a aplicação técnica das políticas de grupo (GPO), criptografia de disco BitLocker, remoção de privilégio Admin Local e agente EDR nas estações.",
    buildBody: (ctx) => `
      <h2>1. Escopo da Verificação de Conformidade de Endpoints — AC Engenharia</h2>
      <p>Unidade inspecionada: <strong>${escapeDocHtml(ctx.activeUnit)}</strong>. Amostragem de estações de trabalho (Engenharia BIM, Administrativo, Financeiro e Notebooks de Campo).</p>

      <table class="data-table">
        <thead>
          <tr>
            <th>Hostname</th>
            <th>Usuário / Setor</th>
            <th>BitLocker TPM 2.0</th>
            <th>Sem Admin Local</th>
            <th>Bloqueio USB (GPO)</th>
            <th>Agente Wazuh EDR</th>
          </tr>
        </thead>
        <tbody>
          ${Array.from({ length: 6 }, () => `
            <tr>
              <td style="height:24px;">WKS-__________</td>
              <td></td>
              <td>[ ] Ativo (Escrow AD)</td>
              <td>[ ] Confirmado</td>
              <td>[ ] Bloqueado</td>
              <td>[ ] Conectado</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <h2>2. Evidências de Comandos Coletadas em Anexo</h2>
      <p>Devem acompanhar este laudo as saídas/capturas de tela dos comandos de auditoria: <code>manage-bde -status</code> (BitLocker), <code>gpresult /r</code> (GPO Bloqueio USB e Tela de Bloqueio em 5 min) e painel de agentes ativos no Wazuh Manager.</p>

      ${buildSignatureGridHTML([
        { role: "Analista de Infraestrutura / Executor do Hardening", name: "" },
        { role: "Gestor de T.I. & SecOps (Revisão Técnica)", name: ctx.secopsName }
      ], false, "MOD-SEC-04")}
    `
  },
  {
    code: "MOD-SEC-05",
    module: "secops",
    docType: "Plano & Ata (PCN/DRP)",
    requiresSignature: true,
    title: "Plano de Continuidade de Negócios e Recuperação de Desastres de TIC (PCN / DRP)",
    normative: "ISO/IEC 27001:2022 A.5.29, A.5.30 & ABNT NBR ISO 22301",
    evidenceCategory: "Continuidade & T.I.",
    signersSummary: "Gestor SecOps + Coordenação de Engenharia + Diretoria",
    summary: "Estabelece os procedimentos de contingência operacional para obras e sede em caso de indisponibilidade crítica de ERP Sienge, servidor BIM, link de fibra ou energia.",
    buildBody: (ctx) => `
      <h2>1. Matriz de Impacto nos Negócios (BIA) e Metas de Recuperação</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Processo / Sistema Crítico da AC Engenharia</th>
            <th>RTO (Tempo Máx. Parada)</th>
            <th>RPO (Perda Máx. Dados)</th>
            <th>Procedimento de Contingência Imediata</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>ERP Sienge (Financeiro, Suprimentos e Folha)</td><td>2 horas</td><td>15 minutos</td><td>Failover em nuvem + aprovação emergencial offline controlada</td></tr>
          <tr><td>Servidor de Projetos Executivos BIM / CAD</td><td>4 horas</td><td>24 horas</td><td>Restauração de snapshot imutável S3 Object Lock em servidor reserva</td></tr>
          <tr><td>Catracas Faciais e Portaria de Canteiros (NR-18)</td><td>1 hora</td><td>Zero (Cache Local)</td><td>Operação em buffer local com nobreak + conferência nominal de ASO</td></tr>
          <tr><td>Túnel VPN IPSec Canteiro ↔ Matriz</td><td>30 minutos</td><td>N/A</td><td>Failover automático para link secundário 4G/5G/Starlink empresarial</td></tr>
        </tbody>
      </table>

      <h2>2. Registro de Teste Anual de Simulação de Contingência</h2>
      <p>Declaramos que o plano acima foi testado em exercício simulado na unidade <strong>${escapeDocHtml(ctx.activeUnit)}</strong>, atingindo os tempos de recuperação estipulados.</p>

      ${buildSignatureGridHTML([
        { role: "Gestor de T.I. & SecOps (Líder DRP)", name: ctx.secopsName },
        { role: "Diretoria Executiva — AC Engenharia", name: ctx.directorName }
      ], false, "MOD-SEC-05")}
    `
  },
  {
    code: "MOD-SEC-06",
    module: "secops",
    docType: "Relatório Técnico",
    requiresSignature: true,
    title: "Relatório de Gestão de Vulnerabilidades (CVE), Patch Management e Revisão de Firewall/VLANs",
    normative: "ISO/IEC 27001:2022 A.8.8, A.8.19, A.8.20 & A.8.21",
    evidenceCategory: "SecOps & SIEM",
    signersSummary: "Analista SecOps + Administrador de Redes",
    summary: "Documenta a varredura mensal de vulnerabilidades do Wazuh, aplicação de correções críticas de segurança e auditoria das regras de firewall MikroTik e VLANs.",
    buildBody: (ctx) => `
      <h2>1. Resumo da Varredura de Vulnerabilidades (Wazuh Vulnerability Detector)</h2>
      <table class="data-table">
        <tr>
          <td width="25%"><strong>Críticas (CVSS ≥ 9.0):</strong> ____</td>
          <td width="25%"><strong>Altas (CVSS 7.0–8.9):</strong> ____</td>
          <td width="25%"><strong>Corrigidas no Ciclo:</strong> ____%</td>
          <td width="25%"><strong>SLA Críticas:</strong> Até 48 horas</td>
        </tr>
      </table>

      <h2>2. Auditoria de Segmentação de Rede e Regras de Firewall (MikroTik RouterOS)</h2>
      <ul>
        <li>[ &nbsp; ] Inexistência de regras permissivas <code>Any-Any</code> na WAN da Matriz e dos Canteiros;</li>
        <li>[ &nbsp; ] Portas de gerência (SSH, WinBox, RDP 3389, SMB 445) bloqueadas para a internet pública;</li>
        <li>[ &nbsp; ] Isolamento ativo entre VLAN 10/20 (Engenharia/Corporativo), VLAN 30 (Catracas/CFTV), VLAN 40 (Estandes) e VLAN 99 (Quarentena CSIRT).</li>
      </ul>

      ${buildSignatureGridHTML([
        { role: "Gestor de T.I. & SecOps — AC Engenharia", name: ctx.secopsName },
        { role: "Auditoria Interna / Conformidade", name: ctx.dpoName }
      ], false, "MOD-SEC-06")}
    `
  },
  {
    code: "MOD-SEC-07",
    module: "secops",
    docType: "Formulário GMUD",
    requiresSignature: true,
    title: "Requisição e Homologação de Mudança Crítica em Infraestrutura e Sistemas (GMUD)",
    normative: "ISO/IEC 27001:2022 A.8.32 (Gestão de Mudanças) & A.8.31",
    evidenceCategory: "Infraestrutura & T.I.",
    signersSummary: "Executor Técnico + Aprovador SecOps / Comitê de Mudanças",
    summary: "Controla alterações em produção (atualização de servidores, regras de firewall, banco PostgreSQL, integrações Sienge/CV) com plano de rollback obrigatório.",
    buildBody: (ctx) => `
      <h2>1. Especificação da Mudança Técnica (Change Request)</h2>
      <table class="data-table">
        <tr>
          <td width="50%"><strong>Código GMUD:</strong> GMUD-202___-____</td>
          <td width="50%"><strong>Janela de Execução:</strong> ____/____/202___ das ____h às ____h</td>
        </tr>
        <tr>
          <td><strong>Sistema / Ativo Alvo:</strong> ____________________________________</td>
          <td><strong>Impacto de Segurança / LGPD Avaliado?</strong> [ ] Sim &nbsp;[ ] Não</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Plano de Retorno (Rollback Plan) em Caso de Falha:</strong> Snapshot prévio validado e reversão imediata em até 30 minutos.</td>
        </tr>
      </table>

      ${buildSignatureGridHTML([
        { role: "Solicitante / Executor Técnico", name: "" },
        { role: "Aprovação de Mudança — Gestor SecOps AC Engenharia", name: ctx.secopsName }
      ], false, "MOD-SEC-07")}
    `
  },
  {
    code: "MOD-SUP-01",
    module: "secops",
    docType: "Laudo de Due Diligence",
    requiresSignature: true,
    title: "Laudo de Due Diligence, Homologação e Gestão de Riscos de Fornecedores de TIC e Nuvem (QDD-007)",
    normative: "ISO/IEC 27001:2022 A.5.19, A.5.20, A.5.21, A.5.22, A.5.23 & LGPD Art. 39",
    evidenceCategory: "Infraestrutura & T.I.",
    signersSummary: "Gestor de Suprimentos & Terceiros + Gestor SecOps + DPO",
    summary: "Homologação técnica e jurídica de fornecedores críticos de TIC e serviços em nuvem (ERP Sienge / Softplan, MikroTik, Google Workspace, Bitdefender GravityZone, Wazuh Cloud, Provedores de Link de Internet e Empreiteiras de Catracas Biométricas). Avaliação de SLAs, certificações ISO 27001 / SOC 2, rotina de backups, criptografia em trânsito/repouso e conformidade com DPAs.",
    buildBody: (ctx) => `
      <h2>1. Identificação do Fornecedor / Terceiro Homologado</h2>
      <table class="data-table">
        <tr>
          <td width="50%"><strong>Razão Social / Fornecedor:</strong> ________________________________________________</td>
          <td width="50%"><strong>CNPJ:</strong> __________________________________</td>
        </tr>
        <tr>
          <td><strong>Solução / Serviço Contratado:</strong> [ ] ERP Sienge [ ] Nuvem Google [ ] Bitdefender [ ] Link Fibra [ ] Outro: ________</td>
          <td><strong>Classificação de Criticidade:</strong> [ ] Crítico (Tier 1) &nbsp;[ ] Alto (Tier 2) &nbsp;[ ] Médio (Tier 3)</td>
        </tr>
        <tr>
          <td><strong>Responsável Técnico do Fornecedor:</strong> ________________________________</td>
          <td><strong>E-mail / Telefone 24/7:</strong> _________________________________</td>
        </tr>
      </table>

      <h2>2. Checklist Técnico de Due Diligence em Cibersegurança & Conformidade (ISO 27001 A.5.19 a A.5.23)</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th width="40%">Item Auditado no Fornecedor</th>
            <th width="35%">Evidência / Certificação Comprovada</th>
            <th width="25%">Status Homologação</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Certificações Internacionais de Segurança</strong></td>
            <td>Relatório SOC 2 Tipo II, Certificação ISO/IEC 27001:2022 ou equivalente</td>
            <td>[ ] Homologado &nbsp;[ ] Pendente</td>
          </tr>
          <tr>
            <td><strong>Criptografia em Repouso e em Trânsito</strong></td>
            <td>AES-256 para dados armazenados e TLS 1.3 obrigatório para conexões de rede</td>
            <td>[ ] Homologado &nbsp;[ ] Pendente</td>
          </tr>
          <tr>
            <td><strong>Acordo de Processamento de Dados (DPA — Art. 39 LGPD)</strong></td>
            <td>Minuta formal de DPA assinada contendo regras de confidencialidade e suboperadores</td>
            <td>[ ] Homologado &nbsp;[ ] Pendente</td>
          </tr>
          <tr>
            <td><strong>SLA de Disponibilidade e Continuidade (PCN)</strong></td>
            <td>Disponibilidade contratual mínima de 99.5% e teste anual de recuperação de desastres</td>
            <td>[ ] Homologado &nbsp;[ ] Pendente</td>
          </tr>
          <tr>
            <td><strong>Notificação de Incidentes de Segurança</strong></td>
            <td>Obrigação contratual de notificar a AC Engenharia em até <strong>48 (quarenta e oito) horas</strong> de qualquer violação</td>
            <td>[ ] Homologado &nbsp;[ ] Pendente</td>
          </tr>
          <tr>
            <td><strong>Descarte Seguro de Dados no Término</strong></td>
            <td>Procedimento de exclusão definitiva ou devolução dos dados após rescisão contratual</td>
            <td>[ ] Homologado &nbsp;[ ] Pendente</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Parecer Conjunto de Homologação (T.I., Suprimentos & DPO)</h2>
      <div class="callout">
        <strong>Conclusão Técnica:</strong> Com base na análise das evidências documentais e respostas ao questionário de conformidade, o fornecedor acima qualificado atende aos padrões de governança, confidencialidade e segurança cibernética exigidos pela <strong>AC Engenharia</strong>, estando formalmente HOMOLOGADO para prestação de serviços no escopo do SGSI.
      </div>

      ${buildSignatureGridHTML([
        { role: "Gestão de Suprimentos & Homologação de Terceiros", name: "Coordenação de Suprimentos" },
        { role: "Gestor de Infraestrutura, Segurança da Informação & SecOps", name: ctx.secopsName },
        { role: "Encarregado(a) pelo Tratamento de Dados (DPO)", name: ctx.dpoName }
      ], false, "MOD-SUP-01")}
    `
  },

  // --------------------------------------------------------------------------
  // MÓDULO 06: INTEGRAÇÕES & APIS
  // --------------------------------------------------------------------------
  {
    code: "MOD-API-01",
    module: "integrations",
    docType: "Termo Técnico",
    requiresSignature: true,
    title: "Termo de Homologação Técnica, Sigilo e Custódia de Credenciais de APIs e Webhooks",
    normative: "ISO/IEC 27001 A.8.20, A.8.24, A.5.19 & TLS 1.3 / mTLS",
    evidenceCategory: "Infraestrutura & T.I.",
    signersSummary: "Gestor SecOps + Responsável Técnico do Sistema Integrado",
    summary: "Formaliza a segurança de conectores (Sienge ERP, CV CRM, Catracas Faciais, Wazuh, GLPI/AD, MikroTik e TSA RFC 3161), rotação de tokens de 90 dias e escopo mínimo.",
    buildBody: (ctx) => `
      <h2>1. Especificação do Conector / Integração Sistêmica — AC Engenharia</h2>
      <table class="data-table">
        <tr>
          <td width="50%"><strong>Sistema Integrado:</strong> [ ] Sienge [ ] CV CRM [ ] Catracas [ ] Wazuh [ ] Outro: ________</td>
          <td width="50%"><strong>Protocolo Criptográfico:</strong> [ ] HTTPS TLS 1.3 &nbsp;[ ] mTLS ICP-Brasil</td>
        </tr>
        <tr>
          <td><strong>Endpoint / URL Base:</strong> ____________________________________________</td>
          <td><strong>Service Account / Client ID:</strong> _______________________________</td>
        </tr>
        <tr>
          <td><strong>Política de Rotação de Chave/Token:</strong> A cada 90 dias (ou JWT efêmero)</td>
          <td><strong>Armazenamento do Segredo:</strong> Cofre Criptografado (.env / Vault)</td>
        </tr>
      </table>

      <h2>2. Requisitos Mandatórios de Segurança de APIs</h2>
      <ol>
        <li><strong>Escopo Mínimo (Least Privilege):</strong> O token/credencial de serviço possui exclusivamente as permissões estritamente necessárias de leitura/escrita para os objetos homologados, sendo vedado o uso de contas pessoais de administradores.</li>
        <li><strong>Proibição de Dados Sensíveis em Query String ou Logs Abertos:</strong> Nenhum CPF, senha ou token Bearer será gravado em texto claro em logs de aplicação ou URLs.</li>
        <li><strong>Auditoria e Revogação Imediata (Kill Switch):</strong> Em caso de anomalia de volume (rate-limit) ou comprometimento de fornecedor, a credencial será imediatamente revogada no barramento da Matriz da AC Engenharia.</li>
      </ol>

      ${buildSignatureGridHTML([
        { role: "Arquitetura & Segurança de Integrações (SecOps)", name: ctx.secopsName },
        { role: "Responsável pelo Sistema / Fornecedor Integrado", name: "" }
      ], false, "MOD-API-01")}
    `
  },
  {
    code: "MOD-API-02",
    module: "integrations",
    docType: "Ata de Auditoria Técnica",
    requiresSignature: true,
    title: "Ata de Auditoria Trimestral de Rotação de Chaves de API, Certificados TLS/mTLS e Conectores",
    normative: "ISO/IEC 27001:2022 A.8.24 (Uso de Criptografia) & A.5.17",
    evidenceCategory: "Infraestrutura & T.I.",
    signersSummary: "Gestor de T.I. & SecOps + Encarregado(a) DPO",
    summary: "Comprova a rotação trimestral dos segredos OAuth2/Bearer, renovação de certificados SSL/TLS Let's Encrypt e teste de integridade dos 7 conectores corporativos.",
    buildBody: (ctx) => `
      <h2>1. Verificação dos 7 Conectores do Barramento Corporativo da AC Engenharia</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Conector / Integração</th>
            <th>Criptografia</th>
            <th>Data da Rotação de Token/Chave</th>
            <th>Status Handshake</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>01. Sienge ERP (REST API v1)</td><td>OAuth2 + TLS 1.3</td><td>____/____/202___</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>02. CV — Construtor de Vendas CRM</td><td>Webhook HMAC-SHA256</td><td>____/____/202___</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>03. Catracas Faciais Canteiros (ISAPI)</td><td>HTTPS + Hash Template</td><td>____/____/202___</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>04. Wazuh SIEM &amp; XDR Manager</td><td>JWT + TLS 1.3</td><td>____/____/202___</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>05. Active Directory / GLPI IAM</td><td>LDAPS (Porta 636)</td><td>____/____/202___</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>06. Concentrador VPN MikroTik Canteiros</td><td>IPSec IKEv2 AES-256</td><td>____/____/202___</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>07. Autoridade Carimbo de Tempo (TSA)</td><td>RFC 3161 ICP-Brasil</td><td>____/____/202___</td><td>[ ] Íntegro (200 OK)</td></tr>
        </tbody>
      </table>

      ${buildSignatureGridHTML([
        { role: "Gestor de T.I. & SecOps — AC Engenharia", name: ctx.secopsName },
        { role: "Auditoria de Conformidade — DPO", name: ctx.dpoName }
      ], false, "MOD-API-02")}
    `
  },

  // --------------------------------------------------------------------------
  // MÓDULO 07: GESTÃO DE RISCOS (ISO 27005 & SOA ISO 27001)
  // --------------------------------------------------------------------------
  {
    code: "MOD-RSK-01",
    module: "risks",
    docType: "Termo Executivo C-Level",
    requiresSignature: true,
    title: "Termo Executivo de Aceite Formal de Risco Residual e Plano de Tratamento",
    normative: "ABNT NBR ISO/IEC 27005 & ISO/IEC 27001:2022 Cláusula 6.1.3 'f'",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Diretoria Executiva (C-Level) + Custodiante do Ativo + DPO",
    summary: "Documento exigido pelos auditores ISO 27001 para comprovar que a Alta Direção aprovou o plano de tratamento e assumiu formalmente o risco residual.",
    buildBody: (ctx, custom = {}) => `
      <h2>1. Ficha Técnica do Risco Avaliado (Metodologia Matriz 5×5 ISO 27005)</h2>
      <table class="data-table">
        <tr>
          <td width="30%"><strong>Código do Risco:</strong> ${escapeDocHtml(custom.id || "RSK-_______")}</td>
          <td width="40%"><strong>Unidade / Obra:</strong> ${escapeDocHtml(custom.obra_local || ctx.activeUnit)}</td>
          <td width="30%"><strong>Categoria:</strong> ${escapeDocHtml(custom.category || "__________________")}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Ativo ou Processo Crítico:</strong> ${escapeDocHtml(custom.asset || "________________________________________________")}</td>
          <td><strong>Estratégia:</strong> ${escapeDocHtml(custom.strategy || "Mitigar / Aceitar")}</td>
        </tr>
        <tr>
          <td colspan="3"><strong>Ameaça e Vulnerabilidade Identificadas:</strong> ${escapeDocHtml(custom.threat ? `${custom.threat} — Vulnerabilidade: ${custom.vuln || "N/D"}` : "________________________________________________________________________")}</td>
        </tr>
      </table>

      <h2>2. Comparativo de Severidade: Risco Inerente vs. Risco Residual Pós-Salvaguarda</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th width="25%">Risco Inerente (Sem Controle)</th>
            <th width="50%">Controle Mitigador Aplicado (Anexo A — SoA ISO 27001)</th>
            <th width="25%">Risco Residual (Líquido)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Score Bruto:</strong> ${escapeDocHtml(custom.inherentScore != null ? `${custom.inherentScore} (P:${custom.inherentProb} × I:${custom.inherentImp})` : "____ / 25")}</td>
            <td>${escapeDocHtml(custom.control || "Controle SoA A.___.___ — ________________________________________")}</td>
            <td><strong>Score Residual:</strong> ${escapeDocHtml(custom.residualScore != null ? `${custom.residualScore} (P:${custom.residualProb} × I:${custom.residualImp})` : "____ / 25")}</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Declaração de Homologação e Aceite Executivo (ISO 27001 Cl. 6.1.3 f)</h2>
      <p>Na qualidade de membro da Alta Direção da <strong>${escapeDocHtml(ctx.company)}</strong>, declaro ter analisado tecnicamente o cenário acima, aprovando as salvaguardas implementadas e <strong>homologando formalmente o Risco Residual</strong> pelo período de 12 (doze) meses ou até alteração substancial de arquitetura, mantendo monitoramento contínuo pelo custodiante <strong>${escapeDocHtml(custom.responsible || "___________________________")}</strong>.</p>

      ${buildSignatureGridHTML([
        { role: "Aprovação Executiva — Diretoria C-Level (Accountable)", name: custom.directorName || ctx.directorName },
        { role: "Custodiante Responsável pelo Tratamento", name: custom.responsible || "" },
        { role: "Parecer de Conformidade — Encarregado(a) DPO / SecOps", name: ctx.dpoName }
      ], false, "MOD-RSK-01")}
    `
  },
  {
    code: "MOD-RSK-02",
    module: "risks",
    docType: "Declaração Oficial (SoA)",
    requiresSignature: true,
    title: "Declaração de Aplicabilidade Oficial (SoA — Anexo A ISO/IEC 27001:2022) Homologada",
    normative: "ABNT NBR ISO/IEC 27001:2022 Cláusula 6.1.3 'd' (93 Controles Anexo A)",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Diretoria Executiva + Gestor SecOps + Encarregado(a) DPO",
    summary: "Documento obrigatório de certificação ISO 27001 contendo os controles do Anexo A, status de implementação, justificativa de aplicabilidade e assinaturas da Direção.",
    buildBody: (ctx, custom = {}) => {
      const db = (typeof getStoredDB === "function") ? getStoredDB() : null;
      const controls = (db && Array.isArray(db.soaControls) && db.soaControls.length > 0) ? db.soaControls : [];
      const rows = controls.slice(0, 25).map(c => `
        <tr style="${custom.highlightCode === c.code ? 'background:#eff6ff; font-weight:bold;' : ''}">
          <td><code>${escapeDocHtml(c.code)}</code></td>
          <td>${escapeDocHtml(c.theme || c.category || "Anexo A")}</td>
          <td>${escapeDocHtml(c.title)}</td>
          <td>Sim</td>
          <td>${escapeDocHtml(c.status)}</td>
          <td>${escapeDocHtml(c.justification || "Aplicável ao escopo Sede e Canteiros da AC Engenharia.")}</td>
        </tr>
      `).join("");

      return `
        <h2>1. Escopo da Declaração de Aplicabilidade (Statement of Applicability — SoA)</h2>
        <p>A presente Declaração de Aplicabilidade (SoA) da <strong>${escapeDocHtml(ctx.company)}</strong> relaciona os controles normativos da <strong>ABNT NBR ISO/IEC 27001:2022 (Anexo A — 93 Controles distribuídos nos domínios A.5 Organizacional, A.6 Pessoas, A.7 Físico e A.8 Tecnológico)</strong> necessários ao tratamento dos riscos identificados no Escritório Central (Matriz) e nos Canteiros de Obras.</p>

        <h2>2. Quadro de Controles Selecionados e Justificativas de Aplicabilidade</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th width="9%">Código</th>
              <th width="14%">Domínio</th>
              <th width="27%">Controle ISO/IEC 27001:2022</th>
              <th width="8%">Aplic.</th>
              <th width="15%">Status Atual</th>
              <th width="27%">Justificativa de Inclusão</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="6">Catálogo de 93 controles Anexo A carregado no painel interativo do SGSI.</td></tr>`}
          </tbody>
        </table>
        <p class="muted">* O inventário completo dos 93 controles do Anexo A encontra-se sincronizado em tempo real no banco de dados PostgreSQL do SGSI da AC Engenharia.</p>

        ${buildSignatureGridHTML([
          { role: "Diretoria Executiva — AC Engenharia (Aprovação SoA)", name: ctx.directorName },
          { role: "Gestor de T.I. & SecOps (Responsável Técnico)", name: ctx.secopsName },
          { role: "Encarregado(a) de Proteção de Dados (DPO)", name: ctx.dpoName }
        ], false, "MOD-RSK-02")}
      `;
    }
  },

  // --------------------------------------------------------------------------
  // MÓDULO 08: PRIVACIDADE & LGPD (DPA, LEADS, DSAR, RIPD)
  // --------------------------------------------------------------------------
  {
    code: "MOD-LGP-01",
    module: "lgpd",
    docType: "Aditivo Contratual (DPA)",
    requiresSignature: true,
    title: "Acordo de Processamento e Proteção de Dados Pessoais — Aditivo DPA (Empreiteiras e Fornecedores)",
    normative: "LGPD Arts. 7º, 39, 42 e 46 & ISO/IEC 27001 A.5.19 / A.5.20",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Controladora (AC Engenharia) + Operadora Contratada + DPO + 2 Testemunhas",
    summary: "Contrato aditivo obrigatório para empreiteiras de obra, clínicas de SST/ASO, contabilidade e provedores SaaS que tratam dados pessoais em nome da AC Engenharia.",
    includeWitnesses: true,
    buildBody: (ctx, custom = {}) => `
      <h2>1. Qualificação das Partes Contratantes</h2>
      <table class="data-table">
        <tr>
          <td width="50%"><strong>CONTROLADORA:</strong> ${escapeDocHtml(ctx.company)} (CNPJ ${escapeDocHtml(ctx.cnpj)})</td>
          <td width="50%"><strong>OPERADORA CONTRATADA:</strong> ${escapeDocHtml(custom.operatorName || "______________________________________")}</td>
        </tr>
        <tr>
          <td><strong>Serviço Objeto do Contrato Principal:</strong> ${escapeDocHtml(custom.service || "___________________________")}</td>
          <td><strong>Vigência / Validade DPA:</strong> ${escapeDocHtml(custom.validity || "Vinculada ao Contrato Principal")}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Categorias de Dados Pessoais Compartilhados:</strong> ${escapeDocHtml(custom.dataShared || "Nome, CPF, função, registros trabalhistas/SST (NR-18/eSocial) ou dados cadastrais estritamente necessários à execução contratual.")}</td>
        </tr>
      </table>

      <h2>2. Cláusulas Vinculantes de Proteção de Dados e Segurança (Arts. 39 e 46 LGPD)</h2>
      <ol>
        <li><strong>Observância às Instruções da Controladora:</strong> A OPERADORA realizará o tratamento dos dados pessoais única e exclusivamente para cumprir as finalidades estritas do contrato firmado com a CONTROLADORA (<strong>${escapeDocHtml(ctx.company)}</strong>), sendo terminantemente vedado qualquer uso para fins próprios, comerciais ou compartilhamento externo.</li>
        <li><strong>Medidas Técnicas e Administrativas (Art. 46):</strong> A OPERADORA obriga-se a manter controle de acesso individualizado, senhas fortes/MFA, antivírus/EDR atualizado, guarda trancada de prontuários físicos/ASOs e confidencialidade formal (NDA) com todos os seus prepostos.</li>
        <li><strong>Subcontratação (Quarteirização):</strong> A OPERADORA não poderá subcontratar outro operador para tratar dados da CONTROLADORA sem autorização prévia e por escrito desta, exigindo-se o mesmo padrão protetivo.</li>
        <li><strong>Notificação de Incidentes em 24 Horas:</strong> Qualquer acesso não autorizado, perda, extravio ou vazamento envolvendo dados vinculados à obra ou à sede deverá ser comunicado formalmente ao DPO da CONTROLADORA (<strong>${escapeDocHtml(ctx.dpoEmail)}</strong>) no prazo máximo de <strong>24 (vinte e quatro) horas</strong>, viabilizando o prazo regulatório da ANPD.</li>
        <li><strong>Cooperação em Direitos de Titulares, Auditoria e Descarte:</strong> A OPERADORA auxiliará prontamente no atendimento a demandas DSAR (Art. 18), franqueará evidências de conformidade mediante solicitação e eliminará/devolverá integralmente os dados ao término do contrato, ressalvadas obrigações legais (Art. 16 LGPD).</li>
        <li><strong>Responsabilidade Solidária e Direito de Regresso (Art. 42, § 1º, I):</strong> A OPERADORA responderá integralmente por danos patrimoniais, morais ou sanções administrativas a que der causa por descumprimento da LGPD ou das instruções lícitas da CONTROLADORA.</li>
      </ol>

      ${buildSignatureGridHTML([
        { role: "Pela CONTROLADORA — AC Engenharia", name: ctx.directorName },
        { role: "Pela OPERADORA CONTRATADA — Representante Legal", name: custom.operatorName || "" },
        { role: "Visto Jurídico / Encarregado(a) de Dados (DPO)", name: ctx.dpoName }
      ], true, "MOD-LGP-01")}
    `
  },
  {
    code: "MOD-LGP-02",
    module: "lgpd",
    docType: "Aditivo Comercial / NDA",
    requiresSignature: true,
    title: "Termo Aditivo de Confidencialidade e Não Repasse de Leads Imobiliários (PCOM-003)",
    normative: "LGPD Arts. 7º, 9º e 42 (Prevenção Precedente Jurisprudencial Cyrela)",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "AC Engenharia + Imobiliária / Corretor CRECI + 2 Testemunhas",
    summary: "Protege os estandes de vendas e o CV CRM: proíbe expressamente corretores e imobiliárias de repassarem contatos de compradores para arquitetos, marcenarias, consórcios ou bancos.",
    includeWitnesses: true,
    buildBody: (ctx) => `
      <h2>1. Qualificação do Parceiro Comercial Credenciado</h2>
      <table class="data-table">
        <tr>
          <td width="60%"><strong>Imobiliária / Corretor(a) Autônomo(a):</strong> ______________________________________</td>
          <td width="40%"><strong>CNPJ / CPF &amp; CRECI:</strong> ________________________</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Empreendimentos / Estandes Vinculados:</strong> Todos os lançamentos e plantões comerciais geridos no CV (Construtor de Vendas CRM) da <strong>${escapeDocHtml(ctx.company)}</strong>.</td>
        </tr>
      </table>

      <h2>2. Obrigações Estritas sobre Leads e Cadastros de Adquirentes (Política PCOM-003)</h2>
      <ol>
        <li><strong>Finalidade Única de Intermediação:</strong> Os dados pessoais, documentos de renda, FGTS e simulações habitacionais inseridos no <strong>CV CRM</strong> pertencem à esfera de controle da <strong>${escapeDocHtml(ctx.company)}</strong> e destinam-se exclusivamente à prospecção e formalização da compra da unidade autônoma solicitada pelo cliente.</li>
        <li><strong>Vedação Absoluta de Repasse Lateral ("Cláusula Anti-Cyrela"):</strong> É <strong>expressamente proibido</strong> exportar planilhas, fotografar telas ou fornecer nome, telefone, e-mail ou unidade adquirida pelo cliente a empresas terceiras — tais como escritórios de arquitetura, lojas de móveis planejados/marcenaria, fornecedores de acabamento, seguradoras ou instituições financeiras não integrantes da operação — sem consentimento prévio, livre, específico e destacado colhido pela própria <strong>${escapeDocHtml(ctx.company)}</strong>.</li>
        <li><strong>Atendimento a Opt-Out (Art. 18 LGPD):</strong> Caso o potencial comprador solicite o descadastramento de contatos promocionais, o corretor deverá registrar imediatamente a solicitação no CV CRM ou encaminhá-la ao canal <strong>${escapeDocHtml(ctx.dpoEmail)}</strong>.</li>
        <li><strong>Cláusula Penal e Regresso Integral:</strong> A violação comprovada deste termo ensejará o descredenciamento imediato, multa contratual não compensatória e ressarcimento regressivo integral de quaisquer condenações judiciais ou sanções da ANPD impostas à <strong>${escapeDocHtml(ctx.company)}</strong>.</li>
      </ol>

      ${buildSignatureGridHTML([
        { role: "Controladora — AC Engenharia", name: ctx.directorName },
        { role: "Imobiliária Parceira / Corretor(a) Credenciado(a)", name: "", docLabel: "CPF/CNPJ e Registro CRECI: ________________________" }
      ], true, "MOD-LGP-02")}
    `
  },
  {
    code: "MOD-LGP-03",
    module: "lgpd",
    docType: "Certidão Oficial DSAR",
    requiresSignature: true,
    title: "Certidão e Resposta Oficial de Atendimento aos Direitos do Titular — DSAR (Prazo 15 Dias)",
    normative: "LGPD Arts. 18, 19, II e Art. 16, I c/c Código Civil Art. 618 (Garantia Decenal)",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Encarregado(a) pelo Tratamento de Dados (DPO)",
    summary: "Resposta formal timbrada entregue ao titular em até 15 dias (confirmação, acesso, correção, revogação ou justificativa legal de retenção obrigatória fiscal/trabalhista/decenal).",
    buildBody: (ctx, custom = {}) => `
      <h2>1. Dados do Requerimento do Titular (Protocolo DSAR)</h2>
      <table class="data-table">
        <tr>
          <td width="35%"><strong>Protocolo:</strong> ${escapeDocHtml(custom.id || "DSAR-202___-___")}</td>
          <td width="35%"><strong>Data de Abertura:</strong> ${escapeDocHtml(custom.openDate || "____/____/202___")}</td>
          <td width="30%"><strong>Status SLA (15d):</strong> ${escapeDocHtml(custom.status || "Atendido no Prazo")}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Titular Requerente (Identidade Validada):</strong> ${escapeDocHtml(custom.holder || "________________________________________")}</td>
          <td><strong>Direito Art. 18:</strong> ${escapeDocHtml(custom.type || "Acesso / Eliminação")}</td>
        </tr>
      </table>

      <h2>2. Declaração Completa sobre o Tratamento e Providência Adotada (Art. 19, II LGPD)</h2>
      <p>Em atenção ao requerimento formalizado perante o Canal de Privacidade da <strong>${escapeDocHtml(ctx.company)}</strong>, certificamos para os devidos fins legais:</p>
      <ul>
        <li><strong>Sistemas Consultados:</strong> ERP Sienge (Contratos, Financeiro e RH), CV CRM (Comercial/Estandes), Repositório de Canteiros/Catracas NR-18 e Arquivos Jurídicos.</li>
        <li><strong>Providência Executada:</strong> <br/>
          [ &nbsp; ] Fornecido relatório completo de confirmação, origem, finalidade, bases legais e compartilhamentos realizados.<br/>
          [ &nbsp; ] Executada a retificação/atualização cadastral ou revogação de opt-in promocional no CV CRM.<br/>
          [ &nbsp; ] Executada a eliminação definitiva de dados tratados sob consentimento ou legítimo interesse.<br/>
          [ &nbsp; ] <strong>Retenção Legal Obrigatória Parcial/Total (Art. 16, I da LGPD):</strong> Mantidos em arquivo restrito e bloqueado para uso comercial apenas os registros exigidos por lei (Prazo prescricional trabalhista/NR-07 de até 20 anos para ASOs, obrigação tributária de 5 anos ou garantia construtiva/documental do Art. 618 do Código Civil).
        </li>
      </ul>
      <p><strong>Parecer Específico do Caso:</strong> ${escapeDocHtml(custom.notes || "____________________________________________________________________________________")}</p>

      ${buildSignatureGridHTML([
        { role: "Encarregado(a) pelo Tratamento de Dados Pessoais (DPO) — AC Engenharia", name: ctx.dpoName, docLabel: `Canal Oficial: ${ctx.dpoEmail}` }
      ], false, "MOD-LGP-03")}
    `
  },
  {
    code: "MOD-LGP-04",
    module: "lgpd",
    docType: "Relatório Oficial (RIPD)",
    requiresSignature: true,
    title: "Relatório de Impacto à Proteção de Dados Pessoais (RIPD / DPIA — Art. 38 da LGPD)",
    normative: "Lei nº 13.709/2018 (LGPD) Arts. 5º, XVII, 11 e 38 & Guia ANPD",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Encarregado(a) DPO + Gestor SecOps + Diretoria Executiva",
    summary: "Avaliação aprofundada dos tratamentos de alto risco da AC Engenharia (Biometria facial em canteiros NR-18, prontuários ASO e leads comerciais no CV CRM) com medidas mitigadoras.",
    buildBody: (ctx) => `
      <h2>1. Identificação dos Processos de Tratamento de Alto Risco Avaliados</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th>Operação de Tratamento</th>
            <th>Dados Pessoais Envolvidos</th>
            <th>Base Legal LGPD</th>
            <th>Nível de Risco Residual</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Controle de Acesso Biométrico nos Canteiros de Obras</td>
            <td>Biometria facial (dado sensível), nome, CPF, função</td>
            <td>Art. 11, II, 'a' e 'g' (NR-18 e Prevenção à Fraude)</td>
            <td>Baixo (Mitigado)</td>
          </tr>
          <tr>
            <td>Captação de Leads e Dossiês de Financiamento Imobiliário</td>
            <td>Nome, CPF, renda familiar, IRPF, extratos, FGTS</td>
            <td>Art. 7º, I (Consentimento) e V (Contrato)</td>
            <td>Baixo (Mitigado)</td>
          </tr>
          <tr>
            <td>Gestão de Saúde e Segurança do Trabalho (PCMSO / ASO)</td>
            <td>Exames clínicos ocupacionais e aptidão física</td>
            <td>Art. 11, II, 'a' (Obrigação Legal NR-07)</td>
            <td>Baixo (Mitigado)</td>
          </tr>
        </tbody>
      </table>

      <h2>2. Salvaguardas Técnicas e Administrativas Implementadas pela AC Engenharia</h2>
      <ol>
        <li>Isolamento de rede dos terminais biométricos na VLAN 30, armazenamento exclusivo de hash matemático irreversível e rotina obrigatória de expurgo pós-Habite-se (MOD-OBR-02);</li>
        <li>Assinatura obrigatória do Aditivo Anti-Repasse de Leads (MOD-LGP-02) por 100% dos corretores e imobiliárias credenciadas no CV CRM;</li>
        <li>Criptografia de disco BitLocker em notebooks, bloqueio de portas USB via GPO e monitoramento contínuo 24×7 pelo SIEM Wazuh.</li>
      </ol>

      <h2>3. Parecer Conclusivo do(a) Encarregado(a) de Dados (DPO)</h2>
      <p>Conclui-se que os tratamentos avaliados observam os princípios da finalidade, adequação, necessidade e segurança (Art. 6º da LGPD), encontrando-se os riscos residuais devidamente mitigados e aceitos pela Diretoria da <strong>${escapeDocHtml(ctx.company)}</strong>.</p>

      ${buildSignatureGridHTML([
        { role: "Elaboração e Parecer — Encarregado(a) de Dados (DPO)", name: ctx.dpoName },
        { role: "Validação de Controles Técnicos — Gestor SecOps", name: ctx.secopsName },
        { role: "Aprovação do Controlador — Diretoria AC Engenharia", name: ctx.directorName }
      ], false, "MOD-LGP-04")}
    `
  },
  {
    code: "MOD-LGP-05",
    module: "lgpd",
    docType: "Termo para Assinatura",
    requiresSignature: true,
    title: "Termo de Consentimento Livre e Esclarecido para Atendimento em Estande e Simulação de Crédito",
    normative: "LGPD Art. 7º, I e V, Art. 8º e Art. 9º (Transparência ao Comprador)",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Cliente / Visitante do Estande + Corretor Responsável",
    summary: "Coleta o consentimento destacado do potencial adquirente nos estandes da AC Engenharia para contato comercial no CV CRM e análise preliminar de financiamento habitacional.",
    buildBody: (ctx) => `
      <h2>1. Identificação do Titular (Visitante / Proponente Comprador)</h2>
      <table class="data-table">
        <tr>
          <td width="60%"><strong>Nome Completo:</strong> ______________________________________________________</td>
          <td width="40%"><strong>CPF:</strong> ___________________________</td>
        </tr>
        <tr>
          <td><strong>E-mail / WhatsApp:</strong> ___________________________________________________</td>
          <td><strong>Empreendimento de Interesse:</strong> _________________</td>
        </tr>
      </table>

      <h2>2. Manifestação Livre, Informada e Inequívoca de Consentimento (Art. 8º LGPD)</h2>
      <p>Ao assinar este termo, autorizo a <strong>${escapeDocHtml(ctx.company)}</strong> (Controladora) a registrar meus dados no sistema oficial <strong>CV (Construtor de Vendas CRM)</strong> para:</p>
      <p>[ &nbsp; ] <strong>1. Atendimento Comercial e Proposta Imobiliária:</strong> Envio de tabelas, plantas e simulações de financiamento referentes aos empreendimentos da AC Engenharia.<br/>
      [ &nbsp; ] <strong>2. Compromisso de Não Compartilhamento Externo:</strong> Estou ciente de que a AC Engenharia <strong>não repassa nem comercializa</strong> meus dados com empresas de decoração, marcenaria, arquitetura ou terceiros estranhos à negociação.</p>
      <p class="muted"><strong>Revogação Gratuita (Art. 8º, § 5º):</strong> Este consentimento pode ser revogado a qualquer momento mediante solicitação ao canal oficial do DPO: <strong>${escapeDocHtml(ctx.dpoEmail)}</strong>.</p>

      ${buildSignatureGridHTML([
        { role: "Titular dos Dados / Cliente Visitante", name: "" },
        { role: "Corretor(a) / Atendimento Comercial — AC Engenharia", name: "" }
      ], false, "MOD-LGP-05")}
    `
  },

  // --------------------------------------------------------------------------
  // MÓDULOS 09 & 10: EVIDÊNCIAS & AUDITORIA INTERNA FORENSE
  // --------------------------------------------------------------------------
  {
    code: "MOD-AUD-01",
    module: "audit",
    docType: "Relatório de Auditoria",
    requiresSignature: true,
    title: "Ata e Relatório de Auditoria Interna de Conformidade SGSI (ISO 27001:2022 & LGPD)",
    normative: "ABNT NBR ISO/IEC 27001:2022 Cláusula 9.2 & ISO 19011",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Auditor Líder Independente (SoD) + DPO / Representante da Direção",
    summary: "Relatório formal de auditoria interna independente avaliando os requisitos das Cláusulas 4 a 10, os 93 controles do SoA, canteiros de obras e a integridade da trilha SHA-256.",
    buildBody: (ctx) => `
      <h2>1. Escopo, Critérios e Independência da Auditoria (ISO 19011) — AC Engenharia</h2>
      <table class="data-table">
        <tr>
          <td width="50%"><strong>Período da Auditoria:</strong> ____/____/202___ a ____/____/202___</td>
          <td width="50%"><strong>Unidades Auditadas:</strong> Matriz + Canteiros: __________________</td>
        </tr>
        <tr>
          <td><strong>Auditor(a) Líder (Independente — SoD):</strong> _______________________</td>
          <td><strong>Critérios:</strong> ISO/IEC 27001:2022, SoA, PSI-001 e LGPD</td>
        </tr>
      </table>

      <h2>2. Verificação da Trilha Forense e Amostragem de Controles</h2>
      <p>Validação matemática da cadeia de blocos SHA-256 no módulo <em>Trilha de Auditoria</em>: [ &nbsp; ] <strong>100% ÍNTEGRA</strong> (Total de blocos verificados: _______).</p>

      <table class="data-table">
        <thead>
          <tr>
            <th width="14%">Ref. / Cláusula</th>
            <th width="22%">Classificação do Achado</th>
            <th width="44%">Descrição Objetiva da Evidência / Constatação</th>
            <th width="20%">Prazo Plano Corretivo</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>Cl. ___ / A.___</td><td>[ ] Conforme [ ] NC Maior [ ] NC Menor [ ] OM</td><td style="height:28px;"></td><td>____/____/202___</td></tr>
          <tr><td>Cl. ___ / A.___</td><td>[ ] Conforme [ ] NC Maior [ ] NC Menor [ ] OM</td><td style="height:28px;"></td><td>____/____/202___</td></tr>
          <tr><td>Cl. ___ / A.___</td><td>[ ] Conforme [ ] NC Maior [ ] NC Menor [ ] OM</td><td style="height:28px;"></td><td>____/____/202___</td></tr>
          <tr><td>LGPD Art. ___</td><td>[ ] Conforme [ ] NC Maior [ ] NC Menor [ ] OM</td><td style="height:28px;"></td><td>____/____/202___</td></tr>
        </tbody>
      </table>

      <h2>3. Conclusão da Auditoria Interna</h2>
      <p>[ &nbsp; ] SGSI da AC Engenharia conforme e eficaz, apto à análise crítica pela Direção / auditoria externa. &nbsp;&nbsp; [ &nbsp; ] Requer tratamento das Não Conformidades nos prazos pactuados.</p>

      ${buildSignatureGridHTML([
        { role: "Auditor(a) Líder Independente — ISO/IEC 27001", name: "" },
        { role: "Ciência dos Auditados — DPO / Diretoria AC Engenharia", name: ctx.dpoName }
      ], false, "MOD-AUD-01")}
    `
  },
  {
    code: "MOD-AUD-02",
    module: "evidence",
    docType: "Cadeia de Custódia",
    requiresSignature: true,
    title: "Termo de Cadeia de Custódia e Preservação de Evidência Digital Forense",
    normative: "ABNT NBR ISO/IEC 27037, ISO 27001 A.5.28 & CPP Arts. 158-A a 158-F",
    evidenceCategory: "SecOps & SIEM",
    signersSummary: "Perito / Coletor Técnico + Custodiante Receptor",
    summary: "Garante a admissibilidade jurídica e pericial na coleta de logs, imagens de disco, capturas de CFTV ou artefatos de incidentes, preservando o Hash SHA-256 original.",
    buildBody: (ctx) => `
      <h2>1. Identificação do Vestígio / Artefato Digital Coletado — AC Engenharia</h2>
      <table class="data-table">
        <tr>
          <td width="35%"><strong>ID da Evidência:</strong> EVID-_______</td>
          <td width="35%"><strong>Data/Hora da Coleta:</strong> ____/____/202___ ____:____</td>
          <td width="30%"><strong>Local:</strong> ${escapeDocHtml(ctx.activeUnit)}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Origem (Servidor / Hostname / Equipamento / Mídia):</strong> _______________________________</td>
          <td><strong>Tamanho:</strong> _____________</td>
        </tr>
        <tr>
          <td colspan="3"><strong>Hash Criptográfico SHA-256 Calculado no Ato da Coleta:</strong><br/><code>________________________________________________________________________</code></td>
        </tr>
      </table>

      <h2>2. Registro Cronológico de Transferência de Posse (Cadeia de Custódia)</h2>
      <table class="data-table">
        <thead>
          <tr>
            <th width="18%">Data / Hora</th>
            <th width="26%">Entregue Por (Nome/Cargo)</th>
            <th width="26%">Recebido Por (Nome/Cargo)</th>
            <th width="30%">Finalidade / Local de Guarda</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style="height:26px;">____/____ ____:____</td><td></td><td></td><td>Coleta inicial e selagem lógica SHA-256</td></tr>
          <tr><td style="height:26px;">____/____ ____:____</td><td></td><td></td><td>Guarda em cofre imutável / perícia</td></tr>
          <tr><td style="height:26px;">____/____ ____:____</td><td></td><td></td><td></td></tr>
        </tbody>
      </table>

      ${buildSignatureGridHTML([
        { role: "Responsável pela Coleta e Geração do Hash", name: ctx.secopsName },
        { role: "Custodiante Receptor / Homologação Forense", name: ctx.dpoName }
      ], false, "MOD-AUD-02")}
    `
  },
  {
    code: "MOD-AUD-03",
    module: "audit",
    docType: "Relatório RNC (Cl. 10.2)",
    requiresSignature: true,
    title: "Relatório de Não Conformidade (RNC), Análise de Causa Raiz e Ação Corretiva",
    normative: "ABNT NBR ISO/IEC 27001:2022 Cláusula 10.2 (Não Conformidade e Ação Corretiva)",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Responsável pela Área + Auditor / DPO + Gestor SecOps",
    summary: "Trata formalmente desvios apontados em auditorias ou incidentes, aplicando metodologia dos 5 Porquês, plano de ação corretiva e verificação de eficácia.",
    buildBody: (ctx) => `
      <h2>1. Registro do Desvio / Não Conformidade Identificada</h2>
      <table class="data-table">
        <tr>
          <td width="35%"><strong>Nº da RNC:</strong> RNC-202___-____</td>
          <td width="35%"><strong>Cláusula / Controle ISO:</strong> ____________</td>
          <td width="30%"><strong>Grau:</strong> [ ] Maior &nbsp;[ ] Menor</td>
        </tr>
        <tr>
          <td colspan="3"><strong>Descrição Objetiva da Não Conformidade:</strong> _____________________________________________________________________</td>
        </tr>
      </table>

      <h2>2. Análise de Causa Raiz (Metodologia dos 5 Porquês) e Ação Corretiva</h2>
      <table class="data-table">
        <tr><td width="28%"><strong>Causa Raiz Identificada:</strong></td><td>____________________________________________________________________________________</td></tr>
        <tr><td><strong>Ação de Contenção Imediata:</strong></td><td>____________________________________________________________________________________</td></tr>
        <tr><td><strong>Ação Corretiva Definitiva:</strong></td><td>____________________________________________________________________________________</td></tr>
        <tr><td><strong>Verificação de Eficácia:</strong></td><td>[ &nbsp; ] Eficaz — Não conformidade eliminada sem reincidência. (Data: ____/____/202___)</td></tr>
      </table>

      ${buildSignatureGridHTML([
        { role: "Gestor Responsável pela Ação Corretiva", name: ctx.secopsName },
        { role: "Verificação de Eficácia — Auditoria / DPO AC Engenharia", name: ctx.dpoName }
      ], false, "MOD-AUD-03")}
    `
  },
  {
    code: "MOD-AUD-04",
    module: "evidence",
    docType: "Certificado Forense",
    requiresSignature: true,
    title: "Certificado de Integridade Criptográfica da Trilha Forense (Merkle Hash Chain SHA-256)",
    normative: "ISO/IEC 27001:2022 A.8.15, A.5.28, RFC 3161 & Lei nº 14.063/2020",
    evidenceCategory: "SecOps & SIEM",
    signersSummary: "Administrador SecOps + Auditor Líder ISO 27001 + DPO",
    summary: "Atesta pericialmente que a cadeia de blocos de auditoria do SGSI da AC Engenharia encontra-se íntegra, sem adulteração retroativa de logs.",
    buildBody: (ctx) => {
      const db = (typeof getStoredDB === "function") ? getStoredDB() : null;
      const logs = (db && Array.isArray(db.auditLogs)) ? db.auditLogs : [];
      const latestHash = (logs.length > 0 && logs[0].hash) ? logs[0].hash : "1a8f9c0e27145b4686cf4e0060914e7b1e507746905a8f9c0e27145b4686cf4e";
      return `
        <h2>1. Sumário da Verificação Criptográfica da Trilha de Auditoria</h2>
        <p>Certificamos que a Trilha de Auditoria Forense da plataforma <strong>SGSI — ${escapeDocHtml(ctx.company)}</strong> foi submetida à recalculagem criptográfica completa via algoritmo <strong>SHA-256 encadeado (Merkle Chain)</strong>.</p>
        <table class="data-table">
          <tr>
            <td width="50%"><strong>Total de Blocos Verificados:</strong> ${logs.length} bloco(s)</td>
            <td width="50%"><strong>Status da Cadeia:</strong> 100% ÍNTEGRA E IMUTÁVEL</td>
          </tr>
          <tr>
            <td colspan="2"><strong>Hash SHA-256 do Último Bloco Homologado (Head):</strong><br/><code>${escapeDocHtml(latestHash)}</code></td>
          </tr>
        </table>

        ${buildSignatureGridHTML([
          { role: "Custodiante Criptográfico — T.I. & SecOps", name: ctx.secopsName },
          { role: "Homologação Pericial — DPO / Auditoria AC Engenharia", name: ctx.dpoName }
        ], false, "MOD-AUD-04")}
      `;
    }
  },
  {
    code: "MOD-SEC-08",
    module: "secops",
    docType: "Laudo Pericial & CSIRT",
    requiresSignature: true,
    title: "Relatório Técnico de Investigação de Login Suspeito e Tentativa de Invasão",
    normative: "ISO/IEC 27001:2022 A.5.24 a A.5.28 & Resolução CD/ANPD nº 15/2024",
    evidenceCategory: "Segurança & CSIRT",
    signersSummary: "Analista Investigador T.I. + Gestor SecOps + DPO (se notificado)",
    summary: "Laudo pericial e forense de rastreamento de tentativas de invasão e login anômalo (Active Directory, Sienge, CV CRM, Google Workspace), contendo telemetria de IP, validação de MFA, entrevista com o usuário e protocolo de resposta a incidentes da ANPD.",
    buildBody: (ctx, custom = {}) => {
      const incNum = custom.incidentNumber || "INC-SEG-202___-_________";
      const userTarget = custom.affectedUser || "[ Nome / E-mail do Colaborador Afetado ]";
      const sysTarget = custom.targetSystem || "Google Workspace / ERP Sienge / CV CRM";
      const ipOrigin = custom.originIp || "___.___.___.___ (Geolocalização a Auditar)";

      return `
        <h2>1. Identificação do Alerta e Vetor de Detecção</h2>
        <table class="data-table">
          <tr>
            <td width="30%"><strong>Protocolo do Incidente:</strong></td>
            <td><code>${escapeDocHtml(incNum)}</code></td>
          </tr>
          <tr>
            <td><strong>Data e Hora da Detecção:</strong></td>
            <td>Data: ${escapeDocHtml(ctx.todayBr)} às ${escapeDocHtml(ctx.nowBr.split(" ")[1] || "___:___")} h (Horário de Brasília)</td>
          </tr>
          <tr>
            <td><strong>Origem Primária do Alerta:</strong></td>
            <td>[ &nbsp; ] SIEM / Log Centralizado &nbsp;&nbsp;&nbsp; [ &nbsp; ] Google Workspace Alert Center &nbsp;&nbsp;&nbsp; [ &nbsp; ] EDR / Antivírus Corporativo<br/>
                [ &nbsp; ] Notificação Espontânea do Usuário &nbsp;&nbsp;&nbsp; [ &nbsp; ] Alerta de Firewall/VPN Fortigate &nbsp;&nbsp;&nbsp; [ &nbsp; ] Auditoria Automática</td>
          </tr>
          <tr>
            <td><strong>Conta e Login Afetados:</strong></td>
            <td><strong>${escapeDocHtml(userTarget)}</strong> &nbsp;|&nbsp; <strong>Lotação:</strong> ${escapeDocHtml(ctx.activeUnit)}</td>
          </tr>
          <tr>
            <td><strong>Sistema / Ativo Alvo:</strong></td>
            <td><strong>${escapeDocHtml(sysTarget)}</strong></td>
          </tr>
        </table>

        <h2>2. Análise Técnica Forense Preliminar (SecOps)</h2>
        <table class="data-table">
          <tr>
            <td width="30%"><strong>IP de Origem e Telemetria:</strong></td>
            <td><code>${escapeDocHtml(ipOrigin)}</code> &nbsp;|&nbsp; <strong>Detecção de Proxy/Tor/VPN:</strong> [ &nbsp; ] Sim &nbsp; [ &nbsp; ] Não</td>
          </tr>
          <tr>
            <td><strong>Dispositivo / User-Agent:</strong></td>
            <td>[ &nbsp; ] Windows 10/11 &nbsp;&nbsp; [ &nbsp; ] Android / iOS &nbsp;&nbsp; [ &nbsp; ] macOS / Linux &nbsp;&nbsp;|&nbsp; <strong>Homologado no MDM?</strong> [ &nbsp; ] Sim &nbsp; [ &nbsp; ] Não (BYOD)</td>
          </tr>
          <tr>
            <td><strong>Padrão da Tentativa:</strong></td>
            <td>[ &nbsp; ] Viagem Impossível (*Impossible Travel*) &nbsp;&nbsp;&nbsp; [ &nbsp; ] Força Bruta (*Brute-force*)<br/>
                [ &nbsp; ] Pulverização de Senha (*Password Spraying*) &nbsp;&nbsp;&nbsp; [ &nbsp; ] Roubo de Sessão / Token Replay</td>
          </tr>
          <tr>
            <td><strong>Status da Autenticação:</strong></td>
            <td>[ &nbsp; ] <strong>Tentativa Frustrada</strong> (Bloqueado) &nbsp;&nbsp;&nbsp; [ &nbsp; ] <strong>Login Efetuado com Sucesso</strong> (Sessão Estabelecida)</td>
          </tr>
          <tr>
            <td><strong>Validação do 2º Fator (MFA):</strong></td>
            <td>[ &nbsp; ] MFA Bloqueou o Acesso &nbsp;&nbsp;&nbsp; [ &nbsp; ] MFA Aprovado por Fadiga de Notificação (*Push Fatigue*)<br/>
                [ &nbsp; ] Código TOTP inserido &nbsp;&nbsp;&nbsp; [ &nbsp; ] Ausência de MFA na Conta (Não Conformidade PCA-002)</td>
          </tr>
          <tr>
            <td><strong>Trilha de Ações pós-Login:</strong></td>
            <td>[ &nbsp; ] Criação de regras de encaminhamento oculto no Gmail &nbsp;&nbsp;&nbsp; [ &nbsp; ] Download anômalo de arquivos/relatórios<br/>
                [ &nbsp; ] Tentativa de alteração bancária/PIX no Sienge &nbsp;&nbsp;&nbsp; [ &nbsp; ] Nenhuma ação hostil identificada antes da contenção</td>
          </tr>
        </table>

        <h2>3. Entrevista Técnica e Validação com o Usuário Titular</h2>
        <p>Questionário pericial aplicado pela equipe de T.I. para confirmação do contexto fático e exclusão de falsos positivos:</p>
        <table class="data-table">
          <thead>
            <tr>
              <th width="65%">Pergunta de Verificação Fática</th>
              <th width="15%">Resposta</th>
              <th width="20%">Observação / Justificativa</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1. Você realizou ou tentou realizar login no sistema indicado na data e horário registrados?</td>
              <td>[ &nbsp; ] SIM &nbsp; [ &nbsp; ] NÃO</td>
              <td>____________________</td>
            </tr>
            <tr>
              <td>2. Você estava em viagem, deslocamento ou utilizando conexões VPN particulares ou Wi-Fi público?</td>
              <td>[ &nbsp; ] SIM &nbsp; [ &nbsp; ] NÃO</td>
              <td>____________________</td>
            </tr>
            <tr>
              <td>3. Nas últimas 72 horas, você clicou em links de e-mail, WhatsApp ou SMS solicitando confirmação de senha?</td>
              <td>[ &nbsp; ] SIM &nbsp; [ &nbsp; ] NÃO</td>
              <td>____________________</td>
            </tr>
            <tr>
              <td>4. Você digitou credenciais corporativas em alguma página que não seja a tela oficial da AC Engenharia?</td>
              <td>[ &nbsp; ] SIM &nbsp; [ &nbsp; ] NÃO</td>
              <td>____________________</td>
            </tr>
            <tr>
              <td>5. Você recebeu notificações repetidas de aprovação (Push) no autenticador sem estar tentando logar?</td>
              <td>[ &nbsp; ] SIM &nbsp; [ &nbsp; ] NÃO</td>
              <td>____________________</td>
            </tr>
            <tr>
              <td>6. O acesso partiu de computador pessoal não homologado, celular particular ou de terceiros?</td>
              <td>[ &nbsp; ] SIM &nbsp; [ &nbsp; ] NÃO</td>
              <td>____________________</td>
            </tr>
            <tr>
              <td>7. Houve compartilhamento involuntário ou voluntário da sua senha com colegas ou estagiários?</td>
              <td>[ &nbsp; ] SIM &nbsp; [ &nbsp; ] NÃO</td>
              <td>____________________</td>
            </tr>
            <tr>
              <td>8. Houve contato telefônico de suposto 'suporte técnico' solicitando códigos de verificação?</td>
              <td>[ &nbsp; ] SIM &nbsp; [ &nbsp; ] NÃO</td>
              <td>____________________</td>
            </tr>
          </tbody>
        </table>

        <h2>4. Avaliação de Impacto e Medidas de Contenção Imediata</h2>
        <div class="callout callout-warning">
          <strong>Nível de Acesso da Conta Afetada:</strong><br/>
          [ &nbsp; ] Operacional de Canteiro &nbsp;&nbsp;&nbsp; [ &nbsp; ] Administrativo / Financeiro Sienge &nbsp;&nbsp;&nbsp; [ &nbsp; ] Comercial CV CRM (Dados de Clientes)<br/>
          [ &nbsp; ] RH / SST (Dados Pessoais Sensíveis / Biometria NR-18) &nbsp;&nbsp;&nbsp; [ &nbsp; ] Administrador de TI / Acesso Privilegiado
        </div>

        <p><strong>Ações Técnicas Imediatas Executadas pela T.I. / SecOps:</strong></p>
        <table class="data-table">
          <tr>
            <td>[ &nbsp; ] <strong>Reset Compulsório de Senha</strong> (Complexidade elevada)</td>
            <td>[ &nbsp; ] <strong>Revogação Global de Sessões</strong> (*Revoke Refresh Tokens*)</td>
          </tr>
          <tr>
            <td>[ &nbsp; ] <strong>Reconfiguração e Expurgo de MFA</strong> prévio</td>
            <td>[ &nbsp; ] <strong>Isolamento Lógico de Endpoint</strong> via EDR</td>
          </tr>
          <tr>
            <td>[ &nbsp; ] <strong>Varredura Forense Antimalware</strong> no computador</td>
            <td>[ &nbsp; ] <strong>Bloqueio de IP/ASN Hostil</strong> no Firewall Fortigate / WAF</td>
          </tr>
          <tr>
            <td>[ &nbsp; ] <strong>Auditoria de Regras de Encaminhamento</strong> de e-mail</td>
            <td>[ &nbsp; ] <strong>Suspensão Cautelar Provisória</strong> da Conta</td>
          </tr>
        </table>
        <p><strong>Término da Contenção:</strong> ___/___/202___ às ___:___ h &nbsp;|&nbsp; <strong>Tempo Total de Resposta (TTR):</strong> [ &nbsp; ] &lt; 30 min &nbsp;&nbsp; [ &nbsp; ] 30 min a 2h &nbsp;&nbsp; [ &nbsp; ] &gt; 2h</p>

        <h2>5. Conclusão Pericial, Governança e Enquadramento LGPD</h2>
        <table class="data-table">
          <tr>
            <td width="30%"><strong>Veredito Técnico:</strong></td>
            <td>
              [ &nbsp; ] <strong>FALSO POSITIVO:</strong> Acesso legítimo comprovado (usuário em viagem / VPN particular).<br/>
              [ &nbsp; ] <strong>TENTATIVA FRUSTRADA:</strong> Atacante bloqueado pelo perímetro/MFA sem acesso a dados.<br/>
              [ &nbsp; ] <strong>INCIDENTE CONFIRMADO SEM EXFILTRAÇÃO:</strong> Conta violada e contida antes do vazamento.<br/>
              [ &nbsp; ] <strong>INCIDENTE CRÍTICO DE SEGURANÇA:</strong> Comprometimento de dados pessoais de titulares.
            </td>
          </tr>
          <tr>
            <td><strong>Acionamento do DPO:</strong></td>
            <td>
              [ &nbsp; ] <strong>NÃO REQUER ACIONAMENTO DO DPO</strong> (Falso positivo ou tentativa frustrada sem risco residual).<br/>
              [ &nbsp; ] <strong>REQUER ACIONAMENTO IMEDIATO DO ENCARREGADO DE DADOS (DPO):</strong> Instaurar procedimento de crise conforme Resolução CD/ANPD nº 15/2024 para avaliação de notificação formal à ANPD no prazo de 3 (três) dias úteis.
            </td>
          </tr>
          <tr>
            <td><strong>Recomendações e Lições Aprendidas:</strong></td>
            <td>____________________________________________________________________________________________________<br/>
                ____________________________________________________________________________________________________</td>
          </tr>
        </table>

        ${buildSignatureGridHTML([
          { role: "Analista Técnico de T.I. / CSIRT Investigador", name: "" },
          { role: "Gestor Executivo de T.I. & SecOps", name: ctx.secopsName },
          { role: "Encarregado(a) de Dados (DPO) — Parecer Regulatório", name: ctx.dpoName }
        ], false, "MOD-SEC-08")}
      `;
    }
  },

  {
    code: "MOD-GOV-10",
    module: "raci",
    docType: "Termo de Custódia (ICP-Brasil)",
    requiresSignature: true,
    title: "Termo de Responsabilidade e Custódia de Certificado Digital (ICP-Brasil e-CNPJ / e-CPF)",
    normative: "Medida Provisória nº 2.200-2/2001, Lei nº 14.063/2020 & Art. 462 da CLT",
    evidenceCategory: "Privacidade & Contratos",
    signersSummary: "Colaborador Custodiante + Gestor Imediato + Gestor de T.I. & SecOps",
    summary: "Instrumento jurídico-corporativo de custódia e responsabilidade legal para uso de certificados digitais ICP-Brasil (e-CNPJ ou e-CPF, modelos A1 em arquivo e A3 em token físico/smartcard) da AC Engenharia, com instalação exclusiva pela T.I., escopo fiscal/SPED (ECD, ECF, EFD), cláusula de ressarcimento por extravio (CLT Art. 462) e protocolo de devolução.",
    buildBody: (ctx, custom = {}) => {
      const cType = custom.certType || "Certificado Digital e-CNPJ / e-CPF ICP-Brasil";
      const tokenAsset = custom.tokenAssetId || "Token Corporativo / Estação Homologada T.I.";
      const cValidity = custom.certValidity || "____ / ____ / 202___";
      const cScope = custom.certScope || "Transmissão SPED (ECD, ECF, EFD), Emissão de NF-e no Sienge e Conectividade Social ICP";

      return `
        <h2>1. Qualificação das Partes e do Ativo Criptográfico</h2>
        <table class="data-table">
          <tr>
            <td width="30%"><strong>Empregador / Controlador:</strong></td>
            <td><strong>${escapeDocHtml(ctx.companyLegal)}</strong> &nbsp;|&nbsp; <strong>CNPJ:</strong> ${escapeDocHtml(ctx.cnpj)} &nbsp;|&nbsp; <strong>Sede:</strong> Aracaju/SE</td>
          </tr>
          <tr>
            <td><strong>Colaborador(a) Custodiante:</strong></td>
            <td>Nome: <strong>${escapeDocHtml(custom.signerName || "[ Nome Completo do Colaborador Custodiante ]")}</strong> &nbsp;|&nbsp; CPF: ___________________________<br/>
                Cargo: ____________________________________ &nbsp;|&nbsp; Setor: _________________________________</td>
          </tr>
          <tr>
            <td><strong>Especificação do Certificado:</strong></td>
            <td><strong>${escapeDocHtml(cType)}</strong><br/>
                Titularidade: [ &nbsp; ] AC Engenharia Ltda (e-CNPJ) &nbsp;&nbsp;&nbsp; [ &nbsp; ] Procurador / Representante Legal (e-CPF)<br/>
                Formato: [ &nbsp; ] Arquivo A1 (Instalação exclusiva T.I.) &nbsp;&nbsp;&nbsp; [ &nbsp; ] Token USB Físico A3 &nbsp;&nbsp;&nbsp; [ &nbsp; ] Nuvem Corporativa</td>
          </tr>
          <tr>
            <td><strong>Identificação do Token / Máquina:</strong></td>
            <td><strong>${escapeDocHtml(tokenAsset)}</strong> &nbsp;|&nbsp; <strong>Validade do Certificado:</strong> <strong>${escapeDocHtml(cValidity)}</strong></td>
          </tr>
        </table>

        <h2>2. Finalidade Estrita e Alçadas de Uso Autorizadas</h2>
        <p>A custódia do certificado digital é outorgada em caráter <strong>precário, estritamente funcional, pessoal e intransferível</strong> para as seguintes atividades:</p>
        <div class="callout callout-info">
          <strong>Escopo Autorizado Homologado:</strong> ${escapeDocHtml(cScope)}<br/>
          [ &nbsp; ] <strong>Transmissão de Declarações e Escriturações à Receita Federal (SPED):</strong> Envio de obrigações contábeis e fiscais pelos programas oficiais: <strong>ECD</strong> (Escrituração Contábil Digital), <strong>ECF</strong> (Escrituração Contábil Fiscal) e <strong>EFD</strong> (EFD-Reinf, EFD-Contribuições e EFD ICMS/IPI).<br/>
          [ &nbsp; ] <strong>Emissão e Transmissão de Notas Fiscais Eletrônicas (NF-e/NFS-e):</strong> Faturamento e medições no ERP Sienge.<br/>
          [ &nbsp; ] <strong>Conectividade Social ICP / FGTS (Caixa Econômica Federal):</strong> Movimentação de operários e canteiros NR-18.<br/>
          [ &nbsp; ] <strong>Centro Virtual de Atendimento da Receita Federal (e-CAC) e eSocial:</strong> Gestão previdenciária e fiscal.<br/>
          [ &nbsp; ] <strong>Assinatura Eletrônica Qualificada de Contratos:</strong> Contratos imobiliários (CV CRM) e de empreiteiras.
        </div>

        <h2>3. Declarações e Obrigações Legais do Custodiante (Ciência Obrigatória)</h2>
        <p>O Colaborador declara ter lido e estar de pleno acordo com as seguintes obrigações:</p>
        <table class="data-table">
          <tr>
            <td width="5%">[ &nbsp; ]</td>
            <td><strong>CLÁUSULA 1ª — EFICÁCIA LEGAL PLENA (EQUIPARAÇÃO À FIRMA RECONHECIDA):</strong> Declaro ciência de que a assinatura digital ICP-Brasil possui validade jurídica plena e eficácia probatória idêntica ao reconhecimento de firma de próprio punho em cartório (Art. 10 da MP nº 2.200-2/2001 e Lei 14.063/2020), vinculando irrevogavelmente a AC Engenharia.</td>
          </tr>
          <tr>
            <td>[ &nbsp; ]</td>
            <td><strong>CLÁUSULA 2ª — INSTALAÇÃO E CONFIGURAÇÃO TÉCNICA EXCLUSIVA PELA EQUIPE DE T.I.:</strong> A instalação, importação, parametrização, configuração de drivers e renovação do certificado digital (em formato de arquivo A1 ou token criptográfico A3) é de <strong>competência e responsabilidade exclusiva da equipe de T.I. & SecOps da AC Engenharia</strong>. É terminantemente proibido ao Colaborador tentar instalar o certificado por conta própria, transferi-lo para computadores não autorizados ou manipular as chaves sem acompanhamento técnico da T.I.</td>
          </tr>
          <tr>
            <td>[ &nbsp; ]</td>
            <td><strong>CLÁUSULA 3ª — PROIBIÇÃO DE CÓPIA, EXPORTAÇÃO E EXTRAÇÃO:</strong> Tratando-se de certificado formato A1, o arquivo é importado pela T.I. como não exportável na estação de trabalho autorizada, sendo terminantemente vedado copiar a chave privada para pendrives, mídias externas, e-mails pessoais ou nuvens particulares (Google Drive pessoal, Dropbox, WhatsApp, etc.).</td>
          </tr>
          <tr>
            <td>[ &nbsp; ]</td>
            <td><strong>CLÁUSULA 4ª — SIGILO INVIOLÁVEL DE SENHAS (PIN / PUK):</strong> Comprometo-me a manter senhas (PIN/PUK) sob sigilo rigoroso e pessoal, sendo vedado compartilhá-las com colegas de equipe, estagiários, terceiros ou gestores.</td>
          </tr>
          <tr>
            <td>[ &nbsp; ]</td>
            <td><strong>CLÁUSULA 5ª — GUARDA FÍSICA E CUIDADOS COM O TOKEN USB (A3):</strong> Tratando-se de token A3, comprometo-me a desconectá-lo da máquina ao me afastar da mesa de trabalho e guardá-lo em local trancado ao término do expediente, nunca deixando o dispositivo plugado sem vigilância.</td>
          </tr>
          <tr>
            <td>[ &nbsp; ]</td>
            <td><strong>CLÁUSULA 6ª — PROIBIÇÃO ABSOLUTA DE USO PARTICULAR:</strong> É estritamente vedado utilizar o certificado digital corporativo para fins privados do colaborador (ex: declaração de IRPF pessoal, procurações particulares ou atos estranhos ao contrato de trabalho).</td>
          </tr>
          <tr>
            <td>[ &nbsp; ]</td>
            <td><strong>CLÁUSULA 7ª — COMUNICAÇÃO IMEDIATA EM CASO DE EXTRAVIO (REVOGAÇÃO):</strong> Em caso de perda, furto, quebra do token ou suspeita de vazamento de senha, comprometo-me a notificar a T.I. em até 1 (uma) hora para imediata revogação junto à Autoridade Certificadora.</td>
          </tr>
          <tr>
            <td>[ &nbsp; ]</td>
            <td><strong>CLÁUSULA 8ª — AUDITORIA E RASTREABILIDADE (ISO 27001):</strong> Todas as assinaturas e operações realizadas são monitoradas e auditadas em trilha forense imutável com carimbo temporal.</td>
          </tr>
        </table>

        <h2>4. Responsabilização Disciplinar e Custeio (CLT Art. 462 e 482)</h2>
        <div class="callout callout-danger">
          <p><strong>Sanções Trabalhistas e Penais:</strong> O descumprimento deste termo ou a cessão de senha a terceiros constitui <strong>falta grave passível de demissão por justa causa (Art. 482 da CLT)</strong>, sem prejuízo de responsabilização civil e persecução penal (Art. 299 e 154-A do Código Penal).</p>
          <p><strong>Ressarcimento de Despesas (Art. 462, § 1º da CLT):</strong> Em consonância com o Artigo 462, § 1º da CLT, em caso de dano físico, perda, extravio do token A3 ou inutilização por tentativas incorretas de PIN/PUK decorrente de negligência ou dolo comprovado, <strong>o valor integral de reposição do hardware e taxas cartorárias da Autoridade Certificadora será ressarcido pelo Colaborador à AC Engenharia</strong>, mediante desconto em folha ou rescisão.</p>
        </div>

        <h2>5. Termo de Encerramento de Custódia e Devolução (Offboarding)</h2>
        <p class="muted"><em>(Preenchido exclusivamente no desligamento do colaborador, expiração da validade ou mudança de setor)</em></p>
        <table class="data-table">
          <tr>
            <td width="30%"><strong>Motivo do Encerramento:</strong></td>
            <td>[ &nbsp; ] Desligamento da Empresa &nbsp;&nbsp;&nbsp; [ &nbsp; ] Mudança de Cargo &nbsp;&nbsp;&nbsp; [ &nbsp; ] Expiração &nbsp;&nbsp;&nbsp; [ &nbsp; ] Revogação Preventiva</td>
          </tr>
          <tr>
            <td><strong>Ações Técnicas da T.I.:</strong></td>
            <td>[ &nbsp; ] Token Físico A3 recolhido intacto &nbsp;&nbsp;&nbsp; [ &nbsp; ] Certificado A1 desinstalado e sanitizado do disco rígido<br/>
                [ &nbsp; ] Revogação homologada na Autoridade Certificadora &nbsp;|&nbsp; <strong>Protocolo AC:</strong> ________________________</td>
          </tr>
          <tr>
            <td><strong>Data e Assinaturas de Baixa:</strong></td>
            <td>Data: ____/____/202___ &nbsp;|&nbsp; Assinatura Colaborador: _____________________ &nbsp;|&nbsp; T.I. Receptor: _____________________</td>
          </tr>
        </table>

        ${buildSignatureGridHTML([
          { role: "Colaborador(a) Custodiante Declarador", name: "" },
          { role: "Gestor Imediato da Área Solicitante", name: "" },
          { role: "Gestor Executivo de T.I. & SecOps — AC Engenharia", name: ctx.secopsName }
        ], false, "MOD-GOV-10")}
      `;
    }
  }
];

// ============================================================================
// ESTADO E CONTROLADORES DA BIBLIOTECA DE MODELOS E VISUALIZAÇÃO A4
// ============================================================================

const TemplateHubState = {
  activeSubtab: "repo", // 'repo' | 'templates'
  moduleFilter: "todos",
  typeFilter: "todos",
  searchQuery: "",
  previewingCode: null,
  previewingCustomData: null
};

function getTemplateByCode(code) {
  return CORPORATE_DOCUMENT_TEMPLATES.find(t => t.code === code) || null;
}

function buildRenderedTemplateHTML(code, customData = {}, options = {}) {
  const tpl = getTemplateByCode(code);
  if (!tpl) return "";
  const ctx = Object.assign({}, getTemplateContextDefaults());
  const storedDoc = getStoredDocumentCustomData(code);
  const mergedCustom = Object.assign({}, storedDoc.fields || {}, customData || {});

  // Aplica signatários customizados salvos especificamente neste documento no contexto ctx
  if (Array.isArray(storedDoc.signers)) {
    storedDoc.signers.forEach((s) => {
      if (s && s.name && s.name.trim()) {
        const lowerRole = (s.role || "").toLowerCase();
        if (lowerRole.includes("diretor") || lowerRole.includes("controlador") || lowerRole.includes("c-level")) {
          ctx.directorName = s.name.trim();
          mergedCustom.directorName = s.name.trim();
        } else if (lowerRole.includes("dpo") || lowerRole.includes("encarregado")) {
          ctx.dpoName = s.name.trim();
          mergedCustom.dpoName = s.name.trim();
        } else if (lowerRole.includes("secops") || lowerRole.includes("t.i.") || lowerRole.includes("ti")) {
          ctx.secopsName = s.name.trim();
          mergedCustom.secopsName = s.name.trim();
        } else if (lowerRole.includes("engenheiro") || lowerRole.includes("obra")) {
          ctx.obraManagerName = s.name.trim();
          mergedCustom.engineer = s.name.trim();
        }
      }
    });
  }

  const activeObra = mergedCustom.obra || mergedCustom.obra_local;
  const bodyHtml = tpl.buildBody(ctx, mergedCustom);
  return buildCorporateDocumentHTML(tpl, bodyHtml, {
    unit: activeObra || ctx.activeUnit,
    forWord: Boolean(options.forWord)
  });
}

// Alterna entre Sub-aba 01 (Repositório de Evidências) e Sub-aba 02 (Biblioteca de Modelos)
function switchEvidenceSubtab(subtab) {
  TemplateHubState.activeSubtab = subtab;
  const repoView = document.getElementById("evidence-subtab-view-repo");
  const tplView = document.getElementById("evidence-subtab-view-templates");
  const btnRepo = document.getElementById("subtab-evidence-btn-repo");
  const btnTpl = document.getElementById("subtab-evidence-btn-templates");

  if (subtab === "templates") {
    if (repoView) repoView.classList.add("hidden");
    if (tplView) tplView.classList.remove("hidden");
    if (btnRepo) btnRepo.className = "px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";
    if (btnTpl) btnTpl.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#004b93] text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";
    renderDocumentTemplatesGrid();
  } else {
    if (tplView) tplView.classList.add("hidden");
    if (repoView) repoView.classList.remove("hidden");
    if (btnRepo) btnRepo.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#004b93] text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";
    if (btnTpl) btnTpl.className = "px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";
    if (typeof renderEvidenceModule === "function") renderEvidenceModule();
  }

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

// Abre a Biblioteca de Modelos já filtrada para um módulo específico a partir de qualquer tela
function openTemplatesForModule(moduleKey) {
  if (typeof closeModal === "function") {
    closeModal("modal-official-downloads");
  }
  TemplateHubState.moduleFilter = moduleKey || "todos";
  TemplateHubState.typeFilter = "todos";
  TemplateHubState.searchQuery = "";

  if (typeof switchTab === "function") {
    switchTab("evidence");
  }
  switchEvidenceSubtab("templates");

  const modSelect = document.getElementById("tpl-filter-module");
  const typeSelect = document.getElementById("tpl-filter-type");
  const searchInput = document.getElementById("tpl-filter-search");
  if (modSelect) modSelect.value = TemplateHubState.moduleFilter;
  if (typeSelect) typeSelect.value = "todos";
  if (searchInput) searchInput.value = "";

  renderDocumentTemplatesGrid();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function applyTemplateFilters() {
  const modSelect = document.getElementById("tpl-filter-module");
  const typeSelect = document.getElementById("tpl-filter-type");
  const searchInput = document.getElementById("tpl-filter-search");

  if (modSelect) TemplateHubState.moduleFilter = modSelect.value;
  if (typeSelect) TemplateHubState.typeFilter = typeSelect.value;
  if (searchInput) TemplateHubState.searchQuery = searchInput.value.toLowerCase().trim();

  renderDocumentTemplatesGrid();
}

function clearTemplateFilters() {
  TemplateHubState.moduleFilter = "todos";
  TemplateHubState.typeFilter = "todos";
  TemplateHubState.searchQuery = "";

  const modSelect = document.getElementById("tpl-filter-module");
  const typeSelect = document.getElementById("tpl-filter-type");
  const searchInput = document.getElementById("tpl-filter-search");
  if (modSelect) modSelect.value = "todos";
  if (typeSelect) typeSelect.value = "todos";
  if (searchInput) searchInput.value = "";

  renderDocumentTemplatesGrid();
}

function renderDocumentTemplatesGrid() {
  const grid = document.getElementById("doc-templates-grid");
  const countBadge = document.getElementById("doc-templates-count");
  if (!grid) return;

  const allSigs = getStoredTemplateSignatures();

  const filtered = CORPORATE_DOCUMENT_TEMPLATES.filter(t => {
    const matchMod = TemplateHubState.moduleFilter === "todos" || t.module === TemplateHubState.moduleFilter;
    let matchType = true;
    if (TemplateHubState.typeFilter === "assinatura") matchType = t.docType.includes("Termo") || t.docType.includes("Aditivo") || t.docType.includes("Portaria") || t.docType.includes("Política") || t.docType.includes("Diretriz") || t.docType.includes("Declaração");
    else if (TemplateHubState.typeFilter === "ata") matchType = t.docType.includes("Ata") || t.docType.includes("Relatório") || t.docType.includes("Plano");
    else if (TemplateHubState.typeFilter === "laudo") matchType = t.docType.includes("Laudo") || t.docType.includes("Checklist") || t.docType.includes("Cadeia") || t.docType.includes("Certidão") || t.docType.includes("Notificação") || t.docType.includes("Formulário") || t.docType.includes("Certificado");

    const q = TemplateHubState.searchQuery;
    const matchText = !q ||
      t.code.toLowerCase().includes(q) ||
      t.title.toLowerCase().includes(q) ||
      t.normative.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.signersSummary.toLowerCase().includes(q);

    return matchMod && matchType && matchText;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} de ${CORPORATE_DOCUMENT_TEMPLATES.length} Modelos Oficiais`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full card-white rounded-lg p-10 text-center border border-slate-200 space-y-2">
        <p class="text-sm font-bold text-slate-800">Nenhum modelo encontrado para este filtro</p>
        <p class="text-xs text-slate-500">Clique abaixo para exibir todos os ${CORPORATE_DOCUMENT_TEMPLATES.length} modelos corporativos da AC Engenharia.</p>
        <button onclick="clearTemplateFilters()" class="mt-2 px-3.5 py-1.5 rounded bg-[#004b93] text-white text-xs font-semibold cursor-pointer">Mostrar Todos os Modelos</button>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(t => {
    const sigList = Array.isArray(allSigs[t.code]) ? allSigs[t.code] : [];
    const sigBadge = sigList.length > 0
      ? `<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ ${sigList.length} Assinatura(s) SHA-256</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">${escapeDocHtml(t.docType)}</span>`;

    return `
    <div class="card-white rounded-lg p-4 border border-slate-200 hover:border-[#004b93]/60 transition-all flex flex-col justify-between gap-3 shadow-2xs">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0f2942] text-white">${escapeDocHtml(t.code)}</span>
            <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-[#004b93] border border-blue-200">${escapeDocHtml(TEMPLATE_MODULE_LABELS[t.module] || t.module)}</span>
            ${(() => {
              const cData = getStoredDocumentCustomData(t.code);
              const isCust = (cData.signers && cData.signers.some(s => s.name && s.name.trim())) || (cData.fields && Object.values(cData.fields).some(v => v && v.trim()));
              return isCust ? '<span class="px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">✓ Personalizado</span>' : '';
            })()}
          </div>
          ${sigBadge}
        </div>

        <h4 class="text-xs font-bold text-slate-900 leading-snug">${escapeDocHtml(t.title)}</h4>
        <p class="text-[11px] text-slate-600 leading-relaxed">${escapeDocHtml(t.summary)}</p>

        <div class="pt-1.5 space-y-1 text-[11px]">
          <div class="text-slate-500"><strong class="text-slate-700">Norma:</strong> <span class="font-mono text-[10px]">${escapeDocHtml(t.normative)}</span></div>
          <div class="text-slate-500"><strong class="text-slate-700">Assinaturas:</strong> ${escapeDocHtml(t.signersSummary)}</div>
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
        <div class="flex items-center gap-1.5 flex-wrap">
          <button type="button" onclick="previewCorporateTemplate('${t.code}')" class="px-2.5 py-1.5 rounded bg-[#0f2942] hover:bg-[#163a5c] text-white text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors" title="Visualizar documento formatado A4 e Imprimir / Salvar como PDF">
            <i data-lucide="printer" class="w-3.5 h-3.5"></i>
            <span>Ver / PDF</span>
          </button>
          <button type="button" onclick="openDocumentSignersModal('${t.code}')" class="px-2 py-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors" title="Preencher ou personalizar signatários e campos exclusivos deste modelo">
            <i data-lucide="sliders" class="w-3.5 h-3.5 text-slate-600"></i>
            <span>Campos</span>
          </button>
          <button type="button" onclick="openDigitalSignatureModal('${t.code}')" class="px-2.5 py-1.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors" title="Assinar eletronicamente este documento com Hash SHA-256">
            <i data-lucide="pen-tool" class="w-3.5 h-3.5 text-amber-700"></i>
            <span>Assinar</span>
          </button>
          <button type="button" onclick="downloadTemplateWord('${t.code}')" class="px-2.5 py-1.5 rounded bg-blue-50 hover:bg-blue-100 text-[#004b93] border border-blue-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors" title="Baixar versão editável para Microsoft Word / Google Docs (.doc)">
            <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
            <span>Word (.doc)</span>
          </button>
        </div>

        <button type="button" onclick="attachSignedTemplateAsEvidence('${t.code}')" class="px-2.5 py-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors" title="Arquivar documento assinado no Repositório com Hash SHA-256">
          <i data-lucide="upload" class="w-3 h-3"></i>
          <span>Anexar Evidência</span>
        </button>
      </div>
    </div>
  `;
  }).join("");

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

let isDocEditModeActive = false;

function toggleDocEditMode(forceState = null) {
  isDocEditModeActive = forceState !== null ? forceState : !isDocEditModeActive;
  const alertEl = document.getElementById("doc-edit-alert");
  const btn = document.getElementById("btn-toggle-doc-edit");
  const btnText = document.getElementById("btn-toggle-doc-edit-text");
  const iframe = document.getElementById("doc-preview-iframe");

  if (alertEl) {
    if (isDocEditModeActive) alertEl.classList.remove("hidden");
    else alertEl.classList.add("hidden");
  }

  if (btn) {
    if (isDocEditModeActive) {
      btn.className = "px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs ring-2 ring-emerald-300";
      if (btnText) btnText.textContent = "Concluir Edição";
    } else {
      btn.className = "px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs";
      if (btnText) btnText.textContent = "Preencher Nomes na Tela";
    }
  }

  if (iframe && iframe.contentDocument) {
    const doc = iframe.contentDocument;
    const sheet = doc.querySelector(".page-sheet") || doc.body;
    if (sheet) {
      sheet.contentEditable = isDocEditModeActive ? "true" : "false";
      if (isDocEditModeActive) {
        sheet.focus();
        if (window.showToast) {
          window.showToast("Modo de Edição Ativo: Clique nos campos do documento para digitar seus nomes e dados antes de imprimir ou baixar!", "info");
        }
      }
    }
  }
}

// Abre o Visualizador A4 Corporativo no navegador
function previewCorporateTemplate(code, customData = null) {
  const tpl = getTemplateByCode(code);
  if (!tpl) return;

  TemplateHubState.previewingCode = code;
  TemplateHubState.previewingCustomData = customData || {};
  isDocEditModeActive = false;

  const alertEl = document.getElementById("doc-edit-alert");
  const btn = document.getElementById("btn-toggle-doc-edit");
  const btnText = document.getElementById("btn-toggle-doc-edit-text");
  if (alertEl) alertEl.classList.add("hidden");
  if (btn) btn.className = "px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs";
  if (btnText) btnText.textContent = "Preencher Nomes na Tela";

  const html = buildRenderedTemplateHTML(code, TemplateHubState.previewingCustomData, { forWord: false, showStandaloneToolbar: false });
  const modal = document.getElementById("modal-doc-template-preview");
  const codeEl = document.getElementById("doc-preview-modal-code");
  const titleEl = document.getElementById("doc-preview-modal-title");
  const subEl = document.getElementById("doc-preview-modal-sub");
  const iframe = document.getElementById("doc-preview-iframe");

  if (codeEl) codeEl.textContent = tpl.code;
  if (titleEl) titleEl.textContent = tpl.title;
  if (subEl) subEl.textContent = `${tpl.normative} • Assinaturas: ${tpl.signersSummary}`;

  if (iframe) {
    iframe.srcdoc = html;
  }

  if (modal) {
    modal.classList.remove("hidden");
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }
}

function printPreviewedDocument() {
  const iframe = document.getElementById("doc-preview-iframe");
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  }
}

function downloadPreviewedWord() {
  if (!TemplateHubState.previewingCode) return;
  const tpl = getTemplateByCode(TemplateHubState.previewingCode);
  if (!tpl) return;

  const iframe = document.getElementById("doc-preview-iframe");
  let wordHtml = "";

  if (iframe && iframe.contentDocument) {
    const doc = iframe.contentDocument;
    const sheet = doc.querySelector(".page-sheet");
    if (sheet) {
      const clone = sheet.cloneNode(true);
      clone.removeAttribute("contenteditable");
      wordHtml = "\ufeff" + `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeDocHtml(tpl.code)} - ${escapeDocHtml(tpl.title)}</title>
  <style>
    @page Section1 { size: 595.3pt 841.9pt; margin: 38pt 40pt 40pt 40pt; }
    div.Section1 { page: Section1; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; color: #0f172a; margin: 0; padding: 0; font-size: 9.5pt; line-height: 1.55; }
    table.data-table { width: 100%; border-collapse: separate; border-spacing: 0; margin: 12px 0 16px 0; font-size: 9pt; border: 1px solid #cbd5e1; }
    table.data-table th { background: #f1f5f9; color: #0b1a30; font-weight: 700; text-align: left; padding: 7px 10px; border-bottom: 1.5px solid #94a3b8; }
    table.data-table td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; }
    h2 { font-size: 10pt; font-weight: 700; color: #0b1a30; background: #f8fafc; border-left: 3.5px solid #004b93; padding: 6px 12px; margin: 20px 0 10px 0; }
    .sig-grid { display: table; width: 100%; table-layout: fixed; margin-top: 14px; }
    .sig-box { display: inline-block; vertical-align: top; width: 48%; margin: 6px 1% 10px 0; padding: 12px 14px; border: 1px solid #cbd5e1; background: #ffffff; }
    .sig-line { border-bottom: 1.5px solid #0b1a30; height: 28px; margin-bottom: 8px; }
    .sig-role { font-weight: 700; font-size: 8.5pt; color: #0b1a30; }
    .sig-name, .sig-meta { font-size: 8pt; color: #334155; margin-top: 2px; }
    .doc-footer { margin-top: 24px; padding-top: 10px; border-top: 1.5px solid #cbd5e1; font-size: 8pt; color: #64748b; }
  </style>
</head>
<body>
  <div class="Section1">
    ${clone.innerHTML}
  </div>
</body>
</html>`;
    }
  }

  if (!wordHtml) {
    wordHtml = "\ufeff" + buildRenderedTemplateHTML(TemplateHubState.previewingCode, TemplateHubState.previewingCustomData || {}, { forWord: true });
  }

  const slug = sanitizeFileSlug(tpl.title);
  const fileName = `${tpl.code}-${slug}.doc`;
  if (typeof triggerDownloadFile === "function") {
    triggerDownloadFile(fileName, wordHtml, "application/msword;charset=utf-8");
  }
  if (window.showToast) {
    window.showToast(`Documento ${tpl.code} baixado para Word (.doc) com sucesso!`, "success");
  }
}

function attachPreviewedAsEvidence() {
  const code = TemplateHubState.previewingCode;
  if (typeof closeModal === "function") closeModal("modal-doc-template-preview");
  if (code) attachSignedTemplateAsEvidence(code);
}

function openDocumentSignersModal(docCode = null) {
  const targetCode = docCode || TemplateHubState.previewingCode || "MOD-OBR-01";
  const tpl = getTemplateByCode(targetCode);
  if (!tpl) return;

  const schema = (DOCUMENT_CUSTOM_FIELDS_SCHEMA && DOCUMENT_CUSTOM_FIELDS_SCHEMA[targetCode])
    ? DOCUMENT_CUSTOM_FIELDS_SCHEMA[targetCode]
    : { title: tpl.title, signers: [{ role: "Responsável pelo Documento", docLabel: "CPF / Registro", placeholder: "Ex: Nome Completo" }], fields: [] };

  const savedData = getStoredDocumentCustomData(targetCode);
  const savedSigners = Array.isArray(savedData.signers) ? savedData.signers : [];
  const savedFields = (savedData.fields && typeof savedData.fields === "object") ? savedData.fields : {};

  let modal = document.getElementById("modal-document-custom-fields");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-document-custom-fields";
    modal.className = "fixed inset-0 bg-slate-900/80 backdrop-blur-xs z-[75] flex items-center justify-center p-3 sm:p-5 hidden";
    document.body.appendChild(modal);
  }

  // Seletor dinâmico com todos os 40 modelos
  const modelOptionsHtml = CORPORATE_DOCUMENT_TEMPLATES.map(t => `
    <option value="${t.code}" ${t.code === targetCode ? "selected" : ""}>${escapeDocHtml(t.code)} — ${escapeDocHtml(t.title)}</option>
  `).join("");

  // Constrói campos de signatários específicos deste documento
  const signersHtml = schema.signers.map((s, idx) => {
    const curVal = savedSigners[idx] || {};
    const nameVal = curVal.name || "";
    const roleVal = curVal.role || s.role;
    const docVal = curVal.docLabel !== undefined ? curVal.docLabel : (s.docLabel || "");

    return `
      <div class="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 shadow-2xs space-y-2.5">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0f2942] text-white">Signatário ${idx + 1}</span>
            <span class="text-xs font-bold text-slate-800">${escapeDocHtml(s.role)}</span>
          </div>
          <span class="text-[10px] text-slate-500 font-mono">${escapeDocHtml(s.docLabel || "Documento")}</span>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          <div class="sm:col-span-5">
            <label class="block text-[11px] font-semibold text-slate-700 mb-0.5">Nome Completo do Signatário</label>
            <input type="text" id="doc-custom-signer-name-${idx}" value="${escapeDocHtml(nameVal)}" placeholder="${escapeDocHtml(s.placeholder || 'Ex: Nome Completo')}" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#004b93] focus:ring-1 focus:ring-[#004b93]" />
          </div>
          <div class="sm:col-span-4">
            <label class="block text-[11px] font-semibold text-slate-700 mb-0.5">Cargo / Função no Documento</label>
            <input type="text" id="doc-custom-signer-role-${idx}" value="${escapeDocHtml(roleVal)}" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#004b93] focus:ring-1 focus:ring-[#004b93]" />
          </div>
          <div class="sm:col-span-3">
            <label class="block text-[11px] font-semibold text-slate-700 mb-0.5">Registro / CPF / CREA</label>
            <input type="text" id="doc-custom-signer-doc-${idx}" value="${escapeDocHtml(docVal)}" placeholder="${escapeDocHtml(s.docLabel || 'CPF/CREA')}" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#004b93] focus:ring-1 focus:ring-[#004b93]" />
          </div>
        </div>
      </div>
    `;
  }).join("");

  // Constrói campos de metadados específicos se existirem
  let fieldsHtml = "";
  if (Array.isArray(schema.fields) && schema.fields.length > 0) {
    const fieldsInputs = schema.fields.map(f => {
      const val = savedFields[f.key] || "";
      return `
        <div>
          <label class="block text-[11px] font-bold text-slate-700 mb-1">${escapeDocHtml(f.label)}</label>
          <input type="text" id="doc-custom-field-${f.key}" value="${escapeDocHtml(val)}" placeholder="${escapeDocHtml(f.placeholder || '')}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#004b93] focus:ring-1 focus:ring-[#004b93]" />
        </div>
      `;
    }).join("");

    fieldsHtml = `
      <div class="space-y-2 pt-2 border-t border-slate-200">
        <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <i data-lucide="sliders" class="w-3.5 h-3.5 text-[#004b93]"></i>
          <span>Campos &amp; Metadados Específicos deste Modelo</span>
        </h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200">
          ${fieldsInputs}
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Cabeçalho Corporativo -->
      <div class="p-4 bg-[#0b1a30] text-white flex items-center justify-between shrink-0 border-b border-slate-800">
        <div class="flex items-center gap-2.5 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <i data-lucide="file-signature" class="w-4 h-4 text-emerald-400"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-emerald-600/30 text-emerald-300 border border-emerald-400/40">${escapeDocHtml(targetCode)}</span>
              <h3 class="text-xs sm:text-sm font-bold truncate">Preencher Campos &amp; Signatários</h3>
            </div>
            <p class="text-[11px] text-slate-300 truncate mt-0.5">${escapeDocHtml(tpl.title)}</p>
          </div>
        </div>
        <button type="button" onclick="closeModal('modal-document-custom-fields')" class="text-slate-300 hover:text-white cursor-pointer shrink-0 p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="Fechar (ESC)">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>

      <!-- Formulário com Rolagem -->
      <form onsubmit="handleSaveDocumentCustomData(event, '${escapeDocHtml(targetCode)}')" class="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
        <!-- Seletor de Modelo e Aviso de Isolamento -->
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <label class="font-bold text-slate-700 text-xs">Modelo Selecionado:</label>
            <select onchange="openDocumentSignersModal(this.value)" class="text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none focus:border-[#004b93]">
              ${modelOptionsHtml}
            </select>
          </div>

          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-start gap-2.5">
            <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"></i>
            <div class="space-y-0.5">
              <strong class="font-bold text-emerald-900">Isolamento Exclusivo por Documento:</strong>
              <p class="text-[11px] text-emerald-800 leading-snug">Ao salvar, os dados serão gravados <strong>exclusivamente no modelo ${escapeDocHtml(targetCode)}</strong>. Nenhum outro modelo do catálogo será alterado. Se preferir manter espaços em branco para assinatura manual com caneta ou digitação sob demanda, clique em <em>Deixar em Branco</em>.</p>
            </div>
          </div>
        </div>

        <!-- Seção: Signatários -->
        <div class="space-y-2.5">
          <div class="flex items-center justify-between">
            <h4 class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <i data-lucide="users" class="w-3.5 h-3.5 text-[#004b93]"></i>
              <span>Quadro de Signatários Oficiais de ${escapeDocHtml(targetCode)}</span>
            </h4>
            <span class="text-[10px] text-slate-500">${schema.signers.length} Signatário(s) Previsto(s)</span>
          </div>
          <div class="space-y-2">
            ${signersHtml}
          </div>
        </div>

        <!-- Seção: Campos Específicos -->
        ${fieldsHtml}

        <!-- Botões de Ação -->
        <div class="pt-3 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <button type="button" onclick="clearDocumentCustomData('${escapeDocHtml(targetCode)}')" class="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer text-xs flex items-center gap-1.5 transition-colors">
            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i>
            <span>Deixar em Branco (Espaços Abertos)</span>
          </button>
          <div class="flex items-center gap-2">
            <button type="button" onclick="closeModal('modal-document-custom-fields')" class="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer text-xs transition-colors">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer text-xs transition-colors">
              <i data-lucide="save" class="w-4 h-4"></i>
              <span>Salvar apenas em ${escapeDocHtml(targetCode)}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  `;

  modal.classList.remove("hidden");
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function handleSaveDocumentCustomData(e, docCode) {
  if (e && e.preventDefault) e.preventDefault();
  if (!docCode) return;

  const schema = (DOCUMENT_CUSTOM_FIELDS_SCHEMA && DOCUMENT_CUSTOM_FIELDS_SCHEMA[docCode])
    ? DOCUMENT_CUSTOM_FIELDS_SCHEMA[docCode]
    : { signers: [], fields: [] };

  const signers = [];
  schema.signers.forEach((s, idx) => {
    const nameEl = document.getElementById(`doc-custom-signer-name-${idx}`);
    const roleEl = document.getElementById(`doc-custom-signer-role-${idx}`);
    const docEl = document.getElementById(`doc-custom-signer-doc-${idx}`);

    signers.push({
      name: nameEl ? nameEl.value.trim() : "",
      role: roleEl ? roleEl.value.trim() : s.role,
      docLabel: docEl ? docEl.value.trim() : s.docLabel
    });
  });

  const fields = {};
  if (Array.isArray(schema.fields)) {
    schema.fields.forEach(f => {
      const fieldEl = document.getElementById(`doc-custom-field-${f.key}`);
      if (fieldEl) {
        fields[f.key] = fieldEl.value.trim();
      }
    });
  }

  const customDocData = {
    docCode,
    signers,
    fields,
    updatedAt: new Date().toISOString()
  };

  saveStoredDocumentCustomData(docCode, customDocData);

  if (typeof closeModal === "function") {
    closeModal("modal-document-custom-fields");
  }

  // Se este documento estiver sendo visualizado no iframe, re-renderiza imediatamente com as novas informações!
  if (TemplateHubState.previewingCode === docCode) {
    previewCorporateTemplate(docCode, TemplateHubState.previewingCustomData || {});
  }

  renderDocumentTemplatesGrid();

  if (window.showToast) {
    window.showToast(`Campos e signatários salvos com sucesso EXCLUSIVAMENTE no documento ${docCode}!`, "success");
  }
}

function clearDocumentCustomData(docCode) {
  if (!docCode) return;
  clearStoredDocumentCustomData(docCode);

  if (typeof closeModal === "function") {
    closeModal("modal-document-custom-fields");
  }

  if (TemplateHubState.previewingCode === docCode) {
    previewCorporateTemplate(docCode, TemplateHubState.previewingCustomData || {});
  }

  renderDocumentTemplatesGrid();

  if (window.showToast) {
    window.showToast(`Documento ${docCode} restaurado para o padrão original (espaços em branco).`, "info");
  }
}

// Compatibilidade retroativa para chamadas antigas
function openCorporateSignersModal(docCode = null) {
  openDocumentSignersModal(docCode || TemplateHubState.previewingCode || "MOD-OBR-01");
}

function handleSaveCorporateSigners(e) {
  handleSaveDocumentCustomData(e, TemplateHubState.previewingCode || "MOD-OBR-01");
}

function clearCorporateSigners() {
  clearDocumentCustomData(TemplateHubState.previewingCode || "MOD-OBR-01");
}

// MOTOR DE ASSINATURA ELETRÔNICA E CARIMBO CRIPTOGRÁFICO SHA-256
// ============================================================================

function openDigitalSignatureModal(code = null) {
  const targetCode = code || TemplateHubState.previewingCode || "MOD-GOV-03";
  TemplateHubState.previewingCode = targetCode;
  const tpl = getTemplateByCode(targetCode);
  const ctx = getTemplateContextDefaults();

  let modal = document.getElementById("modal-digital-signature");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "modal-digital-signature";
    modal.className = "fixed inset-0 bg-slate-900/75 backdrop-blur-xs z-[60] flex items-center justify-center p-4 hidden";
    modal.innerHTML = `
      <div class="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-200 overflow-hidden">
        <div class="p-4 bg-[#0f2942] text-white flex items-center justify-between">
          <div class="flex items-center gap-2">
            <i data-lucide="pen-tool" class="w-4 h-4 text-amber-300"></i>
            <div>
              <h3 class="text-sm font-bold">Assinatura Eletrônica & Selo SHA-256 — AC Engenharia</h3>
              <p id="sig-modal-doc-label" class="text-[11px] text-slate-300">Homologação formal com registro na Trilha de Auditoria</p>
            </div>
          </div>
          <button type="button" onclick="closeModal('modal-digital-signature')" class="text-slate-300 hover:text-white cursor-pointer">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>
        <form onsubmit="handleConfirmDigitalSignature(event)" class="p-5 space-y-3.5 text-xs">
          <input type="hidden" id="sig-input-code" value="" />
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nome Completo do Signatário *</label>
            <input type="text" id="sig-input-name" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:outline-none focus:border-[#004b93]" />
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Cargo / Papel no SGSI *</label>
              <input type="text" id="sig-input-role" required class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#004b93]" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">CPF ou Registro (CREA/OAB/CRECI) *</label>
              <input type="text" id="sig-input-doc" required placeholder="Ex: CPF ***.456.789-** / CREA-SE" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#004b93]" />
            </div>
          </div>
          <div>
            <label class="block font-bold text-slate-700 mb-1">Modalidade de Assinatura Homologada</label>
            <select id="sig-input-method" class="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-[#004b93]">
              <option value="Assinatura Eletrônica SGSI (Google Workspace SSO + SHA-256)">Assinatura Eletrônica SGSI (Google Workspace SSO + SHA-256)</option>
              <option value="Certificado Digital ICP-Brasil (e-CPF / e-CNPJ A1/A3)">Certificado Digital ICP-Brasil (e-CPF / e-CNPJ A1/A3)</option>
              <option value="Assinatura Avançada Portal Gov.br (Lei 14.063/2020)">Assinatura Avançada Portal Gov.br (Lei 14.063/2020)</option>
            </select>
          </div>
          <div class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 text-[11px]">
            <div class="font-bold flex items-center gap-1.5">
              <i data-lucide="shield-check" class="w-4 h-4 text-emerald-600"></i>
              <span>Validade Jurídica & Rastreabilidade Forense</span>
            </div>
            <p>A assinatura estampará o Quadro de Homologação do documento A4 com Hash Criptográfico SHA-256, carimbo de tempo e registro automático na Trilha de Auditoria e Logs de Políticas da AC Engenharia.</p>
          </div>
          <div class="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button type="button" onclick="clearDocumentSignatures()" class="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold cursor-pointer mr-auto">
              Limpar Assinaturas deste Modelo
            </button>
            <button type="button" onclick="closeModal('modal-digital-signature')" class="px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer">
              Cancelar
            </button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs cursor-pointer">
              <i data-lucide="check-circle-2" class="w-4 h-4"></i>
              <span>Assinar & Selar SHA-256</span>
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  }

  const codeEl = document.getElementById("sig-input-code");
  const labelEl = document.getElementById("sig-modal-doc-label");
  const nameEl = document.getElementById("sig-input-name");
  const roleEl = document.getElementById("sig-input-role");
  const docEl = document.getElementById("sig-input-doc");

  if (codeEl) codeEl.value = targetCode;
  if (labelEl && tpl) labelEl.textContent = `${tpl.code} — ${tpl.title}`;
  if (nameEl) nameEl.value = ctx.currentUserName;
  if (roleEl) roleEl.value = ctx.currentUserRole;
  if (docEl && !docEl.value) docEl.value = ctx.currentUserEmail || "Verificado via SSO Corporativo";

  modal.classList.remove("hidden");
  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

async function handleConfirmDigitalSignature(e) {
  e.preventDefault();
  const code = document.getElementById("sig-input-code").value || TemplateHubState.previewingCode || "MOD-GOV-03";
  const signerName = document.getElementById("sig-input-name").value.trim();
  const signerRole = document.getElementById("sig-input-role").value.trim();
  const signerDoc = document.getElementById("sig-input-doc").value.trim();
  const method = document.getElementById("sig-input-method").value;
  const tpl = getTemplateByCode(code);

  const timestamp = new Date().toLocaleString("pt-BR");
  const payloadStr = `${code}|${signerName}|${signerRole}|${signerDoc}|${timestamp}|AC_ENGENHARIA`;

  let sha256 = "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4";
  try {
    if (window.crypto && window.crypto.subtle) {
      const buf = new TextEncoder().encode(payloadStr);
      const digest = await window.crypto.subtle.digest("SHA-256", buf);
      sha256 = Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
  } catch (_) {}

  const allSigs = getStoredTemplateSignatures();
  if (!Array.isArray(allSigs[code])) allSigs[code] = [];
  allSigs[code].push({
    signerName,
    signerRole,
    signerDoc,
    method,
    timestamp,
    ip: "192.168.10.1 (SSO AC Engenharia)",
    hash: sha256
  });
  saveStoredTemplateSignatures(allSigs);

  // Registra também nos Logs de Assinatura de Políticas e Termos do Banco Principal
  if (typeof getStoredDB === "function" && typeof saveDB === "function") {
    const db = getStoredDB();
    if (!Array.isArray(db.policyLogs)) db.policyLogs = [];
    db.policyLogs.unshift({
      id: Date.now(),
      user: signerName,
      dept: signerRole,
      policyId: code,
      version: tpl ? (tpl.version || "v1.0") : "v1.0",
      date: timestamp,
      ip: "192.168.10.1",
      hash: sha256
    });
    saveDB(db);
    if (typeof renderRaciModule === "function") renderRaciModule();
  }

  if (window.ApiService && typeof window.ApiService.addAuditRecord === "function") {
    window.ApiService.addAuditRecord({
      category: "ASSINATURA_DIGITAL",
      severity: "INFO",
      actor: `${signerName} (${signerRole})`,
      description: `Documento oficial ${code} (${tpl ? tpl.title : "Termo SGSI"}) assinado eletronicamente na AC Engenharia. Hash SHA-256: ${sha256}.`,
      target_module: "Modelos, Atas & Assinaturas"
    });
  }

  if (typeof closeModal === "function") closeModal("modal-digital-signature");
  renderDocumentTemplatesGrid();

  // Atualiza imediatamente o documento aberto no visualizador A4 com o selo verde
  previewCorporateTemplate(code, TemplateHubState.previewingCustomData || {});

  if (window.showToast) {
    window.showToast(`Assinatura eletrônica SHA-256 aplicada ao documento ${code}!`, "success");
  }
}

function clearDocumentSignatures() {
  const code = document.getElementById("sig-input-code")?.value || TemplateHubState.previewingCode;
  if (!code) return;
  const allSigs = getStoredTemplateSignatures();
  delete allSigs[code];
  saveStoredTemplateSignatures(allSigs);
  if (typeof closeModal === "function") closeModal("modal-digital-signature");
  renderDocumentTemplatesGrid();
  if (TemplateHubState.previewingCode === code) {
    previewCorporateTemplate(code, TemplateHubState.previewingCustomData || {});
  }
  if (window.showToast) {
    window.showToast(`Assinaturas do modelo ${code} reiniciadas.`, "info");
  }
}

function sanitizeFileSlug(text) {
  return String(text || "documento")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 65);
}

function downloadTemplateWord(code, customData = {}) {
  const tpl = getTemplateByCode(code);
  if (!tpl) return;
  const wordHtml = "\ufeff" + buildRenderedTemplateHTML(code, customData, { forWord: true });
  const slug = sanitizeFileSlug(tpl.title);
  const fileName = `${tpl.code}-${slug}.doc`;
  if (typeof triggerDownloadFile === "function") {
    triggerDownloadFile(fileName, wordHtml, "application/msword;charset=utf-8");
  }
}

function downloadTemplateHTML(code, customData = {}) {
  const tpl = getTemplateByCode(code);
  if (!tpl) return;
  const html = buildRenderedTemplateHTML(code, customData, { forWord: false });
  const slug = sanitizeFileSlug(tpl.title);
  const fileName = `${tpl.code}-${slug}.html`;
  if (typeof triggerDownloadFile === "function") {
    triggerDownloadFile(fileName, html, "text/html;charset=utf-8");
  }
}

// Pré-preenche o modal de Nova Evidência para o usuário anexar o PDF/documento já assinado
function attachSignedTemplateAsEvidence(code) {
  const tpl = getTemplateByCode(code);
  if (!tpl) return;
  const ctx = getTemplateContextDefaults();

  if (typeof switchTab === "function") switchTab("evidence");
  switchEvidenceSubtab("repo");
  if (typeof openModal === "function") openModal("modal-new-evidence");

  const titleInput = document.getElementById("evidence-input-title");
  const controlInput = document.getElementById("evidence-input-control");
  const catSelect = document.getElementById("evidence-input-category");
  const respInput = document.getElementById("evidence-input-responsible");
  const dateInput = document.getElementById("evidence-input-date");
  const descInput = document.getElementById("evidence-input-desc");

  if (titleInput) titleInput.value = `${tpl.code} Assinado — ${tpl.title}`;
  if (controlInput) controlInput.value = tpl.normative;
  if (catSelect && tpl.evidenceCategory) catSelect.value = tpl.evidenceCategory;
  if (respInput) respInput.value = ctx.currentUserName;
  if (dateInput) dateInput.value = new Date().toISOString().split("T")[0];
  if (descInput) {
    descInput.value = `Documento oficial da AC Engenharia gerado a partir do modelo homologado ${tpl.code}, devidamente preenchido e assinado por (${tpl.signersSummary}) na unidade ${ctx.activeUnit}.`;
  }
}

// ============================================================================
// GERADORES DINÂMICOS VINCULADOS A REGISTROS REAIS DO SISTEMA
// ============================================================================

// 1. Termo de Aceite / Dossiê de Risco Específico (a partir de RSK-xxx)
function generateRiskDocument(riskId, mode = "preview") {
  const db = (typeof getStoredDB === "function") ? getStoredDB() : null;
  const risk = db && Array.isArray(db.risks) ? db.risks.find(r => r.id === riskId) : null;
  if (!risk) {
    previewCorporateTemplate("MOD-RSK-01");
    return;
  }
  const custom = {
    id: risk.id,
    obra_local: risk.obra_local,
    asset: risk.asset,
    category: risk.category,
    threat: risk.threat,
    vuln: risk.vuln,
    inherentProb: risk.inherentProb,
    inherentImp: risk.inherentImp,
    inherentScore: risk.inherentScore,
    control: risk.control,
    residualProb: risk.residualProb,
    residualImp: risk.residualImp,
    residualScore: risk.residualScore,
    strategy: risk.strategy,
    responsible: risk.responsible,
    directorName: (risk.directorApproval && risk.directorApproval.director) ? risk.directorApproval.director : undefined
  };
  if (mode === "word") downloadTemplateWord("MOD-RSK-01", custom);
  else previewCorporateTemplate("MOD-RSK-01", custom);
}

// 2. Contrato Aditivo DPA preenchido para Empreiteira / Operador Terceiro
function generateOperatorDpaDocument(operatorKey, mode = "preview") {
  const db = (typeof getStoredDB === "function") ? getStoredDB() : null;
  const list = db && Array.isArray(db.thirdParties) ? db.thirdParties : [];
  const item = list.find(t => String(t.id) === String(operatorKey) || t.name === operatorKey) || null;
  const custom = item ? {
    operatorName: item.name,
    service: item.service,
    dataShared: item.dataShared,
    validity: item.validity
  } : {};
  if (mode === "word") downloadTemplateWord("MOD-LGP-01", custom);
  else previewCorporateTemplate("MOD-LGP-01", custom);
}

// 3. Certidão de Atendimento DSAR preenchida para o protocolo do titular
function generateDsarCertificateDocument(dsarId, mode = "preview") {
  const db = (typeof getStoredDB === "function") ? getStoredDB() : null;
  const list = db && Array.isArray(db.dsar) ? db.dsar : [];
  const item = list.find(d => d.id === dsarId) || null;
  const custom = item ? {
    id: item.id,
    holder: item.holder,
    type: item.type,
    openDate: item.openDate,
    status: item.status,
    notes: item.notes
  } : {};
  if (mode === "word") downloadTemplateWord("MOD-LGP-03", custom);
  else previewCorporateTemplate("MOD-LGP-03", custom);
}

// 4. Emissão real para os botões do painel lateral (Offcanvas: Policy, RACI, SoA, RoPA, Risk)
function generateOffcanvasEntityDocument(type, idOrCode) {
  if (type === "risk") {
    generateRiskDocument(idOrCode, "preview");
    return;
  }
  if (type === "policy") {
    const policyMap = {
      "PSI-001": "MOD-GOV-05",
      "PCA-002": "MOD-GOV-07",
      "PCOM-003": "MOD-LGP-02",
      "PBIO-004": "MOD-OBR-02",
      "PSST-005": "MOD-GOV-08"
    };
    const targetCode = policyMap[idOrCode] || "MOD-GOV-03";
    previewCorporateTemplate(targetCode, { policyId: idOrCode });
    return;
  }
  if (type === "raci") {
    const db = (typeof getStoredDB === "function") ? getStoredDB() : null;
    const row = db && Array.isArray(db.raciMatrix) ? db.raciMatrix.find(r => String(r.id) === String(idOrCode)) : null;
    previewCorporateTemplate("MOD-GOV-06", row || {});
    return;
  }
  if (type === "ropa") {
    if (typeof downloadRoPAReport === "function") downloadRoPAReport();
    return;
  }
  if (type === "soa") {
    previewCorporateTemplate("MOD-RSK-02", { highlightCode: idOrCode });
    return;
  }
  previewCorporateTemplate("MOD-AUD-02");
}

// Exposição Global
window.CORPORATE_DOCUMENT_TEMPLATES = CORPORATE_DOCUMENT_TEMPLATES;
window.switchEvidenceSubtab = switchEvidenceSubtab;
window.openTemplatesForModule = openTemplatesForModule;
window.applyTemplateFilters = applyTemplateFilters;
window.clearTemplateFilters = clearTemplateFilters;
window.renderDocumentTemplatesGrid = renderDocumentTemplatesGrid;
window.previewCorporateTemplate = previewCorporateTemplate;
window.printPreviewedDocument = printPreviewedDocument;
window.downloadPreviewedWord = downloadPreviewedWord;
window.attachPreviewedAsEvidence = attachPreviewedAsEvidence;
window.openDigitalSignatureModal = openDigitalSignatureModal;
window.handleConfirmDigitalSignature = handleConfirmDigitalSignature;
window.clearDocumentSignatures = clearDocumentSignatures;
window.downloadTemplateWord = downloadTemplateWord;
window.downloadTemplateHTML = downloadTemplateHTML;
window.attachSignedTemplateAsEvidence = attachSignedTemplateAsEvidence;
window.generateRiskDocument = generateRiskDocument;
window.generateOperatorDpaDocument = generateOperatorDpaDocument;
window.generateDsarCertificateDocument = generateDsarCertificateDocument;
window.generateOffcanvasEntityDocument = generateOffcanvasEntityDocument;
window.toggleDocEditMode = toggleDocEditMode;
window.buildRenderedTemplateHTML = buildRenderedTemplateHTML;
window.openDocumentSignersModal = openDocumentSignersModal;
window.handleSaveDocumentCustomData = handleSaveDocumentCustomData;
window.clearDocumentCustomData = clearDocumentCustomData;
window.getStoredDocumentCustomData = getStoredDocumentCustomData;
window.saveStoredDocumentCustomData = saveStoredDocumentCustomData;
window.clearStoredDocumentCustomData = clearStoredDocumentCustomData;
window.DOCUMENT_CUSTOM_FIELDS_SCHEMA = DOCUMENT_CUSTOM_FIELDS_SCHEMA;
window.openCorporateSignersModal = openCorporateSignersModal;
window.handleSaveCorporateSigners = handleSaveCorporateSigners;
window.clearCorporateSigners = clearCorporateSigners;
window.getStoredCorporateSigners = getStoredCorporateSigners;
window.saveStoredCorporateSigners = saveStoredCorporateSigners;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("doc-templates-grid")) {
    renderDocumentTemplatesGrid();
  }
});
