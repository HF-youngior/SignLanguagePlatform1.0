// 端到端测试执行脚本
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'vite';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');
const backendRoot = join(projectRoot, '..', 'backend');

// 颜色日志
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

console.log(`${colors.bright}${colors.cyan}=== 手语平台端到端测试执行脚本 ===${colors.reset}`);

// 启动后端服务
function startBackend() {
  console.log(`${colors.yellow}[后端]${colors.reset} 启动 Node.js 服务器...`);
  
  const backend = spawn('node', ['src/app.js'], { 
    cwd: backendRoot,
    env: { ...process.env, NODE_ENV: 'test' },
    shell: true
  });
  
  backend.stdout.on('data', (data) => {
    console.log(`${colors.yellow}[后端]${colors.reset} ${data}`);
  });
  
  backend.stderr.on('data', (data) => {
    console.error(`${colors.red}[后端错误]${colors.reset} ${data}`);
  });
  
  backend.on('error', (error) => {
    console.error(`${colors.bright}${colors.red}[后端启动失败]${colors.reset} ${error.message}`);
    process.exit(1);
  });
  
  backend.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`${colors.bright}${colors.red}[后端异常退出]${colors.reset} 退出码: ${code}`);
    }
  });
  
  return backend;
}

// 启动前端服务
async function startFrontend() {
  console.log(`${colors.blue}[前端]${colors.reset} 启动 Vue 开发服务器...`);
  
  try {
    const server = await createServer({
      configFile: join(projectRoot, 'vite.config.js'),
      root: projectRoot,
      server: {
        port: 5173
      }
    });
    
    await server.listen();
    
    console.log(`${colors.blue}[前端]${colors.reset} 开发服务器已启动在 ${colors.green}http://localhost:5173${colors.reset}`);
    
    return server;
  } catch (error) {
    console.error(`${colors.bright}${colors.red}[前端启动失败]${colors.reset} ${error.message}`);
    process.exit(1);
  }
}

// 运行 Cypress 测试
function runCypressTests() {
  console.log(`${colors.magenta}[测试]${colors.reset} 启动 Cypress 测试...`);
  
  const cypress = spawn('npx', ['cypress', 'run'], { 
    cwd: projectRoot,
    shell: true,
    stdio: 'inherit'
  });
  
  return new Promise((resolve) => {
    cypress.on('exit', (code) => {
      resolve(code);
    });
  });
}

// 主函数
async function main() {
  // 启动后端
  const backend = startBackend();
  
  // 等待后端启动
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // 启动前端
  const frontend = await startFrontend();
  
  // 等待前端启动
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log(`${colors.bright}${colors.green}=== 所有服务已启动，开始执行测试 ===${colors.reset}`);
  
  try {
    // 运行测试
    const testResult = await runCypressTests();
    
    // 处理测试结果
    if (testResult === 0) {
      console.log(`${colors.bright}${colors.green}=== 测试通过！===${colors.reset}`);
    } else {
      console.error(`${colors.bright}${colors.red}=== 测试失败！退出码: ${testResult} ===${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.bright}${colors.red}=== 测试执行错误 ===${colors.reset}`, error);
  } finally {
    // 关闭服务
    console.log(`${colors.cyan}[清理]${colors.reset} 关闭所有服务...`);
    
    if (frontend) {
      await frontend.close();
    }
    
    if (backend) {
      backend.kill();
    }
    
    console.log(`${colors.cyan}[完成]${colors.reset} 测试流程已完成`);
    process.exit(0);
  }
}

// 处理进程终止信号
process.on('SIGINT', () => {
  console.log(`${colors.cyan}[中断]${colors.reset} 收到中断信号，正在清理...`);
  process.exit(0);
});

// 执行主函数
main().catch((error) => {
  console.error(`${colors.bright}${colors.red}=== 执行过程中发生错误 ===${colors.reset}`, error);
  process.exit(1);
});
