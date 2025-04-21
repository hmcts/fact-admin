/**
 * @file Admin Audit Functionality Tests
 * @description This spec file tests the audit trail functionality for court changes.
 * Key Dependencies/Assumptions for New Developers:
 * - Test uses the 'superAdminPage' fixture for authentication, requiring super admin credentials.
 * - Tests are serial (`test.describe.serial`) because they perform actions (modifying opening hours)
 *   that generate the audit logs being verified. State is modified and checked sequentially.
 * - Relies on specific court data (`havant-justice-centre`) existing.
 * - Interacts with the 'Opening Hours' tab. Assumes the basic structure and selectors for this tab are stable.
 *   Uses `EditCourtPage` for basic tab navigation and defines specific opening hours selectors within this spec.
 * - Uses `AuditsPage` Page Object Model for interactions on the audit search page.
 * - The core verification (`verifyAuditEntryExists`) checks for the *presence* of the correct audit action
 *   and location but *does not* verify the exact timestamp due to potential clock skew issues between
 *   the test runner and the server generating the logs. The date range search is kept wide (e.g., +/- 1 day)
 *   to ensure the log is captured in the results.
 */
const { test, logWithColor } = require('../fixtures/auth.setup'); // Keep logWithColor
const { expect } = require('@playwright/test');
const { HomePage } = require('../pages/home-page');
const { EditCourtPage } = require('../pages/edit-court-page');
const { AuditsPage } = require('../pages/audits-page');

test.describe.serial('Admin Audit Functionality', () => {
  const courtSlug = 'havant-justice-centre';
  const courtName = 'Havant Justice Centre';
  const editUrl = `/courts/${courtSlug}/edit`;

  let homePage;
  let editCourtPage;
  let auditsPage;

  // Selectors specific to Opening Hours Tab
  const openingHoursTabSelector = '#tab_opening-hours';
  const openingHoursPanelSelector = '#opening-hours';
  const openingHoursFieldsetsSelector = `${openingHoursPanelSelector} fieldset:has(h3:visible)`;
  const addOpeningHourButtonText = 'Add new opening time';
  const saveOpeningHoursButtonText = 'Save';
  const descriptionSelectSelector = 'select[name$="[type_id]"]';
  const hoursInputSelector = 'input[name$="[hours]"]';
  const successMessageSelector = `${openingHoursPanelSelector} div.govuk-panel--confirmation > h2.govuk-panel__title`;
  const errorSummarySelector = `${openingHoursPanelSelector} .govuk-error-summary`;


  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    logWithColor(testInfo, `Setting up for: ${testInfo.title}`); // Keep setup log
    homePage = new HomePage(superAdminPage);
    editCourtPage = new EditCourtPage(superAdminPage);
    auditsPage = new AuditsPage(superAdminPage);

    // Navigate to the specific court's edit page
    await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });
    await expect(superAdminPage).toHaveURL(new RegExp(`.*${editUrl}$`));
    await expect(superAdminPage.locator(`h1:has-text("${courtName}")`)).toBeVisible({ timeout: 10000 });
    logWithColor(testInfo, `Successfully navigated to Edit Court page for ${courtName}`); // Keep nav log
  });

  test('View audits for court after updating opening hours', async ({ superAdminPage }, testInfo) => {
    logWithColor(testInfo, 'Starting audit test flow'); // Keep start log

    // 1. Navigate to Opening Hours Tab
    logWithColor(testInfo, 'Hovering over general dropdown and clicking Opening Hours tab'); // Keep action log
    await superAdminPage.locator(editCourtPage.generalDropdown).hover();
    await superAdminPage.locator(openingHoursTabSelector).click();
    await expect(superAdminPage.locator(openingHoursPanelSelector)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 10000 });

    const saveButtonLocator = superAdminPage.locator(openingHoursPanelSelector)
      .getByRole('button', { name: saveOpeningHoursButtonText, exact: true });
    await expect(saveButtonLocator).toBeVisible();
    logWithColor(testInfo, 'Opening Hours tab is active'); // Keep state log

    const fieldsetsLocator = superAdminPage.locator(openingHoursFieldsetsSelector);
    const addButtonLocator = superAdminPage.locator(openingHoursPanelSelector)
      .getByRole('button', { name: addOpeningHourButtonText, exact: true });

    // 2. Remove existing entries FIRST to avoid validation conflicts
    logWithColor(testInfo, 'Removing potentially existing opening hours entries'); // Keep action log
    const deletableFieldsets = fieldsetsLocator
      .filter({ has: superAdminPage.getByRole('button', { name: /remove opening hour/i }) });
    const initialCount = await deletableFieldsets.count();
    logWithColor(testInfo, `Found ${initialCount} deletable opening hours entries.`); // Keep info log
    if (initialCount > 0) {
      for (let i = initialCount - 1; i >= 0; i--) {
        const removeButton = deletableFieldsets.nth(i).getByRole('button', { name: /remove opening hour/i });
        await removeButton.click();
        logWithColor(testInfo, `Clicked delete for initial entry ${i}`); // Keep loop action log
      }
      await expect(deletableFieldsets).toHaveCount(0, { timeout: 5000 });
      logWithColor(testInfo, 'Client-side removal complete. Saving removal.'); // Keep state log
      await saveButtonLocator.click();
      try {
        await expect(superAdminPage.locator(successMessageSelector)).toContainText(/Opening Hours updated/i, { timeout: 10000 });
        logWithColor(testInfo, 'Saved removal of entries, update message confirmed'); // Keep confirmation log
      } catch (e) {
        // Log warning if cleanup save fails but proceed
        logWithColor(testInfo, 'WARN: No success message detected after cleanup save, proceeding.');
      }
    } else {
      logWithColor(testInfo, 'No existing deletable entries found.'); // Keep info log
    }

    // 3. Add a new opening hours entry
    logWithColor(testInfo, 'Adding the new opening hours entry'); // Keep action log
    const countBeforeAdd = await fieldsetsLocator.count();
    logWithColor(testInfo, `Fieldset count before adding new: ${countBeforeAdd}`); // Keep state log
    await addButtonLocator.click();
    await expect(fieldsetsLocator).toHaveCount(countBeforeAdd + 1);
    logWithColor(testInfo, `Verified fieldset count increased`); // Keep verification log

    const newFieldset = fieldsetsLocator.last();
    await newFieldset.locator(descriptionSelectSelector).selectOption({ index: 6 });
    await newFieldset.locator(hoursInputSelector).fill('10:00am to 4:00pm');
    logWithColor(testInfo, 'Filled new entry details (Desc Index 6, Hours 10am-4pm)'); // Keep action log

    // 4. Save the new entry
    await saveButtonLocator.click();
    await expect(superAdminPage.locator(successMessageSelector)).toContainText(/Opening Hours updated/i, { timeout: 10000 });
    logWithColor(testInfo, 'Saved new entry, update message confirmed'); // Keep confirmation log

    // 5. Navigate to Courts list (Homepage)
    logWithColor(testInfo, 'Navigating back to Courts list'); // Keep navigation log
    await superAdminPage.locator('#courts').click();
    await expect(superAdminPage).toHaveTitle(/Courts and tribunals/);
    logWithColor(testInfo, 'On Courts list page'); // Keep state log

    // 6. Navigate to Audits page
    logWithColor(testInfo, 'Navigating to Audits page'); // Keep navigation log
    await superAdminPage.locator('#audits').click();
    await auditsPage.waitForPageLoad();
    await expect(superAdminPage).toHaveURL(/.*\/audit/);
    logWithColor(testInfo, 'On Audits page'); // Keep state log

    // 7. Search for audits using a wide date range
    logWithColor(testInfo, `Selecting location: ${courtSlug}`); // Keep action log
    await auditsPage.selectLocation(courtSlug);
    const searchStartDate = new Date();
    searchStartDate.setDate(searchStartDate.getDate() - 1); // Yesterday
    const searchEndDate = new Date();
    searchEndDate.setDate(searchEndDate.getDate() + 1); // Tomorrow
    logWithColor(testInfo, `Entering wide date range for search: ${searchStartDate.toISOString()} to ${searchEndDate.toISOString()}`); // Keep action log
    await auditsPage.enterDateRange(searchStartDate, searchEndDate);
    logWithColor(testInfo, 'Clicking search button'); // Keep action log
    await auditsPage.clickSearch();
    logWithColor(testInfo, 'Search submitted, waiting for results...'); // Keep state log

    // 8. Verify expected audit entry exists (ignoring timestamp)
    logWithColor(testInfo, 'Verifying audit results'); // Keep verification log
    const expectedAction = 'Update court opening times';
    const auditFound = await auditsPage.verifyAuditEntryExists(expectedAction, courtSlug, courtName);

    expect(auditFound, `Expected audit entry for Action='${expectedAction}', Location='${courtSlug}' was not found in the search results.`).toBe(true);
    logWithColor(testInfo, 'Successfully verified expected audit entry.'); // Keep success log
  });
});
