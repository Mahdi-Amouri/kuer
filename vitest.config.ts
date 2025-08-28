import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    reporters: ['default', 'junit'],
    outputFile: 'test-results/report.xml',
    exclude: [
      'node_modules',
      'dist',
      'src/App.tsx',
      'src/main.tsx',
      'src/hooks',
      'src/vite-env.d.ts',
      'src/contexts/theme.ts',
      'src/components/ThemeToggle.tsx',
    ],
    coverage: {
      exclude: [
        'src/hooks/**',
        'eslint.config.js',
        'vite.config.ts',
        'vitest.config.ts',
        'src/types/**',
        'src/App.tsx',
        'src/main.tsx',
        'src/vite-env.d.ts',
        'src/contexts/theme.ts',
        'src/components/ThemeToggle.tsx',
        'node_modules',
        'dist',
      ]
    }
  },
});