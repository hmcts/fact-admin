// src/test/e2e/tests/superadmin-general-info.spec.js
/**
 * @file Super Admin General Information Tab Functionality Tests
 * @description This spec tests the functionality of the 'General Information' tab
 *              within the court edit page specifically for Super Admin users, covering
 *              name validation, intro paragraphs, and flag toggling.
 *              It replaces the Gherkin feature 'super_admin/general-info.feature'.
 *
 * @dependencies
 * - Requires Super Admin authentication ('superAdminPage' fixture).
 * - Uses `SuperAdminGeneralInfoPage` and `LoginPage` Page Object Models.
 * - Relies on `logWithColor` for enhanced logging output.
 *
 * @execution_and_state
 * - Tests run serially (`test.describe.serial`) as they modify data for specific courts sequentially.
 *   This prevents interference between tests modifying the same court attributes (like name or flags).
 * - Specific courts are used for each test scenario:
 *   - 'amersham-law-courts': Blank name validation, Common Platform toggle.
 *   - 'bankruptcy-court-high-court': Duplicate name validation.
 *   - 'north-west-regional-divorce-centre': Intro paragraph tests.
 * - The `beforeEach` hook handles initial setup like login checks and POM instantiation.
 *   Navigation to the specific court edit page happens *within each test*.
 *
 * @cleanup_strategy
 * - Tests involving modifications (name changes, intro paragraphs) include cleanup steps *within the test itself*
 *   to revert the changes, aiming for idempotency for subsequent test runs or manual checks.
 * - The 'Toggle Common Platform checkbox' test verifies the toggle action and successful save, but it intentionally
 *   *does not* toggle the state back. This avoids potential flakiness encountered during previous attempts
 *   to reliably revert and verify the checkbox state within the automation context, focusing the test on
 *   the core behaviour described in the original Gherkin scenario.
 *
 * @notes_for_developers
 * - Ensure the specified courts (`amersham-law-courts`, `bankruptcy-court-high-court`, `north-west-regional-divorce-centre`)
 *   exist in the target test environment.
 * - If further tests modifying flags on the same court are added, ensure they account for the final state left by the
 *   'Toggle Common Platform checkbox' test, or implement robust cleanup if necessary.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { SuperAdminGeneralInfoPage } = require('../pages/superadmin-general-info-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

test.describe.serial('Super Admin General Info Functionality', () => {
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';
  const successMessage = 'General Information updated';

  // Error messages based on Gherkin steps and controller logic
  const blankNameErrorSummary = 'A problem occurred when saving the general information.'; // Generic save error text from Gherkin
  const duplicateNameErrorSummaryPrefix = 'All names must be unique. Please check that a user is currently not editing this court, and that a court does not already exists with name: ';

  let superAdminGeneralInfoPage;

  // Runs before each test: checks login status, creates POM instances.
  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Setting up for test: ${testInfo.title}`);
    superAdminGeneralInfoPage = new SuperAdminGeneralInfoPage(superAdminPage);

    // --- Navigation and Re-login Check (to base URL initially) ---
    await logWithColor(testInfo, `Attempting navigation to application root: ${baseUrl}/`);
    await superAdminPage.goto('/', { waitUntil: 'domcontentloaded' });

    if (superAdminPage.url().includes('idam-web-public')) {
      await logWithColor(testInfo, 'Redirected to login page. Re-authenticating Super Admin...');
      const loginPage = new LoginPage(superAdminPage);
      const username = process.env.OAUTH_SUPER_USER;
      const password = process.env.OAUTH_USER_PASSWORD;
      if (!username || !password) { throw new Error('Super Admin credentials not found'); }
      await expect(superAdminPage).toHaveURL(/.*idam-web-public.*/);
      await loginPage.login(username, password);
      await logWithColor(testInfo, 'Login submitted. Waiting for redirect back...');
      const appHostRegex = new RegExp(`^${baseUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`);
      try {
        await superAdminPage.waitForURL(appHostRegex, { timeout: 15000, waitUntil: 'load' });
      } catch (e) {
        await logWithColor(testInfo, `Timeout waiting for redirect back. Current URL: ${superAdminPage.url()}`);
        const errorLocator = superAdminPage.locator('.error-summary');
        if (await errorLocator.isVisible({ timeout: 1000 })) {
          const errorMessage = await errorLocator.textContent();
          throw new Error(`Re-login failed: ${errorMessage}`);
        }
        throw e;
      }
      await logWithColor(testInfo, 'Redirected back. Current URL: ' + superAdminPage.url());
    } else {
      await logWithColor(testInfo, 'Direct navigation to root successful.');
    }
    await logWithColor(testInfo, 'Base setup complete.');
  });

  // Scenario: Cant leave the name blank
  test('Cannot leave the court name blank', async ({ superAdminPage }, testInfo) => {
    const courtSlug = 'amersham-law-courts';
    const editUrl = `/courts/${courtSlug}/edit`;
    const originalName = 'Amersham Law Courts'; // Store original name for reset

    await logWithColor(testInfo, `Navigating to edit page for ${courtSlug}`);
    await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });
    await expect(superAdminPage.locator(`h1:has-text("${originalName}")`)).toBeVisible();
    await logWithColor(testInfo, 'Navigated successfully.');

    await superAdminGeneralInfoPage.clickGeneralInfoTab();
    await logWithColor(testInfo, 'On General Info tab.');

    await logWithColor(testInfo, 'Clearing court name...');
    await superAdminGeneralInfoPage.clearCourtName();

    await logWithColor(testInfo, 'Clicking save...');
    await superAdminGeneralInfoPage.clickSave(); // No response wait needed as expecting error UI

    await logWithColor(testInfo, 'Verifying blank name error...');
    await superAdminGeneralInfoPage.waitForErrorSummary();
    // Gherkin targeted the generic error summary text for this scenario
    await superAdminGeneralInfoPage.checkErrorSummaryContains(blankNameErrorSummary);
    await logWithColor(testInfo, `Verified error summary contains: "${blankNameErrorSummary}"`);

    // Cleanup: Reset the name
    await logWithColor(testInfo, 'Cleanup: Resetting court name...');
    await superAdminGeneralInfoPage.fillCourtName(originalName);
    await superAdminGeneralInfoPage.clickSave();
    await superAdminGeneralInfoPage.waitForSaveResponse(courtSlug);
    await superAdminGeneralInfoPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Cleanup: Name reset and saved.');
  });

  // Scenario: Editing general info with the court name already exist
  test('Cannot save with a duplicate court name', async ({ superAdminPage }, testInfo) => {
    const courtSlug = 'bankruptcy-court-high-court'; // Court being edited
    const courtName = 'Bankruptcy Court (High Court)';
    const duplicateName = 'Amersham Law Courts'; // Name to cause conflict
    const editUrl = `/courts/${courtSlug}/edit`;
    const expectedError = duplicateNameErrorSummaryPrefix + duplicateName;

    await logWithColor(testInfo, `Navigating to edit page for ${courtSlug}`);
    await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });
    await expect(superAdminPage.locator(`h1:has-text("${courtName}")`)).toBeVisible();
    await logWithColor(testInfo, 'Navigated successfully.');

    await superAdminGeneralInfoPage.clickGeneralInfoTab();
    await logWithColor(testInfo, 'On General Info tab.');

    await logWithColor(testInfo, `Entering duplicate name: ${duplicateName}`);
    await superAdminGeneralInfoPage.fillCourtName(duplicateName);

    await logWithColor(testInfo, 'Clicking save...');
    await superAdminGeneralInfoPage.clickSave(); // No response wait needed as expecting error UI

    await logWithColor(testInfo, 'Verifying duplicate name error...');
    await superAdminGeneralInfoPage.waitForErrorSummary();
    await superAdminGeneralInfoPage.checkErrorSummaryContains(expectedError);
    await logWithColor(testInfo, `Verified error summary contains: "${expectedError}"`);

    // Cleanup: Reset the name back
    await logWithColor(testInfo, 'Cleanup: Resetting court name...');
    await superAdminGeneralInfoPage.fillCourtName(courtName); // Reset to original
    await superAdminGeneralInfoPage.clickSave();
    await superAdminGeneralInfoPage.waitForSaveResponse(courtSlug);
    await superAdminGeneralInfoPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Cleanup: Name reset and saved.');
  });

  // Scenario: Adding intro paragraph welsh and English
  test('Add Intro Paragraphs (English and Welsh)', async ({ superAdminPage }, testInfo) => {
    const courtSlug = 'north-west-regional-divorce-centre';
    const courtName = 'North West Regional Divorce Centre';
    const editUrl = `/courts/${courtSlug}/edit`;
    const englishText = 'intro paragraph test';
    const welshText = 'intro paragraph welsh test';

    await logWithColor(testInfo, `Navigating to edit page for ${courtSlug}`);
    await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });
    await expect(superAdminPage.locator(`h1:has-text("${courtName}")`)).toBeVisible();
    await logWithColor(testInfo, 'Navigated successfully.');

    await superAdminGeneralInfoPage.clickGeneralInfoTab();
    await logWithColor(testInfo, 'On General Info tab.');

    // Ensure relevant TinyMCE editors are visible before interaction (they depend on court type)
    await expect(superAdminPage.locator(superAdminGeneralInfoPage.introParagraphIframe)).toBeVisible();
    await expect(superAdminPage.locator(superAdminGeneralInfoPage.introParagraphWelshIframe)).toBeVisible();
    await logWithColor(testInfo, 'Verified intro paragraph editors are visible.');

    await logWithColor(testInfo, 'Adding intro paragraphs...');
    await superAdminGeneralInfoPage.fillIntroParagraphEnglish(englishText);
    await superAdminGeneralInfoPage.fillIntroParagraphWelsh(welshText);

    await logWithColor(testInfo, 'Clicking save...');
    await Promise.all([
      superAdminGeneralInfoPage.waitForSaveResponse(courtSlug),
      superAdminGeneralInfoPage.clickSave()
    ]);
    await logWithColor(testInfo, 'Save response received.');

    await superAdminGeneralInfoPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, `Verified success message: "${successMessage}"`);

    // Optional: Add verification here if needed (reload, get text, assert)

    // Cleanup: Clear the paragraphs
    await logWithColor(testInfo, 'Cleanup: Clearing intro paragraphs...');
    await superAdminGeneralInfoPage.fillIntroParagraphEnglish('');
    await superAdminGeneralInfoPage.fillIntroParagraphWelsh('');
    await superAdminGeneralInfoPage.clickSave();
    await superAdminGeneralInfoPage.waitForSaveResponse(courtSlug);
    await superAdminGeneralInfoPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Cleanup: Intro paragraphs cleared and saved.');
  });

  // Scenario: Editing common platform checkbox
  test('Toggle Common Platform checkbox', async ({ superAdminPage }, testInfo) => {
    const courtSlug = 'amersham-law-courts';
    const courtName = 'Amersham Law Courts';
    const editUrl = `/courts/${courtSlug}/edit`;

    await logWithColor(testInfo, `Navigating to edit page for ${courtSlug}`);
    await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });
    await expect(superAdminPage.locator(`h1:has-text("${courtName}")`)).toBeVisible();
    await logWithColor(testInfo, 'Navigated successfully.');

    await superAdminGeneralInfoPage.clickGeneralInfoTab();
    await logWithColor(testInfo, 'On General Info tab.');

    const commonPlatformCheckbox = superAdminPage.locator(superAdminGeneralInfoPage.commonPlatformCheckbox);
    await expect(commonPlatformCheckbox).toBeVisible();
    const initialState = await commonPlatformCheckbox.isChecked();
    await logWithColor(testInfo, `Initial Common Platform state: ${initialState}`);

    await logWithColor(testInfo, `Toggling Common Platform checkbox to ${!initialState}...`);
    // Use click to toggle the state regardless of the current state
    await commonPlatformCheckbox.click();

    await logWithColor(testInfo, 'Clicking save...');
    await Promise.all([
      superAdminGeneralInfoPage.waitForSaveResponse(courtSlug),
      superAdminGeneralInfoPage.clickSave()
    ]);
    await logWithColor(testInfo, 'Save response received.');

    await superAdminGeneralInfoPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, `Verified success message: "${successMessage}"`);

    // Verify state immediately after the main save action
    // Use expect.poll here for robustness against immediate UI updates after save confirmation
    await logWithColor(testInfo, `Polling checkbox state to be ${!initialState}...`);
    await expect(async () => {
      const currentCheckedState = await superAdminPage.locator(superAdminGeneralInfoPage.commonPlatformCheckbox).isChecked();
      expect(currentCheckedState).toBe(!initialState);
    }).toPass({
      timeout: 7000,
      intervals: [200, 500, 1000]
    });
    await logWithColor(testInfo, `Verified checkbox state is now: ${!initialState}`);

    await logWithColor(testInfo, 'Test complete. Left checkbox in toggled state.');
  });
});
