import { defineConfig, devices } from '@playwright/test';

// E2E suite runs against a production build (`npm run build` + a static
// preview server), not the dev server - matches what actually ships. See
// docs/todolist.md for why this exists: Lighthouse CI already covers the
// build+audit half of Testing/QA, this covers the "does the interactive
// stuff actually work" half.
//
// The port comes from E2E_PORT (default 4322). Another project's server
// holding 4322 made `reuseExistingServer` quietly test the wrong site
// (2026-10-29); set E2E_PORT=4391 (any free port) to avoid it.
const port = Number(process.env.E2E_PORT ?? 4322);

// Firefox and WebKit projects are opt-in (E2E_ENGINES=all) so the default run
// and CI stay Chromium-only. Run them on a quiet machine with --workers=3:
// three engines in parallel overloads a laptop and produces timeouts that
// pass when run alone (2026-10-30). Playwright's WebKit on Windows ignores
// variable-font weights, so type looks heavy and the buttons look regular
// there; that is the Windows build, not what Safari draws. Check type on a
// real iPhone or Mac.
const otherEngines = process.env.E2E_ENGINES
  ? [
      { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      { name: 'mobile-safari', use: { ...devices['iPhone 14'] } },
    ]
  : [];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${port}`,
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
    ...otherEngines,
  ],
  webServer: {
    // `astro preview` self-daemonizes in this Astro version (same as `astro
    // dev`) instead of staying in the foreground, so Playwright sees the
    // command exit immediately and treats it as a startup failure. A plain
    // static server avoids that - matches what serves dist/ in production
    // anyway (Cloudflare Workers static-assets, not astro preview). `serve`
    // rather than `http-server`: with both /easternblok.html and an
    // /easternblok/ directory (for /easternblok/press), http-server 302s
    // /easternblok to the directory, which has no index, and it 404s.
    command: `npx serve dist -l ${port} --no-request-logging`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
