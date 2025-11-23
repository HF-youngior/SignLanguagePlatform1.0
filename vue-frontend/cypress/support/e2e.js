// ***********************************************************
// 这个文件会在所有测试文件之前加载
// ***********************************************************

// 导入命令.js
import './commands';

// 在每次测试运行之前隐藏XHR请求日志
const app = window.top;
if (!app.document.head.querySelector('[data-hide-command-log-request]')) {
  const style = app.document.createElement('style');
  style.innerHTML =
    '.command-name-request, .command-name-xhr { display: none }';
  style.setAttribute('data-hide-command-log-request', '');
  app.document.head.appendChild(style);
}

// 全局错误处理器
Cypress.on('uncaught:exception', (err, runnable) => {
  // 返回false阻止Cypress因未捕获异常而失败
  return false;
});
