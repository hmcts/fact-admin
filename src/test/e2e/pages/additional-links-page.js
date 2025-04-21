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
    this.errorSummaryItems = `${this.errorSummaryList} li`;
    this.fieldError = 'xpath=ancestor::div[contains(@class, "govuk-form-group--error")]/p[contains(@class, "govuk-error-message")]';
  }

  async clickAdditionalLinksTab() {
    await this.page.locator(this.navContainer).hover();
    await this.page.locator(this.additionalLinksTabId).click();
    await this.page.locator(this.mainContent).hover();
    await expect(this.page.locator(this.additionalLinksPanel)).not.toHaveClass(/fact-tabs-panel--hidden/);
    // Reduced timeout for form visibility check
    await expect(this.page.locator(this.form)).toBeVisible({ timeout: 7000 }); // Reduced to 7s
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
    // Rely on expect().toHaveCount(0) after loop
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
      await expect(urlInputLocator).toBeEditable(); // Use toBeEditable for inputs
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

  async getAllVisibleLinks() {
    // (No changes needed here)
    // ...
  }

  async getNthVisibleFieldset(index) {
    return this.page.locator(this.visibleFieldsets).nth(index);
  }

  async removeAllAdditionalLinksAndSave() {
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
      await expect(deletableRows).toHaveCount(0); // Check *after* loop
      console.log(`removeAllAdditionalLinksAndSave: Client-side deletable count is 0. Saving...`);

      const saveUrl = await this.page.locator(this.form).getAttribute('action');
      // Reduced timeout for backend response
      const waitPromise = this.page.waitForResponse(response =>
          response.url().includes(saveUrl) && response.request().method() === 'PUT' && response.status() === 200
        , { timeout: 10000 }); // Reduced to 10s

      await this.clickSave();
      console.log(`removeAllAdditionalLinksAndSave: Save clicked. Waiting for response...`);
      try {
        await waitPromise;
        console.log(`removeAllAdditionalLinksAndSave: PUT response received.`);
      } catch (e) {
        console.error(`removeAllAdditionalLinksAndSave: Error/timeout waiting for save response: ${e.message}`);
        throw new Error(`Save action PUT request to ${saveUrl} did not complete successfully within timeout.`);
      }

      // Reduce timeout for UI update message
      await this.waitForUpdateMessage('Additional links updated'); // Uses internal (now reduced) timeout
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

  async waitForUpdateMessage(expectedMessage, options = { timeout: 5000 }) { // Reduced default to 5s
    const timeout = options.timeout || 5000;
    const messageLocator = this.page.locator(this.successMessageTitle);
    await expect(this.page.locator(this.successMessageContainer)).toBeVisible({ timeout });
    await expect(messageLocator).toContainText(expectedMessage, { timeout });
    await expect(messageLocator).toBeVisible({ timeout }); // Check message title itself
    return messageLocator;
  }

  async getUpdateMessage() {
    await expect(this.page.locator(this.successMessageContainer)).toBeVisible();
    return await this.page.locator(this.successMessageTitle).textContent();
  }

  async waitForErrorSummary(options = { timeout: 5000 }) {
    const timeout = options.timeout || 5000;
    await expect(this.page.locator(this.errorSummary)).toBeVisible({ timeout });
    await expect(this.page.locator(this.errorSummaryTitle)).toBeVisible({ timeout });
  }

  async getErrorSummaryMessages() {
    await this.waitForErrorSummary();
    const items = this.page.locator(this.errorSummaryItems);
    return await items.allTextContents();
  }

  async getFieldError(fieldsetLocator, inputSelector) {
    const inputElement = fieldsetLocator.locator(inputSelector);
    const errorElement = inputElement.locator(this.fieldError);
    await expect(errorElement).toBeVisible();
    return await errorElement.textContent();
  }

  async checkFieldErrors(fieldsetLocator, expectedErrorsMap) {
    for (const [inputSelector, expectedError] of Object.entries(expectedErrorsMap)) {
      const actualError = await this.getFieldError(fieldsetLocator, inputSelector);
      expect(actualError).toContain(expectedError);
    }
  }

  async checkFieldErrorsAcrossFieldsets(fieldsetErrorMap) {
    for (const [index, errors] of Object.entries(fieldsetErrorMap)) {
      const fieldset = this.page.locator(this.visibleFieldsets).nth(parseInt(index, 10));
      await this.checkFieldErrors(fieldset, errors);
    }
  }

  async checkErrorSummary(expectedErrors) {
    await this.waitForErrorSummary();
    const actualErrors = await this.getErrorSummaryMessages();
    const cleanedActualErrors = actualErrors.map(e => e.trim()).filter(Boolean);
    expect(cleanedActualErrors).toEqual(expect.arrayContaining(expectedErrors));
  }
}

module.exports = { AdditionalLinksPage };
