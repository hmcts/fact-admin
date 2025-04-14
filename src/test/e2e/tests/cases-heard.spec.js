// src/test/e2e/tests/cases-heard.spec.js
/**
 * @file Super Admin Cases Heard Functionality Tests
 * @description This spec tests the functionality of selecting, saving, and verifying Areas of Law
 *              within the 'Cases Heard' tab for a specific court.
 * Key Dependencies/Assumptions:
 * - Test uses the 'superAdminPage' fixture for authentication, requiring super admin credentials.
 * - Tests run serially (`test.describe.serial`) because they modify the 'Cases Heard' state for the
 *   *same court* (`basingstoke-county-court-and-family-court`) sequentially.
 * - Relies on the specific court `basingstoke-county-court-and-family-court` existing.
 * - Uses `CasesHeardPage` Page Object Model for interactions.
 * - `beforeEach` performs cleanup: it navigates to the correct tab and calls `unselectAllAreasAndSave`
 *   to ensure all Areas of Law are unselected before each test run, making tests idempotent.
 * - Verification relies on checking checkbox states (`isChecked()`) after saves and page reloads.
 * - Explicit waits (`waitForUpdateResponse`) are used for save operations for reliability.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { CasesHeardPage } = require('../pages/cases-heard-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

// Use serial mode because the test modifies the state (selected areas of law) for a specific court.
test.describe.serial('Super Admin Cases Heard Functionality', () => {
  const courtSlug = 'basingstoke-county-court-and-family-court';
  const courtName = 'Basingstoke County Court and Family Court';
  const editUrl = `/courts/${courtSlug}/edit`;
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';

  // Example areas of law from the Gherkin file
  const areaOfLaw1 = 'bankruptcy';
  const areaOfLaw2 = 'domestic-violence';
  const successMessage = 'Cases heard updated';

  let casesHeardPage; // Define page object variable in the scope

  // Runs before each test. Navigates, potentially re-logs in, goes to the court page, clicks tab, cleans up.
  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    casesHeardPage = new CasesHeardPage(superAdminPage);

    // --- Navigation and Re-login ---
    await logWithColor(testInfo, `Attempting navigation to: ${editUrl}`);
    await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });

    if (superAdminPage.url().includes('idam-web-public')) {
      await logWithColor(testInfo, 'Redirected to login page. Session likely invalid. Re-authenticating...');
      const loginPage = new LoginPage(superAdminPage);
      const username = process.env.OAUTH_SUPER_USER;
      const password = process.env.OAUTH_USER_PASSWORD;
      if (!username || !password) {
        throw new Error('Super admin credentials not found in environment variables for re-login.');
      }
      await expect(superAdminPage).toHaveURL(/.*idam-web-public.*/);
      await loginPage.login(username, password);
      await logWithColor(testInfo, 'Login submitted. Waiting for redirect back to app...');

      const appHostRegex = new RegExp(`^${baseUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`);
      try {
        await superAdminPage.waitForURL(appHostRegex, { timeout: 15000, waitUntil: 'load' });
      } catch (e) {
        await logWithColor(testInfo, `Timeout waiting for redirect back to app host after re-login. Current URL: ${superAdminPage.url()}`);
        const errorLocator = superAdminPage.locator('.error-summary');
        if (await errorLocator.isVisible({ timeout: 1000 })) {
          const errorMessage = await errorLocator.textContent();
          throw new Error(`Re-login seemed to fail: ${errorMessage}`);
        }
        throw e;
      }
      await logWithColor(testInfo, 'Redirected back to app. Current URL: ' + superAdminPage.url());

      if (!superAdminPage.url().endsWith(editUrl)) {
        await logWithColor(testInfo, `Navigating again to target: ${editUrl}`);
        await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });
      }
    } else {
      await logWithColor(testInfo, 'Direct navigation successful. Session appears valid.');
    }
    // --- End Conditional Re-login Logic ---

    // Verify we are on the correct edit page
    await expect(superAdminPage.locator('#Main.fact-tabs')).toBeVisible({ timeout: 10000 });
    await expect(superAdminPage).toHaveURL(new RegExp(`.*${editUrl}$`));
    await expect(superAdminPage.locator(`h1:has-text("${courtName}")`)).toBeVisible();
    await logWithColor(testInfo, `Successfully on edit page for ${courtName}.`);

    // Navigate to the 'Cases Heard' tab
    await logWithColor(testInfo, 'Clicking Cases Heard tab...');
    await casesHeardPage.clickCasesHeardTab();
    await logWithColor(testInfo, 'Cases Heard tab clicked and panel loaded.');

    // --- Cleanup Step: Ensure a known starting state ---
    await logWithColor(testInfo, 'Starting cleanup: Unselecting all areas of law...');
    await casesHeardPage.unselectAllAreasAndSave(courtSlug);
    await logWithColor(testInfo, 'Cleanup complete. All areas of law should be unselected.');

    // Verify cleanup worked before proceeding
    expect(await casesHeardPage.isAreaOfLawSelected(areaOfLaw1)).toBe(false);
    expect(await casesHeardPage.isAreaOfLawSelected(areaOfLaw2)).toBe(false);
    await logWithColor(testInfo, 'Verified areas are unselected after cleanup.');
  });

  test('Select, Save, Reload, Verify Selected, Unselect, Save, Reload, Verify Unselected', async ({ superAdminPage }, testInfo) => {
    // --- Part 1: Select and Verify ---
    await logWithColor(testInfo, `Selecting areas: ${areaOfLaw1}, ${areaOfLaw2}`);
    await casesHeardPage.selectAreaOfLaw(areaOfLaw1);
    await casesHeardPage.selectAreaOfLaw(areaOfLaw2);

    await logWithColor(testInfo, 'Clicking Update button...');
    await Promise.all([
      casesHeardPage.waitForUpdateResponse(courtSlug),
      casesHeardPage.clickUpdate()
    ]);
    await logWithColor(testInfo, 'Update action complete, response received.');

    await logWithColor(testInfo, 'Verifying success message...');
    await expect(casesHeardPage.getSuccessMessage()).resolves.toBe(successMessage);
    await logWithColor(testInfo, `Success message "${successMessage}" verified.`);

    await logWithColor(testInfo, 'Reloading the page...');
    await superAdminPage.reload({ waitUntil: 'domcontentloaded' });
    await logWithColor(testInfo, 'Page reloaded. Re-navigating to tab...');
    await casesHeardPage.clickCasesHeardTab();
    await logWithColor(testInfo, 'Cases Heard tab re-activated.');

    await logWithColor(testInfo, `Verifying areas ${areaOfLaw1}, ${areaOfLaw2} are selected after reload...`);
    await expect(casesHeardPage.isAreaOfLawSelected(areaOfLaw1)).resolves.toBe(true);
    await expect(casesHeardPage.isAreaOfLawSelected(areaOfLaw2)).resolves.toBe(true);
    await logWithColor(testInfo, 'Areas correctly selected after reload.');

    // --- Part 2: Unselect and Verify ---
    await logWithColor(testInfo, `Unselecting areas: ${areaOfLaw1}, ${areaOfLaw2}`);
    await casesHeardPage.unselectAreaOfLaw(areaOfLaw1);
    await casesHeardPage.unselectAreaOfLaw(areaOfLaw2);

    await logWithColor(testInfo, 'Clicking Update button again...');
    await Promise.all([
      casesHeardPage.waitForUpdateResponse(courtSlug),
      casesHeardPage.clickUpdate()
    ]);
    await logWithColor(testInfo, 'Update action complete, response received.');

    await logWithColor(testInfo, 'Verifying success message again...');
    await expect(casesHeardPage.getSuccessMessage()).resolves.toBe(successMessage);
    await logWithColor(testInfo, `Success message "${successMessage}" verified again.`);

    await logWithColor(testInfo, 'Reloading the page again...');
    await superAdminPage.reload({ waitUntil: 'domcontentloaded' });
    await logWithColor(testInfo, 'Page reloaded. Re-navigating to tab...');
    await casesHeardPage.clickCasesHeardTab();
    await logWithColor(testInfo, 'Cases Heard tab re-activated.');

    await logWithColor(testInfo, `Verifying areas ${areaOfLaw1}, ${areaOfLaw2} are unselected after reload...`);
    await expect(casesHeardPage.isAreaOfLawSelected(areaOfLaw1)).resolves.toBe(false);
    await expect(casesHeardPage.isAreaOfLawSelected(areaOfLaw2)).resolves.toBe(false);
    await logWithColor(testInfo, 'Areas correctly unselected after reload.');

    await logWithColor(testInfo, 'Test finished successfully.');
  });

});
