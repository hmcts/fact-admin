const { test, logWithColor } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { LoginPage } = require('../pages/login-page');
const { HomePage } = require('../pages/home-page');

test.describe('Auth Scenarios', () => {
  test('verify correct role permissions - super admin', async ({ superAdminPage }, testInfo) => { // Add testInfo
    logWithColor(testInfo, 'Starting test...');
    // Explicitly navigate to the home page *after* the fixture has run.
    await superAdminPage.goto('/', { waitUntil: 'domcontentloaded' });
    const homePage = new HomePage(superAdminPage);
    await expect(homePage.isSuperAdmin()).resolves.toBeTruthy();
    logWithColor(testInfo, 'Verified super admin permissions.');
    await homePage.logout();
    logWithColor(testInfo, 'Logged out.');
  });

  test('verify correct role permissions - admin', async ({ adminPage }, testInfo) => { // Add testInfo
    logWithColor(testInfo, 'Starting test...');
    // Explicitly navigate to the home page *after* the fixture has run.
    await adminPage.goto('/', { waitUntil: 'domcontentloaded' });
    const homePage = new HomePage(adminPage);
    await expect(homePage.isAdmin()).resolves.toBeTruthy();
    logWithColor(testInfo, 'Verified admin permissions.');
    await homePage.logout();
    logWithColor(testInfo, 'Logged out.');
  });

  test('verify correct role permissions - viewer', async ({ viewerPage }, testInfo) => { // Add testInfo
    logWithColor(testInfo, 'Starting test...');
    // Explicitly navigate to the home page *after* the fixture has run.
    await viewerPage.goto('/', { waitUntil: 'domcontentloaded' });
    const homePage = new HomePage(viewerPage);
    await expect(homePage.isViewer()).resolves.toBeTruthy();
    logWithColor(testInfo, 'Verified viewer permissions.');
    await homePage.logout();
    logWithColor(testInfo, 'Logged out.');
  });

  test('role switching with proper logout', async ({ page }, testInfo) => { // Add testInfo
    logWithColor(testInfo, 'Starting test...');
    const loginPage = new LoginPage(page);
    const homePage = new HomePage(page);

    await loginPage.goto();
    logWithColor(testInfo, 'Navigated to login page.');

    await loginPage.login(process.env.OAUTH_USER, process.env.OAUTH_USER_PASSWORD);
    logWithColor(testInfo, 'Logged in as admin.');

    await expect(homePage.isAdmin()).resolves.toBeTruthy();
    logWithColor(testInfo, 'Verified admin permissions.');

    await homePage.logout();
    logWithColor(testInfo, 'Logged out.');

    await page.waitForLoadState('networkidle');
    await expect(page.url()).toContain('idam-web-public.aat.platform.hmcts.net/login');
    logWithColor(testInfo, 'Redirected to login page.');

    await loginPage.login(process.env.OAUTH_VIEWER_USER, process.env.OAUTH_USER_PASSWORD);
    logWithColor(testInfo, 'Logged in as viewer.');

    await expect(homePage.isViewer()).resolves.toBeTruthy();
    logWithColor(testInfo, 'Verified viewer permissions.');

    await homePage.logout();
    logWithColor(testInfo, 'Logged out.');
  });

  test('parallel sessions maintain correct permissions', async ({ browser }, testInfo) => { // Add testInfo
    logWithColor(testInfo, 'Starting test...');
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
        logWithColor(testInfo, 'Admin: Navigated to login page.');

        await adminLoginPage.login(process.env.OAUTH_USER, process.env.OAUTH_USER_PASSWORD);
        logWithColor(testInfo, 'Admin: Logged in.');

        await expect(adminHome.isAdmin()).resolves.toBeTruthy();
        logWithColor(testInfo, 'Admin: Verified admin permissions.');
      })(),
      (async () => {
        await viewerLoginPage.goto();
        logWithColor(testInfo, 'Viewer: Navigated to login page.');

        await viewerLoginPage.login(process.env.OAUTH_VIEWER_USER, process.env.OAUTH_USER_PASSWORD);
        logWithColor(testInfo, 'Viewer: Logged in.');

        await expect(viewerHome.isViewer()).resolves.toBeTruthy();
        logWithColor(testInfo, 'Viewer: Verified viewer permissions.');
      })()
    ]);

    await adminHome.logout();
    logWithColor(testInfo, 'Admin: Logged out.');

    await viewerHome.logout();
    logWithColor(testInfo, 'Viewer: Logged out.');

    await adminContext.close();
    await viewerContext.close();
  });
});
