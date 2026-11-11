# ==============================================================================
# AC ENGENHARIA - CYBERGRC & SGSI ENTERPRISE PLATFORM
# DOCKERFILE DO BACKEND (Node.js 20 Alpine + Express API + Security Engine)
# ISO/IEC 27001 Security Hardened: Non-Root Execution & Minimal Attack Surface
# ==============================================================================

# ------------------------------------------------------------------------------
# Estágio 1: Build (Compilação do Backend TypeScript e Snapshot Inicial Limpo)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS backend-builder

WORKDIR /app

# Instala dependências de compilação
COPY package.json ./
RUN npm install --legacy-peer-deps --no-audit --no-fund

# Copia código-fonte completo
COPY . .

# Gera snapshot limpo inicial (Zeroed State) e compila o servidor
RUN node scripts/reset-db.mjs && node scripts/build.mjs

# ------------------------------------------------------------------------------
# Estágio 2: Runtime de Produção (Backend API na Porta 4301)
# ------------------------------------------------------------------------------
FROM node:20-alpine AS backend-runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4301

# Criação de usuário e grupo não-root para conformidade ISO 27001
RUN addgroup -S cybergrc && adduser -S cybergrc -G cybergrc

# Instala apenas dependências leves de produção necessárias em tempo de execução
COPY package.json ./
RUN npm install --omit=dev --legacy-peer-deps --no-audit --no-fund && npm cache clean --force

# Copia artefatos compilados e base inicial limpa
COPY --from=backend-builder /app/dist ./dist
COPY --from=backend-builder /app/dist-server ./dist-server
COPY --from=backend-builder /app/server/schema.sql ./server/schema.sql
COPY --from=backend-builder /app/scripts/reset-db.mjs ./scripts/reset-db.mjs
COPY --from=backend-builder /app/server/data ./server/data

# Cria diretório de persistência e ajusta permissões
RUN mkdir -p /app/server/data && chown -R cybergrc:cybergrc /app

USER cybergrc

EXPOSE 4301

# Verificação de integridade da API na porta 4301
HEALTHCHECK --interval=20s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:4301/api/health || exit 1

CMD ["node", "dist-server/index.mjs"]
