/**
 * obras-management.js - Módulo de Gestão do Escritório Central (Matriz) e Obras Adjacentes
 * AC Engenharia - SGSI & CyberGRC Enterprise Platform
 */

// Catálogo Inicial Padrão Limpo: Apenas o Escritório Central (Matriz Principal) da AC Engenharia
const DEFAULT_OBRAS = [
  {
    id: "MATRIZ-001",
    code: "sede",
    name: "Escritório Central (Matriz)",
    commercialName: "Sede Corporativa Central - AC Engenharia",
    type: "Escritório Central / Matriz Principal",
    hierarchy: "principal", // 'principal' (Escritório Central) vs 'adjacente' (Canteiro de Obra)
    isHeadquarters: true,
    address: "Aracaju/SE",
    residentEngineer: "Manoel Martins (Administrador SGSI)",
    status: "Operacional Contínuo",
    startDate: new Date().toISOString().slice(0, 10),
    forecastCompletion: "Operação Contínua (Matriz)",
    totalWorkers: 0,
    biometricsActive: true,
    wifiVlanSegregated: true,
    usbBlockActive: true,
    serverCabinetLocked: true,
    vpnTunnelActive: true,
    description: "Núcleo operacional e diretivo principal da AC Engenharia. Pronto para interligar os canteiros de obras que forem cadastrados."
  }
];

// Normalização da Hierarquia (Escritório Central sempre é a Matriz Principal #1)
function normalizeObrasHierarchy(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return JSON.parse(JSON.stringify(DEFAULT_OBRAS));
  }

  let foundMatriz = list.find(o => 
    o.hierarchy === "principal" || 
    o.isHeadquarters === true || 
    o.code === "sede" || 
    o.id === "MATRIZ-001" ||
    (o.name && (o.name.toLowerCase().includes("escritório central") || o.name.toLowerCase().includes("sede")))
  );

  if (!foundMatriz) {
    foundMatriz = JSON.parse(JSON.stringify(DEFAULT_OBRAS[0]));
    list.unshift(foundMatriz);
  } else {
    foundMatriz.id = foundMatriz.id || "MATRIZ-001";
    foundMatriz.name = "Escritório Central (Matriz)";
    if (!foundMatriz.commercialName || foundMatriz.commercialName.includes("AC Construtora")) {
      foundMatriz.commercialName = "Sede Corporativa Central - AC Engenharia";
    }
    foundMatriz.type = "Escritório Central / Matriz Principal";
    foundMatriz.hierarchy = "principal";
    foundMatriz.isHeadquarters = true;
    foundMatriz.vpnTunnelActive = true;
  }

  // Normaliza os demais como canteiros adjacentes
  list.forEach(o => {
    if (o !== foundMatriz) {
      if (!o.hierarchy) o.hierarchy = "adjacente";
      o.isHeadquarters = false;
      if (typeof o.vpnTunnelActive === "undefined") o.vpnTunnelActive = true;
    }
  });

  // Garante que o Escritório Central fique sempre em primeiro lugar
  list.sort((a, b) => {
    if (a.hierarchy === "principal" || a.isHeadquarters) return -1;
    if (b.hierarchy === "principal" || b.isHeadquarters) return 1;
    return (a.id || "").localeCompare(b.id || "");
  });

  return list;
}

// Gerenciamento de Persistência no LocalStorage (Chave Limpa AC Engenharia)
function getStoredObras() {
  try {
    const raw = localStorage.getItem("AC_ENGENHARIA_OBRAS_V1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 1) {
        return normalizeObrasHierarchy(parsed);
      }
    }
  } catch (e) {
    console.warn("Falha ao recuperar obras do localStorage:", e);
  }
  const defaults = JSON.parse(JSON.stringify(DEFAULT_OBRAS));
  localStorage.setItem("AC_ENGENHARIA_OBRAS_V1", JSON.stringify(defaults));
  return defaults;
}

function saveStoredObras(obrasList) {
  const normalized = normalizeObrasHierarchy(obrasList);
  localStorage.setItem("AC_ENGENHARIA_OBRAS_V1", JSON.stringify(normalized));
  refreshAllObraDropdowns();
  if (typeof renderObrasManagerTable === "function") renderObrasManagerTable();

  // 1. Sincroniza imediatamente com o Banco de Dados (PostgreSQL / Servidor)
  const sm = window.StorageManager || window.EnterpriseStorage;
  if (sm) {
    if (typeof sm.syncToServer === "function") {
      sm.syncToServer(false);
    } else if (typeof sm.scheduleSync === "function") {
      sm.scheduleSync();
    }
  }

  // 2. Persiste diretamente no endpoint dedicado de obras na API
  try {
    fetch('/api/obras', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ obras: normalized })
    }).catch(err => console.warn("Aviso ao persistir obras via API:", err));
  } catch (_) {}
}

// Filtros e Seleção Múltipla da Tabela de Obras
let obraFilterStatus = "all";
let obraFilterSearch = "";
const selectedObraIds = new Set();

function toggleObraSelection(id, el) {
  if (el && el.checked) {
    selectedObraIds.add(id);
  } else {
    selectedObraIds.delete(id);
  }
  updateObrasBatchUI();
}

function toggleSelectAllObras(masterEl) {
  const obras = getStoredObras().filter(o => o.hierarchy !== "principal" && !o.isHeadquarters && o.id !== 'MATRIZ-001');
  if (masterEl && masterEl.checked) {
    obras.forEach(o => selectedObraIds.add(o.id));
  } else {
    selectedObraIds.clear();
  }
  updateObrasBatchUI();
  renderObrasManagerTable();
}

function clearObrasSelection() {
  selectedObraIds.clear();
  updateObrasBatchUI();
  renderObrasManagerTable();
}

function updateObrasBatchUI() {
  const bar = document.getElementById("obras-batch-bar");
  const countEl = document.getElementById("obras-batch-count");
  const masterCheck = document.getElementById("obras-select-all");
  const selectableObras = getStoredObras().filter(o => o.hierarchy !== "principal" && !o.isHeadquarters && o.id !== 'MATRIZ-001');
  const count = selectedObraIds.size;

  if (countEl) {
    countEl.textContent = `${count} canteiro(s) selecionado(s)`;
  }
  if (bar) {
    if (count > 0) {
      bar.classList.remove("hidden");
    } else {
      bar.classList.add("hidden");
    }
  }
  if (masterCheck) {
    masterCheck.checked = selectableObras.length > 0 && count === selectableObras.length;
    masterCheck.indeterminate = count > 0 && count < selectableObras.length;
  }
}

async function deleteSelectedObras() {
  const idsToDelete = Array.from(selectedObraIds);
  if (idsToDelete.length === 0) return;

  const obras = getStoredObras();
  const targets = obras.filter(o => idsToDelete.includes(o.id) && o.hierarchy !== 'principal' && !o.isHeadquarters && o.id !== 'MATRIZ-001');
  if (targets.length === 0) return;

  const namesList = targets.map(t => `"${t.name}"`).join(", ");
  const ok = await (window.showConfirmDialog ? window.showConfirmDialog({
    title: `Excluir ${targets.length} Canteiro(s) em Lote`,
    message: `Deseja realmente remover os <strong>${targets.length} canteiro(s) selecionados</strong> (${namesList})?`,
    detail: "Os canteiros serão desativados permanentemente do catálogo de obras e túneis VPN da construtora.",
    confirmText: `Sim, Excluir Todos (${targets.length})`,
    cancelText: "Cancelar",
    type: "danger"
  }) : Promise.resolve(confirm(`Deseja realmente remover ${targets.length} canteiro(s)?`)));

  if (!ok) return;

  const targetIds = targets.map(t => t.id);
  const remaining = obras.filter(o => !targetIds.includes(o.id));
  saveStoredObras(remaining);

  // Remove no backend
  for (const tid of targetIds) {
    try {
      await fetch(`/api/obras/${encodeURIComponent(tid)}`, { method: "DELETE" });
    } catch (_) {}
  }

  if (window.StorageManager && typeof window.StorageManager.syncToServer === "function") {
    window.StorageManager.syncToServer(false);
  }

  selectedObraIds.clear();
  updateObrasBatchUI();
  renderObrasManagerTable();
  refreshAllObraDropdowns();

  if (window.showToast) {
    window.showToast(`${targets.length} canteiro(s) removido(s) com sucesso.`, "info");
  }
}

window.toggleObraSelection = toggleObraSelection;
window.toggleSelectAllObras = toggleSelectAllObras;
window.clearObrasSelection = clearObrasSelection;
window.deleteSelectedObras = deleteSelectedObras;

function applyObraFilters() {
  const sInput = document.getElementById("admin-obra-filter-search");
  const stSelect = document.getElementById("admin-obra-filter-status");
  if (sInput) obraFilterSearch = sInput.value.toLowerCase().trim();
  if (stSelect) obraFilterStatus = stSelect.value;
  renderObrasManagerTable();
}

function clearObraFilters() {
  obraFilterStatus = "all";
  obraFilterSearch = "";
  const sInput = document.getElementById("admin-obra-filter-search");
  const stSelect = document.getElementById("admin-obra-filter-status");
  if (sInput) sInput.value = "";
  if (stSelect) stSelect.value = "all";
  renderObrasManagerTable();
}

// Renderização do Painel de Gestão de Obras (Página Dedicada)
function openObrasManagerModal() {
  if (typeof switchTab === 'function') {
    switchTab('obras');
  }
  switchObraSubtab('list');
  renderObrasManagerTable();
}

function renderObrasManagerTable() {
  const tbody = document.getElementById("admin-obras-table-body");
  if (!tbody) return;

  const obras = getStoredObras();

  // KPIs
  const matrizEl = document.getElementById("obras-kpi-matriz");
  const canteirosEl = document.getElementById("obras-kpi-canteiros");
  const ativasEl = document.getElementById("obras-kpi-active");
  const finalEl = document.getElementById("obras-kpi-final");
  const bioEl = document.getElementById("obras-kpi-bio");

  const matrizCount = obras.filter(o => o.hierarchy === "principal" || o.isHeadquarters).length;
  const canteirosCount = obras.filter(o => o.hierarchy !== "principal" && !o.isHeadquarters).length;
  const ativasCount = obras.filter(o => o.status === "Em Andamento" || o.status === "Operacional Contínuo").length;
  const finalCount = obras.filter(o => o.status === "Fase Final / Habite-se").length;
  const bioCount = obras.filter(o => o.biometricsActive).length;

  if (matrizEl) matrizEl.textContent = `${matrizCount} (Matriz Ativa)`;
  if (canteirosEl) canteirosEl.textContent = `${canteirosCount} Canteiros`;
  if (ativasEl) ativasEl.textContent = ativasCount;
  if (finalEl) finalEl.textContent = `${finalCount} em Habite-se`;
  if (bioEl) bioEl.textContent = `${bioCount} Unidades`;

  // Filtragem
  const filtered = obras.filter(o => {
    const matchStatus = obraFilterStatus === "all" || o.status === obraFilterStatus;
    const matchText = !obraFilterSearch ||
      (o.name && o.name.toLowerCase().includes(obraFilterSearch)) ||
      (o.commercialName && o.commercialName.toLowerCase().includes(obraFilterSearch)) ||
      (o.id && o.id.toLowerCase().includes(obraFilterSearch)) ||
      (o.residentEngineer && o.residentEngineer.toLowerCase().includes(obraFilterSearch)) ||
      (o.address && o.address.toLowerCase().includes(obraFilterSearch)) ||
      (o.type && o.type.toLowerCase().includes(obraFilterSearch));
    return matchStatus && matchText;
  });

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-slate-400">
          <div class="max-w-xs mx-auto space-y-1.5">
            <i data-lucide="building" class="w-8 h-8 mx-auto text-slate-300"></i>
            <div class="font-bold text-slate-700 text-xs">Nenhuma unidade encontrada</div>
            <p class="text-[11px] text-slate-400">Ajuste os filtros ou cadastre um novo canteiro adjacente.</p>
          </div>
        </td>
      </tr>
    `;
    if (window.lucide && typeof window.lucide.createIcons === "function") window.lucide.createIcons();
    return;
  }

  const dbData = (typeof getStoredDB === 'function') ? getStoredDB() : null;
  const allRisks = Array.isArray(dbData?.risks) ? dbData.risks : [];

  filtered.forEach(obra => {
    const isMain = obra.hierarchy === "principal" || obra.isHeadquarters;
    const tr = document.createElement("tr");
    tr.className = isMain 
      ? "bg-amber-50/30 hover:bg-amber-50/50 transition-colors border-b-2 border-amber-200/60 text-xs"
      : "hover:bg-blue-50/30 transition-colors border-b border-slate-100 text-xs";

    let statusBadge = "";
    if (obra.status === "Em Andamento" || obra.status === "Operacional Contínuo") {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ${obra.status}
      </span>`;
    } else if (obra.status === "Fase Final / Habite-se") {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Habite-se / Expurgo
      </span>`;
    } else if (obra.status === "Concluído / Entregue") {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
        Concluído
      </span>`;
    } else {
      statusBadge = `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
        Planejamento
      </span>`;
    }

    const secBadges = [];
    if (isMain) {
      secBadges.push(`<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-bold">Data Center & Sienge ERP</span>`);
      secBadges.push(`<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 text-[9px] font-mono">Hub VPN Central (IPSec)</span>`);
      secBadges.push(`<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-900 border border-purple-300 text-[9px] font-mono">SIEM Wazuh Matriz</span>`);
    } else {
      secBadges.push(`<span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-mono">Túnel VPN Matriz</span>`);
      if (obra.biometricsActive) secBadges.push(`<span class="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[9px] font-mono">Biometria Facial</span>`);
      if (obra.wifiVlanSegregated) secBadges.push(`<span class="px-1.5 py-0.5 rounded bg-blue-50 text-[#004b93] border border-blue-200 text-[9px] font-mono">VLAN 30 Isolada</span>`);
      if (obra.usbBlockActive) secBadges.push(`<span class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[9px] font-mono">USB Block</span>`);
    }

    const hierarchyBadge = isMain
      ? `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#0f2942] text-amber-300 border border-amber-400/40 shadow-2xs uppercase tracking-wide">
          <i data-lucide="crown" class="w-3 h-3 text-amber-400"></i> Matriz Principal
        </span>`
      : `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
          <i data-lucide="git-branch" class="w-3 h-3 text-slate-500"></i> Canteiro Adjacente
        </span>`;

    const linkedRisks = allRisks.filter(r => r.obra_local === obra.name || (isMain && (r.obra_local === 'Sede Corporativa' || (r.obra_local && (r.obra_local.includes('Central') || r.obra_local.includes('Matriz'))))));

    const isSelected = selectedObraIds.has(obra.id);
    tr.innerHTML = `
      <td class="py-3 px-3 text-center">
        ${isMain ? `
          <input type="checkbox" disabled class="opacity-25 cursor-not-allowed" title="Matriz Principal protegida" />
        ` : `
          <input type="checkbox" class="obra-row-checkbox rounded border-slate-300 text-[#004b93] focus:ring-[#004b93] cursor-pointer" data-id="${obra.id}" ${isSelected ? 'checked' : ''} onchange="toggleObraSelection('${obra.id}', this)" />
        `}
      </td>
      <td class="py-3 px-3 font-mono font-bold text-slate-800 text-[11px] whitespace-nowrap">
        ${obra.id}
      </td>
      <td class="py-3 px-3 max-w-[260px]">
        <div class="flex items-center gap-2 flex-wrap mb-1">
          ${hierarchyBadge}
        </div>
        <div class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
          <i data-lucide="${isMain ? 'building' : 'building-2'}" class="w-3.5 h-3.5 ${isMain ? 'text-amber-600' : 'text-slate-500'} shrink-0"></i>
          <span class="truncate" title="${obra.name}">${obra.name}</span>
        </div>
        <div class="text-[11px] text-slate-600 truncate mt-0.5 font-medium" title="${obra.commercialName || ''}">${obra.commercialName || obra.type}</div>
        <div class="text-[10px] text-slate-400 truncate mt-0.5">${obra.address || 'Endereço não informado'}</div>
        <div class="mt-1.5 flex items-center gap-1.5 flex-wrap">
          <button type="button" onclick="switchTab('risks'); if(typeof setRiskObraFilter==='function') setRiskObraFilter('${obra.name}');" class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${linkedRisks.length > 0 ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100' : 'bg-slate-50 text-slate-500 border border-slate-200'} transition-colors cursor-pointer" title="Ver ${linkedRisks.length} risco(s) mapeados para esta unidade">
            <i data-lucide="shield-alert" class="w-3 h-3 text-amber-600"></i>
            <span>${linkedRisks.length} Risco(s)</span>
          </button>
        </div>
      </td>
      <td class="py-3 px-3 text-slate-700 text-xs">
        <span class="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">${obra.type}</span>
        <div class="text-[11px] text-slate-600 mt-1 font-medium truncate" title="${obra.residentEngineer || ''}">${obra.residentEngineer || 'Não atribuído'}</div>
      </td>
      <td class="py-3 px-3 whitespace-nowrap">
        <div>${statusBadge}</div>
        <div class="text-[10px] text-slate-400 font-mono mt-1">Previsão: ${obra.forecastCompletion || '-'}</div>
      </td>
      <td class="py-3 px-3">
        <div class="flex flex-wrap gap-1 max-w-[220px]">
          ${secBadges.join("")}
        </div>
        <div class="text-[10px] text-slate-400 mt-1">${obra.totalWorkers ? `${obra.totalWorkers} colaboradores/operários` : ''}</div>
      </td>
      <td class="py-3 px-3 text-right whitespace-nowrap">
        <div class="flex items-center justify-end gap-1.5">
          <button type="button" onclick="filterByThisObra('${obra.name}')" class="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#004b93] transition-colors cursor-pointer" title="Ver Riscos e Dados desta Unidade">
            <i data-lucide="eye" class="w-3.5 h-3.5"></i>
          </button>
          <button type="button" onclick="openEditObraPage('${obra.id}')" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer" title="Editar Informações">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          ${isMain ? `
            <button type="button" class="p-1.5 rounded-lg bg-slate-100 text-slate-400 cursor-not-allowed opacity-50" title="A Unidade Matriz Principal não pode ser removida (Origem de todas as operações)">
              <i data-lucide="lock" class="w-3.5 h-3.5"></i>
            </button>
          ` : `
            <button type="button" onclick="deleteObra('${obra.id}')" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer" title="Remover Obra do Cadastro">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          `}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateObrasBatchUI();

  if (window.lucide && typeof window.lucide.createIcons === "function") {
    window.lucide.createIcons();
  }
}

// ============================================================================
// NAVEGAÇÃO ENTRE SUBTABS DA PÁGINA DE OBRAS (SEM POP-UPS)
// ============================================================================
function switchObraSubtab(tab) {
  const viewList = document.getElementById("obras-subtab-view-list");
  const viewForm = document.getElementById("obras-subtab-view-form");
  const btnList = document.getElementById("subtab-obra-btn-list");
  const btnForm = document.getElementById("subtab-obra-btn-form");

  if (tab === 'form') {
    if (viewList) viewList.classList.add("hidden");
    if (viewForm) viewForm.classList.remove("hidden");
    if (btnList) {
      btnList.className = "px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";
    }
    if (btnForm) {
      btnForm.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#004b93] text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";
    }
  } else {
    if (viewList) viewList.classList.remove("hidden");
    if (viewForm) viewForm.classList.add("hidden");
    if (btnList) {
      btnList.className = "px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#004b93] text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";
    }
    if (btnForm) {
      btnForm.className = "px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";
    }
  }
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// Abrir Cadastro de Obra na Página Dedicada
let currentEditingObraId = null;

function openCreateObraPage() {
  currentEditingObraId = null;
  const form = document.getElementById("form-admin-obra-page");
  if (form) form.reset();

  const titleEl = document.getElementById("obras-form-page-title");
  if (titleEl) {
    titleEl.innerHTML = `<i data-lucide="building-2" class="w-4 h-4 text-[#004b93]"></i><span>Cadastrar Novo Canteiro de Obras Adjacente</span>`;
  }

  const obras = getStoredObras();
  const nextNum = obras.length + 1;
  const autoId = `OBRA-${String(nextNum).padStart(3, "0")}`;

  const idInput = document.getElementById("obra-page-input-id");
  if (idInput) idInput.value = autoId;

  const hierarchyInput = document.getElementById("obra-page-input-hierarchy");
  if (hierarchyInput) hierarchyInput.value = "adjacente";

  const statusInput = document.getElementById("obra-page-input-status");
  if (statusInput) statusInput.value = "Em Andamento";

  const typeInput = document.getElementById("obra-page-input-type");
  if (typeInput) typeInput.value = "Residencial Vertical";

  const vpnInput = document.getElementById("obra-page-input-vpn");
  if (vpnInput) vpnInput.checked = true;

  const bioInput = document.getElementById("obra-page-input-biometrics");
  if (bioInput) bioInput.checked = true;

  const vlanInput = document.getElementById("obra-page-input-vlan");
  if (vlanInput) vlanInput.checked = true;

  const usbInput = document.getElementById("obra-page-input-usb");
  if (usbInput) usbInput.checked = true;

  switchObraSubtab('form');
}

// Abrir Edição de Obra na Página Dedicada
function openEditObraPage(obraId) {
  const obras = getStoredObras();
  const obra = obras.find(o => o.id === obraId);
  if (!obra) return;

  currentEditingObraId = obraId;
  const isMain = obra.hierarchy === "principal" || obra.isHeadquarters;

  const titleEl = document.getElementById("obras-form-page-title");
  if (titleEl) {
    titleEl.innerHTML = isMain
      ? `<i data-lucide="crown" class="w-4 h-4 text-amber-500"></i><span>Editar Unidade Principal: ${obra.name}</span>`
      : `<i data-lucide="building-2" class="w-4 h-4 text-[#004b93]"></i><span>Editar Canteiro Adjacente: ${obra.name}</span>`;
  }

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  };

  setVal("obra-page-input-id", obra.id);
  setVal("obra-page-input-name", obra.name);
  setVal("obra-page-input-commercial", obra.commercialName);
  setVal("obra-page-input-type", obra.type || (isMain ? "Escritório Central / Matriz Principal" : "Residencial Vertical"));
  setVal("obra-page-input-hierarchy", obra.hierarchy || (isMain ? "principal" : "adjacente"));
  setVal("obra-page-input-address", obra.address);
  setVal("obra-page-input-engineer", obra.residentEngineer);
  setVal("obra-page-input-status", obra.status || "Em Andamento");
  setVal("obra-page-input-workers", obra.totalWorkers || "");
  setVal("obra-page-input-start", obra.startDate);
  setVal("obra-page-input-completion", obra.forecastCompletion);
  setVal("obra-page-input-desc", obra.description);

  const vpnEl = document.getElementById("obra-page-input-vpn");
  if (vpnEl) vpnEl.checked = Boolean(obra.vpnTunnelActive !== false);

  const bioEl = document.getElementById("obra-page-input-biometrics");
  if (bioEl) bioEl.checked = Boolean(obra.biometricsActive);

  const vlanEl = document.getElementById("obra-page-input-vlan");
  if (vlanEl) vlanEl.checked = Boolean(obra.wifiVlanSegregated);

  const usbEl = document.getElementById("obra-page-input-usb");
  if (usbEl) usbEl.checked = Boolean(obra.usbBlockActive);

  switchObraSubtab('form');
}

// Submissão do Formulário de Obra na Página Dedicada
async function handleSaveObraPage(e) {
  if (e && e.preventDefault) e.preventDefault();

  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const id = getVal("obra-page-input-id");
  const name = getVal("obra-page-input-name");
  const commercialName = getVal("obra-page-input-commercial");
  const type = document.getElementById("obra-page-input-type") ? document.getElementById("obra-page-input-type").value : "Residencial Vertical";
  const hierarchy = document.getElementById("obra-page-input-hierarchy") ? document.getElementById("obra-page-input-hierarchy").value : "adjacente";
  const isHeadquarters = hierarchy === "principal";
  const address = getVal("obra-page-input-address");
  const residentEngineer = getVal("obra-page-input-engineer");
  const status = document.getElementById("obra-page-input-status") ? document.getElementById("obra-page-input-status").value : "Em Andamento";
  const workersEl = document.getElementById("obra-page-input-workers");
  const totalWorkers = workersEl ? parseInt(workersEl.value, 10) || 0 : 0;
  const startDate = getVal("obra-page-input-start");
  const forecastCompletion = getVal("obra-page-input-completion");
  const description = getVal("obra-page-input-desc");

  const vpnInput = document.getElementById("obra-page-input-vpn");
  const vpnTunnelActive = vpnInput ? vpnInput.checked : true;

  const bioInput = document.getElementById("obra-page-input-biometrics");
  const biometricsActive = bioInput ? bioInput.checked : false;

  const vlanInput = document.getElementById("obra-page-input-vlan");
  const wifiVlanSegregated = vlanInput ? vlanInput.checked : false;

  const usbInput = document.getElementById("obra-page-input-usb");
  const usbBlockActive = usbInput ? usbInput.checked : false;

  if (!name) {
    if (window.showToast) window.showToast("Informe o nome da unidade / canteiro.", "warning");
    else alert("Informe o nome da unidade / canteiro.");
    return;
  }

  const code = name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^obra_/, "").replace(/^canteiro_/, "").slice(0, 20) || "obra";
  const obras = getStoredObras();

  if (currentEditingObraId) {
    // Modo Edição
    const idx = obras.findIndex(o => o.id === currentEditingObraId);
    if (idx !== -1) {
      obras[idx] = {
        ...obras[idx],
        name,
        commercialName,
        type,
        hierarchy,
        isHeadquarters,
        address,
        residentEngineer,
        status,
        totalWorkers,
        startDate,
        forecastCompletion,
        description,
        vpnTunnelActive,
        biometricsActive,
        wifiVlanSegregated,
        usbBlockActive
      };
      saveStoredObras(obras);

      if (window.ApiService && typeof window.ApiService.logAudit === "function") {
        await window.ApiService.logAudit(`EDICAO_UNIDADE: ${name} [${isHeadquarters ? 'MATRIZ PRINCIPAL' : 'CANTEIRO ADJACENTE'}] atualizado com status "${status}".`, "GOVERNANCE_RACI");
      }

      if (window.showToast) window.showToast(`Unidade "${name}" atualizada com sucesso!`, "success");
    }
  } else {
    // Modo Criação
    if (obras.some(o => o.name.toLowerCase() === name.toLowerCase())) {
      if (window.showToast) window.showToast(`Já existe uma unidade cadastrada com o nome "${name}".`, "warning");
      else alert(`Já existe uma unidade cadastrada com o nome "${name}".`);
      return;
    }

    const newObra = {
      id: id || `OBRA-${String(obras.length + 1).padStart(3, "0")}`,
      code,
      name,
      commercialName,
      type,
      hierarchy,
      isHeadquarters,
      address,
      residentEngineer,
      status,
      totalWorkers,
      startDate,
      forecastCompletion,
      description,
      vpnTunnelActive,
      biometricsActive,
      wifiVlanSegregated,
      usbBlockActive
    };

    obras.push(newObra);
    saveStoredObras(obras);

    if (window.ApiService && typeof window.ApiService.logAudit === "function") {
      await window.ApiService.logAudit(`CADASTRO_UNIDADE: Novo canteiro adjacente "${name}" (${type}) registrado sob supervisão de ${residentEngineer || 'Engenharia'}.`, "GOVERNANCE_RACI");
    }

    if (window.showToast) window.showToast(`Novo canteiro "${name}" registrado no SGSI!`, "success");
  }

  switchObraSubtab('list');
  renderObrasManagerTable();
  refreshAllObraDropdowns();
}

// Excluir Obra com Validação de Integridade (Matriz protegida)
async function deleteObra(obraId) {
  const obras = getStoredObras();
  const obra = obras.find(o => o.id === obraId);
  if (!obra) return;

  // Proteção do Escritório Central (Matriz Principal)
  if (obra.hierarchy === 'principal' || obra.isHeadquarters || obra.id === 'MATRIZ-001') {
    if (window.showToast) {
      window.showToast("O Escritório Central é a Matriz Principal de onde partem todas as operações e não pode ser removido.", "warning");
    } else {
      alert("O Escritório Central é a Matriz Principal de onde partem todas as operações e não pode ser removido.");
    }
    return;
  }

  // Verifica se há riscos ou evidências associadas a esta obra
  let linkedRisksCount = 0;
  if (window.getStoredDB && typeof window.getStoredDB === "function") {
    const db = window.getStoredDB();
    if (Array.isArray(db.risks)) {
      linkedRisksCount = db.risks.filter(r => r.obra_local === obra.name).length;
    }
  }

  let linkedEvidenceCount = 0;
  if (window.getStoredEvidence && typeof window.getStoredEvidence === "function") {
    const evids = window.getStoredEvidence();
    if (Array.isArray(evids)) {
      linkedEvidenceCount = evids.filter(e => e.location === obra.name || (e.location && e.location.includes(obra.name))).length;
    }
  }

  const detailMsg = (linkedRisksCount > 0 || linkedEvidenceCount > 0)
    ? `Atenção: Existem ${linkedRisksCount} risco(s) e ${linkedEvidenceCount} evidência(s) vinculadas a este canteiro. Os registros permanecerão no sistema como histórico forense da Matriz.`
    : "A unidade será removida do catálogo ativo de canteiros e túneis VPN.";

  const ok = await (window.showConfirmDialog ? window.showConfirmDialog({
    title: "Remover Canteiro de Obras",
    message: `Deseja realmente remover o canteiro adjacente <span class="font-bold text-slate-900">"${obra.name}"</span>?`,
    detail: detailMsg,
    confirmText: "Sim, Remover Canteiro",
    cancelText: "Cancelar",
    type: "danger"
  }) : Promise.resolve(confirm(`Deseja realmente remover o canteiro "${obra.name}"?`)));

  if (!ok) return;

  const updatedObras = obras.filter(o => o.id !== obraId);
  selectedObraIds.delete(obraId);
  saveStoredObras(updatedObras);

  // Exclui permanentemente no backend e PostgreSQL
  try {
    await fetch(`/api/obras/${encodeURIComponent(obraId)}`, { method: "DELETE" });
  } catch (err) {
    console.warn("Aviso ao excluir obra via API:", err);
  }

  if (window.StorageManager && typeof window.StorageManager.syncToServer === "function") {
    window.StorageManager.syncToServer(false);
  }

  if (window.ApiService && typeof window.ApiService.logAudit === "function") {
    await window.ApiService.logAudit(`EXCLUSAO_UNIDADE: Canteiro ${obra.id} (${obra.name}) removido do catálogo de unidades ativas.`, "GOVERNANCE_RACI");
  }

  if (window.showToast) {
    window.showToast(`Canteiro "${obra.name}" removido com sucesso.`, "info");
  }

  updateObrasBatchUI();
  renderObrasManagerTable();
  refreshAllObraDropdowns();
}

// Filtra a visão geral do sistema pela obra selecionada
function filterByThisObra(obraName) {
  if (typeof switchTab === 'function') {
    switchTab('risks');
  }
  if (window.setRiskObraFilter && typeof window.setRiskObraFilter === "function") {
    window.setRiskObraFilter(obraName);
  } else if (window.setSectorFilter && typeof window.setSectorFilter === "function") {
    window.setSectorFilter(obraName);
  }
}

// ============================================================================
// ATUALIZAÇÃO DINÂMICA DE TODOS OS SELECTS E DROPDOWNS DO SISTEMA
// ============================================================================
function refreshAllObraDropdowns() {
  const obras = getStoredObras();
  const matriz = obras.find(o => o.hierarchy === "principal" || o.isHeadquarters) || obras[0];
  const adjacentes = obras.filter(o => o !== matriz);

  // 1. Dropdown do Top Header (#select-unidade-filter)
  const headerSelect = document.getElementById("select-unidade-filter");
  if (headerSelect) {
    const currentVal = headerSelect.value;
    headerSelect.innerHTML = `
      <option value="todos">🌐 Todas as Unidades (Visão Consolidada)</option>
      <optgroup label="🏢 Unidade Principal / Hub Central">
        <option value="${matriz.name}">⭐ ${matriz.name} (Data Center & Governança)</option>
      </optgroup>
      <optgroup label="🏗️ Canteiros & Obras Adjacentes (Campo)">
        ${adjacentes.map(o => `<option value="${o.name}">📍 ${o.name} (${o.commercialName || o.type})</option>`).join("")}
      </optgroup>
    `;
    if ([...headerSelect.options].some(opt => opt.value === currentVal)) {
      headerSelect.value = currentVal;
    }
  }

  // 2. Dropdown do Modal de Nova Evidência (#evidence-input-location)
  const evidenceLocationSelect = document.getElementById("evidence-input-location");
  if (evidenceLocationSelect) {
    const curEvidLoc = evidenceLocationSelect.value;
    evidenceLocationSelect.innerHTML = `
      <optgroup label="🏢 Unidade Principal">
        <option value="${matriz.name}">${matriz.name}</option>
        <option value="Sienge Cloud & AWS">Sienge Cloud & AWS (Central)</option>
        <option value="Data Center & Wazuh Matriz">Data Center & Wazuh Matriz</option>
      </optgroup>
      <optgroup label="🏗️ Canteiros & Obras Adjacentes">
        ${adjacentes.map(o => `<option value="${o.name}">${o.name}</option>`).join("")}
      </optgroup>
      <optgroup label="🌐 Abrangência Geral">
        <option value="Todas as Unidades">Todas as Unidades</option>
        <option value="CV CRM & Estandes">CV CRM & Estandes</option>
      </optgroup>
    `;
    if ([...evidenceLocationSelect.options].some(opt => opt.value === curEvidLoc)) {
      evidenceLocationSelect.value = curEvidLoc;
    }
  }

  // 3. Dropdown do Modal de Novo RoPA (#ropa-obra)
  const ropaObraSelect = document.getElementById("ropa-obra");
  if (ropaObraSelect) {
    const curRopaObra = ropaObraSelect.value;
    ropaObraSelect.innerHTML = `
      <option value="Global / Todas as Unidades">Global / Todas as Unidades</option>
      <option value="${matriz.name}">⭐ ${matriz.name} (Escritório Central / Matriz)</option>
      <optgroup label="Canteiros Adjacentes">
        ${adjacentes.map(o => `<option value="${o.name}">${o.name}</option>`).join("")}
      </optgroup>
    `;
    if ([...ropaObraSelect.options].some(opt => opt.value === curRopaObra)) {
      ropaObraSelect.value = curRopaObra;
    }
  }

  // 4. Dropdown de Lotação de Usuários (#admin-user-page-location)
  const userPageLocationSelect = document.getElementById("admin-user-page-location");
  if (userPageLocationSelect) {
    const curVal = userPageLocationSelect.value;
    userPageLocationSelect.innerHTML = `
      <optgroup label="🏢 Escritório Central (Matriz Principal - Origem das Operações)">
        <option value="${matriz.name}">${matriz.name}</option>
        <option value="${matriz.name} - Data Center & TI">${matriz.name} - Data Center & TI</option>
        <option value="${matriz.name} - Diretoria Executiva">${matriz.name} - Diretoria Executiva</option>
        <option value="${matriz.name} - Jurídico / DPO">${matriz.name} - Jurídico / DPO</option>
        <option value="${matriz.name} - Engenharia BIM">${matriz.name} - Engenharia BIM</option>
      </optgroup>
      <optgroup label="🏗️ Canteiros & Obras Adjacentes (Campo)">
        ${adjacentes.map(o => `<option value="${o.name}">📍 ${o.name}</option>`).join("")}
      </optgroup>
      <optgroup label="🌐 Abrangência Geral / Externa">
        <option value="Todas as Unidades">Todas as Unidades (Matriz e Canteiros)</option>
        <option value="Auditoria Externa Independente">Auditoria Externa Independente</option>
      </optgroup>
    `;
    if ([...userPageLocationSelect.options].some(opt => opt.value === curVal)) {
      userPageLocationSelect.value = curVal;
    }
  }

  // 5. Botões de filtro rápido na aba de Gestão de Riscos (#risk-obra-filter-btns)
  const riskBtnsContainer = document.getElementById("risk-obra-filter-btns");
  if (riskBtnsContainer) {
    const curActive = (typeof State !== "undefined" && State.filters && State.filters.riskObra)
      ? State.filters.riskObra
      : "all";

    let btnsHtml = `
      <button onclick="setRiskObraFilter('all')" id="btn-risk-obra-all" class="px-2.5 py-1 rounded-md text-xs font-semibold ${curActive === 'all' ? 'bg-[#004b93] text-white shadow-2xs' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'} transition-colors cursor-pointer">
        Todas as Unidades
      </button>
      <button onclick="setRiskObraFilter('${matriz.name}')" id="btn-risk-obra-matriz" class="px-2.5 py-1 rounded-md text-xs font-semibold ${curActive === matriz.name ? 'bg-[#0f2942] text-amber-300 shadow-2xs border border-amber-400/40' : 'bg-amber-50 text-slate-800 border border-amber-300/80 hover:bg-amber-100/60'} transition-colors cursor-pointer flex items-center gap-1">
        ⭐ ${matriz.name} (Principal)
      </button>
    `;

    adjacentes.forEach((o, idx) => {
      const isSel = curActive === o.name;
      btnsHtml += `
        <button onclick="setRiskObraFilter('${o.name}')" id="btn-risk-obra-dyn-${idx}" class="px-2.5 py-1 rounded-md text-xs ${isSel ? 'font-semibold bg-[#004b93] text-white shadow-2xs' : 'font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'} transition-colors cursor-pointer">
          📍 ${o.name}
        </button>
      `;
    });

    riskBtnsContainer.innerHTML = btnsHtml;
  }
}

// Exposição Global
window.DEFAULT_OBRAS = DEFAULT_OBRAS;
window.getStoredObras = getStoredObras;
window.saveStoredObras = saveStoredObras;
window.normalizeObrasHierarchy = normalizeObrasHierarchy;
window.switchObraSubtab = switchObraSubtab;
window.openCreateObraPage = openCreateObraPage;
window.openEditObraPage = openEditObraPage;
window.handleSaveObraPage = handleSaveObraPage;
window.openObrasManagerModal = openObrasManagerModal;
window.deleteObra = deleteObra;
window.filterByThisObra = filterByThisObra;
window.applyObraFilters = applyObraFilters;
window.clearObraFilters = clearObraFilters;
window.refreshAllObraDropdowns = refreshAllObraDropdowns;

// Inicialização automática
document.addEventListener("DOMContentLoaded", () => {
  refreshAllObraDropdowns();
});
