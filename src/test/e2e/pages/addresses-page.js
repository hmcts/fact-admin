// src/test/e2e/pages/addresses-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

class AddressesPage extends BasePage {
  constructor(page) {
    super(page);

    // Main container and Tab
    this.mainContent = 'main#main-content';
    this.addressesTab = '#tab_addresses';
    this.addressesPanel = 'div.fact-tabs-panel#addresses'; // Main container for address content

    // --- Primary Address Locators (Directly within the panel using their IDs) ---
    this.primaryAddressLinesInput = `${this.addressesPanel} #primaryAddressLines`;
    this.primaryAddressLinesCyInput = `${this.addressesPanel} #primaryAddressWelsh`;
    this.primaryAddressTownInput = `${this.addressesPanel} #primaryAddressTown`;
    this.primaryAddressTownCyInput = `${this.addressesPanel} #primaryAddressTownWelsh`;
    this.primaryAddressCountySelect = `${this.addressesPanel} #primaryAddressCounty`;
    this.primaryAddressPostcodeInput = `${this.addressesPanel} #primaryAddressPostcode`;
    this.primaryAddressTypeSelect = `${this.addressesPanel} #primaryAddressType`;
    this.primaryAddressEpimIdInput = `${this.addressesPanel} #primaryAddressEpimId`;

    // --- Secondary Address Locators ---
    // Targets visible fieldsets containing a heading like "Secondary Address X"
    this.secondaryAddressFieldsets = `${this.addressesPanel} fieldset.govuk-fieldset:has(h3:has-text("Secondary Address"))`;
    // Relative locators (used with a specific fieldset locator)
    this.secondaryAddressTypeSelect = 'select[name$="[type_id]"]';
    this.secondaryAddressLinesTextarea = 'textarea[name$="[address_lines]"]';
    this.secondaryAddressTownInput = 'input[name$="[town]"]';
    this.secondaryAddressCountySelect = 'select[name$="[county_id]"]';
    this.secondaryAddressPostcodeInput = 'input[name$="[postcode]"]';
    // Button name prefix used for dynamically locating remove buttons
    this.removeSecondaryAddressButtonNamePrefix = 'removeSecondaryAddress';

    // --- Action Buttons ---
    this.saveButton = `${this.addressesPanel} button[name="saveAddresses"]`;

    // --- Messages ---
    this.successMessageContainer = `${this.addressesPanel} div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successMessageContainer} > h2.govuk-panel__title`;
    this.errorSummary = `${this.addressesPanel} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryItems = `${this.errorSummaryList} li`;

    // --- Field Errors ---
    // Relative selector for finding error messages within a form group
    this.fieldError = 'p.govuk-error-message';
  }

  /**
   * Clicks the Addresses tab and waits for the panel and save button to be visible and enabled.
   */
  async clickAddressesTab() {
    await this.page.locator('#nav').hover();
    await this.page.locator(this.addressesTab).click();
    await this.page.locator(this.mainContent).hover(); // Prevent nav hover issues
    await expect(this.page.locator(this.addressesPanel)).toBeVisible({ timeout: 10000 });

    // Wait for the Save button as the indicator that AJAX content (the form) has loaded
    await expect(this.page.locator(this.saveButton)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.saveButton)).toBeEnabled({ timeout: 5000 });
  }

  /**
   * Removes a secondary address by clicking its specific remove button (e.g., "removeSecondaryAddress1").
   * @param {number} oneBasedIndex - The 1-based index of the secondary address to remove.
   */
  async removeSecondaryAddress(oneBasedIndex) {
    const buttonSelector = `button[name="${this.removeSecondaryAddressButtonNamePrefix}${oneBasedIndex}"]`;
    const buttonLocator = this.page.locator(this.addressesPanel).locator(buttonSelector);

    // Only click if the button exists (it might not if the address was already removed or never existed)
    if (await buttonLocator.isVisible({ timeout: 2000 })) {
      await buttonLocator.click();
      await this.page.waitForTimeout(250); // Brief pause for UI update
    } else {
      // Log if needed for debugging, but don't error out
      // console.log(`Note: Remove button ${buttonSelector} not found within ${this.addressesPanel}.`);
    }
  }

  /**
   * Gets a Playwright Locator for the nth visible secondary address fieldset.
   * @param {number} index - The zero-based index (0 for the first visible secondary address).
   * @returns {import('@playwright/test').Locator} Playwright Locator for the fieldset.
   */
  getNthSecondaryFieldset(index) {
    return this.page.locator(this.secondaryAddressFieldsets).nth(index);
  }

  /**
   * Fills the primary address fields based on the provided data object.
   * Only fills fields present in the data object. Use empty string "" to clear a field.
   * @param {object} data - Object containing address data { addressType?, addressLines?, town?, county?, postcode?, epimsId?, addressLinesCy?, townCy? }.
   */
  async fillPrimaryAddress(data) {
    if (data.addressType !== undefined) await this.page.locator(this.primaryAddressTypeSelect).selectOption({ value: data.addressType });
    if (data.town !== undefined) await this.page.locator(this.primaryAddressTownInput).fill(data.town);
    if (data.county !== undefined) await this.page.locator(this.primaryAddressCountySelect).selectOption({ value: data.county });
    if (data.postcode !== undefined) await this.page.locator(this.primaryAddressPostcodeInput).fill(data.postcode);
    if (data.epimsId !== undefined) await this.page.locator(this.primaryAddressEpimIdInput).fill(data.epimsId);
    if (data.addressLines !== undefined) await this.page.locator(this.primaryAddressLinesInput).fill(data.addressLines);
    if (data.addressLinesCy !== undefined) await this.page.locator(this.primaryAddressLinesCyInput).fill(data.addressLinesCy);
    if (data.townCy !== undefined) await this.page.locator(this.primaryAddressTownCyInput).fill(data.townCy);
  }

  /**
   * Fills the fields for the nth visible secondary address fieldset.
   * @param {number} index - The zero-based index of the secondary address fieldset.
   * @param {object} data - Object containing address data { addressType?, addressLines?, town?, county?, postcode? }.
   */
  async fillNthSecondaryAddress(index, data) {
    const fieldsetLocator = this.getNthSecondaryFieldset(index);
    await expect(fieldsetLocator).toBeVisible(); // Ensure the target fieldset is present

    if (data.addressType !== undefined) await fieldsetLocator.locator(this.secondaryAddressTypeSelect).selectOption({ value: data.addressType });
    if (data.addressLines !== undefined) await fieldsetLocator.locator(this.secondaryAddressLinesTextarea).fill(data.addressLines);
    if (data.town !== undefined) await fieldsetLocator.locator(this.secondaryAddressTownInput).fill(data.town);
    if (data.county !== undefined) await fieldsetLocator.locator(this.secondaryAddressCountySelect).selectOption({ value: data.county });
    if (data.postcode !== undefined) await fieldsetLocator.locator(this.secondaryAddressPostcodeInput).fill(data.postcode);
  }

  /**
   * Clicks the "Save Addresses" button.
   */
  async clickSave() {
    await this.page.locator(this.saveButton).click();
  }

  /**
   * Waits for the Save PUT request to complete successfully (200 OK).
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponse(courtSlug, options = { timeout: 15000 }) {
    const saveUrlPattern = `/courts/${courtSlug}/addresses`;
    return this.page.waitForResponse(
      response =>
        response.url().includes(saveUrlPattern) &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
      options
    );
  }

  /**
   * Waits for the Save PUT request to complete with an error status (non-200).
   * Useful for server-side validation errors.
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponseWithError(courtSlug, options = { timeout: 15000 }) {
    const saveUrlPattern = `/courts/${courtSlug}/addresses`;
    return this.page.waitForResponse(
      response =>
        response.url().includes(saveUrlPattern) &&
        response.request().method() === 'PUT' &&
        response.status() !== 200, // Expecting non-200 status
      options
    );
  }

  /**
   * Waits for the success confirmation panel to appear and returns its title text.
   * @param {object} [options={ timeout: 10000 }] - Options like timeout.
   * @returns {Promise<string>} The success message text.
   */
  async getSuccessMessage(options = { timeout: 10000 }) {
    await expect(this.page.locator(this.successMessageContainer)).toBeVisible(options);
    await expect(this.page.locator(this.successMessageTitle)).toBeVisible(options);
    return await this.page.locator(this.successMessageTitle).textContent();
  }

  /**
   * Waits for the error summary panel to appear.
   * @param {object} [options={ timeout: 10000 }] - Options like timeout.
   */
  async waitForErrorSummary(options = { timeout: 10000 }) {
    await expect(this.page.locator(this.errorSummary)).toBeVisible(options);
    await expect(this.page.locator(this.errorSummaryTitle)).toBeVisible(options);
  }

  /**
   * Gets all error messages from the visible error summary list.
   * @returns {Promise<string[]>} An array of error message strings.
   */
  async getErrorSummaryMessages() {
    await this.waitForErrorSummary();
    const items = this.page.locator(this.errorSummaryItems);
    await items.first().waitFor({ state: 'visible', timeout: 5000 }); // Ensure list items are present
    const texts = await items.allTextContents();
    return texts.map(text => text.trim()).filter(Boolean); // Clean up messages
  }

  /**
   * Checks if the visible error summary list contains the expected error messages.
   * @param {string[]} expectedErrors - An array of expected error message strings.
   * @param {boolean} [exactMatch=false] - If true, checks if lists are identical (order-independent). If false, checks if expected errors are a subset of actual errors and lengths match.
   */
  async checkErrorSummaryContains(expectedErrors, exactMatch = false) {
    await this.waitForErrorSummary();
    const actualErrors = await this.getErrorSummaryMessages();

    if (exactMatch) {
      // Check if the arrays contain exactly the same elements, regardless of order
      expect(actualErrors.sort()).toEqual(expectedErrors.sort());
    } else {
      // Check if actualErrors contains all expectedErrors and has the same number of errors
      expect(actualErrors).toEqual(expect.arrayContaining(expectedErrors));
      expect(actualErrors.length).toEqual(expectedErrors.length);
    }
  }

  /**
   * Gets the field-level error message associated with a specific input/select/textarea.
   * Assumes the error message is a <p class="govuk-error-message"> within the parent govuk-form-group.
   * @param {import('@playwright/test').Locator} inputLocator - The Playwright locator for the input element.
   * @returns {Promise<string>} The trimmed error message text.
   */
  async getFieldError(inputLocator) {
    // Find the containing form group, then the error message within it
    const formGroup = inputLocator.locator('xpath=ancestor::div[contains(@class, "govuk-form-group")]');
    const errorLocator = formGroup.locator(this.fieldError);
    await expect(errorLocator).toBeVisible({ timeout: 5000 }); // Ensure error message exists
    return (await errorLocator.textContent()).trim();
  }
}

module.exports = { AddressesPage };
