import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

const hmrHost = process.env.VITE_HMR_HOST || undefined
const hmrProtocol = process.env.VITE_HMR_PROTOCOL || 'ws'
const hmrClientPort = Number(process.env.VITE_HMR_CLIENT_PORT || '3000')
const nodeBackendTarget = process.env.VITE_NODE_API_TARGET || 'http://127.0.0.1:8000'
const pythonBackendTarget = process.env.VITE_PYTHON_API_TARGET || 'http://127.0.0.1:5000'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    open: true,
    https: false,
    allowedHosts: true,
    hmr: hmrHost
      ? {
          host: hmrHost,
          protocol: hmrProtocol,
          clientPort: hmrClientPort,
        }
      : undefined,
    proxy: {
      '/api': {
        target: nodeBackendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: nodeBackendTarget,
        changeOrigin: true,
        secure: false,
        ws: true,
      },
      '/uploads': {
        target: nodeBackendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/public': {
        target: nodeBackendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/images': {
        target: nodeBackendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: nodeBackendTarget,
        changeOrigin: true,
        secure: false,
      },
      '/translation-api': {
        target: pythonBackendTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/translation-api/, '/api'),
      },
    },
    fs: {
      allow: ['..'],
    },
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return

          if (id.includes('element-plus') || id.includes('@element-plus/icons-vue')) {
            return 'vendor-element'
          }

          if (id.includes('vue-chartjs') || id.includes('chart.js')) {
            return 'vendor-chart'
          }

          if (id.includes('@mediapipe/hands')) {
            return 'vendor-mediapipe'
          }

          if (id.includes('vue-router') || id.includes('pinia') || id.includes('/vue/')) {
            return 'vendor-vue'
          }
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['@mediapipe/hands'],
  },
})
