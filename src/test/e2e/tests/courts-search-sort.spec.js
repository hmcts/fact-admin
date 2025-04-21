// src/test/e2e/tests/courts-search-sort.spec.js
/**
 * @file Courts and Tribunals Search and Sort Functionality Tests
 * @description This spec file tests the search input, 'Include closed courts' checkbox,
 *              and column sorting functionality on the main courts list page (/courts).
 * Key Dependencies/Assumptions:
 * - Test uses the 'superAdminPage' fixture for authentication, requiring super admin credentials.
 * - Tests run serially (`test.describe.serial`) to closely mirror the Gherkin scenario flow and
 *   prevent potential state interference between tests, although the current tests are largely read-only
 *   after the initial search/filter actions.
 * - Uses `CourtsListPage` and `LoginPage` Page Object Models.
 * - Relies on `logWithColor` for enhanced logging during execution.
 * - Assumes specific court data exists for closed court verification (e.g., 'Ashford County Court').
 * - Assumes search and sorting are handled by client-side JavaScript (`courts-table-search.ts`, `courts.ts`),
 *   requiring `waitForLoadState('networkidle')` in the POM methods after actions that trigger these updates.
 * - **Important Sort Behaviour:**
 *   - Name Column: Default is ascending. First click sorts descending. Second click sorts ascending again.
 *   - Last Updated Column: Default is inactive. First click sorts *descending*. Second click sorts ascending.
 *     Tests must account for this specific toggle order.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { CourtsListPage } = require('../pages/courts-list-page');
const { logWithColor } = require('../fixtures/auth.setup');
const { LoginPage } = require('../pages/login-page'); // Needed for potential re-login

test.describe.serial('Courts and Tribunals Search and Sort', () => {
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';
  let courtsListPage; // Define page object variable in the scope

  // Runs before each test. Logs in as Super Admin and navigates to the courts list page.
  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Setting up for: ${testInfo.title}`);
    courtsListPage = new CourtsListPage(superAdminPage);

    // --- Navigation and Re-login Logic ---
    await logWithColor(testInfo, `Attempting navigation to application root: ${baseUrl}/`);
    await superAdminPage.goto('/', { waitUntil: 'domcontentloaded' });

    if (superAdminPage.url().includes('idam-web-public')) {
      await logWithColor(testInfo, 'Redirected to login page. Re-authenticating Super Admin...');
      const loginPage = new LoginPage(superAdminPage);
      const username = process.env.OAUTH_SUPER_USER;
      const password = process.env.OAUTH_USER_PASSWORD;
      if (!username || !password) {
        throw new Error('Super Admin credentials not found in environment variables for re-login.');
      }
      await expect(superAdminPage).toHaveURL(/.*idam-web-public.*/);
      await loginPage.login(username, password);
      await logWithColor(testInfo, 'Login submitted. Waiting for redirect back to app...');

      const appHostRegex = new RegExp(`^${baseUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`);
      try {
        // Wait for URL to match host AND page to reach stable load state
        await superAdminPage.waitForURL(appHostRegex, { timeout: 15000, waitUntil: 'load' });
      } catch (e) {
        await logWithColor(testInfo, `Timeout waiting for redirect back to app host after re-login. Current URL: ${superAdminPage.url()}`);
        const errorLocator = superAdminPage.locator('.error-summary');
        if (await errorLocator.isVisible({ timeout: 1000 })) {
          const errorMessage = await errorLocator.textContent();
          throw new Error(`Re-login seemed to fail: ${errorMessage}`);
        }
        throw e; // Rethrow if it wasn't a login error summary issue
      }
      await logWithColor(testInfo, 'Redirected back to app. Current URL: ' + superAdminPage.url());
      // Ensure we are at the root if redirected elsewhere
      if (!superAdminPage.url().endsWith(baseUrl + '/')) {
        await logWithColor(testInfo, `Redirected to ${superAdminPage.url()}, navigating to root...`);
        await superAdminPage.goto('/', { waitUntil: 'domcontentloaded' });
      }
    } else {
      await logWithColor(testInfo, 'Direct navigation to root successful. Session appears valid.');
    }
    // --- End Conditional Re-login Logic ---

    // Verify we are on the courts list page
    await logWithColor(testInfo, 'Verifying on Courts and Tribunals list page...');
    await courtsListPage.waitForPageLoad();
    await logWithColor(testInfo, 'Courts list page loaded successfully.');
  });

  test('Search displays only matching courts, sorted by name (default)', async ({}, testInfo) => {
    const searchText = 'as';
    await logWithColor(testInfo, `Searching for courts containing: "${searchText}"`);
    await courtsListPage.searchFor(searchText);

    const visibleNames = await courtsListPage.getVisibleCourtNames();
    await logWithColor(testInfo, `Found ${visibleNames.length} courts.`);
    expect(visibleNames.length).toBeGreaterThan(0);

    for (const name of visibleNames) {
      expect(name.toLowerCase()).toContain(searchText.toLowerCase());
    }
    await logWithColor(testInfo, 'Verified all visible court names contain the search text.');

    const sortedNames = [...visibleNames].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    expect(visibleNames).toEqual(sortedNames);
    await logWithColor(testInfo, 'Verified courts are sorted alphabetically by name (ascending).');
  });

  test('Search including closed courts displays matching open and closed courts', async ({}, testInfo) => {
    const searchText = 'ash';
    const expectedClosedCourt = 'Ashford County Court';

    await logWithColor(testInfo, `Searching for courts containing: "${searchText}"`);
    await courtsListPage.searchFor(searchText);

    await logWithColor(testInfo, 'Selecting "Include closed courts"');
    await courtsListPage.setIncludeClosedCourts(true);

    const visibleNames = await courtsListPage.getVisibleCourtNames();
    await logWithColor(testInfo, `Found ${visibleNames.length} courts (including closed).`);
    expect(visibleNames.length).toBeGreaterThan(0);

    let foundClosedCourt = false;
    for (const name of visibleNames) {
      expect(name.toLowerCase()).toContain(searchText.toLowerCase());
      if (name.trim() === expectedClosedCourt.trim()) {
        foundClosedCourt = true;
      }
    }
    await logWithColor(testInfo, 'Verified all visible court names contain the search text.');
    expect(foundClosedCourt, `Expected closed court "${expectedClosedCourt}" not found in results`).toBe(true);
    await logWithColor(testInfo, `Verified expected closed court "${expectedClosedCourt}" is displayed.`);
  });

  test('Sort by name descending displays courts in reverse alphabetical order', async ({}, testInfo) => {
    const searchText = 'as';
    await logWithColor(testInfo, `Searching for courts containing: "${searchText}"`);
    await courtsListPage.searchFor(searchText);

    await logWithColor(testInfo, 'Clicking Name header to sort descending...');
    await courtsListPage.clickSortByName(); // First click goes from default ASC to DESC

    const visibleNames = await courtsListPage.getVisibleCourtNames();
    await logWithColor(testInfo, `Found ${visibleNames.length} courts.`);
    expect(visibleNames.length).toBeGreaterThan(0);

    const sortedNames = [...visibleNames].sort((a, b) => b.localeCompare(a, 'en', { sensitivity: 'base' }));
    expect(visibleNames).toEqual(sortedNames);
    await logWithColor(testInfo, 'Verified courts are sorted by name descending.');
  });

  test('Search results count message is accurate', async ({}, testInfo) => {
    const searchText = 'as';
    await logWithColor(testInfo, `Searching for courts containing: "${searchText}"`);
    await courtsListPage.searchFor(searchText);

    const numberOfResults = await courtsListPage.getNumberOfVisibleCourts();
    await logWithColor(testInfo, `Actual number of visible courts: ${numberOfResults}`);
    expect(numberOfResults).toBeGreaterThan(0);

    const expectedMessage = `Showing ${numberOfResults} results`;
    await logWithColor(testInfo, `Verifying results count message displays: "${expectedMessage}"`);
    const actualMessage = await courtsListPage.getResultsCountMessage();
    expect(actualMessage.trim()).toBe(expectedMessage);
    await logWithColor(testInfo, 'Results count message verified.');
  });

  test('Sort by last updated ascending displays courts oldest first', async ({}, testInfo) => {
    const searchText = 'as';
    await logWithColor(testInfo, `Searching for courts containing: "${searchText}"`);
    await courtsListPage.searchFor(searchText);

    await logWithColor(testInfo, 'Clicking Last Updated header twice to sort ascending...');
    await courtsListPage.clickSortByLastUpdated(); // Click 1: INACTIVE -> DESC
    await courtsListPage.clickSortByLastUpdated(); // Click 2: DESC -> ASC

    const visibleDates = await courtsListPage.getVisibleCourtUpdateDates();
    await logWithColor(testInfo, `Found ${visibleDates.length} courts.`);
    expect(visibleDates.length).toBeGreaterThan(0);

    const sortedDates = [...visibleDates].sort((a, b) => a.getTime() - b.getTime());
    expect(visibleDates).toEqual(sortedDates);
    await logWithColor(testInfo, 'Verified courts are sorted by Last Updated ascending (oldest first).');
  });

  test('Sort by last updated descending displays courts newest first', async ({}, testInfo) => {
    const searchText = 'as';
    await logWithColor(testInfo, `Searching for courts containing: "${searchText}"`);
    await courtsListPage.searchFor(searchText);

    await logWithColor(testInfo, 'Clicking Last Updated header once (Inactive -> DESC)...');
    await courtsListPage.clickSortByLastUpdated(); // Click 1: INACTIVE -> DESC

    const visibleDates = await courtsListPage.getVisibleCourtUpdateDates();
    await logWithColor(testInfo, `Found ${visibleDates.length} courts.`);
    expect(visibleDates.length).toBeGreaterThan(0);

    const sortedDates = [...visibleDates].sort((a, b) => b.getTime() - a.getTime());
    expect(visibleDates).toEqual(sortedDates);
    await logWithColor(testInfo, 'Verified courts are sorted by Last Updated descending (newest first).');
  });

});
