export const config = {
  TEST_URL: 'https://fact-admin.aat.platform.hmcts.net/',
  TestHeadlessBrowser: false,
  TestSlowMo: 350,
  IDAM_HEALTH_URL: 'https://idam-api.aat.platform.hmcts.net/health',
  IDAM_USER_DASHBOARD_HEALTH_URL: 'https://idam-user-dashboard.aat.platform.hmcts.net/health',
  FRONTEND_URL: process.env.FRONTEND_URL || 'https://fact.aat.platform.hmcts.net'
};
