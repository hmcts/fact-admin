// src/test/e2e/tests/lists-contact-types.spec.js
/**
 * @file Contact Types List Functionality Tests
 * @description This spec tests the CRUD (Create, Read, Update, Delete) operations for Contact Types
 *              within the 'Edit A List' section of the admin portal, accessed via the 'Lists' main navigation link.
 *              It replaces the legacy Gherkin feature 'super_admin/list-contact-types.feature'.
 *
 * @dependencies
 * - Requires Super Admin authentication ('superAdminPage' fixture).
 * - Uses `ContactTypesPage` Page Object Model for interacting with the Contact Types list and forms.
 * - Uses `LoginPage` POM for potential re-logins if the session expires.
 * - Relies on the custom `logWithColor` function from `auth.setup.js` for enhanced logging.
 *
 * @execution_and_state
 * - Tests run serially (`test.describe.serial`) as they modify the global Contact Types list state.
 *   Adding, editing, or attempting to delete the same contact type across tests requires sequential execution
 *   to ensure predictable state and avoid race conditions.
 * - The `beforeEach` hook handles common setup:
 *   - Navigates to the application root and checks login status (handles re-login if necessary).
 *   - Navigates to the main 'Lists' page.
 *   - Clicks the 'Contact Types' tab and waits for the associated AJAX request to load the list content.
 * - Specific cleanup (`ensureContactTypeDoesNotExist` in the POM) is performed within `beforeEach` for tests
 *   that create or interact with a temporary contact type ('Test123'), ensuring test idempotency.
 *
 * @key_interactions_and_challenges
 * - **Tab Navigation:** Interacts with the custom `fact-tabs` component. This requires hovering over the
 *   currently visible tab title to reveal the list of available tabs before clicking the specific 'Contact Types' link.
 * - **AJAX Operations:** Saving new/edited types, deleting types, and initially loading the list content are all
 *   handled via asynchronous AJAX requests. The tests use explicit waits (`waitForResponse`, `waitForPageLoad`,
 *   POM method waits like `getSuccessMessage`, `waitForErrorSummary`) to ensure these operations complete
 *   before proceeding with subsequent actions or assertions.
 * - **DOM Stability:** Initial development encountered 'Element is not attached to the DOM' errors, particularly
 *   when trying to interact with list items (e.g., clicking delete) immediately after the page/tab loaded. This was
 *   resolved by enhancing the `waitForPageLoad` method to wait for the table body and first row, adding a network idle
 *   check, and removing explicit `scrollIntoViewIfNeeded` calls, relying instead on Playwright's built-in actionability checks.
 * - **Strict Mode Violation:** A 'strict mode violation' error occurred because the locator for finding table rows
 *   by name used a substring match (`:has-text()`), which matched multiple rows when a name like "Enquiries" was
 *   part of other names (e.g., "Possession enquiries"). This was fixed by using an exact match selector (`:text-is()`)
 *   in the `contactTypeRow` POM locator.
 * - **Error Handling:** Tests verify both success messages (via confirmation panels) and error messages
 *   (within the GOV.UK error summary component), including specific checks for duplicate names and
 *   'in-use' deletion errors (HTTP 409). The cleanup function handles the 409 error gracefully.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { ContactTypesPage } = require('../pages/lists-contact-types-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

test.describe.serial('Contact Types List Functionality', () => {
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';
  const listsUrl = `${baseUrl}/lists`;
  const successMessage = 'Contact Types Updated';

  // Test Data from Gherkin
  const contactTypeToEdit = 'Civil court';
  const contactTypeToAddDuplicate = 'Adoption';
  const contactTypeToDeleteNew = 'Test123';
  const contactTypeToDeleteInUse = 'Adoption';
  const contactTypeToEditDuplicate = 'Enquiries';

  // Error messages from Gherkin/Controller
  const duplicateErrorMessage = 'A contact type with the proposed name already exists. The name must be unique.';
  const deleteInUseErrorMessage = 'You cannot delete this contact type at the moment, as one or more courts are dependent on it. Please remove the contact type from the relevant courts first';

  let contactTypesPage;

  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    contactTypesPage = new ContactTypesPage(superAdminPage);

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
    await contactTypesPage.clickListsNavLink();
    await expect(superAdminPage).toHaveURL(listsUrl);
    await logWithColor(testInfo, 'On Lists page.');

    // Navigate to Contact Types tab
    await logWithColor(testInfo, 'Clicking Contact Types tab...');
    await contactTypesPage.clickContactTypesTab();
    await contactTypesPage.waitForPageLoad();
    await logWithColor(testInfo, 'Contact Types tab loaded.');

    // --- Cleanup specific to tests ---
    if (testInfo.title.includes('Deleting new Contact Type') || testInfo.title.includes('Add new Contact Type with the name already exist')) {
      await logWithColor(testInfo, `Performing pre-test cleanup: Ensuring "${contactTypeToDeleteNew}" does not exist...`);
      await contactTypesPage.ensureContactTypeDoesNotExist(contactTypeToDeleteNew);
    }
    await logWithColor(testInfo, 'Setup complete.');
  });

  // --- Test Cases ---

  test('Edit Contact Type', async ({ superAdminPage }, testInfo) => {
    const editData = {
      name: contactTypeToEdit,
      nameCy: 'Llys sifil'
    };
    const expectedFormTitle = `Editing Contact Type: ${contactTypeToEdit}`;

    await logWithColor(testInfo, `Clicking edit for: ${contactTypeToEdit}`);
    await contactTypesPage.clickEditContactType(contactTypeToEdit);
    await contactTypesPage.verifyFormTitle(expectedFormTitle);
    await logWithColor(testInfo, 'On edit form. Clearing fields...');
    await contactTypesPage.clearForm();
    await logWithColor(testInfo, 'Filling form with new data...');
    await contactTypesPage.fillForm(editData);

    await logWithColor(testInfo, 'Saving changes...');
    const saveResponsePromise = contactTypesPage.waitForSaveResponse();
    await contactTypesPage.clickSave();
    const response = await saveResponsePromise;
    expect(response.status()).toBe(200);
    await logWithColor(testInfo, 'Save successful (HTTP 200).');

    await logWithColor(testInfo, 'Verifying success message...');
    await expect(contactTypesPage.getSuccessMessage()).resolves.toBe(successMessage);
    await logWithColor(testInfo, 'Edit successful.');
    await expect(contactTypesPage.isContactTypeVisible(contactTypeToEdit)).resolves.toBe(true);
  });

  test('Add new Contact Type with the name already exist', async ({ superAdminPage }, testInfo) => {
    const expectedFormTitle = 'Add New Contact Type';

    await logWithColor(testInfo, 'Clicking "Add Contact Type"...');
    await contactTypesPage.clickAddNewContactType();
    await contactTypesPage.verifyFormTitle(expectedFormTitle);
    await logWithColor(testInfo, `Entering existing name: "${contactTypeToAddDuplicate}"...`);
    await contactTypesPage.fillForm({ name: contactTypeToAddDuplicate });

    await logWithColor(testInfo, 'Attempting to save duplicate name...');
    await contactTypesPage.clickSave();
    await superAdminPage.waitForTimeout(500); // Allow UI to update after AJAX failure

    await logWithColor(testInfo, 'Verifying duplicate error message...');
    await contactTypesPage.waitForErrorSummary();
    await expect(contactTypesPage.getFirstErrorSummaryMessage()).resolves.toBe(duplicateErrorMessage);
    await logWithColor(testInfo, 'Duplicate name error verified.');
  });

  test('Deleting new Contact Type', async ({ superAdminPage }, testInfo) => {
    const newData = { name: contactTypeToDeleteNew, nameCy: 'testcy' };
    const expectedAddFormTitle = 'Add New Contact Type';
    const expectedDeleteFormTitle = `Delete Contact Type: ${contactTypeToDeleteNew}`;

    // Add
    await logWithColor(testInfo, `Adding new contact type: ${newData.name}`);
    await contactTypesPage.clickAddNewContactType();
    await contactTypesPage.verifyFormTitle(expectedAddFormTitle);
    await contactTypesPage.fillForm(newData);
    const addResponsePromise = contactTypesPage.waitForSaveResponse();
    await contactTypesPage.clickSave();
    const addResponse = await addResponsePromise;
    expect(addResponse.status()).toBe(200);
    await expect(contactTypesPage.getSuccessMessage()).resolves.toBe(successMessage);
    await expect(contactTypesPage.isContactTypeVisible(newData.name)).resolves.toBe(true);
    await logWithColor(testInfo, `Contact type "${newData.name}" added successfully.`);

    // Delete
    await logWithColor(testInfo, `Attempting to delete "${newData.name}"...`);
    await contactTypesPage.clickDeleteContactType(newData.name);
    await contactTypesPage.verifyFormTitle(expectedDeleteFormTitle);
    await logWithColor(testInfo, 'On delete confirmation page.');

    const deleteResponsePromise = contactTypesPage.waitForDeleteResponse();
    await contactTypesPage.clickConfirmDelete();
    const deleteResponse = await deleteResponsePromise;
    expect(deleteResponse.status()).toBe(200);
    await logWithColor(testInfo, 'Delete confirmed (HTTP 200).');

    await logWithColor(testInfo, 'Verifying success message...');
    await expect(contactTypesPage.getSuccessMessage()).resolves.toBe(successMessage);

    await logWithColor(testInfo, `Verifying "${newData.name}" is no longer visible...`);
    await expect(contactTypesPage.page.locator(contactTypesPage.contactTypeRow(newData.name))).toBeHidden({ timeout: 5000 });
    await logWithColor(testInfo, 'Deletion successful.');
  });

  test('Deleting existing Contact Type (In Use)', async ({ superAdminPage }, testInfo) => {
    const expectedDeleteFormTitle = `Delete Contact Type: ${contactTypeToDeleteInUse}`;

    await logWithColor(testInfo, `Attempting to delete in-use contact type: "${contactTypeToDeleteInUse}"...`);
    await contactTypesPage.clickDeleteContactType(contactTypeToDeleteInUse);
    await contactTypesPage.verifyFormTitle(expectedDeleteFormTitle);
    await logWithColor(testInfo, 'On delete confirmation page.');

    await contactTypesPage.clickConfirmDelete();
    await superAdminPage.waitForTimeout(500); // Allow UI to update after AJAX failure

    await logWithColor(testInfo, 'Verifying "in use" error message...');
    await contactTypesPage.waitForErrorSummary();
    await expect(contactTypesPage.getFirstErrorSummaryMessage()).resolves.toBe(deleteInUseErrorMessage);
    await logWithColor(testInfo, 'In-use deletion error verified.');

    await contactTypesPage.waitForPageLoad();
  });

  test('Editing contact type with the name already exist', async ({ superAdminPage }, testInfo) => {
    const expectedFormTitle = `Editing Contact Type: ${contactTypeToEditDuplicate}`;

    await logWithColor(testInfo, `Clicking edit for: ${contactTypeToEditDuplicate}`);
    await contactTypesPage.clickEditContactType(contactTypeToEditDuplicate);
    await contactTypesPage.verifyFormTitle(expectedFormTitle);
    await logWithColor(testInfo, 'On edit form. Clearing fields...');
    await contactTypesPage.clearForm();
    await logWithColor(testInfo, `Entering existing name: "${contactTypeToAddDuplicate}"...`);
    await contactTypesPage.fillForm({ name: contactTypeToAddDuplicate });

    await logWithColor(testInfo, 'Attempting to save duplicate name via edit...');
    await contactTypesPage.clickSave();
    await superAdminPage.waitForTimeout(500); // Allow UI to update after AJAX failure

    await logWithColor(testInfo, 'Verifying duplicate error message...');
    await contactTypesPage.waitForErrorSummary();
    await expect(contactTypesPage.getFirstErrorSummaryMessage()).resolves.toBe(duplicateErrorMessage);
    await logWithColor(testInfo, 'Duplicate name error verified.');
  });
});
