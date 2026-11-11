import dotenv from 'dotenv';

dotenv.config();

export function requireEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`A variável ${name} é obrigatória.`);
  return value;
}

export const sessionSecret = requireEnvironment('SESSION_SECRET');

if (sessionSecret.startsWith('replace-with-')) {
  throw new Error('Substitua as credenciais de exemplo no arquivo .env.');
}
