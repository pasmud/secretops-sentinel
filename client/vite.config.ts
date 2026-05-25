import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 42000,
    proxy: {
      '/api': 'http://localhost:42001',
    },
  },
});
