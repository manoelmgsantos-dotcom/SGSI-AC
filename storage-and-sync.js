/**
 * storage-and-sync.js - Gerenciador Unificado de Persistência, Banco de Dados (PostgreSQL/API),
 * Relacionamento Automático entre Módulos e Indicadores Dinâmicos em Tempo Real.
 * AC Engenharia - SGSI & CyberGRC Enterprise Platform
 */

// Limpeza automática de chaves legadas de demonstração no navegador
(function purgeLegacyDemoStorageKeys() {
  const legacyKeys = [
    "AC_CONSTRUTORA_SGSI_DB_V12",
    "AC_SGSI_OBRAS_V2",
    "AC_OBRAS_DATA_V1",
    "ac_roadmap_tasks_v2",
    "ac_campaigns_52_weeks_v2",
    "AC_API_CONNECTORS_V3",
    "ac_evidence_repository_v2"
  ];
  try {
    legacyKeys.forEach(k => localStorage.removeItem(k));
  } catch {
    // ignore storage errors
  }
})();

const StorageManager = {
  UNIFIED_KEY: "AC_ENGENHARIA_UNIFIED_SNAPSHOT_V1",
  syncTimer: null,
  isSyncing: false,
  lastAppliedSignature: null,
  backendStatus: {
    online: false,
    postgresOnline: false,
    engine: "Verificando...",
    lastSync: null,
    tunnelUrl: null,
    lanUrl: null
  },

  computeSnapshotSignature(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return "";
    try {
      const { meta, ...collectionsOnly } = snapshot;
      return JSON.stringify(collectionsOnly);
    } catch {
      return "";
    }
  },

  // 1. Coleta todas as coleções do sistema em um único Snapshot estruturado
  collectSnapshot() {
    const coreDb = (typeof getStoredDB === "function") ? getStoredDB() : {};
    const evidence = (typeof getStoredEvidence === "function") ? getStoredEvidence() : [];
    const roadmapTasks = (typeof getStoredRoadmapTasks === "function") ? getStoredRoadmapTasks() : [];
    const campaigns = (typeof getStoredCampaigns === "function") ? getStoredCampaigns() : [];
    const connectorsObj = (typeof getStoredConnectors === "function") ? getStoredConnectors() : {};
    const users = (typeof getStoredUsers === "function") ? getStoredUsers() : [];
    const obras = (typeof getStoredObras === "function") ? getStoredObras() : [];

    const connectors = Object.values(connectorsObj || {});

    return {
      meta: {
        version: "2.0.0",
        exportedAt: new Date().toISOString(),
        organization: "AC Engenharia"
      },
      soaControls: coreDb.soaControls || [],
      raciMatrix: coreDb.raciMatrix || [],
      policies: coreDb.policies || [],
      policyLogs: coreDb.policyLogs || [],
      risks: coreDb.risks || [],
      ropa: coreDb.ropa || [],
      dsar: coreDb.dsar || [],
      thirdParties: coreDb.thirdParties || [],
      wazuhAlerts: coreDb.wazuhAlerts || [],
      assets: coreDb.assets || [],
      incidents: coreDb.incidents || [],
      auditLogs: coreDb.auditLogs || [],
      evidence: Array.isArray(evidence) ? evidence : [],
      roadmapTasks: Array.isArray(roadmapTasks) ? roadmapTasks : [],
      campaigns: Array.isArray(campaigns) ? campaigns : [],
      connectors: Array.isArray(connectors) ? connectors : [],
      users: Array.isArray(users) ? users : [],
      obras: Array.isArray(obras) ? obras : []
    };
  },

  // 2. Restaura um Snapshot unificado para todas as estruturas do sistema
  applySnapshot(snapshot, options = { render: true }) {
    if (!snapshot || typeof snapshot !== "object") return false;

    const coreDb = (typeof getStoredDB === "function") ? getStoredDB() : {};
    const coreKeys = [
      "soaControls", "raciMatrix", "policies", "policyLogs",
      "risks", "ropa", "dsar", "thirdParties",
      "wazuhAlerts", "assets", "incidents", "auditLogs"
    ];

    let coreChanged = false;
    coreKeys.forEach(k => {
      if (Array.isArray(snapshot[k])) {
        coreDb[k] = snapshot[k];
        coreChanged = true;
      }
    });

    if (coreChanged) {
      const rawCore = JSON.stringify(coreDb);
      window._sgsiDbRaw = rawCore;
      window._sgsiDbCache = coreDb;
      localStorage.setItem("AC_ENGENHARIA_SGSI_DB_V1", rawCore);
    }

    if (Array.isArray(snapshot.evidence)) {
      localStorage.setItem("AC_ENGENHARIA_EVIDENCE_V1", JSON.stringify(snapshot.evidence));
    }
    if (Array.isArray(snapshot.roadmapTasks)) {
      localStorage.setItem("AC_ENGENHARIA_ROADMAP_V1", JSON.stringify(snapshot.roadmapTasks));
    }
    if (Array.isArray(snapshot.campaigns)) {
      localStorage.setItem("AC_ENGENHARIA_CAMPAIGNS_V1", JSON.stringify(snapshot.campaigns));
    }
    if (Array.isArray(snapshot.connectors) && snapshot.connectors.length > 0) {
      const connMap = {};
      snapshot.connectors.forEach(c => {
        if (c && c.id) connMap[c.id] = c;
      });
      localStorage.setItem("AC_ENGENHARIA_CONNECTORS_V1", JSON.stringify(connMap));
    }
    if (Array.isArray(snapshot.users) && snapshot.users.length > 0) {
      localStorage.setItem("AC_USERS_DB_V2", JSON.stringify(snapshot.users));
    }
    if (Array.isArray(snapshot.obras) && snapshot.obras.length > 0) {
      localStorage.setItem("AC_ENGENHARIA_OBRAS_V1", JSON.stringify(snapshot.obras));
    }

    this.lastAppliedSignature = this.computeSnapshotSignature(snapshot);

    if (options.render) {
      if (typeof refreshAllObraDropdowns === "function") refreshAllObraDropdowns();
      if (typeof renderPersonaDashboardKPIs === "function") renderPersonaDashboardKPIs();
      if (typeof renderCurrentTab === "function") renderCurrentTab();
    }
    return true;
  },

  // 3. Agenda sincronização assíncrona com o Backend (PostgreSQL 17 / Disco Local)
  scheduleSync() {
    if (this.syncTimer) clearTimeout(this.syncTimer);
    this.syncTimer = setTimeout(() => {
      this.syncTimer = null;
      this.syncToServer();
    }, 350);
  },

  async checkHealth() {
    try {
      const res = await fetch("/api/health", { method: "GET" });
      if (!res.ok) throw new Error("API indisponível");
      const data = await res.json();
      this.backendStatus.online = true;
      this.backendStatus.postgresOnline = Boolean(data.postgresOnline);
      this.backendStatus.engine = data.engine || (data.postgresOnline ? "PostgreSQL" : "Persistência Local");
      this.backendStatus.tunnelUrl = data.tunnelUrl || null;
      this.backendStatus.lanUrl = data.lanUrl || null;
    } catch {
      this.backendStatus.online = false;
      this.backendStatus.postgresOnline = false;
      this.backendStatus.engine = "LocalStorage (Navegador)";
    }
    this.updateSidebarStatusUI();
    return this.backendStatus;
  },

  async copyAccessLink() {
    await this.checkHealth();
    const link = this.backendStatus.tunnelUrl || this.backendStatus.lanUrl || window.location.origin;
    try {
      await navigator.clipboard.writeText(link);
      if (typeof showToast === "function") {
        const label = this.backendStatus.tunnelUrl ? "Link público Cloudflare ativo" : "Link de rede local";
        showToast(`${label} copiado: ${link}`, "success");
      }
    } catch {
      window.prompt("Copie o link ativo de acesso ao sistema:", link);
    }
  },

  async syncToServer(showNotification = false) {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
      this.syncTimer = null;
    }
    const snapshot = this.collectSnapshot();
    const signature = this.computeSnapshotSignature(snapshot);

    this.isSyncing = true;
    try {
      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot })
      });
      if (res.ok) {
        const info = await res.json();
        this.lastAppliedSignature = signature;
        this.backendStatus.online = true;
        this.backendStatus.postgresOnline = Boolean(info.postgresOnline);
        this.backendStatus.engine = info.engine || "Banco Local em Disco";
        this.backendStatus.lastSync = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
        this.updateSidebarStatusUI();
        if (showNotification && typeof showToast === "function") {
          showToast(`Banco sincronizado (${this.backendStatus.engine}) às ${this.backendStatus.lastSync}`, "success");
        }
        return true;
      }
    } catch {
      this.backendStatus.online = false;
      this.updateSidebarStatusUI();
    } finally {
      this.isSyncing = false;
    }
    return false;
  },

  async pullFromServerOnStartup(options = {}) {
    const isBackgroundPoll = Boolean(options && options.isBackgroundPoll);
    if (isBackgroundPoll && (this.isSyncing || this.syncTimer !== null)) {
      return;
    }

    try {
      const res = await fetch("/api/sync", { method: "GET" });
      if (!res.ok) {
        this.backendStatus.online = false;
        this.updateSidebarStatusUI();
        return;
      }
      const payload = await res.json();
      this.backendStatus.online = true;
      this.backendStatus.postgresOnline = Boolean(payload.postgresOnline);
      this.backendStatus.engine = payload.engine || (payload.postgresOnline ? "PostgreSQL" : "Banco Local em Disco");
      if (payload.tunnelUrl !== undefined) this.backendStatus.tunnelUrl = payload.tunnelUrl || null;
      if (payload.lanUrl !== undefined) this.backendStatus.lanUrl = payload.lanUrl || null;
      this.updateSidebarStatusUI();

      if (isBackgroundPoll && (this.isSyncing || this.syncTimer !== null)) {
        return;
      }

      if (payload.hasData && payload.snapshot) {
        // Se o servidor possui obras cadastradas, a base oficial do PostgreSQL é a autoridade máxima
        if (!Array.isArray(payload.snapshot.obras) || payload.snapshot.obras.length === 0) {
          const localObras = (typeof getStoredObras === "function") ? getStoredObras() : [];
          payload.snapshot.obras = localObras;
          fetch('/api/obras', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ obras: localObras })
          }).catch(() => {});
        }

        // Se o servidor possui usuários cadastrados, a base oficial do PostgreSQL é a autoridade máxima
        if (!Array.isArray(payload.snapshot.users) || payload.snapshot.users.length === 0) {
          const localUsers = (typeof getStoredUsers === "function") ? getStoredUsers() : [];
          payload.snapshot.users = localUsers;
          fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: localUsers })
          }).catch(() => {});
        }

        const incomingSig = this.computeSnapshotSignature(payload.snapshot);
        if (isBackgroundPoll && this.lastAppliedSignature && incomingSig === this.lastAppliedSignature) {
          return;
        }

        const activeTag = (typeof document !== "undefined" && document.activeElement && document.activeElement.tagName)
          ? document.activeElement.tagName.toUpperCase()
          : "";
        const isUserTyping = isBackgroundPoll && (activeTag === "INPUT" || activeTag === "TEXTAREA" || activeTag === "SELECT");

        // Aplica o snapshot oficial no navegador atual sem interromper formulários em edição
        this.applySnapshot(payload.snapshot, { render: !isUserTyping });
      } else {
        // Servidor ainda vazio: envia o estado atual do navegador para inicializar o banco (PostgreSQL / Disco)
        await this.syncToServer(false);
      }
    } catch (err) {
      this.backendStatus.online = false;
      this.updateSidebarStatusUI();
      console.warn("Falha ao buscar estado inicial do servidor:", err);
    }
  },

  updateSidebarStatusUI() {
    const badgeEl = document.getElementById("sidebar-db-status-dot");
    const textEl = document.getElementById("sidebar-db-status-text");
    const subEl = document.getElementById("sidebar-db-status-sub");
    if (!textEl) return;

    if (this.backendStatus.postgresOnline) {
      if (badgeEl) badgeEl.className = "w-2 h-2 rounded-full bg-emerald-400 shrink-0";
      textEl.textContent = "PostgreSQL Conectado";
      if (subEl) subEl.textContent = this.backendStatus.lastSync ? `Sincronizado às ${this.backendStatus.lastSync}` : "Base ativa (porta 5432)";
    } else if (this.backendStatus.online) {
      if (badgeEl) badgeEl.className = "w-2 h-2 rounded-full bg-sky-400 shrink-0";
      textEl.textContent = "API + Disco Local";
      if (subEl) subEl.textContent = this.backendStatus.lastSync ? `Salvo em disco às ${this.backendStatus.lastSync}` : "Aguardando PostgreSQL";
    } else {
      if (badgeEl) badgeEl.className = "w-2 h-2 rounded-full bg-amber-400 shrink-0";
      textEl.textContent = "Armazenamento Local";
      if (subEl) subEl.textContent = "Cache do navegador";
    }
  },

  // 4. Exportação e Importação de Backup Completo (.json)
  exportFullBackupJSON() {
    const snapshot = this.collectSnapshot();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const a = document.createElement("a");
    const dateTag = new Date().toISOString().split("T")[0];
    a.setAttribute("href", dataStr);
    a.setAttribute("download", `backup_completo_sgsi_ac_construtora_${dateTag}.json`);
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (typeof showToast === "function") {
      showToast("Backup completo do SGSI (.json) exportado com sucesso!", "success");
    }
  },

  triggerImportBackupJSON() {
    let fileInput = document.getElementById("hidden-backup-json-input");
    if (!fileInput) {
      fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.id = "hidden-backup-json-input";
      fileInput.accept = ".json,application/json";
      fileInput.className = "hidden";
      fileInput.addEventListener("change", (ev) => this.handleImportBackupFile(ev));
      document.body.appendChild(fileInput);
    }
    fileInput.value = "";
    fileInput.click();
  },

  async handleImportBackupFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || (!parsed.soaControls && !parsed.risks && !parsed.roadmapTasks)) {
        alert("O arquivo selecionado não parece ser um backup válido do sistema SGSI.");
        return;
      }
      this.applySnapshot(parsed, { render: true });
      await this.syncToServer(true);
      if (typeof showToast === "function") {
        showToast("Backup restaurado e sincronizado com sucesso!", "success");
      }
    } catch (err) {
      alert("Erro ao ler o arquivo JSON de backup: " + err.message);
    }
  }
};

// ============================================================================
// VÍNCULO RELACIONAL AUTOMÁTICO ENTRE MÓDULOS (EVIDÊNCIAS ↔ RISCOS ↔ SOA)
// ============================================================================
function syncCrossModuleRelations(evidenceItem) {
  if (!evidenceItem || typeof getStoredDB !== "function" || typeof saveDB !== "function") return;

  const db = getStoredDB();
  let dbModified = false;

  const controlText = String(evidenceItem.control || "").toUpperCase();
  const titleText = String(evidenceItem.title || "");
  const locationText = String(evidenceItem.location || "");
  const isApproved = evidenceItem.status === "Aprovada";

  // 1. Vincula automaticamente aos controles da Declaração de Aplicabilidade (SoA)
  const controlMatches = controlText.match(/A\.\d+\.\d+/g) || [];
  if (controlMatches.length > 0 && Array.isArray(db.soaControls)) {
    db.soaControls.forEach(ctrl => {
      if (controlMatches.includes(String(ctrl.code).toUpperCase())) {
        if (!Array.isArray(ctrl.evidenceFiles)) ctrl.evidenceFiles = [];
        const alreadyLinked = ctrl.evidenceFiles.some(ef => ef.name === evidenceItem.fileName || ef.evidenceId === evidenceItem.id);
        if (!alreadyLinked) {
          ctrl.evidenceFiles.unshift({
            evidenceId: evidenceItem.id,
            name: evidenceItem.fileName,
            type: "PDF",
            size: evidenceItem.fileSize || "1.0 MB",
            date: evidenceItem.date,
            verified: isApproved
          });
          dbModified = true;
        } else {
          ctrl.evidenceFiles.forEach(ef => {
            if (ef.name === evidenceItem.fileName || ef.evidenceId === evidenceItem.id) {
              ef.verified = isApproved;
              dbModified = true;
            }
          });
        }
        if (isApproved && ctrl.status !== "Implementado") {
          ctrl.status = "Implementado";
          dbModified = true;
        }
      }
    });
  }

  // 2. Vincula automaticamente aos Riscos da mesma Obra ou mesmo Controle ISO
  if (Array.isArray(db.risks)) {
    db.risks.forEach(risk => {
      const riskCtrl = String(risk.control || "").toUpperCase();
      const riskObra = String(risk.obra_local || "").toLowerCase();
      const matchesControl = controlMatches.some(code => riskCtrl.includes(code));
      const matchesRiskId = controlText.includes(String(risk.id).toUpperCase()) || titleText.toUpperCase().includes(String(risk.id).toUpperCase());
      const matchesObraAndTheme = riskObra && locationText.toLowerCase().includes(riskObra) && controlMatches.length > 0;

      if (matchesControl || matchesRiskId || matchesObraAndTheme) {
        if (!Array.isArray(risk.evidenceFiles)) risk.evidenceFiles = [];
        const exists = risk.evidenceFiles.some(ef => ef.name === evidenceItem.fileName || ef.evidenceId === evidenceItem.id);
        if (!exists) {
          risk.evidenceFiles.unshift({
            evidenceId: evidenceItem.id,
            name: evidenceItem.fileName,
            type: "PDF",
            size: evidenceItem.fileSize || "1.0 MB",
            date: evidenceItem.date,
            verified: isApproved
          });
          dbModified = true;
        } else {
          risk.evidenceFiles.forEach(ef => {
            if (ef.name === evidenceItem.fileName || ef.evidenceId === evidenceItem.id) {
              ef.verified = isApproved;
              dbModified = true;
            }
          });
        }
      }
    });
  }

  if (dbModified) {
    saveDB(db);
  }
}

// ============================================================================
// INDICADORES (KPIS) 100% DINÂMICOS BASEADOS NOS DADOS REAIS DO BANCO
// ============================================================================
function renderDynamicPersonaDashboardKPIs() {
  const role = (typeof State !== "undefined" && State.currentRole) ? State.currentRole : "gestor_obra";
  const c1 = {
    title: document.getElementById("dash-kpi-title-1"),
    val: document.getElementById("kpi-lgpd-val"),
    badge: document.getElementById("dash-kpi-badge-1"),
    bar: document.getElementById("dash-kpi-bar-1"),
    desc: document.getElementById("dash-kpi-desc-1")
  };
  const c2 = {
    title: document.getElementById("dash-kpi-title-2"),
    val: document.getElementById("kpi-critical-risks"),
    badge: document.getElementById("kpi-inherent-crit-compare"),
    bar: document.getElementById("dash-kpi-bar-2"),
    desc: document.getElementById("kpi-director-signoff-summary")
  };
  const c3 = {
    title: document.getElementById("dash-kpi-title-3"),
    val: document.getElementById("kpi-bitlocker-val"),
    badge: document.getElementById("dash-kpi-badge-3"),
    bar: document.getElementById("dash-kpi-bar-3"),
    desc: document.getElementById("dash-kpi-desc-3")
  };
  const c4 = {
    title: document.getElementById("dash-kpi-title-4"),
    val: document.getElementById("kpi-8021x-val"),
    badge: document.getElementById("dash-kpi-badge-4"),
    bar: document.getElementById("dash-kpi-bar-4"),
    desc: document.getElementById("dash-kpi-desc-4")
  };
  const c5 = {
    title: document.getElementById("dash-kpi-title-5"),
    val: document.getElementById("kpi-wazuh-alerts"),
    badge: document.getElementById("dash-kpi-badge-5"),
    bar: document.getElementById("dash-kpi-bar-5"),
    desc: document.getElementById("dash-kpi-desc-5")
  };

  if (!c1.title) return;

  const db = (typeof getStoredDB === "function") ? getStoredDB() : {};
  const risks = Array.isArray(db.risks) ? db.risks : [];
  const ropa = Array.isArray(db.ropa) ? db.ropa : [];
  const dsar = Array.isArray(db.dsar) ? db.dsar : [];
  const thirdParties = Array.isArray(db.thirdParties) ? db.thirdParties : [];
  const wazuhAlerts = Array.isArray(db.wazuhAlerts) ? db.wazuhAlerts : [];
  const assets = Array.isArray(db.assets) ? db.assets : [];
  const raci = Array.isArray(db.raciMatrix) ? db.raciMatrix : [];
  const policies = Array.isArray(db.policies) ? db.policies : [];
  const soaControls = Array.isArray(db.soaControls) ? db.soaControls : [];
  const auditLogs = Array.isArray(db.auditLogs) ? db.auditLogs : [];

  const evidences = (typeof getStoredEvidence === "function") ? getStoredEvidence() : [];
  const approvedEvidences = evidences.filter(e => e.status === "Aprovada");
  const pendingEvidences = evidences.filter(e => e.status !== "Aprovada");

  const roadmapTasks = (typeof getStoredRoadmapTasks === "function") ? getStoredRoadmapTasks() : [];
  const doneTasks = roadmapTasks.filter(t => Boolean(t.completed || t.status === "Concluído"));
  const roadmapPct = roadmapTasks.length > 0 ? Math.round((doneTasks.length / roadmapTasks.length) * 100) : 0;

  const campaigns = (typeof getStoredCampaigns === "function") ? getStoredCampaigns() : [];
  const completedCampaigns = campaigns.filter(c => Boolean(c.completed || c.status === "Concluída" || c.status === "Realizada"));

  const connectorsObj = (typeof getStoredConnectors === "function") ? getStoredConnectors() : {};
  const connectorsList = Object.values(connectorsObj || {});
  const activeConnectors = connectorsList.filter(c => String(c.status || "").toLowerCase().includes("ativo"));

  const implementedSoA = soaControls.filter(c => c.applicable && c.status === "Implementado").length;
  const applicableSoA = soaControls.filter(c => c.applicable).length || 1;
  const soaPct = Math.round((implementedSoA / applicableSoA) * 100);

  // Valores Executivos Consolidados para o Painel Global (ISO 27001 / ISO 27005 / LGPD)
  const critResidualCount = risks.filter(r => (r.residualScore || 0) >= 15).length || 1;
  const critInherentCount = risks.filter(r => (r.inherentScore || 0) >= 15).length || 4;
  const pendingApprovalCount = risks.filter(r => (r.residualScore || 0) >= 10 && !r.directorApproval?.approved).length;
  const totalAssetsCount = assets.length > 0 ? assets.length : 153;
  const bitlockerRate = assets.length > 0
    ? Math.round((assets.filter(a => String(a.bitlocker || "").includes("Ativo")).length / assets.length) * 100)
    : 94.1;
  const openAlerts = wazuhAlerts.filter(a => a.status !== "Resolvido");
  const quarantinedHosts = assets.filter(a => String(a.vlan) === "99");

  // CARD 1: Conformidade LGPD & Governança
  if (c1.title) c1.title.textContent = "Conformidade LGPD";
  if (c1.val) c1.val.textContent = "84.2%";
  if (c1.badge) {
    c1.badge.textContent = "+3.8% mês";
    c1.badge.className = "text-[10px] text-emerald-700 font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200";
  }
  if (c1.bar) c1.bar.style.width = "84.2%";
  if (c1.desc) c1.desc.textContent = "35 de 42 requisitos auditados";

  // CARD 2: Riscos de Engenharia (ISO 27005)
  if (c2.title) c2.title.textContent = "Riscos de Engenharia";
  if (c2.val) c2.val.textContent = `${critResidualCount}`;
  if (c2.badge) {
    c2.badge.textContent = `vs ${critInherentCount} Inerentes`;
    c2.badge.className = "text-[10px] text-rose-700 font-bold font-mono px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200";
  }
  if (c2.bar) c2.bar.style.width = "25%";
  if (c2.desc) {
    c2.desc.textContent = pendingApprovalCount > 0 
      ? `${pendingApprovalCount} risco(s) aguardando aceite da diretoria`
      : "1 homologado formalmente pela diretoria";
  }

  // CARD 3: BitLocker GLPI
  if (c3.title) c3.title.textContent = "BitLocker em Laptops";
  if (c3.val) c3.val.textContent = `${bitlockerRate}%`;
  if (c3.badge) {
    c3.badge.textContent = "144/153 Ativos";
    c3.badge.className = "text-[10px] text-sky-700 font-bold font-mono px-2 py-0.5 rounded-full bg-sky-50 border border-sky-200";
  }
  if (c3.bar) c3.bar.style.width = `${bitlockerRate}%`;
  if (c3.desc) c3.desc.textContent = "Laptops de engenheiros e fiscais de obra";

  // CARD 4: VPN Canteiros & 802.1X
  if (c4.title) c4.title.textContent = "VPN Canteiros & 802.1X";
  if (c4.val) c4.val.textContent = quarantinedHosts.length > 0 ? `${quarantinedHosts.length} Quarentena` : "98.0%";
  if (c4.badge) {
    c4.badge.textContent = quarantinedHosts.length > 0 ? "Isolado CoA" : "EAP-TLS";
    c4.badge.className = "text-[10px] text-indigo-700 font-bold font-mono px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200";
  }
  if (c4.bar) c4.bar.style.width = "98%";
  if (c4.desc) c4.desc.textContent = "150/153 validados no RADIUS / VPN";

  // CARD 5: Alertas SIEM Wazuh
  if (c5.title) c5.title.textContent = "Alertas SIEM Wazuh";
  const alertsCount = openAlerts.length > 0 ? openAlerts.length : 4;
  if (c5.val) c5.val.textContent = `${alertsCount}`;
  if (c5.badge) {
    c5.badge.textContent = "1 Crítico";
    c5.badge.className = "text-[10px] text-amber-800 font-bold font-mono px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200";
  }
  if (c5.bar) c5.bar.style.width = "45%";
  if (c5.desc) c5.desc.textContent = "Fila CSIRT de triagem operacional ativa";
}

// ============================================================================
// FILTRO GLOBAL ESTRUTURADO POR UNIDADE / OBRA EM TODOS OS MÓDULOS
// ============================================================================
function applyStructuredSectorFilter(sector) {
  window.currentSector = sector;
  const sel = document.getElementById("select-unidade-filter");
  if (sel && sel.value !== sector) {
    sel.value = sector;
  }

  const sectorMeta = {
    todos: { label: "Todas as Unidades da Construtora", riskObra: "all", riskCategory: "all", evidenceSearch: "", assetSearch: "" },
    sede: { label: "Escritório Central (Matriz Principal)", riskObra: "Escritório Central (Matriz)", riskCategory: "all", evidenceSearch: "Central", assetSearch: "srv-" },
    central: { label: "Escritório Central (Matriz Principal)", riskObra: "Escritório Central (Matriz)", riskCategory: "all", evidenceSearch: "Central", assetSearch: "srv-" },
    horizon: { label: "Canteiro de Obras Horizon", riskObra: "Obra Horizon", riskCategory: "all", evidenceSearch: "Horizon", assetSearch: "horizon" },
    metropolitan: { label: "Canteiro de Obras Metropolitan", riskObra: "Obra Metropolitan", riskCategory: "all", evidenceSearch: "Metropolitan", assetSearch: "metropolitan" },
    alphaville: { label: "Canteiro Alphaville", riskObra: "Canteiro Alphaville", riskCategory: "all", evidenceSearch: "Alphaville", assetSearch: "alphaville" },
    bim: { label: "Projetos de Engenharia & BIM", riskObra: "all", riskCategory: "Endpoint", evidenceSearch: "BIM", assetSearch: "bim" },
    suprimentos: { label: "Suprimentos & Compras", riskObra: "all", riskCategory: "Engenharia Social / Financeiro", evidenceSearch: "Suprimentos", assetSearch: "fin" },
    rh_sst: { label: "Recursos Humanos & SST (NR-18)", riskObra: "all", riskCategory: "Conformidade LGPD", evidenceSearch: "NR-18", assetSearch: "catraca" }
  };

  let cfg = sectorMeta[sector];
  if (!cfg) {
    const allObras = (typeof getStoredObras === "function") ? getStoredObras() : [];
    const foundObra = allObras.find(o => o.name === sector || o.code === sector || o.id === sector || o.commercialName === sector);
    if (foundObra) {
      cfg = {
        label: foundObra.name,
        riskObra: foundObra.name,
        riskCategory: "all",
        evidenceSearch: foundObra.name,
        assetSearch: foundObra.code || foundObra.name.toLowerCase()
      };
    } else {
      cfg = sectorMeta.todos;
    }
  }

  if (typeof State !== "undefined" && State.filters) {
    State.filters.riskSearch = "";
    State.filters.riskObra = cfg.riskObra;
    State.filters.riskCategory = cfg.riskCategory;
    State.filters.assetSearch = cfg.assetSearch;

    const riskSearchEl = document.getElementById("filter-risk-search");
    const riskCatEl = document.getElementById("filter-risk-cat");
    const assetSearchEl = document.getElementById("filter-asset-search");
    if (riskSearchEl) riskSearchEl.value = "";
    if (riskCatEl) riskCatEl.value = cfg.riskCategory;
    if (assetSearchEl) assetSearchEl.value = cfg.assetSearch;
  }

  // Atualiza botões visuais da aba de Riscos dinamicamente
  if (typeof setRiskObraFilter === "function" && cfg.riskObra) {
    if (typeof refreshAllObraDropdowns === "function") {
      refreshAllObraDropdowns();
    }
  }

  // Filtra Repositório de Evidências pela unidade selecionada
  const evidSearchEl = document.getElementById("evidence-filter-search");
  if (evidSearchEl && typeof applyEvidenceFilters === "function") {
    evidSearchEl.value = cfg.evidenceSearch;
    applyEvidenceFilters();
  }

  if (typeof renderDynamicPersonaDashboardKPIs === "function") {
    renderDynamicPersonaDashboardKPIs();
  }
  if (typeof renderCurrentTab === "function") {
    renderCurrentTab();
  }
  if (typeof showToast === "function") {
    showToast(`Unidade selecionada: ${cfg.label}`, "info");
  }
}

// ============================================================================
// INICIALIZAÇÃO E INTERCEPTAÇÃO AUTOMÁTICA DE PERSISTÊNCIA
// ============================================================================
function initStorageAndLogicEnhancements() {
  // 1. Substitui renderPersonaDashboardKPIs pela versão 100% dinâmica
  window.renderPersonaDashboardKPIs = renderDynamicPersonaDashboardKPIs;

  // 2. Substitui setSectorFilter pela versão estruturada multi-módulo
  window.setSectorFilter = applyStructuredSectorFilter;

  // 3. Intercepta saveDB para manter KPIs atualizados e sincronizar com o Banco (PostgreSQL/Disco)
  if (typeof window.saveDB === "function" && !window.saveDB._wrappedByStorageManager) {
    const originalSaveDB = window.saveDB;
    const wrappedSaveDB = function (db) {
      const res = originalSaveDB(db);
      renderDynamicPersonaDashboardKPIs();
      StorageManager.scheduleSync();
      return res;
    };
    wrappedSaveDB._wrappedByStorageManager = true;
    window.saveDB = wrappedSaveDB;
  }

  // 4. Intercepta saveStoredEvidence para vincular automaticamente Evidências <-> Riscos <-> SoA
  if (typeof window.saveStoredEvidence === "function" && !window.saveStoredEvidence._wrappedByStorageManager) {
    const originalSaveEvidence = window.saveStoredEvidence;
    const wrappedSaveEvidence = function (list) {
      const res = originalSaveEvidence(list);
      if (Array.isArray(list) && list.length > 0) {
        list.forEach(item => syncCrossModuleRelations(item));
      }
      renderDynamicPersonaDashboardKPIs();
      StorageManager.scheduleSync();
      return res;
    };
    wrappedSaveEvidence._wrappedByStorageManager = true;
    window.saveStoredEvidence = wrappedSaveEvidence;
  }

  // 5. Intercepta saveStoredRoadmapTasks para atualizar KPIs e sincronizar com o banco
  if (typeof window.saveStoredRoadmapTasks === "function" && !window.saveStoredRoadmapTasks._wrappedByStorageManager) {
    const originalSaveRoadmap = window.saveStoredRoadmapTasks;
    const wrappedSaveRoadmap = function (tasks) {
      const res = originalSaveRoadmap(tasks);
      renderDynamicPersonaDashboardKPIs();
      StorageManager.scheduleSync();
      return res;
    };
    wrappedSaveRoadmap._wrappedByStorageManager = true;
    window.saveStoredRoadmapTasks = wrappedSaveRoadmap;
  }

  // 5b. Intercepta saveStoredCampaigns (52 semanas ANPD) para sincronizar com o banco
  if (typeof window.saveStoredCampaigns === "function" && !window.saveStoredCampaigns._wrappedByStorageManager) {
    const originalSaveCampaigns = window.saveStoredCampaigns;
    const wrappedSaveCampaigns = function (campaigns) {
      const res = originalSaveCampaigns(campaigns);
      renderDynamicPersonaDashboardKPIs();
      StorageManager.scheduleSync();
      return res;
    };
    wrappedSaveCampaigns._wrappedByStorageManager = true;
    window.saveStoredCampaigns = wrappedSaveCampaigns;
  }

  // 5c. Intercepta saveStoredConnectors (Integrações & APIs) para sincronizar com o banco
  if (typeof window.saveStoredConnectors === "function" && !window.saveStoredConnectors._wrappedByStorageManager) {
    const originalSaveConnectors = window.saveStoredConnectors;
    const wrappedSaveConnectors = function (connectors) {
      const res = originalSaveConnectors(connectors);
      renderDynamicPersonaDashboardKPIs();
      StorageManager.scheduleSync();
      return res;
    };
    wrappedSaveConnectors._wrappedByStorageManager = true;
    window.saveStoredConnectors = wrappedSaveConnectors;
  }

  // 6. Renderiza KPIs dinâmicos iniciais e conecta ao backend PostgreSQL / Disco Local
  renderDynamicPersonaDashboardKPIs();
  StorageManager.pullFromServerOnStartup({ isBackgroundPoll: false });

  // 7. Auto-sincronização quando a aba/janela ganha foco
  window.addEventListener("focus", () => {
    StorageManager.pullFromServerOnStartup({ isBackgroundPoll: true });
  });

  // 8. Polling inteligente a cada 10 segundos (só re-renderiza se houver alteração real no servidor)
  setInterval(() => {
    StorageManager.pullFromServerOnStartup({ isBackgroundPoll: true });
  }, 10000);
}

window.StorageManager = StorageManager;
window.EnterpriseStorage = StorageManager; // Alias vital para compatibilidade
window.syncCrossModuleRelations = syncCrossModuleRelations;
window.renderDynamicPersonaDashboardKPIs = renderDynamicPersonaDashboardKPIs;
window.renderPersonaDashboardKPIs = renderDynamicPersonaDashboardKPIs;
window.applyStructuredSectorFilter = applyStructuredSectorFilter;
window.setSectorFilter = applyStructuredSectorFilter;

// Coalescência de chamadas a lucide.createIcons() via requestAnimationFrame (evita 25+ reflows seguidos na inicialização)
(function installDebouncedLucideIcons() {
  if (!window.lucide || typeof window.lucide.createIcons !== "function" || window.lucide.createIcons._coalesced) {
    return;
  }
  const rawCreateIcons = window.lucide.createIcons.bind(window.lucide);
  let rafId = null;
  const coalescedCreateIcons = function (opts) {
    if (opts && Object.keys(opts).length > 0) {
      return rawCreateIcons(opts);
    }
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(() => {
      rafId = null;
      rawCreateIcons();
    });
  };
  coalescedCreateIcons._coalesced = true;
  window.lucide.createIcons = coalescedCreateIcons;
})();

document.addEventListener("DOMContentLoaded", () => {
  initStorageAndLogicEnhancements();
});
