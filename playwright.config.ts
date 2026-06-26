import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for LinkSnip e2e tests.
 *
 * Health-check note: GET / returns 404 until the ui phase wires it.
 * We point the webServer url check at GET /api/links (always 200)
 * so the server can start up and the tests can RUN and then FAIL on
 * their own assertions.
 */
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
    actionTimeout: 5_000,
    navigationTimeout: 5_000,
  },
  timeout: 10_000,
  webServer: {
    command: 'tsx src/server.ts',
    url: 'http://localhost:3100/api/links',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      PORT: '3100',
      DATABASE_PATH: ':memory:',
    },
  },
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'tablet',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
      },
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
});
