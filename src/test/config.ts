export const config = {
  TEST_URL: process.env.TEST_URL || 'http://localhost:3300',
  TestHeadlessBrowser: true,
  TestSlowMo: 225,
  IDAM_HEALTH_URL: 'https://idam-api.aat.platform.hmcts.net/health',
  IDAM_USER_DASHBOARD_HEALTH_URL: 'https://idam-user-dashboard.aat.platform.hmcts.net/health',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://fact.aat.platform.hmcts.net'
};
