// src/test/e2e/tests/lists-areas-of-law.spec.js
/**
 * @file Areas of Law List Functionality Tests
 * @description This spec tests the CRUD (Create, Read, Update, Delete) operations for Areas of Law
 *              within the 'Edit A List' section of the admin portal. It replaces the legacy
 *              Gherkin feature 'super_admin/list-areas-of-law.feature'.
 *
 * @dependencies
 * - Requires Super Admin authentication ('superAdminPage' fixture).
 * - Uses `AreasOfLawPage` and `LoginPage` Page Object Models.
 * - Relies on `logWithColor` for enhanced logging output.
 *
 * @execution_and_state
 * - Tests run serially (`test.describe.serial`) as they modify the global Areas of Law list state.
 *   Adding, editing, or attempting to delete the same AoL across tests requires sequential execution.
 * - The `beforeEach` hook navigates to the 'Edit A List > Areas of Law' tab.
 * - Specific cleanup (`ensureAreaOfLawDoesNotExist`) is performed in `beforeEach` for tests that
 *   create or interact with a specific temporary AoL ('Test123'), ensuring idempotency.
 *
 * @key_interactions_and_challenges
 * - **Tab Navigation:** Interacts with the custom `fact-tabs` component, requiring clicks on the
 *   visible tab title to reveal the tab list before clicking the specific AoL tab link.
 * - **AJAX Operations:** Saving, deleting, and loading the list content are handled via AJAX.
 *   The tests use explicit waits (`waitForResponse`, `waitForPageLoad`, POM method waits)
 *   to ensure these asynchronous operations complete before proceeding or asserting.
 * - **Error Handling:** Tests verify both success messages (confirmation panels) and error messages
 *   (within the GOV.UK error summary component), including specific checks for duplicate names and
 *   'in-use' deletion errors.
 * - **Cleanup Robustness:** The `ensureAreaOfLawDoesNotExist` POM method handles potential 409 errors
 *   if an AoL is in use and cannot be deleted via the UI, logging a warning instead of failing the cleanup.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { AreasOfLawPage } = require('../pages/lists-areas-of-law-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

test.describe.serial('Areas of Law List Functionality', () => {
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';
  const listsUrl = `${baseUrl}/lists`; // URL for the "Edit A List" page
  const successMessage = 'Areas of Law Updated'; // Expected success message text

  let areasOfLawPage;

  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    areasOfLawPage = new AreasOfLawPage(superAdminPage);

    // --- Navigation and Re-login Logic ---
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
      await logWithColor(testInfo, 'Already logged in.');
    }
    // --- End Conditional Re-login Logic ---

    // Navigate to Lists page
    await logWithColor(testInfo, 'Navigating to Lists page...');
    await areasOfLawPage.clickListsNavLink();
    await expect(superAdminPage).toHaveURL(listsUrl);
    await logWithColor(testInfo, 'On Lists page.');

    // Navigate to Areas of Law tab
    await logWithColor(testInfo, 'Clicking Areas of Law tab...');
    await areasOfLawPage.clickAreasOfLawTab(); // Includes wait for AJAX load
    await areasOfLawPage.waitForPageLoad();
    await logWithColor(testInfo, 'Areas of Law tab loaded.');

    // --- Cleanup specific to tests ---
    // Ensure 'Test123' does not exist before relevant tests run
    if (testInfo.title.includes('Deleting new Area of law') || testInfo.title.includes('Add new Area Of Law with the name already exist')) {
      await logWithColor(testInfo, 'Performing pre-test cleanup: Ensuring "Test123" does not exist...');
      await areasOfLawPage.ensureAreaOfLawDoesNotExist('Test123');
    }
    await logWithColor(testInfo, 'Setup complete.');
  });

  // --- Test Cases ---

  test('Edit Area Of Law (Adoption)', async ({ superAdminPage }, testInfo) => {
    const areaOfLawName = 'Adoption';
    const editData = {
      displayName: 'Adoption',
      externalLinkDesc: 'Adoption',
      displayNameCy: 'Os ydych chi’n gwneud',
      altName: 'Adoption application',
      altNameCy: 'Rhwymedi Ariannol',
      externalLink: 'https://www.gov.uk/child-adoption',
      externalLinkDescCy: 'Gwybodaeth ynglŷn â mabwysiadu plentyn',
      displayExternalLink: 'https://www.gov.uk'
    };

    await logWithColor(testInfo, `Attempting to edit "${areaOfLawName}"...`);
    await areasOfLawPage.clickEditAreaOfLaw(areaOfLawName);
    await logWithColor(testInfo, 'On edit form. Clearing existing entries...');
    await areasOfLawPage.clearEditForm();
    await logWithColor(testInfo, 'Filling form with new data...');
    await areasOfLawPage.fillEditForm(editData);

    await logWithColor(testInfo, 'Saving changes...');
    const saveResponsePromise = areasOfLawPage.waitForSaveResponse();
    await areasOfLawPage.clickSave();
    const response = await saveResponsePromise;
    expect(response.status()).toBe(200);
    await logWithColor(testInfo, 'Save successful (HTTP 200).');

    await logWithColor(testInfo, 'Verifying success message...');
    await expect(areasOfLawPage.getSuccessMessage()).resolves.toBe(successMessage);
    await logWithColor(testInfo, 'Edit successful.');
  });

  test('Add new Area Of Law with the name already exist', async ({ superAdminPage }, testInfo) => {
    const existingName = 'Financial Remedy';
    const expectedError = 'An area of law with the proposed name already exists. The name must be unique.';

    await logWithColor(testInfo, 'Clicking "Add Area of Law"...'); // Updated log text
    await areasOfLawPage.clickAddNewAreaOfLaw();
    await logWithColor(testInfo, `Entering existing name: "${existingName}"...`);
    await areasOfLawPage.fillAddForm({ name: existingName });

    await logWithColor(testInfo, 'Attempting to save duplicate name...');
    await areasOfLawPage.clickSave();
    // Allow a short time for the UI error to render based on the AJAX fail handler
    await superAdminPage.waitForTimeout(500); // Wait for UI update

    await logWithColor(testInfo, 'Verifying error message...');
    await areasOfLawPage.waitForErrorSummary();
    await expect(areasOfLawPage.getFirstErrorSummaryListItemText()).resolves.toBe(expectedError);
    await logWithColor(testInfo, 'Duplicate name error verified.');
  });

  test('Deleting new Area of law (Test123)', async ({ superAdminPage }, testInfo) => {
    const newAreaOfLawName = 'Test123';

    // Add the new AoL first
    await logWithColor(testInfo, 'Adding new AoL for deletion test...');
    await areasOfLawPage.clickAddNewAreaOfLaw();
    await areasOfLawPage.fillAddForm({ name: newAreaOfLawName });
    const addResponsePromise = areasOfLawPage.waitForSaveResponse();
    await areasOfLawPage.clickSave();
    const addResponse = await addResponsePromise;
    expect(addResponse.status()).toBe(200);
    await expect(areasOfLawPage.getSuccessMessage()).resolves.toBe(successMessage);
    await expect(areasOfLawPage.isAreaOfLawVisible(newAreaOfLawName)).resolves.toBe(true);
    await logWithColor(testInfo, `AoL "${newAreaOfLawName}" added successfully.`);

    // Now delete it
    await logWithColor(testInfo, `Attempting to delete "${newAreaOfLawName}"...`);
    await areasOfLawPage.clickDeleteAreaOfLaw(newAreaOfLawName);
    await logWithColor(testInfo, 'On delete confirmation page.');

    const deleteResponsePromise = areasOfLawPage.waitForDeleteResponse();
    await areasOfLawPage.clickConfirmDelete();
    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.status()).toBe(200);
    await logWithColor(testInfo, 'Delete confirmed (HTTP 200).');

    await logWithColor(testInfo, 'Verifying success message...');
    await expect(areasOfLawPage.getSuccessMessage()).resolves.toBe(successMessage);

    await logWithColor(testInfo, `Verifying "${newAreaOfLawName}" is no longer visible...`);
    await expect(areasOfLawPage.page.locator(areasOfLawPage.areaOfLawRow(newAreaOfLawName))).toBeHidden({ timeout: 5000 });
    await logWithColor(testInfo, 'Deletion successful.');
  });

  test('Deleting existing Area of law (Adoption - In Use)', async ({ superAdminPage }, testInfo) => {
    const areaOfLawName = 'Adoption';
    const expectedError = 'You cannot delete this area of law at the moment, as one or more courts are dependent on it. Please remove the area of law from the relevant courts first';

    await logWithColor(testInfo, `Attempting to delete in-use AoL: "${areaOfLawName}"...`);
    await areasOfLawPage.clickDeleteAreaOfLaw(areaOfLawName);
    await logWithColor(testInfo, 'On delete confirmation page.');

    await areasOfLawPage.clickConfirmDelete();
    // Allow time for UI update from potential AJAX fail
    await superAdminPage.waitForTimeout(500);

    await logWithColor(testInfo, 'Verifying error message...');
    await areasOfLawPage.waitForErrorSummary();
    await expect(areasOfLawPage.getFirstErrorSummaryListItemText()).resolves.toBe(expectedError);
    await logWithColor(testInfo, 'In-use deletion error verified.');

    // Verify still on the main list page after the error
    await areasOfLawPage.waitForPageLoad();
  });
});
