export const config = {
  TEST_URL: process.env.TEST_URL || 'http://localhost:3300',
  TestHeadlessBrowser: false,
  TestSlowMo: 420,
  WaitForTimeout: 10000,
  IDAM_HEALTH_URL: 'https://idam-api.aat.platform.hmcts.net/health',
  IDAM_USER_DASHBOARD_HEALTH_URL: 'https://idam-user-dashboard.aat.platform.hmcts.net/health',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://fact.aat.platform.hmcts.net',
  username: process.env.OAUTH_USER,
  viewerUsername: process.env.OAUTH_VIEWER_USER,
  superUsername: process.env.OAUTH_SUPER_USER,
  password: process.env.OAUTH_USER_PASSWORD,
  waitForInitialPage: true,
  userDataDir: './src/test/functional/user_data',
  Gherkin: {
    features: './codecept-features/super_admin/opening-hours.feature',
    steps: './codecept-steps/**/*.ts',
  },
  helpers: {},
};

config.helpers = {
  Playwright: {
    url: config.TEST_URL,
    show: !config.TestHeadlessBrowser,
    browser: 'chromium',
    windowSize: '1300x800',
    waitForTimeout: config.WaitForTimeout,
    waitForAction: 1000,
    waitForNavigation: 'networkidle0',
    ignoreHTTPSErrors: true,
  }


};
