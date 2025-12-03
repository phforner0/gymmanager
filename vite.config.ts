import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild', // Mudado de terser para esbuild (mais rápido)
    target: 'es2020', // Target compatível
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'lucide': ['lucide-react'],
          'supabase': ['@supabase/supabase-js']
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
    },
    chunkSizeWarningLimit: 2000, // Aumentado
    cssCodeSplit: true,
    reportCompressedSize: false, // Desabilitar para build mais rápido
    emptyOutDir: true,
  },
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom', 
      'lucide-react', 
      '@supabase/supabase-js'
    ],
    exclude: ['@testing-library/user-event'],
  },
  // Prevenir erros de MIME type
  assetsInclude: ['**/*.woff', '**/*.woff2', '**/*.ttf'],
})