import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    include: ['kmm-subscription', '@js-joda/core'],
  },
  resolve: {
    alias: {
      // Ensure @js-joda/core resolves from app's node_modules
      // when imported by the linked KMM module
      '@js-joda/core': path.resolve(__dirname, 'node_modules/@js-joda/core'),
    },
  },
})
