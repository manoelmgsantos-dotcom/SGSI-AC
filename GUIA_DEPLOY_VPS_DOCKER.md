# 🚀 Guia Oficial de Deploy na VPS com Docker Compose (Instalação Limpa — AC Engenharia)

Este guia detalha o procedimento passo a passo para subir a arquitetura completa de produção da plataforma **CyberGRC & SGSI Enterprise — AC Engenharia** na sua VPS utilizando **Docker Compose**, já com a **instalação 100% limpa (zerada)** pronta para preenchimento do zero.

---

## 🏗️ 1. Arquitetura Multi-Container (`docker-compose.yml`)

A stack foi estruturada em **4 serviços isolados** conectados pela rede interna `cybergrc-enterprise-net`:

| Serviço | Container | Tecnologia | Porta Exposta | Função |
| :--- | :--- | :--- | :--- | :--- |
| **`frontend`** | `cybergrc-frontend` | Nginx 1.27 Alpine + Vite SPA | **`4300:80`** | Serve a interface web estática otimizada com Gzip, cabeçalhos de segurança OWASP e faz Proxy Reverso de `/api/` para o container `backend`. |
| **`backend`** | `cybergrc-backend` | Node.js 20 Alpine + Express | **`127.0.0.1:4301:4301`** (Interno `4301`) | API RESTful, Motor de Segurança HMAC-SHA256, Rate Limiting, Anti-Brute-Force, Google OAuth2 corporativo e sincronização transacional. |
| **`db`** | `cybergrc-postgres` | PostgreSQL 17 Alpine | **`127.0.0.1:5439:5432`** | Banco de dados relacional de produção com volume persistente `cybergrc-postgres-data` e healthcheck automático. |
| **`adminer`** | `cybergrc-adminer` | Adminer Latest | **`127.0.0.1:8480:8080`** | Painel visual para inspeção do banco PostgreSQL (restrito ao localhost/túnel SSH por segurança). |

---

## 🧹 2. O Que Vem na Instalação Limpa (Zeroed State)

Todos os dados fictícios ou de demonstração foram removidos. O sistema sobe **100% zerado**, mantendo exclusivamente a estrutura essencial para você preencher do zero:

- **1 Conta de Administrador Principal** (definida de forma segura no arquivo `.env` da VPS).
- **1 Unidade Matriz Essencial**:
  - `MATRIZ-001` — **Escritório Central (Matriz)** (`Sede Corporativa Central - AC Engenharia`), com `0` efetivo inicial e **0 canteiros fictícios**.
- **Cadastros Operacionais 100% Zerados (`0` registros)**:
  - `0` Riscos Corporativos
  - `0` Operações RoPA / Inventário LGPD
  - `0` Solicitações de Titulares (DSAR)
  - `0` Empreiteiras / Operadores Terceiros (DPA)
  - `0` Alertas SIEM Wazuh
  - `0` Ativos de TI / GLPI
  - `0` Incidentes CSIRT / ANPD
  - `0` Evidências Anexadas
  - `0` Assinaturas Eletrônicas
- **Catálogos Normativos em `0%` (Prontos para Execução)**:
  - **Declaração de Aplicabilidade (SoA ISO 27001):** 11 controles normativos com status `"Não Implementado"` (`0%`).
  - **Plano Priorizado (24 Tarefas Fase 1 a 4):** 24 tarefas estruturais com `completed: false` (`0%` concluído).
  - **Campanhas ANPD (52 Semanas):** 52 temas semanais com `completed: false` (`0%` enviadas).
  - **Conectores de API (Sienge, CV CRM, Catracas, Wazuh, AD/GLPI, MikroTik, TSA):** 7 conectores com status `"Não Configurado"` e sem tokens fictícios.
  - **Biblioteca Oficial de 37 Modelos, Atas e Termos da AC Engenharia:** disponível para geração, preenchimento e assinatura digital SHA-256.

---

## 🛠️ 3. Passo a Passo para Subir na VPS (Ubuntu / Debian)

### Passo 1: Instalar Docker e Docker Compose na VPS
Conecte-se via SSH na sua VPS e execute:
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### Passo 2: Enviar os Arquivos do Projeto para a VPS
Clone seu repositório para `/opt/cybergrc`:
```bash
mkdir -p /opt/cybergrc
git clone https://github.com/manoelmgsantos-dotcom/SGSI-AC.git /opt/cybergrc
cd /opt/cybergrc
```

### Passo 3: Configurar as Variáveis de Ambiente (`.env`)
Copie o arquivo `.env.example` para `.env`:
```bash
cp .env.example .env
nano .env
```
Personalize as variáveis principais no seu `.env`:
```env
NODE_ENV=production
APP_PORT=4300
BACKEND_PORT=4301
POSTGRES_PORT=5439
ADMINER_PORT=8480
POSTGRES_DB=cybergrc
POSTGRES_USER=cybergrc
POSTGRES_PASSWORD=SUA_SENHA_FORTE_DO_BANCO
BOOTSTRAP_ADMIN_EMAIL=seu-email-admin@suaempresa.com.br
BOOTSTRAP_ADMIN_PASSWORD=SUA_SENHA_FORTE_DE_ADMIN
SESSION_SECRET=sua-chave-secreta-forte-aqui-ac-engenharia-2026
GOOGLE_CLIENT_ID=seu-client-id-do-google.apps.googleusercontent.com
APP_DOMAIN=sgsi.suaempresa.com.br
```

### Passo 4: Subir Toda a Stack (Frontend + Backend + PostgreSQL 17)
Você pode usar o script automatizado com a flag `--clean`:
```bash
chmod +x deploy.sh
./deploy.sh --clean
```
Ou diretamente via Docker Compose:
```bash
docker compose up -d --build
```

---

## 🔄 4. Comandos de Manutenção e Reset Limpo na VPS

- **Verificar status dos 4 containers:**
  ```bash
  docker compose ps
  ```
- **Zerar novamente o banco de dados a qualquer momento (Instalação Limpa):**
  ```bash
  docker compose exec backend node scripts/reset-db.mjs
  ```
- **Visualizar logs em tempo real:**
  ```bash
  docker compose logs -f frontend backend db
  ```
- **Fazer backup completo do PostgreSQL 17:**
  ```bash
  docker compose exec db pg_dump -U cybergrc cybergrc > backup_ac_engenharia_$(date +%F).sql
  ```
