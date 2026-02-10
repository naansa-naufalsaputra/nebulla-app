import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react() as any],
    test: {
        include: ['tests/**/*.test.ts'],
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./tests/setup.ts'],
    },
})
