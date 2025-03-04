// tests/court-urgent.spec.js
const { test, logWithColor } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { HomePage } = require('../pages/home-page');

test.describe('Court Update Urgent Message', () => {

  // This test covers the existing test from the "court-urgent" scenario - it's in one place to avoid duplicating
  // the same test for no reason.
  test('View courts list with closed courts in alphabetical order', async ({ adminPage }, testInfo) => {
    const homePage = new HomePage(adminPage);

    logWithColor(testInfo, 'Starting test for viewing courts list with closed courts');

    await adminPage.goto('/', { waitUntil: 'domcontentloaded' });
    logWithColor(testInfo, 'Confirmed we are on admin portal homepage');

    // Step 1: Select Include closed courts
    await homePage.selectIncludeClosedCourts();
    logWithColor(testInfo, 'Selected Include closed courts checkbox');

    // Step 2: Verify courts are displayed in a list format
    const courtListLocator = adminPage.locator(homePage.courtListContainer);
    await expect(courtListLocator).toBeVisible();
    logWithColor(testInfo, 'Verified courts are displayed in a list format');

    // Count the courts to ensure we got a substantial list
    const courtRows = adminPage.locator('#courtResults tbody tr');
    const count = await courtRows.count();
    expect(count).toBeGreaterThan(0);
    logWithColor(testInfo, `Found ${count} courts in the list`);

    // Step 3: Check alphabetical order by extracting court names
    const courtNames = [];
    for (let i = 0; i < Math.min(count, 10); i++) { // Check only first 10 courts for performance
      const nameCell = courtRows.nth(i).locator('td').first();
      const name = await nameCell.textContent();
      courtNames.push(name.trim());
    }

    // Check if names are in alphabetical order
    const sortedNames = [...courtNames].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));

    for (let i = 0; i < courtNames.length; i++) {
      if (courtNames[i] !== sortedNames[i]) {
        console.log(`Alphabetical order mismatch at position ${i}:`);
        console.log(`Expected: ${sortedNames[i]}, Actual: ${courtNames[i]}`);
      }
    }

    expect(courtNames).toEqual(sortedNames);
    logWithColor(testInfo, 'Verified courts are in alphabetical order');
  });

  // Scenario: Navigate to edit a court or tribunal page
  test('Navigate to edit court page', async ({ adminPage }, testInfo) => {
    const homePage = new HomePage(adminPage);
    const courtSlug = 'brighton-county-court';
    const expectedCourtName = 'Brighton County Court';

    logWithColor(testInfo, `Starting test for navigating to edit page for ${courtSlug}`);

    // Navigate to homepage
    await adminPage.goto('/', { waitUntil: 'domcontentloaded' });
    logWithColor(testInfo, 'Navigated to admin portal homepage');

    // Find and click the edit link for the specified court
    const editLinkSelector = `#edit-${courtSlug}`;

    // Make sure the court is visible (may need to select include closed courts)
    try {
      await adminPage.waitForSelector(editLinkSelector, { timeout: 5000 });
    } catch (error) {
      logWithColor(testInfo, 'Court not immediately visible, trying to include closed courts');
      await homePage.selectIncludeClosedCourts();
      await adminPage.waitForSelector(editLinkSelector, { timeout: 15000 });
    }

    logWithColor(testInfo, `Found edit link for ${courtSlug}`);
    await adminPage.click(editLinkSelector);
    logWithColor(testInfo, 'Clicked edit link');

    // Verify we're on the edit page for the correct court
    await adminPage.waitForLoadState('domcontentloaded');

    await expect(adminPage).toHaveURL(new RegExp(`/courts/${courtSlug}/edit`));

    // Check the page title includes "Edit Court"
    const pageTitle = await adminPage.title();
    expect(pageTitle).toContain('Edit Court');
    logWithColor(testInfo, 'Verified page title contains "Edit Court"');

    // Check if the court name is displayed on the page
    const courtNameContent = await adminPage.textContent('h1');
    expect(courtNameContent).toContain(expectedCourtName);
    logWithColor(testInfo, `Verified court name ${expectedCourtName} is displayed on the page`);
  });

  // Scenario: Navigate to view court or tribunal page
  test('Verify view court link has correct URL', async ({ adminPage }, testInfo) => {
    const homePage = new HomePage(adminPage);
    const courtSlug = 'shrewsbury-crown-court';

    logWithColor(testInfo, `Starting test for verifying view link for ${courtSlug}`);

    // Navigate to homepage
    await adminPage.goto('/', { waitUntil: 'domcontentloaded' });
    logWithColor(testInfo, 'Navigated to admin portal homepage');

    // Find the view link for the specified court
    const viewLinkSelector = `#view-${courtSlug}`;

    // Make sure the court is visible (may need to select include closed courts)
    try {
      await adminPage.waitForSelector(viewLinkSelector, { timeout: 5000 });
    } catch (error) {
      logWithColor(testInfo, 'Court not immediately visible, trying to include closed courts');
      await homePage.selectIncludeClosedCourts();
      await adminPage.waitForSelector(viewLinkSelector, { timeout: 15000 });
    }

    logWithColor(testInfo, `Found view link for ${courtSlug}`);

    // Instead of clicking, just check the href attribute
    const href = await adminPage.getAttribute(viewLinkSelector, 'href');
    expect(href).toContain(`/courts/${courtSlug}`);
    logWithColor(testInfo, `Verified view link href contains court slug: ${courtSlug}`);
  });
});
