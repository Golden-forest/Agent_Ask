import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Agent Ask',
        short_name: 'AgentAsk',
        description: 'AI 需求澄清助手 - 自带 Key，隐私优先',
        theme_color: '#0d0e10',
        background_color: '#0d0e10',
        display: 'standalone',
        icons: [
          { src: '/Agent_ask_icon.png', sizes: '192x192', type: 'image/png' },
          { src: '/Agent_ask_icon.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // PDF 解析库单独成 chunk，避免与 mammoth 混在一起
          pdfjs: ['pdfjs-dist'],
          mammoth: ['mammoth'],
        }
      }
    },
    // pdfjs worker 本身 ~1.2MB 是库本身的体积，无法再拆分，提高告警阈值避免噪音
    chunkSizeWarningLimit: 1500
  },
  server: {
    host: '0.0.0.0',  // 监听所有网络接口，允许局域网访问
    port: 5173,
    strictPort: false,
  },
})
