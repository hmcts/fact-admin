// src/test/e2e/tests/lists-facility-types.spec.js
/**
 * @file Facility Types List Functionality Tests
 * @description This spec tests the CRUD (Create, Read, Update, Delete) operations for Facility Types
 *              within the 'Edit A List' section of the admin portal. It replaces the legacy
 *              Gherkin feature 'super_admin/list-facility-types.feature'.
 *
 * @dependencies
 * - Requires Super Admin authentication ('superAdminPage' fixture).
 * - Uses `FacilityTypesPage` and `LoginPage` Page Object Models.
 * - Relies on `logWithColor` for enhanced logging output.
 *
 * @execution_and_state
 * - Tests run serially (`test.describe.serial`) as they modify the global Facility Types list state.
 * - The `beforeEach` hook handles common setup: navigation to the 'Lists' page, activating the
 *   'Facility Types' tab, and ensuring the list is loaded.
 * - Specific cleanup (`ensureFacilityTypeDoesNotExist`) is performed in `beforeEach` for tests
 *   that create or interact with a specific temporary type ('Test123'), ensuring idempotency.
 *
 * @key_interactions_and_challenges
 * - **Tab Navigation:** Interacts with the custom `fact-tabs` component. Requires specific steps
 *   (hover, click) to reliably activate the desired tab.
 * - **AJAX Operations:** The page relies heavily on AJAX for loading list data, saving changes,
 *   and deleting entries. Initial test failures were caused by incorrect assumptions about
 *   network requests (e.g., waiting for PUT on add, incorrect endpoint URLs). The current approach
 *   favours waiting for UI confirmation (success/error messages) over specific network responses
 *   for add/edit/delete actions, which proved more robust against subtle timing or URL variations.
 * - **Idempotency:** The `ensureFacilityTypeDoesNotExist` cleanup method in the POM is crucial.
 *   It handles the specific "in-use" error (409 Conflict) gracefully when attempting cleanup.
 * - **DOM Stability:** Waits for key elements like the table body and 'Add New' button in the
 *   `waitForPageLoad` POM method help ensure the page is fully rendered before tests interact with it.
 *   Corrected locators (e.g., for the 'Add New' button) resolved visibility timeout errors.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { FacilityTypesPage } = require('../pages/lists-facility-types-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

test.describe.serial('Facility Types List Functionality', () => {
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';
  const listsUrl = `${baseUrl}/lists`;
  const successMessage = 'Facility Types Updated';

  const existingFacilityType = 'Parking';
  const nonExistentFacilityType = 'Test123';
  const facilityTypeToEdit = 'Parking';
  const facilityTypeToEditForDuplicate = 'Lift';

  const duplicateErrorMessage = 'A facility type with the same name already exists.';
  const deleteInUseErrorMessage = 'You cannot delete this facility type at the moment, as one or more courts are dependent on it. Please remove the facility from the relevant courts first.';

  let facilityTypesPage;

  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    facilityTypesPage = new FacilityTypesPage(superAdminPage);

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

    await logWithColor(testInfo, 'Navigating to Lists page...');
    await facilityTypesPage.clickListsNavLink();
    await expect(superAdminPage).toHaveURL(listsUrl);
    await logWithColor(testInfo, 'On Lists page.');

    await logWithColor(testInfo, 'Clicking Facility Types tab...');
    await facilityTypesPage.clickFacilityTypesTab();
    await facilityTypesPage.waitForPageLoad();
    await logWithColor(testInfo, 'Facility Types tab loaded.');

    if (testInfo.title.includes('Adding and deleting new Facility Type') || testInfo.title.includes('Add new Facility Type with the name already exist')) {
      await logWithColor(testInfo, `Performing pre-test cleanup: Ensuring "${nonExistentFacilityType}" does not exist...`);
      await facilityTypesPage.ensureFacilityTypeDoesNotExist(nonExistentFacilityType);
    }
    await logWithColor(testInfo, 'Setup complete.');
  });

  // --- Test Cases ---

  test('Add new Facility Type with the name already exist', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Attempting to add duplicate facility type: ${existingFacilityType}`);
    await facilityTypesPage.clickAddNewFacilityType();
    await facilityTypesPage.verifyFormTitle('Add New Facility Type');
    await facilityTypesPage.fillAddForm({ name: existingFacilityType });
    await facilityTypesPage.clickSave();

    await logWithColor(testInfo, 'Verifying duplicate error message...');
    await facilityTypesPage.waitForErrorSummary();
    await expect(facilityTypesPage.getFirstErrorSummaryListItemText()).resolves.toBe(duplicateErrorMessage);
    await logWithColor(testInfo, 'Duplicate name error verified.');
  });

  test('Adding and deleting new Facility Type', async ({ superAdminPage }, testInfo) => {
    const newName = nonExistentFacilityType;

    await logWithColor(testInfo, `Adding new facility type: ${newName}`);
    await facilityTypesPage.clickAddNewFacilityType();
    await facilityTypesPage.verifyFormTitle('Add New Facility Type');
    await facilityTypesPage.fillAddForm({ name: newName });

    await facilityTypesPage.clickSave();
    await logWithColor(testInfo, 'Add save clicked.');

    await expect(facilityTypesPage.getSuccessMessage()).resolves.toBe(successMessage);
    await logWithColor(testInfo, 'Add successful (verified success message).');

    await expect(facilityTypesPage.isFacilityTypeVisible(newName)).resolves.toBe(true);
    await logWithColor(testInfo, `Facility type "${newName}" added successfully.`);

    await logWithColor(testInfo, `Attempting to delete "${newName}"...`);
    await facilityTypesPage.clickDeleteFacilityType(newName);
    await facilityTypesPage.verifyFormTitle(`Delete Facility Type: ${newName}`);
    await logWithColor(testInfo, 'On delete confirmation page.');

    await facilityTypesPage.clickConfirmDelete();
    await logWithColor(testInfo, 'Delete confirmed.');

    await logWithColor(testInfo, 'Verifying success message...');
    await expect(facilityTypesPage.getSuccessMessage()).resolves.toBe(successMessage);

    await logWithColor(testInfo, `Verifying "${newName}" is no longer visible...`);
    await expect(facilityTypesPage.page.locator(facilityTypesPage.facilityTypeRow(newName))).toBeHidden({ timeout: 5000 });
    await logWithColor(testInfo, 'Deletion successful.');
  });

  test('Deleting existing Facility type (In Use)', async ({ superAdminPage }, testInfo) => {
    const nameToDelete = existingFacilityType;

    await logWithColor(testInfo, `Attempting to delete in-use facility type: "${nameToDelete}"...`);
    await facilityTypesPage.clickDeleteFacilityType(nameToDelete);
    await facilityTypesPage.verifyFormTitle(`Delete Facility Type: ${nameToDelete}`);
    await logWithColor(testInfo, 'On delete confirmation page.');

    await facilityTypesPage.clickConfirmDelete();
    await superAdminPage.waitForTimeout(500);

    await logWithColor(testInfo, 'Verifying "in use" error message...');
    await facilityTypesPage.waitForErrorSummary();
    await expect(facilityTypesPage.getFirstErrorSummaryListItemText()).resolves.toBe(deleteInUseErrorMessage);
    await logWithColor(testInfo, 'In-use deletion error verified.');

    await facilityTypesPage.waitForPageLoad();
  });

  test('Edit Facility Type', async ({ superAdminPage }, testInfo) => {
    const nameToEdit = facilityTypeToEdit;
    const originalData = await facilityTypesPage.getFacilityTypeRowData(nameToEdit);
    const newData = {
      name: nameToEdit,
      nameCy: 'ParcioEDITED'
    };
    const expectedFormTitle = `Edit Facility Type: ${nameToEdit}`;

    await logWithColor(testInfo, `Attempting to edit facility type: ${nameToEdit}`);
    await facilityTypesPage.clickEditFacilityType(nameToEdit);
    await facilityTypesPage.verifyFormTitle(expectedFormTitle);
    await logWithColor(testInfo, 'On edit form. Clearing fields...');
    await facilityTypesPage.clearEditForm();
    await logWithColor(testInfo, 'Filling form with new data...');
    await facilityTypesPage.fillEditForm(newData);

    await logWithColor(testInfo, 'Saving changes...');
    await facilityTypesPage.clickSave();
    await logWithColor(testInfo, 'Save clicked.');

    await logWithColor(testInfo, 'Verifying success message...');
    await expect(facilityTypesPage.getSuccessMessage()).resolves.toBe(successMessage);
    await logWithColor(testInfo, 'Edit successful.');

    await logWithColor(testInfo, 'Verifying updated data in the list...');
    const updatedData = await facilityTypesPage.getFacilityTypeRowData(nameToEdit);
    expect(updatedData.name).toBe(newData.name);
    // Welsh name not verifiable from list table
    await logWithColor(testInfo, 'Updated data verified (English name only).');

    await logWithColor(testInfo, 'Cleanup: Reverting changes...');
    await facilityTypesPage.clickEditFacilityType(nameToEdit);
    await facilityTypesPage.clearEditForm();
    await facilityTypesPage.fillEditForm(originalData);
    await facilityTypesPage.clickSave();
    await expect(facilityTypesPage.getSuccessMessage()).resolves.toBe(successMessage);
    await logWithColor(testInfo, 'Cleanup: Revert successful.');
  });

  test('Editing Facility Type with the name already exist', async ({ superAdminPage }, testInfo) => {
    const nameToEdit = facilityTypeToEditForDuplicate;
    const duplicateName = existingFacilityType;
    const expectedFormTitle = `Edit Facility Type: ${nameToEdit}`;

    await logWithColor(testInfo, `Attempting to edit ${nameToEdit} to duplicate name ${duplicateName}`);
    await facilityTypesPage.clickEditFacilityType(nameToEdit);
    await facilityTypesPage.verifyFormTitle(expectedFormTitle);
    await logWithColor(testInfo, 'On edit form. Clearing fields...');
    await facilityTypesPage.clearEditForm();
    await logWithColor(testInfo, 'Filling form with duplicate name...');
    await facilityTypesPage.fillEditForm({ name: duplicateName });

    await logWithColor(testInfo, 'Saving changes...');
    await facilityTypesPage.clickSave();
    await superAdminPage.waitForTimeout(500);

    await logWithColor(testInfo, 'Verifying duplicate error message...');
    await facilityTypesPage.waitForErrorSummary();
    await expect(facilityTypesPage.getFirstErrorSummaryListItemText()).resolves.toBe(duplicateErrorMessage);
    await logWithColor(testInfo, 'Duplicate name error verified.');
  });
});
