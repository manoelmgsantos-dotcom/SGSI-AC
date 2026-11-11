# 🛡️ CyberGRC & SGSI Enterprise Platform — AC Engenharia

Plataforma corporativa integrada de **Governança, Riscos, Conformidade (GRC), Privacidade (LGPD) e Segurança da Informação (SGSI ISO/IEC 27001 & ISO/IEC 27701)** desenvolvida sob medida para a **AC Engenharia**.

---

## 🏗️ Arquitetura de Produção (Docker Compose)

A aplicação é distribuída em **4 containers isolados** prontos para implantação em VPS:

- **`frontend` (`cybergrc-frontend`)**: Servidor **Nginx 1.27 Alpine** servindo a SPA compilada com Vite, compressão Gzip, cabeçalhos de segurança OWASP e Proxy Reverso `/api/` para o backend.
- **`backend` (`cybergrc-backend`)**: API RESTful em **Node.js 20 Alpine + Express**, com motor criptográfico HMAC-SHA256, proteção Anti-Brute-Force, Rate Limiting, sanitização anti-XSS/Prototype Pollution e autenticação restrita ao Google Workspace (`@acengenhariase.com.br`) mediante convite prévio.
- **`db` (`cybergrc-postgres`)**: Banco de dados **PostgreSQL 17 Alpine** com volume persistente e healthcheck automático.
- **`adminer` (`cybergrc-adminer`)**: Interface de gerenciamento do banco restrita ao `127.0.0.1:8080` (acesso via túnel SSH).

---

## 🧹 Instalação Limpa (Zeroed State)

O repositório já está configurado para subir **100% zerado (sem dados fictícios)**, contendo exclusivamente a estrutura essencial para preenchimento do zero:
- **1 Administrador Principal** (`manoelmgsantos@acengenhariase.com.br`)
- **1 Unidade Matriz** (`MATRIZ-001` — Escritório Central - AC Engenharia)
- **0** Riscos, **0** RoPA, **0** DSAR, **0** Terceiros/DPAs, **0** Alertas SIEM, **0** Ativos, **0** Incidentes, **0** Evidências
- **Catálogos Normativos em `0%`**: 11 Controles ISO 27001 (`Não Implementado`), 24 Tarefas do Plano Priorizado (`0%`), 52 Campanhas Semanais ANPD (`0%`) e **37 Modelos, Atas e Termos Oficiais da AC Engenharia** com motor de assinatura digital SHA-256.

---

## 🚀 Como Subir na VPS com Docker Compose

```bash
# 1. Clone este repositório na sua VPS
git clone <URL_DO_SEU_REPOSITORIO_GITHUB> /opt/cybergrc
cd /opt/cybergrc

# 2. Crie e configure o arquivo .env de produção
cp .env.example .env
nano .env

# 3. Suba toda a stack (Frontend + Backend + PostgreSQL 17) em modo limpo
chmod +x deploy.sh
./deploy.sh --clean
```

Para instruções detalhadas de deploy, backup e manutenção na VPS, consulte o [Guia Oficial de Deploy VPS Docker](GUIA_DEPLOY_VPS_DOCKER.md).
