import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: './',
  test: {
    environment: 'node',
    include: ['checker/**/*.test.ts', 'src/**/*.test.{ts,tsx}'],
  },
})
