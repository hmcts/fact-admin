const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { HomePage } = require('../pages/home-page');

test.describe('Auth Scenarios', () => {
  test('verify correct role permissions - super admin', async ({ superAdminPage }) => {
    console.log(`[${test.info().title}] Starting test...`);
    const homePage = new HomePage(superAdminPage);
    await expect(homePage.isSuperAdmin()).resolves.toBeTruthy();
    console.log(`[${test.info().title}] Verified super admin permissions.`);
    await homePage.logout();
    console.log(`[${test.info().title}] Logged out.`);
  });

  test('verify correct role permissions - admin', async ({ adminPage }) => {
    console.log(`[${test.info().title}] Starting test...`);
    const homePage = new HomePage(adminPage);
    await expect(homePage.isAdmin()).resolves.toBeTruthy();
    console.log(`[${test.info().title}] Verified admin permissions.`);
    await homePage.logout();
    console.log(`[${test.info().title}] Logged out.`);
  });

  test('verify correct role permissions - viewer', async ({ viewerPage }) => {
    console.log(`[${test.info().title}] Starting test...`);
    const homePage = new HomePage(viewerPage);
    await expect(homePage.isViewer()).resolves.toBeTruthy();
    console.log(`[${test.info().title}] Verified viewer permissions.`);
    await homePage.logout();
    console.log(`[${test.info().title}] Logged out.`);
  });

  test('role switching with proper logout', async ({ page }) => {
    console.log(`[${test.info().title}] Starting test...`);
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.goto();
    console.log(`[${test.info().title}] Navigated to login page.`);

    await loginPage.login(process.env.OAUTH_USER, process.env.OAUTH_USER_PASSWORD);
    console.log(`[${test.info().title}] Logged in as admin.`);

    await expect(homePage.isAdmin()).resolves.toBeTruthy();
    console.log(`[${test.info().title}] Verified admin permissions.`);

    await homePage.logout();
    console.log(`[${test.info().title}] Logged out.`);

    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain('idam-web-public.aat.platform.hmcts.net/login');
    console.log(`[${test.info().title}] Redirected to login page.`);

    await loginPage.login(process.env.OAUTH_VIEWER_USER, process.env.OAUTH_USER_PASSWORD);
    console.log(`[${test.info().title}] Logged in as viewer.`);

    await expect(homePage.isViewer()).resolves.toBeTruthy();
    console.log(`[${test.info().title}] Verified viewer permissions.`);

    await homePage.logout();
    console.log(`[${test.info().title}] Logged out.`);
  });

  test('parallel sessions maintain correct permissions', async ({ browser }) => {
    console.log(`[${test.info().title}] Starting test...`);
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
        console.log(`[${test.info().title}] Admin: Navigated to login page.`);

        await adminLoginPage.login(process.env.OAUTH_USER, process.env.OAUTH_USER_PASSWORD);
        console.log(`[${test.info().title}] Admin: Logged in.`);

        await expect(adminHome.isAdmin()).resolves.toBeTruthy();
        console.log(`[${test.info().title}] Admin: Verified admin permissions.`);
      })(),
      (async () => {
        await viewerLoginPage.goto();
        console.log(`[${test.info().title}] Viewer: Navigated to login page.`);

        await viewerLoginPage.login(process.env.OAUTH_VIEWER_USER, process.env.OAUTH_USER_PASSWORD);
        console.log(`[${test.info().title}] Viewer: Logged in.`);

        await expect(viewerHome.isViewer()).resolves.toBeTruthy();
        console.log(`[${test.info().title}] Viewer: Verified viewer permissions.`);
      })()
    ]);

    await adminHome.logout();
    console.log(`[${test.info().title}] Admin: Logged out.`);

    await viewerHome.logout();
    console.log(`[${test.info().title}] Viewer: Logged out.`);

    await adminContext.close();
    await viewerContext.close();
  });
});
