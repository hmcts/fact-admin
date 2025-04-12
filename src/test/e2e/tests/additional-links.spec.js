// src/test/e2e/tests/additional-links.spec.js
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { AdditionalLinksPage } = require('../pages/additional-links-page');
const { logWithColor } = require('../fixtures/auth.setup'); // Import the custom logger
const { LoginPage } = require('../pages/login-page'); // Import LoginPage for re-login

// Use serial mode because tests modify the same resource (links for a specific court)
// and rely on cleanup steps.
test.describe.serial('Additional Links', () => {
  const courtSlug = 'aberystwyth-justice-centre';
  const courtName = 'Aberystwyth Justice Centre'; // For potentially checking headers/titles if needed
  const editUrl = `/courts/${courtSlug}/edit`;
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300'; // Define base URL once

  let additionalLinksPage; // Define page object variable in the scope

  // Runs before each test. Navigates, potentially re-logs in, goes to the court page, clicks tab, cleans up.
  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);

    // --- Conditional Re-login Logic ---
    await logWithColor(testInfo, `Attempting navigation to: ${editUrl}`);
    // Use 'domcontentloaded' or 'load' - 'networkidle' might be too slow/unreliable here.
    await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });

    if (superAdminPage.url().includes('idam-web-public')) {
      await logWithColor(testInfo, 'Redirected to login page. Session likely invalid. Re-authenticating...');
      const loginPage = new LoginPage(superAdminPage);
      const username = process.env.OAUTH_SUPER_USER;
      const password = process.env.OAUTH_USER_PASSWORD;
      if (!username || !password) {
        throw new Error('Super admin credentials not found in environment variables for re-login.');
      }
      await expect(superAdminPage).toHaveURL(/.*idam-web-public.*/);
      await loginPage.login(username, password);
      await logWithColor(testInfo, 'Login submitted. Waiting for redirect back to app...');

      // ***** OPTIMIZATION: Wait only for redirect back to *any* app URL *****
      // Use a simpler regex matching the base URL host. Wait for load state.
      const appHostRegex = new RegExp(`^${baseUrl.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}`); // Escape special chars
      try {
        // Wait for URL to match host AND page to reach stable load state
        await superAdminPage.waitForURL(appHostRegex, { timeout: 15000, waitUntil: 'load' });
      } catch (e) {
        await logWithColor(testInfo, `Timeout waiting for redirect back to app host after re-login. Current URL: ${superAdminPage.url()}`);
        // Add error check
        const errorLocator = superAdminPage.locator('.error-summary');
        if (await errorLocator.isVisible({ timeout: 1000 })) {
          const errorMessage = await errorLocator.textContent();
          throw new Error(`Re-login seemed to fail: ${errorMessage}`);
        }
        // If no error, maybe just slow? Try proceeding.
      }
      await logWithColor(testInfo, 'Redirected back to app. Current URL: ' + superAdminPage.url());
      // ***** END OPTIMIZATION *****

      // Now, navigate to the *actual* target page again if not already there
      if (!superAdminPage.url().endsWith(editUrl)) {
        await logWithColor(testInfo, `Navigating to target: ${editUrl}`);
        await superAdminPage.goto(editUrl, { waitUntil: 'domcontentloaded' });
      }
    } else {
      await logWithColor(testInfo, 'Direct navigation successful. Session appears valid.');
    }
    // --- End Conditional Re-login Logic ---

    // Verify we are on the edit page - Reduce excessive timeout
    // Wait for a more fundamental element and use a shorter timeout
    await expect(superAdminPage.locator('#Main.fact-tabs')).toBeVisible({ timeout: 8000 }); // Reduced further to 8s
    await expect(superAdminPage).toHaveURL(new RegExp(`.*${editUrl}$`));
    await logWithColor(testInfo, 'Successfully on edit page.');

    // Proceed with POM setup and cleanup
    additionalLinksPage = new AdditionalLinksPage(superAdminPage);
    await logWithColor(testInfo, 'Clicking Additional Links tab...');
    await additionalLinksPage.clickAdditionalLinksTab();
    await logWithColor(testInfo, 'Tab clicked. Removing existing links...');
    await additionalLinksPage.removeAllAdditionalLinksAndSave();
    await logWithColor(testInfo, 'Existing links removed and saved.');
    await expect(additionalLinksPage.page.locator(additionalLinksPage.visibleFieldsets)).toHaveCount(1);
    await logWithColor(testInfo, 'Verified initial state: 1 visible fieldset.');
  });

  // Remove afterEach cleanup entirely to reduce overhead
  // test.afterEach(async ({ superAdminPage }, testInfo) => { ... });

  // --- Test Cases ---
  // (Remain the same)
  // ...
  test('Add and verify Additional Links', async ({ superAdminPage }, testInfo) => {
    const link1 = { url: 'https://www.gov.uk/find-court-tribunal', displayName: 'englishName1', displayNameCy: 'welshName1' };
    const link2 = { url: 'https://www.google.co.uk/', displayName: 'englishName2', displayNameCy: 'welshName2' };
    await logWithColor(testInfo, 'Filling details for link 1 in the first fieldset...');
    await additionalLinksPage.addLinkToFirstEmptyFieldset(link1.url, link1.displayName, link1.displayNameCy);
    await logWithColor(testInfo, 'Adding and filling details for link 2...');
    await additionalLinksPage.addLink(link2.url, link2.displayName, link2.displayNameCy);
    await logWithColor(testInfo, 'Saving links...');
    await additionalLinksPage.clickSave();
    await additionalLinksPage.waitForUpdateMessage('Additional links updated');
    await logWithColor(testInfo, 'Verifying links displayed after save...');
    const visibleFieldsetsLocator = additionalLinksPage.page.locator(additionalLinksPage.visibleFieldsets);
    const deletableFieldsetsLocator = additionalLinksPage.page.locator(additionalLinksPage.deletableFieldsets);
    await expect(visibleFieldsetsLocator).toHaveCount(3);
    await expect(deletableFieldsetsLocator).toHaveCount(2);
    const details1 = await additionalLinksPage.getLinkDetails(deletableFieldsetsLocator.nth(0));
    const details2 = await additionalLinksPage.getLinkDetails(deletableFieldsetsLocator.nth(1));
    expect(details1).toEqual(link1);
    expect(details2).toEqual(link2);
    await logWithColor(testInfo, 'Add and verify test completed.');
  });

  test('Reorder Additional Links', async ({ superAdminPage }, testInfo) => {
    const link1 = { url: 'https://www.gov.uk/find-court-tribunal', displayName: 'englishName1', displayNameCy: 'welshName1' };
    const link2 = { url: 'https://www.google.co.uk/', displayName: 'englishName2', displayNameCy: 'welshName2' };
    await logWithColor(testInfo, 'Adding initial links for reorder test...');
    await additionalLinksPage.addLinkToFirstEmptyFieldset(link1.url, link1.displayName, link1.displayNameCy);
    await additionalLinksPage.addLink(link2.url, link2.displayName, link2.displayNameCy);
    await additionalLinksPage.clickSave();
    await additionalLinksPage.waitForUpdateMessage('Additional links updated');
    await logWithColor(testInfo, 'Re-clicking tab to ensure both links load for reorder...');
    await additionalLinksPage.clickAdditionalLinksTab();
    await expect(additionalLinksPage.page.locator(additionalLinksPage.addButton)).toBeVisible();
    await logWithColor(testInfo, 'Verifying initial order for reorder...');
    let deletableFieldsetsLocator = additionalLinksPage.page.locator(additionalLinksPage.deletableFieldsets);
    await expect(deletableFieldsetsLocator).toHaveCount(2);
    let details1 = await additionalLinksPage.getLinkDetails(deletableFieldsetsLocator.nth(0));
    let details2 = await additionalLinksPage.getLinkDetails(deletableFieldsetsLocator.nth(1));
    expect(details1.url).toBe(link1.url);
    expect(details2.url).toBe(link2.url);
    await logWithColor(testInfo, 'Moving link 2 up...');
    const secondFieldset = deletableFieldsetsLocator.nth(1);
    await additionalLinksPage.clickMoveUp(secondFieldset);
    await additionalLinksPage.clickSave();
    await additionalLinksPage.waitForUpdateMessage('Additional links updated');
    await additionalLinksPage.clickAdditionalLinksTab();
    await expect(additionalLinksPage.page.locator(additionalLinksPage.addButton)).toBeVisible();
    await logWithColor(testInfo, 'Verifying order after move up...');
    deletableFieldsetsLocator = additionalLinksPage.page.locator(additionalLinksPage.deletableFieldsets);
    await expect(deletableFieldsetsLocator).toHaveCount(2);
    details1 = await additionalLinksPage.getLinkDetails(deletableFieldsetsLocator.nth(0));
    details2 = await additionalLinksPage.getLinkDetails(deletableFieldsetsLocator.nth(1));
    expect(details1.url).toBe(link2.url);
    expect(details2.url).toBe(link1.url);
    await logWithColor(testInfo, 'Moving link 2 (now first) down...');
    const firstFieldset = deletableFieldsetsLocator.nth(0);
    await additionalLinksPage.clickMoveDown(firstFieldset);
    await additionalLinksPage.clickSave();
    await additionalLinksPage.waitForUpdateMessage('Additional links updated');
    await additionalLinksPage.clickAdditionalLinksTab();
    await expect(additionalLinksPage.page.locator(additionalLinksPage.addButton)).toBeVisible();
    await logWithColor(testInfo, 'Verifying order after move down...');
    deletableFieldsetsLocator = additionalLinksPage.page.locator(additionalLinksPage.deletableFieldsets);
    await expect(deletableFieldsetsLocator).toHaveCount(2);
    details1 = await additionalLinksPage.getLinkDetails(deletableFieldsetsLocator.nth(0));
    details2 = await additionalLinksPage.getLinkDetails(deletableFieldsetsLocator.nth(1));
    expect(details1.url).toBe(link1.url);
    expect(details2.url).toBe(link2.url);
    await logWithColor(testInfo, 'Reorder test completed.');
  });

  test('Prevent blank entries being added', async ({ superAdminPage }, testInfo) => {
    const url = 'https://www.gov.uk/find-court-tribunal';
    const displayName = 'English Name';
    await logWithColor(testInfo, 'Attempting to save with URL but blank display name...');
    const firstFieldset = additionalLinksPage.page.locator(additionalLinksPage.visibleFieldsets).first();
    await additionalLinksPage.fillLinkDetails(firstFieldset, url, '', '');
    await additionalLinksPage.clickSave();
    await logWithColor(testInfo, 'Verifying blank display name errors...');
    await additionalLinksPage.waitForErrorSummary();
    await additionalLinksPage.checkErrorSummary(['Display name is required for additional link 1.']);
    await additionalLinksPage.checkFieldErrors(firstFieldset, {
      [additionalLinksPage.displayNameInput]: 'Display name is required'
    });
    await logWithColor(testInfo, 'Clearing fields and attempting to save with display name but blank URL...');
    await additionalLinksPage.clickClearLink(firstFieldset);
    await additionalLinksPage.fillLinkDetails(firstFieldset, '', displayName, '');
    await additionalLinksPage.clickSave();
    await logWithColor(testInfo, 'Verifying blank URL errors...');
    await additionalLinksPage.waitForErrorSummary();
    await additionalLinksPage.checkErrorSummary(['URL is required for additional link 1.']);
    await additionalLinksPage.checkFieldErrors(firstFieldset, {
      [additionalLinksPage.urlInput]: 'URL is required'
    });
    await logWithColor(testInfo, 'Prevent blank entries test completed.');
  });

  test('URL format check', async ({ superAdminPage }, testInfo) => {
    const invalidUrl = 'find-court-tribunal';
    const displayName = 'englishName1';
    const displayNameCy = 'welshName1';
    await logWithColor(testInfo, 'Attempting to save with invalid URL format...');
    const firstFieldset = additionalLinksPage.page.locator(additionalLinksPage.visibleFieldsets).first();
    await additionalLinksPage.fillLinkDetails(firstFieldset, invalidUrl, displayName, displayNameCy);
    await additionalLinksPage.clickSave();
    await logWithColor(testInfo, 'Verifying invalid URL format errors...');
    await additionalLinksPage.waitForErrorSummary();
    await additionalLinksPage.checkErrorSummary(['URL must be in valid format for additional link 1.']);
    await additionalLinksPage.checkFieldErrors(firstFieldset, {
      [additionalLinksPage.urlInput]: 'Invalid URL format'
    });
    await logWithColor(testInfo, 'URL format check test completed.');
  });

  test('Prevent duplicated entries being added - URL', async ({ superAdminPage }, testInfo) => {
    const url = 'https://www.gov.uk/find-court-tribunal';
    const link1 = { url: url, displayName: 'englishName1', displayNameCy: 'welshName1' };
    const link2 = { url: url, displayName: 'englishName2', displayNameCy: 'welshName2' };
    await logWithColor(testInfo, 'Adding link 1 with duplicate URL...');
    await additionalLinksPage.addLinkToFirstEmptyFieldset(link1.url, link1.displayName, link1.displayNameCy);
    await logWithColor(testInfo, 'Adding link 2 with duplicate URL...');
    await additionalLinksPage.addLink(link2.url, link2.displayName, link2.displayNameCy);
    await additionalLinksPage.page.waitForTimeout(150); // Pause before save
    await logWithColor(testInfo, 'Saving duplicated URLs...');
    await additionalLinksPage.clickSave();
    await logWithColor(testInfo, 'Verifying duplicate URL errors...');
    await additionalLinksPage.waitForErrorSummary();
    await additionalLinksPage.checkErrorSummary(['All URLs must be unique.']);
    await additionalLinksPage.checkFieldErrorsAcrossFieldsets({
      0: { [additionalLinksPage.urlInput]: 'Duplicated URL' },
      1: { [additionalLinksPage.urlInput]: 'Duplicated URL' }
    });
    await logWithColor(testInfo, 'Prevent duplicate URL test completed.');
  });

  test('Prevent duplicated entries being added - Display Name', async ({ superAdminPage }, testInfo) => {
    const displayName = 'englishName1';
    const link1 = { url: 'https://www.gov.uk/find-court-tribunal', displayName: displayName, displayNameCy: 'welshName1' };
    const link2 = { url: 'https://www.google.co.uk/', displayName: displayName, displayNameCy: 'welshName2' };
    await logWithColor(testInfo, 'Adding link 1 with duplicate display name...');
    await additionalLinksPage.addLinkToFirstEmptyFieldset(link1.url, link1.displayName, link1.displayNameCy);
    await logWithColor(testInfo, 'Adding link 2 with duplicate display name...');
    await additionalLinksPage.addLink(link2.url, link2.displayName, link2.displayNameCy);
    await additionalLinksPage.page.waitForTimeout(150); // Pause before save
    await logWithColor(testInfo, 'Saving duplicated display names...');
    await additionalLinksPage.clickSave();
    await logWithColor(testInfo, 'Waiting for response after save (expecting error)...');
    try {
      await additionalLinksPage.waitForErrorSummary({ timeout: 10000 });
      await logWithColor(testInfo, 'Error summary found, proceeding with verification.');
      await additionalLinksPage.checkErrorSummary(['All display names must be unique.']);
      await additionalLinksPage.checkFieldErrorsAcrossFieldsets({
        0: { [additionalLinksPage.displayNameInput]: 'Duplicated display name' },
        1: { [additionalLinksPage.displayNameInput]: 'Duplicated display name' }
      });
    } catch (error) {
      await logWithColor(testInfo, 'Error summary not found within timeout. Checking for success message...');
      if (await additionalLinksPage.page.locator(additionalLinksPage.successMessageContainer).isVisible({ timeout: 1000 })) {
        const successMsg = await additionalLinksPage.getUpdateMessage();
        throw new Error(`Expected duplicate display name error, but received success message: "${successMsg}"`);
      } else {
        await logWithColor(testInfo, 'Neither error summary nor success message found.');
        throw error;
      }
    }
    await logWithColor(testInfo, 'Prevent duplicate display name test completed.');
  });

});
