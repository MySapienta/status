import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'
import { defineConfig } from 'vitest/config'

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  'connect-src https://raw.githubusercontent.com',
  "img-src 'self' data:",
  "style-src 'self'",
  "font-src 'self' data:",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ')

function contentSecurityPolicy(): Plugin {
  return {
    name: 'content-security-policy',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          attrs: { 'http-equiv': 'Content-Security-Policy', content: CONTENT_SECURITY_POLICY },
          injectTo: 'head-prepend',
        },
      ]
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), contentSecurityPolicy()],
  test: {
    environment: 'node',
    env: { TZ: 'UTC' },
    include: ['checker/**/*.test.ts', 'src/**/*.test.{ts,tsx}'],
  },
})
