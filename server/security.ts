import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';
import { sessionSecret } from './config.ts';
import { HttpError, type UserRole } from './http.ts';

// ============================================================================
// 1. TOKEN CRIPTOGRÁFICO ASSINADO (HMAC-SHA256) + SESSÃO SERVER-SIDE
// ============================================================================

export interface AuthTokenPayload {
  id: string | number;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
  jti: string;
}

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 horas (Jornada de trabalho)
const revokedTokenJtis = new Set<string>();

export function issueAuthToken(user: { id: string | number; email: string; role: string }): string {
  const now = Date.now();
  const payload: AuthTokenPayload = {
    id: user.id,
    email: String(user.email).toLowerCase().trim(),
    role: (user.role as UserRole) || 'secops',
    iat: now,
    exp: now + TOKEN_TTL_MS,
    jti: randomBytes(12).toString('hex'),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(encodedPayload).digest('base64url');
  return `${encodedPayload}.${signature}`;
}

export function verifyAuthToken(token: string | undefined | null): AuthTokenPayload | null {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, providedSig] = parts;
  if (!encodedPayload || !providedSig) return null;

  try {
    const expectedSig = createHmac('sha256', sessionSecret).update(encodedPayload).digest('base64url');
    const a = Buffer.from(providedSig, 'utf8');
    const b = Buffer.from(expectedSig, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return null;
    }

    const decoded = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8')) as AuthTokenPayload;
    if (!decoded || typeof decoded !== 'object') return null;
    if (typeof decoded.exp !== 'number' || Date.now() > decoded.exp) return null;
    if (decoded.jti && revokedTokenJtis.has(decoded.jti)) return null;

    return decoded;
  } catch {
    return null;
  }
}

export function revokeAuthToken(token: string | undefined | null): void {
  const parsed = verifyAuthToken(token);
  if (parsed?.jti) {
    revokedTokenJtis.add(parsed.jti);
    if (revokedTokenJtis.size > 5000) {
      const first = revokedTokenJtis.values().next().value;
      if (first) revokedTokenJtis.delete(first);
    }
  }
}

// Extrai o usuário autenticado da sessão HttpOnly ou do cabeçalho assinado X-CyberGRC-Token / Bearer
export function getAuthenticatedUser(request: Request): { id: string | number; email: string; role: UserRole } | null {
  if (request.session?.user) {
    return request.session.user;
  }

  const headerToken =
    request.get('x-cybergrc-token') ||
    (request.get('authorization')?.startsWith('Bearer ')
      ? request.get('authorization')!.slice(7).trim()
      : null);

  const verified = verifyAuthToken(headerToken);
  if (verified) {
    return {
      id: verified.id,
      email: verified.email,
      role: verified.role,
    };
  }
  return null;
}

export function requireAuth(request: Request, _response: Response, next: NextFunction): void {
  const user = getAuthenticatedUser(request);
  if (!user) {
    next(new HttpError(401, 'Não autenticado. Faça login novamente para executar esta operação.'));
    return;
  }
  next();
}

export function requireAdminRole(request: Request, _response: Response, next: NextFunction): void {
  const user = getAuthenticatedUser(request);
  if (!user) {
    next(new HttpError(401, 'Sessão expirada ou não autenticada.'));
    return;
  }
  const adminRoles = new Set(['secops', 'dpo', 'diretoria', 'executivo']);
  const isMasterEmail = user.email.toLowerCase() === 'manoelmgsantos@acengenhariase.com.br';
  if (!adminRoles.has(user.role) && !isMasterEmail) {
    next(new HttpError(403, 'Acesso negado: privilégios insuficientes para esta operação administrativa (ISO 27001 A.5.15).'));
    return;
  }
  next();
}

// ============================================================================
// 2. CABEÇALHOS DE SEGURANÇA HTTP (DEFENSE-IN-DEPTH / OWASP / ISO 27001)
// ============================================================================

export function securityHeadersMiddleware(request: Request, response: Response, next: NextFunction): void {
  // Oculta assinatura tecnológica do servidor
  response.removeHeader('X-Powered-By');

  // Previne MIME-Sniffing
  response.setHeader('X-Content-Type-Options', 'nosniff');

  // Proteção contra Clickjacking (permite apenas iframes da própria origem, como o visualizador A4)
  response.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Política de Referência Segura
  response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Bloqueio de APIs de hardware sensíveis não utilizadas
  response.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=()',
  );

  // Isolamento de janela compatível com Google Identity Services OAuth
  response.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');

  // Content Security Policy (CSP) calibrada para os recursos legítimos da plataforma
  response.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://unpkg.com https://accounts.google.com https://apis.google.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://accounts.google.com",
      "font-src 'self' data: https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://accounts.google.com https://oauth2.googleapis.com https://*.trycloudflare.com ws: wss:",
      "frame-src 'self' blob: data: https://accounts.google.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  );

  // HSTS em conexões HTTPS ou Produção
  if (process.env.NODE_ENV === 'production' || request.secure || request.get('x-forwarded-proto') === 'https') {
    response.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // Evita cache de respostas sensíveis da API
  if (request.path.startsWith('/api/')) {
    response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.setHeader('Pragma', 'no-cache');
    response.setHeader('Expires', '0');
  }

  next();
}

// ============================================================================
// 3. RATE LIMITING & PROTEÇÃO CONTRA FORÇA BRUTA (BRUTE-FORCE GUARD)
// ============================================================================

interface RateBucket {
  count: number;
  resetAt: number;
}

const apiRateBuckets = new Map<string, RateBucket>();
const loginFailureBuckets = new Map<string, { failures: number; lockedUntil: number; lastAttempt: number }>();

function getClientIp(request: Request): string {
  const cfIp = request.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  const xff = request.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return request.ip || request.socket.remoteAddress || 'unknown';
}

export function apiRateLimiter(maxRequestsPerMin = 300) {
  return (request: Request, response: Response, next: NextFunction): void => {
    const ip = getClientIp(request);
    const now = Date.now();
    const windowMs = 60 * 1000;

    let bucket = apiRateBuckets.get(ip);
    if (!bucket || now > bucket.resetAt) {
      bucket = { count: 1, resetAt: now + windowMs };
      apiRateBuckets.set(ip, bucket);
    } else {
      bucket.count += 1;
    }

    // Limpeza periódica para evitar crescimento de memória
    if (apiRateBuckets.size > 5000) {
      for (const [k, v] of apiRateBuckets.entries()) {
        if (now > v.resetAt) apiRateBuckets.delete(k);
      }
    }

    response.setHeader('X-RateLimit-Limit', String(maxRequestsPerMin));
    response.setHeader('X-RateLimit-Remaining', String(Math.max(0, maxRequestsPerMin - bucket.count)));

    if (bucket.count > maxRequestsPerMin) {
      const retryAfterSec = Math.ceil((bucket.resetAt - now) / 1000);
      response.setHeader('Retry-After', String(retryAfterSec));
      next(new HttpError(429, `Limite de requisições excedido. Aguarde ${retryAfterSec} segundos.`));
      return;
    }

    next();
  };
}

const MAX_LOGIN_FAILURES = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos

export function checkLoginBruteForce(request: Request, email: string): void {
  const ip = getClientIp(request);
  const key = `${ip}:${email.toLowerCase().trim()}`;
  const now = Date.now();
  const record = loginFailureBuckets.get(key);

  if (record && record.lockedUntil > now) {
    const remainingMin = Math.ceil((record.lockedUntil - now) / 60000);
    throw new HttpError(
      429,
      `Conta temporariamente protegida contra força bruta após ${MAX_LOGIN_FAILURES} tentativas inválidas. Tente novamente em ${remainingMin} minuto(s).`,
    );
  }
}

export function recordLoginFailure(request: Request, email: string): void {
  const ip = getClientIp(request);
  const key = `${ip}:${email.toLowerCase().trim()}`;
  const now = Date.now();
  const existing = loginFailureBuckets.get(key);

  if (!existing || now - existing.lastAttempt > LOCKOUT_DURATION_MS) {
    loginFailureBuckets.set(key, { failures: 1, lockedUntil: 0, lastAttempt: now });
    return;
  }

  existing.failures += 1;
  existing.lastAttempt = now;
  if (existing.failures >= MAX_LOGIN_FAILURES) {
    existing.lockedUntil = now + LOCKOUT_DURATION_MS;
  }
}

export function clearLoginFailures(request: Request, email: string): void {
  const ip = getClientIp(request);
  const key = `${ip}:${email.toLowerCase().trim()}`;
  loginFailureBuckets.delete(key);
}

// ============================================================================
// 4. SANITIZAÇÃO PROFUNDA CONTRA PROTOTYPE POLLUTION, XSS & VAZAMENTO DE SENHA
// ============================================================================

const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export function sanitizeStringValue(val: string): string {
  // Remove tags <script>, iframes maliciosos, URIs javascript:/data:text/html e handlers inline on*=
  return val
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*script[^>]*>/gi, '')
    .replace(/javascript\s*:/gi, 'blocked-js:')
    .replace(/vbscript\s*:/gi, 'blocked-vbs:')
    .replace(/data\s*:\s*text\/html/gi, 'blocked-data:')
    .replace(/\bon(error|load|click|mouseover|focus|blur|submit|input|change|keydown|keyup)\s*=/gi, 'data-blocked-event=');
}

export function sanitizeDeep<T>(input: T, depth = 0): T {
  if (depth > 12 || input === null || input === undefined) return input;

  if (typeof input === 'string') {
    return sanitizeStringValue(input) as unknown as T;
  }

  if (Array.isArray(input)) {
    return input.map(item => sanitizeDeep(item, depth + 1)) as unknown as T;
  }

  if (typeof input === 'object') {
    const cleanObj: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
      if (DANGEROUS_KEYS.has(key)) continue;
      cleanObj[key] = sanitizeDeep(value, depth + 1);
    }
    return cleanObj as T;
  }

  return input;
}

export function requestSanitizerMiddleware(request: Request, _response: Response, next: NextFunction): void {
  if (request.body && typeof request.body === 'object') {
    request.body = sanitizeDeep(request.body);
  }
  if (request.query && typeof request.query === 'object') {
    for (const key of Object.keys(request.query)) {
      if (DANGEROUS_KEYS.has(key)) {
        delete request.query[key];
      }
    }
  }
  next();
}

// Remove qualquer campo de senha/hash antes de persistir em JSON ou enviar pela rede
export function sanitizeUserRecord(rawUser: unknown): Record<string, unknown> | null {
  if (!rawUser || typeof rawUser !== 'object') return null;
  const clean = sanitizeDeep({ ...(rawUser as Record<string, unknown>) });
  delete clean.password;
  delete clean.password_hash;
  delete clean.rawPassword;
  delete clean.masterPassword;
  return clean;
}

export function sanitizeUsersArray(users: unknown[]): Array<Record<string, unknown>> {
  if (!Array.isArray(users)) return [];
  return users
    .map(u => sanitizeUserRecord(u))
    .filter((u): u is Record<string, unknown> => u !== null);
}

export function sanitizeSnapshotData(snapshot: Record<string, unknown>): Record<string, unknown> {
  const cleaned = sanitizeDeep(snapshot);
  if (Array.isArray(cleaned.users)) {
    cleaned.users = sanitizeUsersArray(cleaned.users);
  }
  return cleaned;
}

// ============================================================================
// 5. VERIFICAÇÃO SERVER-SIDE DE CREDENCIAL GOOGLE OAUTH (JWT ID TOKEN)
// ============================================================================

export async function verifyGoogleCredentialToken(credentialJwt: string): Promise<{
  email: string;
  name: string;
  picture: string | null;
  emailVerified: boolean;
} | null> {
  try {
    const url = `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credentialJwt)}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const data = (await response.json()) as Record<string, unknown>;

    const iss = String(data.iss || '');
    if (iss !== 'accounts.google.com' && iss !== 'https://accounts.google.com') {
      return null;
    }

    const configuredClientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (configuredClientId && data.aud !== configuredClientId) {
      return null;
    }

    const email = String(data.email || '').toLowerCase().trim();
    const emailVerified = data.email_verified === 'true' || data.email_verified === true;
    if (!email || !emailVerified) return null;

    return {
      email,
      name: String(data.name || email.split('@')[0]),
      picture: data.picture ? String(data.picture) : null,
      emailVerified,
    };
  } catch {
    return null;
  }
}
