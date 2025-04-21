// src/test/e2e/pages/spoe-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

/**
 * Page Object Model for the 'Single Point of Entry (SPoE)' tab within the Edit Court page.
 */
class SpoePage extends BasePage {
  constructor(page) {
    super(page);

    // --- Main Locators ---
    this.navContainer = '#nav';
    this.spoeTabLink = '#tab_spoe';
    this.spoePanel = 'div.fact-tabs-panel#spoe';
    this.spoeForm = `${this.spoePanel} #spoeForm`;
    this.spoeContent = `${this.spoeForm} #spoeContent`;
    this.mainContentArea = 'main#main-content';

    // --- Interaction Elements ---
    this.areaOfLawCheckbox = (areaOfLawId) => `${this.spoeForm} input[type="checkbox"][id="${areaOfLawId}"]`;
    this.allSpoeCheckboxes = `${this.spoeForm} input[type="checkbox"][data-inputtype="spoe-area-of-law"]`;
    this.saveButton = `${this.spoeForm} button[name="saveSpoe"]`;

    // --- Messages ---
    this.successMessageContainer = `${this.spoeContent} > div.govuk-panel.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successMessageContainer} > h2.govuk-panel__title`;
    this.errorSummary = `${this.spoePanel} .govuk-error-summary`;
  }

  /**
   * Clicks the 'SPoE' tab, dismisses the hover menu, and waits for the panel and save button to be visible.
   * Performance: Waits specifically for the save button as the primary indicator of AJAX load completion.
   */
  async clickSpoeTab() {
    await this.page.locator(this.navContainer).hover();
    await this.page.locator(this.spoeTabLink).click();
    await this.page.locator(this.mainContentArea).hover();

    await expect(this.page.locator(this.spoePanel)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.spoePanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });

    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeVisible({ timeout: 15000 });
    await expect(saveButtonLocator).toBeEnabled({ timeout: 5000 });
  }

  /**
   * Gets the Playwright Locator for a specific SPoE Area of Law checkbox.
   * @param {string} areaOfLawId - The ID (and value) of the area of law checkbox.
   * @returns {import('@playwright/test').Locator} Playwright Locator for the checkbox.
   */
  getAreaOfLawCheckbox(areaOfLawId) {
    return this.page.locator(this.areaOfLawCheckbox(areaOfLawId));
  }

  /**
   * Selects (checks) a specific SPoE Area of Law checkbox if it's not already checked.
   * @param {string} areaOfLawId - The ID of the area of law checkbox.
   */
  async selectAreaOfLaw(areaOfLawId) {
    const checkboxLocator = this.getAreaOfLawCheckbox(areaOfLawId);
    await expect(checkboxLocator).toBeVisible({ timeout: 5000 });
    if (!(await checkboxLocator.isChecked())) {
      await checkboxLocator.check();
    }
  }

  /**
   * Unselects (unchecks) a specific SPoE Area of Law checkbox if it's currently checked.
   * @param {string} areaOfLawId - The ID of the area of law checkbox.
   */
  async unselectAreaOfLaw(areaOfLawId) {
    const checkboxLocator = this.getAreaOfLawCheckbox(areaOfLawId);
    await expect(checkboxLocator).toBeVisible({ timeout: 5000 });
    if (await checkboxLocator.isChecked()) {
      await checkboxLocator.uncheck();
    }
  }

  /**
   * Clicks the 'Update' or 'Save' button for SPoE entries.
   */
  async clickSave() {
    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeEnabled();
    await saveButtonLocator.click();
  }

  /**
   * Waits for the SPoE update PUT request to complete successfully (200 OK).
   * Performance: Explicitly waits for the network response for reliability.
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponse(courtSlug, options = { timeout: 15000 }) {
    const updateUrlPattern = `/courts/${courtSlug}/spoe`;
    return this.page.waitForResponse(
      response =>
        response.url().includes(updateUrlPattern) &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
      options
    );
  }

  /**
   * Gets the success message text after an update.
   * Waits for the success panel to be visible.
   * @param {object} [options={ timeout: 10000 }] - Options like timeout.
   * @returns {Promise<string>} The trimmed success message text.
   */
  async getSuccessMessage(options = { timeout: 10000 }) {
    const messageLocator = this.page.locator(this.successMessageTitle);
    await expect(this.page.locator(this.successMessageContainer)).toBeVisible(options);
    await expect(messageLocator).toBeVisible(options);
    const text = await messageLocator.textContent();
    return text.trim();
  }

  /**
   * Checks if a specific SPoE Area of Law checkbox is currently selected (checked).
   * @param {string} areaOfLawId - The ID of the area of law checkbox.
   * @returns {Promise<boolean>} True if checked, false otherwise.
   */
  async isAreaOfLawSelected(areaOfLawId) {
    const checkboxLocator = this.getAreaOfLawCheckbox(areaOfLawId);
    await expect(checkboxLocator).toBeVisible({ timeout: 5000 });
    return await checkboxLocator.isChecked();
  }
}

module.exports = { SpoePage };
