import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Simplified config to avoid Rollup native module issues
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    minify: 'esbuild',
    rollupOptions: {
      // Avoid problematic optimizations
      treeshake: false,
      external: [],
      output: {
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom']
  }
})