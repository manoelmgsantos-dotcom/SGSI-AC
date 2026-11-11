/**
 * auth-and-users.js - Módulo de Autenticação, Perfis, RBAC, Sanitização XSS e Gestão de Usuários
 * AC Engenharia - SGSI & GRC Enterprise Platform (Hardened Security Edition)
 */

// ============================================================================
// 0. UTILITÁRIOS GLOBAIS DE SEGURANÇA CLIENT-SIDE (ANTI-XSS, TOKEN & SESSÃO)
// ============================================================================

function escapeHtml(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeClientUser(u) {
  if (!u || typeof u !== "object") return u;
  const copy = { ...u };
  delete copy.password;
  delete copy.password_hash;
  delete copy.rawPassword;
  return copy;
}

window.escapeHtml = escapeHtml;
window.sanitizeClientUser = sanitizeClientUser;

// Interceptor Global de Fetch para anexar Token Criptográfico Assinado (HMAC-SHA256) e Cookies HttpOnly
(function installSecureFetchInterceptor() {
  if (window.__cyberGrcSecureFetchInstalled || typeof window.fetch !== "function") return;
  window.__cyberGrcSecureFetchInstalled = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = function (input, init = {}) {
    try {
      const urlStr = typeof input === "string" ? input : (input && input.url ? input.url : "");
      const isInternalApi = urlStr.startsWith("/api/") || urlStr.includes(`${window.location.origin}/api/`);

      if (isInternalApi) {
        const headers = new Headers(init.headers || {});
        const token = sessionStorage.getItem("AC_AUTH_JWT_TOKEN_V1");
        if (token && !headers.has("X-CyberGRC-Token")) {
          headers.set("X-CyberGRC-Token", token);
        }
        init = {
          ...init,
          credentials: init.credentials || "same-origin",
          headers
        };
      }
    } catch (_) {}
    return originalFetch(input, init);
  };
})();

// Catálogo Inicial Padrão de Usuários da AC Engenharia (Sem senhas em texto plano no cliente)
const DEFAULT_AC_USERS = [
  {
    id: "usr-admin",
    name: "Manoel Martins",
    email: "manoelmgsantos@acengenhariase.com.br",
    role: "secops",
    roleName: "Administrador Geral & SecOps SGSI",
    department: "Diretoria de Tecnologia & Governança SGSI",
    location: "Escritório Central (Matriz)",
    avatar: "MM",
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
  }
];

// Metadados dos Papéis RBAC
const ROLE_DEFINITIONS = {
  dpo: {
    name: "DPO & Encarregado(a) Geral",
    color: "emerald",
    badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
    description: "Gestão completa de privacidade, RoPA, DSAR, relatórios ANPD e homologação de evidências."
  },
  secops: {
    name: "Gestor de T.I. & SecOps",
    color: "blue",
    badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
    description: "SIEM Wazuh, infraestrutura, backups Sienge ERP, firewall, GLPI e resposta a incidentes CSIRT."
  },
  gestor_obra: {
    name: "Engenheiro Residente / Obras",
    color: "amber",
    badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
    description: "Segurança de canteiro, biometria em catracas, termos de empreiteiras e evidências operacionais."
  },
  auditoria: {
    name: "Auditor Líder ISO 27001",
    color: "purple",
    badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
    description: "Verificação pericial da trilha forense SHA-256, inspeção cruzada de evidências e auditoria SoA."
  },
  diretoria: {
    name: "Diretoria Executiva / C-Level",
    color: "slate",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
    description: "Aprovação executiva da PSI, aceite formal de riscos críticos e alocação orçamentária."
  },
  rh_sst: {
    name: "RH & SST (NR-18)",
    color: "teal",
    badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    description: "Prontuários médicos de canteiro, NR-18, termos de colaboradores e controle de acessos de empreiteiras."
  }
};

// Funções de Inicialização e Persistência de Usuários (Sem senhas em texto plano no LocalStorage)
function getStoredUsers() {
  try {
    const raw = localStorage.getItem("AC_USERS_DB_V2");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(u => sanitizeClientUser(u));
      }
    }
  } catch (e) {
    console.warn("Falha ao recuperar usuários do LocalStorage:", e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_AC_USERS));
}

function saveStoredUsers(users, rawUsersForBackend = null) {
  const sanitized = Array.isArray(users) ? users.map(u => sanitizeClientUser(u)) : [];
  localStorage.setItem("AC_USERS_DB_V2", JSON.stringify(sanitized));

  // 1. Sincroniza imediatamente com o Banco de Dados (PostgreSQL / Servidor)
  const sm = window.StorageManager || window.EnterpriseStorage;
  if (sm) {
    if (typeof sm.syncToServer === 'function') {
      sm.syncToServer(false);
    } else if (typeof sm.scheduleSync === 'function') {
      sm.scheduleSync();
    }
  }

  // 2. Persiste diretamente no endpoint dedicado de usuários no backend
  try {
    fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ users: rawUsersForBackend || sanitized })
    }).catch(err => console.warn("Aviso ao persistir usuários via API:", err));
  } catch (_) {}
}

// Estado da Sessão de Autenticação
const AuthState = {
  currentUser: null,
  isLoggedIn: false,
  loginActiveTab: 'credentials' // 'credentials' | 'profiles'
};

function getStoredSessionUser() {
  try {
    const raw = localStorage.getItem("AC_AUTH_USER_V2");
    if (raw) return sanitizeClientUser(JSON.parse(raw));
  } catch (e) {
    console.warn("Falha ao recuperar sessão do usuário:", e);
  }
  return null;
}

function saveStoredSessionUser(user) {
  if (user) {
    localStorage.setItem("AC_AUTH_USER_V2", JSON.stringify(sanitizeClientUser(user)));
  } else {
    localStorage.removeItem("AC_AUTH_USER_V2");
  }
}

// Monitor de Inatividade de Sessão (ISO/IEC 27001 A.8.1 - Bloqueio Automático em 30 Minutos)
let idleTimeoutTimer = null;
const SESSION_IDLE_LIMIT_MS = 30 * 60 * 1000;

function resetSessionIdleTimer() {
  if (!AuthState.isLoggedIn) return;
  if (idleTimeoutTimer) clearTimeout(idleTimeoutTimer);
  idleTimeoutTimer = setTimeout(() => {
    if (AuthState.isLoggedIn) {
      logout();
      if (window.showToast) {
        window.showToast("Sessão bloqueada automaticamente após 30 minutos de inatividade (ISO 27001 A.8.1).", "warning");
      }
    }
  }, SESSION_IDLE_LIMIT_MS);
}

(function initSessionIdleWatchdog() {
  if (window.__cyberGrcIdleWatchdogInstalled) return;
  window.__cyberGrcIdleWatchdogInstalled = true;
  ["mousemove", "keydown", "click", "scroll", "touchstart"].forEach(evt => {
    window.addEventListener(evt, resetSessionIdleTimer, { passive: true });
  });
})();

function initAuth() {
  const users = getStoredUsers();
  const sessionUser = getStoredSessionUser();
  const isSessionAuthenticated = sessionStorage.getItem("AC_ACTIVE_LOGIN_SESSION_V4") === "true";

  if (isSessionAuthenticated && sessionUser) {
    // Valida se o usuário ainda existe no cadastro
    const currentValid = users.find(u => u.id === sessionUser.id) || users[0];
    AuthState.currentUser = currentValid;
    AuthState.isLoggedIn = true;
    applyUserSession(currentValid);
    hideLoginModal();
    resetSessionIdleTimer();

    // Se ainda não possui token assinado na sessão (ex: após recarregamento), revalida via SSO silencioso se aplicável
    if (!sessionStorage.getItem("AC_AUTH_JWT_TOKEN_V1") && currentValid && currentValid.email) {
      fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentValid.email, name: currentValid.name })
      })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data && data.token) {
            sessionStorage.setItem("AC_AUTH_JWT_TOKEN_V1", data.token);
          }
        })
        .catch(() => {});
    }
  } else {
    // Exige passagem obrigatória pelo Portal de Login Full-Screen antes de carregar o sistema
    AuthState.currentUser = null;
    AuthState.isLoggedIn = false;
    showLoginModal();

    // Detecta se acessou com link de convite: ?invite=...&email=...
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const emailParam = urlParams.get('email');
      if (emailParam) {
        const banner = document.getElementById("login-invite-alert-banner");
        const emailEl = document.getElementById("login-invite-banner-email");
        if (banner && emailEl) {
          emailEl.textContent = emailParam;
          banner.classList.remove("hidden");
        }
      }
    } catch (_) {}
  }
}

// ============================================================================
// CONFIGURAÇÃO DO GOOGLE WORKSPACE SSO & DOMÍNIO CORPORATIVO
// ============================================================================
const GOOGLE_SSO_CONFIG = {
  get clientId() {
    return localStorage.getItem("AC_GOOGLE_CLIENT_ID") || "";
  },
  set clientId(val) {
    if (val) localStorage.setItem("AC_GOOGLE_CLIENT_ID", val.trim());
    else localStorage.removeItem("AC_GOOGLE_CLIENT_ID");
  },
  get allowedDomains() {
    try {
      const stored = localStorage.getItem("AC_ALLOWED_DOMAINS");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (_) {}
    return ["acengenhariase.com.br", "acengenhariase.com", "acengenharia.com.br"];
  },
  set allowedDomains(list) {
    if (Array.isArray(list)) {
      localStorage.setItem("AC_ALLOWED_DOMAINS", JSON.stringify(list));
    }
  },
  get autoProvisionRole() {
    return localStorage.getItem("AC_GOOGLE_DEFAULT_ROLE") || "gestor_obra";
  },
  set autoProvisionRole(role) {
    localStorage.setItem("AC_GOOGLE_DEFAULT_ROLE", role || "gestor_obra");
  }
};

function isEmailDomainAllowed(email) {
  if (!email || !email.includes("@")) return false;
  const domain = email.split("@")[1].toLowerCase().trim();
  const allowed = GOOGLE_SSO_CONFIG.allowedDomains.map(d => d.toLowerCase().trim().replace(/^@/, ''));
  return allowed.includes(domain);
}

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

// Inicia fluxo de autenticação com o Google Workspace
function handleGoogleSignIn() {
  const clientId = GOOGLE_SSO_CONFIG.clientId;

  // Se houver Google Client ID configurado e o SDK estiver pronto
  if (clientId && window.google?.accounts?.id) {
    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      window.google.accounts.id.prompt();
      return;
    } catch (e) {
      console.warn("Aviso ao abrir Google GIS, abrindo seletor corporativo:", e);
    }
  }

  // Se não houver Client ID oficial inserido ou em ambiente de desenvolvimento:
  // Abre o Seletor Corporativo do Google Workspace da AC Engenharia
  openGoogleAccountPicker();
}

function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) {
    if (window.showToast) window.showToast("Falha na autenticação do Google.", "warning");
    return;
  }
  const payload = parseJwt(response.credential);
  if (!payload || !payload.email) {
    if (window.showToast) window.showToast("Não foi possível ler os dados da conta Google.", "warning");
    return;
  }
  completeGoogleAuth({
    email: payload.email,
    name: payload.name || payload.email.split("@")[0],
    picture: payload.picture || null,
    credential: response.credential
  });
}

async function completeGoogleAuth(profile) {
  const email = String(profile.email || "").toLowerCase().trim();
  const name = String(profile.name || email.split("@")[0]).trim();
  const picture = profile.picture || null;
  const credential = profile.credential || null;

  if (!email) {
    if (window.showToast) window.showToast("E-mail não fornecido pela conta Google.", "warning");
    return;
  }

  const emailDomain = email.split("@")[1];

  // 1. VALIDAÇÃO ESTRITA DE DOMÍNIO CORPORATIVO
  if (!isEmailDomainAllowed(email)) {
    const allowedStr = GOOGLE_SSO_CONFIG.allowedDomains.map(d => `@${d.replace(/^@/, '')}`).join(" ou ");
    const errorMsg = `Acesso Negado! O e-mail "${escapeHtml(email)}" não pertence ao domínio corporativo da AC Engenharia (${escapeHtml(allowedStr)}). O acesso ao SGSI é restrito exclusivamente a colaboradores da empresa.`;

    if (window.showConfirmDialog) {
      await window.showConfirmDialog({
        title: "Domínio Não Autorizado",
        message: `<span class="text-rose-600 font-bold">${errorMsg}</span>`,
        detail: "Para acessar o sistema corporativo da AC Engenharia, certifique-se de selecionar sua conta institucional do Google Workspace.",
        confirmText: "Compreendido",
        cancelText: "Fechar",
        type: "danger"
      });
    } else if (window.showToast) {
      window.showToast(errorMsg, "warning");
    } else {
      alert(errorMsg);
    }
    return;
  }

  // 2. BUSCA NO CATÁLOGO OU SERVIDOR (EXIGÊNCIA DE CONVITE PRÉVIO)
  let users = getStoredUsers();
  let user = users.find(u => u.email.toLowerCase() === email);

  // Se não estiver em cache local, consulta a API/PostgreSQL em tempo real
  if (!user) {
    try {
      const uRes = await fetch('/api/users');
      if (uRes.ok) {
        const uData = await uRes.json();
        if (Array.isArray(uData.users)) {
          users = uData.users.map(u => sanitizeClientUser(u));
          localStorage.setItem("AC_USERS_DB_V2", JSON.stringify(users));
          user = users.find(u => u.email.toLowerCase() === email);
        }
      }
    } catch (_) {}
  }

  const isSuperAdmin = (email === "manoelmgsantos@acengenhariase.com.br" || email === "admin@acengenhariase.com.br");

  // EXIGÊNCIA ESTRITA: O usuário precisa ter sido CONVIDADO / PRÉ-CADASTRADO pelo Administrador!
  if (!user && !isSuperAdmin) {
    const noInviteMsg = `O e-mail corporativo <strong>${escapeHtml(email)}</strong> pertence ao domínio da AC Engenharia, mas <strong>ainda não possui um convite de acesso</strong> ativo no sistema.<br><br>
    Para garantir a governança e segregação de funções (ISO/IEC 27001 Cláusula A.5.15), solicite seu convite ao <strong>Administrador Principal (Manoel Martins)</strong> para que seu perfil de acesso e canteiro de obras sejam liberados.`;

    if (window.showConfirmDialog) {
      await window.showConfirmDialog({
        title: "Acesso Não Autorizado: Convite Necessário",
        message: `<div class="text-slate-800 leading-relaxed text-xs">${noInviteMsg}</div>`,
        detail: "Apenas colaboradores previamente convidados e homologados pelo Administrador podem ingressar na plataforma CyberGRC & SGSI.",
        confirmText: "Entendido",
        cancelText: "Fechar",
        type: "warning"
      });
    } else if (window.showToast) {
      window.showToast("Acesso não autorizado: seu e-mail corporativo ainda não possui um convite do Administrador.", "warning");
    } else {
      alert("Acesso não autorizado: seu e-mail corporativo ainda não possui um convite do Administrador.");
    }
    return;
  }

  // Se for o SuperAdmin acessando pela primeira vez sem registro prévio
  if (!user && isSuperAdmin) {
    user = {
      id: "usr-admin",
      name: name || "Manoel Martins",
      email: email,
      role: "secops",
      roleName: "Administrador Geral & SecOps SGSI",
      department: "Diretoria de Tecnologia & Governança SGSI",
      location: "Escritório Central (Matriz)",
      avatar: "MM",
      color: "blue",
      status: "Ativo",
      isSuperAdmin: true,
      registeredVia: "google_sso"
    };
    users.push(user);
  }

  // Verifica bloqueio
  if (user.status === "Inativo" || user.status === "Bloqueado") {
    if (window.showToast) {
      window.showToast(`Sua conta corporativa está com status [${user.status}]. Acesso bloqueado pelo Administrador.`, "warning");
    }
    return;
  }

  // 3. VALIDA E REGISTRA SESSÃO NO BACKEND (EMITE TOKEN CRIPTOGRÁFICO ASSINADO)
  let wasInviteAccepted = false;
  try {
    const authRes = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email, name: user.name, picture: user.picture, credential })
    });
    if (!authRes.ok) {
      const errData = await authRes.json().catch(() => ({}));
      const errMsg = errData.error || "Falha na validação de convite com o servidor.";
      if (window.showToast) window.showToast(errMsg, "warning");
      else alert(errMsg);
      return;
    }
    const authData = await authRes.json().catch(() => ({}));
    if (authData.token) {
      sessionStorage.setItem("AC_AUTH_JWT_TOKEN_V1", authData.token);
    }
    if (authData.wasInviteAccepted) {
      wasInviteAccepted = true;
    }
  } catch (_) {}

  // VERIFICA SE ESTAVA COM CONVITE PENDENTE (PRIMEIRO ACESSO DO COLABORADOR CONVIDADO)
  if (user.status === "Convite Pendente") {
    user.status = "Ativo";
    user.acceptedInviteAt = new Date().toISOString();
    user.registeredVia = "google_sso";
    if (name && (!user.name || user.name === email.split("@")[0])) {
      user.name = name;
    }
    if (picture) user.picture = picture;
    wasInviteAccepted = true;
    saveStoredUsers(users);
    if (typeof renderAdminUsersTable === 'function') renderAdminUsersTable();
  } else if (picture && !user.picture) {
    user.picture = picture;
    saveStoredUsers(users);
  }

  // 4. ATIVA SESSÃO
  AuthState.currentUser = user;
  AuthState.isLoggedIn = true;
  sessionStorage.setItem("AC_ACTIVE_LOGIN_SESSION_V4", "true");
  saveStoredSessionUser(user);
  applyUserSession(user);
  hideLoginModal();
  closeGoogleAccountPicker();
  resetSessionIdleTimer();

  const welcomeMsg = wasInviteAccepted
    ? `🎉 Convite aceito com sucesso! Bem-vindo(a), ${user.name}! Seu acesso foi ativado com o perfil [${user.roleName}] no canteiro [${user.location}].`
    : `Bem-vindo(a) de volta, ${user.name}! Sessão autenticada via Google Workspace.`;

  if (window.showToast) {
    window.showToast(welcomeMsg, "success");
  }

  if (window.ApiService && typeof window.ApiService.addAuditRecord === 'function') {
    window.ApiService.addAuditRecord({
      category: "AUTENTICAÇÃO_GOOGLE_SSO",
      severity: "INFO",
      actor: `${user.name} <${user.email}>`,
      description: wasInviteAccepted
        ? `Convite corporativo aceito via Google SSO. Usuário ${user.name} ativado com perfil [${user.roleName}] no canteiro [${user.location}].`
        : `Autenticação corporativa via Google SSO (@${emailDomain}). Perfil: [${user.roleName}].`,
      target_module: "Segurança de Acesso"
    });
  }
}

// Funções do Seletor de Contas Google (Sanitizado contra DOM XSS)
function openGoogleAccountPicker() {
  const modal = document.getElementById("modal-google-sso-picker");
  if (!modal) return;

  const domainBadge = document.getElementById("google-picker-allowed-domain-text");
  if (domainBadge) {
    domainBadge.textContent = `@${GOOGLE_SSO_CONFIG.allowedDomains[0]}`;
  }

  // Renderiza dinamicamente as contas da organização que estão autorizadas / convidadas
  const accountsContainer = document.getElementById("google-picker-accounts-container");
  if (accountsContainer) {
    const users = getStoredUsers();
    accountsContainer.innerHTML = users.map(u => {
      const isPending = u.status === "Convite Pendente";
      const isMasterAdmin = Boolean(u.isSuperAdmin || u.id === 'usr-admin' || u.email === 'manoelmgsantos@acengenhariase.com.br');
      const badgeText = isPending ? "🟡 Convite Pronto" : (isMasterAdmin ? "⭐ Admin Principal" : (u.roleName || "Colaborador"));
      const badgeClass = isPending 
        ? "bg-amber-50 text-amber-800 border-amber-200" 
        : (isMasterAdmin ? "bg-blue-50 text-[#004b93] border-blue-200" : "bg-slate-100 text-slate-700 border-slate-200");
      const safeEmail = escapeHtml(u.email);
      const safeName = escapeHtml(u.name);
      const safeAvatar = escapeHtml(u.avatar || (u.name || "US").substring(0, 2).toUpperCase());

      return `
        <button type="button" data-email="${safeEmail}" data-name="${safeName}" onclick="selectGoogleQuickAccount(this.getAttribute('data-email'), this.getAttribute('data-name'))" class="w-full p-3 text-left hover:bg-slate-50 transition-colors flex items-center gap-3 cursor-pointer">
          <div class="w-8 h-8 rounded-full ${isMasterAdmin ? 'bg-blue-700' : (isPending ? 'bg-amber-600' : 'bg-[#0f2942]')} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            ${safeAvatar}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-bold text-slate-900 truncate text-xs flex items-center gap-1.5">
              <span>${safeName}</span>
              ${isPending ? `<span class="px-1.5 py-0.2 rounded text-[9px] bg-amber-100 text-amber-800 font-semibold animate-pulse">Pendente de Ativação</span>` : ''}
            </div>
            <div class="text-[11px] text-slate-500 font-mono truncate">${safeEmail}</div>
          </div>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${badgeClass}">
            ${escapeHtml(badgeText)}
          </span>
        </button>
      `;
    }).join("");
  }

  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeGoogleAccountPicker() {
  const modal = document.getElementById("modal-google-sso-picker");
  if (modal) modal.classList.add("hidden");
}

function selectGoogleQuickAccount(email, name) {
  completeGoogleAuth({ email, name });
}

function submitCustomGoogleAccount(e) {
  if (e && e.preventDefault) e.preventDefault();
  const emailInput = document.getElementById("google-picker-custom-email");
  const nameInput = document.getElementById("google-picker-custom-name");
  const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
  const name = nameInput ? nameInput.value.trim() : "";
  if (!email) return;
  completeGoogleAuth({ email, name: name || email.split("@")[0] });
}

// =========================================================================
// GESTÃO DE CONVITES GOOGLE WORKSPACE (CONVITE PRÉVIO OBRIGATÓRIO)
// =========================================================================

function openInviteUserModal() {
  const modal = document.getElementById("modal-invite-user");
  if (!modal) return;

  // Popula dropdown de canteiros com as obras cadastradas
  const locSelect = document.getElementById("invite-user-location");
  if (locSelect) {
    let obrasList = [];
    try {
      const raw = localStorage.getItem("AC_OBRAS_DATA_V1");
      if (raw) obrasList = JSON.parse(raw);
    } catch (_) {}

    locSelect.innerHTML = `
      <option value="Escritório Central (Matriz)">Escritório Central (Matriz)</option>
    `;
    if (Array.isArray(obrasList)) {
      obrasList.forEach(o => {
        const opt = document.createElement("option");
        opt.value = `${o.name} (${o.code})`;
        opt.textContent = `${o.name} (${o.code}) - ${o.city || 'SE'}`;
        locSelect.appendChild(opt);
      });
    }
  }

  const nameInput = document.getElementById("invite-user-name");
  const emailInput = document.getElementById("invite-user-email");
  const notesInput = document.getElementById("invite-user-notes");
  if (nameInput) nameInput.value = "";
  if (emailInput) emailInput.value = "";
  if (notesInput) notesInput.value = "";

  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeInviteUserModal() {
  const modal = document.getElementById("modal-invite-user");
  if (modal) modal.classList.add("hidden");
}

async function handleSendUserInvite(e) {
  if (e && e.preventDefault) e.preventDefault();

  const nameInput = document.getElementById("invite-user-name");
  const emailInput = document.getElementById("invite-user-email");
  const roleSelect = document.getElementById("invite-user-role");
  const locSelect = document.getElementById("invite-user-location");
  const deptInput = document.getElementById("invite-user-dept");
  const notesInput = document.getElementById("invite-user-notes");

  const name = nameInput ? nameInput.value.trim() : "";
  const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
  const role = roleSelect ? roleSelect.value : "gestor_obra";
  const location = locSelect ? locSelect.value : "Escritório Central (Matriz)";
  const dept = deptInput && deptInput.value.trim() ? deptInput.value.trim() : "Engenharia de Obras";
  const notes = notesInput ? notesInput.value.trim() : "";

  if (!name || !email) {
    if (window.showToast) window.showToast("Informe o nome e o e-mail institucional.", "warning");
    return;
  }

  // Validação do domínio corporativo
  if (!isEmailDomainAllowed(email)) {
    const errorMsg = `O e-mail deve pertencer aos domínios corporativos autorizados (@${GOOGLE_SSO_CONFIG.allowedDomains.join(", @")}). Não é permitido convidar e-mails externos como @gmail.com.`;
    if (window.showToast) window.showToast(errorMsg, "warning");
    else alert(errorMsg);
    return;
  }

  let users = getStoredUsers();
  const existing = users.find(u => u.email.toLowerCase() === email);
  if (existing) {
    if (existing.status === "Ativo") {
      if (window.showToast) window.showToast(`O colaborador ${existing.name} já possui conta ativa com o e-mail "${email}".`, "warning");
      return;
    }
  }

  const roleDef = ROLE_DEFINITIONS[role] || { name: "Colaborador SGSI", color: "blue" };
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("") || "US";

  const inviteUser = {
    id: existing ? existing.id : `usr-inv-${Date.now().toString(36)}`,
    name,
    email,
    role,
    roleName: roleDef.name,
    department: dept,
    location,
    status: "Convite Pendente",
    invitedBy: AuthState.currentUser ? AuthState.currentUser.name : "Administrador Principal",
    invitedAt: new Date().toISOString(),
    registeredVia: "google_sso_invite",
    color: roleDef.color,
    avatar: initials,
    notes: notes,
    responsibilities: getDefaultResponsibilities(role)
  };

  if (existing) {
    const idx = users.findIndex(u => u.id === existing.id);
    users[idx] = inviteUser;
  } else {
    users.push(inviteUser);
  }

  saveStoredUsers(users);

  // Sincroniza com backend Express / PostgreSQL
  try {
    await fetch("/api/users/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inviteUser)
    });
  } catch (_) {}

  closeInviteUserModal();
  renderAdminUsersTable();

  // Exibe modal de sucesso com link de convite pronto para cópia
  const successModal = document.getElementById("modal-invite-success");
  if (successModal) {
    const sName = document.getElementById("invite-success-name");
    const sEmail = document.getElementById("invite-success-email");
    const sLink = document.getElementById("invite-success-link");
    if (sName) sName.textContent = name;
    if (sEmail) sEmail.textContent = email;
    const inviteUrl = `${window.location.origin}/?invite=${inviteUser.id}&email=${encodeURIComponent(email)}`;
    if (sLink) sLink.value = inviteUrl;
    successModal.classList.remove("hidden");
    if (window.lucide) window.lucide.createIcons();
  }

  if (window.showToast) {
    window.showToast(`Convite gerado com sucesso para ${name}!`, "success");
  }

  if (window.ApiService && typeof window.ApiService.addAuditRecord === 'function') {
    const actor = AuthState.currentUser ? AuthState.currentUser.name : "Administrador";
    window.ApiService.addAuditRecord({
      category: "CONVITES_RBAC",
      severity: "INFO",
      actor: actor,
      description: `Novo convite Google Workspace gerado para ${name} <${email}>. Perfil: [${roleDef.name}], canteiro: [${location}].`,
      target_module: "Gestão de Usuários"
    });
  }
}

function copyInviteSuccessLink() {
  const linkInput = document.getElementById("invite-success-link");
  if (linkInput) {
    linkInput.select();
    navigator.clipboard.writeText(linkInput.value);
    if (window.showToast) window.showToast("Link de convite copiado para a área de transferência!", "success");
  }
}

function copyUserInviteLink(userId) {
  const users = getStoredUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return;
  const inviteUrl = `${window.location.origin}/?invite=${target.id}&email=${encodeURIComponent(target.email)}`;
  navigator.clipboard.writeText(inviteUrl);
  if (window.showToast) {
    window.showToast(`Link de convite para "${target.name}" copiado com sucesso!`, "success");
  }
}

// Alterna formulário de login por senha exclusivo do Administrador Principal
function toggleAdminLoginForm() {
  const form = document.getElementById("admin-password-login-box");
  const btn = document.getElementById("btn-toggle-admin-login");
  if (!form) return;
  const isHidden = form.classList.contains("hidden");
  if (isHidden) {
    form.classList.remove("hidden");
    if (btn) btn.innerHTML = `<i data-lucide="chevron-up" class="w-3.5 h-3.5"></i> <span>Ocultar Acesso do Administrador</span>`;
  } else {
    form.classList.add("hidden");
    if (btn) btn.innerHTML = `<i data-lucide="key-round" class="w-3.5 h-3.5 text-slate-500"></i> <span>Acesso do Administrador Principal (Setup / Senha)</span>`;
  }
  if (window.lucide) window.lucide.createIcons();
}

// Configurações do Google SSO (Exclusivo para o Administrador Principal)
function openGoogleSsoSettingsModal() {
  const modal = document.getElementById("modal-google-sso-settings");
  if (!modal) return;
  const domainsInput = document.getElementById("sso-cfg-domains");
  const clientIdInput = document.getElementById("sso-cfg-client-id");
  const roleSelect = document.getElementById("sso-cfg-default-role");

  if (domainsInput) domainsInput.value = GOOGLE_SSO_CONFIG.allowedDomains.join(", ");
  if (clientIdInput) clientIdInput.value = GOOGLE_SSO_CONFIG.clientId;
  if (roleSelect) roleSelect.value = GOOGLE_SSO_CONFIG.autoProvisionRole;

  modal.classList.remove("hidden");
  if (window.lucide) window.lucide.createIcons();
}

function closeGoogleSsoSettingsModal() {
  const modal = document.getElementById("modal-google-sso-settings");
  if (modal) modal.classList.add("hidden");
}

function saveGoogleSsoSettings(e) {
  if (e && e.preventDefault) e.preventDefault();
  const domainsInput = document.getElementById("sso-cfg-domains");
  const clientIdInput = document.getElementById("sso-cfg-client-id");
  const roleSelect = document.getElementById("sso-cfg-default-role");

  if (domainsInput) {
    const rawList = domainsInput.value.split(",").map(d => d.trim().replace(/^@/, '')).filter(Boolean);
    if (rawList.length > 0) {
      GOOGLE_SSO_CONFIG.allowedDomains = rawList;
    }
  }
  if (clientIdInput) {
    GOOGLE_SSO_CONFIG.clientId = clientIdInput.value.trim();
  }
  if (roleSelect) {
    GOOGLE_SSO_CONFIG.autoProvisionRole = roleSelect.value;
  }

  closeGoogleSsoSettingsModal();
  if (window.showToast) {
    window.showToast("Configurações do Google Workspace SSO salvas com sucesso!", "success");
  }
}

window.GOOGLE_SSO_CONFIG = GOOGLE_SSO_CONFIG;
window.handleGoogleSignIn = handleGoogleSignIn;
window.openGoogleAccountPicker = openGoogleAccountPicker;
window.closeGoogleAccountPicker = closeGoogleAccountPicker;
window.selectGoogleQuickAccount = selectGoogleQuickAccount;
window.submitCustomGoogleAccount = submitCustomGoogleAccount;
window.openInviteUserModal = openInviteUserModal;
window.closeInviteUserModal = closeInviteUserModal;
window.handleSendUserInvite = handleSendUserInvite;
window.copyInviteSuccessLink = copyInviteSuccessLink;
window.copyUserInviteLink = copyUserInviteLink;
window.toggleAdminLoginForm = toggleAdminLoginForm;
window.openGoogleSsoSettingsModal = openGoogleSsoSettingsModal;
window.closeGoogleSsoSettingsModal = closeGoogleSsoSettingsModal;
window.saveGoogleSsoSettings = saveGoogleSsoSettings;

async function computeSha256Hex(text) {
  if (window.crypto && window.crypto.subtle) {
    const buf = await window.crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
  }
  return "";
}

async function loginWithForm(e) {
  if (e && e.preventDefault) e.preventDefault();
  const emailInput = document.getElementById("login-input-email");
  const passInput = document.getElementById("login-input-password");
  const email = emailInput ? emailInput.value.trim().toLowerCase() : "";
  const pass = passInput ? passInput.value.trim() : "";

  if (!email || !pass) {
    if (window.showToast) {
      window.showToast("Informe o e-mail do Administrador Principal e a senha mestra.", "warning");
    } else {
      alert("Informe o e-mail do Administrador Principal e a senha mestra.");
    }
    return;
  }

  let users = getStoredUsers();
  let found = users.find(u => u.email.toLowerCase() === email);

  // Se o usuário não estiver em cache no navegador local, consulta a API/PostgreSQL em tempo real
  if (!found) {
    try {
      const uRes = await fetch('/api/users');
      if (uRes.ok) {
        const uData = await uRes.json();
        if (Array.isArray(uData.users) && uData.users.length > 0) {
          users = uData.users.map(u => sanitizeClientUser(u));
          localStorage.setItem("AC_USERS_DB_V2", JSON.stringify(users));
          found = users.find(u => u.email.toLowerCase() === email);
          if (typeof renderAdminUsersTable === 'function') renderAdminUsersTable();
        }
      }
    } catch (_) {}
  }

  // VALIDAÇÃO ESTRITA: Login por senha é restrito EXCLUSIVAMENTE ao Administrador Principal de Configuração!
  const isAdmin = Boolean(
    (found && (found.isSuperAdmin || found.id === 'usr-admin')) ||
    email === 'manoelmgsantos@acengenhariase.com.br'
  );
  if (!isAdmin) {
    const blockMsg = "Acesso Negado: O login por senha é exclusivo para o Administrador Principal de Configuração. Todos os demais colaboradores devem acessar pelo botão 'Continuar com Google Workspace'.";
    if (window.showConfirmDialog) {
      await window.showConfirmDialog({
        title: "Autenticação Obrigatória via Google",
        message: `<span class="text-rose-600 font-bold">${blockMsg}</span>`,
        detail: "A política corporativa de segurança da AC Engenharia exige login com conta institucional Google Workspace.",
        confirmText: "Entendi",
        cancelText: "Fechar",
        type: "warning"
      });
    } else if (window.showToast) {
      window.showToast(blockMsg, "warning");
    } else {
      alert(blockMsg);
    }
    return;
  }

  if (found && (found.status === "Inativo" || found.status === "Bloqueado")) {
    if (window.showToast) {
      window.showToast(`Esta conta está com status [${found.status}]. Acesso bloqueado.`, "warning");
    }
    return;
  }

  // Autenticação Criptográfica no Servidor (bcrypt + Proteção Anti-Força Bruta + Emissão de Token HMAC-SHA256)
  let serverAuthenticated = false;
  try {
    const loginRes = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pass })
    });

    if (!loginRes.ok) {
      const errBody = await loginRes.json().catch(() => ({}));
      const errMsg = errBody.error || "Credenciais de Administrador inválidas.";
      if (window.showToast) window.showToast(errMsg, "warning");
      else alert(errMsg);
      return;
    }

    const loginData = await loginRes.json();
    if (loginData.token) {
      sessionStorage.setItem("AC_AUTH_JWT_TOKEN_V1", loginData.token);
    }
    if (loginData.user) {
      found = sanitizeClientUser({ ...(found || DEFAULT_AC_USERS[0]), ...loginData.user });
    }
    serverAuthenticated = true;
  } catch (_) {
    // Fallback Offline Criptográfico via Digest SHA-256 Unidirecional (Sem senha em texto plano)
    const digest = await computeSha256Hex(pass);
    const expectedAdminDigest = "712f23210b3058bf1c6626be550291689a39f1e98f91ca1593c985e5cb36bc03";
    if (digest !== expectedAdminDigest) {
      if (window.showToast) window.showToast("Senha do Administrador incorreta.", "warning");
      else alert("Senha do Administrador incorreta.");
      return;
    }
    found = found || sanitizeClientUser(DEFAULT_AC_USERS[0]);
  }

  if (!found && !serverAuthenticated) {
    if (window.showToast) window.showToast("Credenciais de Administrador inválidas.", "warning");
    return;
  }

  AuthState.currentUser = found;
  AuthState.isLoggedIn = true;
  sessionStorage.setItem("AC_ACTIVE_LOGIN_SESSION_V4", "true");
  saveStoredSessionUser(found);
  applyUserSession(found);
  hideLoginModal();
  resetSessionIdleTimer();

  if (passInput) passInput.value = "";

  if (window.showToast) {
    window.showToast(`Bem-vindo, Administrador ${found.name}! Modo de Configuração SGSI Ativo.`, "success");
  }

  // Registro na trilha forense
  if (window.ApiService && typeof window.ApiService.addAuditRecord === 'function') {
    window.ApiService.addAuditRecord({
      category: "AUTENTICAÇÃO_RBAC",
      severity: "INFO",
      actor: `${found.name} <${found.email}>`,
      description: `Autenticação corporativa com sucesso. Perfil [${found.roleName}], setor [${found.department}], lotação [${found.location || 'Sede Central'}].`,
      target_module: "Segurança de Acesso"
    });
  }
}

function logout() {
  if (idleTimeoutTimer) {
    clearTimeout(idleTimeoutTimer);
    idleTimeoutTimer = null;
  }
  try {
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  } catch (_) {}
  AuthState.currentUser = null;
  AuthState.isLoggedIn = false;
  sessionStorage.removeItem("AC_ACTIVE_LOGIN_SESSION_V4");
  sessionStorage.removeItem("AC_AUTH_JWT_TOKEN_V1");
  saveStoredSessionUser(null);
  showLoginModal();
  if (window.showToast) {
    window.showToast("Sessão encerrada com segurança. Retornando ao Portal de Login.", "info");
  }
}

function applyUserSession(user) {
  if (!user) return;

  AuthState.currentUser = user;

  // Atualiza Role e Usuário no State global preservando estritamente o usuário autenticado
  if (window.State) {
    window.State.currentRole = user.role;
    window.State.currentUser = user;
    if (typeof window.setRole === 'function') {
      window.setRole(user.role, { preserveCurrentUser: true, silent: true });
    }
  }

  // Garante que o cabeçalho e o banner exibam exatamente o usuário autenticado
  const userName = document.getElementById("header-user-name");
  const userRole = document.getElementById("header-user-role");
  const userAvatar = document.getElementById("header-user-avatar");

  if (userName) userName.textContent = user.name;
  if (userRole) userRole.textContent = user.roleName ? user.roleName.split('&')[0].trim() : user.role;
  if (userAvatar) userAvatar.textContent = user.avatar || "US";

  const personaName = document.getElementById("persona-user-name");
  const personaAvatar = document.getElementById("persona-badge-avatar");
  const personaLoc = document.getElementById("persona-location-badge");
  if (personaName) personaName.textContent = user.name;
  if (personaAvatar) personaAvatar.textContent = user.avatar || "US";
  if (personaLoc) personaLoc.textContent = user.location || user.department || "Sede Central";

  autoFillResponsibleInputs(user.name);
}

function autoFillResponsibleInputs(name) {
  const inputs = [
    "risk-page-input-responsible",
    "ropa-responsible",
    "task-input-responsible",
    "evidence-input-responsible"
  ];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el && !el.value) el.value = name;
  });
}

function showLoginModal() {
  const modal = document.getElementById("modal-login-overlay");
  const appShell = document.getElementById("app-main-shell");
  const resumeBtn = document.getElementById("login-btn-resume-session");

  if (appShell) appShell.classList.add("hidden");
  if (resumeBtn) {
    if (AuthState.isLoggedIn && AuthState.currentUser) {
      resumeBtn.classList.remove("hidden");
      resumeBtn.classList.add("flex");
    } else {
      resumeBtn.classList.add("hidden");
      resumeBtn.classList.remove("flex");
    }
  }

  if (modal) {
    modal.classList.remove("hidden");
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
}

function hideLoginModal() {
  if (!AuthState.isLoggedIn || !AuthState.currentUser) {
    if (window.showToast) {
      window.showToast("Identifique-se com suas credenciais corporativas para acessar o sistema.", "warning");
    }
    return;
  }
  const modal = document.getElementById("modal-login-overlay");
  const appShell = document.getElementById("app-main-shell");
  if (modal) modal.classList.add("hidden");
  if (appShell) appShell.classList.remove("hidden");
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function toggleUserMenuDropdown(e) {
  if (e) {
    if (e.stopPropagation) e.stopPropagation();
    if (e.preventDefault) e.preventDefault();
  }
  const dropdown = document.getElementById("header-user-dropdown");
  if (dropdown) {
    dropdown.classList.toggle("hidden");
  }
}

// Fechar dropdown de usuário ao clicar fora
document.addEventListener("click", (e) => {
  const dropdown = document.getElementById("header-user-dropdown");
  const userBtn = document.getElementById("header-user-btn");
  if (dropdown && !dropdown.classList.contains("hidden")) {
    if (userBtn && (userBtn.contains(e.target) || userBtn === e.target)) return;
    if (!dropdown.contains(e.target)) {
      dropdown.classList.add("hidden");
    }
  }
});

function togglePasswordVisibility() {
  const input = document.getElementById("login-input-password");
  const icon = document.getElementById("login-eye-icon");
  if (!input) return;
  if (input.type === "password") {
    input.type = "text";
    if (icon) {
      icon.setAttribute("data-lucide", "eye-off");
      icon.className = "w-4 h-4 text-[#004b93]";
    }
  } else {
    input.type = "password";
    if (icon) {
      icon.setAttribute("data-lucide", "eye");
      icon.className = "w-4 h-4 text-slate-400";
    }
  }
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function fillLoginCredentials(email, password) {
  const eInput = document.getElementById("login-input-email");
  const pInput = document.getElementById("login-input-password");
  if (eInput) eInput.value = email || "";
  if (pInput && password) pInput.value = password;
  if (window.showToast) {
    window.showToast(`E-mail preenchido para ${email}`, "info");
  }
}
window.fillLoginCredentials = fillLoginCredentials;

function openUserProfileModal() {
  const user = AuthState.currentUser || getStoredUsers()[0];
  const modal = document.getElementById("modal-user-profile");
  if (!modal) return;

  document.getElementById("profile-modal-name").textContent = user.name;
  document.getElementById("profile-modal-role").textContent = user.roleName;
  document.getElementById("profile-modal-email").textContent = user.email;
  document.getElementById("profile-modal-dept").textContent = `${user.department} • ${user.location || 'Sede Central'}`;
  document.getElementById("profile-modal-avatar").textContent = user.avatar;

  const respList = document.getElementById("profile-modal-responsibilities");
  if (respList) {
    respList.innerHTML = "";
    (user.responsibilities || []).forEach(r => {
      const li = document.createElement("li");
      li.className = "flex items-start gap-2 text-xs text-slate-700";
      li.innerHTML = `
        <i data-lucide="check-circle-2" class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5"></i>
        <span>${escapeHtml(r)}</span>
      `;
      respList.appendChild(li);
    });
  }

  modal.classList.remove("hidden");
  updateUsersBatchUI();
  if (window.lucide) window.lucide.createIcons();
}

// =========================================================================
// PAINEL DE ADMINISTRAÇÃO DE USUÁRIOS E CONTROLE DE ACESSO (RBAC)
// =========================================================================

function openAdminUsersModal() {
  if (typeof switchTab === 'function') {
    switchTab('users');
  }
  switchUserSubtab('list');
  renderAdminUsersTable();
}

let adminUserFilterRole = "all";
let adminUserFilterSearch = "";

function applyAdminUserFilters() {
  const roleEl = document.getElementById("admin-user-filter-role");
  const searchEl = document.getElementById("admin-user-filter-search");
  if (roleEl) adminUserFilterRole = roleEl.value;
  if (searchEl) adminUserFilterSearch = searchEl.value.toLowerCase().trim();
  renderAdminUsersTable();
}

function clearAdminUserFilters() {
  adminUserFilterRole = "all";
  adminUserFilterSearch = "";
  const roleEl = document.getElementById("admin-user-filter-role");
  const searchEl = document.getElementById("admin-user-filter-search");
  if (roleEl) roleEl.value = "all";
  if (searchEl) searchEl.value = "";
  renderAdminUsersTable();
}

// Seleção Múltipla e Exclusão em Lote de Usuários
const selectedUserIds = new Set();

function toggleUserSelection(id, el) {
  if (el && el.checked) {
    selectedUserIds.add(id);
  } else {
    selectedUserIds.delete(id);
  }
  updateUsersBatchUI();
}

function toggleSelectAllUsers(masterEl) {
  const users = getStoredUsers().filter(u => !u.isSuperAdmin && u.id !== 'usr-admin' && (!AuthState.currentUser || AuthState.currentUser.id !== u.id));
  if (masterEl && masterEl.checked) {
    users.forEach(u => selectedUserIds.add(u.id));
  } else {
    selectedUserIds.clear();
  }
  updateUsersBatchUI();
  renderAdminUsersTable();
}

function clearUsersSelection() {
  selectedUserIds.clear();
  updateUsersBatchUI();
  renderAdminUsersTable();
}

function updateUsersBatchUI() {
  const bar = document.getElementById("users-batch-bar");
  const countEl = document.getElementById("users-batch-count");
  const masterCheck = document.getElementById("users-select-all");
  const selectableUsers = getStoredUsers().filter(u => !u.isSuperAdmin && u.id !== 'usr-admin' && (!AuthState.currentUser || AuthState.currentUser.id !== u.id));
  const count = selectedUserIds.size;

  if (countEl) countEl.textContent = `${count} usuário(s) selecionado(s)`;
  if (bar) {
    if (count > 0) bar.classList.remove("hidden");
    else bar.classList.add("hidden");
  }
  if (masterCheck) {
    masterCheck.checked = selectableUsers.length > 0 && count === selectableUsers.length;
    masterCheck.indeterminate = count > 0 && count < selectableUsers.length;
  }
}

async function deleteSelectedUsers() {
  const ids = Array.from(selectedUserIds);
  if (ids.length === 0) return;

  const users = getStoredUsers();
  const targets = users.filter(u => ids.includes(u.id) && !u.isSuperAdmin && u.id !== 'usr-admin');
  if (targets.length === 0) return;

  const names = targets.map(t => `"${t.name}"`).join(", ");
  const ok = await (window.showConfirmDialog ? window.showConfirmDialog({
    title: `Excluir ${targets.length} Usuário(s) em Lote`,
    message: `Deseja realmente remover os <strong>${targets.length} usuários selecionados</strong> (${names})?`,
    detail: "As credenciais de acesso corporativo e perfis RBAC serão revogados imediatamente.",
    confirmText: `Sim, Excluir Todos (${targets.length})`,
    cancelText: "Cancelar",
    type: "danger"
  }) : Promise.resolve(confirm(`Deseja realmente remover ${targets.length} usuário(s)?`)));

  if (!ok) return;

  const targetIds = targets.map(t => t.id);
  const remaining = users.filter(u => !targetIds.includes(u.id));
  saveStoredUsers(remaining);

  for (const tid of targetIds) {
    try {
      await fetch(`/api/users/${encodeURIComponent(tid)}`, { method: "DELETE" });
    } catch (_) {}
  }

  selectedUserIds.clear();
  updateUsersBatchUI();
  renderAdminUsersTable();

  if (window.showToast) {
    window.showToast(`${targets.length} usuário(s) removido(s) com sucesso.`, "info");
  }
}

window.toggleUserSelection = toggleUserSelection;
window.toggleSelectAllUsers = toggleSelectAllUsers;
window.clearUsersSelection = clearUsersSelection;
window.deleteSelectedUsers = deleteSelectedUsers;

function renderAdminUsersTable() {
  const tbody = document.getElementById("admin-users-table-body");
  if (!tbody) return;

  const users = getStoredUsers();

  // Filtragem
  const filtered = users.filter(u => {
    const matchRole = adminUserFilterRole === "all" || u.role === adminUserFilterRole;
    const matchSearch = !adminUserFilterSearch ||
      u.name.toLowerCase().includes(adminUserFilterSearch) ||
      u.email.toLowerCase().includes(adminUserFilterSearch) ||
      u.department.toLowerCase().includes(adminUserFilterSearch) ||
      (u.location && u.location.toLowerCase().includes(adminUserFilterSearch));
    return matchRole && matchSearch;
  });

  // Atualizar contadores
  const totalEl = document.getElementById("users-kpi-total");
  const secopsEl = document.getElementById("users-kpi-secops");
  const dpoEl = document.getElementById("users-kpi-dpo");
  const obraEl = document.getElementById("users-kpi-obras");

  if (totalEl) totalEl.textContent = users.length;
  if (secopsEl) secopsEl.textContent = users.filter(u => u.role === "secops").length;
  if (dpoEl) dpoEl.textContent = users.filter(u => u.role === "dpo").length;
  if (obraEl) obraEl.textContent = users.filter(u => u.role === "gestor_obra").length;

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="py-12 text-center text-slate-400">
          <div class="max-w-xs mx-auto space-y-1.5">
            <i data-lucide="users" class="w-8 h-8 mx-auto text-slate-300"></i>
            <div class="font-bold text-slate-700 text-xs">Nenhum colaborador encontrado</div>
            <p class="text-[11px] text-slate-400">Ajuste os filtros ou adicione um novo usuário ao SGSI.</p>
          </div>
        </td>
      </tr>
    `;
    if (window.lucide && typeof window.lucide.createIcons === 'function') window.lucide.createIcons();
    return;
  }

  filtered.forEach(u => {
    const roleDef = ROLE_DEFINITIONS[u.role] || {
      name: u.roleName,
      badgeClass: "bg-slate-100 text-slate-700 border-slate-200"
    };

    const isCurrentLoggedIn = AuthState.currentUser && AuthState.currentUser.id === u.id;
    const isStatusActive = u.status === "Ativo";

    const tr = document.createElement("tr");
    tr.className = `hover:bg-blue-50/30 transition-colors border-b border-slate-100 ${isCurrentLoggedIn ? 'bg-blue-50/20' : ''}`;

    const isSel = selectedUserIds.has(u.id);
    const safeId = escapeHtml(u.id);
    const safeName = escapeHtml(u.name);
    const safeEmail = escapeHtml(u.email);
    const safeAvatar = escapeHtml(u.avatar || 'US');
    const safeDept = escapeHtml(u.department);
    const safeLoc = escapeHtml(u.location || 'Sede Central');
    const safeStatus = escapeHtml(u.status);

    tr.innerHTML = `
      <td class="py-3 px-3 text-center">
        ${(u.isSuperAdmin || u.id === 'usr-admin' || isCurrentLoggedIn) ? `
          <input type="checkbox" disabled class="opacity-25 cursor-not-allowed" title="Usuário protegido contra exclusão" />
        ` : `
          <input type="checkbox" class="user-row-checkbox rounded border-slate-300 text-[#004b93] focus:ring-[#004b93] cursor-pointer" data-id="${safeId}" ${isSel ? 'checked' : ''} onchange="toggleUserSelection(this.getAttribute('data-id'), this)" />
        `}
      </td>
      <td class="py-3 px-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#004b93] to-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
            ${safeAvatar}
          </div>
          <div>
            <div class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span>${safeName}</span>
              ${(u.isSuperAdmin || u.id === 'usr-admin') ? `<span class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⭐ Admin Principal</span>` : ''}
              ${isCurrentLoggedIn ? `<span class="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-blue-100 text-[#004b93] font-bold">Você</span>` : ''}
            </div>
            <div class="text-[11px] text-slate-500 font-mono">${safeEmail}</div>
          </div>
        </div>
      </td>
      <td class="py-3 px-3">
        <span class="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${roleDef.badgeClass}">
          ${escapeHtml(roleDef.name)}
        </span>
      </td>
      <td class="py-3 px-3">
        <div class="text-xs text-slate-700 font-medium">${safeDept}</div>
        <div class="text-[10px] text-slate-400 mt-0.5">${safeLoc}</div>
      </td>
      <td class="py-3 px-3 text-center">
        ${u.status === "Convite Pendente" ? `
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold font-mono bg-amber-50 text-amber-800 border border-amber-200" title="Aguardando primeiro login com Google">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            Convite Pendente
          </span>
        ` : `
          <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono ${isStatusActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}">
            <span class="w-1.5 h-1.5 rounded-full ${isStatusActive ? 'bg-emerald-500' : 'bg-rose-500'}"></span>
            ${safeStatus}
          </span>
        `}
      </td>
      <td class="py-3 px-3 text-right">
        <div class="flex items-center justify-end gap-1.5">
          ${u.status === "Convite Pendente" ? `
            <button data-uid="${safeId}" onclick="copyUserInviteLink(this.getAttribute('data-uid'))" class="p-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 transition-colors cursor-pointer" title="Copiar Link de Convite">
              <i data-lucide="link" class="w-3.5 h-3.5"></i>
            </button>
          ` : ''}
          <button data-uid="${safeId}" onclick="openEditUserPage(this.getAttribute('data-uid'))" class="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer" title="Editar Usuário">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          </button>
          <button data-uid="${safeId}" onclick="toggleUserStatus(this.getAttribute('data-uid'))" class="p-1.5 rounded-lg ${isStatusActive ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'} transition-colors cursor-pointer" title="${isStatusActive ? 'Bloquear Usuário' : 'Ativar Usuário'}">
            <i data-lucide="${isStatusActive ? 'user-x' : 'user-check'}" class="w-3.5 h-3.5"></i>
          </button>
          ${(u.isSuperAdmin || u.id === 'usr-admin') ? `
            <span class="p-1.5 rounded-lg bg-amber-50 text-amber-600 cursor-not-allowed inline-flex items-center" title="Administrador Principal (Protegido contra exclusão)">
              <i data-lucide="shield-check" class="w-3.5 h-3.5"></i>
            </span>
          ` : `
            <button data-uid="${safeId}" onclick="deleteUser(this.getAttribute('data-uid'))" class="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer ${isCurrentLoggedIn ? 'opacity-40 pointer-events-none' : ''}" title="Excluir Usuário">
              <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
            </button>
          `}
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  updateUsersBatchUI();
  if (window.lucide) window.lucide.createIcons();
}

function getDefaultResponsibilities(role) {
  switch (role) {
    case 'dpo':
      return [
        "Encarregada pelo Tratamento de Dados (Art. 41 LGPD)",
        "Gestão do Inventário RoPA e Atendimento DSAR aos Titulares",
        "Homologação e Auditoria das 52 Semanas de Campanhas ANPD",
        "Validação e Aprovação das Evidências de Conformidade",
        "Ponto Focal com a ANPD e Relatórios de Impacto (RIPD/DPIA)"
      ];
    case 'secops':
      return [
        "Operação do SIEM Wazuh e Resposta a Incidentes CSIRT",
        "Gestão de Ativos de Rede GLPI, Firewalls e VPNs de Canteiro",
        "Rotinas de Backup Imutável Veeam/S3 do Sienge ERP",
        "Bloqueio de Portas USB e GPO de Segurança nos Canteiros",
        "Coleta de Evidências Técnicas e Monitoramento Contínuo"
      ];
    case 'gestor_obra':
      return [
        "Gestão de Segurança Física e Riscos dos Canteiros",
        "Controle das Catracas de Biometria Facial e Descarte pós-Habite-se",
        "Fiscalização do Termo Anti-Repasse de Leads com Corretores",
        "Gestão de Termos de Consentimento e EPIs com Empreiteiras",
        "Upload e Registro de Evidências Operacionais de Canteiro"
      ];
    case 'auditoria':
      return [
        "Inspeção e Verificação Pericial da Trilha Forense SHA-256",
        "Auditoria da Declaração de Aplicabilidade (SoA)",
        "Avaliação e Validação Cruzada de Evidências Documentais",
        "Emissão de Dossiês de Conformidade e Recomendações"
      ];
    case 'diretoria':
      return [
        "Patrocínio Executivo do SGSI e Aprovação da PSI",
        "Assinatura Formal de Aceite de Riscos Críticos",
        "Autorização de Orçamento para o Plano de Ação por Fases"
      ];
    case 'rh_sst':
      return [
        "Gestão de Dados Pessoais de Colaboradores e Prontuários Ocupacionais (NR-18)",
        "Termos de Consentimento e Tratamento de Exames Médicos (PCMSO)",
        "Controle de Acesso de Terceirizados em Canteiros de Obra"
      ];
    default:
      return ["Acesso e operação das rotinas de conformidade do SGSI"];
  }
}

// =========================================================================
// NAVEGAÇÃO ENTRE SUBTABS DA PÁGINA DE USUÁRIOS (SEM POP-UPS)
// =========================================================================

function switchUserSubtab(tab) {
  const viewList = document.getElementById("users-subtab-view-list");
  const viewForm = document.getElementById("users-subtab-view-form");
  const viewMatrix = document.getElementById("users-subtab-view-matrix");
  const btnList = document.getElementById("subtab-user-btn-list");
  const btnForm = document.getElementById("subtab-user-btn-form");
  const btnMatrix = document.getElementById("subtab-user-btn-matrix");

  [viewList, viewForm, viewMatrix].forEach(v => {
    if (v) v.classList.add("hidden");
  });

  const inactiveBtnClass = "px-3.5 py-1.5 text-xs font-medium rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";
  const activeBtnClass = "px-3.5 py-1.5 text-xs font-bold rounded-lg bg-[#004b93] text-white transition-all flex items-center gap-1.5 shadow-xs cursor-pointer whitespace-nowrap";

  if (btnList) btnList.className = inactiveBtnClass;
  if (btnForm) btnForm.className = inactiveBtnClass;
  if (btnMatrix) btnMatrix.className = inactiveBtnClass;

  if (tab === 'form') {
    if (viewForm) viewForm.classList.remove("hidden");
    if (btnForm) btnForm.className = activeBtnClass;
  } else if (tab === 'matrix') {
    if (viewMatrix) viewMatrix.classList.remove("hidden");
    if (btnMatrix) btnMatrix.className = activeBtnClass;
  } else {
    if (viewList) viewList.classList.remove("hidden");
    if (btnList) btnList.className = activeBtnClass;
  }

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }
}

function populateUserLocationDropdown() {
  const sel = document.getElementById("admin-user-page-location");
  if (!sel) return;
  const currentVal = sel.value;
  let obras = [];
  if (typeof getStoredObras === 'function') {
    obras = getStoredObras();
  }
  const matriz = obras.find(o => o.hierarchy === "principal" || o.isHeadquarters) || obras[0] || { name: "Escritório Central (Matriz)" };
  const adjacentes = obras.filter(o => o !== matriz);

  sel.innerHTML = `
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
  if ([...sel.options].some(opt => opt.value === currentVal)) {
    sel.value = currentVal;
  }
}

function onUserRoleChange(newRole) {
  const respEl = document.getElementById("admin-user-page-resp");
  if (respEl) {
    const list = getDefaultResponsibilities(newRole);
    respEl.value = list.join("\n");
  }
}

let editingUserId = null;

// Abrir Cadastro de Usuário na Página Dedicada
function openCreateUserPage() {
  editingUserId = null;
  const form = document.getElementById("form-admin-user-page");
  if (form) form.reset();

  const titleEl = document.getElementById("users-form-page-title");
  if (titleEl) {
    titleEl.innerHTML = `<i data-lucide="user-plus" class="w-4 h-4 text-[#004b93]"></i><span>Cadastrar Novo Usuário no SGSI</span>`;
  }

  const statusEl = document.getElementById("admin-user-page-status");
  if (statusEl) statusEl.value = "Ativo";

  const roleEl = document.getElementById("admin-user-page-role");
  if (roleEl) roleEl.value = "secops";

  populateUserLocationDropdown();
  onUserRoleChange("secops");

  switchUserSubtab('form');
}

// Abrir Edição de Usuário na Página Dedicada
function openEditUserPage(userId) {
  editingUserId = userId;
  const users = getStoredUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return;

  const titleEl = document.getElementById("users-form-page-title");
  if (titleEl) {
    titleEl.innerHTML = `<i data-lucide="user-check" class="w-4 h-4 text-[#004b93]"></i><span>Editar Usuário: ${target.name}</span>`;
  }

  populateUserLocationDropdown();

  const setVal = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  };

  setVal("admin-user-page-name", target.name);
  setVal("admin-user-page-email", target.email);
  setVal("admin-user-page-role", target.role);
  setVal("admin-user-page-dept", target.department);
  setVal("admin-user-page-location", target.location || "Sede Central & Data Center");
  setVal("admin-user-page-pass", "");
  setVal("admin-user-page-status", target.status || "Ativo");
  setVal("admin-user-page-resp", (target.responsibilities || []).join("\n"));

  switchUserSubtab('form');
}

// Submissão do Formulário de Usuário na Página Dedicada
async function handleSaveUserPage(e) {
  if (e && e.preventDefault) e.preventDefault();

  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  };

  const name = getVal("admin-user-page-name");
  const email = getVal("admin-user-page-email").toLowerCase();
  const roleEl = document.getElementById("admin-user-page-role");
  const role = roleEl ? roleEl.value : "secops";
  const dept = getVal("admin-user-page-dept");
  const locEl = document.getElementById("admin-user-page-location");
  const location = locEl ? locEl.value.trim() : "Sede Central & Data Center";
  const pass = getVal("admin-user-page-pass");
  const statusEl = document.getElementById("admin-user-page-status");
  const status = statusEl ? statusEl.value : "Ativo";
  const respText = getVal("admin-user-page-resp");

  if (!name || !email) {
    if (window.showToast) window.showToast("Informe o nome e o e-mail corporativo.", "warning");
    else alert("Informe o nome e o e-mail corporativo.");
    return;
  }

  const responsibilities = respText ? respText.split("\n").map(s => s.trim()).filter(Boolean) : getDefaultResponsibilities(role);

  const roleDef = ROLE_DEFINITIONS[role] || {
    name: "Colaborador SGSI",
    color: "blue"
  };

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("") || "US";

  let users = getStoredUsers();
  let rawUsersForBackend = users.map(u => ({ ...u }));

  if (editingUserId) {
    // Modo Edição
    const idx = users.findIndex(u => u.id === editingUserId);
    if (idx !== -1) {
      const updatedUser = sanitizeClientUser({
        ...users[idx],
        name,
        email,
        role,
        roleName: roleDef.name,
        department: dept,
        location,
        status,
        avatar: initials,
        color: roleDef.color,
        responsibilities
      });
      users[idx] = updatedUser;
      rawUsersForBackend[idx] = pass ? { ...updatedUser, password: pass } : updatedUser;

      // Se editou o usuário logado atualmente, atualiza a sessão
      if (AuthState.currentUser && AuthState.currentUser.id === editingUserId) {
        AuthState.currentUser = users[idx];
        saveStoredSessionUser(users[idx]);
        applyUserSession(users[idx]);
      }

      if (window.showToast) {
        window.showToast(`Usuário ${name} atualizado com sucesso!`, "success");
      }
    }
  } else {
    // Checa duplicidade de email
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      if (window.showToast) window.showToast(`Já existe um usuário cadastrado com o e-mail "${email}".`, "warning");
      else alert(`Já existe um usuário cadastrado com o e-mail "${email}".`);
      return;
    }

    const newId = `usr-${Date.now().toString(36)}`;
    const newUser = sanitizeClientUser({
      id: newId,
      name,
      email,
      role,
      roleName: roleDef.name,
      department: dept,
      location,
      status,
      avatar: initials,
      color: roleDef.color,
      responsibilities
    });

    users.push(newUser);
    rawUsersForBackend.push(pass ? { ...newUser, password: pass } : newUser);

    if (window.showToast) {
      window.showToast(`Usuário ${name} cadastrado no SGSI com perfil ${roleDef.name}!`, "success");
    }

    if (window.ApiService && typeof window.ApiService.addAuditRecord === 'function') {
      const actor = AuthState.currentUser ? AuthState.currentUser.name : "Administrador";
      window.ApiService.addAuditRecord({
        category: "GESTAO_USUARIOS_RBAC",
        severity: "INFO",
        actor: actor,
        description: `Novo usuário criado: ${name} (${email}) com perfil [${roleDef.name}] e lotação [${location}].`,
        target_module: "Controle de Acessos RBAC"
      });
    }
  }

  saveStoredUsers(users, rawUsersForBackend);
  switchUserSubtab('list');
  renderAdminUsersTable();
}

function toggleUserStatus(userId) {
  let users = getStoredUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return;

  target.status = target.status === "Ativo" ? "Inativo" : "Ativo";
  saveStoredUsers(users);
  renderAdminUsersTable();

  if (window.showToast) {
    window.showToast(`Status do usuário ${target.name} alterado para: ${target.status}`, "info");
  }

  if (window.ApiService && typeof window.ApiService.addAuditRecord === 'function') {
    const actor = AuthState.currentUser ? AuthState.currentUser.name : "Administrador";
    window.ApiService.addAuditRecord({
      category: "GESTAO_USUARIOS_RBAC",
      severity: "INFO",
      actor: actor,
      description: `Status do usuário ${target.name} alterado para [${target.status}].`,
      target_module: "Controle de Acessos RBAC"
    });
  }
}

async function deleteUser(userId) {
  const users = getStoredUsers();
  const target = users.find(u => u.id === userId);
  if (!target) return;

  if (target.isSuperAdmin || target.id === 'usr-admin') {
    if (window.showToast) {
      window.showToast("O Administrador Principal não pode ser removido.", "warning");
    }
    return;
  }

  if (AuthState.currentUser && AuthState.currentUser.id === userId) {
    if (window.showToast) {
      window.showToast("Você não pode excluir o usuário conectado atualmente.", "warning");
    }
    return;
  }

  const ok = await (window.showConfirmDialog ? window.showConfirmDialog({
    title: "Excluir Usuário do Sistema",
    message: `Deseja realmente remover o usuário <span class="font-bold text-slate-900">${target.name}</span> (${target.roleName})?`,
    detail: "O acesso deste usuário será revogado de forma imediata e permanente.",
    confirmText: "Sim, Excluir Usuário",
    cancelText: "Cancelar",
    type: "danger"
  }) : Promise.resolve(confirm(`Deseja realmente remover o usuário "${target.name}" (${target.roleName}) do sistema?`)));

  if (!ok) return;

  const remaining = users.filter(u => u.id !== userId);
  selectedUserIds.delete(userId);
  saveStoredUsers(remaining);

  // Exclui permanentemente no backend e PostgreSQL
  try {
    fetch(`/api/users/${encodeURIComponent(userId)}`, { method: "DELETE" }).catch(() => {});
  } catch (_) {}

  updateUsersBatchUI();
  renderAdminUsersTable();

  if (window.showToast) {
    window.showToast(`Usuário ${target.name} removido com sucesso.`, "info");
  }

  if (window.ApiService && typeof window.ApiService.addAuditRecord === 'function') {
    const actor = AuthState.currentUser ? AuthState.currentUser.name : "Administrador";
    window.ApiService.addAuditRecord({
      category: "GESTAO_USUARIOS_RBAC",
      severity: "INFO",
      actor: actor,
      description: `Usuário removido da base: ${target.name} (${target.email}).`,
      target_module: "Controle de Acessos RBAC"
    });
  }
}

// Exposição Global
window.DEFAULT_AC_USERS = DEFAULT_AC_USERS;
window.ROLE_DEFINITIONS = ROLE_DEFINITIONS;
window.AuthState = AuthState;
window.getStoredUsers = getStoredUsers;
window.saveStoredUsers = saveStoredUsers;
window.initAuth = initAuth;
window.loginWithForm = loginWithForm;
window.logout = logout;
window.showLoginModal = showLoginModal;
window.hideLoginModal = hideLoginModal;
window.toggleUserMenuDropdown = toggleUserMenuDropdown;
window.openUserProfileModal = openUserProfileModal;
window.togglePasswordVisibility = togglePasswordVisibility;

// Admin Panel
window.openAdminUsersModal = openAdminUsersModal;
window.renderAdminUsersTable = renderAdminUsersTable;
window.applyAdminUserFilters = applyAdminUserFilters;
window.clearAdminUserFilters = clearAdminUserFilters;
window.switchUserSubtab = switchUserSubtab;
window.openCreateUserPage = openCreateUserPage;
window.openEditUserPage = openEditUserPage;
window.handleSaveUserPage = handleSaveUserPage;
window.toggleUserStatus = toggleUserStatus;
window.deleteUser = deleteUser;
window.onUserRoleChange = onUserRoleChange;
