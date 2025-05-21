// src/test/e2e/tests/add-new-court.spec.js
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test'); // expect is defined here
const { AddNewCourtPage } = require('../pages/add-new-court-page');
const { HomePage } = require('../pages/home-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

// --- Shared Setup ---
let addNewCourtPage;
let homePage;
let loginPage;

const errorMessages = {
  nameEmpty: 'A new court name value is required',
  nameInvalid: 'Invalid court name: Valid characters are: A-Z, a-z, 0-9, apostrophes, brackets and hyphens',
  longitudeEmpty: 'A longitude value is required',
  longitudeInvalid: 'The longitude value needs to be a number',
  latitudeEmpty: 'A latitude value is required',
  latitudeInvalid: 'The latitude value needs to be a number',
  serviceAreaNotSelected: 'At least one service area must be selected',
  duplicateCourtPrefix: 'A court already exists for court provided: ', // Suffix added in test
  addNewCourt: 'A problem occurred when adding the new court.' // General error
};

// Function to handle common setup within beforeEach
async function setupNavigationAndLogin(page, testInfo) {
  logWithColor(testInfo, `Setting up for: ${testInfo.title}`);
  homePage = new HomePage(page);
  addNewCourtPage = new AddNewCourtPage(page);
  loginPage = new LoginPage(page);

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  if (page.url().includes('idam-web-public')) {
    logWithColor(testInfo, 'WARN: Redirected to login page. Re-logging in...');
    const username = process.env.OAUTH_SUPER_USER;
    const password = process.env.OAUTH_USER_PASSWORD;
    if (!username || !password) {
      throw new Error('Super admin credentials not found in env vars.');
    }
    await loginPage.login(username, password);
    await page.waitForURL(/.*localhost:3300.*/, { timeout: 15000, waitUntil: 'domcontentloaded' });
    logWithColor(testInfo, 'Re-login successful. Current URL: ' + page.url());
    if (!page.url().endsWith(':3300/')) {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
    }
  }

  await page.pause()

  await expect(page).toHaveTitle('Courts and tribunals - Find a Court or Tribunal Admin Service – GOV.UK');
  logWithColor(testInfo, 'On Admin Portal homepage.');
  await expect(page.locator(homePage.addCourtNavLink)).toBeVisible();
  logWithColor(testInfo, 'Add New Court link is visible.');
  await homePage.clickAddCourtNav();
  await addNewCourtPage.waitForPageLoad();
  logWithColor(testInfo, 'Navigated to Add New Court page.');
  expect(await addNewCourtPage.getPageTitleText()).toBe('Add new court');
}


// --- Serial Tests Block 1 (Validation, No State Modification) ---
test.describe.serial('Add New Court Functionality - Validations', () => {

  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    // Use the shared setup function
    await setupNavigationAndLogin(superAdminPage, testInfo);
  });

  test('Verify initial page elements and title', async ({ superAdminPage }, testInfo) => {
    logWithColor(testInfo, 'Verifying initial page state.');
    await expect(addNewCourtPage.page.locator(addNewCourtPage.courtNameInput)).toBeEditable();
    await expect(addNewCourtPage.page.locator(addNewCourtPage.longitudeInput)).toBeEditable();
    await expect(addNewCourtPage.page.locator(addNewCourtPage.latitudeInput)).toBeEditable();
    await expect(addNewCourtPage.page.locator(addNewCourtPage.serviceCentreYesRadio)).toBeVisible();
    await expect(addNewCourtPage.page.locator(addNewCourtPage.serviceCentreNoRadio)).toBeVisible();
    await expect(addNewCourtPage.page.locator(addNewCourtPage.serviceAreasContainer)).toBeHidden();
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
    await addNewCourtPage.clickSave();
    logWithColor(testInfo, 'Verifying error summary for missing service area.');
    await addNewCourtPage.checkErrorSummaryContains([errorMessages.serviceAreaNotSelected]);
    logWithColor(testInfo, 'Missing service area validation passed.');
  });

  test('Show error for existing court name', async ({ superAdminPage }, testInfo) => {
    const existingCourtName = 'Abergavenny Magistrates\' Court';
    logWithColor(testInfo, `Attempting to add court with existing name: ${existingCourtName}`);
    await addNewCourtPage.fillCourtName(existingCourtName);
    await addNewCourtPage.fillLongitude('-3.01');
    await addNewCourtPage.fillLatitude('51.82');
    await addNewCourtPage.selectServiceCentreNo();
    await addNewCourtPage.clickSave();
    logWithColor(testInfo, 'Verifying error summary for duplicate court name.');
    const expectedError = `${errorMessages.duplicateCourtPrefix}${existingCourtName}`;
    await addNewCourtPage.checkErrorSummaryContains([expectedError]);
    logWithColor(testInfo, 'Duplicate court name validation passed.');
  });
});


// --- Serial Tests Block 2 (State Modification) ---
test.describe.serial('Add New Court Functionality - Creations', () => {

  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await setupNavigationAndLogin(superAdminPage, testInfo);
  });

  test('Successfully add a new court (Not Service Centre)', async ({ superAdminPage }, testInfo) => {
    const uniqueCourtName = `Test Court ${Date.now()}`;
    const uniqueSlugPart = uniqueCourtName.toLowerCase().replace(/ /g, '-');
    logWithColor(testInfo, `Attempting to add new court (Not SC): ${uniqueCourtName}`);
    await addNewCourtPage.fillCourtName(uniqueCourtName);
    await addNewCourtPage.fillLongitude('-1.89');
    await addNewCourtPage.fillLatitude('52.48');
    await addNewCourtPage.selectServiceCentreNo();
    await addNewCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked save. Waiting for redirect...');
    await addNewCourtPage.waitForSuccessfulSaveRedirect(uniqueSlugPart);
    logWithColor(testInfo, `Successfully redirected to edit page for ${uniqueCourtName}.`);
    await expect(superAdminPage.locator(`h1:has-text("${uniqueCourtName}")`)).toBeVisible();
    // ** TODO: Consider adding cleanup (delete court) here via API if possible as it'll make new courts forever.**
  });

  test('Successfully add a new court (As Service Centre)', async ({ superAdminPage }, testInfo) => {
    const uniqueCourtName = `Test SC Court ${Date.now()}`;
    const uniqueSlugPart = uniqueCourtName.toLowerCase().replace(/ /g, '-');
    const serviceAreaNameToSelect = 'Civil';
    logWithColor(testInfo, `Attempting to add new court (SC): ${uniqueCourtName}`);
    await addNewCourtPage.fillCourtName(uniqueCourtName);
    await addNewCourtPage.fillLongitude('0.12');
    await addNewCourtPage.fillLatitude('51.50');
    await addNewCourtPage.selectServiceCentreYes();
    logWithColor(testInfo, `Selected Service Centre = Yes. Selecting area: ${serviceAreaNameToSelect}`);
    await addNewCourtPage.selectServiceAreaByName(serviceAreaNameToSelect);
    await addNewCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked save. Waiting for redirect...');
    await addNewCourtPage.waitForSuccessfulSaveRedirect(uniqueSlugPart);
    logWithColor(testInfo, `Successfully redirected to edit page for ${uniqueCourtName}.`);
    await expect(superAdminPage.locator(`h1:has-text("${uniqueCourtName}")`)).toBeVisible();
    // ** TODO: Consider adding cleanup (delete court) here via API if possible as it'll make new courts forever.**
  });
});
