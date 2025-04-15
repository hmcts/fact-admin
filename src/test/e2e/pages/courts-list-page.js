// src/test/e2e/pages/courts-list-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

/**
 * Page Object Model for the main Courts List page (/courts).
 * Encapsulates interactions with search, filtering, sorting, and table elements.
 */
class CourtsListPage extends BasePage {
  constructor(page) {
    super(page);

    // --- Locators ---
    this.pageTitle = 'h1:has-text("Courts and tribunals")';
    this.searchInput = '#searchCourts';
    this.includeClosedCheckbox = '#toggle-closed-courts-display';
    this.resultsCountMessage = '#numberOfCourts';
    this.courtTable = '#courtResults';
    this.courtTableBody = `${this.courtTable} tbody`;
    // Selector for rows that are currently visible (not hidden by JS filtering)
    this.visibleCourtRows = `${this.courtTableBody} tr:not([hidden]):not(.courtTableRowHidden)`;
    // Relative selectors for cells within a visible row
    this.courtNameCell = 'td.courtTableColumnName';
    this.courtLastUpdatedCell = 'td.courtTableColumnLastUpdated';
    // Sortable table headers
    this.sortByNameHeader = '#tableCourtsName';
    this.sortByLastUpdatedHeader = '#tableCourtsUpdated';
  }

  /**
   * Waits for the main elements of the Courts List page to be visible.
   */
  async waitForPageLoad() {
    await expect(this.page.locator(this.pageTitle)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.searchInput)).toBeVisible();
    await expect(this.page.locator(this.includeClosedCheckbox)).toBeVisible();
    await expect(this.page.locator(this.courtTable)).toBeVisible();
    await expect(this.page.locator(this.sortByNameHeader)).toBeVisible();
    await expect(this.page.locator(this.sortByLastUpdatedHeader)).toBeVisible();
    // Wait for initial results to likely be present
    await expect(this.page.locator(this.visibleCourtRows).first()).toBeVisible({ timeout: 15000 });
  }

  /**
   * Enters text into the court search input field and waits for network activity to settle,
   * assuming the search triggers client-side filtering via JavaScript.
   * @param {string} searchText - The text to search for.
   */
  async searchFor(searchText) {
    await this.page.locator(this.searchInput).fill(searchText);
    // Wait for client-side filtering triggered by the 'input' event in courts.ts
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
  }

  /**
   * Sets the state of the 'Include closed courts' checkbox and waits for potential updates.
   * @param {boolean} shouldBeChecked - True to check the box, false to uncheck it.
   */
  async setIncludeClosedCourts(shouldBeChecked) {
    const checkbox = this.page.locator(this.includeClosedCheckbox);
    const isCurrentlyChecked = await checkbox.isChecked();

    if (shouldBeChecked !== isCurrentlyChecked) {
      await checkbox.setChecked(shouldBeChecked);
      // Wait for client-side filtering triggered by the 'change' event in courts.ts
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    }
  }

  /**
   * Clicks the 'Name' table header to trigger sorting. Assumes this triggers client-side sorting.
   * Note: The underlying JS toggles state (ASC -> DESC -> ASC). Call appropriately based on desired state.
   */
  async clickSortByName() {
    await this.page.locator(this.sortByNameHeader).click();
    // Wait for client-side sorting triggered by the 'click' event in courts.ts
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
  }

  /**
   * Clicks the 'Last Updated' table header to trigger sorting. Assumes this triggers client-side sorting.
   * Note: The underlying JS toggles state (INACTIVE -> DESC -> ASC). Call appropriately.
   */
  async clickSortByLastUpdated() {
    await this.page.locator(this.sortByLastUpdatedHeader).click();
    // Wait for client-side sorting triggered by the 'click' event in courts.ts
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
  }

  /**
   * Retrieves the text content of the court names from all currently visible rows.
   * @returns {Promise<string[]>} An array of visible court names.
   */
  async getVisibleCourtNames() {
    const nameLocators = this.page.locator(`${this.visibleCourtRows} > ${this.courtNameCell}`);
    await nameLocators.first().waitFor({ state: 'visible', timeout: 5000 });
    return await nameLocators.allTextContents();
  }

  /**
   * Retrieves the text content of the 'Last Updated' dates from all currently visible rows.
   * It attempts to parse these into Date objects. Invalid dates become Date(0).
   * @returns {Promise<Date[]>} An array of Date objects representing the last updated times.
   */
  async getVisibleCourtUpdateDates() {
    const dateLocators = this.page.locator(`${this.visibleCourtRows} > ${this.courtLastUpdatedCell}`);
    await dateLocators.first().waitFor({ state: 'visible', timeout: 5000 });
    const dateTexts = await dateLocators.allTextContents();

    return dateTexts.map(dateText => {
      const date = new Date(dateText.trim());
      // Return Date(0) (epoch start) for invalid dates to ensure consistent sorting comparison
      return isNaN(date.getTime()) ? new Date(0) : date;
    });
  }

  /**
   * Gets the text content of the results count message (e.g., "Showing X results").
   * @returns {Promise<string>} The text of the results count message.
   */
  async getResultsCountMessage() {
    await expect(this.page.locator(this.resultsCountMessage)).toBeVisible();
    return await this.page.locator(this.resultsCountMessage).textContent();
  }

  /**
   * Gets the number of currently visible court rows in the table.
   * @returns {Promise<number>} The count of visible rows.
   */
  async getNumberOfVisibleCourts() {
    return await this.page.locator(this.visibleCourtRows).count();
  }
}

module.exports = { CourtsListPage };
