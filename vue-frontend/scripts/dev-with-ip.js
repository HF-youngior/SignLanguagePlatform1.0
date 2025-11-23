import { spawn } from 'child_process';
import os from 'os';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 获取本机IP地址
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // 跳过内部（即127.0.0.1）和非IPv4地址
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  
  // 优先返回非169.254.x.x的地址（排除自动配置的链路本地地址）
  const validIP = addresses.find(ip => !ip.startsWith('169.254.')) || addresses[0];
  return validIP || 'localhost';
}

// 获取IP地址
const localIP = getLocalIP();
const port = 3000;

// 显示信息
console.log('\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('🚀 手语教学平台 - 开发服务器启动中...');
console.log('═══════════════════════════════════════════════════════════');
console.log('\n');
console.log('💻 本地访问:');
console.log(`   http://localhost:${port}`);
console.log('\n');
console.log('📱 手机访问（请确保手机和电脑在同一WiFi）:');
console.log(`   http://${localIP}:${port}`);
console.log('\n');
console.log('📋 复制上面的手机访问地址到手机浏览器即可！');
console.log('\n');
console.log('═══════════════════════════════════════════════════════════');
console.log('\n');

// 启动Vite开发服务器
const viteProcess = spawn('npm', ['run', 'vite'], {
  cwd: resolve(__dirname, '..'),
  shell: true,
  stdio: 'inherit'
});

// 处理退出
viteProcess.on('close', (code) => {
  process.exit(code);
});

viteProcess.on('error', (err) => {
  console.error('启动失败:', err);
  process.exit(1);
});

