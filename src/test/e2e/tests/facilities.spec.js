// src/test/e2e/tests/facilities.spec.js
/**
 * @file Facilities Tab Functionality Tests
 * @description This spec tests adding, removing, validating, and verifying
 *              facility entries via the 'Facilities' tab in the court edit page.
 *              It replaces the legacy Gherkin feature 'super_admin/facilities.feature'.
 *
 * @dependencies
 * - Requires Super Admin authentication ('superAdminPage' fixture).
 * - Tests run serially (`test.describe.serial`) as they modify facility data for the
 *   *same court* (`basingstoke-county-court-and-family-court`) sequentially.
 * - Uses `FacilitiesPage` and `LoginPage` Page Object Models.
 * - Relies on `logWithColor` for enhanced logging.
 *
 * @key_concepts_and_challenges
 * - **Idempotency:** The `beforeEach` hook uses the `removeAllFacilitiesAndSave` POM method
 *   to ensure a clean state before each test. This method includes clicking remove buttons,
 *   saving, reloading the page, re-activating the tab, and waiting for AJAX content to load,
 *   making it robust against timing issues and ensuring verification against the true server state.
 * - **TinyMCE Interaction:** Facility descriptions use TinyMCE rich text editors loaded in iframes.
 *   The `FacilitiesPage` POM handles interactions with these iframes, including determining the
 *   correct iframe index (`_get1BasedIndex`) based on the fieldset's position among all visible fieldsets.
 *   This dynamic index calculation is crucial as IDs might not be sequential or predictable,
 *   especially for the initially loaded template row. Element handle comparison is used
 *   within `_get1BasedIndex` for reliable identification.
 * - **Dynamic Rows:** The tests involve adding new facility rows dynamically. Waits (`expect().toHaveCount`)
 *   are used after clicking the 'Add' button to ensure the new row appears in the DOM before interacting with it.
 * - **Validation:** Tests cover various validation scenarios:
 *   - Blank description/name fields.
 *   - Duplicate facility names (checking against both pre-existing/saved entries and newly added, unsaved entries).
 *
 * @notes_for_future_developers
 * - Be mindful of potential timing issues if tests related to dynamic rows or iframe interactions become flaky.
 * - The `_get1BasedIndex` helper in the POM is critical for correct iframe interaction; ensure its logic remains sound
 *   if the fieldset structure changes.
 * - Ensure the `removeAllFacilitiesAndSave` cleanup method remains reliable. If backend persistence issues arise,
 *   this method might need further adjustment or API-based cleanup might be considered.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { FacilitiesPage } = require('../pages/facilities-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

test.describe.serial('Facilities Functionality', () => {
  const courtSlug = 'basingstoke-county-court-and-family-court';
  const courtName = 'Basingstoke County Court and Family Court';
  const editUrl = `/courts/${courtSlug}/edit`;
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';

  const successMessage = 'Court Facilities updated';

  // Test Data based on Gherkin Scenarios & observed values
  const facility1Name = 'Parking'; // Facility ID: 46
  const facility2Name = 'Video facilities'; // Facility ID: 63
  const commonEnglishDesc = 'englishDescription';
  const commonWelshDesc = 'welshDescription';

  // Error Messages from Gherkin/Controller
  const duplicateErrorSummary = 'All facilities must be unique.';
  const duplicateFieldError = 'Duplicated facility';
  const blankErrorSummary = 'Name and description are required for all court facilities.';
  const blankDescriptionError = 'Description is required';
  const blankNameError = 'Name is required';

  let facilitiesPage;

  // Runs before each test. Navigates, potentially re-logs in, goes to the court page, clicks tab, cleans up facilities.
  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    facilitiesPage = new FacilitiesPage(superAdminPage);

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

    await logWithColor(testInfo, 'Clicking Facilities tab and waiting for AJAX...');
    await facilitiesPage.clickFacilitiesTabAndWaitForLoad(courtSlug);
    await logWithColor(testInfo, 'Facilities tab clicked and initial content loaded.');

    // --- Cleanup Step: Remove existing entries ---
    await logWithColor(testInfo, 'Starting cleanup: Removing existing facility entries...');
    await facilitiesPage.removeAllFacilitiesAndSave(courtSlug); // Includes reload and final check
    await logWithColor(testInfo, 'Cleanup complete.');
  });

  // --- Test Cases ---

  test('Add and remove facilities successfully', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Add and remove facilities successfully.');

    expect(await facilitiesPage.getVisibleFieldsetCount()).toBe(1);

    await logWithColor(testInfo, `Adding facility 1: ${facility1Name}`);
    const firstFieldset = facilitiesPage.getLastVisibleFieldset();
    await facilitiesPage.fillFacilityDetails(firstFieldset, {
      nameLabel: facility1Name,
      englishDescription: commonEnglishDesc,
      welshDescription: commonWelshDesc
    });

    await logWithColor(testInfo, `Adding facility 2: ${facility2Name}`);
    await facilitiesPage.clickAddNewFacility();
    const secondFieldset = facilitiesPage.getLastVisibleFieldset();
    await facilitiesPage.fillFacilityDetails(secondFieldset, {
      nameLabel: facility2Name,
      englishDescription: commonEnglishDesc,
      welshDescription: commonWelshDesc
    });

    await logWithColor(testInfo, 'Saving added facilities...');
    await facilitiesPage.clickSave();
    await facilitiesPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Facilities saved successfully.');

    await logWithColor(testInfo, 'Verifying saved facilities...');
    expect(await facilitiesPage.getVisibleFieldsetCount()).toBe(3); // 2 saved + 1 template
    const savedFieldset1 = facilitiesPage.getNthVisibleFieldset(0);
    const savedFieldset2 = facilitiesPage.getNthVisibleFieldset(1);

    const details1 = await facilitiesPage.getFacilityDetails(savedFieldset1);
    expect(details1.nameLabel).toBe(facility1Name);
    expect(details1.englishDescription).toBe(commonEnglishDesc);
    expect(details1.welshDescription).toBe(commonWelshDesc);

    const details2 = await facilitiesPage.getFacilityDetails(savedFieldset2);
    expect(details2.nameLabel).toBe(facility2Name);
    expect(details2.englishDescription).toBe(commonEnglishDesc);
    expect(details2.welshDescription).toBe(commonWelshDesc);
    expect(details1.nameValue).toBe('46'); // Verify actual ID for Parking

    await logWithColor(testInfo, 'Removing the two added facilities...');
    await facilitiesPage.clickRemoveFacility(savedFieldset2);
    await facilitiesPage.clickRemoveFacility(savedFieldset1);

    await logWithColor(testInfo, 'Saving after removal...');
    await facilitiesPage.clickSave();
    await facilitiesPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Facilities removed successfully.');

    await logWithColor(testInfo, 'Verifying no facility entries remain...');
    expect(await facilitiesPage.getVisibleFieldsetCount()).toBe(1); // Only template left
    await logWithColor(testInfo, 'Add/remove test completed successfully.');
  });

  test('Prevent duplicate facilities (DB + New)', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Prevent duplicate facilities (DB + New).');

    await logWithColor(testInfo, `Adding and saving initial facility: ${facility1Name}`);
    const firstFieldset = facilitiesPage.getLastVisibleFieldset();
    await facilitiesPage.fillFacilityDetails(firstFieldset, {
      nameLabel: facility1Name,
      englishDescription: commonEnglishDesc,
      welshDescription: commonWelshDesc
    });
    await facilitiesPage.clickSave();
    await facilitiesPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Initial facility saved.');
    expect(await facilitiesPage.getVisibleFieldsetCount()).toBe(2); // 1 saved + 1 template

    await logWithColor(testInfo, `Attempting to add duplicate facility: ${facility1Name} using template row`);
    const templateFieldset = facilitiesPage.getLastVisibleFieldset();
    await facilitiesPage.fillFacilityDetails(templateFieldset, {
      nameLabel: facility1Name,
      englishDescription: 'different desc',
      welshDescription: 'different welsh desc'
    });

    await logWithColor(testInfo, 'Attempting to save duplicate...');
    await facilitiesPage.clickSave();

    await logWithColor(testInfo, 'Verifying duplicate error messages...');
    await facilitiesPage.waitForErrorSummary();
    await facilitiesPage.checkErrorSummaryExact([duplicateErrorSummary]);
    await logWithColor(testInfo, 'Error summary verified.');

    const savedFieldset = facilitiesPage.getNthVisibleFieldset(0);
    const duplicateAttemptFieldset = facilitiesPage.getNthVisibleFieldset(1);
    await expect(facilitiesPage.getFieldError(savedFieldset, 'name')).resolves.toContain(duplicateFieldError);
    await expect(facilitiesPage.getFieldError(duplicateAttemptFieldset, 'name')).resolves.toContain(duplicateFieldError);
    await logWithColor(testInfo, 'Field-level errors verified.');

    await logWithColor(testInfo, 'Removing the duplicate attempt (clearing template)...');
    await facilitiesPage.clickClearFacility(duplicateAttemptFieldset);

    await logWithColor(testInfo, 'Removing the original saved entry...');
    await facilitiesPage.clickRemoveFacility(savedFieldset);

    await logWithColor(testInfo, 'Saving after clearing duplicate and removing original...');
    await facilitiesPage.clickSave();
    await facilitiesPage.waitForUpdateMessage(successMessage);
    await logWithColor(testInfo, 'Save successful after cleanup.');

    expect(await facilitiesPage.getVisibleFieldsetCount()).toBe(1);
    await logWithColor(testInfo, 'Duplicate (DB + New) test completed successfully.');
  });

  test('Prevent duplicate facilities (Both New)', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Prevent duplicate facilities (Both New).');

    await logWithColor(testInfo, `Adding first new facility (no save): ${facility1Name}`);
    const firstFieldset = facilitiesPage.getLastVisibleFieldset();
    await facilitiesPage.fillFacilityDetails(firstFieldset, {
      nameLabel: facility1Name,
      englishDescription: commonEnglishDesc,
      welshDescription: commonWelshDesc
    });

    await logWithColor(testInfo, `Adding second new facility (duplicate, no save): ${facility1Name}`);
    await facilitiesPage.clickAddNewFacility();
    const secondFieldset = facilitiesPage.getLastVisibleFieldset();
    await facilitiesPage.fillFacilityDetails(secondFieldset, {
      nameLabel: facility1Name,
      englishDescription: 'another desc',
      welshDescription: 'another welsh desc'
    });

    await logWithColor(testInfo, 'Attempting to save both new duplicate facilities...');
    await facilitiesPage.clickSave();

    await logWithColor(testInfo, 'Verifying duplicate error messages...');
    await facilitiesPage.waitForErrorSummary();
    await facilitiesPage.checkErrorSummaryExact([duplicateErrorSummary]);
    await logWithColor(testInfo, 'Error summary verified.');

    const errorFieldset1 = facilitiesPage.getNthVisibleFieldset(0);
    const errorFieldset2 = facilitiesPage.getNthVisibleFieldset(1);
    await expect(facilitiesPage.getFieldError(errorFieldset1, 'name')).resolves.toContain(duplicateFieldError);
    await expect(facilitiesPage.getFieldError(errorFieldset2, 'name')).resolves.toContain(duplicateFieldError);
    await logWithColor(testInfo, 'Field-level errors verified.');

    await logWithColor(testInfo, 'Duplicate (Both New) test completed successfully.');
  });

  test('Prevent blank entries being added', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test: Prevent blank entries.');

    await logWithColor(testInfo, 'Attempting to save with blank descriptions...');
    const firstFieldset = facilitiesPage.getLastVisibleFieldset();
    await facilitiesPage.fillFacilityDetails(firstFieldset, {
      nameLabel: facility1Name,
      englishDescription: '',
      welshDescription: ''
    });
    await facilitiesPage.clickSave();

    await logWithColor(testInfo, 'Verifying blank description errors...');
    await facilitiesPage.waitForErrorSummary();
    await facilitiesPage.checkErrorSummaryExact([blankErrorSummary]);
    await expect(facilitiesPage.getFieldError(firstFieldset, 'description')).resolves.toContain(blankDescriptionError);
    await logWithColor(testInfo, 'Blank description errors verified.');

    await logWithColor(testInfo, 'Clearing entry and attempting to save with blank name...');
    await facilitiesPage.clickClearFacility(firstFieldset);
    await superAdminPage.waitForTimeout(250);

    const clearedFieldset = facilitiesPage.getNthVisibleFieldset(0);
    await facilitiesPage.fillFacilityDetails(clearedFieldset, {
      // nameLabel: '', // Rely on default "Select..." being invalid
      englishDescription: commonEnglishDesc,
      welshDescription: commonWelshDesc
    });
    await facilitiesPage.clickSave();

    await logWithColor(testInfo, 'Verifying blank name errors...');
    await facilitiesPage.waitForErrorSummary();
    await facilitiesPage.checkErrorSummaryExact([blankErrorSummary]);
    await expect(facilitiesPage.getFieldError(clearedFieldset, 'name')).resolves.toContain(blankNameError);
    await logWithColor(testInfo, 'Blank name errors verified.');

    await logWithColor(testInfo, 'Blank entries test completed successfully.');
  });

});
