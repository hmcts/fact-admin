// src/test/e2e/pages/emails-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

/**
 * Page Object Model for the 'Emails' tab within the Edit Court page.
 */
class EmailsPage extends BasePage {
  constructor(page) {
    super(page);

    // --- Main Locators ---
    this.navContainer = '#nav';
    this.emailsTabLink = '#tab_emails';
    this.emailsPanel = 'div.fact-tabs-panel#emails';
    this.emailsForm = `${this.emailsPanel} #emailsForm`;
    this.emailsContent = `${this.emailsForm} #emailsContent`;
    this.mainContentArea = 'main#main-content';

    // --- Interaction Elements ---
    this.addButton = `${this.emailsPanel} button.addEmail`;
    this.saveButton = `${this.emailsPanel} button[name="saveEmail"]`;
    this.hiddenTemplateFieldset = `${this.emailsContent} #newEmailTemplate`;
    // Selects fieldsets that are *not* the hidden template and are currently visible
    this.visibleFieldsets = `${this.emailsContent} fieldset:visible:not(#newEmailTemplate)`;
    // Selects fieldsets that contain a remove button (i.e., saved or dynamically added)
    this.removableFieldsets = `${this.visibleFieldsets}:has(button.deleteEmail)`;
    // Specific selector for the *visible* remove buttons within removable fieldsets
    this.visibleRemoveButton = `${this.removableFieldsets} button.deleteEmail:visible`;

    // --- Elements within a Fieldset (relative selectors) ---
    this.descriptionSelect = 'select[name$="[adminEmailTypeId]"]';
    this.addressInput = 'input[name$="[address]"]';
    this.explanationInput = 'input[name$="[explanation]"]';
    this.explanationCyInput = 'input[name$="[explanationCy]"]';
    this.removeButton = 'button.deleteEmail';
    this.clearButton = 'button.clearEmail';
    this.moveUpButton = 'button.move-up';
    this.moveDownButton = 'button.move-down';

    // --- Messages ---
    this.successMessageContainer = `${this.emailsContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successMessageContainer} > h2.govuk-panel__title`;
    this.errorSummary = `${this.emailsContent} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryItems = `${this.errorSummaryList} li`;

    // Field-level error message relative selector
    this.fieldError = 'p.govuk-error-message';

    // --- Error Message Constants (from controller / observed field errors) ---
    this.emptyTypeOrAddressErrorMsg = 'Description and address are required for all emails.';
    this.emailDuplicatedErrorMsg = 'All email addresses must be unique.';
    this.getEmailAddressFormatErrorMsg = 'Invalid email address format';
  }

  /**
   * Clicks the 'Emails' tab and waits for the basic panel/buttons to load.
   */
  async clickEmailsTabOnly() {
    await this.page.locator(this.navContainer).hover();
    await this.page.locator(this.emailsTabLink).click();
    await this.page.locator(this.mainContentArea).hover(); // Move mouse away

    await expect(this.page.locator(this.emailsPanel)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.emailsPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });

    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeVisible({ timeout: 15000 });
    await expect(saveButtonLocator).toBeEnabled({ timeout: 5000 });
    await expect(this.page.locator(this.addButton)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Waits for the AJAX request that loads the email entries to complete.
   * Assumes a GET request to /courts/:slug/emails.
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   */
  async waitForEmailsAjaxLoad(courtSlug, options = { timeout: 15000 }) {
    const getUrlPattern = `/courts/${courtSlug}/emails`;
    console.log(`Waiting for AJAX response: GET ${getUrlPattern}`);
    try {
      await this.page.waitForResponse(
        response => response.url().includes(getUrlPattern) && response.request().method() === 'GET' && response.status() === 200,
        options
      );
      console.log(`AJAX response received: GET ${getUrlPattern}`);
    } catch (e) {
      console.warn(`Timeout or error waiting for GET ${getUrlPattern} response: ${e.message}. Proceeding with caution.`);
    }
    // Wait for DOM to likely settle after AJAX load
    await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => console.warn('Timeout waiting for domcontentloaded after email AJAX load.'));
  }


  /**
   * Clicks the 'Emails' tab and waits for both the tab structure AND the AJAX content to load.
   * @param {string} courtSlug - The slug of the court being edited.
   */
  async clickEmailsTabAndWaitForLoad(courtSlug) {
    await this.clickEmailsTabOnly();
    await this.waitForEmailsAjaxLoad(courtSlug);
  }


  /**
   * Cleanup using a while loop to click remove buttons until none are visible.
   * Then saves, reloads, re-activates tab, and verifies final state.
   * @param {string} courtSlug - The slug of the court being edited.
   */
  async removeAllEmailsAndSave(courtSlug) {
    await expect(this.page.locator(this.addButton)).toBeVisible(); // Ensure tab is ready

    const removeButtonLocator = this.page.locator(this.visibleRemoveButton);
    let removedCount = 0;
    const maxRemoveClicks = 20; // Safety break

    console.log(`removeAllEmailsAndSave: Starting remove loop.`);
    while (await removeButtonLocator.first().isVisible({ timeout: 500 }) && removedCount < maxRemoveClicks) {
      await removeButtonLocator.first().click();
      removedCount++;
      await this.page.waitForTimeout(100); // Pause for DOM update
    }

    if (removedCount >= maxRemoveClicks) {
      console.error(`removeAllEmailsAndSave: Exceeded max remove clicks (${maxRemoveClicks}). Potential issue.`);
    }

    if (removedCount > 0) {
      console.log(`removeAllEmailsAndSave: Clicked remove ${removedCount} times. Saving removal attempt...`);
      // Save the removal attempt ONCE
      await Promise.all([
        this.waitForSaveResponse(courtSlug),
        this.clickSave()
      ]);
      console.log(`removeAllEmailsAndSave: Save PUT request completed.`);
      await this.waitForUpdateMessage('Emails updated');
      console.log(`removeAllEmailsAndSave: Initial success message verified.`);

    } else {
      console.log(`removeAllEmailsAndSave: No deletable email entries found to click remove on.`);
    }

    // Reload page and re-activate tab to get actual server state
    console.log(`removeAllEmailsAndSave: Reloading page to verify persisted state...`);
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    console.log(`removeAllEmailsAndSave: Page reloaded. Re-activating Emails tab...`);
    await this.clickEmailsTabAndWaitForLoad(courtSlug); // Includes AJAX wait
    console.log(`removeAllEmailsAndSave: Emails tab re-activated and AJAX load awaited.`);

    // Final check: Ensure only one fieldset (the empty template) remains after reload and AJAX wait
    console.log(`removeAllEmailsAndSave: Performing final check for 1 visible fieldset...`);
    const finalFieldsetsLocator = this.page.locator(this.visibleFieldsets);
    await expect(finalFieldsetsLocator).toHaveCount(1, { timeout: 10000 });
    console.log(`removeAllEmailsAndSave: Cleanup check complete. Verified 1 visible fieldset remains.`);
  }


  /**
   * Clicks the 'Add new Email' button and waits for a new fieldset to appear.
   */
  async clickAddNewEmail() {
    const fieldsetsLocator = this.page.locator(this.visibleFieldsets);
    const initialCount = await fieldsetsLocator.count();
    await this.page.locator(this.addButton).click();
    await expect(fieldsetsLocator).toHaveCount(initialCount + 1, { timeout: 5000 });
  }

  /**
   * Fills the details for an email entry within a specific fieldset.
   * Includes a wait for the fieldset to be stable after filling.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the specific fieldset.
   * @param {object} data - Object containing email data { descriptionIndex?, address?, explanation?, explanationCy? }.
   *                        `descriptionIndex` is the 0-based index for the <select> options.
   */
  async fillEmailDetails(fieldsetLocator, data) {
    await expect(fieldsetLocator).toBeVisible();

    if (data.descriptionIndex !== undefined && data.descriptionIndex !== null) {
      // The <select> in the 'add new' form has an extra initial blank option.
      // Adjust index only if this fieldset is likely the 'add new' one (no remove button).
      const hasRemoveButton = await fieldsetLocator.locator(this.removeButton).isVisible({ timeout: 100 });
      const indexToSelect = !hasRemoveButton ? data.descriptionIndex + 1 : data.descriptionIndex;
      await fieldsetLocator.locator(this.descriptionSelect).selectOption({ index: indexToSelect });
    }
    if (data.address !== undefined && data.address !== null) {
      await fieldsetLocator.locator(this.addressInput).fill(data.address);
    }
    if (data.explanation !== undefined && data.explanation !== null) {
      await fieldsetLocator.locator(this.explanationInput).fill(data.explanation);
    }
    if (data.explanationCy !== undefined && data.explanationCy !== null) {
      await fieldsetLocator.locator(this.explanationCyInput).fill(data.explanationCy);
    }
    // Wait for the last filled input to be stable as a proxy for the row being ready
    const lastInputSelector = data.explanationCy !== undefined ? this.explanationCyInput : (data.explanation !== undefined ? this.explanationInput : (data.address !== undefined ? this.addressInput : null));
    const expectedValue = data.explanationCy ?? data.explanation ?? data.address ?? '';

    if (lastInputSelector) {
      await expect(fieldsetLocator.locator(lastInputSelector)).toHaveValue(expectedValue, { timeout: 5000 });
    } else {
      await this.page.waitForTimeout(50); // Minimal pause if nothing was filled
    }
  }


  /**
   * Adds a new email entry by clicking 'Add', locating the last fieldset, and filling its details.
   * @param {object} data - Object containing email data { descriptionIndex, address, explanation, explanationCy }.
   */
  async addEmail(data) {
    await this.clickAddNewEmail();
    const newFieldset = this.page.locator(this.visibleFieldsets).last();
    await this.fillEmailDetails(newFieldset, data);
    // Wait included in fillEmailDetails
  }

  /**
   * Fills details in the first visible fieldset (often the initially empty one).
   * @param {object} data - Object containing email data { descriptionIndex, address, explanation, explanationCy }.
   */
  async fillFirstEmptyEmail(data) {
    const firstFieldset = this.page.locator(this.visibleFieldsets).first();
    await this.fillEmailDetails(firstFieldset, data);
    // Wait included in fillEmailDetails
  }

  /**
   * Gets the Locator for the nth visible email fieldset (0-based index).
   * @param {number} index - The zero-based index.
   * @returns {import('@playwright/test').Locator}
   */
  getNthVisibleFieldset(index) {
    return this.page.locator(this.visibleFieldsets).nth(index);
  }

  /**
   * Gets the Locator for the last visible email fieldset.
   * @returns {import('@playwright/test').Locator}
   */
  getLastVisibleFieldset() {
    return this.page.locator(this.visibleFieldsets).last();
  }

  /**
   * Gets the Locator for the second-to-last visible email fieldset.
   * Waits until at least two fieldsets are visible before calculating the index.
   * @returns {Promise<import('@playwright/test').Locator>}
   */
  async getSecondLastVisibleFieldset() {
    const fieldsets = this.page.locator(this.visibleFieldsets);
    await expect(fieldsets).toHaveCount(2, { timeout: 7000 }); // Wait until at least 2 are present
    const count = await fieldsets.count();
    return fieldsets.nth(count - 2);
  }

  /**
   * Retrieves the current values from the input fields within a given email fieldset.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the fieldset.
   * @returns {Promise<object>} Object containing { descriptionIndex, address, explanation, explanationCy }. descriptionIndex is the selected index.
   */
  async getEmailDetails(fieldsetLocator) {
    await expect(fieldsetLocator).toBeVisible();
    // Get selected index directly
    const descriptionIndex = await fieldsetLocator.locator(this.descriptionSelect).evaluate(el => el.selectedIndex);
    const address = await fieldsetLocator.locator(this.addressInput).inputValue();
    const explanation = await fieldsetLocator.locator(this.explanationInput).inputValue();
    const explanationCy = await fieldsetLocator.locator(this.explanationCyInput).inputValue();

    // Adjust index back if it wasn't the 'add new' form (doesn't have the blank option)
    const hasRemoveButton = await fieldsetLocator.locator(this.removeButton).isVisible({ timeout: 100 });
    const adjustedDescriptionIndex = !hasRemoveButton ? descriptionIndex -1 : descriptionIndex;


    return { descriptionIndex: adjustedDescriptionIndex, address, explanation, explanationCy };
  }

  /**
   * Clicks the 'Remove' button within a specific fieldset.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the fieldset.
   */
  async clickRemoveEmail(fieldsetLocator) {
    await expect(fieldsetLocator.locator(this.removeButton)).toBeVisible();
    await fieldsetLocator.locator(this.removeButton).click();
  }

  /**
   * Clicks the 'Move Up' button within a specific fieldset.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the fieldset.
   */
  async clickMoveUp(fieldsetLocator) {
    await expect(fieldsetLocator.locator(this.moveUpButton)).toBeVisible();
    await fieldsetLocator.locator(this.moveUpButton).click();
    await this.page.waitForTimeout(250); // Pause for client-side JS
  }

  /**
   * Clicks the 'Move Down' button within a specific fieldset.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the fieldset.
   */
  async clickMoveDown(fieldsetLocator) {
    await expect(fieldsetLocator.locator(this.moveDownButton)).toBeVisible();
    await fieldsetLocator.locator(this.moveDownButton).click();
    await this.page.waitForTimeout(250); // Pause for client-side JS
  }

  /**
   * Clicks the main 'Save emails' button.
   */
  async clickSave() {
    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeEnabled();
    await saveButtonLocator.click();
  }

  /**
   * Waits for the Emails update PUT request to complete successfully (200 OK).
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponse(courtSlug, options = { timeout: 15000 }) {
    const updateUrlPattern = `/courts/${courtSlug}/emails`;
    return this.page.waitForResponse(
      response =>
        response.url().includes(updateUrlPattern) &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
      options
    );
  }

  /**
   * Waits for the Emails update PUT request to complete *with an error* (non-200).
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponseWithError(courtSlug, options = { timeout: 15000 }) {
    const updateUrlPattern = `/courts/${courtSlug}/emails`;
    return this.page.waitForResponse(
      response =>
        response.url().includes(updateUrlPattern) &&
        response.request().method() === 'PUT' &&
        response.status() !== 200, // Expecting non-200 status
      options
    );
  }

  /**
   * Waits for the success confirmation panel to appear and verifies its title.
   * @param {string} expectedMessage - The expected text content of the success message title.
   * @param {object} [options={ timeout: 10000 }] - Options like timeout.
   */
  async waitForUpdateMessage(expectedMessage, options = { timeout: 10000 }) {
    const messageLocator = this.page.locator(this.successMessageTitle);
    await expect(this.page.locator(this.successMessageContainer)).toBeVisible(options);
    await expect(messageLocator).toContainText(expectedMessage, { timeout: options.timeout });
    await expect(messageLocator).toBeVisible(options);
  }

  /**
   * Waits for the error summary panel to be visible.
   * @param {object} [options={ timeout: 5000 }] - Options like timeout.
   */
  async waitForErrorSummary(options = { timeout: 5000 }) {
    await expect(this.page.locator(this.errorSummary)).toBeVisible(options);
    await expect(this.page.locator(this.errorSummaryTitle)).toBeVisible(options);
  }

  /**
   * Gets all error messages from the visible error summary list.
   * @returns {Promise<string[]>} An array of trimmed error message strings.
   */
  async getErrorSummaryMessages() {
    await this.waitForErrorSummary();
    const items = this.page.locator(this.errorSummaryItems);
    await items.first().waitFor({ state: 'visible', timeout: 3000 });
    const texts = await items.allTextContents();
    return texts.map(text => text.trim()).filter(Boolean);
  }

  /**
   * Checks if the visible error summary list contains exactly the expected error messages (order-independent).
   * @param {string[]} expectedErrors - An array of expected error message strings.
   */
  async checkErrorSummaryExact(expectedErrors) {
    await this.waitForErrorSummary();
    const actualErrors = await this.getErrorSummaryMessages();
    expect(actualErrors.sort()).toEqual(expectedErrors.sort());
  }

  /**
   * Gets the field-level error message associated with a specific input element within its form group.
   * @param {import('@playwright/test').Locator} inputLocator - The Playwright locator for the input/select element.
   * @returns {Promise<string>} The trimmed error message text.
   */
  async getFieldError(inputLocator) {
    const formGroup = inputLocator.locator('xpath=ancestor::div[contains(@class, "govuk-form-group--error")]');
    await expect(formGroup).toBeVisible({ timeout: 3000 });
    const errorLocator = formGroup.locator(this.fieldError);
    await expect(errorLocator).toBeVisible({ timeout: 5000 });
    return (await errorLocator.textContent()).trim();
  }

  /**
   * Checks field-level errors for multiple inputs within a specific fieldset.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the fieldset.
   * @param {object} errorMap - An object where keys are POM input selectors (e.g., this.addressInput)
   *                           and values are the expected error message strings.
   */
  async checkFieldErrors(fieldsetLocator, errorMap) {
    for (const [inputSelector, expectedError] of Object.entries(errorMap)) {
      const inputLocator = fieldsetLocator.locator(inputSelector);
      const actualError = await this.getFieldError(inputLocator);
      expect(actualError).toContain(expectedError);
    }
  }

  /**
   * Checks field-level errors across multiple fieldsets, typically used for duplication errors.
   * @param {object} fieldsetErrorMap - An object where keys are the 0-based indices of the VISIBLE fieldsets,
   *                                 and values are objects mapping input selectors to expected errors
   *                                 (similar to the `errorMap` in `checkFieldErrors`).
   */
  async checkFieldErrorsAcrossFieldsets(fieldsetErrorMap) {
    for (const [indexStr, errors] of Object.entries(fieldsetErrorMap)) {
      const index = parseInt(indexStr, 10);
      const fieldset = this.getNthVisibleFieldset(index);
      await this.checkFieldErrors(fieldset, errors);
    }
  }
}

module.exports = { EmailsPage };
