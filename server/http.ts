import type { NextFunction, Request, Response } from 'express';

export type UserRole =
  | 'gestor_obra'
  | 'secops'
  | 'dpo'
  | 'rh_sst'
  | 'comercial'
  | 'suprimentos'
  | 'diretoria'
  | 'auditoria'
  | 'executivo'
  | 'auditor';

declare module 'express-session' {
  interface SessionData {
    user?: { id: number; email: string; role: UserRole };
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export function asyncRoute(
  handler: (request: Request, response: Response) => Promise<void>,
) {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response).catch(next);
  };
}

export function requireSameOrigin(request: Request, _response: Response, next: NextFunction) {
  const origin = request.get('origin');
  if (!origin) {
    next();
    return;
  }
  let validOrigin = false;
  try {
    const parsed = new URL(origin);
    const directHost = request.get('host') || '';
    const forwardedHost = (request.get('x-forwarded-host') || '').split(',')[0]?.trim() || '';
    const isPrivateLanIp =
      /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(parsed.hostname) ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(parsed.hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(parsed.hostname);

    validOrigin =
      parsed.origin === `${request.protocol}://${directHost}` ||
      (Boolean(forwardedHost) && parsed.host === forwardedHost) ||
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      isPrivateLanIp ||
      parsed.hostname.endsWith('.trycloudflare.com');
  } catch {
    validOrigin = false;
  }
  if (!validOrigin) {
    next(new HttpError(403, 'Origem da solicitação inválida.'));
    return;
  }
  next();
}
