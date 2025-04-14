// src/test/e2e/tests/general-info.spec.js
/**
 * @file General Information Tab Functionality Tests
 * @description This spec file tests the functionality of the 'General Information' tab
 *              within the court edit page for both Admin and Super Admin users.
 * Key Dependencies/Assumptions:
 * - Tests use 'adminPage' and 'superAdminPage' fixtures for authentication, requiring
 *   Admin and Super Admin credentials respectively (fetched from environment variables).
 * - Tests are organized into separate `describe` blocks for each user role.
 * - The Super Admin tests (`describe.serial`) run serially because they modify flags on the
 *   *same court record* (`birmingham-district-probate-registry`) sequentially.
 * - Relies on specific court data existing:
 *   - Admin tests use: 'stafford-combined-court-centre'
 *   - Super Admin tests use: 'birmingham-district-probate-registry'
 * - Uses `GeneralInfoPage` and potentially `LoginPage` (for re-logins) Page Object Models.
 * - Core Actions & Verifications:
 *   - Verifies visibility of elements based on user role (e.g., Super Admins see 'Open' flag, Admins don't).
 *   - Tests updating fields like Urgent Notices (Admin) and toggling flags (Open, Access Scheme - Super Admin;
 *     Access Scheme, Common Platform - Admin).
 *   - Uses explicit waits (`waitForSaveResponse`) for save operations.
 *   - Verifies success messages after saving changes.
 * - Idempotency Strategy:
 *   - Admin test: Toggles flags/clears text fields and then reverts them to their original state within the test.
 *   - Super Admin tests: The `beforeEach` hook ensures the 'Open' and 'Access Scheme' flags are explicitly
 *     set to 'unchecked' before each test runs, providing a consistent starting point.
 */
const { test } = require('../fixtures/auth.setup'); // Use the custom test fixture
const { expect } = require('@playwright/test');
const { GeneralInfoPage } = require('../pages/general-info-page');
const { LoginPage } = require('../pages/login-page'); // Needed for potential re-login
const { logWithColor } = require('../fixtures/auth.setup'); // Import the custom logger

// --- Admin User Tests ---
test.describe('General Info - Admin User', () => {
  test('Admin user can view and update urgent notices, PUAS flag, and Common Platform flag', async ({ adminPage }, testInfo) => {
    const courtSlug = 'stafford-combined-court-centre';
    const editUrl = `/courts/${courtSlug}/edit`;
    const generalInfoPage = new GeneralInfoPage(adminPage);

    await logWithColor(testInfo, `Navigating to: ${editUrl}`);
    await adminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });
    await expect(adminPage).toHaveURL(new RegExp(`.*${editUrl}$`));
    await logWithColor(testInfo, 'Navigation successful.');

    // Wait for the General Info tab content to load
    await logWithColor(testInfo, 'Waiting for General Info tab content to load...');
    await expect(adminPage.locator(generalInfoPage.urgentNoticeIframe)).toBeVisible({ timeout: 15000 });
    await logWithColor(testInfo, 'General Info tab content loaded.');

    // --- View assertions ---
    await logWithColor(testInfo, 'Verifying element visibility for Admin...');
    expect(await generalInfoPage.isUrgentNoticeVisible()).toBe(true);
    expect(await generalInfoPage.isAccessSchemeCheckboxVisible()).toBe(true);
    expect(await generalInfoPage.isCommonPlatformCheckboxVisible()).toBe(true);
    expect(await generalInfoPage.isSuperAdminContentVisible()).toBe(false);
    await logWithColor(testInfo, 'Admin visibility checks passed.');

    // --- Update and Revert ---
    const originalAccessSchemeState = await adminPage.locator(generalInfoPage.accessSchemeCheckbox).isChecked();
    const originalCommonPlatformState = await adminPage.locator(generalInfoPage.commonPlatformCheckbox).isChecked();
    const testNotice = 'Test Urgent Notice - Admin';
    const testNoticeWelsh = 'Welsh Test Urgent Notice - Admin';

    await logWithColor(testInfo, 'Setting new values and saving...');
    await generalInfoPage.setUrgentNotice(testNotice);
    await generalInfoPage.setUrgentNoticeWelsh(testNoticeWelsh);
    await generalInfoPage.setAccessSchemeFlag(!originalAccessSchemeState); // Toggle state
    await generalInfoPage.setCommonPlatformFlag(!originalCommonPlatformState); // Toggle state

    await Promise.all([
      generalInfoPage.waitForSaveResponse(), // Wait for the PUT request to complete
      generalInfoPage.clickSave()
    ]);
    await logWithColor(testInfo, 'Save complete.');

    await expect(generalInfoPage.getUpdateMessage()).resolves.toContain('General Information updated');
    await logWithColor(testInfo, 'Verified update success message.');

    // Verify checkbox states directly after save confirmation
    expect(await adminPage.locator(generalInfoPage.accessSchemeCheckbox).isChecked()).toBe(!originalAccessSchemeState);
    expect(await adminPage.locator(generalInfoPage.commonPlatformCheckbox).isChecked()).toBe(!originalCommonPlatformState);

    // --- Revert changes for idempotency ---
    await logWithColor(testInfo, 'Reverting changes and saving...');
    await generalInfoPage.setUrgentNotice(''); // Clear notices
    await generalInfoPage.setUrgentNoticeWelsh('');
    await generalInfoPage.setAccessSchemeFlag(originalAccessSchemeState); // Revert to original
    await generalInfoPage.setCommonPlatformFlag(originalCommonPlatformState); // Revert to original

    await Promise.all([
      generalInfoPage.waitForSaveResponse(),
      generalInfoPage.clickSave()
    ]);
    await logWithColor(testInfo, 'Revert save complete.');
    await expect(generalInfoPage.getUpdateMessage()).resolves.toContain('General Information updated');
    await logWithColor(testInfo, 'Verified revert success message.');

    // Final check of reverted state
    expect(await adminPage.locator(generalInfoPage.accessSchemeCheckbox).isChecked()).toBe(originalAccessSchemeState);
    expect(await adminPage.locator(generalInfoPage.commonPlatformCheckbox).isChecked()).toBe(originalCommonPlatformState);
    await logWithColor(testInfo, 'Verified state reverted correctly.');
  });
});


// --- Super Admin User Tests ---
// Run serially as they modify the state of the *same* court record flags.
test.describe.serial('General Info - Super Admin Flags', () => {
  const courtSlug = 'birmingham-district-probate-registry';
  const courtName = 'Birmingham District Probate Registry'; // For logging/verification
  const editUrl = `/courts/${courtSlug}/edit`;
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';
  const successMessage = 'General Information updated';

  let generalInfoPage; // Page object scoped to the describe block

  // Runs before each test in *this* describe block.
  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Setting up for Super Admin test: ${testInfo.title}`);
    generalInfoPage = new GeneralInfoPage(superAdminPage);

    // --- Navigation and Re-login ---
    await logWithColor(testInfo, `Attempting navigation to: ${editUrl}`);
    await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });

    if (superAdminPage.url().includes('idam-web-public')) {
      await logWithColor(testInfo, 'Redirected to login page. Re-authenticating Super Admin...');
      const loginPage = new LoginPage(superAdminPage);
      const username = process.env.OAUTH_SUPER_USER;
      const password = process.env.OAUTH_USER_PASSWORD;
      if (!username || !password) {
        throw new Error('Super Admin credentials not found in environment variables for re-login.');
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
        throw e; // Rethrow if it wasn't a login error summary issue
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

    await expect(superAdminPage.locator('#Main.fact-tabs')).toBeVisible({ timeout: 10000 });
    await expect(superAdminPage).toHaveURL(new RegExp(`.*${editUrl}$`));
    await expect(superAdminPage.locator(`h1:has-text("${courtName}")`)).toBeVisible();
    await logWithColor(testInfo, `Successfully on edit page for ${courtName}.`);

    // Wait for the General Info tab content to load (essential!)
    await logWithColor(testInfo, 'Waiting for General Info tab content to load...');
    await expect(superAdminPage.locator(generalInfoPage.saveButton)).toBeVisible({ timeout: 15000 });
    await expect(superAdminPage.locator(generalInfoPage.openCourtCheckbox)).toBeVisible({ timeout: 5000 }); // Super admin specific
    await logWithColor(testInfo, 'General Info tab content loaded.');

    // Idempotency: Ensure flags are in a known state (unchecked) before test runs
    await logWithColor(testInfo, 'Ensuring initial state (flags unchecked)...');
    let changedState = false;
    const openCheckbox = superAdminPage.locator(generalInfoPage.openCourtCheckbox);
    const accessCheckbox = superAdminPage.locator(generalInfoPage.accessSchemeCheckbox);

    if (await openCheckbox.isChecked()) {
      await generalInfoPage.setOpenCourtFlag(false);
      changedState = true;
    }
    if (await accessCheckbox.isChecked()) {
      await generalInfoPage.setAccessSchemeFlag(false);
      changedState = true;
    }

    if (changedState) {
      await logWithColor(testInfo, 'Saving initial unchecked state...');
      await Promise.all([
        generalInfoPage.waitForSaveResponse(),
        generalInfoPage.clickSave()
      ]);
      await expect(generalInfoPage.getUpdateMessage()).resolves.toContain(successMessage);
      await logWithColor(testInfo, 'Initial state saved successfully.');
    } else {
      await logWithColor(testInfo, 'Flags already in desired initial state (unchecked).');
    }

    await expect(openCheckbox).not.toBeChecked();
    await expect(accessCheckbox).not.toBeChecked();
    await logWithColor(testInfo, 'Verified initial state is correct before test execution.');
  });

  test('Toggle Open/Closed flag', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Starting Open/Closed flag toggle test...');

    // --- Check Open ---
    await generalInfoPage.setOpenCourtFlag(true);
    await logWithColor(testInfo, 'Checked Open flag and saving...');
    await Promise.all([
      generalInfoPage.waitForSaveResponse(),
      generalInfoPage.clickSave()
    ]);
    await expect(generalInfoPage.getUpdateMessage()).resolves.toContain(successMessage);
    await expect(superAdminPage.locator(generalInfoPage.openCourtCheckbox)).toBeChecked();
    await logWithColor(testInfo, 'Verified Open flag is checked.');

    // --- Uncheck Open (Simulates Closing) ---
    await generalInfoPage.setOpenCourtFlag(false);
    await logWithColor(testInfo, 'Unchecked Open flag and saving...');
    await Promise.all([
      generalInfoPage.waitForSaveResponse(),
      generalInfoPage.clickSave()
    ]);
    await expect(generalInfoPage.getUpdateMessage()).resolves.toContain(successMessage);
    await expect(superAdminPage.locator(generalInfoPage.openCourtCheckbox)).not.toBeChecked();
    await logWithColor(testInfo, 'Verified Open flag is unchecked.');
  });

  test('Toggle Access Scheme flag', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Starting Access Scheme flag toggle test...');

    // --- Check Access Scheme ---
    await generalInfoPage.setAccessSchemeFlag(true);
    await logWithColor(testInfo, 'Checked Access Scheme flag and saving...');
    await Promise.all([
      generalInfoPage.waitForSaveResponse(),
      generalInfoPage.clickSave()
    ]);
    await expect(generalInfoPage.getUpdateMessage()).resolves.toContain(successMessage);
    await expect(superAdminPage.locator(generalInfoPage.accessSchemeCheckbox)).toBeChecked();
    await logWithColor(testInfo, 'Verified Access Scheme flag is checked.');

    // --- Uncheck Access Scheme ---
    await generalInfoPage.setAccessSchemeFlag(false);
    await logWithColor(testInfo, 'Unchecked Access Scheme flag and saving...');
    await Promise.all([
      generalInfoPage.waitForSaveResponse(),
      generalInfoPage.clickSave()
    ]);
    await expect(generalInfoPage.getUpdateMessage()).resolves.toContain(successMessage);
    await expect(superAdminPage.locator(generalInfoPage.accessSchemeCheckbox)).not.toBeChecked();
    await logWithColor(testInfo, 'Verified Access Scheme flag is unchecked.');
  });
});
