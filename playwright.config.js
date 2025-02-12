const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: path.join(__dirname, 'src', 'test', 'e2e', 'tests'),
  timeout: 60000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  globalTeardown: require.resolve('./src/test/e2e/global-teardown.js'),
  // Increase workers in CI - adjust based on your Jenkins node capacity
  workers: process.env.CI ? 4 : 3,

  reporter: [
    ['html'],
    ['list'], // Added for better CI console output
  ],

  use: {
    baseURL: process.env.CI ? process.env.TEST_URL : 'http://localhost:3300',
    trace: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 15000,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Add screenshot capture for failures
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        launchOptions: {
          args: [
            '--disable-dev-shm-usage',
            '--no-sandbox',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-networking',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--enable-automation',
            '--no-first-run',
          ],
          headless: true
        }
      },
    },

    // Only run Firefox/WebKit when specifically requested
    process.env.RUN_ALL_BROWSERS && {
      name: 'firefox',
      use: {
        launchOptions: {
          firefoxUserPrefs: {
            'network.http.max-connections': 200,
            'network.http.max-persistent-connections-per-server': 20
          },
          headless: true
        }
      },
    },

    process.env.RUN_ALL_BROWSERS && {
      name: 'webkit',
      use: {
        launchOptions: {
          headless: true
        }
      },
    },
  ].filter(Boolean),
});
