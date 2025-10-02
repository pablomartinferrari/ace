import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    sourcemap: true, // Enable source maps for debugging
    minify: mode === 'development' ? false : 'esbuild', // No minification in dev mode
    rollupOptions: {
      output: {
        manualChunks: mode === 'development' ? undefined : undefined, // Keep all code in one chunk for easier debugging in dev
      }
    }
  },
  // Development-specific settings
  ...(mode === 'development' && {
    define: {
      // Ensure React DevTools work in development
      __REACT_DEVTOOLS_GLOBAL_HOOK__: '({})'
    }
  })
}))
