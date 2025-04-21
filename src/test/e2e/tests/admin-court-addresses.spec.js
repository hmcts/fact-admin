// src/test/e2e/tests/admin-court-addresses.spec.js
/**
 * @file Admin Court Addresses Functionality Tests
 * @description This spec tests the validation and saving behaviour of the court addresses tab in the admin portal.
 * Key Dependencies/Assumptions:
 * - Test uses the 'superAdminPage' fixture for authentication.
 * - Tests are serial (`test.describe.serial`) as they modify the addresses of the *same court* (`barnsley-law-courts`).
 * - Relies on the specific court `barnsley-law-courts` existing in the test environment.
 * - Uses `AddressesPage` Page Object Model for interactions.
 * - `beforeEach` performs cleanup: it removes the first two secondary addresses (if they exist) and saves.
 *   It does NOT clear primary address fields by default, as they are required for a successful save.
 * - Tests involving client-side validation (e.g., required fields, format checks) expect UI error messages.
 * - Tests involving server-side validation (e.g., uniqueness check across addresses) may expect a non-200 server response OR client-side errors depending on implementation. Currently, uniqueness is checked client-side.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { AddressesPage } = require('../pages/addresses-page');
const { logWithColor } = require('../fixtures/auth.setup');
const { LoginPage } = require('../pages/login-page');

test.describe.serial('Admin Court Addresses Functionality', () => {
  const courtSlug = 'barnsley-law-courts';
  const courtName = 'Barnsley Law Courts';
  const editUrl = `/courts/${courtSlug}/edit`;
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';

  let addressesPage;

  // Runs before each test - navigates, logs in, cleans up secondary addresses
  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    addressesPage = new AddressesPage(superAdminPage);

    // --- Navigation and Re-login ---
    await logWithColor(testInfo, `Attempting navigation to: ${editUrl}`);
    await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });

    if (superAdminPage.url().includes('idam-web-public')) {
      await logWithColor(testInfo, 'Redirected to login page. Re-authenticating...');
      const loginPage = new LoginPage(superAdminPage);
      const username = process.env.OAUTH_SUPER_USER;
      const password = process.env.OAUTH_USER_PASSWORD;
      if (!username || !password) {
        throw new Error('Super admin credentials not found for re-login.');
      }
      await expect(superAdminPage).toHaveURL(/.*idam-web-public.*/);
      await loginPage.login(username, password);
      await logWithColor(testInfo, 'Login submitted. Waiting for redirect back...');
      const appHostRegex = new RegExp(`^${baseUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`);
      try {
        await superAdminPage.waitForURL(appHostRegex, { timeout: 15000, waitUntil: 'load' });
      } catch (e) {
        await logWithColor(testInfo, `Timeout waiting for redirect back to app host. Current URL: ${superAdminPage.url()}`);
        const errorLocator = superAdminPage.locator('.error-summary');
        if (await errorLocator.isVisible({ timeout: 1000 })) {
          const errorMessage = await errorLocator.textContent();
          throw new Error(`Re-login failed: ${errorMessage}`);
        }
      }
      await logWithColor(testInfo, 'Redirected back to app. Current URL: ' + superAdminPage.url());
      if (!superAdminPage.url().endsWith(editUrl)) {
        await logWithColor(testInfo, `Navigating again to target: ${editUrl}`);
        await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });
      }
    } else {
      await logWithColor(testInfo, 'Direct navigation successful.');
    }

    // Verify on correct page
    await expect(superAdminPage.locator('#Main.fact-tabs')).toBeVisible({ timeout: 10000 });
    await expect(superAdminPage).toHaveURL(new RegExp(`.*${editUrl}$`));
    await expect(superAdminPage.locator(`h1:has-text("${courtName}")`)).toBeVisible();
    await logWithColor(testInfo, `Successfully on edit page for ${courtName}.`);

    // Click the Addresses Tab
    await logWithColor(testInfo, 'Clicking Addresses tab...');
    await addressesPage.clickAddressesTab();
    await logWithColor(testInfo, 'Addresses tab clicked and panel loaded.');

    // --- Cleanup Step: Remove Secondary Addresses ---
    await logWithColor(testInfo, 'Starting address cleanup before test (removing secondary only)...');
    await addressesPage.removeSecondaryAddress(1);
    await addressesPage.removeSecondaryAddress(2);

    await logWithColor(testInfo, 'Clicking Save after cleanup...');
    await Promise.all([
      addressesPage.waitForSaveResponse(courtSlug), // Expect successful save
      addressesPage.clickSave()
    ]);
    await logWithColor(testInfo, 'Save after cleanup successful (received 200 OK).');
    await expect(addressesPage.getSuccessMessage()).resolves.toContain('Addresses updated');
    await logWithColor(testInfo, 'Address cleanup complete.');
  });

  // --- Test Cases ---

  test('Adding incomplete addresses (Scenario Outline)', async ({ superAdminPage }, testInfo) => {
    const example = {
      town: 'Aberdare',
      postcode: 'CF44 0JE',
      badepim: 'bad-epim!!',
      secondary_address: 'The Court House, Cwmbach Road'
    };
    const primaryAddressType = '5880'; // Visiting address
    const primaryCounty = '50'; // Mid Glamorgan
    const secondaryAddressType = '5881'; // Write to address
    const secondaryCounty = '50'; // Mid Glamorgan

    await logWithColor(testInfo, `Running test with data: ${JSON.stringify(example)}`);

    // --- Explicitly clear primary address LINES for this scenario ---
    await logWithColor(testInfo, 'Clearing primary address lines for this specific test scenario.');
    await addressesPage.page.locator(addressesPage.primaryAddressLinesInput).clear();

    // --- Fill Form (Incomplete) ---
    await addressesPage.fillPrimaryAddress({
      addressType: primaryAddressType,
      town: example.town,
      county: primaryCounty,
      postcode: example.postcode,
      epimsId: example.badepim,
      addressLines: '', // Explicitly blank
    });
    await logWithColor(testInfo, 'Filled primary address fields (address lines empty).');

    const firstSecondaryFieldset = addressesPage.getNthSecondaryFieldset(0);
    await expect(firstSecondaryFieldset).toBeVisible();
    await addressesPage.fillNthSecondaryAddress(0, {
      addressType: secondaryAddressType,
      addressLines: example.secondary_address,
      county: secondaryCounty,
      town: '', // Explicitly blank
      postcode: '' // Explicitly blank
    });
    await logWithColor(testInfo, 'Filled secondary address fields (town/postcode empty).');

    // --- Trigger Validation & Verify Errors ---
    await logWithColor(testInfo, 'Clicking Save button (expecting client-side errors)...');
    await addressesPage.clickSave();
    await logWithColor(testInfo, 'Save clicked. Waiting for UI error messages.');
    await addressesPage.waitForErrorSummary();
    await logWithColor(testInfo, 'Error summary is visible.');

    const expectedErrors = [
      "Primary Address: Address is required.",
      "Primary Address: ePIMS Ref ID is invalid. Must contain alphanumeric and/or dashes (-) and length should be 30 characters or less.",
      "Secondary Address 1: Town is required.",
      "Secondary Address 1: Postcode is required."
    ];
    await logWithColor(testInfo, 'Verifying error summary messages...');
    await addressesPage.checkErrorSummaryContains(expectedErrors, false);
    await logWithColor(testInfo, 'Error summary verification successful.');

    await logWithColor(testInfo, 'Verifying field-level errors...');
    expect(await addressesPage.getFieldError(superAdminPage.locator(addressesPage.primaryAddressLinesInput))).toContain('Address is required');
    expect(await addressesPage.getFieldError(superAdminPage.locator(addressesPage.primaryAddressEpimIdInput))).toContain('ePIMS Ref ID is invalid');
    expect(await addressesPage.getFieldError(firstSecondaryFieldset.locator(addressesPage.secondaryAddressTownInput))).toContain('Town is required');
    expect(await addressesPage.getFieldError(firstSecondaryFieldset.locator(addressesPage.secondaryAddressPostcodeInput))).toContain('Postcode is required');
    await logWithColor(testInfo, 'Field-level error verification successful.');
  });

  test('Adding two identical addresses with one containing special characters', async ({ superAdminPage }, testInfo) => {
    const secondaryAddressType = '5881'; // Write to address
    const county = '50'; // Mid Glamorgan
    const postcode = 'CF44 0JE';
    const town = 'test town';

    const address1 = {
      addressType: secondaryAddressType,
      addressLines: "test address!, test house",
      town: town, county: county, postcode: postcode
    };
    const address2 = {
      addressType: secondaryAddressType,
      addressLines: "test address, test house",
      town: town, county: county, postcode: postcode
    };

    await logWithColor(testInfo, 'Adding first secondary address (with special chars)...');
    await addressesPage.fillNthSecondaryAddress(0, address1);
    const firstFieldset = addressesPage.getNthSecondaryFieldset(0);
    await expect(firstFieldset).toBeVisible();

    await logWithColor(testInfo, 'Adding second secondary address (without special chars)...');
    await addressesPage.fillNthSecondaryAddress(1, address2);
    const secondFieldset = addressesPage.getNthSecondaryFieldset(1);
    await expect(secondFieldset).toBeVisible();

    // --- Trigger Validation & Verify Errors ---
    await logWithColor(testInfo, 'Clicking Save button (expecting client-side uniqueness error)...');
    await addressesPage.clickSave();
    await logWithColor(testInfo, 'Save clicked. Waiting for UI error messages.');
    await addressesPage.waitForErrorSummary();
    await logWithColor(testInfo, 'Error summary is visible.');

    const expectedErrors = ["All addresses must be unique."];
    await logWithColor(testInfo, 'Verifying error summary message...');
    await addressesPage.checkErrorSummaryContains(expectedErrors, true);
    await logWithColor(testInfo, 'Error summary verification successful.');
    // Field-level errors are not expected for this validation type based on observation
  });

  test('Adding two identical addresses with one containing abbreviations', async ({ superAdminPage }, testInfo) => {
    const secondaryAddressType = '5881'; // Write to address
    const county = '50'; // Mid Glamorgan
    const postcode = 'CF44 0JE';
    const town = 'test town';

    const address1 = {
      addressType: secondaryAddressType,
      addressLines: "test street",
      town: town, county: county, postcode: postcode
    };
    const address2 = {
      addressType: secondaryAddressType,
      addressLines: "test st",
      town: town, county: county, postcode: postcode
    };

    await logWithColor(testInfo, 'Adding first secondary address (full word)...');
    await addressesPage.fillNthSecondaryAddress(0, address1);
    const firstFieldset = addressesPage.getNthSecondaryFieldset(0);
    await expect(firstFieldset).toBeVisible();

    await logWithColor(testInfo, 'Adding second secondary address (abbreviation)...');
    await addressesPage.fillNthSecondaryAddress(1, address2);
    const secondFieldset = addressesPage.getNthSecondaryFieldset(1);
    await expect(secondFieldset).toBeVisible();

    // --- Trigger Validation & Verify Errors ---
    await logWithColor(testInfo, 'Clicking Save button (expecting client-side uniqueness error)...');
    await addressesPage.clickSave();
    await logWithColor(testInfo, 'Save clicked. Waiting for UI error messages.');
    await addressesPage.waitForErrorSummary();
    await logWithColor(testInfo, 'Error summary is visible.');

    const expectedErrors = ["All addresses must be unique."];
    await logWithColor(testInfo, 'Verifying error summary message...');
    await addressesPage.checkErrorSummaryContains(expectedErrors, true);
    await logWithColor(testInfo, 'Error summary verification successful.');
    // Field-level errors are not expected for this validation type based on observation
  });

});
