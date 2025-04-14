// src/test/e2e/tests/photo.spec.js
/**
 * @file Court Photo Functionality Tests
 * @description This spec tests uploading and deleting court photos via the 'Photo' tab.
 * Key Dependencies/Assumptions & Challenges:
 * - Test uses the 'superAdminPage' fixture for authentication.
 * - Tests run serially (`test.describe.serial`) as they modify the photo state for the
 *   *same court* (`aberdeen-tribunal-hearing-centre`).
 * - Uses `PhotoPage` Page Object Model.
 * - `beforeEach` performs cleanup: it navigates to the correct tab and calls
 *   `deleteExistingPhotoIfExists` to ensure tests start without an existing photo.
 * - **Timing Issue:** A significant challenge was identified where client-side JavaScript
 *   (likely an AJAX call refreshing the tab content via `getPhoto()`) interfered with the
 *   file input *after* a file was selected via automation, but *before* the update button
 *   click was processed. This caused the file selection state to be lost.
 * - **Workaround:** An explicit `page.waitForTimeout(500)` was added between the photo upload
 *   step and clicking the 'Update' button. This pause allows the interfering JavaScript/AJAX
 *   to complete, ensuring the form submission includes the selected file. This fixed the issue
 *   where the server previously responded with a 400 Bad Request due to missing file data.
 * - **Delete Confirmation Wait:** Added explicit `waitForResponse` in the POM's `deleteExistingPhotoIfExists`
 *   method to ensure the test waits for the confirmation view AJAX call to complete before
 *   looking for the final confirm button.
 */
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { PhotoPage } = require('../pages/photo-page');
const { LoginPage } = require('../pages/login-page');
const { logWithColor } = require('../fixtures/auth.setup');

test.describe.serial('Court Photo Functionality', () => {
  const courtSlug = 'aberdeen-tribunal-hearing-centre';
  const courtName = 'Aberdeen Tribunal Hearing Centre';
  const editUrl = `/courts/${courtSlug}/edit`;
  const baseUrl = process.env.CI ? process.env.TEST_URL : 'http://localhost:3300';
  const photoFilePath = 'src/test/e2e/resources/sample-photo.jpg';
  const successMessage = 'Photo updated';
  const updateUrlPattern = `/courts/${courtSlug}/photo`;

  let photoPage;

  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, `Starting test: ${testInfo.title}`);
    photoPage = new PhotoPage(superAdminPage);

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
      const appHostRegex = new RegExp(`^${baseUrl.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}`);
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
    await logWithColor(testInfo, 'Clicking Photo tab...');
    await photoPage.clickPhotoTab();
    await logWithColor(testInfo, 'Photo tab clicked and panel loaded.');
    await logWithColor(testInfo, 'Starting cleanup: Checking for and deleting existing photo...');
    await photoPage.deleteExistingPhotoIfExists(); // This now includes the necessary wait
    await logWithColor(testInfo, 'Cleanup complete. Ready for test.');
  });


  test('Upload new court photo and verify success', async ({ superAdminPage }, testInfo) => {
    await logWithColor(testInfo, 'Test Step: Uploading new photo...');
    await photoPage.uploadPhoto(photoFilePath);
    await logWithColor(testInfo, `Test Step: File selected: ${photoFilePath}`);

    // **** Workaround for Timing Issue ****
    await logWithColor(testInfo, 'Adding short pause before clicking update (Workaround)...');
    // Corrected syntax: use superAdminPage directly
    await superAdminPage.waitForTimeout(500);
    await logWithColor(testInfo, 'Pause finished.');
    // **** End Workaround ****

    await logWithColor(testInfo, 'Test Step: Clicking update photo button...');
    const waitPromise = superAdminPage.waitForResponse(
      response => response.url().includes(updateUrlPattern) && response.request().method() === 'PUT',
      { timeout: 20000 }
    );
    await photoPage.clickUpdatePhoto();

    try {
      const response = await waitPromise;
      await logWithColor(testInfo, `NETWORK: Received response status: ${response.status()}`);

      if (response.status() !== 200) {
        const responseBody = await response.text().catch(() => 'Could not read response body');
        await logWithColor(testInfo, `ERROR: Received non-200 status: ${response.status()}. Body: ${responseBody}`);
        if (await photoPage.page.locator(photoPage.errorSummary).isVisible({timeout: 1000})) {
          const errorText = await photoPage.page.locator(photoPage.errorSummary).textContent();
          console.error('ERROR SUMMARY DETECTED:', errorText);
        }
        throw new Error(`Photo update PUT request failed with status ${response.status()}`);
      }

      await logWithColor(testInfo, 'Test Step: Update photo PUT request completed successfully (200 OK).');
      await logWithColor(testInfo, 'Test Step: Verifying success message...');
      await photoPage.waitForSuccessMessage(successMessage);
      await logWithColor(testInfo, `Success message "${successMessage}" verified.`);
      await logWithColor(testInfo, 'Test Step: Verifying new photo is displayed...');
      await photoPage.verifyNewPhotoIsDisplayed();
      await logWithColor(testInfo, 'New photo image element is visible.');

    } catch (e) {
      await logWithColor(testInfo, `Test Step: Error during photo update/wait: ${e.message}`);
      const errorSummaryVisible = await superAdminPage.locator(photoPage.errorSummary).isVisible({timeout: 1000});
      const fieldErrorVisible = await superAdminPage.locator(photoPage.fieldError).isVisible({timeout: 1000});
      if (errorSummaryVisible) {
        const errorText = await superAdminPage.locator(photoPage.errorSummary).textContent();
        console.error('FINAL ERROR SUMMARY:', errorText);
      }
      if (fieldErrorVisible) {
        const fieldError = await photoPage.getFieldErrorMessage().catch(() => 'No field error found');
        console.error('FINAL FIELD ERROR:', fieldError);
      }
      throw e;
    }

    await logWithColor(testInfo, 'Test finished successfully.');
  });
});
