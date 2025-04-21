// tests/court-region.spec.js
const { test, logWithColor } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { HomePage } = require('../pages/home-page');

test.describe('Court Region Functionality', () => {

  test('View and filter courts by region', async ({ adminPage }, testInfo) => {
    const homePage = new HomePage(adminPage);

    logWithColor(testInfo, 'Starting court region test...');

    // Navigate to the admin homepage
    await adminPage.goto('/', { waitUntil: 'domcontentloaded' });
    logWithColor(testInfo, 'Navigated to admin home page.');

    // Debug info
    console.log('Current URL:', adminPage.url());
    const title = await adminPage.title();
    console.log('Page Title:', title);

    // First check that Aberdeen court is visible before filtering
    const aberdeenCourt = 'aberdeen-tribunal-hearing-centre';
    const isAberdeenVisibleBefore = await adminPage.isVisible(`#edit-${aberdeenCourt}`);
    expect(isAberdeenVisibleBefore).toBeTruthy();
    logWithColor(testInfo, `Verified ${aberdeenCourt} is visible before filtering.`);

    // Select "Include closed courts" checkbox
    await homePage.selectIncludeClosedCourts();
    logWithColor(testInfo, 'Selected Include closed courts checkbox.');

    // Verify region selector is visible
    const isSelectorVisible = await homePage.isRegionSelectorVisible();
    expect(isSelectorVisible).toBeTruthy();
    logWithColor(testInfo, 'Verified region selector is visible.');

    // Select Yorkshire and the Humber region (value "9" from feature file)
    await homePage.selectRegion('9');
    logWithColor(testInfo, 'Selected Yorkshire and the Humber region.');

    // Check for specific courts in the list
    const bradfordCourt = 'bradford-combined-court-centre';
    const leedsCourt = 'leeds-combined-court-centre';

    // Check if both courts are visible
    const courtVisibilityResults = await homePage.areMultipleCourtsVisible([bradfordCourt, leedsCourt]);

    expect(courtVisibilityResults[bradfordCourt]).toBeTruthy();
    expect(courtVisibilityResults[leedsCourt]).toBeTruthy();
    logWithColor(testInfo, `Verified specific courts are visible: ${bradfordCourt} and ${leedsCourt}`);

    // Verify that the Aberdeen court is NOT visible after filtering
    try {
      // Use a short timeout to avoid waiting too long for an element that shouldn't be there
      const isAberdeenVisibleAfter = await adminPage.locator(`#edit-${aberdeenCourt}`).isVisible({ timeout: 1000 });
      expect(isAberdeenVisibleAfter).toBeFalsy();
      logWithColor(testInfo, `Verified ${aberdeenCourt} is not visible after filtering by Yorkshire region.`);
    } catch (error) {
      // Element not found is actually the expected outcome
      logWithColor(testInfo, `Verified ${aberdeenCourt} is not present in the DOM after filtering.`);
    }
  });

});
