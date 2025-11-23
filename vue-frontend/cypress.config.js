import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    setupNodeEvents(on, config) {
      // 实现Node事件监听器
    },
    viewportWidth: 1280,
    viewportHeight: 800,
    // 在失败的测试中自动捕获屏幕截图
    screenshotOnRunFailure: true,
    video: true,
    // 等待所有XHR请求完成
    waitForAnimations: true,
    defaultCommandTimeout: 10000,
  },
});
