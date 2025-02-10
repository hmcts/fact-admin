const { test: base, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');

const roleCredentials = {
  admin: {
    username: process.env.OAUTH_USER,
    password: process.env.OAUTH_USER_PASSWORD
  },
  viewer: {
    username: process.env.OAUTH_VIEWER_USER,
    password: process.env.OAUTH_USER_PASSWORD
  },
  superAdmin: {
    username: process.env.OAUTH_SUPER_USER,
    password: process.env.OAUTH_USER_PASSWORD
  },
  noRole: {
    username: process.env.OAUTH_TEST_USER_NO_ROLE,
    password: process.env.OAUTH_USER_PASSWORD
  }
};

exports.test = base.extend({
  adminPage: async ({ page }, use) => {
    await loginWithRole(page, 'admin');
    await use(page);
  },

  viewerPage: async ({ page }, use) => {
    await loginWithRole(page, 'viewer');
    await use(page);
  },

  superAdminPage: async ({ page }, use) => {
    await loginWithRole(page, 'superAdmin');
    await use(page);
  },

  noRolePage: async ({ page }, use) => {
    await loginWithRole(page, 'noRole');
    await use(page);
  }
});

async function loginWithRole(page, role) {
  const loginPage = new LoginPage(page);
  const credentials = roleCredentials[role];

  await loginPage.goto();

  await expect(async () => {
    const onLoginPage = await loginPage.isOnLoginPage();
    expect(onLoginPage).toBeTruthy();
  }).toPass();

  await loginPage.login(credentials.username, credentials.password);

  const baseUrl = process.env.CI ? process.env.TEST_URL : 'localhost:3300';
  await expect(page.url()).not.toContain('idam-web-public.aat.platform.hmcts.net');
  await expect(page.url()).toContain(baseUrl);
}
