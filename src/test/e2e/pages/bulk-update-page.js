// src/test/e2e/pages/bulk-update-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

class BulkUpdatePage extends BasePage {
  constructor(page) {
    super(page);

    this.pageTitle = 'h1:has-text("Bulk edit of additional information")';
    this.includeClosedCheckbox = '#toggle-closed-courts-display';
    this.infoRichEditorFrame = '#info_message_ifr';
    this.infoRichEditorBody = '#tinymce';
    this.courtListContainer = 'main table tbody';
    this.updateButton = 'button:has-text("Update selected courts, overwriting existing text")';
    this.successPanel = '.govuk-panel--confirmation';
    this.successMessageTitle = `${this.successPanel} .govuk-panel__title`;

    this.courtCheckbox = (courtSlug) => `input[name="courts"][value="${courtSlug}"]`;
  }

  /**
   * Waits for the main elements of the Bulk Update page to be visible.
   */
  async waitForPageLoad() {
    await expect(this.page.locator(this.pageTitle)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.includeClosedCheckbox)).toBeVisible();
    await expect(this.page.locator(this.infoRichEditorFrame)).toBeVisible();
    await expect(this.page.locator(this.updateButton)).toBeEnabled({ timeout: 10000 });
    await expect(this.page.locator(this.courtListContainer)).toBeVisible({ timeout: 10000 });
  }

  /**
   * Checks or unchecks the "Include closed courts" checkbox.
   * Waits for the list content to potentially change.
   * @param {boolean} shouldBeChecked - True to check the box, false to uncheck it.
   */
  async setIncludeClosedCourts(shouldBeChecked) {
    const checkbox = this.page.locator(this.includeClosedCheckbox);
    const isCurrentlyChecked = await checkbox.isChecked();
    const listLocator = this.page.locator(this.courtListContainer);

    if (shouldBeChecked && !isCurrentlyChecked) {
      const rowsBefore = await listLocator.locator('tr').count();
      await checkbox.check();
      try {
        await expect(listLocator.locator('tr')).not.toHaveCount(rowsBefore, { timeout: 10000 });
      } catch (e) {
        await this.page.waitForLoadState('networkidle', { timeout: 8000 });
      }
    } else if (!shouldBeChecked && isCurrentlyChecked) {
      const rowsBefore = await listLocator.locator('tr').count();
      await checkbox.uncheck();
      try {
        await expect(listLocator.locator('tr')).not.toHaveCount(rowsBefore, { timeout: 10000 });
      } catch (e) {
        await this.page.waitForLoadState('networkidle', { timeout: 8000 });
      }
    } else {
      await this.page.waitForLoadState('networkidle', { timeout: 5000 });
    }
  }

  /**
   * Fills the "Additional Information" rich text editor.
   * @param {string} text - The content to add to the editor.
   */
  async fillInformation(text) {
    const frame = this.page.frameLocator(this.infoRichEditorFrame);
    const editorBody = frame.locator(this.infoRichEditorBody);
    await expect(editorBody).toBeVisible({ timeout: 10000 });
    await editorBody.fill('');
    await editorBody.fill(text);
  }

  /**
   * Selects a court by its slug by checking its checkbox.
   * Ensures the court checkbox is visible before attempting to check it.
   * @param {string} courtSlug - The value attribute of the court checkbox.
   */
  async selectCourtBySlug(courtSlug) {
    const checkboxLocator = this.page.locator(this.courtListContainer).locator(this.courtCheckbox(courtSlug));
    const courtRowLocator = checkboxLocator.locator('xpath=ancestor::tr');

    await courtRowLocator.scrollIntoViewIfNeeded();

    try {
      await expect(checkboxLocator).toBeVisible({ timeout: 10000 });
      if (!(await checkboxLocator.isChecked())) {
        await checkboxLocator.check();
      }
    } catch (error) {
      console.error(`BulkUpdatePage: Failed to find or check checkbox for court slug "${courtSlug}". Error: ${error}`);
      const courtListHtml = await this.page.locator(this.courtListContainer).innerHTML({ timeout: 2000 }).catch(() => 'Could not get court list HTML');
      console.error('BulkUpdatePage: Current court list HTML:\n', courtListHtml);
      throw error;
    }
  }

  /**
   * Clicks the final "Update" button.
   */
  async clickUpdate() {
    const updateButton = this.page.locator(this.updateButton);
    await expect(updateButton).toBeEnabled({ timeout: 5000 });
    await updateButton.click();
  }

  /**
   * Waits for the success message panel to appear and verifies its title.
   * @param {string} [expectedMessage='Court information updated'] - The expected text content of the success message title. Defaults to 'Court information updated'.
   */
  async waitForSuccessMessage(expectedMessage = 'Court information updated') {
    const messageTitle = this.page.locator(this.successMessageTitle);
    await expect(this.page.locator(this.successPanel)).toBeVisible({ timeout: 15000 });
    await expect(messageTitle).toContainText(expectedMessage, { timeout: 10000 });
  }
}

module.exports = { BulkUpdatePage };
