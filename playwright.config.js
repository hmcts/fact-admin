const { defineConfig } = require('@playwright/test');
const path = require('path');

module.exports = defineConfig({
  testDir: path.join(__dirname, 'src', 'test', 'e2e', 'tests'),
  timeout: 30000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 3,
  reporter: 'html',

  use: {
    baseURL: process.env.CI ? process.env.TEST_URL : 'http://localhost:3300',
    trace: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 10000,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        launchOptions: {
          args: ['--disable-dev-shm-usage', '--no-sandbox'],
          headless: true
        }
      },
    },
    {
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
    {
      name: 'webkit',
      use: {
        launchOptions: {
          headless: true
        }
      },
    },
  ],
});
