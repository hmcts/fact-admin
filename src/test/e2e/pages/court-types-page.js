// src/test/e2e/pages/court-types-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

/**
 * Page Object Model for the 'Court Types' tab within the Edit Court page.
 */
class CourtTypesPage extends BasePage {
  constructor(page) {
    super(page);

    // --- Main Locators ---
    this.navContainer = '#nav'; // Navigation container for hovering
    this.typesTabLink = '#tab_court-types'; // The clickable 'Types' tab
    this.typesPanel = 'div.fact-tabs-panel#court-types'; // The main content panel for this tab
    this.typesForm = `${this.typesPanel} #courtTypesForm`; // The form within the panel
    this.typesContent = `${this.typesForm} #courtTypesContent`; // Specific content area

    // --- Court Type Checkboxes and Code Inputs ---
    // Function to get a specific court type checkbox by its value attribute (which is JSON string)
    this.courtTypeCheckboxByValue = (valueJson) => `${this.typesForm} input[name="types"][value='${valueJson}']`;
    // Example: Checkbox for Tribunal (ID 3 in Gherkin - needs mapping or inspection)
    // Assuming 'Tribunal' has ID 3 based on Gherkin '#court_types-3'
    this.tribunalCheckboxSelector = '#court_types-3'; // Keeping original Gherkin selector for direct mapping
    // Assuming 'Family Court' has ID 2 based on Gherkin '#court_types-2'
    this.familyCourtCheckboxSelector = '#court_types-2';
    // Generic checkbox for types requiring code (e.g., Magistrate, County) - Use a more specific one if possible
    this.courtTypeRequiringCodeCheckbox = '#court_types'; // Gherkin '#court_types' - likely first code-requiring type

    // Specific code inputs (based on Gherkin and controller logic)
    this.magistratesCourtCodeInput = '#magistratesCourtCode';
    this.familyCourtCodeInput = '#familyCourtCode';
    this.locationCourtCodeInput = '#locationCourtCode'; // Used for Tribunal in Gherkin
    this.countyCourtCodeInput = '#countyCourtCode';
    this.crownCourtCodeInput = '#crownCourtCode';

    // Code input error messages (based on Gherkin `check code errors` step)
    this.magistratesCourtCodeError = '#magistratesCourtCode-error';
    this.familyCourtCodeError = '#familyCourtCode-error';
    this.locationCourtCodeError = '#locationCourtCode-error';
    this.countyCourtCodeError = '#countyCourtCode-error';
    this.crownCourtCodeError = '#crownCourtCode-error';

    // --- GBS Code ---
    this.gbsCodeInput = '#gbsCode'; // Based on Gherkin and controller 'gbsCode' name attribute

    // --- DX Codes ---
    this.addDxCodeButton = `${this.typesForm} button[name="addDxCode"]`;
    this.visibleDxFieldsets = `${this.typesContent} fieldset:not([hidden]):not(#newDxCodeTemplate)`; // Visible fieldsets for DX codes
    // Relative selectors within a DX code fieldset
    this.dxCodeInput = 'input[name$="[code]"]'; // Ends with '[code]'
    this.dxExplanationInput = 'input[name$="[explanation]"]'; // Ends with '[explanation]'
    this.dxExplanationCyInput = 'input[name$="[explanationCy]"]'; // Ends with '[explanationCy]'
    this.removeDxCodeButton = 'button[name$="[deleteDxCode]"]:visible'; // Visible remove button
    this.clearDxCodeButton = 'button[name$="[clearDxCode]"]:visible'; // Visible clear button

    // --- Action Buttons ---
    this.saveButton = `${this.typesForm} button[name="saveCourtTypes"]`;

    // --- Messages ---
    this.successMessageContainer = `${this.typesContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successMessageContainer} > h2.govuk-panel__title`;
    this.errorSummary = `${this.typesContent} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryItems = `${this.errorSummaryList} li`;
    this.fieldError = 'p.govuk-error-message'; // Generic field error selector
  }

  /**
   * Clicks the 'Types' tab and waits for the panel and save button to be visible and enabled.
   * Performance: Waits specifically for the save button as the primary indicator of AJAX load completion.
   */
  async clickTypesTab() {
    await this.page.locator(this.navContainer).hover();
    await this.page.locator(this.typesTabLink).click();
    await this.page.locator('main#main-content').hover(); // Move mouse away to prevent nav issues

    await expect(this.page.locator(this.typesPanel)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.typesPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });

    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeVisible({ timeout: 15000 });
    await expect(saveButtonLocator).toBeEnabled({ timeout: 5000 });
  }

  /**
   * Gets the Playwright Locator for a specific court type checkbox using its Gherkin-derived selector.
   * @param {string} checkboxSelector - The CSS selector for the checkbox (e.g., '#court_types-3').
   * @returns {import('@playwright/test').Locator} Playwright Locator for the checkbox.
   */
  getCourtTypeCheckbox(checkboxSelector) {
    return this.page.locator(checkboxSelector);
  }

  /**
   * Checks a specific court type checkbox.
   * @param {import('@playwright/test').Locator} checkboxLocator - The Playwright locator for the checkbox.
   */
  async checkCourtType(checkboxLocator) {
    await expect(checkboxLocator).toBeVisible();
    if (!(await checkboxLocator.isChecked())) {
      await checkboxLocator.check();
    }
  }

  /**
   * Unchecks a specific court type checkbox.
   * @param {import('@playwright/test').Locator} checkboxLocator - The Playwright locator for the checkbox.
   */
  async uncheckCourtType(checkboxLocator) {
    await expect(checkboxLocator).toBeVisible();
    if (await checkboxLocator.isChecked()) {
      await checkboxLocator.uncheck();
    }
  }

  /**
   * Checks if a specific court type checkbox is currently checked.
   * @param {import('@playwright/test').Locator} checkboxLocator - The Playwright locator for the checkbox.
   * @returns {Promise<boolean>} True if checked, false otherwise.
   */
  async isCourtTypeChecked(checkboxLocator) {
    await expect(checkboxLocator).toBeVisible();
    return await checkboxLocator.isChecked();
  }

  /**
   * Fills a specific court code input field.
   * @param {string} inputSelector - The CSS selector for the input field (e.g., '#locationCourtCode').
   * @param {string} code - The code to enter.
   */
  async fillCourtCode(inputSelector, code) {
    const inputLocator = this.page.locator(inputSelector);
    await expect(inputLocator).toBeVisible();
    await inputLocator.fill(code);
  }

  /**
   * Clears and fills the GBS code input field.
   * @param {string} code - The GBS code to enter.
   */
  async clearAndFillGbsCode(code) {
    const inputLocator = this.page.locator(this.gbsCodeInput);
    await expect(inputLocator).toBeVisible();
    await inputLocator.clear();
    await inputLocator.fill(code);
  }

  /**
   * Removes all existing DX code entries by clicking their respective 'Remove' buttons, then clicks Save.
   * Waits for the update confirmation message.
   * @param {string} courtSlug - The slug of the court being edited (needed for waitForSaveResponse).
   */
  async removeAllDxCodesAndSave(courtSlug) {
    await expect(this.page.locator(this.addDxCodeButton)).toBeVisible();

    const fieldsetsLocator = this.page.locator(this.visibleDxFieldsets);
    const initialCount = await fieldsetsLocator.count();
    let changed = false;

    if (initialCount > 1) { // Only remove if there's more than the template
      for (let i = initialCount - 2; i >= 0; i--) { // Iterate backwards from the last *real* entry
        const fieldset = fieldsetsLocator.nth(i);
        const removeButton = fieldset.locator(this.removeDxCodeButton);
        if (await removeButton.isVisible()) {
          await removeButton.click();
          changed = true;
        }
      }
    }

    if (changed) {
      await expect(fieldsetsLocator).toHaveCount(1, { timeout: 5000 }); // Should be only the template row left
      await this.clickSave();
      await this.waitForSaveResponse(courtSlug);
      await this.waitForSuccessMessage('Court Types updated');
    } else {
      // If only the template existed initially, still might need a save if other fields changed.
      // Consider if a save is always needed after potential removal. For now, only save if removed.
      console.log('No DX Codes to remove, or only template existed.');
    }
    // Final check: Ensure only one fieldset (the template) remains after potential save
    await expect(fieldsetsLocator).toHaveCount(1);
  }

  /**
   * Clicks the 'Add new Dx Code' button and waits for a new fieldset to appear.
   */
  async clickAddDxCode() {
    const fieldsetsLocator = this.page.locator(this.visibleDxFieldsets);
    const initialCount = await fieldsetsLocator.count();
    await this.page.locator(this.addDxCodeButton).click();
    await expect(fieldsetsLocator).toHaveCount(initialCount + 1, { timeout: 5000 });
  }

  /**
   * Fills the details for a DX code entry within a specific fieldset.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the specific fieldset.
   * @param {string} code - The DX code.
   * @param {string} explanation - The English explanation.
   * @param {string} explanationCy - The Welsh explanation.
   */
  async fillDxCodeDetails(fieldsetLocator, code, explanation, explanationCy) {
    await expect(fieldsetLocator).toBeVisible();
    await fieldsetLocator.locator(this.dxCodeInput).fill(code);
    await fieldsetLocator.locator(this.dxExplanationInput).fill(explanation);
    await fieldsetLocator.locator(this.dxExplanationCyInput).fill(explanationCy);
  }

  /**
   * Adds a new DX code entry by clicking 'Add', locating the last fieldset, and filling its details.
   * @param {string} code - The DX code.
   * @param {string} explanation - The English explanation.
   * @param {string} explanationCy - The Welsh explanation.
   */
  async addDxCode(code, explanation, explanationCy) {
    await this.clickAddDxCode();
    const newFieldset = this.page.locator(this.visibleDxFieldsets).last();
    await this.fillDxCodeDetails(newFieldset, code, explanation, explanationCy);
  }

  /**
   * Gets the details (code, explanation, explanationCy) from a specific DX code fieldset.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the specific fieldset.
   * @returns {Promise<object>} Object containing { code, explanation, explanationCy }.
   */
  async getDxCodeDetails(fieldsetLocator) {
    await expect(fieldsetLocator).toBeVisible();
    const code = await fieldsetLocator.locator(this.dxCodeInput).inputValue();
    const explanation = await fieldsetLocator.locator(this.dxExplanationInput).inputValue();
    const explanationCy = await fieldsetLocator.locator(this.dxExplanationCyInput).inputValue();
    return { code, explanation, explanationCy };
  }

  /**
   * Clicks the 'Save Court Types' button.
   */
  async clickSave() {
    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeEnabled();
    await saveButtonLocator.click();
  }

  /**
   * Waits for the Court Types update PUT request to complete successfully (200 OK).
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponse(courtSlug, options = { timeout: 15000 }) {
    const updateUrlPattern = `/courts/${courtSlug}/court-types`;
    return this.page.waitForResponse(
      response =>
        response.url().includes(updateUrlPattern) &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
      options
    );
  }

  /**
   * Waits for the Court Types update PUT request to complete *with an error* (non-200).
   * Useful for validation scenarios that trigger server-side errors or immediate UI errors on submit.
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponseWithError(courtSlug, options = { timeout: 15000 }) {
    const updateUrlPattern = `/courts/${courtSlug}/court-types`;
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
  async waitForSuccessMessage(expectedMessage, options = { timeout: 10000 }) {
    const messageLocator = this.page.locator(this.successMessageTitle);
    await expect(this.page.locator(this.successMessageContainer)).toBeVisible(options);
    await expect(messageLocator).toContainText(expectedMessage, { timeout: options.timeout });
    await expect(messageLocator).toBeVisible(options); // Check message title itself
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
   * Gets the field-level error message associated with a specific input element.
   * Assumes the error message is a sibling <p> or within the parent form group.
   * @param {import('@playwright/test').Locator} inputLocator - The Playwright locator for the input element.
   * @returns {Promise<string>} The trimmed error message text.
   */
  async getFieldError(inputLocator) {
    // Find the containing form group (adjust if structure differs)
    const formGroup = inputLocator.locator('xpath=ancestor::div[contains(@class, "govuk-form-group--error")]');
    const errorLocator = formGroup.locator(this.fieldError);
    await expect(errorLocator).toBeVisible({ timeout: 5000 }); // Ensure error message exists
    return (await errorLocator.textContent()).trim();
  }
}

module.exports = { CourtTypesPage };
