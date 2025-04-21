// src/test/e2e/pages/lists-facility-types-page.js
const { expect } = require('@playwright/test');

/**
 * Page Object Model for the Facility Types list page within the Admin Lists section.
 * Handles interactions with the facility types list, add/edit forms, and delete confirmations.
 */
class FacilityTypesPage {
  constructor(page) {
    this.page = page;

    // --- Main Page & Tab Locators ---
    this.listsNavLink = '#lists';
    this.pageTitleLists = 'h1:has-text("Edit A List")';
    this.tabsContainer = 'div[data-module="fact-tabs"]';
    this.visibleTabTitle = `${this.tabsContainer} .fact-tabs-title`;
    this.facilityTypesTabLink = 'a.fact-tabs-tab[href="#facilities"]';
    this.facilityTypesPanel = 'div.fact-tabs-panel#facilities';
    this.facilityTypesContent = `${this.facilityTypesPanel} #facilityTypesListContent`; // Container updated by AJAX
    this.facilityTypesListTitle = `${this.facilityTypesContent} > h2:has-text("Facility Types")`;
    this.facilityTypesTable = `${this.facilityTypesContent} table`;
    this.facilityTypesTableBody = `${this.facilityTypesTable} tbody`;
    this.facilityTypesTableRows = `${this.facilityTypesTableBody} tr`;

    // --- Action Buttons/Links ---
    this.addNewButton = `${this.facilityTypesContent} a:has-text("Add New Facility Type")`;
    this.saveButton = '#saveFacilityType';
    this.confirmDeleteButton = '#confirmDelete';
    this.cancelDeleteButton = '#cancelDeleteFacilityTypeBtn'; // Assumed ID
    this.cancelEditButton = '#cancelFacilityTypeChangesBtn'; // Assumed ID

    // --- Form Locators ---
    this.addFormTitle = `${this.facilityTypesContent} h2:has-text("Add New Facility Type")`;
    this.editFormTitleRegex = /Edit Facility Type: .*/;
    this.deleteFormTitleRegex = /Delete Facility Type: .*/;
    this.nameInput = '#facility-type-name';
    this.nameWelshInput = '#facility-type-name-cy';

    // --- Messages and Errors ---
    this.successPanel = `${this.facilityTypesContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successPanel} > h2.govuk-panel__title`;
    this.errorSummary = `${this.facilityTypesContent} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryListItem = `${this.errorSummaryList} li`;
    this.errorSummaryLink = `${this.errorSummaryListItem} a`;

    // Field-specific errors
    this.nameError = '#facility-type-name-error'; // Assumed error ID structure

    // --- Row Locators ---
    this.facilityTypeRow = (name) => `${this.facilityTypesTableBody} tr:has(td:nth-child(1):text-is("${name}"))`;
    this.editButtonForRow = (name) => `${this.facilityTypeRow(name)} > td:nth-child(2) > a`;
    this.deleteButtonForRow = (name) => `${this.facilityTypeRow(name)} > td:nth-child(3) > a`;
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
   * Clicks the "Facility Types" tab within the Lists page.
   * Waits for the AJAX request fetching the list data to complete.
   */
  async clickFacilityTypesTab() {
    await expect(this.page.locator(this.visibleTabTitle)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.visibleTabTitle).hover();
    const facilityTypesLink = this.page.locator(this.facilityTypesTabLink);
    await expect(facilityTypesLink).toBeVisible({ timeout: 5000 });

    const listLoadResponsePromise = this.page.waitForResponse(
      response => response.url().includes('/lists/facility-types') && response.request().method() === 'GET' && response.status() === 200,
      { timeout: 15000 }
    );
    await facilityTypesLink.click();
    await this.page.locator(this.pageTitleLists).hover();

    try {
      await listLoadResponsePromise;
    } catch (e) {
      console.warn(`Timeout or error waiting for GET /lists/facility-types response: ${e.message}. Content might be stale.`);
      await this.page.waitForTimeout(1000);
    }

    await expect(this.page.locator(this.facilityTypesPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });
    await expect(this.page.locator(this.facilityTypesContent)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.facilityTypesListTitle)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Waits for the main Facility Types list view to be fully loaded.
   * Checks for the list title, the Add New button, and the table body.
   */
  async waitForPageLoad() {
    await expect(this.page.locator(this.facilityTypesContent)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.facilityTypesListTitle)).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator(this.facilityTypesTableBody)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.addNewButton)).toBeVisible({ timeout: 10000 });
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => console.warn('Network idle timeout exceeded in waitForPageLoad, but continuing.'));
  }

  // --- Action Methods ---

  /**
   * Clicks the 'Add new facility type' link.
   */
  async clickAddNewFacilityType() {
    await expect(this.page.locator(this.addNewButton)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.addNewButton).click();
    await expect(this.page.locator(this.addFormTitle)).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks the 'Edit' link for a specific facility type.
   * @param {string} facilityTypeName - The name of the facility type.
   */
  async clickEditFacilityType(facilityTypeName) {
    const editButtonLocator = this.page.locator(this.editButtonForRow(facilityTypeName));
    await expect(editButtonLocator).toBeVisible({ timeout: 10000 });
    await editButtonLocator.click();
    await expect(this.page.locator('h2').filter({ hasText: this.editFormTitleRegex })).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks the 'Delete' link for a specific facility type.
   * @param {string} facilityTypeName - The name of the facility type.
   */
  async clickDeleteFacilityType(facilityTypeName) {
    const deleteButtonLocator = this.page.locator(this.deleteButtonForRow(facilityTypeName));
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
   */
  async clickCancelEdit() {
    await this.page.locator(this.cancelEditButton).click();
    await this.waitForPageLoad();
  }

  /**
   * Clicks the 'Cancel' button on the delete confirmation page.
   */
  async clickCancelDelete() {
    await this.page.locator(this.cancelDeleteButton).click();
    await this.waitForPageLoad();
  }

  // --- Form Filling Methods ---

  /**
   * Fills the 'Add New Facility Type' form.
   * @param {object} data - Object containing { name }.
   */
  async fillAddForm(data) {
    await expect(this.page.locator(this.addFormTitle)).toBeVisible();
    if (data.name !== undefined) {
      await this.page.locator(this.nameInput).fill(data.name);
    }
  }

  /**
   * Clears all input fields on the Edit form.
   */
  async clearEditForm() {
    await expect(this.page.locator('h2').filter({ hasText: this.editFormTitleRegex })).toBeVisible();
    await this.page.locator(this.nameInput).clear();
    await this.page.locator(this.nameWelshInput).clear();
  }

  /**
   * Fills the 'Editing Facility Type' form.
   * @param {object} data - Object containing optional fields: { name, nameCy }.
   */
  async fillEditForm(data) {
    await expect(this.page.locator('h2').filter({ hasText: this.editFormTitleRegex })).toBeVisible();
    if (data.name !== undefined) {
      await this.page.locator(this.nameInput).fill(data.name);
    }
    if (data.nameCy !== undefined) {
      await this.page.locator(this.nameWelshInput).fill(data.nameCy);
    }
  }

  // --- Verification Methods ---

  /**
   * Verifies the H2 title of the current form/view within the content area.
   * @param {string|RegExp} expectedTitle - The expected title string or a regular expression.
   */
  async verifyFormTitle(expectedTitle) {
    const titleLocator = (typeof expectedTitle === 'string')
      ? this.page.locator(`${this.facilityTypesContent} > h2:has-text("${expectedTitle}")`)
      : this.page.locator(`${this.facilityTypesContent} > h2`).filter({ hasText: expectedTitle });
    await expect(titleLocator).toBeVisible({ timeout: 10000 });
  }

  /**
   * Waits for the success panel and gets the TRMMED text content of the success message title.
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
   * Gets all error messages from the visible error summary list (text from links).
   * @returns {Promise<string[]>} An array of trimmed error message strings.
   */
  async getErrorSummaryMessages() {
    await this.waitForErrorSummary();
    const items = this.page.locator(this.errorSummaryLink);
    await items.first().waitFor({ state: 'visible', timeout: 3000 });
    const texts = await items.allTextContents();
    return texts.map(text => text.trim()).filter(Boolean);
  }

  /**
   * Gets the first error message text from the error summary list (text from the li, not the link).
   * Useful for errors that might not be links.
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
   * Checks if a specific facility type is visible in the list table.
   * @param {string} facilityTypeName - The name of the facility type.
   * @returns {Promise<boolean>} True if visible, false otherwise.
   */
  async isFacilityTypeVisible(facilityTypeName) {
    const rowLocator = this.page.locator(this.facilityTypeRow(facilityTypeName));
    return await rowLocator.isVisible({ timeout: 3000 });
  }

  /**
   * Retrieves the data from a specific row in the facility types table.
   * @param {string} facilityTypeName The name of the facility type identifying the row.
   * @returns {Promise<{name: string, nameCy: string}>} Object containing name and welsh name.
   * @throws {Error} If the row cannot be found.
   */
  async getFacilityTypeRowData(facilityTypeName) {
    const rowLocator = this.page.locator(this.facilityTypeRow(facilityTypeName));
    await expect(rowLocator, `Row for facility type "${facilityTypeName}" not found.`).toBeVisible({ timeout: 5000 });
    const name = await rowLocator.locator('td:nth-child(1)').textContent();
    // Welsh name is not displayed in the list table based on Gherkin/Snapshot.
    const nameCy = '';
    return {
      name: name.trim(),
      nameCy: nameCy // Return empty string as it's not in the table
    };
  }

  // --- AJAX Wait Helpers ---

  /**
   * Waits for the Add (POST) response.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForAddResponse(options = { timeout: 15000 }) {
    const urlPattern = /.*\/lists\/facility-types$/; // POST to plural endpoint
    return this.page.waitForResponse(
      response => urlPattern.test(response.url()) && response.request().method() === 'POST',
      options
    );
  }

  /**
   * Waits for the Save/Edit (PUT) response.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponse(options = { timeout: 15000 }) {
    const urlPattern = /.*\/lists\/facility-type(\/\d+)?$/; // PUT to singular endpoint (with optional ID)
    return this.page.waitForResponse(
      response => urlPattern.test(response.url()) && response.request().method() === 'PUT',
      options
    );
  }

  /**
   * Waits for the Delete (DELETE) response.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForDeleteResponse(options = { timeout: 15000 }) {
    const urlPattern = /.*\/lists\/facility-types\/\d+$/; // DELETE to plural endpoint with ID
    return this.page.waitForResponse(
      response => urlPattern.test(response.url()) && response.request().method() === 'DELETE',
      options
    );
  }

  // --- Cleanup Method ---

  /**
   * Ensures a specific Facility Type does not exist in the list. If it exists, it attempts to delete it.
   * Used for test setup/cleanup. Handles potential 'in-use' errors gracefully.
   * @param {string} facilityTypeName - The name of the facility type to ensure is deleted.
   */
  async ensureFacilityTypeDoesNotExist(facilityTypeName) {
    await this.waitForPageLoad();

    const rowLocator = this.page.locator(this.facilityTypeRow(facilityTypeName));
    const isVisible = await rowLocator.isVisible({ timeout: 2000 });

    if (isVisible) {
      console.log(`Cleanup: Facility Type "${facilityTypeName}" found. Attempting deletion.`);
      await this.clickDeleteFacilityType(facilityTypeName);
      const deleteResponsePromise = this.waitForDeleteResponse();
      await this.clickConfirmDelete();
      try {
        const response = await deleteResponsePromise;
        if (response.status() === 200) {
          await this.getSuccessMessage();
          console.log(`Cleanup: Successfully deleted "${facilityTypeName}".`);
          await expect(rowLocator).toBeHidden({ timeout: 5000 });
        } else if (response.status() === 409) {
          console.warn(`Cleanup: Cannot delete "${facilityTypeName}" as it is in use (409 Conflict). Test may proceed, but verify assumptions.`);
          const errorText = await this.getFirstErrorSummaryListItemText();
          expect(errorText).toContain('You cannot delete this facility type at the moment');
          await this.clickCancelDelete();
        } else {
          const body = await response.text().catch(() => 'unknown error');
          console.error(`Cleanup: Unexpected status ${response.status()} when deleting "${facilityTypeName}". Body: ${body}`);
          await this.clickCancelDelete();
        }
      } catch (e) {
        console.error(`Cleanup: Error during deletion of "${facilityTypeName}": ${e.message}`);
        if (await this.page.locator(this.cancelDeleteButton).isVisible({ timeout: 1000 })) {
          await this.clickCancelDelete();
        }
        await expect(rowLocator).toBeHidden({ timeout: 5000 });
      }
    } else {
      console.log(`Cleanup: Facility Type "${facilityTypeName}" not found. No cleanup needed.`);
    }
    await this.waitForPageLoad();
  }
}

module.exports = { FacilityTypesPage };
