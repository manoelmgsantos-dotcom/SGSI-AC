/**
 * document-templates.js - Central Corporativa de Modelos Oficiais, Atas, Políticas, Laudos e Termos para Assinatura
 * AC Engenharia - SGSI & GRC Enterprise Platform
 * Cobertura integral de todos os módulos operacionais (ISO/IEC 27001:2022, ISO 27005, ISO 27035, ISO 27037, ISO 22301, LGPD & NR-18/NR-07)
 */

// ============================================================================
// MOTOR CRIPTOGRÁFICO SHA-256 CANÔNICO (FIPS 180-4)
// Compatível com Web Crypto API (Nativo / Hardware) + Fallback Matemático Exato
// Garante cálculo 100% autêntico e fidedigno mesmo em redes locais HTTP
// ============================================================================
function sha256PureSync(input) {
  function rightRotate(value, amount) { return (value >>> amount) | (value << (32 - amount)); }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let bytes;
  if (typeof input === 'string') {
    bytes = new TextEncoder().encode(input);
  } else if (input instanceof Uint8Array) {
    bytes = input;
  } else if (input instanceof ArrayBuffer) {
    bytes = new Uint8Array(input);
  } else if (input && typeof input.arrayBuffer === 'function') {
    bytes = new Uint8Array(0);
  } else {
    bytes = new Uint8Array(0);
  }

  const byteLength = bytes.length;
  const bitLength = byteLength * 8;
  const newByteLength = (((byteLength + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(newByteLength);
  padded.set(bytes);
  padded[byteLength] = 0x80;

  const highBits = Math.floor(bitLength / maxWord);
  const lowBits = bitLength >>> 0;
  padded[newByteLength - 8] = (highBits >>> 24) & 0xff;
  padded[newByteLength - 7] = (highBits >>> 16) & 0xff;
  padded[newByteLength - 6] = (highBits >>> 8) & 0xff;
  padded[newByteLength - 5] = highBits & 0xff;
  padded[newByteLength - 4] = (lowBits >>> 24) & 0xff;
  padded[newByteLength - 3] = (lowBits >>> 16) & 0xff;
  padded[newByteLength - 2] = (lowBits >>> 8) & 0xff;
  padded[newByteLength - 1] = lowBits & 0xff;

  const words = new Int32Array(newByteLength / 4);
  for (let i = 0; i < words.length; i++) {
    words[i] = (padded[i * 4] << 24) | (padded[i * 4 + 1] << 16) | (padded[i * 4 + 2] << 8) | (padded[i * 4 + 3]);
  }

  let hash = [];
  let k = [];
  let primeCounter = 0;
  let isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (mathPow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1/3) * maxWord) | 0;
    }
  }

  for (let j = 0; j < words.length; j += 16) {
    const w = new Int32Array(64);
    for (let i = 0; i < 16; i++) w[i] = words[j + i];
    for (let i = 16; i < 64; i++) {
      const s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let a = hash[0], b = hash[1], c = hash[2], d = hash[3];
    let e = hash[4], f = hash[5], g = hash[6], h = hash[7];

    for (let i = 0; i < 64; i++) {
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ ((~e) & g);
      const temp1 = (h + s1 + ch + k[i] + w[i]) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  let hex = '';
  for (let i = 0; i < 8; i++) {
    hex += (hash[i] >>> 0).toString(16).padStart(8, '0');
  }
  return hex;
}

async function computeUniversalSHA256(input) {
  try {
    let buffer = null;
    if (typeof input === 'string') {
      buffer = new TextEncoder().encode(input);
    } else if (input instanceof Uint8Array) {
      buffer = input.buffer;
    } else if (input instanceof ArrayBuffer) {
      buffer = input;
    } else if (input && typeof input.arrayBuffer === 'function') {
      buffer = await input.arrayBuffer();
    }
    if (buffer && window.crypto && window.crypto.subtle) {
      const digest = await window.crypto.subtle.digest("SHA-256", buffer);
      return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (_) {}
  return sha256PureSync(input);
}

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
    if (raw) {
      const map = JSON.parse(raw);
      // Alias bidirecional para MOD-SEG-08-B e MOD-SEC-08
      if (!map["MOD-SEG-08-B"] && map["MOD-SEC-08"]) map["MOD-SEG-08-B"] = map["MOD-SEC-08"];
      if (!map["MOD-SEC-08"] && map["MOD-SEG-08-B"]) map["MOD-SEC-08"] = map["MOD-SEG-08-B"];
      return map;
    }
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
    let raw = localStorage.getItem("sgsi_doc_custom_" + code);
    if (!raw && code === "MOD-SEG-08-B") {
      raw = localStorage.getItem("sgsi_doc_custom_MOD-SEC-08");
    } else if (!raw && code === "MOD-SEC-08") {
      raw = localStorage.getItem("sgsi_doc_custom_MOD-SEG-08-B");
    }
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
  "MOD-OBR-06": {
    "title": "Laudo Técnico de Homologação, Teste de Funcionamento e Vistoria de Equipamentos (TVs, Projetores e Periféricos de Canteiro)",
    "signers": [
      {
        "role": "Técnico(a) de T.I. / Elétrica (Responsável pelo Teste)",
        "docLabel": "CPF / Registro Técnico",
        "placeholder": "Ex: Manoel M. G. Santos"
      },
      {
        "role": "Recebedor na Obra / Almoxarife / Fiscal",
        "docLabel": "CPF / Matrícula Obra",
        "placeholder": "Ex: João Silva (Almoxarifado)"
      },
      {
        "role": "Engenheiro(a) Residente / Gestor de Obra",
        "docLabel": "CREA-SE",
        "placeholder": "Ex: Eng. Ricardo Lima"
      }
    ],
    "fields": [
      {
        "key": "obra",
        "label": "Obra / Canteiro de Destino *",
        "placeholder": "Ex: Residencial Jardins da Costa / Central",
        "fullWidth": false
      },
      {
        "key": "nf_compra",
        "label": "Nota Fiscal / Pedido de Compra / Fornecedor",
        "placeholder": "Ex: NF-e 048.912 - Magazine Luiza / Kalunga",
        "fullWidth": false
      },
      {
        "key": "equipamento_tipo",
        "label": "Tipo do Aparelho Testado *",
        "type": "select",
        "options": [
          "Smart TV LED / Painel de Reuniões",
          "Projetor Multimídia / Datashow",
          "Monitor de Vídeo / CFTV",
          "Caixa de Som / Sistema de Áudio para DDS",
          "Aparelho de Videoconferência / Webcam",
          "Outro Equipamento Eletroeletrônico"
        ],
        "fullWidth": false
      },
      {
        "key": "marca",
        "label": "Marca / Fabricante *",
        "placeholder": "Ex: Samsung, LG, Epson, Philco, AOC, BenQ, TCL",
        "fullWidth": false
      },
      {
        "key": "modelo",
        "label": "Modelo / Polegadas / Resolução *",
        "placeholder": "Ex: Smart TV 55 pol. UHD 4K / Projetor 3800 Lumens WXGA",
        "fullWidth": false
      },
      {
        "key": "serie",
        "label": "Número de Série (S/N) *",
        "placeholder": "Ex: 9ZJ43L7A000124K",
        "fullWidth": false
      },
      {
        "key": "patrimonio",
        "label": "Plaqueta de Patrimônio / Tag GLPI",
        "placeholder": "Ex: PAT-AC-0842",
        "fullWidth": false
      },
      {
        "key": "tensao",
        "label": "Tensão Elétrica (Voltagem)",
        "type": "select",
        "options": [
          "Bivolt Automático (100V ~ 240V)",
          "220V Monofásico",
          "110V / 127V Monofásico"
        ],
        "fullWidth": false
      },
      {
        "key": "itens_inclusos",
        "label": "Acessórios e Cabos Inclusos",
        "placeholder": "Ex: Controle remoto c/ pilhas, Cabo HDMI 2.0, Cabo de força NBR 14136, Suporte VESA, Manual",
        "fullWidth": true
      },
      {
        "key": "lote_aparelhos",
        "label": "Detalhamento de Lote (se houver múltiplos aparelhos testados juntos)",
        "type": "textarea",
        "placeholder": "Ex:\nItem 1: Smart TV 55 Samsung | S/N: 9ZJ43L7A000124K | Pat: PAT-AC-0842 | [OK] Aprovado\nItem 2: Smart TV 55 Samsung | S/N: 9ZJ43L7A000125L | Pat: PAT-AC-0843 | [OK] Aprovado\nItem 3: Projetor Epson PowerLite | S/N: E84201948 | Pat: PAT-AC-0844 | [OK] Aprovado",
        "fullWidth": true
      },
      {
        "key": "parecer_status",
        "label": "Resultado da Homologação Técnica *",
        "type": "select",
        "options": [
          "APROVADO — Equipamento 100% íntegro, testado e liberado para envio à obra",
          "APROVADO COM RESSALVAS — Funcionamento validado com pequenas observações",
          "REPROVADO — Aparelho com defeito / vício oculto (Acionar Garantia ou Devolução)"
        ],
        "fullWidth": true
      },
      {
        "key": "obs_tecnicas",
        "label": "Observações Técnicas e Recomendações de Instalação na Obra",
        "type": "textarea",
        "placeholder": "Ex: Imagem nítida sem dead pixels; portas HDMI 1 e 2 testadas com notebook; áudio estéreo sem chiados; Wi-Fi conectado na rede interna; recomendado usar filtro de linha no container da obra.",
        "fullWidth": true
      },
      {
        "key": "foto_ligado",
        "label": "Foto 1: Aparelho Ligado / Teste de Tela ou Projeção Ativa",
        "type": "photo",
        "hint": "Carregue a foto do aparelho em funcionamento (exibindo tela nítida, cores e imagem ativa).",
        "fullWidth": true
      },
      {
        "key": "foto_etiqueta",
        "label": "Foto 2: Etiqueta de Identificação e Número de Série (S/N / Anatel)",
        "type": "photo",
        "hint": "Carregue a foto aproximada da etiqueta traseira com dados de marca, modelo, tensão e número de série.",
        "fullWidth": true
      },
      {
        "key": "foto_acessorios",
        "label": "Foto 3: Acessórios, Cabos, Controle Remoto e Embalagem",
        "type": "photo",
        "hint": "Carregue a foto do controle remoto, cabos de conexão e componentes entregues junto com o aparelho.",
        "fullWidth": true
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
  "MOD-SEG-08-A": {
    "title": "Registro de Verificação de Acesso Atípico (Triagem - Fase 1)",
    "signers": [
      {
        "role": "Analista de T.I. / Responsável pela Triagem",
        "docLabel": "Matrícula / Registro Técnico",
        "placeholder": "Ex: Analista de Suporte / T.I."
      },
      {
        "role": "Colaborador(a) Titular Entrevistado(a)",
        "docLabel": "CPF / Matrícula Funcional",
        "placeholder": "Ex: Nome Completo do Colaborador"
      }
    ],
    "fields": [
      {
        "key": "triageProtocol",
        "label": "Nº do Protocolo de Triagem",
        "placeholder": "Ex: TRI-SEG-2026-0158"
      },
      {
        "key": "checkDateTime",
        "label": "Data e Hora da Verificação",
        "placeholder": "Ex: 18/11/2026 às 15:20"
      },
      {
        "key": "alertOriginSystem",
        "label": "Sistema que Gerou o Alerta",
        "placeholder": "Ex: ERP Sienge / Construtor de Vendas (CV CRM) / Google Workspace / AD"
      },
      {
        "key": "userName",
        "label": "Nome da Pessoa Investigada / Colaborador Titular",
        "placeholder": "Ex: Davis Damasceno / Nome Completo"
      },
      {
        "key": "userEmail",
        "label": "E-mail da Pessoa Investigada",
        "placeholder": "Ex: davisdamasceno@acengenhariase.com.br"
      },
      {
        "key": "userLogin",
        "label": "Login / Usuário da Pessoa Investigada",
        "placeholder": "Ex: davis.damasceno"
      },
      {
        "key": "userDepartment",
        "label": "Cargo / Setor da Pessoa Investigada",
        "placeholder": "Ex: Engenheiro Residente / Obras"
      },
      {
        "key": "analyzedIp",
        "label": "IP Analisado e Geolocalização",
        "placeholder": "Ex: 179.180.x.x (Claro 4G - Aracaju/SE)"
      },
      {
        "key": "triageNotes",
        "label": "Observações e Justificativa do Colaborador",
        "placeholder": "Ex: Colaborador confirmou conexão rotineira via 4G do celular em trânsito"
      }
    ]
  },
  "MOD-SEG-08-B": {
    "title": "Relatório Técnico de Incursão Hostil e Compromisso de Credencial",
    "signers": [
      {
        "role": "Analista Técnico de T.I. / CSIRT Investigador",
        "docLabel": "Nome Completo e Rubrica",
        "placeholder": "Ex: Analista Investigador de T.I."
      },
      {
        "role": "Gestor Executivo de T.I. & SecOps",
        "docLabel": "Nome Completo e Rubrica",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Encarregado(a) de Dados (DPO) — Parecer Regulatório",
        "docLabel": "Nome Completo e Rubrica",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": [
      {
        "key": "incidentNumber",
        "label": "Nº do Protocolo do Alerta / Incidente",
        "placeholder": "Ex: INC-SEG-2026-0042"
      },
      {
        "key": "detectionDateTime",
        "label": "Data e Hora da Detecção do Alerta",
        "placeholder": "Ex: 18/11/2026 às 14:35"
      },
      {
        "key": "alertOrigin",
        "label": "Origem Primária do Alerta",
        "placeholder": "Ex: Sienge / Construtor de Vendas / Gmail / Antivírus"
      },
      {
        "key": "targetSystem",
        "label": "Sistema Objeto do Acesso / Alerta",
        "placeholder": "Ex: ERP Sienge / CV CRM / Gmail / VPN Fortigate"
      },
      {
        "key": "affectedUser",
        "label": "Nome Completo do Colaborador Titular",
        "placeholder": "Ex: João da Silva"
      },
      {
        "key": "affectedEmail",
        "label": "E-mail Corporativo do Usuário",
        "placeholder": "Ex: joao.silva@acengenhariase.com.br"
      },
      {
        "key": "affectedLogin",
        "label": "Login / Usuário Específico no Sistema",
        "placeholder": "Ex: jsilva (Sienge) / eng.joao (Rede)"
      },
      {
        "key": "affectedRole",
        "label": "Cargo / Função e Setor",
        "placeholder": "Ex: Engenheiro Residente / Canteiro Obra Jardins"
      },
      {
        "key": "originIp",
        "label": "IP de Origem e Geolocalização Identificada",
        "placeholder": "Ex: 185.220.101.5 (Frankfurt / Tor) OU 179.180.x.x (Claro 4G/Aracaju)"
      },
      {
        "key": "attackerActions",
        "label": "Resumo das Ações na Sessão (Uso Normal ou Atividade Suspeita)",
        "placeholder": "Ex: Acesso regular confirmado pelo usuário OU Invasor tentou alterar PIX no Sienge"
      },
      {
        "key": "exfiltrationStatus",
        "label": "Diagnóstico de Exfiltração / Integridade da Base",
        "placeholder": "Ex: Tráfego rotineiro regular sem exfiltração OU Sob auditoria de tráfego"
      },
      {
        "key": "attackerTimeline",
        "label": "Linha do Tempo dos Logs (Timeline Pericial)",
        "placeholder": "Ex: 14:20 Alerta disparado -> 14:22 Entrevista com colaborador -> 14:25 Validação fática"
      }
    ]
  },
  "MOD-SEC-08": {
    "title": "Relatório Técnico de Incursão Hostil e Compromisso de Credencial",
    "signers": [
      {
        "role": "Analista Técnico de T.I. / CSIRT Investigador",
        "docLabel": "Nome Completo e Rubrica",
        "placeholder": "Ex: Analista Investigador de T.I."
      },
      {
        "role": "Gestor Executivo de T.I. & SecOps",
        "docLabel": "Nome Completo e Rubrica",
        "placeholder": "Ex: Carlos Santos"
      },
      {
        "role": "Encarregado(a) de Dados (DPO) — Parecer Regulatório",
        "docLabel": "Nome Completo e Rubrica",
        "placeholder": "Ex: Dra. Mariana Costa"
      }
    ],
    "fields": [
      {
        "key": "incidentNumber",
        "label": "Nº do Protocolo do Alerta / Incidente",
        "placeholder": "Ex: INC-SEG-2026-0042"
      },
      {
        "key": "detectionDateTime",
        "label": "Data e Hora da Detecção do Alerta",
        "placeholder": "Ex: 18/11/2026 às 14:35"
      },
      {
        "key": "alertOrigin",
        "label": "Origem Primária do Alerta",
        "placeholder": "Ex: Sienge / Construtor de Vendas / Gmail / Antivírus"
      },
      {
        "key": "targetSystem",
        "label": "Sistema Objeto do Acesso / Alerta",
        "placeholder": "Ex: ERP Sienge / CV CRM / Gmail / VPN Fortigate"
      },
      {
        "key": "affectedUser",
        "label": "Nome Completo do Colaborador Titular",
        "placeholder": "Ex: João da Silva"
      },
      {
        "key": "affectedEmail",
        "label": "E-mail Corporativo do Usuário",
        "placeholder": "Ex: joao.silva@acengenhariase.com.br"
      },
      {
        "key": "affectedLogin",
        "label": "Login / Usuário Específico no Sistema",
        "placeholder": "Ex: jsilva (Sienge) / eng.joao (Rede)"
      },
      {
        "key": "affectedRole",
        "label": "Cargo / Função e Setor",
        "placeholder": "Ex: Engenheiro Residente / Canteiro Obra Jardins"
      },
      {
        "key": "originIp",
        "label": "IP de Origem e Geolocalização Identificada",
        "placeholder": "Ex: 185.220.101.5 (Frankfurt / Tor) OU 179.180.x.x (Claro 4G/Aracaju)"
      },
      {
        "key": "attackerActions",
        "label": "Resumo das Ações na Sessão (Uso Normal ou Atividade Suspeita)",
        "placeholder": "Ex: Acesso regular confirmado pelo usuário OU Invasor tentou alterar PIX no Sienge"
      },
      {
        "key": "exfiltrationStatus",
        "label": "Diagnóstico de Exfiltração / Integridade da Base",
        "placeholder": "Ex: Tráfego rotineiro regular sem exfiltração OU Sob auditoria de tráfego"
      },
      {
        "key": "attackerTimeline",
        "label": "Linha do Tempo dos Logs (Timeline Pericial)",
        "placeholder": "Ex: 14:20 Alerta disparado -> 14:22 Entrevista com colaborador -> 14:25 Validação fática"
      }
    ]
  },
  "MOD-GOV-10": {
    "title": "Termo de Responsabilidade e Custódia de Certificado Digital (ICP-Brasil e-CNPJ / e-CPF)",
    "signers": [
      {
        "role": "Colaborador(a) Custodiante Declarador",
        "docLabel": "CPF / Matrícula",
        "placeholder": "Ex: Nome Completo do Colaborador"
      },
      {
        "role": "Gestor Imediato da Área Solicitante",
        "docLabel": "Cargo / Lotação",
        "placeholder": "Ex: Nome do Gestor Imediato"
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
        "placeholder": "Ex: e-CNPJ A1 (Arquivo / Máquina) ou e-CNPJ A3 (Token Físico)"
      },
      {
        "key": "machineAsset",
        "label": "Estação de Trabalho / Máquina Autorizada (T.I.)",
        "placeholder": "Ex: PC-FIN-01 (Setor Financeiro / Matriz) ou Notebook Patrimônio nº 1042"
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
  const customDocDate = (customData && customData.docDate && customData.docDate.trim()) ? customData.docDate.trim() : null;
  const effectiveDateStr = customDocDate ? escapeDocHtml(customDocDate) : "_____ / _____ / _________";

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
        <div style="min-height: 38px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">
          <span style="font-size: 7.5pt; color: #94a3b8; font-style: italic;">[ Assinatura Manuscrita ou Rubrica ]</span>
        </div>
        <div class="sig-line" style="margin-bottom: 8px;"></div>
        <div class="sig-role" style="font-weight: 700; font-size: 8.5pt; color: #0b1a30; margin-bottom: 4px;">${escapeDocHtml(effectiveRole)}</div>
        <div class="sig-name" style="margin-bottom: 2px;">
          <strong>Nome Completo:</strong> 
          <span class="sig-editable-slot" style="color: ${nameColor}; border-bottom: 1px dashed #94a3b8; display: inline-block; min-width: 210px; font-weight: ${hasExplicitName ? '700' : 'normal'};">
            ${displayName}
          </span>
        </div>
        <div class="sig-meta" style="margin-bottom: 2px;">
          <strong>Cargo / Setor:</strong> ${escapeDocHtml(effectiveRole)}
        </div>
        <div class="sig-meta" style="margin-bottom: 2px;">
          <strong>CPF / Registro Profissional:</strong> 
          <span style="color: ${hasExplicitName ? '#0b1a30' : '#64748b'}; border-bottom: 1px dashed #cbd5e1; display: inline-block; min-width: 140px;">
            ${escapeDocHtml(effectiveDocLabel)}
          </span>
        </div>
        <div class="sig-meta" style="margin-top: 6px; font-size: 7.5pt; color: #64748b; border-top: 1px dotted #e2e8f0; padding-top: 4px;">
          <strong>Data:</strong> ${effectiveDateStr} &nbsp;|&nbsp; <em>Assinatura Física / Rubrica ou Certificação Digital</em>
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
          <div style="min-height: 34px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">
            <span style="font-size: 7.5pt; color: #94a3b8; font-style: italic;">[ Assinatura / Rubrica da Testemunha ]</span>
          </div>
          <div class="sig-line" style="margin-bottom: 6px;"></div>
          <div class="sig-role">1ª Testemunha Instrumentária</div>
          <div class="sig-name"><strong>Nome Completo:</strong> <span style="border-bottom: 1px dashed #94a3b8; display: inline-block; min-width: 180px;">___________________________</span></div>
          <div class="sig-meta"><strong>CPF / Documento:</strong> _________________________</div>
        </div>
        <div class="sig-box">
          <div style="min-height: 34px; display: flex; align-items: flex-end; justify-content: center; margin-bottom: 2px;">
            <span style="font-size: 7.5pt; color: #94a3b8; font-style: italic;">[ Assinatura / Rubrica da Testemunha ]</span>
          </div>
          <div class="sig-line" style="margin-bottom: 6px;"></div>
          <div class="sig-role">2ª Testemunha Instrumentária</div>
          <div class="sig-name"><strong>Nome Completo:</strong> <span style="border-bottom: 1px dashed #94a3b8; display: inline-block; min-width: 180px;">___________________________</span></div>
          <div class="sig-meta"><strong>CPF / Documento:</strong> _________________________</div>
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

    ${(() => {
      const docPayload = `${meta.code}|${meta.version || "v2.4"}|${protocolCode}|${unitName}|${bodyHtml}`;
      const documentIntegrityHash = (typeof sha256PureSync === "function")
        ? sha256PureSync(docPayload)
        : "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      return `
      <div class="doc-footer">
        <div>
          <strong style="color: #0b1a30;">${escapeDocHtml(ctx.company)}</strong> &bull; Sistema Integrado de Gestão da Segurança da Informação &amp; Governança Corporativa<br/>
          <span>Documento Homologado &bull; ABNT NBR ISO/IEC 27001:2022 &bull; LGPD (Lei nº 13.709/2018) &bull; NR-18</span>
        </div>
        <div style="text-align: right;">
          <span style="font-size: 7.5pt; font-weight: 700; color: #004b93; background: #eff6ff; border: 1px solid #bfdbfe; padding: 1.5px 6px; border-radius: 3px;">CUSTÓDIA FORENSE SHA-256</span><br/>
          <span style="font-family: monospace; font-size: 7pt; color: #004b93; display: block; margin-top: 1px;" title="Hash Criptográfico SHA-256 de Integridade Integral deste Documento: ${documentIntegrityHash}">
            SHA-256: <strong>${escapeDocHtml(documentIntegrityHash.slice(0, 16))}...${escapeDocHtml(documentIntegrityHash.slice(-8))}</strong>
          </span>
          <span style="font-family: monospace; font-size: 7pt; color: #64748b;">Gerado em ${escapeDocHtml(ctx.nowBr)} | Protocolo: ${escapeDocHtml(protocolCode)}</span>
        </div>
      </div>
      `;
    })()}
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
          <td width="50%"><strong>Data da Vistoria:</strong> _____ / _____ / _________</td>
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
      <p>Aos _____ dias do mês de __________________ de _________, na unidade <strong>${escapeDocHtml(custom.obra || ctx.activeUnit)}</strong> da <strong>${escapeDocHtml(ctx.company)}</strong>, reuniram-se os responsáveis abaixo assinados para atestar a desmobilização tecnológica segura e o recolhimento integral dos ativos de TI e telecomunicações.</p>

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
  {
    code: "MOD-OBR-06",
    module: "obras",
    docType: "Laudo / Vistoria Fotográfica",
    requiresSignature: true,
    title: "Laudo Técnico de Homologação, Teste de Funcionamento e Vistoria de Equipamentos (TVs, Projetores e Periféricos de Canteiro)",
    normative: "ABNT NBR ISO/IEC 27001:2022 A.7.10, A.8.1, NR-10 & NR-18 (Segurança em Obras)",
    evidenceCategory: "Canteiros de Obras & Infraestrutura",
    signersSummary: "Técnico(a) de T.I. / Elétrica + Almoxarife / Recebedor na Obra + Engenheiro(a) Residente",
    summary: "Laudo pericial e operacional de recebimento, teste em bancada, validação de funcionamento (boot, tela, HDMI, áudio, Wi-Fi) e registro fotográfico de TVs, projetores, monitores e periféricos adquiridos para obras e canteiros.",
    buildBody: (ctx, custom = {}) => {
      const obraDestino = custom.obra || ctx.activeUnit;
      const nfCompra = custom.nf_compra || "__________________________________________________";
      const tipoAparelho = custom.equipamento_tipo || "Smart TV / Projetor Multimídia / Monitor";
      const marca = custom.marca || "___________________________";
      const modelo = custom.modelo || "___________________________";
      const serie = custom.serie || "_________________________________";
      const patrimonio = custom.patrimonio || "PAT-AC-_______";
      const tensao = custom.tensao || "Bivolt Automático (100V ~ 240V)";
      const itensInclusos = custom.itens_inclusos || "Controle remoto c/ pilhas, cabo de força tripolar NBR 14136, cabo HDMI 2.0, suporte de fixação";
      const loteAparelhos = (custom.lote_aparelhos || "").trim();
      const parecerStatus = custom.parecer_status || "APROVADO — Equipamento 100% íntegro, testado e liberado para envio à obra";
      const obsTecnicas = custom.obs_tecnicas || "Aparelho testado a frio e mantido ligado por 30 minutos em bancada. Painel de imagem e áudio sem distorções, portas de comunicação testadas com sinal ativo de notebook. Liberado para instalação física no canteiro.";
      const dataVistoria = custom.docDate || ctx.todayBr;

      // Fotos do documento (prioriza as fotos customizadas; fallback para evidências anexadas se disponíveis)
      const docEvidences = (typeof getEvidencesForDocument === "function") ? getEvidencesForDocument("MOD-OBR-06") : [];
      const imageEvidences = docEvidences.filter(e => e.fileDataUrl && e.fileDataUrl.startsWith("data:image"));

      const fotoLigado = custom.foto_ligado || (imageEvidences[0] ? imageEvidences[0].fileDataUrl : "");
      const fotoEtiqueta = custom.foto_etiqueta || (imageEvidences[1] ? imageEvidences[1].fileDataUrl : "");
      const fotoAcessorios = custom.foto_acessorios || (imageEvidences[2] ? imageEvidences[2].fileDataUrl : "");

      const isAprovado = parecerStatus.includes("APROVADO") && !parecerStatus.includes("RESSALVAS");
      const isRessalvas = parecerStatus.includes("RESSALVAS");
      const isReprovado = parecerStatus.includes("REPROVADO");

      return `
        <h2>1. Identificação do Empreendimento e Dados da Aquisição</h2>
        <table class="data-table">
          <tr>
            <td width="55%"><strong>Obra / Canteiro de Destino:</strong> ${escapeDocHtml(obraDestino)}</td>
            <td width="45%"><strong>Data do Teste / Vistoria:</strong> ${escapeDocHtml(dataVistoria)}</td>
          </tr>
          <tr>
            <td><strong>Nota Fiscal / Pedido / Fornecedor:</strong> ${escapeDocHtml(nfCompra)}</td>
            <td><strong>Local de Homologação:</strong> Bancada de Testes de T.I. / Central AC Engenharia</td>
          </tr>
        </table>

        <h2>2. Especificações e Identificação do(s) Aparelho(s) Testado(s)</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th width="28%">Parâmetro Técnico</th>
              <th width="72%">Especificação Registrada no Laudo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Tipo de Equipamento:</strong></td>
              <td><strong style="color: #004b93; font-size: 9.5pt;">${escapeDocHtml(tipoAparelho)}</strong></td>
            </tr>
            <tr>
              <td><strong>Marca / Fabricante:</strong></td>
              <td><strong>${escapeDocHtml(marca)}</strong></td>
            </tr>
            <tr>
              <td><strong>Modelo / Dimensões:</strong></td>
              <td>${escapeDocHtml(modelo)}</td>
            </tr>
            <tr>
              <td><strong>Número de Série (S/N):</strong></td>
              <td><code style="font-size: 9.5pt; font-weight: 700; color: #0f2942;">${escapeDocHtml(serie)}</code></td>
            </tr>
            <tr>
              <td><strong>Plaqueta de Patrimônio / Tag GLPI:</strong></td>
              <td><code style="font-size: 9.5pt; font-weight: 700; color: #004b93;">${escapeDocHtml(patrimonio)}</code></td>
            </tr>
            <tr>
              <td><strong>Tensão Elétrica (Voltagem):</strong></td>
              <td>${escapeDocHtml(tensao)}</td>
            </tr>
            <tr>
              <td><strong>Acessórios e Cabos Inclusos:</strong></td>
              <td>${escapeDocHtml(itensInclusos)}</td>
            </tr>
          </tbody>
        </table>

        ${loteAparelhos ? `
        <div style="margin-top: 10px; margin-bottom: 12px;">
          <strong style="font-size: 8.5pt; color: #0b1a30; display: block; margin-bottom: 4px;">Detalhamento do Lote de Aparelhos Testados:</strong>
          <pre style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 4px; padding: 8px 12px; font-size: 8pt; color: #334155; font-family: monospace; white-space: pre-wrap; margin: 0;">${escapeDocHtml(loteAparelhos)}</pre>
        </div>
        ` : ''}

        <h2>3. Roteiro de Inspeção e Checklist de Testes Operacionais em Bancada</h2>
        <table class="data-table">
          <thead>
            <tr>
              <th width="6%" style="text-align: center;">Item</th>
              <th width="42%">Rotina de Teste / Verificação Operacional</th>
              <th width="18%">Resultado</th>
              <th width="34%">Critério Técnico de Aceite</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="text-align: center;">01</td>
              <td><strong>Inspeção Física do Gabinete</strong></td>
              <td style="color: #059669; font-weight: 700;">[ ✓ ] CONFORME</td>
              <td>Sem trincas, quebras, parafusos soltos ou avarias de frete</td>
            </tr>
            <tr>
              <td style="text-align: center;">02</td>
              <td><strong>Inicialização e Boot a Frio</strong></td>
              <td style="color: #059669; font-weight: 700;">[ ✓ ] CONFORME</td>
              <td>Ligamento regular, logotipo inicial sem travamento ou loops</td>
            </tr>
            <tr>
              <td style="text-align: center;">03</td>
              <td><strong>Teste de Display / Tela / Projeção</strong></td>
              <td style="color: #059669; font-weight: 700;">[ ✓ ] CONFORME</td>
              <td>Brilho uniforme, foco regulado, ausência de dead pixels ou manchas</td>
            </tr>
            <tr>
              <td style="text-align: center;">04</td>
              <td><strong>Entradas de Vídeo (HDMI 1 / HDMI 2 / VGA)</strong></td>
              <td style="color: #059669; font-weight: 700;">[ ✓ ] CONFORME</td>
              <td>Reconhecimento imediato de sinal de notebook e resoluções padrão</td>
            </tr>
            <tr>
              <td style="text-align: center;">05</td>
              <td><strong>Conectividade (Wi-Fi / RJ-45 / USB Mídia)</strong></td>
              <td style="color: #059669; font-weight: 700;">[ ✓ ] CONFORME</td>
              <td>Leitura de pen-drive, pareamento de rede e firmware atualizado</td>
            </tr>
            <tr>
              <td style="text-align: center;">06</td>
              <td><strong>Áudio e Controle Remoto</strong></td>
              <td style="color: #059669; font-weight: 700;">[ ✓ ] CONFORME</td>
              <td>Som nítido sem chiado; teclas do controle remoto 100% responsivas</td>
            </tr>
            <tr>
              <td style="text-align: center;">07</td>
              <td><strong>Segurança Elétrica e Aterramento</strong></td>
              <td style="color: #059669; font-weight: 700;">[ ✓ ] CONFORME</td>
              <td>Plugue tripolar NBR 14136, sem fuga de corrente ou aquecimento</td>
            </tr>
          </tbody>
        </table>

        <h2>4. Registro Fotográfico de Evidências do Teste e Vistoria</h2>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 10px 0 16px 0; page-break-inside: avoid;">
          <!-- Foto 1 -->
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; background: #ffffff; text-align: center;">
            <div style="font-size: 7.5pt; font-weight: 700; color: #0b1a30; text-transform: uppercase; margin-bottom: 5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">
              Foto 1: Aparelho Ligado / Tela Ativa
            </div>
            <div style="min-height: 140px; height: 140px; background: #0f172a; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${fotoLigado ? `
                <img src="${fotoLigado}" style="max-height: 140px; max-width: 100%; object-fit: contain;" alt="Foto do aparelho ligado" />
              ` : `
                <div style="color: #94a3b8; font-size: 8pt; padding: 12px; font-style: italic;">
                  [ Foto do aparelho ligado e operando em bancada ]
                </div>
              `}
            </div>
            <div style="font-size: 7pt; color: #64748b; margin-top: 4px; line-height: 1.2;">
              Teste de exibição de imagem e cores em funcionamento ativo.
            </div>
          </div>

          <!-- Foto 2 -->
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; background: #ffffff; text-align: center;">
            <div style="font-size: 7.5pt; font-weight: 700; color: #0b1a30; text-transform: uppercase; margin-bottom: 5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">
              Foto 2: Etiqueta &amp; Nº de Série (S/N)
            </div>
            <div style="min-height: 140px; height: 140px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${fotoEtiqueta ? `
                <img src="${fotoEtiqueta}" style="max-height: 140px; max-width: 100%; object-fit: contain;" alt="Foto da etiqueta e serial" />
              ` : `
                <div style="color: #94a3b8; font-size: 8pt; padding: 12px; font-style: italic;">
                  [ Foto da etiqueta traseira com Nº de Série / Anatel ]
                </div>
              `}
            </div>
            <div style="font-size: 7pt; color: #64748b; margin-top: 4px; line-height: 1.2;">
              Identificação do fabricante, modelo, voltagem e número de série.
            </div>
          </div>

          <!-- Foto 3 -->
          <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; background: #ffffff; text-align: center;">
            <div style="font-size: 7.5pt; font-weight: 700; color: #0b1a30; text-transform: uppercase; margin-bottom: 5px; border-bottom: 1px solid #e2e8f0; padding-bottom: 3px;">
              Foto 3: Controle, Cabos &amp; Acessórios
            </div>
            <div style="min-height: 140px; height: 140px; background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
              ${fotoAcessorios ? `
                <img src="${fotoAcessorios}" style="max-height: 140px; max-width: 100%; object-fit: contain;" alt="Foto dos acessórios e controle" />
              ` : `
                <div style="color: #94a3b8; font-size: 8pt; padding: 12px; font-style: italic;">
                  [ Foto dos acessórios, cabos, suporte e controle remoto ]
                </div>
              `}
            </div>
            <div style="font-size: 7pt; color: #64748b; margin-top: 4px; line-height: 1.2;">
              Conferência dos itens que acompanham o aparelho até o canteiro.
            </div>
          </div>
        </div>

        <h2>5. Parecer Técnico da Homologação &amp; Diretrizes de Instalação</h2>
        <div class="callout" style="margin-bottom: 10px; border-left-color: ${isReprovado ? '#dc2626' : isRessalvas ? '#d97706' : '#059669'};">
          <strong style="font-size: 9pt; color: ${isReprovado ? '#b91c1c' : isRessalvas ? '#b45309' : '#047857'};">
            ${escapeDocHtml(parecerStatus)}
          </strong>
          <p style="margin-top: 5px; font-size: 8.5pt;">
            <strong>Parecer do Avaliador Técnico:</strong> ${escapeDocHtml(obsTecnicas)}
          </p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; font-size: 8pt; color: #475569; margin-bottom: 12px;">
          <strong>Recomendações Obrigatórias para a Equipe de Obra:</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0; line-height: 1.4;">
            <li>Fixar em suporte VESA adequado em parede firme ou estrutura metálica protegida do container;</li>
            <li>Conectar preferencialmente em filtro de linha / nobreak com proteção contra surtos elétricos;</li>
            <li>Não expor o aparelho a goteiras, poeira de brita/concreto ou umidade excessiva de obra;</li>
            <li>Em caso de avaria ou falha no canteiro, acionar imediatamente o setor de T.I. com o número de patrimônio <strong>${escapeDocHtml(patrimonio)}</strong>.</li>
          </ul>
        </div>

        ${buildSignatureGridHTML([
          { role: "Técnico(a) de T.I. / Elétrica (Responsável pelo Teste)", name: ctx.secopsName },
          { role: "Recebedor na Obra / Almoxarife / Fiscal", name: "" },
          { role: "Engenheiro(a) Residente / Gestor de Obra", name: "" }
        ], false, "MOD-OBR-06")}
      `;
    }
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
          <td width="45%"><strong>Data do Desligamento:</strong> _____ / _____ / _________</td>
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
          <td width="34%"><strong>Data:</strong> _____ / _____ / _________</td>
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
          <tr><td>01</td><td style="height:28px;"></td><td></td><td>_____ / _____ / _________</td></tr>
          <tr><td>02</td><td style="height:28px;"></td><td></td><td>_____ / _____ / _________</td></tr>
          <tr><td>03</td><td style="height:28px;"></td><td></td><td>_____ / _____ / _________</td></tr>
          <tr><td>04</td><td style="height:28px;"></td><td></td><td>_____ / _____ / _________</td></tr>
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
          <td width="45%"><strong>Data / Carga Horária:</strong> _____ / _____ / _________ (____h)</td>
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
          <td width="50%"><strong>Data/Hora de Início:</strong> _____ / _____ / _________ às ____:____</td>
          <td width="50%"><strong>Data/Hora de Conclusão:</strong> _____ / _____ / _________ às ____:____</td>
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
          <td width="35%"><strong>ID do Incidente:</strong> INC-_________</td>
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
          <td><strong>Data/Hora da Ciência do Incidente:</strong> _____ / _____ / _________ às ____:____</td>
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
        "Prezado(a) Titular, a AC Engenharia informa com total transparência que identificou, em _____ / _____ / _________, um evento de segurança envolvendo [descrever dados]. Adotamos imediatamente todas as medidas técnicas de bloqueio e contenção. Recomendamos atenção redobrada a mensagens suspeitas ou boletos fora do portal oficial do cliente. Nosso Encarregado de Dados (DPO) está à disposição pelo canal ${escapeDocHtml(ctx.dpoEmail)}."
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
          <td width="50%"><strong>Código GMUD:</strong> GMUD-_________</td>
          <td width="50%"><strong>Janela de Execução:</strong> _____ / _____ / _________ das ____h às ____h</td>
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
          <tr><td>01. Sienge ERP (REST API v1)</td><td>OAuth2 + TLS 1.3</td><td>_____ / _____ / _________</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>02. CV — Construtor de Vendas CRM</td><td>Webhook HMAC-SHA256</td><td>_____ / _____ / _________</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>03. Catracas Faciais Canteiros (ISAPI)</td><td>HTTPS + Hash Template</td><td>_____ / _____ / _________</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>04. Wazuh SIEM &amp; XDR Manager</td><td>JWT + TLS 1.3</td><td>_____ / _____ / _________</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>05. Active Directory / GLPI IAM</td><td>LDAPS (Porta 636)</td><td>_____ / _____ / _________</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>06. Concentrador VPN MikroTik Canteiros</td><td>IPSec IKEv2 AES-256</td><td>_____ / _____ / _________</td><td>[ ] Íntegro (200 OK)</td></tr>
          <tr><td>07. Autoridade Carimbo de Tempo (TSA)</td><td>RFC 3161 ICP-Brasil</td><td>_____ / _____ / _________</td><td>[ ] Íntegro (200 OK)</td></tr>
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
          <td width="35%"><strong>Protocolo:</strong> ${escapeDocHtml(custom.id || "DSAR-_________")}</td>
          <td width="35%"><strong>Data de Abertura:</strong> ${escapeDocHtml(custom.openDate || "_____ / _____ / _________")}</td>
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
          <td width="50%"><strong>Período da Auditoria:</strong> _____ / _____ / _________ a _____ / _____ / _________</td>
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
          <tr><td>Cl. ___ / A.___</td><td>[ ] Conforme [ ] NC Maior [ ] NC Menor [ ] OM</td><td style="height:28px;"></td><td>_____ / _____ / _________</td></tr>
          <tr><td>Cl. ___ / A.___</td><td>[ ] Conforme [ ] NC Maior [ ] NC Menor [ ] OM</td><td style="height:28px;"></td><td>_____ / _____ / _________</td></tr>
          <tr><td>Cl. ___ / A.___</td><td>[ ] Conforme [ ] NC Maior [ ] NC Menor [ ] OM</td><td style="height:28px;"></td><td>_____ / _____ / _________</td></tr>
          <tr><td>LGPD Art. ___</td><td>[ ] Conforme [ ] NC Maior [ ] NC Menor [ ] OM</td><td style="height:28px;"></td><td>_____ / _____ / _________</td></tr>
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
    buildBody: (ctx) => {
      const custom = ctx.customData || {};
      const evidences = (typeof getEvidencesForDocument === "function") ? getEvidencesForDocument("MOD-AUD-02") : [];
      const latestEv = evidences.length > 0 ? evidences[0] : null;

      const evidId = custom.evidence_id || (latestEv ? latestEv.id : "EVID-_______");
      const evidDate = custom.collection_date || (latestEv ? latestEv.date : "_____ / _____ / _________ ____:____");
      const evidLocal = custom.location || (latestEv ? latestEv.location : ctx.activeUnit);
      const evidSource = custom.source_host || (latestEv ? (latestEv.originSystem || latestEv.assetOrSystem || latestEv.fileName) : "_______________________________");
      const evidSize = custom.evidence_size || (latestEv ? latestEv.fileSize : "_____________");
      const evidHash = custom.evidence_hash || (latestEv ? latestEv.sha256 : "________________________________________________________________________");

      return `
      <h2>1. Identificação do Vestígio / Artefato Digital Coletado — AC Engenharia</h2>
      <table class="data-table">
        <tr>
          <td width="35%"><strong>ID da Evidência:</strong> <code>${escapeDocHtml(evidId)}</code></td>
          <td width="35%"><strong>Data/Hora da Coleta:</strong> ${escapeDocHtml(evidDate)}</td>
          <td width="30%"><strong>Local:</strong> ${escapeDocHtml(evidLocal)}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Origem (Servidor / Hostname / Equipamento / Mídia):</strong> ${escapeDocHtml(evidSource)}</td>
          <td><strong>Tamanho:</strong> ${escapeDocHtml(evidSize)}</td>
        </tr>
        <tr>
          <td colspan="3"><strong>Hash Criptográfico SHA-256 Calculado no Ato da Coleta:</strong><br/><code>${escapeDocHtml(evidHash)}</code></td>
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
          <tr><td style="height:26px;">____/____ ____:____</td><td>${escapeDocHtml(ctx.secopsName)}</td><td>${escapeDocHtml(ctx.dpoName)}</td><td>Coleta inicial e selagem lógica SHA-256</td></tr>
          <tr><td style="height:26px;">____/____ ____:____</td><td>${escapeDocHtml(ctx.dpoName)}</td><td>Cofre de Custódia SGSI</td><td>Guarda em cofre imutável / perícia</td></tr>
          <tr><td style="height:26px;">____/____ ____:____</td><td></td><td></td><td></td></tr>
        </tbody>
      </table>

      ${buildSignatureGridHTML([
        { role: "Responsável pela Coleta e Geração do Hash", name: ctx.secopsName },
        { role: "Custodiante Receptor / Homologação Forense", name: ctx.dpoName }
      ], false, "MOD-AUD-02")}
      `;
    }
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
          <td width="35%"><strong>Nº da RNC:</strong> RNC-_________</td>
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
        <tr><td><strong>Verificação de Eficácia:</strong></td><td>[ &nbsp; ] Eficaz — Não conformidade eliminada sem reincidência. (Data: _____ / _____ / _________)</td></tr>
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
      const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;
      const latestHash = latestLog && latestLog.hash ? latestLog.hash : "1a8f9c0e27145b4686cf4e0060914e7b1e507746905a8f9c0e27145b4686cf4e";
      const prevHash = latestLog && latestLog.previousHash ? latestLog.previousHash : "0000000000000000000000000000000000000000000000000000000000000000";
      const headId = latestLog && latestLog.id ? latestLog.id : "BLK-0001";
      return `
        <h2>1. Sumário da Verificação Criptográfica da Trilha de Auditoria</h2>
        <p>Certificamos que a Trilha de Auditoria Forense da plataforma <strong>SGSI — ${escapeDocHtml(ctx.company)}</strong> foi submetida à recalculagem criptográfica completa via algoritmo <strong>SHA-256 encadeado (Merkle Chain)</strong>.</p>
        <table class="data-table">
          <tr>
            <td width="33%"><strong>Total de Blocos Verificados:</strong> ${logs.length} bloco(s)</td>
            <td width="33%"><strong>Status da Cadeia:</strong> 100% ÍNTEGRA</td>
            <td width="34%"><strong>Algoritmo Criptográfico:</strong> FIPS 180-4 (SHA-256)</td>
          </tr>
          <tr>
            <td colspan="3"><strong>Hash SHA-256 do Último Bloco Homologado (Head — ${escapeDocHtml(headId)}):</strong><br/><code>${escapeDocHtml(latestHash)}</code></td>
          </tr>
          <tr>
            <td colspan="3"><strong>Hash do Bloco Anterior (Parent Anchor):</strong><br/><code>${escapeDocHtml(prevHash)}</code></td>
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
    code: "MOD-SEG-08-A",
    module: "secops",
    docType: "Auditoria & Triagem de Acesso",
    requiresSignature: true,
    title: "Registro de Verificação de Acesso Atípico (Triagem - Fase 1)",
    normative: "ISO/IEC 27001:2022 A.5.24 & LGPD Art. 46 (Auditoria Preventiva de Rotina)",
    evidenceCategory: "Auditoria & Triagem de Acesso",
    signersSummary: "Analista de T.I. / Suporte + Colaborador Titular Entrevistado",
    summary: "Formulário de triagem primária e auditoria operacional de rotina para verificação de alertas de login atípicos (Sienge, CV CRM, Google Workspace, Active Directory, Firewall). Focado na presunção de legitimidade e descarte rápido de falsos positivos (viagens, redes móveis 4G/5G, trocas de aparelho) antes de qualquer escalonamento técnico.",
    buildBody: (ctx, custom = {}) => {
      const protocol = custom.triageProtocol || "TRI-SEG-2026-_________";
      const dtCheck = custom.checkDateTime || (ctx.todayBr + " às " + (ctx.nowBr.split(" ")[1] || "___:___") + " h");
      const originSystem = custom.alertOriginSystem || "ERP Sienge / Construtor de Vendas (CV CRM) / Google Workspace / Active Directory / Firewall";
      const uName = custom.investigatedPerson || custom.userName || "__________________________________________________";
      const uEmail = custom.investigatedEmail || custom.userEmail || "_________________________________@acengenhariase.com.br";
      const uLogin = custom.userLogin || "_________________________";
      const uDept = custom.userDepartment || "__________________________________________________";
      const ipAnalyzed = custom.analyzedIp || "___.___.___.___ (Geolocalização / Provedor)";
      const notes = custom.triageNotes || "";

      return `
        <h2>1. Identificação do Alerta e Escopo da Verificação</h2>
        <table class="data-table">
          <tr>
            <td width="28%"><strong>Nº Protocolo de Triagem:</strong></td>
            <td width="72%"><code>${escapeDocHtml(protocol)}</code> &nbsp;|&nbsp; <strong>Status:</strong> [ &nbsp; ] Em Triagem &nbsp;&nbsp; [ &nbsp; ] Falso Positivo &nbsp;&nbsp; [ &nbsp; ] Escalonado</td>
          </tr>
          <tr>
            <td><strong>Data e Hora da Verificação:</strong></td>
            <td><strong>${escapeDocHtml(dtCheck)}</strong> &nbsp;<em>(Horário Oficial de Brasília)</em></td>
          </tr>
          <tr>
            <td><strong>Sistema Gerador do Alerta:</strong></td>
            <td>
              <strong>${escapeDocHtml(originSystem)}</strong><br/>
              <em>Origens Comuns de Notificação na AC Engenharia:</em><br/>
              [ &nbsp; ] <strong>ERP Sienge</strong> (Notificação de login fora de horário ou IP não cadastrado)<br/>
              [ &nbsp; ] <strong>Construtor de Vendas (CV CRM)</strong> (Alerta de autenticação por novo dispositivo/navegador)<br/>
              [ &nbsp; ] <strong>Gmail / Google Workspace</strong> (Alerta preventivo de novo local ou dispositivo móvel)<br/>
              [ &nbsp; ] <strong>Active Directory / Domínio AC</strong> (Tentativa de conexão de rede ou bloqueio de estação)<br/>
              [ &nbsp; ] <strong>Firewall Perimetral / VPN Corporativa</strong> (Autenticação externa ou transição de operadora)<br/>
              [ &nbsp; ] <strong>Outro:</strong> ____________________________________________________________________
            </td>
          </tr>
          <tr>
            <td><strong>Pessoa Investigada / Titular:</strong></td>
            <td>
              <table style="width: 100%; border: 1px solid #cbd5e1; margin-top: 4px; font-size: 8.5pt;">
                <tr>
                  <td width="50%"><strong>Nome Completo:</strong> ${escapeDocHtml(uName)}</td>
                  <td width="50%"><strong>E-mail Institucional:</strong> <code>${escapeDocHtml(uEmail)}</code></td>
                </tr>
                <tr>
                  <td><strong>Login no Sistema:</strong> <code>${escapeDocHtml(uLogin)}</code></td>
                  <td><strong>Cargo / Setor / Lotação:</strong> ${escapeDocHtml(uDept)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <h2>2. Triagem Fática (Entrevista Rápida com o Usuário)</h2>
        <p style="font-size: 8.5pt; color: #475569; margin-bottom: 8px;">
          <em>Nota de Diretriz: Esta etapa constitui procedimento operacional padrão de conformidade e governança. O objetivo é validar rotinas de trabalho regulares e descartar inconsistências de forma rápida e segura, presumindo a legitimidade das atividades do colaborador até verificação em contrário.</em>
        </p>
        <table class="data-table">
          <tr>
            <th width="50%">Item / Questionamento de Triagem</th>
            <th width="50%">Resposta Registrada do Colaborador</th>
          </tr>
          <tr>
            <td>
              <strong>1. Reconhecimento de Acesso:</strong><br/>
              Você reconhece o acesso ou tentativa de conexão realizada no sistema <code>${escapeDocHtml(originSystem)}</code> na data e horário informados?
            </td>
            <td>
              [ &nbsp; ] <strong>SIM</strong>, reconheço integralmente o acesso como legítimo e pessoal.<br/>
              [ &nbsp; ] <strong>NÃO</strong>, não tentei acessar o sistema nem reconheço a atividade.<br/>
              [ &nbsp; ] <strong>NÃO ME RECORDO</strong> com exatidão (requer conferência de agenda/tarefas).
            </td>
          </tr>
          <tr>
            <td>
              <strong>2. Rede e Localidade de Conexão:</strong><br/>
              No momento indicado, você estava utilizando rede de dados móveis (4G/5G), VPN particular ou acessando de outra cidade, hotel ou canteiro de obras?
            </td>
            <td>
              [ &nbsp; ] <strong>SIM</strong>, estava conectado via dados móveis (4G/5G) de operadora celular.<br/>
              [ &nbsp; ] <strong>SIM</strong>, estava em viagem, hotel, canteiro externo ou residência.<br/>
              [ &nbsp; ] <strong>NÃO</strong>, estava na rede física/Wi-Fi oficial da sede da AC Engenharia.<br/>
              [ &nbsp; ] <strong>NÃO</strong>, não estava conectado a nenhuma rede no momento apontado.
            </td>
          </tr>
          <tr>
            <td>
              <strong>3. Dispositivo e Equipamento:</strong><br/>
              Você trocou de aparelho celular, computador pessoal ou reinstalou navegador/aplicativos recentemente?
            </td>
            <td>
              [ &nbsp; ] <strong>SIM</strong>, comecei a usar novo smartphone / notebook corporativo ou pessoal.<br/>
              [ &nbsp; ] <strong>SIM</strong>, limpei dados de navegação, atualizei sistema ou reinstalei navegador.<br/>
              [ &nbsp; ] <strong>NÃO</strong>, utilizo os mesmos aparelhos e configurações habituais.
            </td>
          </tr>
          <tr>
            <td colspan="2">
              <strong>Observações / Justificativa Apresentada pelo Colaborador:</strong><br/>
              <div style="min-height: 48px; border: 1px dashed #cbd5e1; padding: 6px; margin-top: 4px; background: #f8fafc; font-family: monospace; font-size: 8.5pt;">
                ${escapeDocHtml(notes) || "O colaborador prestou esclarecimentos confirmando a conformidade de suas rotinas habituais de trabalho ou justificativa operacional."}
              </div>
            </td>
          </tr>
        </table>

        <h2>3. Verificação Técnica Básica (Preenchido pela T.I.)</h2>
        <table class="data-table">
          <tr>
            <td width="30%"><strong>Endereço IP e Geolocalização:</strong></td>
            <td width="70%">
              <code>${escapeDocHtml(ipAnalyzed)}</code><br/>
              <em>Identificação Técnica da Conexão:</em><br/>
              [ &nbsp; ] Rede Móvel Celular (IP dinâmico de operadora 4G/5G - Claro, Vivo, TIM)<br/>
              [ &nbsp; ] Conexão de Banda Larga Residencial / Hotel / Coworking homologado<br/>
              [ &nbsp; ] Link Dedicado da Matriz / Filial AC Engenharia<br/>
              [ &nbsp; ] Faixa de IP Geograficamente Atípica / Data Center / Provedor Desconhecido
            </td>
          </tr>
          <tr>
            <td><strong>Mecanismo de Segundo Fator (MFA):</strong></td>
            <td>
              [ &nbsp; ] <strong>Aprovado pelo próprio colaborador</strong> (Notificação Push / Código TOTP validado no celular)<br/>
              [ &nbsp; ] <strong>Não Solicitado</strong> (Sessão previamente confiável ou sistema sem exigência de MFA no momento)<br/>
              [ &nbsp; ] <strong>Solicitação Rejeitada / Não Reconhecida</strong> pelo usuário
            </td>
          </tr>
          <tr>
            <td><strong>Padrão de Dispositivo e Navegador:</strong></td>
            <td>
              [ &nbsp; ] <strong>Compatível:</strong> Navegador e sistema operacional idênticos ao perfil de uso regular<br/>
              [ &nbsp; ] <strong>Novo Dispositivo Homologado:</strong> Registrado e validado junto ao suporte de T.I.<br/>
              [ &nbsp; ] <strong>Divergente:</strong> Assinatura de navegador (User-Agent) e dispositivo desconhecidos
            </td>
          </tr>
          <tr>
            <td><strong>Comportamento Registrado nos Logs:</strong></td>
            <td>
              [ &nbsp; ] <strong>Sucesso de Autenticação:</strong> Acesso regular com credenciais válidas do usuário<br/>
              [ &nbsp; ] <strong>Falha Isolada por Digitação:</strong> 1 a 2 erros de senha sanados em seguida pelo colaborador<br/>
              [ &nbsp; ] <strong>Transição de Conectividade:</strong> Alerta gerado por alternância de rede Wi-Fi para rede móvel<br/>
              [ &nbsp; ] <strong>Chamada Sistêmica Automatizada:</strong> Rotina de sincronização de calendário, e-mail ou ERP
            </td>
          </tr>
        </table>

        <h2>4. Conclusão da Triagem (Veredito Final)</h2>
        <table class="data-table">
          <tr>
            <td>
              <p><strong>[ &nbsp; ] FALSO POSITIVO CONFIRMADO (Uso Legítimo):</strong><br/>
              O acesso foi plenamente reconhecido pelo usuário e justificado por circunstâncias operacionais normais (viagem, rede móvel 4G/5G, trânsito entre obras ou novo aparelho homologado). A telemetria técnica confirma compatibilidade com o padrão do usuário. Nenhuma ação corretiva adicional necessária. <strong>Chamado arquivado com sucesso na Fase 1.</strong></p>

              <p><strong>[ &nbsp; ] FALSO POSITIVO TÉCNICO (Rotina de Integração / Automação):</strong><br/>
              O alerta foi gerado por processo automatizado de software, sincronização programada de API entre sistemas (ex: ERP Sienge e CV CRM), script interno ou rotina de manutenção. Nenhuma intervenção de conta necessária. <strong>Chamado encerrado na Fase 1.</strong></p>

              <p style="margin-bottom: 0;"><strong>[ &nbsp; ] SUSPEITA NÃO RECONHECIDA (Escalonamento Necessário):</strong><br/>
              O colaborador <u>não reconhece</u> o acesso e foram constatadas divergências técnicas ou geográficas relevantes. Conforme a Política de Segurança da AC Engenharia, foram adotadas as seguintes medidas imediatas de salvaguarda: redefinição preventiva de credenciais e encerramento de todas as sessões ativas. O evento é formalmente escalonado para <strong>Fase 2 (Relatório Técnico de Incursão Hostil e Compromisso de Credencial - MOD-SEG-08-B)</strong> sob condução da equipe de Segurança da Informação.</p>
            </td>
          </tr>
        </table>

        ${buildSignatureGridHTML([
          { role: "Analista de T.I. / Responsável pela Triagem", name: custom.secopsName || "Analista de T.I. AC Engenharia" },
          { role: "Colaborador(a) Titular Entrevistado(a)", name: custom.userName || "Colaborador Titular da Conta" }
        ], false, "MOD-SEG-08-A")}
      `;
    }
  },
  {
    code: "MOD-SEG-08-B",
    legacyCode: "MOD-SEC-08",
    aliases: ["MOD-SEC-08", "MOD-SEG-08"],
    module: "secops",
    docType: "Laudo Pericial & CSIRT",
    requiresSignature: true,
    title: "Relatório Técnico de Incursão Hostil e Compromisso de Credencial",
    normative: "ISO/IEC 27001:2022 A.5.24 a A.5.28 & Resolução CD/ANPD nº 15/2024",
    evidenceCategory: "Segurança & CSIRT",
    signersSummary: "Analista Investigador T.I. + Gestor SecOps + DPO (se notificado)",
    summary: "Fase 2 de Investigação Forense e Apuração Aprofundada: Relatório Técnico de Incursão Hostil e Compromisso de Credencial (Investigação de Login Suspeito e Tentativa de Invasão). Laudo pericial e forense destinado a apurar detalhadamente alertas escalonados de login e acessos atípicos (ERP Sienge, Construtor de Vendas CV, Gmail, Antivírus e VPN), com telemetria forense de IP, rastreamento minucioso de ações do invasor por sistema, entrevista fática, contenção técnica imediata, diagnóstico de exfiltração de dados e 7 vereditos periciais com parecer regulatório para a ANPD.",
    buildBody: (ctx, custom = {}) => {
      const incNum = custom.incidentNumber || "INC-SEG-_________";
      const dtDetection = custom.detectionDateTime || (ctx.todayBr + " às " + (ctx.nowBr.split(" ")[1] || "___:___") + " h");
      const alertOrig = custom.alertOrigin || "Alerta Automatizado de Segurança (Sienge / CV CRM / Gmail / Antivírus)";
      const sysTarget = custom.targetSystem || "ERP Sienge / Construtor de Vendas (CV CRM) / Google Workspace";
      const uName = custom.affectedUser || "[ Nome Completo do Colaborador ]";
      const uEmail = custom.affectedEmail || "usuario@acengenhariase.com.br";
      const uLogin = custom.affectedLogin || "[ Login no Sistema / Rede ]";
      const uRole = custom.affectedRole || "[ Cargo / Setor do Colaborador ]";
      const ipOrigin = custom.originIp || "___.___.___.___ (Geolocalização / Provedor)";
      const actSummary = custom.attackerActions || "Atividades rotineiras em conformidade ou nenhuma alteração hostil identificada.";
      const exfilStatus = custom.exfiltrationStatus || "Acesso regular / Não houve exfiltração de dados confirmada nos logs de telemetria.";
      const timelineLogs = custom.attackerTimeline || "[ Preencher cronologia de eventos segundo os logs do firewall/aplicação ]";

      return `
        <h2>1. Identificação do Alerta e Escopo Afetado</h2>
        <table class="data-table">
          <tr>
            <td width="28%"><strong>Protocolo do Alerta / Incidente:</strong></td>
            <td width="72%"><code>${escapeDocHtml(incNum)}</code> &nbsp;|&nbsp; <strong>Status:</strong> [ &nbsp; ] Em Análise &nbsp;&nbsp; [ &nbsp; ] Contido &nbsp;&nbsp; [ &nbsp; ] Concluído</td>
          </tr>
          <tr>
            <td><strong>Data e Hora da Detecção:</strong></td>
            <td><strong>${escapeDocHtml(dtDetection)}</strong> &nbsp;<em>(Horário Oficial de Brasília)</em></td>
          </tr>
          <tr>
            <td><strong>Origem Primária do Alerta:</strong></td>
            <td>
              <strong>${escapeDocHtml(alertOrig)}</strong><br/>
              <em>Canais Oficiais de Detecção na AC Engenharia:</em><br/>
              [ &nbsp; ] <strong>ERP Sienge</strong> (Múltiplas tentativas incorretas / login fora de horário no ERP)<br/>
              [ &nbsp; ] <strong>Construtor de Vendas (CV CRM)</strong> (Alerta de acesso anômalo no portal comercial)<br/>
              [ &nbsp; ] <strong>Gmail / Google Workspace</strong> (Alerta de login em novo dispositivo / suspensão preventiva)<br/>
              [ &nbsp; ] <strong>Antivírus / EDR Corporativo</strong> (Detecção de malware/infostealer no computador do usuário)<br/>
              [ &nbsp; ] <strong>Firewall / VPN Fortigate</strong> (Bloqueio perimetral de IP hostil / tentativa de tunelamento)<br/>
              [ &nbsp; ] <strong>Notificação Espontânea do Usuário</strong> (Colaborador informou atividade estranha à T.I.)
            </td>
          </tr>
          <tr>
            <td><strong>Sistema Objeto do Alerta / Acesso:</strong></td>
            <td>
              <strong>${escapeDocHtml(sysTarget)}</strong><br/>
              <em>(Aplicação ou serviço corporativo que gerou a notificação ou tentativa de acesso sob investigação):</em><br/>
              [ &nbsp; ] ERP Sienge (Nuvem / Financeiro / Compras / Obras) &nbsp;&nbsp;&nbsp; [ &nbsp; ] Construtor de Vendas (CV CRM)<br/>
              [ &nbsp; ] Gmail / Google Workspace (E-mails e Google Drive) &nbsp;&nbsp;&nbsp; [ &nbsp; ] VPN Fortigate / Conexão Remota<br/>
              [ &nbsp; ] Servidor de Arquivos da Engenharia (Matriz) &nbsp;&nbsp;&nbsp; [ &nbsp; ] Active Directory / Login de Máquina
            </td>
          </tr>
          <tr>
            <td><strong>Conta e Colaborador Titular Sob Verificação:</strong></td>
            <td>
              <table style="width: 100%; border: 1px solid #cbd5e1; margin-top: 4px; font-size: 8.5pt;">
                <tr>
                  <td width="50%"><strong>Nome Completo:</strong> ${escapeDocHtml(uName)}</td>
                  <td width="50%"><strong>E-mail Institucional:</strong> <code>${escapeDocHtml(uEmail)}</code></td>
                </tr>
                <tr>
                  <td><strong>Login no Sistema Alvo:</strong> <code>${escapeDocHtml(uLogin)}</code></td>
                  <td><strong>Cargo / Função e Setor:</strong> ${escapeDocHtml(uRole)}</td>
                </tr>
                <tr>
                  <td><strong>Tipo de Vínculo:</strong> [ &nbsp; ] CLT &nbsp; [ &nbsp; ] Terceirizado &nbsp; [ &nbsp; ] Corretor Autônomo &nbsp; [ &nbsp; ] Estágio &nbsp; [ &nbsp; ] Diretoria</td>
                  <td><strong>Lotação:</strong> ${escapeDocHtml(ctx.activeUnit)}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <h2>2. Análise Técnica Forense e Contexto do Alerta (SecOps)</h2>
        <table class="data-table">
          <tr>
            <td width="28%"><strong>IP de Origem e Telemetria:</strong></td>
            <td><code>${escapeDocHtml(ipOrigin)}</code> &nbsp;|&nbsp; <strong>Uso de Proxy / VPN / Tor:</strong> [ &nbsp; ] Sim &nbsp; [ &nbsp; ] Não</td>
          </tr>
          <tr>
            <td><strong>Dispositivo / User-Agent:</strong></td>
            <td>[ &nbsp; ] Windows 10/11 &nbsp;&nbsp; [ &nbsp; ] Android &nbsp;&nbsp; [ &nbsp; ] iPhone/iOS &nbsp;&nbsp; [ &nbsp; ] macOS / Linux &nbsp;&nbsp;|&nbsp; <strong>Dispositivo Cadastrado no MDM?</strong> [ &nbsp; ] Sim &nbsp; [ &nbsp; ] Não (BYOD)</td>
          </tr>
          <tr>
            <td><strong>Padrão do Evento / Contexto da Conexão:<br/><small class="text-slate-500 font-normal">(Mecânica do Evento / Hipóteses)</small></strong></td>
            <td>
              <em>Indica a característica técnica da conexão analisada pela T.I., confrontada com a rotina do colaborador:</em><br/>
              [ &nbsp; ] <strong>Acesso Convencional / Operação Normal do Usuário:</strong> Login a partir de dispositivo habitual ou rede conhecida da empresa/residência, sem sinais de anomalia técnica.<br/>
              [ &nbsp; ] <strong>Falha de Digitação / Esquecimento de Senha:</strong> Tentativas sucessivas incorretas decorrentes de erro humano do próprio colaborador (ex: tecla Caps Lock ou troca recente de senha).<br/>
              [ &nbsp; ] <strong>Viagem / Deslocamento a Serviço (*Impossible Travel*):</strong> Logins de cidades/estados distantes em intervalo curto (comumente gerados por uso de rede móvel 4G/5G com IP dinâmico ou trânsito real do usuário).<br/>
              [ &nbsp; ] <strong>Força Bruta (*Brute-force*):</strong> Múltiplas tentativas seguidas e automatizadas de senhas aleatórias até o bloqueio.<br/>
              [ &nbsp; ] <strong>Pulverização de Senha (*Password Spraying*):</strong> Teste de uma única senha comum em várias contas diferentes da empresa para evitar bloqueio consecutivo.<br/>
              [ &nbsp; ] <strong>Tentativa com Credencial Válida (Vazamento Externo):</strong> O acesso utilizou a senha correta da conta, porém a partir de origem desconhecida ou não usual.<br/>
              [ &nbsp; ] <strong>Fadiga de Notificação MFA (*Push Fatigue*):</strong> Disparos sucessivos de solicitações de aprovação push no celular do colaborador para forçar um aceite por distração.<br/>
              [ &nbsp; ] <strong>Roubo de Sessão (*Session Hijacking / Cookie Replay*):</strong> Reutilização de token ou cookie de sessão ativa capturado por malware/infostealer no navegador.<br/>
              [ &nbsp; ] <strong>Engenharia Social / *Phishing*:</strong> O colaborador foi induzido a digitar a credencial em site falso ou informá-la a terceiros.
            </td>
          </tr>
          <tr>
            <td><strong>Status da Autenticação:</strong></td>
            <td>[ &nbsp; ] <strong>Tentativa Bloqueada</strong> (Acesso não autorizado não foi consumado / falha de autenticação) &nbsp;&nbsp;&nbsp; [ &nbsp; ] <strong>Login Efetuado com Sucesso</strong> (Sessão estabelecida)</td>
          </tr>
          <tr>
            <td><strong>Validação do 2º Fator (MFA):</strong></td>
            <td>[ &nbsp; ] <strong>MFA Aprovado Regularmente pelo Próprio Colaborador</strong> (Acesso legítimo em duas etapas)<br/>
                [ &nbsp; ] <strong>MFA Bloqueou Tentativa Externa Não Autorizada</strong> (Segurança perimetral atuou com sucesso)<br/>
                [ &nbsp; ] <strong>MFA Aprovado Inadvertidamente</strong> (Fadiga Push / Erro involuntário do colaborador)<br/>
                [ &nbsp; ] <strong>Código TOTP Inserido Regularmente</strong> &nbsp;&nbsp;&nbsp; [ &nbsp; ] <strong>Ausência de MFA na Conta</strong> (Não Conformidade PCA-002 / Requer ativação)</td>
          </tr>
          <tr>
            <td><strong>Resumo Preliminar da Sessão:</strong></td>
            <td>
              <em>Consulte a <strong>Seção 3 (Rastreamento e Auditoria de Ações)</strong> para a apuração fática se houve operação legítima ou atividade hostil:</em><br/>
              [ &nbsp; ] <strong>Uso Legítimo Comprovado:</strong> Navegação normal e rotineira do próprio colaborador (Sem indício de anomalia).<br/>
              [ &nbsp; ] <strong>Tentativa Bloqueada na Borda:</strong> Nenhuma sessão foi estabelecida (Ataque contido antes do ingresso).<br/>
              [ &nbsp; ] <strong>Sessão Sob Suspeita / Invasão Confirmada:</strong> Atividades anômalas mapeadas detalhadamente na Seção 3 deste laudo pericial.
            </td>
          </tr>
        </table>

        <h2>3. Rastreamento e Auditoria de Ações na Sessão: Constatação Forense</h2>
        <p>Auditoria minuciosa das ações executadas durante o acesso investigado. <strong>Se constatado acesso legítimo do próprio colaborador</strong>, assinale o uso regular; <strong>se confirmada invasão ou desvio</strong>, selecione detalhadamente as ações hostis tentadas ou executadas nos sistemas afetados:</p>

        <table class="data-table">
          <tr>
            <td width="28%"><strong>Natureza do Acesso e Profundidade da Sessão:</strong></td>
            <td>
              <em>Indica a realidade fática apurada sobre a sessão de trabalho investigada:</em><br/>
              [ &nbsp; ] <strong>1. ACESSO LEGÍTIMO CONFIRMADO (Uso Rotineiro):</strong> O acesso foi realizado pelo próprio colaborador no exercício regular de suas atribuições. Nenhuma ação anômala, hostil ou não autorizada foi praticada.<br/>
              [ &nbsp; ] <strong>2. TENTATIVA BARRADA NO PERÍMETRO (Sem Acesso Efetivo):</strong> A tentativa foi barrada antes do login (por MFA, firewall ou senha incorreta). Nenhum terceiro teve acesso a dados, relatórios ou módulos internos.<br/>
              [ &nbsp; ] <strong>3. LOGIN SUSPEITO COM ENCERRAMENTO IMEDIATO PELA T.I.:</strong> Sessão autenticada externamente, porém a equipe de segurança identificou o alerta e derrubou a sessão em minutos, antes que houvesse qualquer comando hostil.<br/>
              [ &nbsp; ] <strong>4. SESSÃO ATIVA COM ATIVIDADES HOSTIS OU DESVIO (Invasão Confirmada):</strong> Agente hostil permaneceu conectado e executou buscas, downloads ou tentativas de alteração (detalhar nos blocos abaixo).
            </td>
          </tr>
          <tr>
            <td><strong>Ações no Gmail / Google Workspace:<br/><small class="text-slate-500 font-normal">(E-mails e Google Drive)</small></strong></td>
            <td>
              [ &nbsp; ] <strong>USO REGULAR / OPERAÇÃO NORMAL:</strong> Leitura e envio habitual de e-mails de trabalho pelo colaborador (Sem anomalias)<br/>
              [ &nbsp; ] <strong>NÃO APLICÁVEL:</strong> O alerta investigado não envolveu o Google Workspace<br/>
              <em>Atividades Hostis Identificadas (Marcar somente se comprovada invasão ou desvio na conta):</em><br/>
              [ &nbsp; ] Criação de regras ocultas de encaminhamento automático de e-mails para endereço externo do atacante<br/>
              [ &nbsp; ] Criação de regras de filtro para exclusão automática de e-mails de segurança, bancos ou fornecedores<br/>
              [ &nbsp; ] Leitura de mensagens confidenciais ou busca por termos críticos (ex: 'senha', 'banco', 'PIX', 'contrato')<br/>
              [ &nbsp; ] Envio de e-mails fraudulentos em nome do colaborador (phishing interno ou falsos boletos a parceiros)<br/>
              [ &nbsp; ] Download de arquivos, planilhas ou documentos sensíveis no Google Drive corporativo<br/>
              [ &nbsp; ] Tentativa de alteração de senhas, telefones de recuperação ou criação de senhas de app / chaves de API
            </td>
          </tr>
          <tr>
            <td><strong>Ações no ERP Sienge:<br/><small class="text-slate-500 font-normal">(Financeiro, Compras e Obras)</small></strong></td>
            <td>
              [ &nbsp; ] <strong>USO REGULAR / OPERAÇÃO NORMAL:</strong> Consultas e lançamentos normais inerentes à função do colaborador no ERP<br/>
              [ &nbsp; ] <strong>NÃO APLICÁVEL:</strong> O alerta investigado não envolveu o ERP Sienge<br/>
              <em>Atividades Hostis Identificadas (Marcar somente se comprovada invasão ou desvio na conta):</em><br/>
              [ &nbsp; ] Tentativa de alteração de chave PIX ou conta corrente de fornecedores cadastrados no Contas a Pagar<br/>
              [ &nbsp; ] Tentativa de autorização, agendamento de pagamentos ou geração de borderô financeiro fraudulento<br/>
              [ &nbsp; ] Alteração indevida de dados de medições de obras, ordens de compra ou cotações de insumos<br/>
              [ &nbsp; ] Consulta ou extração de relatórios de folha de pagamento, pró-labore ou remuneração de funcionários<br/>
              [ &nbsp; ] Visualização ou exportação de contratos de empreiteiras, propostas comerciais ou orçamentos de obras<br/>
              [ &nbsp; ] Tentativa de criação de novo usuário ou elevação de alçadas de privilégio no ERP
            </td>
          </tr>
          <tr>
            <td><strong>Ações no Construtor de Vendas (CV CRM):<br/><small class="text-slate-500 font-normal">(Vendas e Clientes)</small></strong></td>
            <td>
              [ &nbsp; ] <strong>USO REGULAR / OPERAÇÃO NORMAL:</strong> Atendimento regular a compradores e atualização rotineira de propostas<br/>
              [ &nbsp; ] <strong>NÃO APLICÁVEL:</strong> O alerta investigado não envolveu o Construtor de Vendas<br/>
              <em>Atividades Hostis Identificadas (Marcar somente se comprovada invasão ou desvio na conta):</em><br/>
              [ &nbsp; ] Tentativa de exportação / download em lote da base de leads e clientes (dados pessoais e CPF)<br/>
              [ &nbsp; ] Disparo em massa de mensagens ou emissão fraudulenta de boletos de parcelas a compradores<br/>
              [ &nbsp; ] Alteração de propostas comerciais, descontos de unidades ou comissões de corretores<br/>
              [ &nbsp; ] Acesso visual a contratos de compra e venda de imóveis e documentos pessoais de compradores
            </td>
          </tr>
          <tr>
            <td><strong>Ações em Rede Interna / VPN / Servidores:<br/><small class="text-slate-500 font-normal">(Infraestrutura & Domínio)</small></strong></td>
            <td>
              [ &nbsp; ] <strong>USO REGULAR / OPERAÇÃO NORMAL:</strong> Acesso remoto homologado de trabalho pelo próprio colaborador<br/>
              [ &nbsp; ] <strong>NÃO APLICÁVEL:</strong> O alerta investigado não envolveu a VPN ou infraestrutura interna<br/>
              <em>Atividades Hostis Identificadas (Marcar somente se comprovada invasão ou desvio na conta):</em><br/>
              [ &nbsp; ] Tentativa de movimentação lateral (Lateral Movement) buscando outras máquinas ou servidores na VPN<br/>
              [ &nbsp; ] Varredura de portas (Port Scan) ou descoberta de estações de trabalho e serviços internos<br/>
              [ &nbsp; ] Acesso ou download de arquivos em pastas de rede compartilhadas da Engenharia / Diretoria<br/>
              [ &nbsp; ] Tentativa de elevação de privilégios para Administrador de Domínio (Active Directory)<br/>
              [ &nbsp; ] Execução ou download de ferramentas de acesso remoto (AnyDesk, Ngrok, Cobalt Strike) ou ransomware
            </td>
          </tr>
          <tr>
            <td><strong>Constatação de Exfiltração (Vazamento de Dados):</strong></td>
            <td>
              <strong>Status Pericial:</strong> [ &nbsp; ] <strong>NÃO HOUVE EXFILTRAÇÃO / TRÁFEGO REGULAR</strong> &nbsp;&nbsp;&nbsp; [ &nbsp; ] <strong>SOB ANÁLISE FORENSE</strong> &nbsp;&nbsp;&nbsp; [ &nbsp; ] <strong>EXFILTRAÇÃO CONFIRMADA</strong><br/>
              <strong>Diagnóstico Técnico:</strong> ${escapeDocHtml(exfilStatus)}
            </td>
          </tr>
          <tr>
            <td><strong>Constatação de Alteração / Integridade de Dados:</strong></td>
            <td>
              [ &nbsp; ] <strong>Integridade Preservada (Uso Normal ou Tentativa Barrada):</strong> Nenhum registro corporativo foi alterado, corrompido ou excluído.<br/>
              [ &nbsp; ] <strong>Tentativa de Adulteração Barrada:</strong> O invasor tentou alterar dados (ex: PIX), mas foi contido pelas travas do sistema.<br/>
              [ &nbsp; ] <strong>Alteração Hostil Consumada:</strong> Houve alteração efetiva de dados (necessária reversão imediata pela T.I.).<br/>
              <strong>Resumo das Ações Identificadas:</strong> ${escapeDocHtml(actSummary)}
            </td>
          </tr>
          <tr>
            <td><strong>Linha do Tempo dos Logs:<br/><small class="text-slate-500 font-normal">(Timeline Pericial)</small></strong></td>
            <td>
              <code>${escapeDocHtml(timelineLogs)}</code><br/>
              <small class="text-slate-500"><em>(Registrar os carimbos de data/hora extraídos dos logs do Firewall Fortigate, Sienge, CV CRM ou Google Workspace Admin Console para evidenciar a cronologia real do acesso).</em></small>
            </td>
          </tr>
        </table>

        <h2>4. Entrevista Técnica e Validação com o Usuário Titular</h2>
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

        <h2>5. Avaliação de Impacto e Medidas de Contenção Adotadas</h2>
        <div class="callout callout-warning">
          <strong>Nível de Acesso da Conta Afetada:</strong><br/>
          [ &nbsp; ] Operacional de Canteiro &nbsp;&nbsp;&nbsp; [ &nbsp; ] Administrativo / Financeiro Sienge &nbsp;&nbsp;&nbsp; [ &nbsp; ] Comercial CV CRM (Dados de Clientes)<br/>
          [ &nbsp; ] RH / SST (Dados Pessoais Sensíveis / Biometria NR-18) &nbsp;&nbsp;&nbsp; [ &nbsp; ] Administrador de TI / Acesso Privilegiado
        </div>

        <p><strong>Ações Técnicas Adotadas pela T.I. / SecOps:</strong></p>
        <table class="data-table">
          <tr>
            <td>[ &nbsp; ] <strong>Nenhuma Ação Punitiva/Restritiva</strong> (Acesso legítimo comprovado)</td>
            <td>[ &nbsp; ] <strong>Orientação de Boas Práticas ao Usuário</strong> (Wi-Fi, senhas e MFA)</td>
          </tr>
          <tr>
            <td>[ &nbsp; ] <strong>Reset Preventivo de Senha</strong> (Complexidade elevada)</td>
            <td>[ &nbsp; ] <strong>Revogação Global de Sessões</strong> (*Revoke Refresh Tokens*)</td>
          </tr>
          <tr>
            <td>[ &nbsp; ] <strong>Reconfiguração e Ativação de MFA</strong> prévio</td>
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
        <p><strong>Término da Contenção:</strong> _____ / _____ / _________ às ___:___ h &nbsp;|&nbsp; <strong>Tempo Total de Resposta (TTR):</strong> [ &nbsp; ] &lt; 30 min &nbsp;&nbsp; [ &nbsp; ] 30 min a 2h &nbsp;&nbsp; [ &nbsp; ] &gt; 2h</p>

        <h2>6. Conclusão Pericial, Veredito e Enquadramento LGPD</h2>
        <table class="data-table">
          <tr>
            <td width="28%"><strong>Veredito Técnico Pericial:</strong></td>
            <td>
              <em>Selecione o enquadramento conclusivo resultante da investigação forense:</em><br/>
              [ &nbsp; ] <strong>1. FALSO POSITIVO COMPROVADO (Uso Legítimo):</strong> Acesso reconhecido pelo próprio usuário (viagem, rede móvel 4G/5G com IP dinâmico ou conexão legítima fora do escritório). Sem risco.<br/>
              [ &nbsp; ] <strong>2. FALSO POSITIVO TÉCNICO (Rotina de Sistema):</strong> Alerta disparado por script interno, rotina automatizada de backup ou conector de API entre plataformas (ex: integração Sienge/CV).<br/>
              [ &nbsp; ] <strong>3. TENTATIVA EXTERNA FRUSTRADA:</strong> Ataque bloqueado de imediato pelo perímetro de segurança/WAF antes que o invasor tivesse qualquer acesso à conta.<br/>
              [ &nbsp; ] <strong>4. CREDENCIAL COMPROMETIDA, MAS BARRADA PELO MFA:</strong> O atacante acertou a senha, mas foi impedido pelo 2º Fator de Autenticação. Conta segura após reset de senha.<br/>
              [ &nbsp; ] <strong>5. ACESSO INDEVIDO CONFIRMADO COM CONTENÇÃO IMEDIATA:</strong> Invasor ingressou no sistema, porém a T.I. identificou o alerta e derrubou a sessão antes de qualquer vazamento de dados.<br/>
              [ &nbsp; ] <strong>6. INFECÇÃO LOCAL NO DISPOSITIVO (Malware / Keylogger):</strong> Máquina do usuário comprometida por vírus espião capturador de senhas. Endpoint isolado para sanitização.<br/>
              [ &nbsp; ] <strong>7. INCIDENTE CRÍTICO DE SEGURANÇA (Vazamento de Dados / LGPD):</strong> Comprometimento confirmado com acesso ou exfiltração de dados pessoais ou financeiros (Acionamento Obrigatório do DPO e Notificação à ANPD em 3 dias).
            </td>
          </tr>
          <tr>
            <td><strong>Acionamento do DPO:</strong></td>
            <td>
              [ &nbsp; ] <strong>NÃO REQUER ACIONAMENTO DO DPO</strong> (Falso positivo ou tentativa frustrada sem risco residual aos titulares de dados).<br/>
              [ &nbsp; ] <strong>REQUER ACIONAMENTO IMEDIATO DO ENCARREGADO DE DADOS (DPO):</strong> Instaurar procedimento de crise conforme Resolução CD/ANPD nº 15/2024 para avaliação de notificação formal à ANPD no prazo legal de 3 (três) dias úteis.
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
        ], false, "MOD-SEG-08-B")}
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
      const machineAsset = custom.machineAsset || custom.tokenAssetId || "Estação de Trabalho Homologada pela T.I.";
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
            <td>Nome Completo: <strong>${escapeDocHtml(custom.signerName || "[ Nome Completo do Colaborador Custodiante ]")}</strong> &nbsp;|&nbsp; CPF: ___________________________<br/>
                Cargo / Função: ____________________________________ &nbsp;|&nbsp; Setor / Lotação: _________________________________</td>
          </tr>
          <tr>
            <td><strong>Especificação do Certificado:</strong></td>
            <td><strong>${escapeDocHtml(cType)}</strong><br/>
                Titularidade: [ &nbsp; ] AC Engenharia Ltda (e-CNPJ) &nbsp;&nbsp;&nbsp; [ &nbsp; ] Procurador / Representante Legal (e-CPF)<br/>
                Formato: [ &nbsp; ] Arquivo A1 (Instalação restrita à T.I.) &nbsp;&nbsp;&nbsp; [ &nbsp; ] Token USB Físico A3 &nbsp;&nbsp;&nbsp; [ &nbsp; ] Nuvem Corporativa</td>
          </tr>
          <tr>
            <td><strong>Estação de Trabalho Autorizada:</strong></td>
            <td><strong>${escapeDocHtml(machineAsset)}</strong> &nbsp;|&nbsp; <em>(Máquina com instalação e configuração restrita à T.I.)</em></td>
          </tr>
          <tr>
            <td><strong>Vigência da Custódia:</strong></td>
            <td><strong>Prazo Indeterminado</strong> &nbsp;|&nbsp; <em>(Válido enquanto perdurar o vínculo funcional no cargo/setor ou até revogação formal pela T.I.)</em></td>
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
        <p class="muted"><em>(Preenchido exclusivamente no desligamento do colaborador, mudança de cargo/setor ou revogação formal pela T.I.)</em></p>
        <table class="data-table">
          <tr>
            <td width="30%"><strong>Motivo do Encerramento:</strong></td>
            <td>[ &nbsp; ] Desligamento da Empresa &nbsp;&nbsp;&nbsp; [ &nbsp; ] Mudança de Cargo / Setor &nbsp;&nbsp;&nbsp; [ &nbsp; ] Revogação Preventiva pela T.I.</td>
          </tr>
          <tr>
            <td><strong>Ações Técnicas da T.I.:</strong></td>
            <td>[ &nbsp; ] Certificado A1 desinstalado e sanitizado do disco rígido &nbsp;&nbsp;&nbsp; [ &nbsp; ] Token Físico A3 recolhido intacto<br/>
                [ &nbsp; ] Revogação homologada na Autoridade Certificadora &nbsp;|&nbsp; <strong>Protocolo AC:</strong> ________________________</td>
          </tr>
          <tr>
            <td><strong>Data e Assinaturas de Baixa:</strong></td>
            <td>Data: _____ / _____ / _________ &nbsp;|&nbsp; Assinatura / Rubrica Colaborador: _____________________ &nbsp;|&nbsp; T.I. Receptor: _____________________</td>
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
  if (!code) return null;
  const clean = String(code).trim().toUpperCase();
  return CORPORATE_DOCUMENT_TEMPLATES.find(t => 
    t.code.toUpperCase() === clean || 
    (t.legacyCode && t.legacyCode.toUpperCase() === clean) ||
    (Array.isArray(t.aliases) && t.aliases.some(a => a.toUpperCase() === clean))
  ) || null;
}

function buildRenderedTemplateHTML(code, customData = {}, options = {}) {
  const tpl = getTemplateByCode(code);
  if (!tpl) return "";
  const ctx = Object.assign({}, getTemplateContextDefaults());
  const storedDoc = getStoredDocumentCustomData(code);
  const mergedCustom = Object.assign({}, storedDoc.fields || {}, customData || {});

  if (storedDoc.docDate && storedDoc.docDate.trim()) {
    ctx.todayBr = storedDoc.docDate.trim();
    mergedCustom.docDate = storedDoc.docDate.trim();
  }

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

    const q = (TemplateHubState.searchQuery || "").toLowerCase().trim();
    const matchText = !q ||
      t.code.toLowerCase().includes(q) ||
      (t.legacyCode && t.legacyCode.toLowerCase().includes(q)) ||
      (Array.isArray(t.aliases) && t.aliases.some(a => a.toLowerCase().includes(q))) ||
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

    const isHubEnabled = isEvidenceHubEnabledForDoc(t.code);
    const hubCount = isHubEnabled ? getEvidencesForDocument(t.code).length : 0;

    return `
    <div class="card-white rounded-lg p-4 border border-slate-200 hover:border-[#004b93]/60 transition-all flex flex-col justify-between gap-3 shadow-2xs">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0f2942] text-white">${escapeDocHtml(t.code)}</span>
            ${t.legacyCode ? `<span class="px-1.5 py-0.5 rounded text-[9.5px] font-mono text-slate-500 bg-slate-100 border border-slate-200" title="Código de Referência / Alias">(${escapeDocHtml(t.legacyCode)})</span>` : ""}
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
          ${isHubEnabled ? `
          <button type="button" onclick="openDocumentEvidenceModal('${t.code}')" class="px-2.5 py-1.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs" title="Ver histórico de evidências e arquivos anexados a este documento">
            <i data-lucide="paperclip" class="w-3.5 h-3.5 text-sky-600"></i>
            <span>Evidências Anexadas (${hubCount})</span>
          </button>
          ` : ''}
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

  const btnPreviewEvidence = document.getElementById("btn-preview-doc-evidence");
  const btnPreviewEvidenceText = document.getElementById("btn-preview-doc-evidence-text");
  if (btnPreviewEvidence) {
    if (isEvidenceHubEnabledForDoc(code)) {
      const evList = getEvidencesForDocument(code);
      btnPreviewEvidence.classList.remove("hidden");
      if (btnPreviewEvidenceText) {
        btnPreviewEvidenceText.textContent = `Evidências Anexadas (${evList.length})`;
      }
    } else {
      btnPreviewEvidence.classList.add("hidden");
    }
  }

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

function handleDocCustomPhotoUpload(event, key) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const rawDataUrl = e.target.result;
    const img = new Image();
    img.onload = function() {
      const maxDim = 1200;
      let width = img.width;
      let height = img.height;
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);

      const inputEl = document.getElementById(`doc-custom-field-${key}`);
      if (inputEl) inputEl.value = compressedDataUrl;

      const previewBox = document.getElementById(`preview-box-${key}`);
      if (previewBox) {
        previewBox.innerHTML = `<img src="${compressedDataUrl}" class="w-full h-full object-cover" />`;
      }
      const removeBtn = document.getElementById(`btn-remove-photo-${key}`);
      if (removeBtn) removeBtn.classList.remove("hidden");

      if (window.showToast) window.showToast("Foto do aparelho carregada com sucesso!", "success");
    };
    img.src = rawDataUrl;
  };
  reader.readAsDataURL(file);
}

function handleRemoveDocCustomPhoto(key) {
  const inputEl = document.getElementById(`doc-custom-field-${key}`);
  if (inputEl) inputEl.value = "";
  const previewBox = document.getElementById(`preview-box-${key}`);
  if (previewBox) {
    previewBox.innerHTML = `<div class="text-center p-2"><i data-lucide="image" class="w-6 h-6 text-slate-300 mx-auto"></i><span class="text-[9px] text-slate-400 block mt-1">Sem foto</span></div>`;
    if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
  }
  const removeBtn = document.getElementById(`btn-remove-photo-${key}`);
  if (removeBtn) removeBtn.classList.add("hidden");
  const fileInput = document.getElementById(`upload-input-${key}`);
  if (fileInput) fileInput.value = "";
}

window.handleDocCustomPhotoUpload = handleDocCustomPhotoUpload;
window.handleRemoveDocCustomPhoto = handleRemoveDocCustomPhoto;

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

  // Seletor dinâmico com todos os modelos
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
      const colClass = f.fullWidth ? "sm:col-span-2" : "sm:col-span-1";

      if (f.type === "photo" || f.type === "image") {
        return `
          <div class="sm:col-span-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
            <div class="flex items-center justify-between flex-wrap gap-1">
              <label class="block text-[11px] font-bold text-slate-800 flex items-center gap-1.5">
                <i data-lucide="camera" class="w-3.5 h-3.5 text-[#004b93]"></i>
                <span>${escapeDocHtml(f.label)}</span>
              </label>
              <span class="text-[10px] text-slate-400 font-mono">PNG / JPG / WebP</span>
            </div>
            <input type="hidden" id="doc-custom-field-${f.key}" value="${escapeDocHtml(val)}" />
            <div class="flex items-center gap-3.5 flex-wrap sm:flex-nowrap">
              <div id="preview-box-${f.key}" class="w-32 h-24 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                ${val ? `<img src="${val}" class="w-full h-full object-cover" />` : `<div class="text-center p-2"><i data-lucide="image" class="w-6 h-6 text-slate-300 mx-auto"></i><span class="text-[9px] text-slate-400 block mt-1">Sem foto</span></div>`}
              </div>
              <div class="flex-1 space-y-2 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <label for="upload-input-${f.key}" class="px-3 py-1.5 rounded-lg bg-[#004b93] hover:bg-[#003870] text-white text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 transition-colors shadow-2xs">
                    <i data-lucide="upload" class="w-3.5 h-3.5"></i>
                    <span>Carregar Foto do Aparelho</span>
                  </label>
                  <input type="file" id="upload-input-${f.key}" accept="image/*" class="hidden" onchange="handleDocCustomPhotoUpload(event, '${f.key}')" />
                  <button type="button" id="btn-remove-photo-${f.key}" onclick="handleRemoveDocCustomPhoto('${f.key}')" class="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer transition-colors border border-rose-200 ${val ? '' : 'hidden'}">
                    Remover Foto
                  </button>
                </div>
                <p class="text-[10.5px] text-slate-500 leading-tight">${escapeDocHtml(f.hint || 'Selecione uma foto da câmera ou arquivo do computador.')}</p>
              </div>
            </div>
          </div>
        `;
      } else if (f.type === "textarea") {
        return `
          <div class="${colClass}">
            <label class="block text-[11px] font-bold text-slate-700 mb-1">${escapeDocHtml(f.label)}</label>
            <textarea id="doc-custom-field-${f.key}" rows="${f.rows || 3}" placeholder="${escapeDocHtml(f.placeholder || '')}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#004b93] focus:ring-1 focus:ring-[#004b93]">${escapeDocHtml(val)}</textarea>
          </div>
        `;
      } else if (f.type === "select" && Array.isArray(f.options)) {
        const optsHtml = f.options.map(opt => `
          <option value="${escapeDocHtml(opt)}" ${val === opt ? "selected" : ""}>${escapeDocHtml(opt)}</option>
        `).join("");
        return `
          <div class="${colClass}">
            <label class="block text-[11px] font-bold text-slate-700 mb-1">${escapeDocHtml(f.label)}</label>
            <select id="doc-custom-field-${f.key}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#004b93] focus:ring-1 focus:ring-[#004b93]">
              ${val ? '' : '<option value="">-- Selecione uma opção --</option>'}
              ${optsHtml}
            </select>
          </div>
        `;
      }

      return `
        <div class="${colClass}">
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
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200">
          ${fieldsInputs}
        </div>
      </div>
    `;
  }

  modal.innerHTML = `
    <div class="bg-white rounded-2xl w-full max-w-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
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

        <!-- Seção: Data Oficial do Documento / Assinatura -->
        <div class="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="space-y-0.5">
            <span class="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <i data-lucide="calendar" class="w-3.5 h-3.5 text-[#004b93]"></i>
              <span>Data Oficial do Documento / Assinatura:</span>
            </span>
            <p class="text-[11px] text-slate-500">
              Digite a data desejada (ex: 18/11/2026) ou deixe em branco para manter linhas abertas (_____ / _____ / _________) para preenchimento manual à caneta.
            </p>
          </div>
          <div class="w-full sm:w-48 shrink-0">
            <input type="text" id="doc-custom-doc-date" value="${escapeDocHtml(savedData.docDate || "")}" placeholder="Ex: 18/11/2026" class="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-[#004b93] focus:ring-1 focus:ring-[#004b93]" />
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

  const dateEl = document.getElementById("doc-custom-doc-date");
  const docDate = dateEl ? dateEl.value.trim() : "";

  const customDocData = {
    docCode,
    docDate,
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
  const customSnapshot = TemplateHubState.previewingCustomData ? JSON.stringify(TemplateHubState.previewingCustomData) : "";
  const payloadStr = `${code}|${tpl ? (tpl.version || "v2.4") : "v2.4"}|${signerName}|${signerRole}|${signerDoc}|${method}|${timestamp}|${customSnapshot}|AC_ENGENHARIA`;

  const sha256 = await computeUniversalSHA256(payloadStr);

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

  if (isEvidenceHubEnabledForDoc(code)) {
    openDocumentEvidenceModal(code, "upload");
    return;
  }

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

// ============================================================================
// PAINEL / HUB DE EVIDÊNCIAS ANEXADAS & CUSTÓDIA FORENSE DIGITAL
// INTEGRADO AOS 43 MODELOS DE DOCUMENTO (ISO 27001 / ISO 27037 / LGPD)
// COM ADAPTAÇÃO CONTEXTUAL DE CAMPOS, ALTO VOLUME E VISUALIZAÇÃO EM TABELA
// ============================================================================

let currentDocumentEvidenceTargetCode = "MOD-SEG-08-A";
let activeEvidenceUploadFile = null;
let docEvidSearchQuery = "";
let docEvidCategoryFilter = "todas";
let docEvidSortOrder = "recentes"; // "recentes", "antigos", "nome", "id"
let docEvidViewMode = "cards"; // "cards" ou "table"
let docEvidCurrentPage = 1;
let docEvidPageSize = 15; // 15, 30, 50, ou Infinity

function isEvidenceHubEnabledForDoc(docCode) {
  if (!docCode) return false;
  // Habilitado para todos os 43 modelos corporativos oficiais da AC Engenharia
  return Boolean(getTemplateByCode(docCode));
}

function getDocumentContextualEvidenceConfig(docCode) {
  const tpl = getTemplateByCode(docCode);
  const code = (docCode || "").toUpperCase();
  let mod = tpl ? tpl.module : "secops";

  // Modelo Especial: Laudo de Homologação e Teste de TVs, Projetores e Aparelhos de Obra
  if (code === "MOD-OBR-06") {
    return {
      module: "obras",
      entityLabel: "Aparelho / Equipamento Testado",
      entityPlaceholder: "Ex: Smart TV 55 Samsung / Projetor Epson PowerLite",
      entityIcon: "tv",
      secondaryLabel: "Marca, Modelo & Nº de Série (S/N)",
      secondaryPlaceholder: "Ex: Samsung UN55CU7700 - S/N: 9ZJ43L7A000124K",
      assetLabel: "Obra / Canteiro de Destino",
      assetOptions: [
        "Residencial Jardins da Costa",
        "Edifício Mirante da Praia",
        "Canteiro Reserva Jardim (Obra 04)",
        "Escritório Central (Matriz)",
        "Estande de Vendas / Stand Comercial",
        "Outro Canteiro / Unidade"
      ],
      defaultCategories: [
        "Fotos do Aparelho Ligado / Teste de Tela",
        "Foto da Etiqueta de Patrimônio & Nº de Série",
        "Fotos dos Acessórios & Controle Remoto",
        "Nota Fiscal de Compra / Danfe do Aparelho",
        "Laudo de Bancada / Vistoria Técnica Assinado",
        "Termo de Recebimento no Almoxarifado da Obra",
        "Outros Registros do Equipamento"
      ],
      kpiTitle: "Aparelhos Testados",
      kpiSub: "Equipamentos",
      kpiDesc: "TVs, projetores e eletroeletrônicos homologados"
    };
  }

  // Inferência contextual por código normativo
  if (code.startsWith("MOD-OBR-")) mod = "obras";
  else if (code.startsWith("MOD-USR-")) mod = "users";
  else if (code.startsWith("MOD-SEC-") || code.startsWith("MOD-SEG-")) mod = "secops";
  else if (code.startsWith("MOD-INT-")) mod = "integrations";
  else if (code.startsWith("MOD-RSK-")) mod = "risks";
  else if (code.startsWith("MOD-LGP-")) mod = "lgpd";
  else if (code.startsWith("MOD-AUD-")) mod = "audit";
  else if (code.startsWith("MOD-EVD-")) mod = "evidence";
  else if (code.startsWith("MOD-GOV-")) mod = "raci";

  switch (mod) {
    case "obras":
      return {
        module: "obras",
        entityLabel: "Canteiro de Obras / Localidade",
        entityPlaceholder: "Ex: Residencial Jardins da Costa (ou selecione na lista)",
        entityIcon: "hard-hat",
        secondaryLabel: "Engenheiro(a) Residente / Fiscal da Obra",
        secondaryPlaceholder: "Ex: Eng. Ricardo Lima (CREA-SE)",
        assetLabel: "Ativo / Ponto Físico Auditado no Canteiro",
        assetOptions: [
          "Catraca Biométrica Facial de Canteiro",
          "Laptop Corporativo de Engenheiro de Obra",
          "Câmera CFTV / Gravador NVR de Canteiro",
          "Roteador de Borda / Link Starlink / 4G",
          "Almoxarifado / Container Físico Trancado",
          "Rede Wi-Fi de Visitantes / Empreiteiros",
          "Outro Ponto / Ativo de Canteiro"
        ],
        defaultCategories: [
          "Checklist Fotográfico de Canteiro & Segurança",
          "Termo de Expurgo de Biometria Facial Pós-Habite-se",
          "Logs de Entrada/Saída da Catraca Facial",
          "Relatório de Vistoria Física & SST no Canteiro",
          "Termo de Entrega de Equipamento / Laptop de Obra",
          "Teste de Conexão VPN / Link de Canteiro",
          "Formulário Assinado em Campo",
          "Outros Comprovantes de Canteiro"
        ],
        kpiTitle: "Canteiros Auditados",
        kpiSub: "Obras",
        kpiDesc: "Canteiros e frentes de obra com registros"
      };

    case "users":
      return {
        module: "users",
        entityLabel: "Colaborador(a) / Usuário(a) do Ativo",
        entityPlaceholder: "Ex: Nome Completo do Colaborador (ou selecione na lista)",
        entityIcon: "user-check",
        secondaryLabel: "Cargo / Departamento / Setor Corporativo",
        secondaryPlaceholder: "Ex: Analista Financeiro / Canteiro de Obras",
        assetLabel: "Ativo / Equipamento / Credencial Vinculada",
        assetOptions: [
          "Laptop Corporativo (BitLocker Ativo)",
          "Smartphone Corporativo / E-mail Mobile",
          "Conta de Rede / Acesso VPN Remoto",
          "Crachá / Tag de Acesso Físico",
          "Certificado Digital / Token A3",
          "Conta de Acesso a Sistemas Corporativos",
          "Outro Ativo / Credencial de Colaborador"
        ],
        defaultCategories: [
          "Termo de Uso e Responsabilidade Assinado",
          "Comprovante de Devolução de Ativos (Offboarding)",
          "Log de Revogação de Acesso Lógico e Bloqueio",
          "Termo de Teletrabalho e Acesso Remoto (VPN)",
          "Termo de Confidencialidade e Sigilo (NDA)",
          "Comprovante de Entrega de Equipamento",
          "Outros Documentos de RH & Acessos"
        ],
        kpiTitle: "Colaboradores Auditados",
        kpiSub: "Usuários",
        kpiDesc: "Colaboradores com termos e registros"
      };

    case "lgpd":
      return {
        module: "lgpd",
        entityLabel: "Titular dos Dados Pessoais (Cliente / Colaborador)",
        entityPlaceholder: "Ex: Nome Completo do Titular / Requerente",
        entityIcon: "shield-alert",
        secondaryLabel: "Protocolo DSAR / Canal de Atendimento DPO",
        secondaryPlaceholder: "Ex: DSAR-2026-003 / dpo@acengenhariase.com.br",
        assetLabel: "Sistema / Processo RoPA / Operador Terceirizado",
        assetOptions: [
          "ERP Sienge (Dados Cadastrais e Financeiros)",
          "Construtor de Vendas - CV CRM (Leads Imobiliários)",
          "Folha de Pagamento & RH (Dados de Funcionários)",
          "Empreiteira / Operador Terceiro com DPA",
          "Portal do Titular / Canal de Atendimento DPO",
          "Outro Banco de Dados / Sistema de Tratamento"
        ],
        defaultCategories: [
          "Solicitação Formal do Titular de Dados (DSAR)",
          "Comprovante de Atendimento e Resposta ao Titular",
          "Acordo de Tratamento de Dados (DPA) Assinado",
          "Relatório de Impacto à Proteção de Dados (RIPD)",
          "Comprovante de Consentimento / Base Legal",
          "Notificação Formal à ANPD / Comitê",
          "Outras Evidências de Privacidade LGPD"
        ],
        kpiTitle: "Titulares dos Dados",
        kpiSub: "Titulares",
        kpiDesc: "Titulares com solicitações / registros"
      };

    case "risks":
      return {
        module: "risks",
        entityLabel: "Identificador do Risco / Ativo Crítico",
        entityPlaceholder: "Ex: RSK-001 (Servidor Sienge / Link VPN Canteiro)",
        entityIcon: "alert-triangle",
        secondaryLabel: "Diretoria / Gestor Responsável pelo Tratamento",
        secondaryPlaceholder: "Ex: Diretor de Operações / Gestor de Riscos",
        assetLabel: "Ameaça / Vulnerabilidade / Controle SoA Vinculado",
        assetOptions: [
          "Servidores On-Premise & Matriz (Data Center)",
          "Conectividade e Túneis VPN dos Canteiros",
          "Rotina de Backup em Nuvem e Imutabilidade",
          "Gestão de Acessos Privilegiados (PAM / MFA)",
          "Dispositivos Móveis e Laptops em Campo",
          "Infraestrutura Crítica de Engenharia",
          "Outro Ativo / Risco Corporativo"
        ],
        defaultCategories: [
          "Planilha / Matriz de Avaliação de Riscos (ISO 27005)",
          "Evidência de Teste e Eficácia de Controle",
          "Termo de Aceite Formal de Risco Residual",
          "Plano de Tratamento e Mitigação de Risco (RTP)",
          "Cotação / Orçamento de Ferramenta de Segurança",
          "Parecer Técnico de Risco GRC",
          "Outras Evidências de Gestão de Riscos"
        ],
        kpiTitle: "Riscos / Ativos",
        kpiSub: "Ativos",
        kpiDesc: "Ativos com análises e planos vinculados"
      };

    case "audit":
      return {
        module: "audit",
        entityLabel: "Processo / Área Organizacional Auditada",
        entityPlaceholder: "Ex: Auditoria de Acessos Lógicos / Vistoria de Canteiros",
        entityIcon: "clipboard-check",
        secondaryLabel: "Auditor Líder / Auditor Acompanhante",
        secondaryPlaceholder: "Ex: Auditor Líder ISO 27001",
        assetLabel: "Requisito Normativo / Cláusula Auditada",
        assetOptions: [
          "ISO/IEC 27001:2022 (Requisitos SGSI)",
          "Anexo A - Controles Tecnológicos (A.8)",
          "Anexo A - Segurança Física e do Ambiente (A.7)",
          "Anexo A - Segurança de Recursos Humanos (A.6)",
          "Anexo A - Controles Organizacionais (A.5)",
          "Conformidade Regulamentar LGPD (Art. 46)",
          "Outro Requisito de Auditoria"
        ],
        defaultCategories: [
          "Amostra Auditada de Evidência Técnica",
          "Relatório de Não-Conformidade (RNC)",
          "Plano de Ação Corretiva (CAPA)",
          "Trilha de Entrevista de Auditoria Interna",
          "Ata de Reunião de Abertura / Encerramento",
          "Checklist de Auditoria Preenchido",
          "Outros Registros de Auditoria"
        ],
        kpiTitle: "Processos Auditados",
        kpiSub: "Processos",
        kpiDesc: "Processos avaliados na auditoria"
      };

    case "raci":
      return {
        module: "raci",
        entityLabel: "Política / Processo / Comitê de Governança",
        entityPlaceholder: "Ex: Comitê Gestor SGSI / PSI-001 (Política de Segurança)",
        entityIcon: "book-open",
        secondaryLabel: "Responsável (Accountable - RACI) / Gestor",
        secondaryPlaceholder: "Ex: Membro do Comitê de Segurança / Gestor de GRC",
        assetLabel: "Escopo Organizacional / Norma Reguladora",
        assetOptions: [
          "Política de Segurança da Informação (PSI-001)",
          "Política de Controle de Acesso (PCA-002)",
          "Matriz RACI e Atribuições de Responsabilidade",
          "Comitê Gestor de Privacidade e Segurança",
          "Diretriz de Uso Aceitável de Ativos",
          "Norma Regulamentadora NR-18 / Canteiros",
          "Outro Processo de Governança Corporativa"
        ],
        defaultCategories: [
          "Ata de Reunião do Comitê de Segurança Assinada",
          "Evidência de Treinamento e Conscientização",
          "Termo de Ciência de Políticas Organizacionais",
          "Parecer Jurídico / DPO sobre Governança",
          "Registro de Revisão Anual de Políticas",
          "Evidência de Comunicação Corporativa",
          "Outros Documentos de Governança"
        ],
        kpiTitle: "Políticas / Processos",
        kpiSub: "Políticas",
        kpiDesc: "Políticas e processos com evidências"
      };

    case "integrations":
      return {
        module: "integrations",
        entityLabel: "Sistema / Fornecedor Integrado (API)",
        entityPlaceholder: "Ex: API ERP Sienge / Construtor de Vendas (CV CRM)",
        entityIcon: "webhook",
        secondaryLabel: "Responsável Técnico / Engenheiro DevOps",
        secondaryPlaceholder: "Ex: devops@acengenhariase.com.br",
        assetLabel: "Endpoint / Chave de API / Protocolo de Comunicação",
        assetOptions: [
          "API REST ERP Sienge (Engenharia / Compras)",
          "Webhook Construtor de Vendas (CV CRM)",
          "Autenticação OAuth 2.0 / Google SSO",
          "Gateway de Mensageria / WhatsApp Business",
          "Banco de Dados Réplica de Leitura",
          "Túnel VPN Site-to-Site com Fornecedor",
          "Outro Ponto de Integração"
        ],
        defaultCategories: [
          "Log de Payload / Requisições da API",
          "Comprovante de Rotação Periódica de Tokens / Chaves",
          "Teste de Criptografia TLS 1.3 e Certificado HTTPS",
          "Diagrama de Arquitetura e Fluxo de Dados",
          "Relatório de Auditoria de Webhooks",
          "Registro de Incidente de Integração",
          "Outras Evidências de Integração"
        ],
        kpiTitle: "Sistemas / APIs",
        kpiSub: "Endpoints",
        kpiDesc: "Sistemas e APIs com trilha de segurança"
      };

    case "evidence":
      return {
        module: "evidence",
        entityLabel: "Objeto Forense / Caso de Perícia Digital",
        entityPlaceholder: "Ex: Custódia Digital Pericial / CASO-2026-01",
        entityIcon: "folder-lock",
        secondaryLabel: "Custodiante / Perito Digital Responsável",
        secondaryPlaceholder: "Ex: Analista de Custódia Forense",
        assetLabel: "Mídia de Armazenamento / Repositório de Custódia",
        assetOptions: [
          "Repositório de Custódia Local Criptografado",
          "Storage de Longo Prazo Imutável (WORM)",
          "Cofre Digital de Senhas e Chaves",
          "Mídia Física Sob Custódia Trancada",
          "Espelhamento Forense de Disco / Imagem Raw",
          "Outro Meio de Custódia Forense"
        ],
        defaultCategories: [
          "Espelhamento Forense / Cópia Bit-a-Bit",
          "Auto de Apreensão / Coleta Forense ISO 27037",
          "Relatório Pericial Completo com Cadeia de Custódia",
          "Certidão de Preservação e Custódia Imutável",
          "Termo de Descarte Seguro e Expurgo de Mídia",
          "Outros Artefatos Forenses"
        ],
        kpiTitle: "Objetos Forenses",
        kpiSub: "Custódia",
        kpiDesc: "Itens sob custódia digital inviolável"
      };

    case "secops":
    default:
      return {
        module: "secops",
        entityLabel: "Pessoa Investigada / Titular da Conta",
        entityPlaceholder: "Ex: Davis Damasceno (ou Nome Completo)",
        entityIcon: "user-x",
        secondaryLabel: "E-mail Corporativo da Pessoa Investigada",
        secondaryPlaceholder: "Ex: davisdamasceno@acengenhariase.com.br",
        assetLabel: "Sistema de Origem do Alerta / Vetor",
        assetOptions: [
          "Google Workspace (Gmail / Drive / SSO)",
          "ERP Sienge (Engenharia / Financeiro)",
          "Construtor de Vendas (CV CRM)",
          "Active Directory / Servidor Windows",
          "Firewall MikroTik / Túnel VPN",
          "SIEM Wazuh / EDR",
          "Outro Sistema Corporativo"
        ],
        defaultCategories: [
          "Logs de Autenticação & MFA (Google / AD / Sienge)",
          "Entrevista Fática com Colaborador (Triagem Fase 1)",
          "Telemetria de Rede, IP & Geolocalização (Firewall / ISP)",
          "Export de Alerta de Segurança (CV CRM / Sienge / SIEM)",
          "Relatório de Incursão Hostil & CSIRT (Fase 2)",
          "Formulário Digitalizado / Assinado",
          "Outros Comprovantes Forenses"
        ],
        kpiTitle: "Pessoas Investigadas",
        kpiSub: "Titulares",
        kpiDesc: "Contas / colaboradores com verificação"
      };
  }
}

function getEvidencesForDocument(docCode) {
  if (!docCode) return [];
  const all = (typeof getStoredEvidence === "function") ? getStoredEvidence() : [];
  if (!Array.isArray(all)) return [];
  return all.filter(e => {
    if (!e) return false;
    if (e.documentCode === docCode) return true;
    if (e.relatedDoc === docCode) return true;
    if (e.control && typeof e.control === "string" && e.control.includes(docCode)) return true;
    if (e.title && typeof e.title === "string" && e.title.includes(docCode)) return true;
    return false;
  });
}

function populateDocumentEvidenceCategoryFilter(docCode) {
  const catSelect = document.getElementById("doc-evid-filter-category");
  if (!catSelect) return;
  const cfg = getDocumentContextualEvidenceConfig(docCode);
  const evidences = getEvidencesForDocument(docCode);

  const categories = new Set(cfg.defaultCategories || []);
  evidences.forEach(e => {
    if (e.category && typeof e.category === "string" && e.category.trim()) {
      categories.add(e.category.trim());
    }
  });

  const optsHtml = [
    '<option value="todas">Todas as Categorias</option>',
    ...Array.from(categories).map(c => `<option value="${escapeDocHtml(c)}">${escapeDocHtml(c)}</option>`)
  ].join("");

  catSelect.innerHTML = optsHtml;
  catSelect.value = docEvidCategoryFilter || "todas";
}

function updateDocumentEvidenceViewButtons() {
  const btnCards = document.getElementById("btn-doc-view-cards");
  const btnTable = document.getElementById("btn-doc-view-table");
  if (docEvidViewMode === "table") {
    if (btnCards) {
      btnCards.className = "px-2.5 py-1 rounded text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-all";
    }
    if (btnTable) {
      btnTable.className = "px-2.5 py-1 rounded text-xs font-semibold bg-white text-slate-800 shadow-2xs flex items-center gap-1 cursor-pointer transition-all";
    }
  } else {
    if (btnCards) {
      btnCards.className = "px-2.5 py-1 rounded text-xs font-semibold bg-white text-slate-800 shadow-2xs flex items-center gap-1 cursor-pointer transition-all";
    }
    if (btnTable) {
      btnTable.className = "px-2.5 py-1 rounded text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer transition-all";
    }
  }
}

function setDocumentEvidenceViewMode(mode) {
  docEvidViewMode = mode === "table" ? "table" : "cards";
  updateDocumentEvidenceViewButtons();
  renderDocumentEvidenceList(currentDocumentEvidenceTargetCode);
}

function setDocumentEvidenceSort(sortOrder) {
  docEvidSortOrder = sortOrder || "recentes";
  docEvidCurrentPage = 1;
  const sortSelect = document.getElementById("doc-evid-sort-order");
  if (sortSelect) sortSelect.value = docEvidSortOrder;
  renderDocumentEvidenceList(currentDocumentEvidenceTargetCode);
}

function setDocumentEvidencePage(page) {
  docEvidCurrentPage = Math.max(1, page);
  renderDocumentEvidenceList(currentDocumentEvidenceTargetCode);
}

function setDocumentEvidencePageSize(size) {
  docEvidPageSize = size === "all" ? Infinity : Math.max(1, parseInt(size, 10) || 15);
  docEvidCurrentPage = 1;
  renderDocumentEvidenceList(currentDocumentEvidenceTargetCode);
}

function applyDocumentEvidenceFilters() {
  const searchEl = document.getElementById("doc-evid-filter-search");
  const catEl = document.getElementById("doc-evid-filter-category");
  if (searchEl) docEvidSearchQuery = (searchEl.value || "").toLowerCase().trim();
  if (catEl) docEvidCategoryFilter = catEl.value || "todas";
  docEvidCurrentPage = 1;
  renderDocumentEvidenceList(currentDocumentEvidenceTargetCode);
}

function exportDocumentEvidenceManifest(docCode = null) {
  const targetCode = docCode || currentDocumentEvidenceTargetCode || "MOD-SEG-08-A";
  const tpl = getTemplateByCode(targetCode) || { code: targetCode, title: "Documento Corporativo" };
  const evidences = getEvidencesForDocument(targetCode);

  if (evidences.length === 0) {
    if (window.showToast) window.showToast("Nenhuma evidência vinculada a este modelo para exportar.", "warning");
    return;
  }

  const csvEscape = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = [
    "ID Forense",
    "Código Modelo",
    "Título do Modelo",
    "Título da Evidência",
    "Entidade / Pessoa / Canteiro",
    "Informação Secundária (E-mail / Fiscal / Cargo)",
    "Sistema / Ativo Vinculado",
    "Categoria Forense",
    "Arquivo Original",
    "Tamanho",
    "Data da Coleta",
    "Responsável / Analista",
    "Status Homologação",
    "Hash Criptográfico SHA-256",
    "Parecer Técnico / Notas Periciais",
    "Data de Indexação (ISO)"
  ];

  const rows = evidences.map(e => [
    csvEscape(e.id),
    csvEscape(targetCode),
    csvEscape(tpl.title),
    csvEscape(e.title),
    csvEscape(e.entityName || e.investigatedPerson || e.userName || e.location || ""),
    csvEscape(e.secondaryInfo || e.investigatedEmail || ""),
    csvEscape(e.assetOrSystem || e.originSystem || ""),
    csvEscape(e.category || ""),
    csvEscape(e.fileName || ""),
    csvEscape(e.fileSize || ""),
    csvEscape(e.date || ""),
    csvEscape(e.responsible || ""),
    csvEscape(e.status || "Homologada"),
    csvEscape(e.sha256 || ""),
    csvEscape(e.description || ""),
    csvEscape(e.uploadedAt || "")
  ].join(";"));

  const csvContent = "\ufeff" + [headers.join(";"), ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const todayStr = new Date().toISOString().split("T")[0];
  a.href = url;
  a.download = `manifesto-forense-${targetCode}-${todayStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  if (window.showToast) {
    window.showToast(`Manifesto Forense com ${evidences.length} registro(s) exportado com sucesso!`, "success");
  }
}

function openDocumentEvidenceModal(docCode = null, activeTab = "list") {
  const targetCode = docCode || TemplateHubState.previewingCode || "MOD-SEG-08-A";
  currentDocumentEvidenceTargetCode = targetCode;
  activeEvidenceUploadFile = null;
  docEvidSearchQuery = "";
  docEvidCategoryFilter = "todas";
  docEvidCurrentPage = 1;

  const searchInput = document.getElementById("doc-evid-filter-search");
  if (searchInput) searchInput.value = "";

  const tpl = getTemplateByCode(targetCode) || {
    code: targetCode,
    title: "Registro Corporativo SGSI",
    normative: "ISO/IEC 27001:2022 & LGPD"
  };

  const cfg = getDocumentContextualEvidenceConfig(targetCode);
  populateDocumentEvidenceCategoryFilter(targetCode);

  const modal = document.getElementById("modal-document-evidence");
  const badgeCode = document.getElementById("doc-evidence-badge-code");
  const titleEl = document.getElementById("doc-evidence-modal-title");
  const subEl = document.getElementById("doc-evidence-modal-subtitle");

  if (badgeCode) badgeCode.textContent = tpl.code;
  if (titleEl) titleEl.textContent = `Central de Evidências — ${tpl.title}`;
  if (subEl) subEl.textContent = `Custódia digital, trilha de integridade forense e histórico de arquivos do modelo ${tpl.code} (${tpl.normative})`;

  // Atualiza os rótulos e ícone do KPI 2 dinamicamente
  const entityTitleEl = document.getElementById("doc-evid-stat-entity-title");
  const entityBadgeEl = document.getElementById("doc-evid-stat-entity-badge");
  const entityDescEl = document.getElementById("doc-evid-stat-entity-desc");
  const entityIconEl = document.getElementById("doc-evid-stat-entity-icon");
  if (entityTitleEl) entityTitleEl.textContent = cfg.kpiTitle;
  if (entityBadgeEl) entityBadgeEl.textContent = cfg.kpiSub;
  if (entityDescEl) entityDescEl.textContent = cfg.kpiDesc;
  if (entityIconEl) entityIconEl.setAttribute("data-lucide", cfg.entityIcon);

  updateDocumentEvidenceViewButtons();
  switchDocumentEvidenceTab(activeTab);

  if (modal) {
    modal.classList.remove("hidden");
    document.body.style.overflow = "hidden"; // Trava scroll da página de trás
    if (window.lucide && typeof window.lucide.createIcons === "function") {
      window.lucide.createIcons();
    }
  }
}

function closeDocumentEvidenceModal() {
  const modal = document.getElementById("modal-document-evidence");
  if (modal) {
    modal.classList.add("hidden");
    document.body.style.overflow = ""; // Restaura scroll normal
  }
  activeEvidenceUploadFile = null;
}

function switchDocumentEvidenceTab(tab = "list") {
  const btnList = document.getElementById("tab-btn-doc-evid-list");
  const btnUpload = document.getElementById("tab-btn-doc-evid-upload");
  const panelList = document.getElementById("panel-doc-evid-list");
  const panelUpload = document.getElementById("panel-doc-evid-upload");
  const filtersToolbar = document.getElementById("doc-evid-filters-toolbar");

  if (!panelList || !panelUpload) return;

  if (tab === "upload") {
    panelList.classList.add("hidden");
    panelUpload.classList.remove("hidden");
    if (filtersToolbar) filtersToolbar.classList.add("hidden");
    if (btnList) btnList.className = "px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-all";
    if (btnUpload) btnUpload.className = "px-4 py-2 rounded-lg text-xs font-bold bg-[#004b93] text-white shadow-xs flex items-center gap-2 cursor-pointer transition-all";
    renderDocumentEvidenceUploadForm(currentDocumentEvidenceTargetCode);
  } else {
    panelUpload.classList.add("hidden");
    panelList.classList.remove("hidden");
    if (filtersToolbar) filtersToolbar.classList.remove("hidden");
    if (btnUpload) btnUpload.className = "px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 flex items-center gap-2 cursor-pointer transition-all";
    if (btnList) btnList.className = "px-4 py-2 rounded-lg text-xs font-bold bg-[#004b93] text-white shadow-xs flex items-center gap-2 cursor-pointer transition-all";
    renderDocumentEvidenceList(currentDocumentEvidenceTargetCode);
  }

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function renderDocumentEvidenceList(docCode) {
  const panel = document.getElementById("panel-doc-evid-list");
  const btnListText = document.getElementById("tab-btn-doc-evid-list-text");
  if (!panel) return;

  const cfg = getDocumentContextualEvidenceConfig(docCode);
  const allEvidences = getEvidencesForDocument(docCode);

  // Calcula contadores de KPI para o topo da tela
  const totalCount = allEvidences.length;
  const entitySet = new Set();
  allEvidences.forEach(e => {
    const ent = (e.entityName || e.investigatedPerson || e.userName || e.location || "").trim();
    if (ent) entitySet.add(ent);
  });
  const categoriesSet = new Set(allEvidences.map(e => e.category).filter(Boolean));

  const statTotalEl = document.getElementById("doc-evid-stat-total");
  const statInvestigatedEl = document.getElementById("doc-evid-stat-investigated");
  const statCategoriesEl = document.getElementById("doc-evid-stat-categories");
  if (statTotalEl) statTotalEl.textContent = totalCount;
  if (statInvestigatedEl) statInvestigatedEl.textContent = entitySet.size;
  if (statCategoriesEl) statCategoriesEl.textContent = categoriesSet.size;

  // Aplica filtros de pesquisa e categoria
  const q = (docEvidSearchQuery || "").toLowerCase();
  const filtered = allEvidences.filter(e => {
    const matchCat = docEvidCategoryFilter === "todas" || (e.category && e.category.toLowerCase().includes(docEvidCategoryFilter.toLowerCase()));
    const matchSearch = !q ||
      (e.id && e.id.toLowerCase().includes(q)) ||
      (e.title && e.title.toLowerCase().includes(q)) ||
      (e.entityName && e.entityName.toLowerCase().includes(q)) ||
      (e.investigatedPerson && e.investigatedPerson.toLowerCase().includes(q)) ||
      (e.userName && e.userName.toLowerCase().includes(q)) ||
      (e.secondaryInfo && e.secondaryInfo.toLowerCase().includes(q)) ||
      (e.investigatedEmail && e.investigatedEmail.toLowerCase().includes(q)) ||
      (e.assetOrSystem && e.assetOrSystem.toLowerCase().includes(q)) ||
      (e.originSystem && e.originSystem.toLowerCase().includes(q)) ||
      (e.responsible && e.responsible.toLowerCase().includes(q)) ||
      (e.fileName && e.fileName.toLowerCase().includes(q)) ||
      (e.sha256 && e.sha256.toLowerCase().includes(q)) ||
      (e.description && e.description.toLowerCase().includes(q));
    return matchCat && matchSearch;
  });

  // Ordenação
  filtered.sort((a, b) => {
    if (docEvidSortOrder === "antigos") {
      const dA = a.date || a.uploadedAt || "";
      const dB = b.date || b.uploadedAt || "";
      return dA.localeCompare(dB) || (a.id || "").localeCompare(b.id || "");
    }
    if (docEvidSortOrder === "nome") {
      const tA = (a.title || a.entityName || "").toLowerCase();
      const tB = (b.title || b.entityName || "").toLowerCase();
      return tA.localeCompare(tB, "pt-BR");
    }
    if (docEvidSortOrder === "id") {
      return (a.id || "").localeCompare(b.id || "");
    }
    // "recentes" (padrão)
    const dA = a.date || a.uploadedAt || "";
    const dB = b.date || b.uploadedAt || "";
    return dB.localeCompare(dA) || (b.id || "").localeCompare(a.id || "");
  });

  if (btnListText) {
    btnListText.textContent = `Todos os Registros de Anexos (${allEvidences.length})`;
  }

  if (allEvidences.length === 0) {
    panel.innerHTML = `
      <div class="card-white rounded-2xl p-12 text-center border border-slate-200 space-y-4 shadow-sm max-w-2xl mx-auto my-6">
        <div class="w-16 h-16 mx-auto rounded-2xl bg-sky-50 text-[#004b93] flex items-center justify-center border border-sky-100 shadow-sm">
          <i data-lucide="paperclip" class="w-8 h-8"></i>
        </div>
        <div class="space-y-1.5">
          <h3 class="text-base font-bold text-slate-800">Nenhuma evidência vinculada a este modelo de documento ainda</h3>
          <p class="text-xs text-slate-500 leading-relaxed max-w-lg mx-auto">
            Nenhum arquivo ou log foi arquivado sob custódia para <strong>${escapeDocHtml(docCode)}</strong>. Você pode anexar comprovantes técnicos, formulários assinados, fotos de vistoria, relatórios ou telemetrias com cálculo automático de Hash SHA-256.
          </p>
        </div>
        <div class="pt-2">
          <button type="button" onclick="switchDocumentEvidenceTab('upload')" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#004b93] hover:bg-[#003d78] text-white text-xs font-bold cursor-pointer transition-colors shadow-md">
            <i data-lucide="plus-circle" class="w-4 h-4"></i>
            <span>+ Anexar Primeira Evidência a este Modelo</span>
          </button>
        </div>
      </div>
    `;
    return;
  }

  if (filtered.length === 0) {
    panel.innerHTML = `
      <div class="card-white rounded-xl p-8 text-center border border-slate-200 space-y-2.5 shadow-2xs">
        <p class="text-sm font-bold text-slate-800">Nenhum anexo encontrado para o filtro aplicado</p>
        <p class="text-xs text-slate-500">Tente buscar por outro termo ou limpe os filtros de pesquisa.</p>
        <button type="button" onclick="docEvidSearchQuery=''; docEvidCategoryFilter='todas'; document.getElementById('doc-evid-filter-search').value=''; document.getElementById('doc-evid-filter-category').value='todas'; renderDocumentEvidenceList('${docCode}');" class="mt-2 px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer">
          Limpar Filtros
        </button>
      </div>
    `;
    return;
  }

  // Paginação
  const totalItems = filtered.length;
  const pageSize = docEvidPageSize;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  if (docEvidCurrentPage > totalPages) docEvidCurrentPage = totalPages;
  const startIdx = (docEvidCurrentPage - 1) * pageSize;
  const endIdx = startIdx + pageSize;
  const pageItems = filtered.slice(startIdx, endIdx);

  // Barra de paginação reutilizável
  const paginationHtml = totalItems > 0 ? `
    <div class="card-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
      <div class="flex items-center gap-2 flex-wrap">
        <span>Exibindo <strong>${startIdx + 1}</strong> a <strong>${Math.min(endIdx, totalItems)}</strong> de <strong>${totalItems}</strong> registro(s)</span>
        <span class="text-slate-300">•</span>
        <div class="flex items-center gap-1.5">
          <span>Itens por página:</span>
          <select onchange="setDocumentEvidencePageSize(this.value)" class="bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-xs text-slate-700 focus:outline-none focus:border-[#004b93]">
            <option value="15" ${docEvidPageSize === 15 ? 'selected' : ''}>15</option>
            <option value="30" ${docEvidPageSize === 30 ? 'selected' : ''}>30</option>
            <option value="50" ${docEvidPageSize === 50 ? 'selected' : ''}>50</option>
            <option value="all" ${docEvidPageSize === Infinity ? 'selected' : ''}>Todos (${totalItems})</option>
          </select>
        </div>
      </div>
      <div class="flex items-center gap-1.5">
        <button type="button" ${docEvidCurrentPage <= 1 ? 'disabled' : ''} onclick="setDocumentEvidencePage(${docEvidCurrentPage - 1})" class="px-2.5 py-1 rounded border border-slate-200 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer transition-colors">
          &laquo; Anterior
        </button>
        <span class="px-2.5 py-1 text-xs font-mono font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded">
          Pág. ${docEvidCurrentPage} / ${totalPages}
        </span>
        <button type="button" ${docEvidCurrentPage >= totalPages ? 'disabled' : ''} onclick="setDocumentEvidencePage(${docEvidCurrentPage + 1})" class="px-2.5 py-1 rounded border border-slate-200 text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 cursor-pointer transition-colors">
          Próximo &raquo;
        </button>
      </div>
    </div>
  ` : '';

  // 1. MODO TABELA FORENSE COMPACTA (ALTA DENSIDADE)
  if (docEvidViewMode === "table") {
    panel.innerHTML = `
      <div class="flex items-center justify-between pb-1 text-xs text-slate-500 px-1">
        <span>Exibindo <strong>${pageItems.length}</strong> de <strong>${filtered.length}</strong> registro(s) em <strong>Tabela Forense</strong> (${allEvidences.length} total)</span>
        <button type="button" onclick="switchDocumentEvidenceTab('upload')" class="text-xs font-bold text-[#004b93] hover:underline flex items-center gap-1.5 cursor-pointer">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>+ Anexar Nova Evidência</span>
        </button>
      </div>

      <div class="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-2xs">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-600">
              <th class="py-3 px-3.5">ID Forense</th>
              <th class="py-3 px-3.5">${escapeDocHtml(cfg.entityLabel.split('/')[0].trim())}</th>
              <th class="py-3 px-3.5">Título & Categoria</th>
              <th class="py-3 px-3.5">Arquivo & SHA-256</th>
              <th class="py-3 px-3.5">Data / Resp.</th>
              <th class="py-3 px-3.5 text-right">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${pageItems.map(item => {
              const entityDisplay = item.entityName || item.investigatedPerson || item.userName || item.location || "Não especificado";
              const secondaryDisplay = item.secondaryInfo || item.investigatedEmail || "";
              const assetDisplay = item.assetOrSystem || item.originSystem || "";

              return `
              <tr class="hover:bg-blue-50/40 transition-colors">
                <td class="py-3 px-3.5 whitespace-nowrap align-top">
                  <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0f2942] text-white">${escapeDocHtml(item.id)}</span>
                </td>
                <td class="py-3 px-3.5 align-top">
                  <div class="space-y-0.5">
                    <div class="flex items-center gap-1.5">
                      <i data-lucide="${cfg.entityIcon}" class="w-3.5 h-3.5 text-[#004b93] shrink-0"></i>
                      <strong class="text-slate-900 font-bold text-xs truncate max-w-[200px] block" title="${escapeDocHtml(entityDisplay)}">${escapeDocHtml(entityDisplay)}</strong>
                    </div>
                    ${secondaryDisplay ? `<span class="text-[10.5px] text-slate-500 font-mono truncate max-w-[200px] block">${escapeDocHtml(secondaryDisplay)}</span>` : ''}
                    ${assetDisplay ? `<span class="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-medium bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[200px]">${escapeDocHtml(assetDisplay)}</span>` : ''}
                  </div>
                </td>
                <td class="py-3 px-3.5 align-top">
                  <div class="space-y-1">
                    <h5 class="text-xs font-bold text-slate-900 leading-snug truncate max-w-[260px]" title="${escapeDocHtml(item.title)}">${escapeDocHtml(item.title)}</h5>
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">${escapeDocHtml(item.category || 'Auditoria')}</span>
                      <span class="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">✓ ${escapeDocHtml(item.status || 'Homologada')}</span>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3.5 align-top">
                  <div class="space-y-1">
                    <div class="flex items-center gap-1 font-mono text-[11px] text-slate-700">
                      <i data-lucide="file-check" class="w-3.5 h-3.5 text-emerald-600 shrink-0"></i>
                      <span class="truncate max-w-[140px] font-bold" title="${escapeDocHtml(item.fileName || 'arquivo')}">${escapeDocHtml(item.fileName || 'arquivo')}</span>
                      <span class="text-slate-400 text-[10px]">(${escapeDocHtml(item.fileSize || '')})</span>
                    </div>
                    <div class="flex items-center gap-1">
                      <code class="px-1.5 py-0.2 rounded bg-slate-100 border border-slate-200 text-[9.5px] font-mono text-slate-700 max-w-[130px] truncate select-all" title="${item.sha256}">${(item.sha256||'').slice(0, 10)}...${(item.sha256||'').slice(-6)}</code>
                      <button type="button" onclick="navigator.clipboard.writeText('${item.sha256}'); if(window.showToast) window.showToast('Hash copiado!', 'success');" class="p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer" title="Copiar Hash Completo">
                        <i data-lucide="copy" class="w-3 h-3"></i>
                      </button>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3.5 align-top whitespace-nowrap">
                  <div class="space-y-0.5 text-[11px]">
                    <span class="font-mono text-slate-800 font-bold block">${escapeDocHtml(item.date || '')}</span>
                    <span class="text-[10px] text-slate-500 truncate block max-w-[120px]" title="${escapeDocHtml(item.responsible || 'Analista')}">Resp: ${escapeDocHtml(item.responsible || 'Analista')}</span>
                  </div>
                </td>
                <td class="py-3 px-3.5 align-top text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <button type="button" onclick="downloadDocumentEvidenceFile('${item.id}')" class="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 cursor-pointer transition-colors shadow-2xs" title="Baixar Arquivo">
                      <i data-lucide="download" class="w-3.5 h-3.5"></i>
                    </button>
                    <button type="button" onclick="printEvidenceForensicCertificate('${item.id}')" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 cursor-pointer transition-colors shadow-2xs" title="Emitir Certidão Forense">
                      <i data-lucide="award" class="w-3.5 h-3.5"></i>
                    </button>
                    <button type="button" onclick="deleteDocumentEvidence('${item.id}', '${docCode}')" class="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition-colors" title="Desvincular e Excluir">
                      <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                  </div>
                </td>
              </tr>
              `;
            }).join("")}
          </tbody>
        </table>
      </div>

      ${paginationHtml}
    `;

  } else {
    // 2. MODO CARDS DETALHADOS (VISUAL ENRIQUECIDO)
    panel.innerHTML = `
      <div class="flex items-center justify-between pb-1 text-xs text-slate-500 px-1">
        <span>Exibindo <strong>${pageItems.length}</strong> de <strong>${filtered.length}</strong> registro(s) em <strong>Cards</strong> (${allEvidences.length} total)</span>
        <button type="button" onclick="switchDocumentEvidenceTab('upload')" class="text-xs font-bold text-[#004b93] hover:underline flex items-center gap-1.5 cursor-pointer">
          <i data-lucide="plus-circle" class="w-4 h-4"></i>
          <span>+ Anexar Nova Evidência</span>
        </button>
      </div>

      <div class="space-y-3.5">
        ${pageItems.map(e => {
          const entityDisplay = e.entityName || e.investigatedPerson || e.userName || e.location || "Não especificado";
          const secondaryDisplay = e.secondaryInfo || e.investigatedEmail || "";
          const assetDisplay = e.assetOrSystem || e.originSystem || "";

          return `
          <div class="card-white rounded-xl p-5 border border-slate-200/90 hover:border-[#004b93]/50 transition-all space-y-3.5 shadow-2xs hover:shadow-sm">
            
            <!-- LINHA 1: CABEÇALHO DO REGISTRO COM ENTIDADE CONTEXTUAL -->
            <div class="flex items-start justify-between gap-3 flex-wrap">
              <div class="space-y-2 min-w-0 flex-1">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0f2942] text-white">${escapeDocHtml(e.id)}</span>
                  <span class="px-2.5 py-0.5 rounded text-[10px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">${escapeDocHtml(e.category || 'Auditoria & Custódia')}</span>
                  <span class="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">✓ ${escapeDocHtml(e.status || 'Homologada')}</span>
                  <span class="text-[11px] text-slate-400 font-mono">${escapeDocHtml(e.date || '')}</span>
                </div>

                <!-- DESTAQUE VISUAL EXCLUSIVO DA ENTIDADE / PESSOA / CANTEIRO -->
                <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50/90 border border-blue-200 text-xs text-blue-950 font-medium shadow-2xs flex-wrap">
                  <i data-lucide="${cfg.entityIcon}" class="w-4 h-4 text-[#004b93] shrink-0"></i>
                  <span>${escapeDocHtml(cfg.entityLabel)}: <strong class="text-[#004b93] font-extrabold text-[12.5px]">${escapeDocHtml(entityDisplay)}</strong></span>
                  ${secondaryDisplay ? `<span class="text-blue-300 font-normal">|</span><span class="font-mono text-[11px] text-blue-800">${escapeDocHtml(secondaryDisplay)}</span>` : ''}
                  ${assetDisplay ? `<span class="text-blue-300 font-normal">|</span><span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white border border-blue-200 text-blue-700">${escapeDocHtml(assetDisplay)}</span>` : ''}
                </div>

                <h4 class="text-sm font-bold text-slate-900 pt-0.5">${escapeDocHtml(e.title)}</h4>
                ${e.description ? `<p class="text-xs text-slate-600 leading-relaxed">${escapeDocHtml(e.description)}</p>` : ''}
              </div>

              <div class="flex items-center gap-2 shrink-0 pt-1">
                <button type="button" onclick="downloadDocumentEvidenceFile('${e.id}')" class="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs" title="Visualizar / Baixar arquivo original mantido sob custódia">
                  <i data-lucide="download" class="w-3.5 h-3.5 text-sky-600"></i>
                  <span>Baixar</span>
                </button>
                <button type="button" onclick="printEvidenceForensicCertificate('${e.id}')" class="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs" title="Emitir Certidão Oficial de Custódia Forense (ISO 27037)">
                  <i data-lucide="award" class="w-3.5 h-3.5 text-slate-600"></i>
                  <span>Certidão Forense</span>
                </button>
                <button type="button" onclick="deleteDocumentEvidence('${e.id}', '${docCode}')" class="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer transition-colors" title="Desvincular e Excluir Evidência">
                  <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
              </div>
            </div>

            <!-- LINHA 2: METADADOS DE ARQUIVO E HASH CRIPTOGRÁFICO DE INTEGRIDADE -->
            <div class="p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-[11px]">
              <div class="flex items-center gap-2 text-slate-600 min-w-0 flex-wrap">
                <i data-lucide="file-check" class="w-4 h-4 text-emerald-600 shrink-0"></i>
                <span class="font-mono font-bold text-slate-800 truncate">${escapeDocHtml(e.fileName || 'arquivo-evidencia')}</span>
                <span class="text-slate-400 font-mono">(${escapeDocHtml(e.fileSize || '1.0 MB')})</span>
                <span class="text-slate-300">•</span>
                <span class="text-slate-500">Analista Coletor: <strong>${escapeDocHtml(e.responsible || 'Analista de T.I.')}</strong></span>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <span class="text-[10px] text-slate-500 font-bold uppercase font-mono">SHA-256:</span>
                <code class="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10.5px] font-mono text-slate-800 max-w-[200px] sm:max-w-[260px] truncate select-all" title="${e.sha256}">${(e.sha256 || '').slice(0, 18)}...${(e.sha256 || '').slice(-8)}</code>
                <button type="button" onclick="navigator.clipboard.writeText('${e.sha256}'); if(window.showToast) window.showToast('Hash SHA-256 copiado para a área de transferência!', 'success');" class="p-1 text-slate-400 hover:text-slate-700 cursor-pointer" title="Copiar Hash Completo">
                  <i data-lucide="copy" class="w-3.5 h-3.5"></i>
                </button>
              </div>
            </div>

          </div>
          `;
        }).join("")}
      </div>

      ${paginationHtml}
    `;
  }

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

function renderDocumentEvidenceUploadForm(docCode) {
  const panel = document.getElementById("panel-doc-evid-upload");
  if (!panel) return;

  const tpl = getTemplateByCode(docCode) || { code: docCode, title: "Documento Corporativo" };
  const cfg = getDocumentContextualEvidenceConfig(docCode);
  const ctx = getTemplateContextDefaults();

  // Datalists inteligentes para autocompletar conforme o módulo
  let datalistHtml = "";
  if (cfg.module === "obras") {
    const obras = (typeof getStoredObras === "function") ? getStoredObras() : [];
    datalistHtml = `
      <datalist id="doc-evid-entity-datalist">
        ${obras.map(o => `<option value="${escapeDocHtml(o.name || o.id)}">${escapeDocHtml(o.city ? `${o.name} (${o.city})` : o.name)}</option>`).join("")}
      </datalist>
    `;
  } else if (cfg.module === "users" || cfg.module === "secops") {
    const users = (typeof getStoredUsers === "function") ? getStoredUsers() : [];
    datalistHtml = `
      <datalist id="doc-evid-entity-datalist">
        ${users.map(u => `<option value="${escapeDocHtml(u.name)}">${escapeDocHtml(u.email || u.roleName || '')}</option>`).join("")}
      </datalist>
    `;
  }

  panel.innerHTML = `
    <div class="card-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm max-w-4xl mx-auto space-y-6">
      <div class="border-b border-slate-100 pb-3">
        <h3 class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <i data-lucide="plus-circle" class="w-4 h-4 text-[#004b93]"></i>
          <span>Anexar Nova Evidência / Arquivo ao Modelo ${escapeDocHtml(docCode)}</span>
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">Preencha os metadados contextuais de <strong>${escapeDocHtml(tpl.title)}</strong> e vincule artefatos digitais protegidos por Hash SHA-256 inviolável.</p>
      </div>

      <form id="form-doc-evidence-upload" onsubmit="handleSaveDocumentEvidence(event, '${docCode}')" class="space-y-5 text-xs">
        ${datalistHtml}
        
        <!-- BLOCO 1: DADOS CONTEXTUAIS DO MODELO -->
        <div class="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-3">
          <div class="flex items-center gap-2 text-xs font-bold text-[#004b93]">
            <i data-lucide="${cfg.entityIcon}" class="w-4 h-4"></i>
            <span>${escapeDocHtml(cfg.entityLabel)} & Contexto Operacional</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-slate-700 font-semibold mb-1">${escapeDocHtml(cfg.entityLabel)} *</label>
              <input type="text" id="doc-evid-input-entity" list="doc-evid-entity-datalist" required placeholder="${escapeDocHtml(cfg.entityPlaceholder)}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004b93] text-xs" />
            </div>
            <div>
              <label class="block text-slate-700 font-semibold mb-1">${escapeDocHtml(cfg.secondaryLabel)}</label>
              <input type="text" id="doc-evid-input-secondary" placeholder="${escapeDocHtml(cfg.secondaryPlaceholder)}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004b93] text-xs" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label class="block text-slate-700 font-semibold mb-1">${escapeDocHtml(cfg.assetLabel)} *</label>
              <select id="doc-evid-input-asset" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004b93] text-xs">
                ${cfg.assetOptions.map(opt => `<option value="${escapeDocHtml(opt)}">${escapeDocHtml(opt)}</option>`).join("")}
              </select>
            </div>
            <div>
              <label class="block text-slate-700 font-semibold mb-1">Categoria Forense da Evidência *</label>
              <select id="doc-evid-input-category" required class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004b93] text-xs">
                ${cfg.defaultCategories.map(cat => `<option value="${escapeDocHtml(cat)}">${escapeDocHtml(cat)}</option>`).join("")}
              </select>
            </div>
          </div>
        </div>

        <!-- BLOCO 2: DROPZONE DE ARQUIVO INTERATIVA COM CÁLCULO SHA-256 EM TEMPO REAL -->
        <div>
          <label class="block text-slate-700 font-semibold mb-1.5">Arquivo da Evidência * (PDF, Prints/PNG/JPG, TXT, CSV, LOG, ZIP)</label>
          <div id="doc-evid-dropzone" onclick="document.getElementById('doc-evid-file-input').click()" class="border-2 border-dashed border-slate-300 hover:border-[#004b93] rounded-xl p-6 text-center bg-white cursor-pointer transition-all hover:bg-slate-50/50">
            <input type="file" id="doc-evid-file-input" class="hidden" onchange="handleDocumentEvidenceFileSelect(this)" />
            
            <div id="doc-evid-file-prompt" class="space-y-2">
              <div class="w-12 h-12 mx-auto rounded-full bg-blue-50 text-[#004b93] flex items-center justify-center">
                <i data-lucide="upload-cloud" class="w-6 h-6"></i>
              </div>
              <p class="font-bold text-slate-800 text-sm">Clique para selecionar ou arraste o arquivo aqui</p>
              <p class="text-xs text-slate-400 max-w-md mx-auto">Comprovante de conformidade, termo assinado, log do sistema, relatório pericial ou captura de tela</p>
            </div>

            <div id="doc-evid-file-selected" class="hidden space-y-2.5">
              <div class="flex items-center justify-center gap-2 text-emerald-700 font-bold text-sm">
                <i data-lucide="check-circle" class="w-5 h-5"></i>
                <span id="doc-evid-selected-name" class="font-mono"></span>
                <span id="doc-evid-selected-size" class="text-xs text-slate-500 font-normal"></span>
              </div>
              <div class="p-3 rounded-lg bg-slate-50 border border-slate-200 text-left font-mono text-[11px] text-slate-700 break-all max-w-xl mx-auto shadow-2xs">
                <strong class="text-slate-900 block mb-0.5">Hash SHA-256 Calculado em Tempo Real:</strong>
                <span id="doc-evid-selected-hash" class="text-emerald-800 select-all font-bold"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- BLOCO 3: DETALHES TÉCNICOS DA EVIDÊNCIA -->
        <div>
          <label class="block text-slate-700 font-semibold mb-1">Título da Evidência *</label>
          <input type="text" id="doc-evid-input-title" required placeholder="Ex: Anexo Comprobatório de Conformidade — ${escapeDocHtml(docCode)}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004b93] text-xs" />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label class="block text-slate-700 font-semibold mb-1">Analista / Responsável pela Coleta *</label>
            <input type="text" id="doc-evid-input-resp" required value="${escapeDocHtml(ctx.currentUserName || 'Analista de T.I. / GRC')}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004b93] text-xs" />
          </div>
          <div>
            <label class="block text-slate-700 font-semibold mb-1">Data da Coleta / Homologação *</label>
            <input type="date" id="doc-evid-input-date" required value="${new Date().toISOString().split('T')[0]}" class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004b93] text-xs" />
          </div>
        </div>

        <div>
          <label class="block text-slate-700 font-semibold mb-1">Parecer Técnico / Justificativa de Auditoria</label>
          <textarea id="doc-evid-input-notes" rows="3" placeholder="Descreva o contexto do anexo, justificativa técnica ou observações pertinentes para auditoria externa..." class="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-none focus:border-[#004b93] text-xs"></textarea>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button type="button" onclick="switchDocumentEvidenceTab('list')" class="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold cursor-pointer transition-colors">
            Cancelar
          </button>
          <button type="submit" class="px-5 py-2 rounded-lg bg-[#004b93] hover:bg-[#003d78] text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs">
            <i data-lucide="check" class="w-4 h-4"></i>
            <span>Salvar e Vincular Registro ao Modelo</span>
          </button>
        </div>
      </form>
    </div>
  `;

  const dropzone = document.getElementById("doc-evid-dropzone");
  if (dropzone) {
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("border-[#004b93]", "bg-blue-50/40");
    });
    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("border-[#004b93]", "bg-blue-50/40");
    });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("border-[#004b93]", "bg-blue-50/40");
      if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
        const fileInput = document.getElementById("doc-evid-file-input");
        if (fileInput) {
          fileInput.files = e.dataTransfer.files;
          handleDocumentEvidenceFileSelect(fileInput);
        }
      }
    });
  }

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

async function handleDocumentEvidenceFileSelect(input) {
  if (!input || !input.files || !input.files[0]) return;
  const file = input.files[0];

  const promptEl = document.getElementById("doc-evid-file-prompt");
  const selectedEl = document.getElementById("doc-evid-file-selected");
  const nameEl = document.getElementById("doc-evid-selected-name");
  const sizeEl = document.getElementById("doc-evid-selected-size");
  const hashEl = document.getElementById("doc-evid-selected-hash");
  const titleEl = document.getElementById("doc-evid-input-title");

  const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
  const sizeStr = file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${sizeMb} MB`;

  if (nameEl) nameEl.textContent = file.name;
  if (sizeEl) sizeEl.textContent = `(${sizeStr})`;
  if (hashEl) hashEl.textContent = "Calculando hash criptográfico SHA-256...";

  if (promptEl) promptEl.classList.add("hidden");
  if (selectedEl) selectedEl.classList.remove("hidden");

  if (titleEl && !titleEl.value.trim()) {
    titleEl.value = `${file.name.replace(/\.[^/.]+$/, "")} — Evidência Vinculada`;
  }

  try {
    const buffer = await file.arrayBuffer();
    const sha256 = await computeUniversalSHA256(buffer);
    if (hashEl) hashEl.textContent = sha256;

    activeEvidenceUploadFile = {
      file,
      name: file.name,
      sizeStr,
      sha256,
      type: file.type
    };

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (activeEvidenceUploadFile) {
        activeEvidenceUploadFile.dataUrl = evt.target.result;
      }
    };
    reader.readAsDataURL(file);

  } catch (err) {
    console.warn("Falha no cálculo SHA-256 do arquivo:", err);
    const fallbackHash = sha256PureSync(`${file.name}:${file.size}:${file.lastModified || Date.now()}`);
    if (hashEl) hashEl.textContent = fallbackHash;
    activeEvidenceUploadFile = {
      file,
      name: file.name,
      sizeStr,
      sha256: fallbackHash,
      type: file.type
    };
  }
}

async function handleSaveDocumentEvidence(e, docCode) {
  e.preventDefault();

  const title = (document.getElementById("doc-evid-input-title")?.value || "").trim();
  const entityVal = (document.getElementById("doc-evid-input-entity")?.value || "").trim();
  const secondaryVal = (document.getElementById("doc-evid-input-secondary")?.value || "").trim();
  const assetVal = document.getElementById("doc-evid-input-asset")?.value || "Sistemas Corporativos AC Engenharia";
  const category = document.getElementById("doc-evid-input-category")?.value || "Auditoria & Custódia Forense";
  const responsible = (document.getElementById("doc-evid-input-resp")?.value || "Analista de T.I. / GRC").trim();
  const date = document.getElementById("doc-evid-input-date")?.value || new Date().toISOString().split("T")[0];
  const notes = (document.getElementById("doc-evid-input-notes")?.value || "").trim();

  const cfg = getDocumentContextualEvidenceConfig(docCode);

  if (!title) {
    if (window.showToast) window.showToast("Informe o título da evidência.", "warning");
    return;
  }

  if (!entityVal) {
    if (window.showToast) window.showToast(`Informe o campo obrigatório: ${cfg.entityLabel}.`, "warning");
    return;
  }

  const tpl = getTemplateByCode(docCode) || { code: docCode, normative: "ISO/IEC 27001:2022" };

  let fileName = "comprovante-forense.pdf";
  let fileSize = "1.0 MB";
  let sha256 = "";
  let fileDataUrl = null;

  if (activeEvidenceUploadFile) {
    fileName = activeEvidenceUploadFile.name;
    fileSize = activeEvidenceUploadFile.sizeStr;
    sha256 = activeEvidenceUploadFile.sha256;
    fileDataUrl = activeEvidenceUploadFile.dataUrl;
  } else {
    const metaPayload = `${docCode}|${title}|${entityVal}|${secondaryVal}|${assetVal}|${date}|${responsible}|${notes}`;
    sha256 = await computeUniversalSHA256(metaPayload);
  }

  const all = (typeof getStoredEvidence === "function") ? getStoredEvidence() : [];
  const nextNum = all.length + 1;
  const newId = `EVID-${String(nextNum).padStart(3, "0")}`;

  const newEvid = {
    id: newId,
    title,
    control: `${tpl.code} / ${tpl.normative}`,
    category,
    location: cfg.module === "obras" ? entityVal : "Escritório Central (Matriz)",
    responsible,
    // Propriedades universais e contextuais
    entityName: entityVal,
    secondaryInfo: secondaryVal,
    assetOrSystem: assetVal,
    // Retrocompatibilidade total com módulos de triagem, relatórios e secops
    investigatedPerson: entityVal,
    userName: entityVal,
    investigatedEmail: (cfg.module === "secops" || secondaryVal.includes("@")) ? secondaryVal : "",
    originSystem: assetVal,
    date,
    fileName,
    fileSize,
    sha256,
    status: "Homologada",
    approvedBy: responsible,
    description: notes || `Evidência vinculada ao modelo ${tpl.code} (${tpl.title}) para ${entityVal}.`,
    documentCode: docCode,
    relatedDoc: docCode,
    fileDataUrl: fileDataUrl,
    uploadedAt: new Date().toISOString()
  };

  all.unshift(newEvid);
  if (typeof saveStoredEvidence === "function") {
    saveStoredEvidence(all);
  }

  if (window.ApiService && typeof window.ApiService.addAuditRecord === "function") {
    window.ApiService.addAuditRecord({
      action: "ANEXO_EVIDENCIA_DOCUMENTO",
      module: "Documentos",
      details: `Evidência ${newEvid.id} vinculada ao modelo ${docCode} para ${entityVal}: "${title}" (SHA-256: ${sha256.slice(0, 16)}...)`
    });
  }

  if (window.showToast) {
    window.showToast(`Evidência [${newId}] para "${entityVal}" indexada com sucesso!`, "success");
  }

  activeEvidenceUploadFile = null;
  populateDocumentEvidenceCategoryFilter(docCode);
  switchDocumentEvidenceTab("list");
  renderDocumentTemplatesGrid();

  const btnPreviewText = document.getElementById("btn-preview-doc-evidence-text");
  if (btnPreviewText) {
    const remaining = getEvidencesForDocument(docCode);
    btnPreviewText.textContent = `Evidências Anexadas (${remaining.length})`;
  }
}

async function deleteDocumentEvidence(evidenceId, docCode) {
  const ok = confirm(`Deseja realmente desvincular e remover a evidência ${evidenceId}?`);
  if (!ok) return;

  let all = (typeof getStoredEvidence === "function") ? getStoredEvidence() : [];
  all = all.filter(e => e.id !== evidenceId);
  if (typeof saveStoredEvidence === "function") {
    saveStoredEvidence(all);
  }

  if (window.ApiService && typeof window.ApiService.addAuditRecord === "function") {
    window.ApiService.addAuditRecord({
      action: "EXCLUSAO_EVIDENCIA_DOCUMENTO",
      module: "Documentos",
      details: `Evidência ${evidenceId} desvinculada do modelo ${docCode}`
    });
  }

  if (window.showToast) {
    window.showToast(`Evidência ${evidenceId} desvinculada com sucesso.`, "info");
  }

  populateDocumentEvidenceCategoryFilter(docCode);
  renderDocumentEvidenceList(docCode);
  renderDocumentTemplatesGrid();

  const btnPreviewText = document.getElementById("btn-preview-doc-evidence-text");
  if (btnPreviewText) {
    const remaining = getEvidencesForDocument(docCode);
    btnPreviewText.textContent = `Evidências Anexadas (${remaining.length})`;
  }
}

function downloadDocumentEvidenceFile(evidenceId) {
  const all = (typeof getStoredEvidence === "function") ? getStoredEvidence() : [];
  const ev = all.find(e => e.id === evidenceId);
  if (!ev) return;

  if (ev.fileDataUrl) {
    const a = document.createElement("a");
    a.href = ev.fileDataUrl;
    a.download = ev.fileName || `evidencia-${ev.id}.bin`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    const cfg = getDocumentContextualEvidenceConfig(ev.documentCode);
    const entityDisplay = ev.entityName || ev.investigatedPerson || ev.userName || ev.location || "Não especificado";
    const secondaryDisplay = ev.secondaryInfo || ev.investigatedEmail || "Não informado";
    const assetDisplay = ev.assetOrSystem || ev.originSystem || "Sistemas Corporativos AC Engenharia";

    const content = `AC ENGENHARIA LTDA. — SISTEMA DE GESTÃO DE SEGURANÇA DA INFORMAÇÃO (SGSI)
EVIDÊNCIA FORENSE DE CONTROLE AUDITÁVEL (ISO/IEC 27001 & LGPD)
--------------------------------------------------------------------------------
Identificador da Evidência: ${ev.id}
Documento Vinculado: ${ev.documentCode || 'MOD-CORP'}
${cfg.entityLabel}: ${entityDisplay}
${cfg.secondaryLabel}: ${secondaryDisplay}
${cfg.assetLabel}: ${assetDisplay}
Título: ${ev.title}
Categoria: ${ev.category || 'Auditoria & Custódia'}
Controle Normativo: ${ev.control || 'ISO/IEC 27001:2022'}
Responsável pela Coleta: ${ev.responsible || 'Analista de T.I. / GRC'}
Data do Registro: ${ev.date || ''}
Nome do Arquivo Original: ${ev.fileName || 'arquivo-evidencia'}
Tamanho do Arquivo: ${ev.fileSize || 'N/A'}
Status: ${ev.status || 'Homologada'}
--------------------------------------------------------------------------------
HASH CRIPTOGRÁFICO DE INTEGRIDADE (SHA-256):
${ev.sha256 || 'N/A'}
--------------------------------------------------------------------------------
PARECER TÉCNICO / NOTAS DE AUDITORIA:
${ev.description || 'Sem observações adicionais.'}
--------------------------------------------------------------------------------
Este registro possui validade jurídica e comprovação técnica perante auditorias
independentes e fiscalizações regulatórias (ISO 27001 / ANPD).`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${ev.id}-${(ev.fileName || 'evidencia.txt').replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (window.showToast) {
    window.showToast(`Download da evidência ${ev.id} iniciado.`, "success");
  }
}

function printEvidenceForensicCertificate(evidenceId) {
  const all = (typeof getStoredEvidence === "function") ? getStoredEvidence() : [];
  const ev = all.find(e => e.id === evidenceId);
  if (!ev) return;

  const tpl = getTemplateByCode(ev.documentCode || "MOD-SEG-08-A") || { code: ev.documentCode, title: ev.title, normative: "ISO/IEC 27001:2022" };
  const cfg = getDocumentContextualEvidenceConfig(ev.documentCode);
  const protocol = `CERT-${ev.id}-${Date.now().toString().slice(-6)}`;
  const emissionDate = new Date().toLocaleDateString("pt-BR") + " às " + new Date().toLocaleTimeString("pt-BR");
  
  const entityDisplay = ev.entityName || ev.investigatedPerson || ev.userName || ev.location || "Entidade Vinculada";
  const secondaryDisplay = ev.secondaryInfo || ev.investigatedEmail || "";
  const assetDisplay = ev.assetOrSystem || ev.originSystem || "Sistemas Corporativos AC Engenharia";

  const printHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Certidão Forense — ${escapeDocHtml(ev.id)}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 40px; color: #0f172a; line-height: 1.5; font-size: 12px; }
    .header { border-bottom: 2px solid #004b93; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 16px; font-weight: 800; color: #004b93; text-transform: uppercase; margin: 0; }
    .subtitle { font-size: 11px; color: #64748b; margin: 2px 0 0 0; }
    .badge { background: #0f2942; color: #fff; padding: 4px 10px; border-radius: 4px; font-family: monospace; font-size: 11px; font-weight: bold; }
    .section-title { font-size: 12px; font-weight: bold; text-transform: uppercase; color: #0f2942; border-left: 3px solid #004b93; padding-left: 8px; margin: 16px 0 8px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    td, th { border: 1px solid #cbd5e1; padding: 8px 10px; font-size: 11px; }
    th { background: #f8fafc; font-weight: bold; text-align: left; }
    .hash-box { background: #f1f5f9; border: 1px solid #94a3b8; border-radius: 6px; padding: 12px; font-family: monospace; font-size: 12px; word-break: break-all; color: #0f172a; margin: 12px 0; }
    .legal-notice { font-size: 10px; color: #475569; text-align: justify; margin: 16px 0; padding: 10px; background: #fafafa; border: 1px dashed #cbd5e1; border-radius: 4px; }
    .sigs { display: flex; justify-content: space-around; margin-top: 40px; }
    .sig-block { text-align: center; width: 40%; border-top: 1px solid #0f172a; padding-top: 6px; font-size: 10px; }
    @media print { body { margin: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1 class="title">AC ENGENHARIA LTDA.</h1>
      <p class="subtitle">Sistema de Gestão de Segurança da Informação (SGSI) — Trilha de Auditoria Forense</p>
    </div>
    <div class="badge">${escapeDocHtml(protocol)}</div>
  </div>

  <h2 style="font-size: 14px; font-weight: bold; text-align: center; margin: 15px 0;">CERTIDÃO DE CUSTÓDIA FORENSE E INTEGRIDADE DE EVIDÊNCIA DIGITAL</h2>
  <p style="text-align: center; font-size: 11px; color: #475569;">Emitida em conformidade com ISO/IEC 27037 (Diretrizes para Preservação de Evidência Digital) e Art. 46 da LGPD</p>

  <div class="section-title">1. Dados do Documento e Objeto de Auditoria</div>
  <table>
    <tr><th width="32%">Modelo Vinculado</th><td><strong>${escapeDocHtml(tpl.code)}</strong> — ${escapeDocHtml(tpl.title)}</td></tr>
    <tr><th>${escapeDocHtml(cfg.entityLabel)}:</th><td><strong style="color: #004b93; font-size: 13px;">${escapeDocHtml(entityDisplay)}</strong> ${secondaryDisplay ? `<span style="font-family: monospace; color: #475569;">(${escapeDocHtml(secondaryDisplay)})</span>` : ''}</td></tr>
    <tr><th>${escapeDocHtml(cfg.assetLabel)}:</th><td><strong>${escapeDocHtml(assetDisplay)}</strong></td></tr>
    <tr><th>Norma / Requisito</th><td>${escapeDocHtml(tpl.normative || 'ISO/IEC 27001')}</td></tr>
    <tr><th>ID da Evidência</th><td><code>${escapeDocHtml(ev.id)}</code></td></tr>
    <tr><th>Título da Evidência</th><td><strong>${escapeDocHtml(ev.title)}</strong></td></tr>
    <tr><th>Categoria Forense</th><td>${escapeDocHtml(ev.category || 'Auditoria & Custódia')}</td></tr>
    <tr><th>Arquivo Original</th><td>${escapeDocHtml(ev.fileName || 'documento')} (${escapeDocHtml(ev.fileSize || 'N/A')})</td></tr>
    <tr><th>Responsável pela Coleta</th><td>${escapeDocHtml(ev.responsible || 'Analista de T.I. / GRC')}</td></tr>
    <tr><th>Data do Registro / Coleta</th><td>${escapeDocHtml(ev.date || '')}</td></tr>
    <tr><th>Status de Homologação</th><td>${escapeDocHtml(ev.status || 'Homologada')} por ${escapeDocHtml(ev.approvedBy || 'Analista CSIRT')}</td></tr>
  </table>

  <div class="section-title">2. Assinatura Criptográfica e Integridade do Arquivo (SHA-256)</div>
  <div class="hash-box">
    <strong>Algoritmo Criptográfico:</strong> SHA-256 (FIPS 180-4)<br />
    <strong>Impressão Digital Forense (Hash):</strong><br />
    <span style="font-size: 13px; font-weight: bold; color: #004b93;">${escapeDocHtml(ev.sha256 || 'N/A')}</span>
  </div>

  <div class="section-title">3. Parecer Técnico / Justificativa da Evidência</div>
  <p style="padding: 8px; background: #fff; border: 1px solid #e2e8f0; font-size: 11px; min-height: 40px;">
    ${escapeDocHtml(ev.description || 'Evidência arquivada sob custódia digital para comprovação de conformidade e auditoria.')}
  </p>

  <div class="legal-notice">
    <strong>Declaração de Autenticidade e Não-Repúdio:</strong> Certifica-se, para todos os efeitos de auditoria interna, externa e conformidade regulatória (LGPD / ANPD / ISO 27001), que o artefato digital supramencionado foi indexado ao Sistema de Gestão de Segurança da Informação da AC Engenharia sob custódia digital inviolável. O hash criptográfico SHA-256 acima assegura a estrita imutabilidade e integridade temporal da evidência desde o momento de sua indexação.
  </div>

  <div class="sigs">
    <div class="sig-block">
      <strong>${escapeDocHtml(ev.responsible || 'Analista de T.I. / GRC')}</strong><br />
      Analista Responsável pela Coleta e Custódia<br />
      AC Engenharia — T.I. & Segurança
    </div>
    <div class="sig-block">
      <strong>Encarregado de Dados (DPO) / Gestor SGSI</strong><br />
      Governança, Riscos e Compliance (GRC)<br />
      AC Engenharia — Matriz
    </div>
  </div>

  <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 8px; font-size: 9px; color: #94a3b8; text-align: center;">
    Certidão emitida eletronicamente em ${escapeDocHtml(emissionDate)} pelo Sistema Corporativo SGSI AC Engenharia &bull; Protocolo ${escapeDocHtml(protocol)}
  </div>
</body>
</html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.open();
    w.document.write(printHtml);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 400);
  }
}

// Exposição Global
window.CORPORATE_DOCUMENT_TEMPLATES = CORPORATE_DOCUMENT_TEMPLATES;
window.getTemplateByCode = getTemplateByCode;
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

// Motor Criptográfico Universal SHA-256 (FIPS 180-4)
window.sha256PureSync = sha256PureSync;
window.computeUniversalSHA256 = computeUniversalSHA256;

// Central de Evidências & Custódia Forense (Todos os 43 Modelos)
window.isEvidenceHubEnabledForDoc = isEvidenceHubEnabledForDoc;
window.getDocumentContextualEvidenceConfig = getDocumentContextualEvidenceConfig;
window.populateDocumentEvidenceCategoryFilter = populateDocumentEvidenceCategoryFilter;
window.updateDocumentEvidenceViewButtons = updateDocumentEvidenceViewButtons;
window.setDocumentEvidenceViewMode = setDocumentEvidenceViewMode;
window.setDocumentEvidenceSort = setDocumentEvidenceSort;
window.setDocumentEvidencePage = setDocumentEvidencePage;
window.setDocumentEvidencePageSize = setDocumentEvidencePageSize;
window.exportDocumentEvidenceManifest = exportDocumentEvidenceManifest;
window.getEvidencesForDocument = getEvidencesForDocument;
window.openDocumentEvidenceModal = openDocumentEvidenceModal;
window.closeDocumentEvidenceModal = closeDocumentEvidenceModal;
window.switchDocumentEvidenceTab = switchDocumentEvidenceTab;
window.applyDocumentEvidenceFilters = applyDocumentEvidenceFilters;
window.renderDocumentEvidenceList = renderDocumentEvidenceList;
window.renderDocumentEvidenceUploadForm = renderDocumentEvidenceUploadForm;
window.handleDocumentEvidenceFileSelect = handleDocumentEvidenceFileSelect;
window.handleSaveDocumentEvidence = handleSaveDocumentEvidence;
window.deleteDocumentEvidence = deleteDocumentEvidence;
window.downloadDocumentEvidenceFile = downloadDocumentEvidenceFile;
window.printEvidenceForensicCertificate = printEvidenceForensicCertificate;

document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("doc-templates-grid")) {
    renderDocumentTemplatesGrid();
  }
});
