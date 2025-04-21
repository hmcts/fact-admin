// src/test/e2e/tests/emails.spec.js
/**
 * @file Email Addresses Tab Functionality Tests
 * @description This spec tests adding, removing, reordering, and validating
 *              email entries via the 'Emails' tab in the court edit page.
 *              It replaces the legacy Gherkin feature 'super_admin/email-addresses.feature'.
 *
 * @dependencies
 * - Requires Super Admin authentication ('superAdminPage' fixture).
 * - Tests run serially (`test.describe.serial`) as they modify email data for the
 *   *same court* (`barnet-civil-and-family-courts-centre`) sequentially.
 * - Uses `EmailsPage` and `LoginPage` Page Object Models.
 * - Relies on `logWithColor` for enhanced logging.
 *
 * @challenges_and_solutions
 * - **Dynamic Element Stability:** Initial tests faced significant flakiness when adding
 *   multiple email entries dynamically before saving. The state of the first entry was
 *   often lost or reset before form submission, leading to validation errors or missing
 *   data after save.
 *     - *Initial Workarounds:* `waitForTimeout`, `.focus()`, clicking unrelated elements.
 *       These proved inconsistent.
 *     - *Current Solution:* Using Playwright's `waitForLoadState('networkidle')` after
 *       adding the second dynamic row and before the *first* save operation proved
 *       most reliable. This waits for associated JS/network activity to settle.
 *       Subsequent saves (after removes/moves) did not require this extensive wait.
 * - **Cleanup Reliability (`beforeEach`):** Ensuring a clean state was challenging.
 *   Simply clicking 'Remove' and 'Save' sometimes resulted in the backend not
 *   persisting the deletion, even with a 200 OK response.
 *     - *Initial Workarounds:* Loops checking client-side counts before saving (unreliable
 *       due to DOM timing), complex polling.
 *     - *Current Solution (`removeAllEmailsAndSave` in POM):*
 *       1. Uses a `while` loop to click all visible 'Remove' buttons client-side.
 *       2. Saves the state ONCE.
 *       3. Waits for the save network response (200 OK).
 *       4. **Crucially: Reloads the page.**
 *       5. **Re-activates the 'Emails' tab and waits for the associated AJAX call**
 *          (using `waitForEmailsAjaxLoad`) to ensure the content reflects the server state.
 *       6. Performs the final verification (`toHaveCount(1)`) only *after* the reload
 *          and AJAX wait. This makes the cleanup dependent on the true server state.
 * - **Reordering:** The client-side JavaScript for move up/down might also have timing
 *   issues. The tests include waits after move clicks and a check for errors after saving
 *   a reordered state, although the primary `networkidle` wait likely mitigates most issues here now.
 *
 * @notes_for_future_developers
 * - Be mindful of timing issues if tests become flaky, especially around adding/removing rows.
 * - The `waitForLoadState('networkidle')` before the first save after adding two rows is critical.
 * - The `reload` and `waitForEmailsAjaxLoad` in the `removeAllEmailsAndSave` cleanup are essential for stability.
 * - If move/reorder tests fail, investigate the state *before* the save after the move action.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { EmailsPage } = require('../pages/emails-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

test.describe.serial('Email Addresses Functionality', () => {
  const courtSlug = 'barnet-civil-and-family-courts-centre';
  const courtName = 'Barnet Civil and Family Courts Centre';
  const editUrl = `/courts/${courtSlug}/edit`;
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';

  const successMessage = 'Emails updated';

  // Test Data based on Gherkin Scenarios
  const email1Data = { descriptionIndex: 6, address: 'abs@gmail.com', explanation: 'County Court', explanationCy: 'Llys sirol' }; // Index 6 -> "Enquiries"
  const email2Data = { descriptionIndex: 8, address: 'functional.test1@testing.com', explanation: 'Testing - English', explanationCy: 'Testing - Welsh' }; // Index 8 -> "Family public law (children)"
  const reorder1Data = { descriptionIndex: 2, address: 'functional.test1@testing.com', explanation: 'Test 1 - English', explanationCy: 'Test 1 - Welsh' }; // Index 2 -> "Admin"
  const reorder2Data = { descriptionIndex: 3, address: 'functional.test2@testing.com', explanation: 'Test 2 - English', explanationCy: 'Test 2 - Welsh' }; // Index 3 -> "Applications"
  const duplicateEmail = 'test@gmail.com';

  let emailsPage;

  // Runs before each test. Navigates, potentially re-logs in, goes to the court page, clicks tab, cleans up emails.
  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    emailsPage = new EmailsPage(superAdminPage);

    // --- Navigation and Re-login Logic ---
    await logWithColor(testInfo, `Attempting navigation to: ${editUrl}`);
    await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });

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
      if (!superAdminPage.url().endsWith(editUrl)) {
        await logWithColor(testInfo, `Navigating again to target: ${editUrl}`);
        await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });
      }
    } else {
      await logWithColor(testInfo, 'Direct navigation successful.');
    }
    // --- End Conditional Re-login Logic ---

    await expect(superAdminPage.locator('#Main.fact-tabs')).toBeVisible({ timeout: 10000 });
    await expect(superAdminPage).toHaveURL(new RegExp(`.*${editUrl}$`));
    await expect(superAdminPage.locator(`h1:has-text("${courtName}")`)).toBeVisible();
    await logWithColor(testInfo, `Successfully on edit page for ${courtName}.`);

    await logWithColor(testInfo, 'Clicking Emails tab and waiting for AJAX...');
    await emailsPage.clickEmailsTabAndWaitForLoad(courtSlug);
    await logWithColor(testInfo, 'Emails tab clicked and initial content loaded.');

    // --- Cleanup Step: Remove existing entries ---
    await logWithColor(testInfo, 'Starting cleanup: Removing existing email entries...');
    await emailsPage.removeAllEmailsAndSave(courtSlug); // Includes reload and final check
    await logWithColor(testInfo, 'Cleanup complete.');
  });

  // --- Test Cases ---

  test('Add and remove Email Addresses', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Add and remove Email Addresses.');

    await logWithColor(testInfo, 'Filling details for first email entry...');
    await emailsPage.fillFirstEmptyEmail(email1Data);

    await logWithColor(testInfo, 'Adding and filling details for second email entry...');
    await emailsPage.addEmail(email2Data); // Includes wait within POM

    // Wait for network idle before the first save after dynamic add
    await logWithColor(testInfo, 'Waiting for network idle before saving...');
    await superAdminPage.waitForLoadState('networkidle', { timeout: 7000 });

    await logWithColor(testInfo, 'Saving entries...');
    await Promise.all([
      emailsPage.waitForSaveResponse(courtSlug),
      emailsPage.clickSave()
    ]);
    await emailsPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Entries saved successfully.');

    await logWithColor(testInfo, 'Verifying saved entries...');
    const fieldsetsLocator = emailsPage.page.locator(emailsPage.visibleFieldsets);
    await expect(fieldsetsLocator).toHaveCount(3);

    const secondLastDetails = await emailsPage.getEmailDetails(fieldsetsLocator.nth(0));
    expect(secondLastDetails).toEqual(email1Data);
    await logWithColor(testInfo, 'Verified second last email details.');

    const lastDetails = await emailsPage.getEmailDetails(fieldsetsLocator.nth(1));
    expect(lastDetails).toEqual(email2Data);
    await logWithColor(testInfo, 'Verified last email details.');

    await logWithColor(testInfo, 'Removing first saved email (index 0)...');
    await emailsPage.clickRemoveEmail(fieldsetsLocator.nth(0));
    await logWithColor(testInfo, 'Saving after first removal...');
    await Promise.all([
      emailsPage.waitForSaveResponse(courtSlug),
      emailsPage.clickSave()
    ]);
    await emailsPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Save successful after first removal.');
    await expect(emailsPage.page.locator(emailsPage.visibleFieldsets)).toHaveCount(2);

    await logWithColor(testInfo, 'Removing second saved email (now index 0)...');
    await emailsPage.clickRemoveEmail(emailsPage.getNthVisibleFieldset(0));
    await logWithColor(testInfo, 'Saving after second removal...');
    await Promise.all([
      emailsPage.waitForSaveResponse(courtSlug),
      emailsPage.clickSave()
    ]);
    await emailsPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Save successful after second removal.');
    await expect(emailsPage.page.locator(emailsPage.visibleFieldsets)).toHaveCount(1);

    await logWithColor(testInfo, 'Add/remove test completed successfully.');
  });

  test('Re-order email addresses', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Re-order email addresses.');

    await logWithColor(testInfo, 'Adding initial emails for reorder test...');
    await emailsPage.fillFirstEmptyEmail(reorder1Data);
    await emailsPage.addEmail(reorder2Data); // Includes wait within POM

    // Wait for network idle before the first save after dynamic add
    await logWithColor(testInfo, 'Waiting for network idle before initial save...');
    await superAdminPage.waitForLoadState('networkidle', { timeout: 7000 });

    await logWithColor(testInfo, 'Saving initial order...');
    await Promise.all([
      emailsPage.waitForSaveResponse(courtSlug),
      emailsPage.clickSave()
    ]);
    await emailsPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Initial order saved.');

    await logWithColor(testInfo, 'Verifying initial order...');
    let fieldsetsLocator = emailsPage.page.locator(emailsPage.visibleFieldsets);
    await expect(fieldsetsLocator).toHaveCount(3);
    expect(await emailsPage.getEmailDetails(fieldsetsLocator.nth(0))).toEqual(reorder1Data);
    expect(await emailsPage.getEmailDetails(fieldsetsLocator.nth(1))).toEqual(reorder2Data);
    await logWithColor(testInfo, 'Initial order verified.');

    await logWithColor(testInfo, 'Moving last entry (index 1) up...');
    await emailsPage.clickMoveUp(fieldsetsLocator.nth(1)); // POM includes pause

    await logWithColor(testInfo, 'Saving after move up...');
    await emailsPage.clickSave();

    // Check outcome after move up
    const successMoveUpLocator = emailsPage.page.locator(emailsPage.successMessageContainer);
    const errorMoveUpLocator = emailsPage.page.locator(emailsPage.errorSummary);
    await expect(successMoveUpLocator.or(errorMoveUpLocator)).toBeVisible({ timeout: 15000 });
    if (await errorMoveUpLocator.isVisible()) {
      const errors = await emailsPage.getErrorSummaryMessages();
      throw new Error(`Save after 'Move Up' failed with validation errors: ${errors.join(', ')}`);
    }
    await emailsPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Order after move up saved.');

    await logWithColor(testInfo, 'Verifying order after move up...');
    fieldsetsLocator = emailsPage.page.locator(emailsPage.visibleFieldsets);
    await expect(fieldsetsLocator).toHaveCount(3);
    expect(await emailsPage.getEmailDetails(fieldsetsLocator.nth(0))).toEqual(reorder2Data);
    expect(await emailsPage.getEmailDetails(fieldsetsLocator.nth(1))).toEqual(reorder1Data);
    await logWithColor(testInfo, 'Order after move up verified.');

    await logWithColor(testInfo, 'Moving second last entry (now index 0) down...');
    await emailsPage.clickMoveDown(fieldsetsLocator.nth(0)); // POM includes pause

    await logWithColor(testInfo, 'Saving after move down...');
    await emailsPage.clickSave();

    // Check outcome after move down
    const successMoveDownLocator = emailsPage.page.locator(emailsPage.successMessageContainer);
    const errorMoveDownLocator = emailsPage.page.locator(emailsPage.errorSummary);
    await expect(successMoveDownLocator.or(errorMoveDownLocator)).toBeVisible({ timeout: 15000 });
    if (await errorMoveDownLocator.isVisible()) {
      const errors = await emailsPage.getErrorSummaryMessages();
      throw new Error(`Save after 'Move Down' failed with validation errors: ${errors.join(', ')}`);
    }
    await emailsPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Order after move down saved.');

    await logWithColor(testInfo, 'Verifying final order...');
    fieldsetsLocator = emailsPage.page.locator(emailsPage.visibleFieldsets);
    await expect(fieldsetsLocator).toHaveCount(3);
    expect(await emailsPage.getEmailDetails(fieldsetsLocator.nth(0))).toEqual(reorder1Data);
    expect(await emailsPage.getEmailDetails(fieldsetsLocator.nth(1))).toEqual(reorder2Data);
    await logWithColor(testInfo, 'Final order verified (back to original).');

    await logWithColor(testInfo, 'Reorder test completed successfully.');
  });

  test('Incomplete email type and address', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Incomplete email type and address.');
    const incompleteData = { address: 'incomplete@test.com' };

    await logWithColor(testInfo, 'Filling only address...');
    await emailsPage.fillFirstEmptyEmail(incompleteData); // Includes wait within POM

    await logWithColor(testInfo, 'Attempting to save incomplete entry...');
    await emailsPage.clickSave();

    await logWithColor(testInfo, 'Verifying error message...');
    await emailsPage.waitForErrorSummary();
    const expectedError = emailsPage.emptyTypeOrAddressErrorMsg;
    await emailsPage.checkErrorSummaryExact([expectedError]);
    await logWithColor(testInfo, 'Error summary verified.');

    const firstFieldset = emailsPage.getNthVisibleFieldset(0);
    await expect(emailsPage.getFieldError(firstFieldset.locator(emailsPage.descriptionSelect)))
      .resolves.toContain('Description is required');
    await logWithColor(testInfo, 'Field-level error verified.');

    await logWithColor(testInfo, 'Incomplete entry test completed successfully.');
  });

  test('Email format validation', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Email format validation.');
    const invalidFormatData = { descriptionIndex: 6, address: 'abcef' };
    const expectedSummaryError = 'Enter an email address in the correct format, like name@example.com';
    const expectedFieldError = emailsPage.getEmailAddressFormatErrorMsg;

    await logWithColor(testInfo, 'Filling with invalid email format...');
    await emailsPage.fillFirstEmptyEmail(invalidFormatData); // Includes wait within POM

    await logWithColor(testInfo, 'Attempting to save invalid format...');
    await emailsPage.clickSave();

    await logWithColor(testInfo, 'Verifying format validation errors...');
    await emailsPage.waitForErrorSummary();
    await emailsPage.checkErrorSummaryExact([expectedSummaryError]);
    await logWithColor(testInfo, 'Error summary verified.');

    const firstFieldset = emailsPage.getNthVisibleFieldset(0);
    await expect(emailsPage.getFieldError(firstFieldset.locator(emailsPage.addressInput)))
      .resolves.toContain(expectedFieldError);
    await logWithColor(testInfo, 'Field-level error verified.');

    await logWithColor(testInfo, 'Email format validation test completed successfully.');
  });

  test('Prevent duplicated entries being added', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Prevent duplicated email addresses.');
    const duplicateData = { descriptionIndex: 6, address: duplicateEmail };
    const expectedSummaryError = emailsPage.emailDuplicatedErrorMsg;
    const expectedFieldError = 'Duplicated address';

    await logWithColor(testInfo, 'Adding first email entry...');
    await emailsPage.fillFirstEmptyEmail(duplicateData); // Includes wait within POM

    await logWithColor(testInfo, 'Adding second email entry with the same address...');
    await emailsPage.addEmail({ ...duplicateData, descriptionIndex: 7 }); // Includes wait within POM

    // Wait for network idle before the save after dynamic add
    await logWithColor(testInfo, 'Waiting for network idle before saving duplicate...');
    await superAdminPage.waitForLoadState('networkidle', { timeout: 7000 });

    await logWithColor(testInfo, 'Attempting to save duplicated entries...');
    await emailsPage.clickSave();

    await logWithColor(testInfo, 'Verifying duplication errors...');
    await emailsPage.waitForErrorSummary();
    await emailsPage.checkErrorSummaryExact([expectedSummaryError]);
    await logWithColor(testInfo, 'Error summary verified.');

    await emailsPage.checkFieldErrorsAcrossFieldsets({
      0: { [emailsPage.addressInput]: expectedFieldError },
      1: { [emailsPage.addressInput]: expectedFieldError }
    });
    await logWithColor(testInfo, 'Field-level errors verified.');

    await logWithColor(testInfo, 'Duplicated entry prevention test completed successfully.');
  });

});
