// src/test/e2e/pages/local-authorities-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

/**
 * Page Object Model for the 'Local Authorities' tab within the Edit Court page.
 */
class LocalAuthoritiesPage extends BasePage {
  constructor(page) {
    super(page);

    // --- Main Locators ---
    this.navContainer = '#nav';
    this.localAuthoritiesTabLink = '#tab_local-authorities';
    this.localAuthoritiesPanel = 'div.fact-tabs-panel#local-authorities';
    this.localAuthoritiesForm = `${this.localAuthoritiesPanel} #localAuthoritiesForm`;
    this.localAuthoritiesContent = `${this.localAuthoritiesPanel} #localAuthoritiesContent`;
    this.mainContentArea = 'main#main-content';

    // --- Interaction Elements ---
    this.areaOfLawSelect = `${this.localAuthoritiesPanel} #courtAreasOfLaw`;
    // Locator for the *first checkbox item* that should appear after AoL selection
    this.firstCheckboxItem = `${this.localAuthoritiesForm} .govuk-checkboxes__item`;
    // Selector for a specific checkbox based on its associated label text.
    this.localAuthorityCheckboxByLabel = (labelText) =>
      `${this.localAuthoritiesForm} .govuk-checkboxes__item:has-text("${labelText}") input[type="checkbox"]`;
    this.saveButton = `${this.localAuthoritiesForm} button[name="saveLocalAuthorities"]`;

    // --- Messages & Errors ---
    this.successPanel = `${this.localAuthoritiesContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successPanel} > h2.govuk-panel__title`;
    this.errorSummary = `${this.localAuthoritiesContent} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryListItems = `${this.errorSummary} ul.govuk-list li`;
  }

  /**
   * Clicks the 'Local Authorities' tab, dismisses the hover menu, and waits for the panel content to load.
   */
  async clickLocalAuthoritiesTab() {
    await this.page.locator(this.navContainer).hover();
    await this.page.locator(this.localAuthoritiesTabLink).click();
    await this.page.locator(this.mainContentArea).hover(); // Move mouse away

    await expect(this.page.locator(this.localAuthoritiesPanel)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.localAuthoritiesPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });

    const areaOfLawLocator = this.page.locator(this.areaOfLawSelect);
    const errorSummaryLocator = this.page.locator(this.errorSummary);
    await expect(areaOfLawLocator.or(errorSummaryLocator)).toBeVisible({ timeout: 15000 });
    // Removed excessive logging
  }

  /**
   * Selects an Area of Law from the dropdown menu by its visible text.
   * Waits for the *first checkbox item* to become visible after selection.
   * @param {string} areaOfLawName - The visible text of the Area of Law to select (e.g., 'Adoption').
   */
  async selectAreaOfLaw(areaOfLawName) {
    const selectLocator = this.page.locator(this.areaOfLawSelect);
    await expect(selectLocator).toBeVisible();

    await selectLocator.selectOption({ label: areaOfLawName });

    // Wait explicitly for the *first checkbox item* to appear.
    // This confirms the AJAX call completed and rendering started.
    const firstCheckboxItemLocator = this.page.locator(this.firstCheckboxItem).first();
    try {
      // Increased timeout slightly for robustness after AJAX call
      await expect(firstCheckboxItemLocator, `First checkbox item (${this.firstCheckboxItem})`).toBeVisible({ timeout: 15000 });
    } catch (e) {
      console.error(`Error waiting for the first checkbox item after selecting AoL "${areaOfLawName}".`);
      const panelHtml = await this.page.locator(this.localAuthoritiesPanel).innerHTML({ timeout: 1000 }).catch(() => 'Could not get panel HTML');
      console.error("Panel HTML at time of failure:\n", panelHtml);
      throw e; // Re-throw the error to fail the test
    }
  }

  /**
   * Selects (checks) a specific Local Authority checkbox by its label text.
   * Relies on Playwright's default auto-wait.
   * @param {string} localAuthorityName - The exact visible text of the Local Authority label.
   */
  async selectLocalAuthorityByName(localAuthorityName) {
    const checkboxLocator = this.page.locator(this.localAuthorityCheckboxByLabel(localAuthorityName));
    await checkboxLocator.check();
  }

  /**
   * Unselects (unchecks) a specific Local Authority checkbox by its label text.
   * Relies on Playwright's default auto-wait.
   * @param {string} localAuthorityName - The exact visible text of the Local Authority label.
   */
  async unselectLocalAuthorityByName(localAuthorityName) {
    const checkboxLocator = this.page.locator(this.localAuthorityCheckboxByLabel(localAuthorityName));
    // Playwright's uncheck() action includes auto-waiting.
    await checkboxLocator.uncheck();
  }

  /**
   * Clicks the 'Save' button for Local Authorities.
   * Relies on Playwright's default auto-wait for the button.
   */
  async clickSave() {
    const saveButtonLocator = this.page.locator(this.saveButton);
    // Playwright's click() action includes auto-waiting for visibility/enabled state.
    await saveButtonLocator.click();
  }

  /**
   * Waits for the Local Authorities update PUT request to complete successfully (200 OK).
   */
  async waitForSaveResponse(courtSlug, areaOfLaw, options = { timeout: 15000 }) {
    const updateUrlPattern = new RegExp(`/courts/${courtSlug}/${areaOfLaw.toLowerCase()}/local-authorities$`);
    return this.page.waitForResponse(
      response =>
        updateUrlPattern.test(response.url()) &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
      options
    );
  }

  /**
   * Gets the success message text after an update.
   */
  async getSuccessMessage(options = { timeout: 10000 }) {
    await expect(this.page.locator(this.successPanel)).toBeVisible(options);
    await expect(this.page.locator(this.successMessageTitle)).toBeVisible(options);
    const text = await this.page.locator(this.successMessageTitle).textContent();
    return text.trim();
  }

  /**
   * Waits for the error summary panel to be visible.
   */
  async waitForErrorSummary(options = { timeout: 5000 }) {
    await expect(this.page.locator(this.errorSummary)).toBeVisible(options);
    await expect(this.page.locator(this.errorSummaryTitle)).toBeVisible(options);
  }

  /**
   * Gets the text content of the error summary list items.
   */
  async getErrorSummaryMessages() {
    await this.waitForErrorSummary();
    const items = this.page.locator(this.errorSummaryListItems);
    await items.first().waitFor({ state: 'visible', timeout: 3000 });
    const texts = await items.allTextContents();
    return texts.map(text => text.trim()).filter(Boolean);
  }

  /**
   * Checks if the Local Authorities tab is currently disabled by checking its class attribute.
   */
  async isTabDisabled() {
    const tabLinkLocator = this.page.locator(this.localAuthoritiesTabLink);
    await expect(tabLinkLocator).toBeVisible({ timeout: 5000 });
    const classAttribute = await tabLinkLocator.getAttribute('class');
    return classAttribute !== null && classAttribute.includes('disable-tab');
  }
}

module.exports = { LocalAuthoritiesPage };
