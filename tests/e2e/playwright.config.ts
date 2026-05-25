import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'http://localhost:42000',
    headless: true,
  },
  webServer: [
    {
      command: 'npm run dev:server',
      cwd: '../..',
      port: 42001,
      timeout: 30000,
      reuseExistingServer: true,
    },
    {
      command: 'npm run dev:client',
      cwd: '../..',
      port: 42000,
      timeout: 30000,
      reuseExistingServer: true,
    },
  ],
});
