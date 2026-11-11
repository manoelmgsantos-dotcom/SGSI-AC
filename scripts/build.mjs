import { execSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import esbuild from 'esbuild';

console.log('🚀 [Build] Iniciando compilação de produção CyberGRC & SGSI...');

// 1. Build do Frontend com Vite
console.log('📦 [1/3] Compilando frontend com Vite...');
execSync('node ./node_modules/vite/bin/vite.js build', { stdio: 'inherit' });

// 2. Cópia dos scripts modulares para dist/
console.log('📂 [2/3] Copiando módulos JavaScript do cliente para dist/...');
const distDir = resolve(process.cwd(), 'dist');
if (!existsSync(distDir)) mkdirSync(distDir, { recursive: true });

const rootFiles = readdirSync(process.cwd());
const jsClientFiles = rootFiles.filter(f => f.endsWith('.js') && !f.includes('config'));

for (const file of jsClientFiles) {
  const src = resolve(process.cwd(), file);
  const dest = resolve(distDir, file);
  copyFileSync(src, dest);
}
console.log(`  -> ${jsClientFiles.length} arquivos JavaScript copiados para dist/.`);

// 3. Build do Backend com esbuild
console.log('⚙️ [3/3] Compilando backend Express/TypeScript com esbuild...');
const distServerDir = resolve(process.cwd(), 'dist-server');
if (!existsSync(distServerDir)) mkdirSync(distServerDir, { recursive: true });

await esbuild.build({
  entryPoints: ['server/index.ts'],
  outfile: 'dist-server/index.mjs',
  bundle: true,
  platform: 'node',
  format: 'esm',
  packages: 'external'
});

console.log('✅ [Build] Compilação de produção finalizada com sucesso!');
