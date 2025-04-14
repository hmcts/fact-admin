// src/test/e2e/tests/bulk-update.spec.js
/**
 * @file Super Admin Bulk Update Functionality Tests
 * @description This spec file tests the bulk update feature available to Super Admins.
 * Key Dependencies/Assumptions:
 * - Tests use the 'superAdminPage' fixture for authentication, requiring super admin credentials.
 * - Tests run serially (`test.describe.serial`) because they interact with and verify the same bulk update
 *   feature, although they update different courts. This prevents potential race conditions if parallel updates
 *   were attempted, though the current tests target different court sets (open vs closed).
 * - Relies on specific court data existing:
 *   - Closed: 'aberdare-county-court', 'aberdare-magistrates-court'
 *   - Open: 'aberdeen-tribunal-hearing-centre', 'aberystwyth-justice-centre'
 *   If these courts are removed or their slugs change, the tests will need updating.
 * - Uses `HomePage` and `BulkUpdatePage` Page Object Models for interactions.
 * - Core actions mimic the Gherkin feature: navigate to bulk update, toggle 'include closed' checkbox,
 *   fill the rich text editor, select specific courts, click update, and verify success.
 * - These tests modify the 'Additional Information' field for the specified courts. In a persistent
 *   test environment, consider adding cleanup steps (e.g., in `afterEach` or `afterAll`) to reset this data,
 *   potentially via an API call if available. Currently, unique timestamps are added to the text to differentiate test runs.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { HomePage } = require('../pages/home-page');
const { BulkUpdatePage } = require('../pages/bulk-update-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup'); // Re-added logWithColor

// Use serial mode as bulk updates modify shared state (even if currently targeting different courts)
test.describe.serial('Super Admin Bulk Update Functionality', () => {
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';
  let homePage;
  let bulkUpdatePage;

  // Runs before each test. Navigates, potentially re-logs in, goes to the bulk update page.
  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Setting up for: ${testInfo.title}`); // Re-added
    homePage = new HomePage(superAdminPage);
    bulkUpdatePage = new BulkUpdatePage(superAdminPage);

    // --- Navigation and Re-login ---
    await logWithColor(testInfo, `Attempting navigation to application root: ${baseUrl}/`); // Re-added
    await superAdminPage.goto('/', { waitUntil: 'domcontentloaded' });

    if (superAdminPage.url().includes('idam-web-public')) {
      await logWithColor(testInfo, 'Redirected to login page. Session likely invalid. Re-authenticating...'); // Re-added
      const loginPage = new LoginPage(superAdminPage);
      const username = process.env.OAUTH_SUPER_USER;
      const password = process.env.OAUTH_USER_PASSWORD;
      if (!username || !password) {
        throw new Error('Super admin credentials not found in environment variables for re-login.');
      }
      await expect(superAdminPage).toHaveURL(/.*idam-web-public.*/);
      await loginPage.login(username, password);
      await logWithColor(testInfo, 'Login submitted. Waiting for redirect back to app...'); // Re-added

      const appHostRegex = new RegExp(`^${baseUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`);
      try {
        await superAdminPage.waitForURL(appHostRegex, { timeout: 15000, waitUntil: 'load' });
      } catch (e) {
        await logWithColor(testInfo, `Timeout waiting for redirect back to app host after re-login. Current URL: ${superAdminPage.url()}`); // Re-added
        const errorLocator = superAdminPage.locator('.error-summary');
        if (await errorLocator.isVisible({ timeout: 1000 })) {
          const errorMessage = await errorLocator.textContent();
          throw new Error(`Re-login seemed to fail: ${errorMessage}`);
        }
        throw e;
      }
      await logWithColor(testInfo, 'Redirected back to app. Current URL: ' + superAdminPage.url()); // Re-added
      if (!superAdminPage.url().endsWith(baseUrl + '/')) {
        await logWithColor(testInfo, `Redirected to ${superAdminPage.url()}, navigating to root...`); // Re-added
        await superAdminPage.goto('/', { waitUntil: 'domcontentloaded' });
      }
    } else {
      await logWithColor(testInfo, 'Direct navigation to root successful. Session appears valid.'); // Re-added
    }
    // --- End Conditional Re-login Logic ---

    // Verify we are on the home page
    await expect(superAdminPage).toHaveTitle(/Courts and tribunals/);
    await expect(homePage.page.locator(homePage.bulkUpdateLink)).toBeVisible();
    await logWithColor(testInfo, 'Successfully on Admin Portal homepage.'); // Re-added

    // Navigate to Bulk Update page
    await logWithColor(testInfo, 'Clicking Bulk Update link...'); // Re-added
    await homePage.clickBulkUpdate();
    await logWithColor(testInfo, 'Navigation to Bulk Update page complete.'); // Re-added

    // Wait for Bulk Update page to load fully
    await bulkUpdatePage.waitForPageLoad();
    await logWithColor(testInfo, 'Bulk Update page loaded.'); // Re-added
  });

  test('Edit information for closed courts', async ({ superAdminPage }, testInfo) => {
    const closedCourt1Slug = 'aberdare-county-court';
    const closedCourt2Slug = 'aberdare-magistrates-court';
    const infoText = `Test bulk update for CLOSED courts - ${new Date().toISOString()}`;

    await logWithColor(testInfo, 'Starting bulk update for closed courts test...'); // Re-added

    // 1. Check include closed checkbox
    await bulkUpdatePage.setIncludeClosedCourts(true);
    await logWithColor(testInfo, 'Ensured "Include closed courts" checkbox is checked.'); // Re-added

    // 2. Add information
    await bulkUpdatePage.fillInformation(infoText);
    await logWithColor(testInfo, `Filled information: "${infoText}"`); // Re-added

    // 3. Select closed courts (ensure they are visible after checking the box)
    await bulkUpdatePage.selectCourtBySlug(closedCourt1Slug);
    await logWithColor(testInfo, `Selected court: ${closedCourt1Slug}`); // Re-added
    await bulkUpdatePage.selectCourtBySlug(closedCourt2Slug);
    await logWithColor(testInfo, `Selected court: ${closedCourt2Slug}`); // Re-added

    // 4. Click update button
    await bulkUpdatePage.clickUpdate();
    await logWithColor(testInfo, 'Clicked update button.'); // Re-added

    // 5. Verify success message
    await bulkUpdatePage.waitForSuccessMessage('Court information updated');
    await logWithColor(testInfo, 'Verified success message.'); // Re-added
    await expect(superAdminPage.locator(bulkUpdatePage.pageTitle)).toBeVisible();

    await logWithColor(testInfo, 'Bulk update for closed courts test finished successfully.'); // Re-added
  });

  test('Edit information for open courts', async ({ superAdminPage }, testInfo) => {
    const openCourt1Slug = 'aberdeen-tribunal-hearing-centre';
    const openCourt2Slug = 'aberystwyth-justice-centre';
    const infoText = `Test bulk update for OPEN courts - ${new Date().toISOString()}`;

    await logWithColor(testInfo, 'Starting bulk update for open courts test...'); // Re-added

    // 1. Ensure include closed checkbox is NOT checked
    await bulkUpdatePage.setIncludeClosedCourts(false);
    await logWithColor(testInfo, 'Ensured "Include closed courts" checkbox is unchecked.'); // Re-added

    // 2. Add information
    await bulkUpdatePage.fillInformation(infoText);
    await logWithColor(testInfo, `Filled information: "${infoText}"`); // Re-added

    // 3. Select open courts (should be visible by default)
    await bulkUpdatePage.selectCourtBySlug(openCourt1Slug);
    await logWithColor(testInfo, `Selected court: ${openCourt1Slug}`); // Re-added
    await bulkUpdatePage.selectCourtBySlug(openCourt2Slug);
    await logWithColor(testInfo, `Selected court: ${openCourt2Slug}`); // Re-added

    // 4. Click update button
    await bulkUpdatePage.clickUpdate();
    await logWithColor(testInfo, 'Clicked update button.'); // Re-added

    // 5. Verify success message
    await bulkUpdatePage.waitForSuccessMessage('Court information updated');
    await logWithColor(testInfo, 'Verified success message.'); // Re-added
    await expect(superAdminPage.locator(bulkUpdatePage.pageTitle)).toBeVisible();

    await logWithColor(testInfo, 'Bulk update for open courts test finished successfully.'); // Re-added
  });
});
