import { mergeConfig } from 'vite'
import { defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      globals: true,
      environment: 'happy-dom', // ← Mudou aqui
      setupFiles: './src/test/setup.ts',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: ['node_modules', 'dist', 'coverage'],
    }
  })
)