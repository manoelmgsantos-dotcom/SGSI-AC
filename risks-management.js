/**
 * risks-management.js - Módulo de Gestão de Riscos (ISO 27005 & ISO 27001)
 * Vínculos Cruzados Bidirecionais: Risco ↔ SoA Mitigador ↔ Central & Obras ↔ Usuários RBAC ↔ Evidências
 * Interface 100% em Página Inteira Dedicada (Sem Modais Pop-up)
 * AC Engenharia - SGSI & GRC Enterprise Platform
 */

// Estado interno do módulo de Riscos
const RiskModuleState = {
  currentSubtab: 'list', // 'list' | 'form' | 'heatmap' | 'matrix'
  editingRiskId: null,
  heatmapMode: 'residual', // 'residual' | 'inherent'
};

/**
 * Alterna entre as sub-abas do Módulo de Riscos
 * @param {'list' | 'form' | 'heatmap' | 'matrix'} subtab 
 */
function switchRiskSubtab(subtab) {
  RiskModuleState.currentSubtab = subtab;

  const views = {
    list: document.getElementById('risk-subtab-view-list'),
    form: document.getElementById('risk-subtab-view-form'),
    heatmap: document.getElementById('risk-subtab-view-heatmap'),
    matrix: document.getElementById('risk-subtab-view-matrix'),
  };

  const buttons = {
    list: document.getElementById('subtab-risk-btn-list'),
    form: document.getElementById('subtab-risk-btn-form'),
    heatmap: document.getElementById('subtab-risk-btn-heatmap'),
    matrix: document.getElementById('subtab-risk-btn-matrix'),
  };

  // Oculta todas as visões
  Object.keys(views).forEach(key => {
    if (views[key]) views[key].classList.add('hidden');
  });

  // Reseta classes de todos os botões
  Object.keys(buttons).forEach(key => {
    if (buttons[key]) {
      buttons[key].className = "px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";
    }
  });

  // Ativa visão selecionada
  if (views[subtab]) views[subtab].classList.remove('hidden');

  // Destaca botão selecionado
  if (buttons[subtab]) {
    buttons[subtab].className = "px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#004b93] text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";
  }

  // Executa renderizadores específicos
  if (subtab === 'list') {
    if (typeof renderRisksModule === 'function') renderRisksModule();
  } else if (subtab === 'heatmap') {
    renderRiskHeatmap();
  } else if (subtab === 'matrix') {
    renderRiskTraceabilityMatrix();
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Abre a página dedicada de cadastro de novo risco (100% sem pop-up)
 */
function openCreateRiskPage() {
  RiskModuleState.editingRiskId = null;

  const form = document.getElementById('form-risk-page');
  if (form) form.reset();

  const titleEl = document.getElementById('risk-form-page-title');
  if (titleEl) titleEl.textContent = "Cadastrar Novo Risco no SGSI (ISO 27005)";

  const subtitleEl = document.getElementById('risk-form-page-subtitle');
  if (subtitleEl) subtitleEl.textContent = "Mapeamento estruturado de ativo, ameaça e probabilidade com mitigador obrigatório do catálogo SoA.";

  const badgeEl = document.getElementById('risk-form-mode-badge');
  if (badgeEl) {
    badgeEl.textContent = "Novo Registro";
    badgeEl.className = "px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200";
  }

  // Popula os 3 seletores dinâmicos interligados
  populateRiskSoASelector(null);
  populateRiskObrasSelector(null);
  populateRiskUsersSelector(null);

  // Inicializa scores
  updateRiskPageCalculatedScores();

  // Alterna para a visão do formulário
  switchRiskSubtab('form');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Abre a página dedicada para editar um risco existente (100% sem pop-up)
 * @param {string} riskId 
 */
function openEditRiskPage(riskId) {
  const db = (typeof getStoredDB === 'function') ? getStoredDB() : null;
  if (!db || !db.risks) return;

  const risk = db.risks.find(r => r.id === riskId);
  if (!risk) {
    if (typeof showToast === 'function') showToast("Risco não encontrado.", "warning");
    return;
  }

  RiskModuleState.editingRiskId = riskId;

  const titleEl = document.getElementById('risk-form-page-title');
  if (titleEl) titleEl.textContent = `Editar Risco ${risk.id}`;

  const subtitleEl = document.getElementById('risk-form-page-subtitle');
  if (subtitleEl) subtitleEl.textContent = `Atualização de parâmetros, reavaliação de controles SoA e histórico de integridade forense.`;

  const badgeEl = document.getElementById('risk-form-mode-badge');
  if (badgeEl) {
    badgeEl.textContent = `Editando ${risk.id}`;
    badgeEl.className = "px-2.5 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-[#004b93] border border-blue-200 font-mono";
  }

  // Popula os seletores com o valor atual do risco
  populateRiskSoASelector(risk.soa_control_code || extractSoACodeFromText(risk.control));
  populateRiskObrasSelector(risk.obra_local);
  populateRiskUsersSelector(risk.responsible);

  // Preenche os campos textuais
  const assetInput = document.getElementById('risk-page-asset');
  if (assetInput) assetInput.value = risk.asset || '';

  const catInput = document.getElementById('risk-page-category');
  if (catInput) catInput.value = risk.category || 'Infraestrutura';

  const threatInput = document.getElementById('risk-page-threat');
  if (threatInput) threatInput.value = risk.threat || '';

  const vulnInput = document.getElementById('risk-page-vuln');
  if (vulnInput) vulnInput.value = risk.vuln || '';

  const stratInput = document.getElementById('risk-page-strategy');
  if (stratInput) stratInput.value = risk.strategy || 'Mitigar';

  // Probabilidades e Impactos
  const pInh = document.getElementById('risk-page-inh-prob');
  if (pInh) pInh.value = risk.inherentProb || 4;

  const iInh = document.getElementById('risk-page-inh-imp');
  if (iInh) iInh.value = risk.inherentImp || 4;

  const pRes = document.getElementById('risk-page-res-prob');
  if (pRes) pRes.value = risk.residualProb || 2;

  const iRes = document.getElementById('risk-page-res-imp');
  if (iRes) iRes.value = risk.residualImp || 3;

  updateRiskPageCalculatedScores();

  switchRiskSubtab('form');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Tenta extrair código SoA de uma string livre (ex: "A.8.7 Proteção..." -> "A.8.7")
 */
function extractSoACodeFromText(text) {
  if (!text) return null;
  const match = text.match(/A\.\d+\.\d+/);
  return match ? match[0] : null;
}

/**
 * Popula dinamicamente o Seletor de Controles SoA cadastrados no sistema
 * @param {string|null} selectedCode 
 */
function populateRiskSoASelector(selectedCode) {
  const select = document.getElementById('risk-page-soa-select');
  if (!select) return;

  const db = (typeof getStoredDB === 'function') ? getStoredDB() : null;
  const controls = (db && db.soaControls) ? db.soaControls : [];

  let html = `<option value="">-- Selecione o Controle SoA Mitigador Mandatório --</option>`;

  // Agrupa por tema ISO (Organizacional, Pessoas, Físico, Tecnológico)
  const grouped = {};
  controls.forEach(c => {
    const theme = c.theme || 'Outros';
    if (!grouped[theme]) grouped[theme] = [];
    grouped[theme].push(c);
  });

  Object.keys(grouped).forEach(theme => {
    html += `<optgroup label="Tema ISO 27001: ${theme}">`;
    grouped[theme].forEach(c => {
      const isSelected = selectedCode && (selectedCode === c.code || selectedCode.includes(c.code));
      const statusIcon = c.status === 'Implementado' ? '✅' : (c.status === 'Em Andamento' || c.status === 'Em Avaliação' ? '🟡' : '⭕');
      html += `<option value="${c.code}" ${isSelected ? 'selected' : ''}>
        ${statusIcon} ${c.code} - ${c.title} (${c.status})
      </option>`;
    });
    html += `</optgroup>`;
  });

  select.innerHTML = html;

  // Atualiza painel informativo do controle
  onRiskSoASelectionChange();
}

/**
 * Atualiza o painel informativo sobre o Controle SoA selecionado
 */
function onRiskSoASelectionChange() {
  const select = document.getElementById('risk-page-soa-select');
  const preview = document.getElementById('risk-soa-preview-panel');
  if (!select || !preview) return;

  const code = select.value;
  if (!code) {
    preview.innerHTML = `
      <div class="p-3 bg-slate-50 border border-slate-200 rounded text-slate-500 text-xs italic">
        Selecione um Controle SoA acima para verificar sua aplicabilidade, justificativa e eficácia mitigadora sobre este risco.
      </div>
    `;
    return;
  }

  const db = (typeof getStoredDB === 'function') ? getStoredDB() : null;
  const control = db?.soaControls?.find(c => c.code === code);

  if (!control) {
    preview.innerHTML = `<div class="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs">Controle não localizado no catálogo SoA.</div>`;
    return;
  }

  const isImpl = control.status === 'Implementado';
  const statusBadge = isImpl
    ? `<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
        <i data-lucide="check-circle" class="w-3 h-3"></i> Mitigador Implementado
       </span>`
    : `<span class="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
        <i data-lucide="clock" class="w-3 h-3"></i> Em Implantação / Avaliação
       </span>`;

  preview.innerHTML = `
    <div class="p-3.5 bg-blue-50/50 border border-blue-200 rounded-lg space-y-2 text-xs">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="font-mono font-bold text-[#004b93] text-sm">${control.code}</span>
          <span class="font-semibold text-slate-900">${control.title}</span>
        </div>
        ${statusBadge}
      </div>
      <p class="text-slate-600 text-[11px] leading-relaxed">
        <strong>Justificativa no SGSI:</strong> ${control.justification || "Diretriz corporativa aplicada à construtora."}
      </p>
      <div class="pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
        <span>Tema: <strong>${control.theme}</strong></span>
        <span>Riscos Atualmente Mitigados: <strong>${(control.risksMitigated || []).length}</strong></span>
        ${isImpl ? `
          <button type="button" onclick="suggestResidualReduction()" class="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer transition-colors" title="Aplicar redução de risco sugerida pelo controle já implementado">
            ✨ Aplicar Redução Residual Sugerida
          </button>
        ` : ''}
      </div>
    </div>
  `;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Sugere automaticamente a redução de Probabilidade/Impacto residual caso o controle esteja implementado
 */
function suggestResidualReduction() {
  const pRes = document.getElementById('risk-page-res-prob');
  const iRes = document.getElementById('risk-page-res-imp');
  const strat = document.getElementById('risk-page-strategy');

  if (pRes) pRes.value = "2"; // Raro / Improvável
  if (iRes) iRes.value = "2"; // Baixo
  if (strat) strat.value = "Mitigar";

  updateRiskPageCalculatedScores();

  if (typeof showToast === 'function') {
    showToast("Redução residual calculada e aplicada com base no controle SoA implementado!", "success");
  }
}

/**
 * Popula dinamicamente o Seletor de Obras e Unidades (Central + Canteiros)
 * @param {string|null} selectedObra 
 */
function populateRiskObrasSelector(selectedObra) {
  const select = document.getElementById('risk-page-obra-select');
  if (!select) return;

  const obras = (typeof getStoredObras === 'function') ? getStoredObras() : [];

  let html = `<option value="">-- Selecione o Canteiro de Obra ou Unidade --</option>`;

  // Separa Escritório Central (Matriz) e Obras Adjacentes
  const matriz = obras.find(o => o.hierarchy === 'principal' || o.isHeadquarters) || { name: "Escritório Central (Matriz)" };
  const adjacentes = obras.filter(o => o !== matriz);

  html += `<optgroup label="🏢 Unidade Matriz Principal (Origem Operacional)">`;
  html += `<option value="${matriz.name}" ${selectedObra === matriz.name ? 'selected' : (!selectedObra ? 'selected' : '')}>
    ⭐ ${matriz.name} (Sede Central Corporativa)
  </option>`;
  html += `</optgroup>`;

  if (adjacentes.length > 0) {
    html += `<optgroup label="🏗️ Canteiros de Obras Adjacentes">`;
    adjacentes.forEach(o => {
      const isSel = selectedObra === o.name;
      html += `<option value="${o.name}" ${isSel ? 'selected' : ''}>
        📍 ${o.name} (${o.type || 'Canteiro'})
      </option>`;
    });
    html += `</optgroup>`;
  }

  select.innerHTML = html;
}

/**
 * Popula dinamicamente o Seletor de Usuários Responsáveis (Usuários Reais RBAC)
 * @param {string|null} selectedResponsible 
 */
function populateRiskUsersSelector(selectedResponsible) {
  const select = document.getElementById('risk-page-responsible-select');
  if (!select) return;

  const users = (typeof getStoredUsers === 'function') ? getStoredUsers() : [];

  let html = `<option value="">-- Selecione o Responsável Custodiante --</option>`;

  users.forEach(u => {
    const formatted = `${u.name} (${u.roleName || u.role || 'SecOps'})`;
    const isSel = selectedResponsible && (selectedResponsible.includes(u.name) || selectedResponsible === formatted);
    html += `<option value="${formatted}" ${isSel ? 'selected' : ''}>
      👤 ${u.name} — ${u.roleName || u.department || u.role}
    </option>`;
  });

  select.innerHTML = html;
}

/**
 * Atualiza os cálculos da calculadora 5x5 no formulário de página inteira
 */
function updateRiskPageCalculatedScores() {
  const pInhEl = document.getElementById('risk-page-inh-prob');
  const iInhEl = document.getElementById('risk-page-inh-imp');
  const pResEl = document.getElementById('risk-page-res-prob');
  const iResEl = document.getElementById('risk-page-res-imp');

  const pInh = pInhEl ? parseInt(pInhEl.value, 10) : 4;
  const iInh = iInhEl ? parseInt(iInhEl.value, 10) : 4;
  const pRes = pResEl ? parseInt(pResEl.value, 10) : 2;
  const iRes = iResEl ? parseInt(iResEl.value, 10) : 2;

  const scoreInh = pInh * iInh;
  const scoreRes = pRes * iRes;

  const inhScoreEl = document.getElementById('risk-page-calc-inh-score');
  const inhBadgeEl = document.getElementById('risk-page-calc-inh-badge');
  if (inhScoreEl) inhScoreEl.textContent = scoreInh;
  if (inhBadgeEl) {
    const badge = getRiskScoreBadge(scoreInh);
    inhBadgeEl.textContent = badge.label;
    inhBadgeEl.className = `px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${badge.badgeClass}`;
  }

  const resScoreEl = document.getElementById('risk-page-calc-res-score');
  const resBadgeEl = document.getElementById('risk-page-calc-res-badge');
  const resActionEl = document.getElementById('risk-page-res-action-note');

  if (resScoreEl) resScoreEl.textContent = scoreRes;
  if (resBadgeEl) {
    const badge = getRiskScoreBadge(scoreRes);
    resBadgeEl.textContent = badge.label;
    resBadgeEl.className = `px-2 py-0.5 rounded text-[10px] font-bold uppercase font-mono ${badge.badgeClass}`;
  }

  if (resActionEl) {
    if (scoreRes >= 10) {
      resActionEl.innerHTML = `
        <div class="p-2 bg-amber-50 border border-amber-200 rounded text-amber-900 text-[11px] flex items-center gap-1.5 mt-2">
          <i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-amber-600 shrink-0"></i>
          <span><strong>Exige Aceite da Diretoria C-Level:</strong> Score residual &ge; 10 excede o apetite normal da construtora (ISO 27005).</span>
        </div>
      `;
    } else {
      resActionEl.innerHTML = `
        <div class="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 text-[11px] flex items-center gap-1.5 mt-2">
          <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600 shrink-0"></i>
          <span><strong>Dentro do Apetite Aceitável:</strong> Risco residual satisfatório com os controles mitigadores do SoA.</span>
        </div>
      `;
    }
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

/**
 * Retorna classe e rótulo de severidade para um score 1-25
 */
function getRiskScoreBadge(score) {
  if (score >= 15) {
    return { label: "Crítico", badgeClass: "bg-rose-100 text-rose-800 border border-rose-300" };
  } else if (score >= 10) {
    return { label: "Alto", badgeClass: "bg-orange-100 text-orange-800 border border-orange-300" };
  } else if (score >= 5) {
    return { label: "Médio", badgeClass: "bg-amber-100 text-amber-800 border border-amber-300" };
  } else {
    return { label: "Baixo", badgeClass: "bg-emerald-100 text-emerald-800 border border-emerald-300" };
  }
}

/**
 * Salva o formulário da página inteira (Criação ou Edição)
 * @param {Event} e 
 */
async function handleSaveRiskPage(e) {
  e.preventDefault();

  const db = (typeof getStoredDB === 'function') ? getStoredDB() : null;
  if (!db) {
    alert("Banco de dados local não inicializado.");
    return;
  }

  const pInh = parseInt(document.getElementById('risk-page-inh-prob').value, 10);
  const iInh = parseInt(document.getElementById('risk-page-inh-imp').value, 10);
  const pRes = parseInt(document.getElementById('risk-page-res-prob').value, 10);
  const iRes = parseInt(document.getElementById('risk-page-res-imp').value, 10);

  const soaCode = document.getElementById('risk-page-soa-select').value;
  const controlObj = db.soaControls?.find(c => c.code === soaCode);
  const controlFullText = controlObj ? `${controlObj.code} ${controlObj.title} [${controlObj.status}]` : (soaCode || "A.5.1 Política Geral SGSI");

  const riskData = {
    obra_local: document.getElementById('risk-page-obra-select').value || "Escritório Central (Matriz)",
    asset: document.getElementById('risk-page-asset').value.trim(),
    category: document.getElementById('risk-page-category').value,
    threat: document.getElementById('risk-page-threat').value.trim(),
    vuln: document.getElementById('risk-page-vuln').value.trim(),
    soa_control_code: soaCode,
    control: controlFullText,
    inherentProb: pInh,
    inherentImp: iInh,
    inherentScore: pInh * iInh,
    residualProb: pRes,
    residualImp: iRes,
    residualScore: pRes * iRes,
    strategy: document.getElementById('risk-page-strategy').value,
    responsible: document.getElementById('risk-page-responsible-select').value || "Manoel Martins (Administrador Geral & SecOps)"
  };

  const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

  if (RiskModuleState.editingRiskId) {
    // Modo Edição
    const idx = db.risks.findIndex(r => r.id === RiskModuleState.editingRiskId);
    if (idx !== -1) {
      const existing = db.risks[idx];
      const updated = {
        ...existing,
        ...riskData,
        history: existing.history || []
      };

      updated.history.unshift({
        date: nowStr,
        author: (typeof AuthState !== 'undefined' && AuthState.currentUser?.name) || "Administrador",
        role: "SecOps / Gestor",
        action: "Atualização de Risco & Mitigador SoA",
        comment: `Risco atualizado com controle ${soaCode || 'N/A'} para ${riskData.obra_local}. Residual: ${riskData.residualScore}.`
      });

      db.risks[idx] = updated;

      // Atualiza vínculo no Controle SoA correspondente
      syncRiskWithSoAControls(db, updated.id, soaCode);

      saveDB(db);
      if (typeof StorageManager !== 'undefined' && StorageManager.syncToServer) {
        StorageManager.syncToServer();
      }

      if (typeof ApiService !== 'undefined' && ApiService.logAudit) {
        await ApiService.logAudit(`EDICAO_RISCO: ${updated.id} [${updated.obra_local}] - Residual:${updated.residualScore} Mitigador:${soaCode}`, "RISK_MGMT");
      }

      if (typeof showToast === 'function') {
        showToast(`Risco ${updated.id} atualizado com vínculo direto ao controle ${soaCode}!`, "success");
      }
    }
  } else {
    // Modo Criação
    const newId = "RSK-" + String(db.risks.length + 1).padStart(3, '0');
    const newRisk = {
      id: newId,
      ...riskData,
      directorApproval: {
        approved: false,
        director: null,
        timestamp: null
      },
      history: [
        {
          date: nowStr,
          author: (typeof AuthState !== 'undefined' && AuthState.currentUser?.name) || "Administrador Geral",
          role: "SecOps / Gestor",
          action: "Identificação e Cadastro de Risco com Mitigador SoA",
          comment: `Risco cadastrado para ${riskData.obra_local} com vínculo obrigatório ao controle SoA ${soaCode}.`
        }
      ],
      evidenceFiles: [
        {
          name: `Dossie_Tecnico_${newId}.pdf`,
          type: "PDF",
          size: "1.2 MB",
          date: nowStr.split(' ')[0],
          verified: true
        }
      ]
    };

    db.risks.unshift(newRisk);

    // Atualiza vínculo no Controle SoA correspondente
    syncRiskWithSoAControls(db, newId, soaCode);

    saveDB(db);
    if (typeof StorageManager !== 'undefined' && StorageManager.syncToServer) {
      StorageManager.syncToServer();
    }

    if (typeof ApiService !== 'undefined' && ApiService.logAudit) {
      await ApiService.logAudit(`CADASTRO_RISCO: ${newId} [${newRisk.obra_local}] (${newRisk.asset}) - Mitigador SoA:${soaCode}`, "RISK_MGMT");
    }

    if (typeof showToast === 'function') {
      showToast(`Risco ${newId} cadastrado com sucesso e vinculado ao controle SoA ${soaCode}!`, "success");
    }
  }

  // Volta para a lista principal
  switchRiskSubtab('list');
}

/**
 * Garante o vínculo bidirecional entre Risco e Controles SoA
 */
function syncRiskWithSoAControls(db, riskId, newSoACode) {
  if (!db || !db.soaControls) return;

  db.soaControls.forEach(ctrl => {
    if (!ctrl.risksMitigated) ctrl.risksMitigated = [];
    // Se era o controle antigo e mudou, remove
    if (ctrl.code !== newSoACode && ctrl.risksMitigated.includes(riskId)) {
      ctrl.risksMitigated = ctrl.risksMitigated.filter(id => id !== riskId);
    }
    // Se é o novo controle, adiciona se não estiver presente
    if (ctrl.code === newSoACode && !ctrl.risksMitigated.includes(riskId)) {
      ctrl.risksMitigated.push(riskId);
    }
  });
}

/**
 * Renderiza o Heatmap 5x5 Interativo de Riscos
 */
function renderRiskHeatmap() {
  const container = document.getElementById('risk-heatmap-grid-container');
  if (!container) return;

  const db = (typeof getStoredDB === 'function') ? getStoredDB() : null;
  const risks = db?.risks || [];

  const isResidual = RiskModuleState.heatmapMode === 'residual';

  // Matriz 5x5 vazia
  const grid = Array.from({ length: 5 }, () => Array.from({ length: 5 }, () => []));

  risks.forEach(r => {
    const prob = isResidual ? (r.residualProb || 2) : (r.inherentProb || 4);
    const imp = isResidual ? (r.residualImp || 2) : (r.inherentImp || 4);
    // Probabilidade 5 no topo (linha 0), 1 na base (linha 4)
    const row = 5 - Math.max(1, Math.min(5, prob));
    const col = Math.max(1, Math.min(5, imp)) - 1;
    grid[row][col].push(r);
  });

  const probLabels = ["5 - Quase Certo", "4 - Provável", "3 - Possível", "2 - Improvável", "1 - Raro"];
  const impLabels = ["1 - Mínimo", "2 - Baixo", "3 - Médio", "4 - Alto", "5 - Crítico"];

  let html = `
    <div class="overflow-x-auto pb-4">
      <div class="min-w-[700px]">
        <div class="grid grid-cols-[140px_repeat(5,1fr)] gap-1.5 text-center text-xs">
          <!-- Cabeçalho de Impacto -->
          <div class="font-bold text-slate-500 flex items-center justify-center p-2 bg-slate-100 rounded text-[11px] uppercase">
            Prob. \\ Impacto
          </div>
  `;

  impLabels.forEach(imp => {
    html += `<div class="font-bold text-slate-700 bg-slate-100 p-2 rounded text-[11px] uppercase">${imp}</div>`;
  });

  // Linhas da Matriz
  for (let r = 0; r < 5; r++) {
    html += `<div class="font-bold text-slate-700 bg-slate-100 p-2 rounded flex items-center justify-end text-[11px] uppercase pr-3">${probLabels[r]}</div>`;

    for (let c = 0; c < 5; c++) {
      const score = (5 - r) * (c + 1);
      let cellBg = "bg-emerald-50 border-emerald-200 text-emerald-900";
      if (score >= 15) cellBg = "bg-rose-50 border-rose-200 text-rose-900";
      else if (score >= 10) cellBg = "bg-orange-50 border-orange-200 text-orange-900";
      else if (score >= 5) cellBg = "bg-amber-50 border-amber-200 text-amber-900";

      const itemsInCell = grid[r][c];

      html += `
        <div class="min-h-[78px] p-2 rounded border ${cellBg} flex flex-col justify-between transition-all hover:shadow-xs">
          <div class="flex items-center justify-between text-[10px] font-mono font-bold opacity-70">
            <span>Score ${score}</span>
            <span>(${itemsInCell.length})</span>
          </div>
          <div class="flex flex-wrap gap-1 mt-1 justify-center">
            ${itemsInCell.map(item => `
              <button onclick="openOffcanvas('risk', '${item.id}')" class="px-1.5 py-0.5 rounded bg-white/90 text-slate-800 font-mono font-bold text-[10px] shadow-2xs hover:bg-[#004b93] hover:text-white transition-colors cursor-pointer border border-slate-300" title="${item.id}: ${item.asset} (${item.obra_local})">
                ${item.id}
              </button>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  html += `
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

/**
 * Alterna modo do Heatmap entre Inerente e Residual
 * @param {'residual'|'inherent'} mode 
 */
function toggleHeatmapMode(mode) {
  RiskModuleState.heatmapMode = mode;
  const btnRes = document.getElementById('heatmap-btn-mode-res');
  const btnInh = document.getElementById('heatmap-btn-mode-inh');

  if (mode === 'residual') {
    if (btnRes) btnRes.className = "px-3 py-1 font-semibold rounded bg-[#004b93] text-white shadow-xs text-xs";
    if (btnInh) btnInh.className = "px-3 py-1 font-medium rounded bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 text-xs";
  } else {
    if (btnInh) btnInh.className = "px-3 py-1 font-semibold rounded bg-[#004b93] text-white shadow-xs text-xs";
    if (btnRes) btnRes.className = "px-3 py-1 font-medium rounded bg-white text-slate-700 hover:bg-slate-50 border border-slate-300 text-xs";
  }

  renderRiskHeatmap();
}

/**
 * Renderiza a Matriz de Vínculos Cruzados & Rastreabilidade Executiva
 * Risco ↔ SoA Mitigador ↔ Central & Canteiros ↔ Evidências Homologadas ↔ Responsável
 */
function renderRiskTraceabilityMatrix() {
  const tbody = document.getElementById('risk-matrix-table-body');
  if (!tbody) return;

  const db = (typeof getStoredDB === 'function') ? getStoredDB() : null;
  const risks = db?.risks || [];
  const controls = db?.soaControls || [];
  const evidences = (typeof getStoredEvidence === 'function') ? getStoredEvidence() : [];

  if (risks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="py-12 text-center text-slate-400">Nenhum risco registrado para montagem da matriz de vínculos.</td></tr>`;
    return;
  }

  let rowsHtml = '';

  risks.forEach(r => {
    const soaCode = r.soa_control_code || extractSoACodeFromText(r.control);
    const controlObj = controls.find(c => c.code === soaCode);

    // Evidências relacionadas (pelo controle SoA ou pelo ID do Risco)
    const matchingEvids = evidences.filter(e => {
      const matchCtrl = soaCode && (e.control && e.control.includes(soaCode));
      const matchRisk = e.title && e.title.includes(r.id);
      return matchCtrl || matchRisk;
    });

    const isHighResidual = r.residualScore >= 10;
    const approvalHtml = r.directorApproval?.approved
      ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
           <i data-lucide="check" class="w-3 h-3 text-emerald-600"></i> Homologado C-Level
         </span>`
      : isHighResidual
        ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
             <i data-lucide="clock" class="w-3 h-3 text-amber-600"></i> Requer Aceite
           </span>`
        : `<span class="text-[11px] text-slate-400 font-mono">Apetite Normal</span>`;

    rowsHtml += `
      <tr class="hover:bg-slate-50/80 transition-colors">
        <td class="py-3 px-3 align-top font-mono font-bold text-[#004b93]">
          <button onclick="openOffcanvas('risk', '${r.id}')" class="hover:underline cursor-pointer">${r.id}</button>
          <div class="text-[10px] font-sans font-normal text-slate-500 mt-0.5">${r.category}</div>
        </td>
        <td class="py-3 px-3 align-top">
          <div class="font-semibold text-slate-900 leading-snug">${r.asset}</div>
          <div class="text-[11px] text-slate-500 mt-0.5">${r.threat}</div>
        </td>
        <td class="py-3 px-3 align-top whitespace-nowrap">
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            <i data-lucide="building-2" class="w-3 h-3 text-[#004b93]"></i>
            ${r.obra_local || "Escritório Central (Matriz)"}
          </span>
        </td>
        <td class="py-3 px-3 align-top">
          ${controlObj ? `
            <div class="p-2 rounded bg-blue-50/60 border border-blue-200 text-xs">
              <div class="flex items-center gap-1.5 font-bold text-[#004b93] font-mono">
                <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
                <span>${controlObj.code}</span>
                <span class="text-[10px] font-sans px-1.5 py-0.2 rounded ${controlObj.status === 'Implementado' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${controlObj.status}</span>
              </div>
              <div class="text-[11px] text-slate-800 font-medium mt-1">${controlObj.title}</div>
            </div>
          ` : `
            <span class="text-xs text-slate-400 italic font-mono">${r.control || "Sem controle SoA associado"}</span>
          `}
        </td>
        <td class="py-3 px-3 align-top text-center whitespace-nowrap">
          <div class="inline-flex flex-col items-center">
            <span class="text-[10px] font-mono text-slate-400">Inerente: ${r.inherentScore}</span>
            <span class="text-xs font-mono font-bold text-[#004b93] mt-0.5">Residual: ${r.residualScore}</span>
            ${approvalHtml}
          </div>
        </td>
        <td class="py-3 px-3 align-top">
          ${matchingEvids.length > 0 ? `
            <div class="space-y-1">
              ${matchingEvids.slice(0, 2).map(ev => `
                <div class="text-[11px] text-slate-700 flex items-center gap-1 truncate max-w-[200px]" title="${ev.title}">
                  <i data-lucide="file-check" class="w-3 h-3 text-emerald-600 shrink-0"></i>
                  <span class="truncate">${ev.title}</span>
                </div>
              `).join('')}
              ${matchingEvids.length > 2 ? `<span class="text-[10px] text-slate-400">+${matchingEvids.length - 2} evidências</span>` : ''}
            </div>
          ` : `
            <span class="text-[11px] text-slate-400 italic">Dossiê padrão anexado</span>
          `}
        </td>
        <td class="py-3 px-3 align-top text-right whitespace-nowrap">
          <div class="flex items-center justify-end gap-1.5">
            <button onclick="generateRiskDocument('${r.id}', 'preview')" class="px-2 py-1 text-xs font-semibold rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer" title="Emitir Termo Executivo de Aceite de Risco Residual">
              <i data-lucide="file-signature" class="w-3 h-3"></i>
              <span>Termo</span>
            </button>
            <button onclick="openEditRiskPage('${r.id}')" class="px-2 py-1 text-xs font-semibold rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-colors flex items-center gap-1 cursor-pointer" title="Editar este risco na página inteira">
              <i data-lucide="edit-3" class="w-3 h-3 text-[#004b93]"></i>
              <span>Editar</span>
            </button>
            <button onclick="openOffcanvas('risk', '${r.id}')" class="px-2 py-1 text-xs font-semibold rounded bg-[#004b93] hover:bg-[#003d78] text-white transition-colors flex items-center gap-1 cursor-pointer">
              <i data-lucide="eye" class="w-3 h-3"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

// Redireciona qualquer chamada legada de modal de risco para a página inteira
window.openModalLegacy = window.openModal;
window.openModal = function(modalId) {
  if (modalId === 'modal-new-risk') {
    openCreateRiskPage();
    return;
  }
  if (typeof window.openModalLegacy === 'function') {
    window.openModalLegacy(modalId);
  } else {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('hidden');
  }
};

// Exposições Globais
window.switchRiskSubtab = switchRiskSubtab;
window.openCreateRiskPage = openCreateRiskPage;
window.openEditRiskPage = openEditRiskPage;
window.handleSaveRiskPage = handleSaveRiskPage;
window.onRiskSoASelectionChange = onRiskSoASelectionChange;
window.suggestResidualReduction = suggestResidualReduction;
window.updateRiskPageCalculatedScores = updateRiskPageCalculatedScores;
window.renderRiskHeatmap = renderRiskHeatmap;
window.toggleHeatmapMode = toggleHeatmapMode;
window.renderRiskTraceabilityMatrix = renderRiskTraceabilityMatrix;
