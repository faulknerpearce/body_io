import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'node',
    environmentMatchGlobs: [['**/*.test.tsx', 'jsdom']],
    setupFiles: ['src/__tests__/setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**/*.ts', 'src/components/**/*.tsx', 'src/pages/**/*.tsx'],
      exclude: ['src/lib/supabase.ts', 'src/**/*.test.ts', 'src/**/*.test.tsx'],
    },
  },
})
