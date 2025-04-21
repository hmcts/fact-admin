// src/test/e2e/pages/application-progression-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

class ApplicationProgressionPage extends BasePage {
  constructor(page) {
    super(page);

    // --- Main Locators ---
    this.navContainer = '#nav';
    this.applicationProgressionTabLink = '#tab_application-progression';
    this.applicationProgressionPanel = 'div.fact-tabs-panel#application-progression';
    this.applicationProgressionForm = `${this.applicationProgressionPanel} #applicationProgressionForm`;
    this.applicationProgressionContent = `${this.applicationProgressionForm} #applicationProgressionContent`; // Used for cleanup scope
    this.mainContentArea = 'main#main-content';

    // --- Interaction Elements ---
    this.addButton = `${this.applicationProgressionPanel} button.addUpdate`;
    this.saveButton = `${this.applicationProgressionPanel} button[name="saveUpdate"]`;
    // Exact selector required by test specification for cleanup loop
    this.removeButtonSelector = '#applicationProgressionContent button:has-text("Remove")';
    this.removeButtonInFieldset = 'button.deleteUpdate';
    this.clearButtonInFieldset = 'button.clearUpdate';
    this.moveUpButtonInFieldset = 'button.move-up';
    this.moveDownButtonInFieldset = 'button.move-down';

    // Fieldsets (excluding the hidden template)
    this.visibleFieldsets = `${this.applicationProgressionContent} fieldset:visible:not(#newUpdateTemplate)`;

    // --- Input Fields (relative to a fieldset locator) ---
    this.typeInput = 'input[name$="[type]"]';
    this.typeCyInput = 'input[name$="[type_cy]"]'; // Welsh Type
    this.emailInput = 'input[name$="[email]"]';
    this.externalLinkInput = 'input[name$="[external_link]"]';
    this.externalLinkDescInput = 'input[name$="[external_link_description]"]';
    this.externalLinkDescCyInput = 'input[name$="[external_link_description_cy]"]'; // Welsh Description

    // --- Messages ---
    this.successMessageContainer = `${this.applicationProgressionContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successMessageContainer} > h2.govuk-panel__title`;
    this.errorSummary = `${this.applicationProgressionContent} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryItems = `${this.errorSummaryList} li`;

    // Field-level error message relative selector
    this.fieldError = 'p.govuk-error-message';
  }

  /**
   * Clicks the Application Progression tab and waits for the panel and essential buttons to load.
   */
  async clickApplicationProgressionTab() {
    await this.page.locator(this.navContainer).hover();
    await this.page.locator(this.applicationProgressionTabLink).click();
    await this.page.locator(this.mainContentArea).hover(); // Move mouse away

    await expect(this.page.locator(this.applicationProgressionPanel)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.applicationProgressionPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });

    await expect(this.page.locator(this.addButton)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.saveButton)).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator(this.saveButton)).toBeEnabled({ timeout: 5000 });
  }

  /**
   * Clicks the 'Save application updates' button.
   */
  async clickSave() {
    await expect(this.page.locator(this.saveButton)).toBeEnabled();
    await this.page.locator(this.saveButton).click();
  }

  /**
   * Clicks the 'Add new application progression' button and waits for a new fieldset to appear.
   */
  async clickAddNewProgression() {
    const fieldsetsLocator = this.page.locator(this.visibleFieldsets);
    const initialCount = await fieldsetsLocator.count();
    await this.page.locator(this.addButton).click();
    await expect(fieldsetsLocator).toHaveCount(initialCount + 1, { timeout: 5000 });
  }

  /**
   * Implements the specific cleanup routine using the required selector and while loop.
   * Uses locator.all() and checks count; minimal waits. Includes safety break.
   */
  async removeAllProgressionEntriesAndSave() {
    await expect(this.page.locator(this.addButton)).toBeVisible();

    const maxIterations = 50; // Safety break
    let iterations = 0;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      if (iterations++ > maxIterations) {
        throw new Error(`removeAllProgressionEntriesAndSave exceeded max iterations (${maxIterations}). Possible infinite loop or unexpected state.`);
      }

      const removeButtons = this.page.locator(this.removeButtonSelector);
      const count = await removeButtons.count();

      if (count === 0) {
        console.log('Cleanup Loop: No "Remove" buttons found. Breaking loop.');
        break;
      }

      console.log(`Cleanup Loop: Found ${count} "Remove" button(s). Attempting to click the first clickable one.`);

      let clicked = false;
      const allButtons = await removeButtons.all();

      for (const button of allButtons) {
        try {
          await expect(button).toBeEnabled({ timeout: 500 });
          console.log('Cleanup Loop: Found clickable button. Clicking...');
          await button.click();
          clicked = true;
          await this.page.waitForTimeout(200); // Brief pause for DOM updates
          console.log('Cleanup Loop: Click successful. Continuing loop.');
          break; // Restart while loop
        } catch (e) {
          console.log('Cleanup Loop: Button found but not clickable, trying next.');
        }
      }

      if (!clicked) {
        console.log('Cleanup Loop: No clickable "Remove" buttons found currently. Waiting...');
        try {
          // Wait briefly for a button to potentially become clickable
          await this.page.locator(this.removeButtonSelector).first().waitFor({ state: 'visible', timeout: 3000 });
        } catch (waitError) {
          console.log('Cleanup Loop: Timed out waiting for a remove button to become visible/enabled. Assuming cleanup finished.');
          break; // Break outer loop if wait times out
        }
      }
    }

    const remainingFieldsets = this.page.locator(this.visibleFieldsets);
    await expect(remainingFieldsets).toHaveCount(1, { timeout: 5000 });
    console.log('Cleanup Loop: Verified one fieldset remains.');

    console.log('Cleanup Loop: Saving the cleared state...');
    const saveUrlPattern = /\/courts\/.*\/application-progression/;
    const waitPromise = this.page.waitForResponse(
      response => saveUrlPattern.test(response.url()) && response.request().method() === 'PUT' && response.status() === 200,
      { timeout: 10000 }
    );

    await this.clickSave();
    try {
      await waitPromise;
      console.log('Cleanup Loop: Save successful (PUT request returned 200).');
      await this.waitForUpdateMessage('Application Progressions updated');
      console.log('Cleanup Loop: Success message verified.');
    } catch (e) {
      console.error(`Cleanup Loop: Error/timeout waiting for save response: ${e.message}`);
      if (await this.page.locator(this.errorSummary).isVisible({timeout: 1000})) {
        const errors = await this.getErrorSummaryMessages();
        console.error("Cleanup Loop: Error summary found after save:", errors);
      }
      throw new Error(`Cleanup save action did not complete successfully. Error: ${e.message}`);
    }

    await expect(remainingFieldsets).toHaveCount(1);
    console.log('Cleanup complete.');
  }


  /**
   * Fills the details for an application progression entry within a specific fieldset.
   * Handles potentially missing Welsh fields due to templating issues by checking visibility.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the specific fieldset.
   * @param {object} data - Object containing progression data { type?, typeCy?, email?, externalLink?, externalLinkDesc?, externalLinkDescCy? }.
   */
  async fillProgressionDetails(fieldsetLocator, data) {
    await expect(fieldsetLocator).toBeVisible();

    if (data.type !== undefined && data.type !== null) {
      await fieldsetLocator.locator(this.typeInput).fill(data.type);
    }
    // Handle potential missing Welsh Type field
    const typeCyLocator = fieldsetLocator.locator(this.typeCyInput);
    if (data.typeCy !== undefined && data.typeCy !== null && await typeCyLocator.isVisible()) {
      await typeCyLocator.fill(data.typeCy);
    } else if (data.typeCy !== undefined && data.typeCy !== null) {
      console.warn(`Attempted to fill Welsh Type ('${data.typeCy}') but the input field was not visible.`);
    }

    if (data.email !== undefined && data.email !== null) {
      await fieldsetLocator.locator(this.emailInput).fill(data.email);
    }
    if (data.externalLink !== undefined && data.externalLink !== null) {
      await fieldsetLocator.locator(this.externalLinkInput).fill(data.externalLink);
    }
    if (data.externalLinkDesc !== undefined && data.externalLinkDesc !== null) {
      await fieldsetLocator.locator(this.externalLinkDescInput).fill(data.externalLinkDesc);
    }
    // Handle potential missing Welsh Description field
    const externalLinkDescCyLocator = fieldsetLocator.locator(this.externalLinkDescCyInput);
    if (data.externalLinkDescCy !== undefined && data.externalLinkDescCy !== null && await externalLinkDescCyLocator.isVisible()) {
      await externalLinkDescCyLocator.fill(data.externalLinkDescCy);
    } else if (data.externalLinkDescCy !== undefined && data.externalLinkDescCy !== null) {
      console.warn(`Attempted to fill Welsh External Link Description ('${data.externalLinkDescCy}') but the input field was not visible.`);
    }
  }

  /**
   * Adds a new progression entry and fills its details.
   * @param {object} data - Object containing progression data.
   */
  async addProgression(data) {
    await this.clickAddNewProgression();
    const newFieldset = this.page.locator(this.visibleFieldsets).last();
    await this.fillProgressionDetails(newFieldset, data);
  }

  /**
   * Fills details in the first visible fieldset (often the initially empty one).
   * @param {object} data - Object containing progression data.
   */
  async fillFirstEmptyProgression(data) {
    const firstFieldset = this.page.locator(this.visibleFieldsets).first();
    await this.fillProgressionDetails(firstFieldset, data);
  }

  /**
   * Gets the Locator for the nth visible progression fieldset (0-based index).
   * @param {number} index - The zero-based index.
   * @returns {import('@playwright/test').Locator}
   */
  getNthProgressionFieldset(index) {
    return this.page.locator(this.visibleFieldsets).nth(index);
  }

  /**
   * Gets the Locator for the last visible progression fieldset.
   * @returns {import('@playwright/test').Locator}
   */
  getLastProgressionFieldset() {
    return this.page.locator(this.visibleFieldsets).last();
  }

  /**
   * Gets the Locator for the second-to-last visible progression fieldset.
   * Assumes there are at least two visible fieldsets.
   * @returns {import('@playwright/test').Locator}
   */
  getSecondLastProgressionFieldset() {
    const fieldsets = this.page.locator(this.visibleFieldsets);
    // nth is 0-based, count is 1-based. last is count - 1. second last is count - 2.
    return fieldsets.nth(fieldsets.count().then(c => c - 2));
  }

  /**
   * Retrieves the current values from the input fields within a given fieldset.
   * Handles potentially missing Welsh fields by checking visibility.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the fieldset.
   * @returns {Promise<object>} Object containing the values { type, typeCy, email, externalLink, externalLinkDesc, externalLinkDescCy }. Welsh fields might be null if not present.
   */
  async getProgressionDetails(fieldsetLocator) {
    await expect(fieldsetLocator).toBeVisible();
    const type = await fieldsetLocator.locator(this.typeInput).inputValue();
    const email = await fieldsetLocator.locator(this.emailInput).inputValue();
    const externalLink = await fieldsetLocator.locator(this.externalLinkInput).inputValue();
    const externalLinkDesc = await fieldsetLocator.locator(this.externalLinkDescInput).inputValue();

    const typeCyLocator = fieldsetLocator.locator(this.typeCyInput);
    const typeCy = await typeCyLocator.isVisible() ? await typeCyLocator.inputValue() : null;

    const externalLinkDescCyLocator = fieldsetLocator.locator(this.externalLinkDescCyInput);
    const externalLinkDescCy = await externalLinkDescCyLocator.isVisible() ? await externalLinkDescCyLocator.inputValue() : null;

    return { type, typeCy, email, externalLink, externalLinkDesc, externalLinkDescCy };
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
   * Checks if the visible error summary list contains the expected error messages.
   * Order is ignored, but all expected errors must be present, and no extras unless exactMatch is false.
   * @param {string[]} expectedErrors - An array of expected error message strings.
   * @param {boolean} [exactMatch=true] - If true, checks for an exact match (ignoring order). If false, checks if expected errors are a subset.
   */
  async checkErrorSummaryContains(expectedErrors, exactMatch = true) {
    await this.waitForErrorSummary();
    const actualErrors = await this.getErrorSummaryMessages();

    if (exactMatch) {
      expect(actualErrors.sort()).toEqual(expectedErrors.sort());
    } else {
      expect(actualErrors).toEqual(expect.arrayContaining(expectedErrors));
    }
  }

  /**
   * Gets the field-level error message associated with a specific input within a fieldset.
   * Assumes the error message is a <p class="govuk-error-message"> within the parent govuk-form-group--error.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the fieldset containing the input.
   * @param {string} inputSelector - The selector for the input element *relative* to the fieldset.
   * @returns {Promise<string>} The trimmed error message text.
   */
  async getFieldError(fieldsetLocator, inputSelector) {
    const inputElement = fieldsetLocator.locator(inputSelector);
    const formGroup = inputElement.locator('xpath=ancestor::div[contains(@class, "govuk-form-group--error")]');
    const errorLocator = formGroup.locator(this.fieldError);
    await expect(errorLocator).toBeVisible({ timeout: 5000 });
    return (await errorLocator.textContent()).trim();
  }
}

module.exports = { ApplicationProgressionPage };
