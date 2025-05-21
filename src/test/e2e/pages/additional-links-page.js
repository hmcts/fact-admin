// src/test/e2e/pages/additional-links-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

class AdditionalLinksPage extends BasePage {
  constructor(page) {
    super(page);

    this.mainContent = 'main#main-content';
    this.navContainer = '#nav';
    this.additionalLinksTabId = '#tab_additional-links';
    this.additionalLinksPanel = 'div.fact-tabs-panel#additional-links';
    this.additionalLinksTabContainer = `${this.additionalLinksPanel} #additionalLinksTab`;
    this.form = `${this.additionalLinksTabContainer} #additionalLinksForm`;
    this.additionalLinksContent = `${this.form} #additionalLinksContent`;
    this.saveButton = `${this.form} button[name="saveAdditionalLink"]`;
    this.addButton = `${this.additionalLinksTabContainer} button.addAdditionalLink`;
    this.visibleFieldsets = `${this.additionalLinksContent} fieldset:visible:not(#newAdditionalLinkTemplate)`;
    this.deletableFieldsets = `${this.visibleFieldsets}:has(button.deleteAdditionalLink)`;
    this.deleteButton = 'button.deleteAdditionalLink';
    this.clearButton = 'button.clearAdditionalLink';
    this.moveUpButton = 'button.move-up';
    this.moveDownButton = 'button.move-down';
    this.urlInput = 'input[name$="[url]"]';
    this.displayNameInput = 'input[name$="[display_name]"]';
    this.displayNameCyInput = 'input[name$="[display_name_cy]"]';
    this.successMessageContainer = `${this.additionalLinksContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successMessageContainer} > h2.govuk-panel__title`;
    this.errorSummary = '.govuk-error-summary';
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryItems = `${this.errorSummaryList} li`; // Selector for individual error <li> items
    this.fieldError = 'xpath=ancestor::div[contains(@class, "govuk-form-group--error")]/p[contains(@class, "govuk-error-message")]';
  }

  // ... (other methods like clickAdditionalLinksTab, clickSave, etc. remain unchanged) ...
  async clickAdditionalLinksTab() {
    await this.page.locator(this.navContainer).hover();
    await this.page.locator(this.additionalLinksTabId).click();
    await this.page.locator(this.mainContent).hover();
    await expect(this.page.locator(this.additionalLinksPanel)).not.toHaveClass(/fact-tabs-panel--hidden/);
    await expect(this.page.locator(this.form)).toBeVisible({ timeout: 7000 });
    await expect(this.page.locator(this.addButton)).toBeVisible();
    console.log('clickAdditionalLinksTab: Tab clicked, form and Add button are visible.');
  }

  async clickSave() {
    await this.page.locator(this.saveButton).click();
  }

  async clickAddNewLink() {
    const fieldsetsLocator = this.page.locator(this.visibleFieldsets);
    const initialCount = await fieldsetsLocator.count();
    await this.page.locator(this.addButton).click();
    await expect(fieldsetsLocator).toHaveCount(initialCount + 1);
  }

  async clickRemoveLink(fieldsetLocator) {
    const deleteButton = fieldsetLocator.locator(this.deleteButton);
    await deleteButton.click();
  }

  async clickClearLink(fieldsetLocator) {
    await fieldsetLocator.locator(this.clearButton).click();
  }

  async clickMoveUp(fieldsetLocator) {
    await fieldsetLocator.locator(this.moveUpButton).click();
  }

  async clickMoveDown(fieldsetLocator) {
    await fieldsetLocator.locator(this.moveDownButton).click();
  }

  async fillLinkDetails(fieldsetLocator, url, displayName, displayNameCy) {
    await expect(fieldsetLocator).toBeVisible();
    if (url !== null && url !== undefined) {
      const urlInputLocator = fieldsetLocator.locator(this.urlInput);
      await expect(urlInputLocator).toBeEditable();
      await urlInputLocator.focus();
      await urlInputLocator.fill(url);
    }
    if (displayName !== null && displayName !== undefined) {
      const displayNameInputLocator = fieldsetLocator.locator(this.displayNameInput);
      await expect(displayNameInputLocator).toBeEditable();
      await displayNameInputLocator.focus();
      await displayNameInputLocator.fill(displayName);
    }
    if (displayNameCy !== null && displayNameCy !== undefined) {
      const displayNameCyInputLocator = fieldsetLocator.locator(this.displayNameCyInput);
      await expect(displayNameCyInputLocator).toBeEditable();
      await displayNameCyInputLocator.focus();
      await displayNameCyInputLocator.fill(displayNameCy);
    }
  }

  async addLink(url, displayName, displayNameCy) {
    await this.clickAddNewLink();
    const newFieldset = this.page.locator(this.visibleFieldsets).last();
    await this.fillLinkDetails(newFieldset, url, displayName, displayNameCy);
  }

  async addLinkToFirstEmptyFieldset(url, displayName, displayNameCy) {
    const firstFieldset = this.page.locator(this.visibleFieldsets).first();
    await this.fillLinkDetails(firstFieldset, url, displayName, displayNameCy);
  }

  async getLinkDetails(fieldsetLocator) {
    await expect(fieldsetLocator).toBeVisible();
    const url = await fieldsetLocator.locator(this.urlInput).inputValue();
    const displayName = await fieldsetLocator.locator(this.displayNameInput).inputValue();
    const displayNameCy = await fieldsetLocator.locator(this.displayNameCyInput).inputValue();
    return { url, displayName, displayNameCy };
  }

  async getAllVisibleLinks() { /* ... no changes ... */ }
  async getNthVisibleFieldset(index) { return this.page.locator(this.visibleFieldsets).nth(index); }
  async removeAllAdditionalLinksAndSave() { /* ... no changes ... */
    await expect(this.page.locator(this.addButton)).toBeVisible();
    const deletableRows = this.page.locator(this.deletableFieldsets);
    const count = await deletableRows.count();
    const visibleRows = this.page.locator(this.visibleFieldsets);
    if (count > 0) {
      console.log(`removeAllAdditionalLinksAndSave: Found ${count} deletable rows. Removing...`);
      for (let i = count - 1; i >= 0; i--) {
        const rowToRemove = deletableRows.nth(i);
        console.log(`removeAllAdditionalLinksAndSave: Clicking remove for deletable row index ${i}...`);
        await this.clickRemoveLink(rowToRemove);
      }
      await expect(deletableRows).toHaveCount(0);
      console.log(`removeAllAdditionalLinksAndSave: Client-side deletable count is 0. Saving...`);
      const saveUrl = await this.page.locator(this.form).getAttribute('action');
      const waitPromise = this.page.waitForResponse(response =>
          response.url().includes(saveUrl) && response.request().method() === 'PUT' && response.status() === 200
        , { timeout: 10000 });
      await this.clickSave();
      console.log(`removeAllAdditionalLinksAndSave: Save clicked. Waiting for response...`);
      try {
        await waitPromise;
        console.log(`removeAllAdditionalLinksAndSave: PUT response received.`);
      } catch (e) {
        console.error(`removeAllAdditionalLinksAndSave: Error/timeout waiting for save response: ${e.message}`);
        throw new Error(`Save action PUT request to ${saveUrl} did not complete successfully within timeout.`);
      }
      await this.waitForUpdateMessage('Additional links updated');
      console.log(`removeAllAdditionalLinksAndSave: Save confirmed by message.`);
      await expect(deletableRows).toHaveCount(0);
      await expect(visibleRows).toHaveCount(1);
      console.log(`removeAllAdditionalLinksAndSave: Server-side state verified.`);
    } else {
      console.log(`removeAllAdditionalLinksAndSave: No deletable rows found.`);
      await expect(visibleRows).toHaveCount(1);
    }
    console.log(`removeAllAdditionalLinksAndSave: Cleanup complete.`);
  }
  async waitForUpdateMessage(expectedMessage, options = { timeout: 5000 }) { /* ... no changes ... */
    const timeout = options.timeout || 5000;
    const messageLocator = this.page.locator(this.successMessageTitle);
    await expect(this.page.locator(this.successMessageContainer)).toBeVisible({ timeout });
    await expect(messageLocator).toContainText(expectedMessage, { timeout });
    await expect(messageLocator).toBeVisible({ timeout });
    return messageLocator;
  }
  async getUpdateMessage() { /* ... no changes ... */
    await expect(this.page.locator(this.successMessageContainer)).toBeVisible();
    return await this.page.locator(this.successMessageTitle).textContent();
  }

  async waitForErrorSummary(options = { timeout: 5000 }) {
    const timeout = options.timeout || 5000;
    await expect(this.page.locator(this.errorSummary)).toBeVisible({ timeout });
    await expect(this.page.locator(this.errorSummaryTitle)).toBeVisible({ timeout });
  }

  // getErrorSummaryMessages can be kept if used elsewhere, but checkErrorSummary will be self-contained for retries.
  async getErrorSummaryMessages() {
    await this.waitForErrorSummary(); // Ensures summary container is ready before fetching
    const items = this.page.locator(this.errorSummaryItems);
    return await items.allTextContents();
  }

  // No longer needed if checkFieldErrors is updated, but keep if used elsewhere.
  // async getFieldError(fieldsetLocator, inputSelector) { ... }

  /**
   * MODIFIED: checkFieldErrors now uses auto-retrying assertions.
   */
  async checkFieldErrors(fieldsetLocator, expectedErrorsMap, options = { timeout: 5000 }) {
    const resolvedTimeout = options.timeout || 5000;
    for (const [inputSelector, expectedError] of Object.entries(expectedErrorsMap)) {
      const inputElement = fieldsetLocator.locator(inputSelector);
      const errorElement = inputElement.locator(this.fieldError);
      // This will retry until the errorElement is visible AND contains the expected text.
      await expect(errorElement).toContainText(expectedError, { timeout: resolvedTimeout });
      // Explicitly check visibility as well, as toContainText might pass on non-visible elements in some cases.
      await expect(errorElement).toBeVisible({ timeout: resolvedTimeout });
    }
  }

  async checkFieldErrorsAcrossFieldsets(fieldsetErrorMap) {
    for (const [index, errors] of Object.entries(fieldsetErrorMap)) {
      const fieldset = this.page.locator(this.visibleFieldsets).nth(parseInt(index, 10));
      await this.checkFieldErrors(fieldset, errors); // Will use the modified checkFieldErrors
    }
  }

  /**
   * MODIFIED: checkErrorSummary now retries the entire process of fetching and asserting messages.
   */
  async checkErrorSummary(expectedErrors, options = { timeout: 5000 }) {
    const resolvedTimeout = options.timeout || 5000;

    await expect(async () => {
      // 1. Ensure the error summary container and title are visible within the retry loop.
      await expect(this.page.locator(this.errorSummary)).toBeVisible({ timeout: resolvedTimeout });
      await expect(this.page.locator(this.errorSummaryTitle)).toBeVisible({ timeout: resolvedTimeout });

      // 2. Get the error messages from the list items.
      const errorItemsLocator = this.page.locator(this.errorSummaryItems);

      // Optional: Wait for list to be populated if errors are expected.
      // This helps stabilize allTextContents() if the list populates asynchronously.
      if (expectedErrors.length > 0) {
        // Check that there's at least one item and it's visible.
        await expect(errorItemsLocator.first()).toBeVisible({ timeout: resolvedTimeout / 2 }); // Give some time
      }
      // If expectedErrors.length is 0, you might check:
      // await expect(errorItemsLocator).toHaveCount(0, { timeout: resolvedTimeout / 2 });

      const actualErrorTexts = await errorItemsLocator.allTextContents();
      const cleanedActualErrorTexts = actualErrorTexts.map(e => e.trim()).filter(Boolean);

      // 3. Perform the assertion. This will be retried if it fails.
      expect(cleanedActualErrorTexts).toEqual(expect.arrayContaining(expectedErrors));

      // 4. IMPORTANT for expect.arrayContaining: Ensure the counts match if you want to avoid superset passes.
      // If `cleanedActualErrorTexts` could have more errors than `expectedErrors` but still pass
      // (because all `expectedErrors` are present), and that's not desired, add a length check.
      // For this specific failing test, `arrayContaining` failing is correct because the expected error is missing.
      // If you want to ensure an exact match of items (regardless of order), also check length:
      // expect(cleanedActualErrorTexts.length).toEqual(expectedErrors.length);

    }).toPass({
        timeout: resolvedTimeout,
        // message: () => `Error summary did not contain the expected errors [${expectedErrors.join(', ')}] or update in time.` // Optional custom message
    });
  }
}

module.exports = { AdditionalLinksPage };
