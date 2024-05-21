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
  superUsername: process.env.OAUTH_SUPER_USER,
  password: process.env.OAUTH_USER_PASSWORD,
  waitForInitialPage: true,
  userDataDir: './src/test/functional/user_data',
  helpers: {},
};

config.helpers = {
  Playwright: {
    url: config.TEST_URL,
    show: !config.TestHeadlessBrowser,
    browser: 'chromium',
    windowSize: '1300x800',
    timeout: 70000,
    waitForTimeout: 20000,
    waitForAction: 2000,
    waitForNavigation: 'networkidle0',
    ignoreHTTPSErrors: true,
  },
  FactApiHelper: {
    require: './helpers/FactApiHelper.ts',
  }
};
