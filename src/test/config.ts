import path from 'path';
import process from 'process';

process.on('unhandledRejection', reason => {
  throw reason;
});


export const config = {
  TEST_URL: process.env.TEST_URL || 'http://localhost:3300',
  TestHeadlessBrowser: process.env.TEST_HEADLESS ? process.env.TEST_HEADLESS === 'true' : true,
  TestSlowMo: 420,
  IDAM_HEALTH_URL: 'https://idam-api.aat.platform.hmcts.net/health',
  IDAM_USER_DASHBOARD_HEALTH_URL: 'https://idam-user-dashboard.aat.platform.hmcts.net/health',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://fact.aat.platform.hmcts.net',
  // TODO: FaCT API should really be hosted at 'https://fact-api.aat.platform.hmcts.net', update this when API is migrated
  API_URL:  process.env.API_URL || 'http://fact-api-aat.service.core-compute-aat.internal',
  username: process.env.OAUTH_USER,
  viewerUsername: process.env.OAUTH_VIEWER_USER,
  SUPER_ADMIN_USERNAME: process.env.OAUTH_SUPER_USER,
  TEST_PASSWORD: process.env.OAUTH_USER_PASSWORD,
  TestFunctionalOutputPath: path.join(process.cwd(), 'functional-output'),
  helpers: {},
  WaitForTimeout: 20000,
  plugins: {
    allure: {
      enabled: true,
      require: '@codeceptjs/allure-legacy',
    },
    retryFailedStep: {
      enabled: true,
    },
    tryTo: {
      enabled: true,
    },
    screenshotOnFail: {
      enabled: true,
      fullPageScreenshots: true,
    },
  }
};

config.helpers = {
  Playwright: {
    url: config.TEST_URL,
    show: !config.TestHeadlessBrowser,
    browser: 'chromium',
    waitForTimeout: config.WaitForTimeout,
    waitForAction: 1000,
    waitForNavigation: 'domcontentloaded',
    ignoreHTTPSErrors: true,
  },
  FileSystem: {},
};
