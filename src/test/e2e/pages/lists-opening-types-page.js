// src/test/e2e/pages/lists-opening-types-page.js
const { expect } = require('@playwright/test');

/**
 * Page Object Model for the Opening Types list page within the Admin Lists section.
 * Handles interactions with the opening types list, add/edit forms, and delete confirmations.
 */
class OpeningTypesPage {
  constructor(page) {
    this.page = page;

    // --- Main Page & Tab Locators ---
    this.listsNavLink = '#lists';
    this.pageTitleLists = 'h1:has-text("Edit A List")';
    this.tabsContainer = 'div[data-module="fact-tabs"]';
    this.visibleTabTitle = `${this.tabsContainer} .fact-tabs-title`;
    this.openingTypesTabLink = 'a.fact-tabs-tab[href="#opening-types"]';
    this.openingTypesPanel = 'div.fact-tabs-panel#opening-types';
    this.openingTypesContent = `${this.openingTypesPanel} #openingTypesListContent`; // Main container for list/form content
    this.openingTypesListTitle = `${this.openingTypesContent} > h2:has-text("Opening Types")`;
    this.openingTypesTable = `${this.openingTypesContent} table`;
    this.openingTypesTableBody = `${this.openingTypesTable} tbody`;
    this.openingTypesTableRows = `${this.openingTypesTableBody} tr`;

    // --- Action Buttons/Links ---
    this.addNewButton = `${this.openingTypesContent} a:has-text("Add Opening Type")`;
    this.saveButton = '#saveOpeningTypeBtn';
    this.confirmDeleteButton = '#confirmDelete';
    this.cancelDeleteButton = '#cancelDeleteOpeningTypeBtn'; // Assumed ID
    this.cancelEditButton = '#cancelOpeningTypeChangesBtn'; // Assumed ID

    // --- Form Locators ---
    this.addFormTitle = `${this.openingTypesContent} h2:has-text("Add New Opening Type")`;
    this.editFormTitleRegex = /Editing Opening Type: .*/;
    this.deleteFormTitleRegex = /Delete Opening Type: .*/;
    this.nameInput = '#ct-type';
    this.nameWelshInput = '#ct-type-cy';

    // --- Messages and Errors ---
    this.successPanel = `${this.openingTypesContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successPanel} > h2.govuk-panel__title`;
    this.errorSummary = `${this.openingTypesContent} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryListItem = `${this.errorSummaryList} li`;
    this.nameError = '#ct-type-error'; // Assumed based on pattern

    // --- Row Locators ---
    // Use :text-is() for exact match to avoid partial matches potentially causing strict mode violations
    this.openingTypeRow = (name) => `${this.openingTypesTableBody} tr:has(td:nth-child(1):text-is("${name}"))`;
    this.editButtonForRow = (name) => `${this.openingTypeRow(name)} > td:nth-child(2) > a`;
    this.deleteButtonForRow = (name) => `${this.openingTypeRow(name)} > td:nth-child(3) > a`;

    // --- Error Message Constants (from controller/Gherkin) ---
    this.duplicateError = 'A opening type with the same name already exists.';
    this.deleteInUseError = 'You cannot delete this opening type at the moment, as one or more courts are dependent on it. Please remove the opening from the relevant courts first.';
    this.nameRequiredError = 'The name is required.'; // From controller validation
  }

  // --- Navigation Methods ---

  /**
   * Clicks the main "Lists" navigation link.
   */
  async clickListsNavLink() {
    await this.page.locator(this.listsNavLink).click();
    await expect(this.page.locator(this.pageTitleLists)).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks the "Opening Types" tab within the Lists page.
   * Waits for the AJAX request fetching the list data to complete.
   */
  async clickOpeningTypesTab() {
    await expect(this.page.locator(this.visibleTabTitle)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.visibleTabTitle).hover();
    const openingTypesLink = this.page.locator(this.openingTypesTabLink);
    await expect(openingTypesLink).toBeVisible({ timeout: 5000 });

    // Wait for the GET request *after* clicking the link
    const listLoadResponsePromise = this.page.waitForResponse(
      response => response.url().includes('/lists/opening-types') && response.request().method() === 'GET' && response.status() === 200,
      { timeout: 15000 }
    );
    await openingTypesLink.click();
    await this.page.locator('h1').hover(); // Stop hovering over tabs

    try {
      await listLoadResponsePromise;
    } catch (e) {
      console.warn(`Timeout or error waiting for GET /lists/opening-types response: ${e.message}. Content might be stale.`);
      await this.page.waitForTimeout(1000);
    }

    // Wait for panel content to be visually updated
    await expect(this.page.locator(this.openingTypesPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });
    await expect(this.page.locator(this.openingTypesContent)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.openingTypesListTitle)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Waits for the main Opening Types list view to be fully loaded.
   * Checks for the list title, the Add New button, and the table body.
   * Includes a network idle wait for increased stability.
   */
  async waitForPageLoad() {
    await expect(this.page.locator(this.openingTypesContent)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.openingTypesListTitle)).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator(this.openingTypesTableBody)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.openingTypesTableBody).locator('tr').first()).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator(this.addNewButton)).toBeVisible({ timeout: 5000 });
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => console.warn('Network idle timeout exceeded in waitForPageLoad, but continuing.'));
  }

  // --- Action Methods ---

  /**
   * Clicks the 'Add Opening Type' link.
   */
  async clickAddNewOpeningType() {
    await expect(this.page.locator(this.addNewButton)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.addNewButton).click();
    await expect(this.page.locator(this.addFormTitle)).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks the 'Edit' link for a specific Opening Type.
   * @param {string} openingTypeName - The exact name of the opening type to edit.
   */
  async clickEditOpeningType(openingTypeName) {
    const editButtonLocator = this.page.locator(this.editButtonForRow(openingTypeName));
    await expect(editButtonLocator).toBeVisible({ timeout: 10000 });
    await editButtonLocator.click();
    await expect(this.page.locator('h2').filter({ hasText: this.editFormTitleRegex })).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks the 'Delete' link for a specific Opening Type.
   * @param {string} openingTypeName - The exact name of the opening type to delete.
   */
  async clickDeleteOpeningType(openingTypeName) {
    const deleteButtonLocator = this.page.locator(this.deleteButtonForRow(openingTypeName));
    await expect(deleteButtonLocator).toBeVisible({ timeout: 10000 });
    await deleteButtonLocator.click();
    await expect(this.page.locator('h2').filter({ hasText: this.deleteFormTitleRegex })).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks the 'Save' button on the Add or Edit form.
   */
  async clickSave() {
    await expect(this.page.locator(this.saveButton)).toBeEnabled();
    await this.page.locator(this.saveButton).click();
  }

  /**
   * Clicks the 'Confirm Delete' button on the delete confirmation page.
   */
  async clickConfirmDelete() {
    await expect(this.page.locator(this.confirmDeleteButton)).toBeEnabled();
    await this.page.locator(this.confirmDeleteButton).click();
  }

  /**
   * Clicks the 'Cancel' button on the Add or Edit form.
   * Waits for the main list view to load afterwards.
   */
  async clickCancelEdit() {
    await this.page.locator(this.cancelEditButton).click();
    await this.waitForPageLoad();
  }

  /**
   * Clicks the 'Cancel' button on the delete confirmation page.
   * Waits for the main list view to load afterwards.
   */
  async clickCancelDelete() {
    await this.page.locator(this.cancelDeleteButton).click();
    await this.waitForPageLoad();
  }

  // --- Form Filling Methods ---

  /**
   * Clears the name and welsh name fields on the Add/Edit form.
   */
  async clearForm() {
    await expect(this.page.locator(this.addFormTitle).or(this.page.locator('h2').filter({ hasText: this.editFormTitleRegex }))).toBeVisible();
    await this.page.locator(this.nameInput).clear();
    await this.page.locator(this.nameWelshInput).clear();
  }

  /**
   * Fills the name and optionally the welsh name fields on the Add/Edit form.
   * @param {object} data - Object containing { name: string, nameCy?: string }.
   */
  async fillForm(data) {
    await expect(this.page.locator(this.addFormTitle).or(this.page.locator('h2').filter({ hasText: this.editFormTitleRegex }))).toBeVisible();
    if (data.name !== undefined) {
      await this.page.locator(this.nameInput).fill(data.name);
    }
    if (data.nameCy !== undefined) {
      await this.page.locator(this.nameWelshInput).fill(data.nameCy);
    }
  }

  // --- Verification Methods ---

  /**
   * Verifies the H2 title within the main content area.
   * @param {string|RegExp} expectedTitle - The expected title string or a regular expression.
   */
  async verifyFormTitle(expectedTitle) {
    const titleLocator = typeof expectedTitle === 'string'
      ? this.page.locator(`${this.openingTypesContent} h2:has-text("${expectedTitle}")`)
      : this.page.locator(`${this.openingTypesContent} h2`).filter({ hasText: expectedTitle });
    await expect(titleLocator).toBeVisible({ timeout: 10000 });
  }

  /**
   * Waits for the success panel and gets the trimmed text content of the success message title.
   * @param {object} [options={ timeout: 10000 }] - Options like timeout.
   * @returns {Promise<string>} The trimmed success message text.
   */
  async getSuccessMessage(options = { timeout: 10000 }) {
    await expect(this.page.locator(this.successPanel)).toBeVisible(options);
    const titleLocator = this.page.locator(this.successMessageTitle);
    await expect(titleLocator).toBeVisible(options);
    const textContent = await titleLocator.textContent();
    return textContent.trim();
  }

  /**
   * Waits for the error summary panel to appear.
   * @param {object} [options={ timeout: 5000 }] - Options like timeout.
   */
  async waitForErrorSummary(options = { timeout: 5000 }) {
    await expect(this.page.locator(this.errorSummary)).toBeVisible(options);
    await expect(this.page.locator(this.errorSummaryTitle)).toBeVisible(options);
  }

  /**
   * Gets all error messages from the visible error summary list (text from list items).
   * @returns {Promise<string[]>} An array of trimmed error message strings.
   */
  async getErrorSummaryMessages() {
    await this.waitForErrorSummary();
    const items = this.page.locator(this.errorSummaryListItem);
    await items.first().waitFor({ state: 'visible', timeout: 3000 });
    const texts = await items.allTextContents();
    return texts.map(text => text.trim()).filter(Boolean);
  }

  /**
   * Gets the first error message text from the error summary list (text from the li).
   * @returns {Promise<string>} The trimmed error message text.
   */
  async getFirstErrorSummaryListItemText() {
    await this.waitForErrorSummary();
    const firstItem = this.page.locator(this.errorSummaryListItem).first();
    await firstItem.waitFor({ state: 'visible', timeout: 3000 });
    return (await firstItem.textContent()).trim();
  }

  /**
   * Gets the field-level error message associated with the name input.
   * @returns {Promise<string>} The trimmed error message text.
   */
  async getNameFieldError() {
    const errorLocator = this.page.locator(this.nameError);
    await expect(errorLocator).toBeVisible({ timeout: 5000 });
    return (await errorLocator.textContent()).trim();
  }

  /**
   * Checks if a specific Opening Type is visible in the list table.
   * @param {string} openingTypeName - The exact name to look for.
   * @returns {Promise<boolean>} True if visible, false otherwise.
   */
  async isOpeningTypeVisible(openingTypeName) {
    const rowLocator = this.page.locator(this.openingTypeRow(openingTypeName));
    return await rowLocator.isVisible({ timeout: 3000 });
  }

  /**
   * Ensures a specific Opening Type does not exist in the list. If it exists, it attempts to delete it.
   * Used for test setup/cleanup. Handles potential 'in-use' errors gracefully.
   * @param {string} openingTypeName - The name of the opening type to ensure is deleted.
   */
  async ensureOpeningTypeDoesNotExist(openingTypeName) {
    await this.waitForPageLoad();

    const rowLocator = this.page.locator(this.openingTypeRow(openingTypeName));
    const isVisible = await rowLocator.isVisible({ timeout: 2000 });

    if (isVisible) {
      console.log(`Cleanup: Opening Type "${openingTypeName}" found. Attempting deletion.`);
      await this.clickDeleteOpeningType(openingTypeName);
      await this.verifyFormTitle(this.deleteFormTitleRegex);

      await this.page.waitForSelector(`${this.successPanel}, ${this.errorSummary}`, { timeout: 15000 });
      await this.clickConfirmDelete();

      const successVisible = await this.page.locator(this.successPanel).isVisible({ timeout: 2000 });
      const errorVisible = await this.page.locator(this.errorSummary).isVisible({ timeout: 2000 });

      if (successVisible) {
        await this.getSuccessMessage(); // Consume message
        console.log(`Cleanup: Successfully deleted "${openingTypeName}".`);
        await expect(rowLocator).toBeHidden({ timeout: 5000 });
      } else if (errorVisible) {
        const errorText = await this.getFirstErrorSummaryListItemText();
        if (errorText.includes('cannot delete this opening type')) {
          console.warn(`Cleanup: Cannot delete "${openingTypeName}" as it is in use. Test may proceed, but verify assumptions.`);
          await this.clickCancelDelete();
        } else {
          console.error(`Cleanup: Unexpected error during deletion of "${openingTypeName}": ${errorText}`);
          await this.clickCancelDelete();
        }
      } else {
        console.error(`Cleanup: Neither success nor error panel found after attempting delete for "${openingTypeName}".`);
        if (await this.page.locator(this.cancelDeleteButton).isVisible({ timeout: 1000 })) {
          await this.clickCancelDelete();
        }
      }
    } else {
      console.log(`Cleanup: Opening Type "${openingTypeName}" not found. No cleanup needed.`);
    }
    await this.waitForPageLoad();
  }
}

module.exports = { OpeningTypesPage };
