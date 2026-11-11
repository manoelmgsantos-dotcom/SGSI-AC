-- ============================================================================
-- CYBERGRC & SGSI ENTERPRISE PLATFORM - SCHEMA POSTGRESQL (v3.0)
-- Conforme ISO/IEC 27001:2022, LGPD (Lei 13.709/2018) e NR-18 Construção Civil
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. AUTENTICAÇÃO E SESSÃO RBAC
CREATE TABLE IF NOT EXISTS app_users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('gestor_obra', 'secops', 'dpo', 'rh_sst', 'diretoria', 'auditoria', 'executivo', 'auditor')),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. ARMAZENAMENTO DOCUMENTAL ESTRUTURADO DE ALTO DESEMPENHO (JSONB)
CREATE TABLE IF NOT EXISTS grc_records (
  collection TEXT NOT NULL CHECK (
    collection IN (
      'soaControls', 'raciMatrix', 'policies', 'policyLogs', 'risks', 'ropa', 'dsar',
      'thirdParties', 'wazuhAlerts', 'assets', 'incidents', 'auditLogs',
      'evidence', 'roadmapTasks', 'campaigns', 'connectors', 'users', 'obras'
    )
  ),
  record_id TEXT NOT NULL,
  payload JSONB NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (collection, record_id)
);

CREATE INDEX IF NOT EXISTS grc_records_collection_sort_order_idx
  ON grc_records (collection, sort_order);
