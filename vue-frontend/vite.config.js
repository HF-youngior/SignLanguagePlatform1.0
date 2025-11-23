import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    host: '0.0.0.0', // 监听所有网络接口，允许手机访问
    open: true,
    fs: {
      // 允许访问node_modules中的MediaPipe文件
      allow: ['..']
    }
  },
  build: {
    outDir: 'dist'
  },
  optimizeDeps: {
    exclude: ['@mediapipe/hands'] // MediaPipe需要特殊处理，不进行预构建
  }
})
