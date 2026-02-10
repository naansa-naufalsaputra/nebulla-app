import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./tests/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/',
                'e2e/',
                '*.config.ts',
                'dist/',
                '**/*.d.ts',
                '**/*.config.*',
                '**/mockData',
                'test-results/',
                'playwright-report/'
            ],
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 70,
                statements: 70
            }
        },
        // Increase timeout for async operations
        testTimeout: 10000,
        hookTimeout: 10000
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './')
        }
    }
});
