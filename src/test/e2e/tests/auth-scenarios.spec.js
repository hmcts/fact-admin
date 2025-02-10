const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { HomePage } = require('../pages/home-page');

test.describe('Auth Scenarios', () => {
  test('verify correct role permissions - super admin', async ({ superAdminPage }) => {
    const homePage = new HomePage(superAdminPage);
    await expect(homePage.isSuperAdmin()).resolves.toBeTruthy();
    await homePage.logout();
  });

  test('verify correct role permissions - admin', async ({ adminPage }) => {
    const homePage = new HomePage(adminPage);
    await expect(homePage.isAdmin()).resolves.toBeTruthy();
    await homePage.logout();
  });

  test('verify correct role permissions - viewer', async ({ viewerPage }) => {
    const homePage = new HomePage(viewerPage);
    await expect(homePage.isViewer()).resolves.toBeTruthy();
    await homePage.logout();
  });

  test('role switching with proper logout', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.goto();
    await loginPage.login(process.env.OAUTH_USER, process.env.OAUTH_USER_PASSWORD);
    await expect(homePage.isAdmin()).resolves.toBeTruthy();
    await homePage.logout();

    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain('idam-web-public.aat.platform.hmcts.net/login');

    await loginPage.login(process.env.OAUTH_VIEWER_USER, process.env.OAUTH_USER_PASSWORD);
    await expect(homePage.isViewer()).resolves.toBeTruthy();
    await homePage.logout();
  });

  test('parallel sessions maintain correct permissions', async ({ browser }) => {
    const adminContext = await browser.newContext();
    const viewerContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const viewerPage = await viewerContext.newPage();

    const adminLoginPage = new LoginPage(adminPage);
    const viewerLoginPage = new LoginPage(viewerPage);
    const adminHome = new HomePage(adminPage);
    const viewerHome = new HomePage(viewerPage);

    await Promise.all([
      (async () => {
        await adminLoginPage.goto();
        await adminLoginPage.login(process.env.OAUTH_USER, process.env.OAUTH_USER_PASSWORD);
        await expect(adminHome.isAdmin()).resolves.toBeTruthy();
      })(),
      (async () => {
        await viewerLoginPage.goto();
        await viewerLoginPage.login(process.env.OAUTH_VIEWER_USER, process.env.OAUTH_USER_PASSWORD);
        await expect(viewerHome.isViewer()).resolves.toBeTruthy();
      })()
    ]);

    await adminHome.logout();
    await viewerHome.logout();

    await adminContext.close();
    await viewerContext.close();
  });
});
