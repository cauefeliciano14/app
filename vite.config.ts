import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          if (id.includes('/rules/calculators/')) {
            return 'rules-calculators';
          }
          if (id.includes('/rules/data/')) {
            return 'rules-data';
          }
          if (id.includes('/rules/')) {
            return 'rules-engine';
          }
        }
      }
    }
  }
})
