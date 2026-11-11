import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

let currentChild = null;
let restartTimer = null;

function startTunnel() {
  console.log('\n🌐 [CyberGRC Tunnel] Iniciando túnel seguro Cloudflare...');
  
  const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  currentChild = spawn(cmd, ['cloudflared', 'tunnel', '--url', 'http://127.0.0.1:3000'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  const onData = (data) => {
    const text = data.toString();
    const match = text.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
    if (match) {
      const url = match[0];
      console.log('\n======================================================');
      console.log('✅ SEU LINK PÚBLICO ATIVO:');
      console.log(url);
      console.log('======================================================\n');
      try {
        fs.writeFileSync(path.resolve('current-tunnel-url.txt'), url, 'utf8');
      } catch (_) {}
    }
    if (text.includes('ERR') || text.includes('Unauthorized') || text.includes('Tunnel not found')) {
      console.log('⚠️ Aviso do túnel:', text.trim());
      if (text.includes('Unauthorized') || text.includes('Tunnel not found')) {
        console.log('🔄 Túnel temporário expirou no servidor Cloudflare. Reiniciando automaticamente...');
        try {
          if (process.platform === 'win32') {
            spawn('taskkill', ['/pid', currentChild.pid, '/f', '/t']);
          } else {
            currentChild.kill('SIGKILL');
          }
        } catch (_) {}
      }
    }
  };

  currentChild.stdout.on('data', onData);
  currentChild.stderr.on('data', onData);

  currentChild.on('exit', (code) => {
    console.log(`⚠️ Processo do túnel encerrou (código ${code}). Reiniciando em 5 segundos...`);
    currentChild = null;
    clearTimeout(restartTimer);
    restartTimer = setTimeout(startTunnel, 5000);
  });
}

process.on('SIGINT', () => {
  if (currentChild) currentChild.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  if (currentChild) currentChild.kill();
  process.exit(0);
});

startTunnel();
