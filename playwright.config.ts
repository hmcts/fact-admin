import { defineConfig, devices } from '@playwright/test';
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: 'src/test/functional/playwright',
  testMatch: '**/*.spec.ts',  // Match all files with the .spec.ts extension
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: process.env.CI ? 1 : 4, // Use 1 worker on CI, 4 locally
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    headless: false, // Run tests in visible mode
    viewport: { width: 1280, height: 720 }, // Optional: Set a custom viewport size
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ]
});
