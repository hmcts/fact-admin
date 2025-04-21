// src/test/e2e/tests/lists-opening-types.spec.js
/**
 * @file Opening Types List Functionality Tests
 * @description This spec tests the CRUD (Create, Read, Update, Delete) operations for Opening Types
 *              within the 'Edit A List' section of the admin portal. It replaces the legacy
 *              Gherkin feature 'Feature: Opening Types List'.
 *
 * @dependencies
 * - Requires Super Admin authentication ('superAdminPage' fixture).
 * - Uses `OpeningTypesPage` Page Object Model for interacting with the list and forms.
 * - Uses `LoginPage` POM for potential re-logins if the session expires.
 * - Relies on `logWithColor` from `auth.setup.js` for enhanced logging output.
 *
 * @execution_and_state
 * - Tests run serially (`test.describe.serial`) as they modify the global Opening Types list state.
 *   Adding, editing, or attempting to delete the same type across tests requires sequential execution.
 * - The `beforeEach` hook handles common setup: navigation, login checks, activating the 'Opening Types' tab,
 *   and waiting for the list to load.
 * - Specific cleanup (`ensureOpeningTypeDoesNotExist`) is performed in `beforeEach` for tests involving the
 *   temporary 'TEST 123' type, ensuring test idempotency.
 *
 * @key_interactions_and_challenges
 * - **Tab Navigation:** Interacts with the custom `fact-tabs` component, requiring hover/click logic.
 * - **AJAX Operations & UI Updates:** Saving, deleting, and loading list content are asynchronous.
 *   Initial failures occurred due to tests waiting for success/error UI elements *before* the action
 *   (like clicking 'Save' or 'Confirm Delete') that triggers the update.
 * - **Solution:** The tests were corrected to perform the action first (e.g., `clickSave()`), and *then*
 *   use `page.waitForSelector()` to wait for the expected UI change (either the success panel or error summary)
 *   before proceeding with assertions. This ensures the test waits for the result of the action.
 * - **Error Handling:** Tests verify specific success and error messages (duplicate, in-use) based on
 *   Gherkin scenarios and controller logic, using POM methods to interact with the confirmation panel
 *   or error summary.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { OpeningTypesPage } = require('../pages/lists-opening-types-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

test.describe.serial('Opening Types List Functionality', () => {
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';
  const listsUrl = `${baseUrl}/lists`;
  const successMessage = 'Opening Types Updated'; // From Gherkin

  // Test Data from Gherkin
  const typeToEdit = 'Court open';
  const typeToEditWelsh = 'Oriau agor y Llys';
  const duplicateTypeName = 'Court open'; // Used in 'add duplicate' scenario
  const typeToDeleteNew = 'TEST 123';
  const typeToDeleteInUse = 'Court open';
  const typeToEditDuplicateTarget = 'County Court open'; // Edit 'Court open' *to* this existing name

  let openingTypesPage;

  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    openingTypesPage = new OpeningTypesPage(superAdminPage);

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
    await openingTypesPage.clickListsNavLink();
    await expect(superAdminPage).toHaveURL(listsUrl);
    await logWithColor(testInfo, 'On Lists page.');

    // Navigate to Opening Types tab
    await logWithColor(testInfo, 'Clicking Opening Types tab...');
    await openingTypesPage.clickOpeningTypesTab();
    await openingTypesPage.waitForPageLoad();
    await logWithColor(testInfo, 'Opening Types tab loaded.');

    // --- Cleanup specific to tests ---
    if (testInfo.title.includes('Deleting new Opening Type') || testInfo.title.includes('Add new Opening Type with the name already exist')) {
      await logWithColor(testInfo, `Performing pre-test cleanup: Ensuring "${typeToDeleteNew}" does not exist...`);
      await openingTypesPage.ensureOpeningTypeDoesNotExist(typeToDeleteNew);
    }
    await logWithColor(testInfo, 'Setup complete.');
  });

  // --- Test Cases ---

  test('Edit Opening Type', async ({ superAdminPage }, testInfo) => {
    const editData = {
      name: typeToEdit,
      nameCy: typeToEditWelsh
    };
    const expectedFormTitle = `Editing Opening Type: ${typeToEdit}`;

    await logWithColor(testInfo, `Clicking edit for: ${typeToEdit}`);
    await openingTypesPage.clickEditOpeningType(typeToEdit);
    await openingTypesPage.verifyFormTitle(expectedFormTitle);
    await logWithColor(testInfo, 'On edit form. Clearing fields...');
    await openingTypesPage.clearForm();
    await logWithColor(testInfo, 'Filling form with new data...');
    await openingTypesPage.fillForm(editData);

    await logWithColor(testInfo, 'Saving changes...');
    await openingTypesPage.clickSave();

    await logWithColor(testInfo, 'Verifying success message...');
    await expect(openingTypesPage.getSuccessMessage()).resolves.toBe(successMessage);
    await logWithColor(testInfo, 'Edit successful.');
    await expect(openingTypesPage.isOpeningTypeVisible(typeToEdit)).resolves.toBe(true);
  });

  test('Add new Opening Type with the name already exist', async ({ superAdminPage }, testInfo) => {
    const expectedFormTitle = 'Add New Opening Type';
    const expectedErrorMessage = openingTypesPage.duplicateError;

    await logWithColor(testInfo, 'Clicking "Add new Opening Type"...');
    await openingTypesPage.clickAddNewOpeningType();
    await openingTypesPage.verifyFormTitle(expectedFormTitle);
    await logWithColor(testInfo, `Entering existing name: "${duplicateTypeName}"...`);
    await openingTypesPage.fillForm({ name: duplicateTypeName });

    await logWithColor(testInfo, 'Attempting to save duplicate name...');
    await openingTypesPage.clickSave();
    await openingTypesPage.page.waitForSelector(openingTypesPage.errorSummary, { timeout: 15000 });

    await logWithColor(testInfo, 'Verifying duplicate error message...');
    await expect(openingTypesPage.getFirstErrorSummaryListItemText()).resolves.toBe(expectedErrorMessage);
    await logWithColor(testInfo, 'Duplicate name error verified.');
  });

  test('Deleting new Opening Type', async ({ superAdminPage }, testInfo) => {
    const newData = { name: typeToDeleteNew, nameCy: 'test cy' };
    const expectedAddFormTitle = 'Add New Opening Type';
    const expectedDeleteFormTitle = `Delete Opening Type: ${typeToDeleteNew}`;

    // Add
    await logWithColor(testInfo, `Adding new opening type: ${newData.name}`);
    await openingTypesPage.clickAddNewOpeningType();
    await openingTypesPage.verifyFormTitle(expectedAddFormTitle);
    await openingTypesPage.fillForm(newData);
    await openingTypesPage.clickSave();
    await openingTypesPage.page.waitForSelector(openingTypesPage.successPanel, { timeout: 15000 });
    await expect(openingTypesPage.getSuccessMessage()).resolves.toBe(successMessage);
    await expect(openingTypesPage.isOpeningTypeVisible(newData.name)).resolves.toBe(true);
    await logWithColor(testInfo, `Opening type "${newData.name}" added successfully.`);

    // Delete
    await logWithColor(testInfo, `Attempting to delete "${newData.name}"...`);
    await openingTypesPage.clickDeleteOpeningType(newData.name);
    await openingTypesPage.verifyFormTitle(expectedDeleteFormTitle);
    await logWithColor(testInfo, 'On delete confirmation page.');

    await openingTypesPage.clickConfirmDelete();
    await openingTypesPage.page.waitForSelector(openingTypesPage.successPanel, { timeout: 15000 });
    await logWithColor(testInfo, 'Delete confirmed.');

    await logWithColor(testInfo, 'Verifying success message...');
    await expect(openingTypesPage.getSuccessMessage()).resolves.toBe(successMessage);

    await logWithColor(testInfo, `Verifying "${newData.name}" is no longer visible...`);
    await expect(openingTypesPage.page.locator(openingTypesPage.openingTypeRow(newData.name))).toBeHidden({ timeout: 5000 });
    await logWithColor(testInfo, 'Deletion successful.');
  });

  test('Deleting existing opening Type (In Use)', async ({ superAdminPage }, testInfo) => {
    const expectedDeleteFormTitle = `Delete Opening Type: ${typeToDeleteInUse}`;
    const expectedErrorMessage = openingTypesPage.deleteInUseError;

    await logWithColor(testInfo, `Attempting to delete in-use opening type: "${typeToDeleteInUse}"...`);
    await openingTypesPage.clickDeleteOpeningType(typeToDeleteInUse);
    await openingTypesPage.verifyFormTitle(expectedDeleteFormTitle);
    await logWithColor(testInfo, 'On delete confirmation page.');

    await openingTypesPage.clickConfirmDelete();
    await openingTypesPage.page.waitForSelector(openingTypesPage.errorSummary, { timeout: 15000 });

    await logWithColor(testInfo, 'Verifying "in use" error message...');
    await expect(openingTypesPage.getFirstErrorSummaryListItemText()).resolves.toBe(expectedErrorMessage);
    await logWithColor(testInfo, 'In-use deletion error verified.');

    await openingTypesPage.waitForPageLoad();
  });

  test('Editing opening type with the name already exist', async ({ superAdminPage }, testInfo) => {
    const expectedFormTitle = `Editing Opening Type: ${typeToEdit}`;
    const expectedErrorMessage = openingTypesPage.duplicateError;

    await logWithColor(testInfo, `Clicking edit for: ${typeToEdit}`);
    await openingTypesPage.clickEditOpeningType(typeToEdit);
    await openingTypesPage.verifyFormTitle(expectedFormTitle);
    await logWithColor(testInfo, 'On edit form. Clearing fields...');
    await openingTypesPage.clearForm();
    await logWithColor(testInfo, `Entering existing name: "${typeToEditDuplicateTarget}"...`);
    await openingTypesPage.fillForm({ name: typeToEditDuplicateTarget });

    await logWithColor(testInfo, 'Attempting to save duplicate name via edit...');
    await openingTypesPage.clickSave();
    await openingTypesPage.page.waitForSelector(openingTypesPage.errorSummary, { timeout: 15000 });

    await logWithColor(testInfo, 'Verifying duplicate error message...');
    await expect(openingTypesPage.getFirstErrorSummaryListItemText()).resolves.toBe(expectedErrorMessage);
    await logWithColor(testInfo, 'Duplicate name error verified.');
  });
});
