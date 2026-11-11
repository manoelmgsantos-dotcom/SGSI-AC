import { spawn } from 'node:child_process';

const apiProcess = spawn(process.execPath, ['--import', 'tsx', 'server/index.ts'], { stdio: 'inherit' });
const viteProcess = spawn(process.execPath, ['node_modules/vite/bin/vite.js', '--port=3000', '--host=0.0.0.0'], { stdio: 'inherit' });

let stopping = false;

function stop(code) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  if (apiProcess.exitCode === null) apiProcess.kill();
  if (viteProcess.exitCode === null) viteProcess.kill();
}

apiProcess.once('error', error => {
  console.warn('⚠️ Não foi possível iniciar o processo da API:', error.message);
});

apiProcess.once('exit', code => {
  if (!stopping && code !== 0) {
    console.warn(`\n⚠️ [CyberGRC] O backend Express/PostgreSQL parou (código ${code}).\nSe o Docker/PostgreSQL ainda não estiver iniciado, você pode usar o Modo de Demonstração no navegador.\nO servidor frontend Vite continuará ativo na porta 3000.\n`);
  }
});

viteProcess.once('error', error => {
  console.error('❌ Falha ao iniciar o servidor Vite:', error);
  stop(1);
});

viteProcess.once('exit', code => {
  if (!stopping) stop(code ?? 1);
});

process.once('SIGINT', () => stop(0));
process.once('SIGTERM', () => stop(0));
