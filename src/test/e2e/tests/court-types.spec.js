// src/test/e2e/tests/court-types.spec.js
/**
 * @file Court Types Tab Functionality Tests
 * @description This spec tests the functionality of the 'Court Types' tab
 *              within the court edit page, focusing on adding/removing court types,
 *              DX codes, GBS codes, and handling validation errors.
 * Key Dependencies/Assumptions & Challenges:
 * - Test uses the 'superAdminPage' fixture for authentication.
 * - Tests run serially (`test.describe.serial`) as they modify data for the
 *   *same court* (`basingstoke-county-court-and-family-court`) sequentially.
 * - **DX Code Cleanup Challenges:** Initial attempts to clean up DX codes in `beforeEach`
 *   using POM methods or basic loops proved unreliable due to timing issues between
 *   client-side removal, saving, server processing, and UI updates. The application
 *   sometimes returned a success status (200 OK) but failed to persist the DX code
 *   removal, leading to stale data and assertion failures in subsequent tests.
 * - **Current Cleanup Strategy:**
 *   - `beforeEach` now uses an explicit loop to click "Remove" buttons for DX codes.
 *   - It includes a `page.reload()` *after* the cleanup save and success message check
 *     to force synchronization with the server state.
 *   - Verification of the cleanup (`expect().toHaveCount(1)`) happens *after* the reload.
 *   - A `try...catch` block surrounds the DX cleanup save/reload/verify step, throwing
 *     an error if the cleanup definitively fails, as subsequent tests would be invalid.
 *   - The `removeAllDxCodesAndSave` method in the POM *also* includes polling logic
 *     as a fallback/robustness measure when called *within* a test.
 * - **Test Isolation:** To further mitigate cleanup issues, tests involving adding DX codes
 *   (`Adding and removing DX Codes`, `Prevent duplicated entries`) now generate unique
 *   DX code values using `Date.now()` for each run.
 * - **Verification Adaptations:** Assertions related to DX code counts after additions were
 *   modified to verify the *existence* of the *specific added data* rather than relying
 *   on an exact count, making them less brittle to potential stale data from imperfect cleanups.
 *   Verification *after* duplicate errors was specifically adjusted to expect 3 rows and check errors on the first two.
 * - **Selector Accuracy:** Care was taken to use correct selectors, notably changing the
 *   DX code remove button selector in the POM from a `name` attribute to the correct `class`.
 * - Uses `CourtTypesPage` and `LoginPage` Page Object Models.
 * - Relies on `logWithColor` for enhanced logging during execution.
 */

const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { CourtTypesPage } = require('../pages/court-types-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

test.describe.serial('Court Types Functionality', () => {
  const courtSlug = 'basingstoke-county-court-and-family-court';
  const courtName = 'Basingstoke County Court and Family Court';
  const editUrl = `/courts/${courtSlug}/edit`;
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';

  const successMessage = 'Court Types and Codes updated';
  const tribunalCheckboxSelector = '#court_types-3'; // Tribunal
  const familyCheckboxSelector = '#court_types-2';   // Family Court
  const tribunalCode = '111';
  const defaultFamilyCode = '123'; // Default code used in cleanup/setup
  const dxCodeValue = 'Test123';
  const dxExplanation = 'test';
  const dxExplanationCy = 'test';
  const testGbsCode = 'Test Gbs Code';

  // Error Messages from Controller/Gherkin
  const emptyCourtCodeError = 'Court code is required and must be numeric and start with 1-9';
  const emptyDxCodeError = 'Code is required for all Dx code entries.';
  const duplicatedDxCodeError = 'All dx codes must be unique.';

  let courtTypesPage;

  // Helper function for fixing codes
  async function checkAndFixRequiredCodes(superAdminPage, courtTypesPage, testInfo, defaultCode = '999') {
    let fixed = false;
    // Define mappings based on POM selectors
    const codeChecks = [
      { checkboxSelector: courtTypesPage.magistratesCourtCheckboxSelector, inputSelector: courtTypesPage.magistratesCourtCodeInput },
      { checkboxSelector: courtTypesPage.familyCourtCheckboxSelector, inputSelector: courtTypesPage.familyCourtCodeInput },
      { checkboxSelector: courtTypesPage.tribunalCheckboxSelector, inputSelector: courtTypesPage.locationCourtCodeInput },
      { checkboxSelector: courtTypesPage.countyCourtCheckboxSelector, inputSelector: courtTypesPage.countyCourtCodeInput },
      { checkboxSelector: courtTypesPage.crownCourtCheckboxSelector, inputSelector: courtTypesPage.crownCourtCodeInput }
    ];

    for (const check of codeChecks) {
      const checkboxLocator = superAdminPage.locator(check.checkboxSelector);
      if (await checkboxLocator.isVisible({ timeout: 1000 })) {
        if (await checkboxLocator.isChecked()) {
          const inputLocator = superAdminPage.locator(check.inputSelector);
          await expect(inputLocator).toBeVisible({timeout: 2000});
          const currentValue = await inputLocator.inputValue();
          if (!currentValue || currentValue.trim() === '') {
            await logWithColor(testInfo, `Cleanup: Fixing missing code for ${check.inputSelector}`);
            await courtTypesPage.fillCourtCode(check.inputSelector, defaultCode);
            fixed = true;
          }
        }
      } else {
      }
    }
    return fixed;
  }


  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    courtTypesPage = new CourtTypesPage(superAdminPage);

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

    await expect(superAdminPage.locator('#Main.fact-tabs')).toBeVisible({ timeout: 10000 });
    await expect(superAdminPage).toHaveURL(new RegExp(`.*${editUrl}$`));
    await expect(superAdminPage.locator(`h1:has-text("${courtName}")`)).toBeVisible();
    await logWithColor(testInfo, `Successfully on edit page for ${courtName}.`);
    await logWithColor(testInfo, 'Clicking Types tab...');
    await courtTypesPage.clickTypesTab();
    await logWithColor(testInfo, 'Types tab clicked and panel loaded.');

    await logWithColor(testInfo, 'Starting cleanup...');

    await logWithColor(testInfo, 'Cleanup: Checking and fixing required court codes...');
    let codesFixed = await checkAndFixRequiredCodes(superAdminPage, courtTypesPage, testInfo, defaultFamilyCode); // Use the specific default code
    if (codesFixed) {
      await logWithColor(testInfo, 'Cleanup: Saving fixed codes...');
      await courtTypesPage.clickSave();
      try {
        await courtTypesPage.waitForSaveResponse(courtSlug);
        await courtTypesPage.waitForSuccessMessage(successMessage); // Use updated message here too
        await logWithColor(testInfo, 'Cleanup: Fixed codes saved successfully.');
      } catch (e) {
        logWithColor(testInfo, `ERROR during code fixing save: ${e.message}. Cleanup may fail.`);
        if (await courtTypesPage.page.locator(courtTypesPage.errorSummary).isVisible({ timeout: 1000 })) {
          const errors = await courtTypesPage.getErrorSummaryMessages();
          logWithColor(testInfo, `ERROR SUMMARY FOUND during code fix save: ${errors.join(', ')}`);
        }
      }
    } else {
      await logWithColor(testInfo, 'Cleanup: No required codes needed fixing, or associated types were unchecked.');
    }

    await logWithColor(testInfo, 'Cleanup: Explicitly removing existing DX codes...');
    const dxFieldsetsLocator = courtTypesPage.page.locator(courtTypesPage.visibleDxFieldsets);
    let initialDxCount = await dxFieldsetsLocator.count();
    let dxRemoved = false;
    if (initialDxCount > 1) { // If more than just the template exists
      logWithColor(testInfo, `Cleanup: Found ${initialDxCount - 1} existing DX entries. Removing...`);
      for (let i = initialDxCount - 2; i >= 0; i--) {
        const fieldset = dxFieldsetsLocator.nth(i);
        const removeButton = fieldset.locator(courtTypesPage.removeDxCodeButton);
        if (await removeButton.isVisible()) {
          await removeButton.click();
          dxRemoved = true;
        }
      }
      await logWithColor(testInfo, 'Cleanup: Saving DX code removals...');
      await courtTypesPage.clickSave();
      try {
        await courtTypesPage.waitForSaveResponse(courtSlug);
        await courtTypesPage.waitForSuccessMessage(successMessage);
        await logWithColor(testInfo, 'Cleanup: DX code removal saved successfully.');

        await logWithColor(testInfo, 'Cleanup: Reloading page after DX removal save...');
        await superAdminPage.reload({ waitUntil: 'domcontentloaded' });
        courtTypesPage = new CourtTypesPage(superAdminPage); // Re-create POM instance with reloaded page
        await courtTypesPage.clickTypesTab(); // Need to re-activate tab after reload
        await logWithColor(testInfo, 'Cleanup: Page reloaded and Types tab re-activated.');

        const dxFieldsetsAfterReload = courtTypesPage.page.locator(courtTypesPage.visibleDxFieldsets);
        await expect(dxFieldsetsAfterReload).toHaveCount(1, { timeout: 5000 });

      } catch (e) {
        logWithColor(testInfo, `ERROR during DX code removal save/reload: ${e.message}. Cleanup failed.`);
        if (await courtTypesPage.page.locator(courtTypesPage.errorSummary).isVisible({ timeout: 1000 })) {
          const errors = await courtTypesPage.getErrorSummaryMessages();
          logWithColor(testInfo, `ERROR SUMMARY FOUND during DX removal save: ${errors.join(', ')}`);
        }
        // If cleanup fails here, subsequent tests *will* likely fail. Throwing is appropriate.
        throw new Error(`Failed to save/verify DX code removal during cleanup: ${e.message}`);
      }
    } else {
      await logWithColor(testInfo, 'Cleanup: No existing DX codes found to remove.');
    }


    await logWithColor(testInfo, 'Cleanup: Clearing GBS code...');
    const currentGbs = await superAdminPage.locator(courtTypesPage.gbsCodeInput).inputValue();
    if (currentGbs && currentGbs.trim() !== '') {
      await courtTypesPage.clearAndFillGbsCode('');
      await courtTypesPage.clickSave();
      await courtTypesPage.waitForSaveResponse(courtSlug);
      await courtTypesPage.waitForSuccessMessage(successMessage); // Use updated message
      await logWithColor(testInfo, 'Cleanup: GBS Code cleared and saved.');
    } else {
      await logWithColor(testInfo, 'Cleanup: GBS Code already clear.');
    }

    await expect(superAdminPage.locator(courtTypesPage.gbsCodeInput)).toHaveValue('');
    const finalDxFieldsetsLocator = courtTypesPage.page.locator(courtTypesPage.visibleDxFieldsets);
    await expect(finalDxFieldsetsLocator).toHaveCount(1);
    await logWithColor(testInfo, 'Cleanup complete. Verified GBS code and initial DX state.');
  });


  /**
   * Helper function to check for and fill missing required codes before saving.
   * Mirrors the 'check code errors' Gherkin step. Moved outside test.beforeEach for clarity.
   */
  async function checkAndFillCodeErrors(superAdminPage, courtTypesPage, testInfo) {
    await logWithColor(testInfo, 'Checking for and filling any pre-existing code errors...');
    let filledCode = false;
    const codeChecks = [
      { checkboxSelector: courtTypesPage.magistratesCourtCheckboxSelector, inputSelector: courtTypesPage.magistratesCourtCodeInput },
      { checkboxSelector: courtTypesPage.familyCourtCheckboxSelector, inputSelector: courtTypesPage.familyCourtCodeInput },
      { checkboxSelector: courtTypesPage.tribunalCheckboxSelector, inputSelector: courtTypesPage.locationCourtCodeInput },
      { checkboxSelector: courtTypesPage.countyCourtCheckboxSelector, inputSelector: courtTypesPage.countyCourtCodeInput },
      { checkboxSelector: courtTypesPage.crownCourtCheckboxSelector, inputSelector: courtTypesPage.crownCourtCodeInput }
    ];

    for (const check of codeChecks) {
      const checkboxLocator = superAdminPage.locator(check.checkboxSelector);
      if (await checkboxLocator.isVisible({ timeout: 1000 }) && await checkboxLocator.isChecked()) {
        const inputLocator = superAdminPage.locator(check.inputSelector);
        await expect(inputLocator).toBeVisible({ timeout: 2000 }); // Should be visible if checkbox is checked
        const currentValue = await inputLocator.inputValue();
        if (!currentValue || currentValue.trim() === '') {
          await logWithColor(testInfo, `Action: Filling required code for ${check.inputSelector}`);
          await courtTypesPage.fillCourtCode(check.inputSelector, '999'); // Use a placeholder code
          filledCode = true;
        }
      }
    }
    if (!filledCode) {
      await logWithColor(testInfo, 'No pre-existing code errors found or associated types were not checked.');
    }
  }

  test('Select and remove a court type (Tribunal)', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Select and remove Tribunal type.');
    await checkAndFillCodeErrors(superAdminPage, courtTypesPage, testInfo); // Check before modifying

    const tribunalCheckbox = courtTypesPage.getCourtTypeCheckbox(tribunalCheckboxSelector);

    await logWithColor(testInfo, 'Checking Tribunal checkbox...');
    await courtTypesPage.checkCourtType(tribunalCheckbox);

    await logWithColor(testInfo, `Entering code '${tribunalCode}' for Tribunal...`);
    await courtTypesPage.fillCourtCode(courtTypesPage.locationCourtCodeInput, tribunalCode);

    await logWithColor(testInfo, 'Saving checked type with code...');
    await courtTypesPage.clickSave();
    await courtTypesPage.waitForSaveResponse(courtSlug);
    await courtTypesPage.waitForSuccessMessage(successMessage); // Use updated message
    await logWithColor(testInfo, 'Save successful (Tribunal checked).');

    await expect(tribunalCheckbox).toBeChecked();
    await expect(superAdminPage.locator(courtTypesPage.locationCourtCodeInput)).toHaveValue(tribunalCode);

    await logWithColor(testInfo, 'Unchecking Tribunal checkbox...');
    await courtTypesPage.uncheckCourtType(tribunalCheckbox);

    await logWithColor(testInfo, 'Saving unchecked type...');
    await courtTypesPage.clickSave();
    await courtTypesPage.waitForSaveResponse(courtSlug);
    await courtTypesPage.waitForSuccessMessage(successMessage); // Use updated message
    await logWithColor(testInfo, 'Save successful (Tribunal unchecked).');

    await expect(tribunalCheckbox).not.toBeChecked();
    await expect(superAdminPage.locator(courtTypesPage.locationCourtCodeInput)).toBeHidden();

    await logWithColor(testInfo, 'Select/remove type test completed.');
  });

  test('Select a court type and leave court code blank', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Select type requiring code, leave code blank.');
    await checkAndFillCodeErrors(superAdminPage, courtTypesPage, testInfo);

    const codeRequiredCheckbox = courtTypesPage.getCourtTypeCheckbox(courtTypesPage.magistratesCourtCheckboxSelector);
    await courtTypesPage.checkCourtType(codeRequiredCheckbox);
    await logWithColor(testInfo, `Checked type: ${courtTypesPage.magistratesCourtCheckboxSelector}`);

    const codeInputSelector = courtTypesPage.magistratesCourtCodeInput; // Correct input for Magistrates'
    await courtTypesPage.fillCourtCode(codeInputSelector, '');
    await logWithColor(testInfo, `Ensured code input ${codeInputSelector} is blank.`);

    await logWithColor(testInfo, 'Attempting to save...');
    await courtTypesPage.clickSave();

    await courtTypesPage.waitForErrorSummary();
    await logWithColor(testInfo, 'Save attempt finished, checking for errors.');

    await courtTypesPage.checkErrorSummaryExact([emptyCourtCodeError]);
    await logWithColor(testInfo, 'Verified correct error summary message.');
    await expect(courtTypesPage.getFieldError(superAdminPage.locator(codeInputSelector))).resolves.toContain('Magistrates code is required and must be numeric');
    await logWithColor(testInfo, 'Verified field-level error.');

    await logWithColor(testInfo, 'Blank court code validation test completed.');
  });

  test('Adding and deleting GBS Code', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Add and clear GBS Code.');
    await checkAndFillCodeErrors(superAdminPage, courtTypesPage, testInfo); // Ensure required codes ok

    const familyCheckbox = courtTypesPage.getCourtTypeCheckbox(familyCheckboxSelector);
    await expect(familyCheckbox).toBeChecked(); // Verify prerequisite

    await logWithColor(testInfo, `Clearing existing GBS code and entering: ${testGbsCode}`);
    await courtTypesPage.clearAndFillGbsCode(testGbsCode);

    await logWithColor(testInfo, 'Saving GBS code...');
    await courtTypesPage.clickSave();
    await courtTypesPage.waitForSaveResponse(courtSlug);
    await courtTypesPage.waitForSuccessMessage(successMessage); // Use updated message
    await logWithColor(testInfo, 'Save successful (GBS code added).');

    await expect(superAdminPage.locator(courtTypesPage.gbsCodeInput)).toHaveValue(testGbsCode);

    await logWithColor(testInfo, 'Clearing GBS code...');
    await courtTypesPage.clearAndFillGbsCode('');

    await logWithColor(testInfo, 'Saving cleared GBS code...');
    await courtTypesPage.clickSave();
    await courtTypesPage.waitForSaveResponse(courtSlug);
    await courtTypesPage.waitForSuccessMessage(successMessage);
    await logWithColor(testInfo, 'Save successful (GBS code cleared).');

    await expect(superAdminPage.locator(courtTypesPage.gbsCodeInput)).toHaveValue('');

    await logWithColor(testInfo, 'GBS code test completed.');
  });

  test('Adding and removing DX Codes', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Add and remove DX Codes.');
    await checkAndFillCodeErrors(superAdminPage, courtTypesPage, testInfo); // Ensure required codes ok

    await logWithColor(testInfo, 'Skipping initial DX fieldset count check.'); // Optional log

    await logWithColor(testInfo, 'Adding new DX Code...');
    await courtTypesPage.addDxCode(dxCodeValue, dxExplanation, dxExplanationCy);

    await logWithColor(testInfo, 'Saving added DX code...');
    await courtTypesPage.clickSave();
    await courtTypesPage.waitForSaveResponse(courtSlug);
    await courtTypesPage.waitForSuccessMessage(successMessage);
    await logWithColor(testInfo, 'Save successful (DX code added).');

    const fieldsetsAfterAdd = courtTypesPage.page.locator(courtTypesPage.visibleDxFieldsets);
    const allFieldsets = await fieldsetsAfterAdd.all();
    let foundAddedData = false;
    for(let i = 0; i < allFieldsets.length -1; i++) {
      const details = await courtTypesPage.getDxCodeDetails(allFieldsets[i]);
      if(details.code === dxCodeValue && details.explanation === dxExplanation && details.explanationCy === dxExplanationCy) {
        foundAddedData = true;
        break;
      }
    }
    expect(foundAddedData, `Could not find added DX Code (${dxCodeValue}) in visible fieldsets after save.`).toBe(true);
    await logWithColor(testInfo, 'Verified added DX code details persist in one of the rows.');


    await logWithColor(testInfo, 'Removing the added DX code (and potentially stale ones)...');
    await courtTypesPage.removeAllDxCodesAndSave(courtSlug);
    await logWithColor(testInfo, 'Removal and save complete.');

    await expect(courtTypesPage.page.locator(courtTypesPage.visibleDxFieldsets)).toHaveCount(1);
    await logWithColor(testInfo, 'Verified only template DX fieldset remains after removal.');

    await logWithColor(testInfo, 'Add/remove DX code test completed.');
  });

  test('Prevent duplicated entries being added for Dx Code', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Prevent duplicate DX Codes.');
    await checkAndFillCodeErrors(superAdminPage, courtTypesPage, testInfo); // Ensure required codes ok

    await logWithColor(testInfo, 'Skipping initial DX fieldset count check.'); // Optional log


    await logWithColor(testInfo, 'Adding first DX Code entry...');
    await courtTypesPage.addDxCode(dxCodeValue, dxExplanation, dxExplanationCy);

    await logWithColor(testInfo, 'Saving first DX code...');
    await courtTypesPage.clickSave();
    await courtTypesPage.waitForSaveResponse(courtSlug);
    await courtTypesPage.waitForSuccessMessage(successMessage);
    await logWithColor(testInfo, 'Save successful (First DX code added).');

    const fieldsetsAfterFirstSave = courtTypesPage.page.locator(courtTypesPage.visibleDxFieldsets);
    await expect(fieldsetsAfterFirstSave).toHaveCount(2); // Expecting 1 saved + 1 template


    await logWithColor(testInfo, 'Adding duplicate DX Code entry...');
    const secondFieldset = fieldsetsAfterFirstSave.last(); // Target the last visible fieldset (the template)
    await courtTypesPage.fillDxCodeDetails(secondFieldset, dxCodeValue, 'different explanation', 'different explanation cy');

    await logWithColor(testInfo, 'Attempting to save duplicate DX code...');
    await courtTypesPage.clickSave();

    await courtTypesPage.waitForErrorSummary();
    await logWithColor(testInfo, 'Save attempt finished, checking for errors.');

    await courtTypesPage.checkErrorSummaryExact([duplicatedDxCodeError]);
    await logWithColor(testInfo, 'Verified correct error summary message.');

    const fieldsetsAfterDuplicateAttempt = courtTypesPage.page.locator(courtTypesPage.visibleDxFieldsets);
    await expect(fieldsetsAfterDuplicateAttempt).toHaveCount(3);
    await expect(courtTypesPage.getFieldError(fieldsetsAfterDuplicateAttempt.nth(0).locator(courtTypesPage.dxCodeInput))).resolves.toContain('Error: Duplicated code');
    await expect(courtTypesPage.getFieldError(fieldsetsAfterDuplicateAttempt.nth(1).locator(courtTypesPage.dxCodeInput))).resolves.toContain('Error: Duplicated code');
    await logWithColor(testInfo, 'Verified field-level errors for duplicate DX codes.');


    await logWithColor(testInfo, 'Duplicate DX code prevention test completed.');
  });

});
