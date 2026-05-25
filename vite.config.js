import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return
          }

          if (id.includes('firebase')) {
            return 'firebase'
          }

          if (id.includes('framer-motion')) {
            return 'motion'
          }

          if (
            id.includes('react-router-dom') ||
            id.includes('@remix-run/router')
          ) {
            return 'router'
          }

          if (id.includes('lucide-react')) {
            return 'icons'
          }

          if (
            id.includes('react') ||
            id.includes('scheduler')
          ) {
            return 'react-vendor'
          }

          return 'vendor'
        },
      },
    },
  },
})
