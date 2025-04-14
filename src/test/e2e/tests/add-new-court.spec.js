// src/test/e2e/tests/add-new-court.spec.js
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { AddNewCourtPage } = require('../pages/add-new-court-page');
const { HomePage } = require('../pages/home-page');
const { logWithColor } = require('../fixtures/auth.setup'); // Import the custom logger

// Using serial mode as adding courts creates state that could affect other tests if run in parallel without cleanup.
test.describe.serial('Add New Court Functionality', () => {
  let addNewCourtPage;
  let homePage;

  // Error messages from controller enum (for easier maintenance)
  const errorMessages = {
    nameEmpty: 'Court name is required.',
    nameInvalid: 'Court name cannot contain special characters',
    longitudeEmpty: 'Longitude is required.',
    longitudeInvalid: 'Longitude must be a number.',
    latitudeEmpty: 'Latitude is required.',
    latitudeInvalid: 'Latitude must be a number.',
    serviceAreaNotSelected: 'Select at least one service area.',
    duplicateCourtPrefix: 'A court with the name ', // Suffix added in test
    addNewCourt: 'A problem occurred when adding the new court.' // General error
  };

  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    homePage = new HomePage(superAdminPage);
    addNewCourtPage = new AddNewCourtPage(superAdminPage);

    // Navigate to home page first (where the 'Add New Court' link is)
    await superAdminPage.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(superAdminPage).toHaveTitle('Courts and tribunals - Find a Court or Tribunal Admin Service – GOV.UK'); // Verify on homepage
    logWithColor(testInfo, 'On Admin Portal homepage.');

    // Navigate to the Add New Court page via the nav link
    await homePage.clickAddCourtNav();
    await addNewCourtPage.waitForPageLoad();
    logWithColor(testInfo, 'Navigated to Add New Court page.');
    expect(await addNewCourtPage.getPageTitleText()).toBe('Add New Court');
  });

  test('Verify initial page elements and title', async ({ superAdminPage }, testInfo) => {
    logWithColor(testInfo, 'Verifying initial page state.');
    // Basic checks are done in beforeEach's waitForPageLoad, we can add more specific ones if needed.
    await expect(addNewCourtPage.page.locator(addNewCourtPage.courtNameInput)).toBeEditable();
    await expect(addNewCourtPage.page.locator(addNewCourtPage.longitudeInput)).toBeEditable();
    await expect(addNewCourtPage.page.locator(addNewCourtPage.latitudeInput)).toBeEditable();
    await expect(addNewCourtPage.page.locator(addNewCourtPage.serviceCentreYesRadio)).toBeVisible();
    await expect(addNewCourtPage.page.locator(addNewCourtPage.serviceCentreNoRadio)).toBeVisible();
    await expect(addNewCourtPage.page.locator(addNewCourtPage.serviceAreasContainer)).toBeHidden(); // Hidden by default
    logWithColor(testInfo, 'Initial element checks passed.');
  });

  test('Show validation errors for empty fields', async ({ superAdminPage }, testInfo) => {
    logWithColor(testInfo, 'Attempting to save with empty form.');
    await addNewCourtPage.clickSave();

    logWithColor(testInfo, 'Verifying error summary messages.');
    const expectedErrors = [
      errorMessages.nameEmpty,
      errorMessages.longitudeEmpty,
      errorMessages.latitudeEmpty,
    ];
    // Order might vary, check for containment
    await addNewCourtPage.checkErrorSummaryContains(expectedErrors);

    logWithColor(testInfo, 'Verifying field-level error messages.');
    await addNewCourtPage.checkFieldError(addNewCourtPage.courtNameError, errorMessages.nameEmpty);
    await addNewCourtPage.checkFieldError(addNewCourtPage.longitudeError, errorMessages.longitudeEmpty);
    await addNewCourtPage.checkFieldError(addNewCourtPage.latitudeError, errorMessages.latitudeEmpty);
    logWithColor(testInfo, 'Empty field validation passed.');
  });

  test('Show validation errors for invalid characters and formats', async ({ superAdminPage }, testInfo) => {
    logWithColor(testInfo, 'Filling form with invalid data.');
    await addNewCourtPage.fillCourtName('Test Court %^&*');
    await addNewCourtPage.fillLongitude('not-a-number');
    await addNewCourtPage.fillLatitude('also_not_a_number');

    await addNewCourtPage.clickSave();
    logWithColor(testInfo, 'Verifying error summary messages for invalid data.');

    const expectedErrors = [
      errorMessages.nameInvalid,
      errorMessages.longitudeInvalid,
      errorMessages.latitudeInvalid,
    ];
    await addNewCourtPage.checkErrorSummaryContains(expectedErrors);

    logWithColor(testInfo, 'Verifying field-level error messages for invalid data.');
    await addNewCourtPage.checkFieldError(addNewCourtPage.courtNameError, errorMessages.nameInvalid);
    await addNewCourtPage.checkFieldError(addNewCourtPage.longitudeError, errorMessages.longitudeInvalid);
    await addNewCourtPage.checkFieldError(addNewCourtPage.latitudeError, errorMessages.latitudeInvalid);
    logWithColor(testInfo, 'Invalid data validation passed.');
  });

  test('Show validation error for missing Service Area when Service Centre is Yes', async ({ superAdminPage }, testInfo) => {
    logWithColor(testInfo, 'Filling form, selecting Service Centre = Yes, but no areas.');
    await addNewCourtPage.fillCourtName('Test Service Area Court');
    await addNewCourtPage.fillLongitude('-0.1');
    await addNewCourtPage.fillLatitude('51.5');
    await addNewCourtPage.selectServiceCentreYes();
    // Intentionally do not select any service areas

    await addNewCourtPage.clickSave();
    logWithColor(testInfo, 'Verifying error summary for missing service area.');

    // Check summary - specific field error might not exist directly on the checkbox group
    await addNewCourtPage.checkErrorSummaryContains([errorMessages.serviceAreaNotSelected]);
    logWithColor(testInfo, 'Missing service area validation passed.');
  });

  test('Show error for existing court name', async ({ superAdminPage }, testInfo) => {
    const existingCourtName = 'Abergavenny Magistrates\' Court'; // Use a known existing court
    logWithColor(testInfo, `Attempting to add court with existing name: ${existingCourtName}`);

    await addNewCourtPage.fillCourtName(existingCourtName);
    await addNewCourtPage.fillLongitude('-3.01'); // Provide valid coords
    await addNewCourtPage.fillLatitude('51.82');
    await addNewCourtPage.selectServiceCentreNo(); // Easiest option

    await addNewCourtPage.clickSave();
    logWithColor(testInfo, 'Verifying error summary for duplicate court name.');

    const expectedError = `${errorMessages.duplicateCourtPrefix}${existingCourtName}`;
    await addNewCourtPage.checkErrorSummaryContains([expectedError]);
    // Check field level error if applicable (might only be in summary)
    // await addNewCourtPage.checkFieldError(addNewCourtPage.courtNameError, expectedError); // Adjust if field error exists
    logWithColor(testInfo, 'Duplicate court name validation passed.');
  });

  test('Successfully add a new court (Not Service Centre)', async ({ superAdminPage }, testInfo) => {
    const uniqueCourtName = `Test Court ${Date.now()}`;
    const uniqueSlugPart = uniqueCourtName.toLowerCase().replace(/ /g, '-'); // Predict slug format
    logWithColor(testInfo, `Attempting to add new court (Not SC): ${uniqueCourtName}`);

    await addNewCourtPage.fillCourtName(uniqueCourtName);
    await addNewCourtPage.fillLongitude('-1.89'); // Example: Birmingham
    await addNewCourtPage.fillLatitude('52.48');
    await addNewCourtPage.selectServiceCentreNo();

    await addNewCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked save. Waiting for redirect...');

    // Verify the redirect to the edit page for the newly created court
    await addNewCourtPage.waitForSuccessfulSaveRedirect(uniqueSlugPart);
    logWithColor(testInfo, `Successfully redirected to edit page for ${uniqueCourtName}.`);

    // Optional: Verify elements on the Edit page to be absolutely sure
    await expect(superAdminPage.locator(`h1:has-text("${uniqueCourtName}")`)).toBeVisible();
  });

  test('Successfully add a new court (As Service Centre)', async ({ superAdminPage }, testInfo) => {
    const uniqueCourtName = `Test SC Court ${Date.now()}`;
    const uniqueSlugPart = uniqueCourtName.toLowerCase().replace(/ /g, '-'); // Predict slug format
    const serviceAreaNameToSelect = 'Civil'; // Example: Choose a known service area name

    logWithColor(testInfo, `Attempting to add new court (SC): ${uniqueCourtName}`);

    await addNewCourtPage.fillCourtName(uniqueCourtName);
    await addNewCourtPage.fillLongitude('0.12'); // Example: London
    await addNewCourtPage.fillLatitude('51.50');
    await addNewCourtPage.selectServiceCentreYes();
    logWithColor(testInfo, `Selected Service Centre = Yes. Selecting area: ${serviceAreaNameToSelect}`);
    await addNewCourtPage.selectServiceAreaByName(serviceAreaNameToSelect); // Select by name

    await addNewCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked save. Waiting for redirect...');

    // Verify the redirect
    await addNewCourtPage.waitForSuccessfulSaveRedirect(uniqueSlugPart);
    logWithColor(testInfo, `Successfully redirected to edit page for ${uniqueCourtName}.`);

    // Optional: Verify elements on the Edit page
    await expect(superAdminPage.locator(`h1:has-text("${uniqueCourtName}")`)).toBeVisible();
  });

});
