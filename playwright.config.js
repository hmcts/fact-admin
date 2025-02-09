// playwright.config.js
const { defineConfig } = require('@playwright/test');
const path = require('path');

// Determine optimal number of workers based on available CPU cores
const CI_WORKERS = process.env.CI_WORKERS || 4; // Can be overridden via env var

module.exports = defineConfig({
  testDir: path.join(__dirname, 'src', 'test', 'e2e', 'tests'),
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,

  // Optimize workers for CI
  workers: process.env.CI ? CI_WORKERS : 3,

  // Group tests to optimize parallel execution
  shard: process.env.CI ? { current: Number(process.env.CI_NODE_INDEX || 1), total: Number(process.env.CI_NODES || 1) } : undefined,

  reporter: [
    ['html'],
    ['list'], // Add list reporter for CI visibility
    // Can add JUnit reporter if needed for Jenkins integration
  ],

  use: {
    baseURL: process.env.CI ? process.env.TEST_URL : 'http://localhost:3300',
    trace: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 10000,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,

    // Add screenshot capture for failures
    screenshot: 'only-on-failure',

    // Optimize browser context
    contextOptions: {
      reducedMotion: 'reduce',
      forcedColors: 'active'
    }
  },

  projects: [
    {
      name: 'chromium',
      testMatch: /.*.spec.js/,
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
            '--disable-breakpad',
            '--disable-component-extensions-with-background-pages',
            '--disable-features=TranslateUI,BlinkGenPropertyTrees',
            '--disable-ipc-flooding-protection',
            '--disable-renderer-backgrounding',
            '--enable-automation',
            '--metrics-recording-only',
            '--mute-audio',
            '--no-first-run',
          ],
          headless: true
        }
      },
    },

    // Only run Firefox/WebKit on specific branches or conditions
    process.env.RUN_ALL_BROWSERS && {
      name: 'firefox',
      testMatch: /.*.spec.js/,
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
      testMatch: /.*.spec.js/,
      use: {
        launchOptions: {
          headless: true
        }
      },
    },
  ].filter(Boolean),

  // Add global setup
  globalSetup: require.resolve('./global-setup'),

  // Optimize test isolation
  preserveOutput: 'failures-only',
});
