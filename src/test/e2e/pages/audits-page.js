const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

/**
 * Page Object Model for the Admin Audit Search Page.
 */
class AuditsPage extends BasePage {
  constructor(page) {
    super(page);

    // Page Locators
    this.pageTitle = 'h1:has-text("Audits")';
    this.form = '#auditsSearchForm';
    this.locationSelect = '#searchLocation';
    this.dateFromInput = '#searchDateFrom'; // Expects YYYY-MM-DDTHH:mm
    this.dateToInput = '#searchDateTo';   // Expects YYYY-MM-DDTHH:mm
    this.searchButton = '#searchAuditsBtn';
    this.resultsContainer = '#auditsPageContent'; // Container updated by AJAX
    this.resultsTable = '#auditResults';
    this.resultsTableBody = `${this.resultsTable} tbody`;
    this.resultsTableBodyRows = `${this.resultsTableBody} tr`;
    this.noResultsMessage = `${this.resultsContainer} p:has-text("No results found")`;

    // Column Locators (adjust if table structure changes)
    this.actionColumn = 'td:nth-child(2)';
    this.locationColumn = 'td:nth-child(3)';
    this.timestampColumn = 'td:nth-child(5)';
  }

  /**
   * Waits for the main elements of the Audits page to be visible.
   */
  async waitForPageLoad() {
    await expect(this.page.locator(this.pageTitle)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.form)).toBeVisible();
    await expect(this.page.locator(this.searchButton)).toBeVisible();
  }

  /**
   * Selects a location from the dropdown.
   * @param {string} locationValueOrLabel - The value or visible text of the option to select.
   */
  async selectLocation(locationValueOrLabel) {
    await this.page.locator(this.locationSelect).selectOption(locationValueOrLabel);
  }

  /**
   * Formats a Date object into the YYYY-MM-DDTHH:mm format required by the input field.
   * @param {Date} date The date object to format.
   * @returns {string} The formatted date string.
   */
  formatDateForInput(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  /**
   * Enters the start and end dates into the search form.
   * @param {Date} startDate - The start date for the search range.
   * @param {Date} endDate - The end date for the search range.
   */
  async enterDateRange(startDate, endDate) {
    const formattedStart = this.formatDateForInput(startDate);
    const formattedEnd = this.formatDateForInput(endDate);
    await this.page.locator(this.dateFromInput).fill(formattedStart);
    await this.page.locator(this.dateToInput).fill(formattedEnd);
  }

  /**
   * Clicks the search button and waits for the results container to update.
   */
  async clickSearch() {
    const initialContent = await this.page.locator(this.resultsContainer).innerHTML();
    await this.page.locator(this.searchButton).click();
    // Wait for AJAX update by checking content change or results presence
    await expect(this.page.locator(this.resultsContainer)).not.toHaveText(initialContent, { timeout: 15000 });
    await this.page.waitForSelector(`${this.resultsTableBodyRows}, ${this.noResultsMessage}`, { timeout: 15000 });
  }

  /**
   * Gets the Playwright Locator for the results table rows. Handles no results case.
   * @returns {Promise<import('@playwright/test').Locator | []>} Locator for the rows or empty array.
   */
  async getResultsRows() {
    if (await this.page.locator(this.noResultsMessage).isVisible({ timeout: 1000 })) {
      return [];
    }
    await expect(this.page.locator(this.resultsTableBody)).toBeVisible({ timeout: 5000 });
    return this.page.locator(this.resultsTableBodyRows);
  }

  /**
   * Finds if an audit row matching specific action and location exists in the search results.
   * IMPORTANT: This version *ignores* the timestamp due to reliability issues with clock synchronization.
   * @param {string} expectedAction - The action text to filter by (e.g., 'Update court opening times').
   * @param {string} courtSlug - The court slug used in URLs etc.
   * @param {string} courtName - The full court name for display checking.
   * @returns {Promise<boolean>} - True if a matching audit entry is found, false otherwise.
   */
  async verifyAuditEntryExists(expectedAction, courtSlug, courtName) {
    const rows = await this.getResultsRows();
    const count = await rows.count();

    if (count === 0) {
      console.warn(`AUDIT_VERIFY: No audit results found in table for current search.`);
      return false;
    }

    for (let i = 0; i < count; i++) {
      const row = rows.nth(i);
      const actionText = (await row.locator(this.actionColumn).textContent()).trim();
      const locationText = (await row.locator(this.locationColumn).textContent()).trim();

      const actionMatches = actionText === expectedAction;
      const locationMatches = locationText === courtSlug || locationText.toLowerCase() === courtName.toLowerCase();

      if (actionMatches && locationMatches) {
        console.log(`AUDIT_VERIFY: Row ${i}: SUCCESS! Found matching Action ('${actionText}') and Location ('${locationText}').`);
        return true; // Found a match based on Action and Location only
      }
    }

    console.warn(`AUDIT_VERIFY: No audit entry found matching Action='${expectedAction}', Location='${courtSlug}' or '${courtName}'.`);
    return false; // No matching entry found
  }
}

module.exports = { AuditsPage };
