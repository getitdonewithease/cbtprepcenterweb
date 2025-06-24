import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    trace: 'on', // Always record trace, even on success
    screenshot: 'only-on-failure', // Optional: save screenshot if something fails
    baseURL: 'http://localhost:5173',
  },
});
