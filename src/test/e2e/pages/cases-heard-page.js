// src/test/e2e/pages/cases-heard-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

/**
 * Page Object Model for the 'Cases Heard' tab within the Edit Court page.
 */
class CasesHeardPage extends BasePage {
  constructor(page) {
    super(page); // Call BasePage constructor

    // --- Main Locators ---
    this.navContainer = '#nav'; // Container for the tabs navigation
    this.casesHeardTabLink = '#tab_cases-heard'; // The clickable tab link
    this.casesHeardPanel = 'div.fact-tabs-panel#cases-heard'; // The main content panel for this tab
    this.casesHeardForm = `${this.casesHeardPanel} #casesHeardForm`; // The form containing the checkboxes and button
    this.casesHeardContent = `${this.casesHeardForm} #casesHeardContent`; // Specific content area within the form
    this.mainContentArea = 'main#main-content'; // Locator for main content area to hover over

    // --- Interaction Elements ---
    // Function to get a specific Area of Law checkbox locator by its ID (value attribute)
    this.areaOfLawCheckbox = (areaOfLawId) => `${this.casesHeardForm} input[type="checkbox"][id="${areaOfLawId}"]`;
    // All visible checkboxes representing Areas of Law within the form
    this.allAreaOfLawCheckboxes = `${this.casesHeardForm} input[type="checkbox"][data-inputType="cases-heard"]`;
    // Use getByRole for the update button for better robustness
    this.updateButtonLocator = this.page.locator(this.casesHeardPanel).getByRole('button', { name: 'Update', exact: true });

    // --- Messages ---
    this.successMessageContainer = `${this.casesHeardContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successMessageContainer} > h2.govuk-panel__title`;
    this.errorSummary = `${this.casesHeardPanel} .govuk-error-summary`; // Standard error summary
  }

  /**
   * Clicks the 'Cases Heard' tab, dismisses the hover menu, and waits for the panel and update button to be visible.
   */
  async clickCasesHeardTab() {
    await this.page.locator(this.navContainer).hover();
    await this.page.locator(this.casesHeardTabLink).click();
    // Move mouse away from nav to close hover menu
    await this.page.locator(this.mainContentArea).hover();

    // Wait for the panel to be visible and not hidden
    await expect(this.page.locator(this.casesHeardPanel)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.casesHeardPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });

    // Wait specifically for the update button as a sign the form content has loaded via AJAX
    await expect(this.updateButtonLocator).toBeVisible({ timeout: 15000 });
    await expect(this.updateButtonLocator).toBeEnabled({ timeout: 5000 });
  }

  /**
   * Gets the Playwright Locator for a specific Area of Law checkbox.
   * @param {string} areaOfLawId - The ID (and value) of the area of law checkbox (e.g., 'bankruptcy').
   * @returns {import('@playwright/test').Locator} Playwright Locator for the checkbox.
   */
  getAreaOfLawCheckbox(areaOfLawId) {
    return this.page.locator(this.areaOfLawCheckbox(areaOfLawId));
  }

  /**
   * Selects (checks) a specific Area of Law checkbox if it's not already checked.
   * @param {string} areaOfLawId - The ID of the area of law checkbox.
   */
  async selectAreaOfLaw(areaOfLawId) {
    const checkboxLocator = this.getAreaOfLawCheckbox(areaOfLawId);
    await expect(checkboxLocator).toBeVisible(); // Ensure it exists before interacting
    if (!(await checkboxLocator.isChecked())) {
      await checkboxLocator.check();
    }
  }

  /**
   * Unselects (unchecks) a specific Area of Law checkbox if it's currently checked.
   * @param {string} areaOfLawId - The ID of the area of law checkbox.
   */
  async unselectAreaOfLaw(areaOfLawId) {
    const checkboxLocator = this.getAreaOfLawCheckbox(areaOfLawId);
    await expect(checkboxLocator).toBeVisible(); // Ensure it exists
    if (await checkboxLocator.isChecked()) {
      await checkboxLocator.uncheck();
    }
  }

  /**
   * Clicks the 'Update Cases Heard' button.
   */
  async clickUpdate() {
    await this.updateButtonLocator.click();
  }

  /**
   * Waits for the 'Cases Heard' update PUT request to complete successfully (200 OK).
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForUpdateResponse(courtSlug, options = { timeout: 15000 }) {
    const updateUrlPattern = `/courts/${courtSlug}/cases-heard`;
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
    await expect(this.page.locator(this.successMessageContainer)).toBeVisible(options);
    await expect(this.page.locator(this.successMessageTitle)).toBeVisible(options);
    const text = await this.page.locator(this.successMessageTitle).textContent();
    return text.trim();
  }

  /**
   * Checks if a specific Area of Law checkbox is currently selected (checked).
   * @param {string} areaOfLawId - The ID of the area of law checkbox.
   * @returns {Promise<boolean>} True if checked, false otherwise.
   */
  async isAreaOfLawSelected(areaOfLawId) {
    const checkboxLocator = this.getAreaOfLawCheckbox(areaOfLawId);
    await expect(checkboxLocator).toBeVisible(); // Ensure it exists before checking state
    return await checkboxLocator.isChecked();
  }

  /**
   * Unselects all currently selected 'Cases Heard' checkboxes and saves the changes.
   * Intended for use in `beforeEach` hooks for test cleanup. Ensures idempotency.
   * @param {string} courtSlug - The slug of the court being edited.
   */
  async unselectAllAreasAndSave(courtSlug) {
    await expect(this.updateButtonLocator).toBeVisible(); // Ensure form is ready

    const checkboxes = this.page.locator(this.allAreaOfLawCheckboxes);
    const count = await checkboxes.count();
    let changed = false;

    for (let i = 0; i < count; i++) {
      const checkbox = checkboxes.nth(i);
      if (await checkbox.isChecked()) {
        await checkbox.uncheck();
        changed = true;
      }
    }

    // Only save if changes were actually made to avoid unnecessary requests
    if (changed) {
      await Promise.all([
        this.waitForUpdateResponse(courtSlug),
        this.clickUpdate()
      ]);
      await expect(this.getSuccessMessage()).resolves.toContain('Cases heard updated');
    } else {
      console.log('Cleanup: No areas of law were selected, no save needed.');
    }
  }
}

module.exports = { CasesHeardPage };
