// src/test/e2e/tests/spoe.spec.js
/**
 * @file Single Point of Entry (SPoE) Functionality Tests
 * @description This spec tests selecting, saving, and verifying SPoE Areas of Law
 *              within the admin portal for a specific court ('Cambridge Crown Court').
 * Key Dependencies/Assumptions:
 * - Test uses the 'superAdminPage' fixture for authentication, requiring super admin credentials.
 * - Tests run serially (`test.describe.serial`) because they modify the SPoE state for the
 *   *same court* (`cambridge-crown-court`) sequentially. The test selects, saves, verifies,
 *   unselects, saves, and verifies again, relying on the state changes.
 * - Relies on the specific court `cambridge-crown-court` existing in the test environment.
 * - Relies on the specific SPoE area of law checkbox IDs (`adoption1`, `children1`) existing on the page.
 * - Uses the `SpoePage` Page Object Model for interactions.
 * - `beforeEach` performs cleanup: It navigates to the court edit page, activates the SPoE tab,
 *   and ensures the specific checkboxes used in the test (`adoption1`, `children1`) are *unselected*
 *   before each test run by checking their state and saving if necessary. This makes the test idempotent.
 * - Verification relies on checking checkbox states (`isChecked()`) after saves and page reloads.
 * - Explicit waits for network responses (`waitForSaveResponse`) are used after save actions for reliability.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { SpoePage } = require('../pages/spoe-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

test.describe.serial('Super Admin SPoE Functionality', () => {
  const courtSlug = 'cambridge-crown-court';
  const courtName = 'Cambridge Crown Court';
  const editUrl = `/courts/${courtSlug}/edit`;
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';

  const areaOfLawAdoption = 'adoption1';
  const areaOfLawChildren = 'children1';
  const successMessageText = 'Single point of entries updated';

  let spoePage;

  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    spoePage = new SpoePage(superAdminPage);

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

    await expect(superAdminPage.locator('#Main.fact-tabs')).toBeVisible({ timeout: 10000 });
    await expect(superAdminPage).toHaveURL(new RegExp(`.*${editUrl}$`));
    await expect(superAdminPage.locator(`h1:has-text("${courtName}")`)).toBeVisible();
    await logWithColor(testInfo, `Successfully on edit page for ${courtName}.`);

    await logWithColor(testInfo, 'Clicking SPoE tab...');
    await spoePage.clickSpoeTab();
    await logWithColor(testInfo, 'SPoE tab clicked and panel loaded.');

    await logWithColor(testInfo, 'Starting cleanup: Ensuring test checkboxes are unselected...');
    let changedState = false;
    if (await spoePage.isAreaOfLawSelected(areaOfLawAdoption)) {
      await logWithColor(testInfo, `Cleanup: Unchecking ${areaOfLawAdoption}`);
      await spoePage.unselectAreaOfLaw(areaOfLawAdoption);
      changedState = true;
    }
    if (await spoePage.isAreaOfLawSelected(areaOfLawChildren)) {
      await logWithColor(testInfo, `Cleanup: Unchecking ${areaOfLawChildren}`);
      await spoePage.unselectAreaOfLaw(areaOfLawChildren);
      changedState = true;
    }

    if (changedState) {
      await logWithColor(testInfo, 'Cleanup: Saving unselected state...');
      await Promise.all([
        spoePage.waitForSaveResponse(courtSlug),
        spoePage.clickSave()
      ]);
      await expect(spoePage.getSuccessMessage()).resolves.toBe(successMessageText);
      await logWithColor(testInfo, 'Cleanup: Save successful.');
    } else {
      await logWithColor(testInfo, 'Cleanup: Checkboxes already in desired unselected state.');
    }

    expect(await spoePage.isAreaOfLawSelected(areaOfLawAdoption)).toBe(false);
    expect(await spoePage.isAreaOfLawSelected(areaOfLawChildren)).toBe(false);
    await logWithColor(testInfo, 'Verified checkboxes are unselected before test execution.');
  });

  test('Select, Save, Reload, Verify Selected, Unselect, Save, Reload, Verify Unselected', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Selecting areas: ${areaOfLawAdoption}, ${areaOfLawChildren}`);
    await spoePage.selectAreaOfLaw(areaOfLawAdoption);
    await spoePage.selectAreaOfLaw(areaOfLawChildren);

    await logWithColor(testInfo, 'Clicking Save button...');
    await Promise.all([
      spoePage.waitForSaveResponse(courtSlug),
      spoePage.clickSave()
    ]);
    await logWithColor(testInfo, 'Update action complete, response received.');

    await logWithColor(testInfo, 'Verifying success message...');
    await expect(spoePage.getSuccessMessage()).resolves.toBe(successMessageText);
    await logWithColor(testInfo, `Success message "${successMessageText}" verified.`);

    await logWithColor(testInfo, 'Reloading the page...');
    await superAdminPage.reload({ waitUntil: 'load' });
    await logWithColor(testInfo, 'Page reloaded. Re-navigating to SPoE tab...');
    await spoePage.clickSpoeTab();
    await logWithColor(testInfo, 'SPoE tab re-activated.');

    await logWithColor(testInfo, `Verifying areas ${areaOfLawAdoption}, ${areaOfLawChildren} are selected after reload...`);
    await expect(spoePage.isAreaOfLawSelected(areaOfLawAdoption)).resolves.toBe(true);
    await expect(spoePage.isAreaOfLawSelected(areaOfLawChildren)).resolves.toBe(true);
    await logWithColor(testInfo, 'Areas correctly selected after reload.');

    await logWithColor(testInfo, `Unselecting areas: ${areaOfLawAdoption}, ${areaOfLawChildren}`);
    await spoePage.unselectAreaOfLaw(areaOfLawAdoption);
    await spoePage.unselectAreaOfLaw(areaOfLawChildren);

    await logWithColor(testInfo, 'Clicking Save button again...');
    await Promise.all([
      spoePage.waitForSaveResponse(courtSlug),
      spoePage.clickSave()
    ]);
    await logWithColor(testInfo, 'Update action complete, response received.');

    await logWithColor(testInfo, 'Verifying success message again...');
    await expect(spoePage.getSuccessMessage()).resolves.toBe(successMessageText);
    await logWithColor(testInfo, `Success message "${successMessageText}" verified again.`);

    await logWithColor(testInfo, 'Reloading the page again...');
    await superAdminPage.reload({ waitUntil: 'load' });
    await logWithColor(testInfo, 'Page reloaded. Re-navigating to SPoE tab...');
    await spoePage.clickSpoeTab();
    await logWithColor(testInfo, 'SPoE tab re-activated.');

    await logWithColor(testInfo, `Verifying areas ${areaOfLawAdoption}, ${areaOfLawChildren} are unselected after reload...`);
    await expect(spoePage.isAreaOfLawSelected(areaOfLawAdoption)).resolves.toBe(false);
    await expect(spoePage.isAreaOfLawSelected(areaOfLawChildren)).resolves.toBe(false);
    await logWithColor(testInfo, 'Areas correctly unselected after reload.');

    await logWithColor(testInfo, 'SPoE test finished successfully.');
  });
});
