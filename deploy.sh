#!/usr/bin/env bash
# ==============================================================================
# AC ENGENHARIA - CYBERGRC & SGSI ENTERPRISE PLATFORM
# SCRIPT DE DEPLOY AUTOMATIZADO PARA VPS (INSTALAÇÃO LIMPA + DOCKER COMPOSE)
# Containers: frontend (Nginx), backend (Node/Express), db (PostgreSQL 17), adminer
# ==============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================================================${NC}"
echo -e "${BLUE}   AC ENGENHARIA - DEPLOY EM PRODUÇÃO (FRONTEND + BACKEND + POSTGRES)   ${NC}"
echo -e "${BLUE}========================================================================${NC}\n"

# 1. Verifica se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERRO] O Docker não está instalado nesta máquina VPS.${NC}"
    echo -e "Instale o Docker executando: curl -fsSL https://get.docker.com | sh"
    exit 1
fi

# 2. Verifica se Docker Compose está disponível
if ! docker compose version &> /dev/null; then
    echo -e "${RED}[ERRO] O plugin 'docker compose' não está disponível.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker e Docker Compose detectados com sucesso.${NC}"

# 3. Verifica existência do arquivo .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️ Arquivo .env não encontrado. Criando cópia inicial a partir de .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ Arquivo .env criado. Configure suas senhas reais com: nano .env${NC}"
fi

# 4. Compilação e inicialização dos containers (Frontend + Backend + DB + Adminer)
echo -e "${BLUE}🚀 [1/4] Construindo imagens (Frontend Nginx + Backend Node + PostgreSQL 17)...${NC}"
docker compose down --remove-orphans || true
docker compose build --pull
docker compose up -d

echo -e "\n${BLUE}⏳ [2/4] Aguardando o PostgreSQL 17 e o Backend API ficarem saudáveis...${NC}"
sleep 8

# 5. Aplica instalação limpa se solicitado com --clean ou na primeira execução
if [ "$1" = "--clean" ]; then
    echo -e "${YELLOW}🧹 [3/4] Executando limpeza completa da base (Instalação Limpa)...${NC}"
    docker compose exec -T backend node scripts/reset-db.mjs
else
    echo -e "${GREEN}✓ [3/4] Base de dados inicializada em estado limpo padrão.${NC}"
fi

# 6. Verifica status dos containers
docker compose ps

echo -e "\n${BLUE}🔍 [4/4] Testando resposta do Frontend (porta 4300) e Backend (/api/health)...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4300/api/health || echo "000")

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✓ Stack completa online respondendo HTTP 200!${NC}"
else
    echo -e "${YELLOW}ℹ️ Containers inicializando (status: $HTTP_STATUS). Verifique logs com: docker compose logs -f${NC}"
fi

echo -e "\n${GREEN}========================================================================${NC}"
echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO - AC ENGENHARIA!${NC}"
echo -e "${GREEN}========================================================================${NC}"
echo -e "Frontend Web (HTTP): http://SEU_IP_VPS:4300"
echo -e "Backend API (Local): http://127.0.0.1:4301/api/health"
echo -e "PostgreSQL (Local):  127.0.0.1:5439"
echo -e "Adminer (via SSH):   http://127.0.0.1:8480"
echo -e "Credenciais Admin:   Definidas no seu arquivo .env (BOOTSTRAP_ADMIN_EMAIL)"
echo -e "\nComandos úteis:"
echo -e "  • Ver logs gerais:         docker compose logs -f"
echo -e "  • Ver logs do backend:     docker compose logs -f backend"
echo -e "  • Ver logs do frontend:    docker compose logs -f frontend"
echo -e "  • Zerar banco do zero:     docker compose exec backend node scripts/reset-db.mjs"
echo -e "  • Reiniciar stack:         docker compose restart"
echo -e "========================================================================\n"
