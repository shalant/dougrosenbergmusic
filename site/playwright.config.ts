import { defineConfig, devices } from '@playwright/test';

// E2E suite runs against a production build (`npm run build` + a static
// preview server), not the dev server - matches what actually ships. See
// docs/todolist.md for why this exists: Lighthouse CI already covers the
// build+audit half of Testing/QA, this covers the "does the interactive
// stuff actually work" half.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4322',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    // `astro preview` self-daemonizes in this Astro version (same as `astro
    // dev`) instead of staying in the foreground, so Playwright sees the
    // command exit immediately and treats it as a startup failure. A plain
    // static server avoids that - matches what serves dist/ in production
    // anyway (Cloudflare Workers static-assets, not astro preview).
    command: 'npx http-server dist -p 4322 -s',
    url: 'http://localhost:4322',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
