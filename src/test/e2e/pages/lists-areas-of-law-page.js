// src/test/e2e/pages/lists-areas-of-law-page.js
const { expect } = require('@playwright/test');

/**
 * Page Object Model for the Areas of Law list page within the Admin Lists section.
 * Handles interactions with the areas of law list, add/edit forms, and delete confirmations.
 */
class AreasOfLawPage {
  constructor(page) {
    this.page = page;

    // --- Main Page & Tab Locators ---
    this.listsNavLink = '#lists';
    this.pageTitleLists = 'h1:has-text("Edit A List")';
    this.tabsContainer = 'div[data-module="fact-tabs"]';
    this.visibleTabTitle = `${this.tabsContainer} .fact-tabs-title`;
    this.areasOfLawTabLink = 'a.fact-tabs-tab[href="#areas-of-law"]';
    this.areasOfLawPanel = 'div.fact-tabs-panel#areas-of-law';
    this.areasOfLawContent = `${this.areasOfLawPanel} #areasOfLawListContent`; // Container updated by AJAX
    this.areasOfLawListTitle = `${this.areasOfLawContent} > h2:has-text("Areas of Law")`;
    this.areasOfLawTable = `${this.areasOfLawContent} table`;
    this.areasOfLawTableBody = `${this.areasOfLawTable} tbody`;
    this.areasOfLawTableRows = `${this.areasOfLawTableBody} tr`;

    // --- Action Buttons/Links ---
    this.addNewButton = `${this.areasOfLawContent} a:has-text("Add Area of Law")`; // Link styled as button
    this.saveButton = 'button#saveAreaOfLawBtn';
    this.confirmDeleteButton = '#confirmDelete';
    this.cancelDeleteButton = '#cancelDeleteAreaOfLawBtn';
    this.cancelEditButton = '#cancelAreaOfLawChangesBtn';

    // --- Form Locators ---
    this.addFormTitle = `${this.areasOfLawContent} h2:has-text("Add New Area of Law")`;
    this.addNameInput = '#aol-name';

    this.editFormTitleRegex = /Editing Area of Law: .*/; // Regex to match edit title (e.g., Editing Area of Law: Adoption)
    this.editDisplayNameInput = '#aol-display-name';
    this.editDisplayNameCyInput = '#aol-display-name-cy';
    this.editAltNameInput = '#aol-alt-name';
    this.editAltNameCyInput = '#aol-alt-name-cy';
    this.editExternalLinkInput = '#aol-external-link';
    this.editExternalLinkDescInput = '#aol-external-link-desc';
    this.editExternalLinkDescCyInput = '#aol-external-link-desc-cy';
    this.editDisplayExternalLinkInput = '#aol-display-external-link';

    // --- Messages and Errors ---
    this.successPanel = `${this.areasOfLawContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successPanel} > h2.govuk-panel__title`;
    this.errorSummary = `${this.areasOfLawContent} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryListItem = `${this.errorSummaryList} li`;
    this.errorSummaryLink = `${this.errorSummaryListItem} a`; // Link within error summary item

    // Field-specific errors
    this.nameError = '#aol-name-error';
    this.linkError = '#aol-external-link-error';
    this.displayLinkError = '#aol-display-external-link-error';

    // --- Row Locators ---
    this.areaOfLawRow = (name) => `${this.areasOfLawTableBody} tr:has-text("${name}")`;
    this.editButtonForRow = (name) => `${this.areaOfLawRow(name)} > td:nth-child(2) > a`;
    this.deleteButtonForRow = (name) => `${this.areaOfLawRow(name)} > td:nth-child(3) > a`;
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
   * Clicks the "Areas of Law" tab within the Lists page.
   * Waits for the AJAX request fetching the list data to complete.
   */
  async clickAreasOfLawTab() {
    await expect(this.page.locator(this.visibleTabTitle)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.visibleTabTitle).click(); // Reveal tab list

    const areasOfLawLink = this.page.locator(this.areasOfLawTabLink);
    await expect(areasOfLawLink).toBeVisible({ timeout: 5000 });

    // Wait for the GET request *after* clicking the link
    const listLoadResponsePromise = this.page.waitForResponse(
      response => response.url().includes('/lists/areas-of-law') && response.request().method() === 'GET' && response.status() === 200,
      { timeout: 15000 }
    );
    await areasOfLawLink.click();
    try {
      await listLoadResponsePromise;
    } catch (e) {
      console.warn(`Timeout or error waiting for GET /lists/areas-of-law response: ${e.message}`);
    }

    // Wait for panel content to be visually updated
    await expect(this.page.locator(this.areasOfLawPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });
    await expect(this.page.locator(this.areasOfLawListTitle)).toBeVisible({ timeout: 15000 });
  }

  /**
   * Waits for the main Areas of Law list view to be fully loaded.
   * Checks for the list title and the Add New link.
   */
  async waitForPageLoad() {
    await expect(this.page.locator(this.areasOfLawListTitle)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.addNewButton)).toBeVisible({ timeout: 5000 });
  }

  // --- Action Methods ---

  /**
   * Clicks the 'Add Area of Law' link.
   * Waits for the Add form title to be visible.
   */
  async clickAddNewAreaOfLaw() {
    await expect(this.page.locator(this.addNewButton)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.addNewButton).click();
    await expect(this.page.locator(this.addFormTitle)).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks the 'Edit' link for a specific Area of Law.
   * Waits for the Edit form title to be visible.
   * @param {string} areaOfLawName - The exact name of the area of law to edit.
   */
  async clickEditAreaOfLaw(areaOfLawName) {
    const editButtonLocator = this.page.locator(this.editButtonForRow(areaOfLawName));
    await expect(editButtonLocator).toBeVisible({ timeout: 10000 });
    await editButtonLocator.scrollIntoViewIfNeeded();
    await editButtonLocator.click();
    await expect(this.page.locator('h2').filter({ hasText: this.editFormTitleRegex })).toBeVisible({ timeout: 10000 });
  }

  /**
   * Clicks the 'Delete' link for a specific Area of Law.
   * Waits for the Delete confirmation title to be visible.
   * @param {string} areaOfLawName - The exact name of the area of law to delete.
   */
  async clickDeleteAreaOfLaw(areaOfLawName) {
    const deleteButtonLocator = this.page.locator(this.deleteButtonForRow(areaOfLawName));
    await expect(deleteButtonLocator).toBeVisible({ timeout: 10000 });
    await deleteButtonLocator.scrollIntoViewIfNeeded();
    await deleteButtonLocator.click();
    await expect(this.page.locator('h2').filter({ hasText: `Delete Area of Law: ${areaOfLawName}` })).toBeVisible({ timeout: 10000 });
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
   * Waits for the main list view to load.
   */
  async clickCancelEdit() {
    await this.page.locator(this.cancelEditButton).click();
    await this.waitForPageLoad();
  }

  /**
   * Clicks the 'Cancel' button on the delete confirmation page.
   * Waits for the main list view to load.
   */
  async clickCancelDelete() {
    await this.page.locator(this.cancelDeleteButton).click();
    await this.waitForPageLoad();
  }

  // --- Form Filling Methods ---

  /**
   * Fills the 'Add New Area of Law' form.
   * @param {object} data - Object containing { name }.
   */
  async fillAddForm(data) {
    await expect(this.page.locator(this.addFormTitle)).toBeVisible();
    if (data.name !== undefined) {
      await this.page.locator(this.addNameInput).fill(data.name);
    }
  }

  /**
   * Clears all input fields on the Edit form.
   */
  async clearEditForm() {
    await expect(this.page.locator('h2').filter({ hasText: this.editFormTitleRegex })).toBeVisible();
    await this.page.locator(this.editDisplayNameInput).clear();
    await this.page.locator(this.editDisplayNameCyInput).clear();
    await this.page.locator(this.editAltNameInput).clear();
    await this.page.locator(this.editAltNameCyInput).clear();
    await this.page.locator(this.editExternalLinkInput).clear();
    await this.page.locator(this.editExternalLinkDescInput).clear();
    await this.page.locator(this.editExternalLinkDescCyInput).clear();
    await this.page.locator(this.editDisplayExternalLinkInput).clear();
  }

  /**
   * Fills the 'Editing Area of Law' form.
   * @param {object} data - Object containing optional fields:
   *                        { displayName, displayNameCy, altName, altNameCy,
   *                          externalLink, externalLinkDesc, externalLinkDescCy,
   *                          displayExternalLink }
   */
  async fillEditForm(data) {
    await expect(this.page.locator('h2').filter({ hasText: this.editFormTitleRegex })).toBeVisible();

    if (data.displayName !== undefined) await this.page.locator(this.editDisplayNameInput).fill(data.displayName);
    if (data.displayNameCy !== undefined) await this.page.locator(this.editDisplayNameCyInput).fill(data.displayNameCy);
    if (data.altName !== undefined) await this.page.locator(this.editAltNameInput).fill(data.altName);
    if (data.altNameCy !== undefined) await this.page.locator(this.editAltNameCyInput).fill(data.altNameCy);
    if (data.externalLink !== undefined) await this.page.locator(this.editExternalLinkInput).fill(data.externalLink);
    if (data.externalLinkDesc !== undefined) await this.page.locator(this.editExternalLinkDescInput).fill(data.externalLinkDesc);
    if (data.externalLinkDescCy !== undefined) await this.page.locator(this.editExternalLinkDescCyInput).fill(data.externalLinkDescCy);
    if (data.displayExternalLink !== undefined) await this.page.locator(this.editDisplayExternalLinkInput).fill(data.displayExternalLink);
  }

  // --- Verification Methods ---

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
   * Useful for errors that might not be links (like the 'in use' error).
   * @returns {Promise<string>} The trimmed error message text.
   */
  async getFirstErrorSummaryListItemText() {
    await this.waitForErrorSummary();
    const firstItem = this.page.locator(this.errorSummaryListItem).first();
    await firstItem.waitFor({ state: 'visible', timeout: 3000 });
    return (await firstItem.textContent()).trim();
  }

  /**
   * Checks if a specific Area of Law is visible in the list table.
   * @param {string} areaOfLawName - The exact name to look for.
   * @returns {Promise<boolean>} True if visible, false otherwise.
   */
  async isAreaOfLawVisible(areaOfLawName) {
    const rowLocator = this.page.locator(this.areaOfLawRow(areaOfLawName));
    return await rowLocator.isVisible();
  }

  /**
   * Waits for an AJAX PUT request (typically for saving) to complete.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponse(options = { timeout: 15000 }) {
    const urlPattern = /.*\/lists\/area-of-law/; // Singular form
    return this.page.waitForResponse(
      response => urlPattern.test(response.url()) && response.request().method() === 'PUT',
      options
    );
  }

  /**
   * Waits for an AJAX DELETE request to complete.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForDeleteResponse(options = { timeout: 15000 }) {
    const urlPattern = /.*\/lists\/area-of-law\/\d+/; // Singular form with ID
    return this.page.waitForResponse(
      response => urlPattern.test(response.url()) && response.request().method() === 'DELETE',
      options
    );
  }

  /**
   * Ensures a specific Area of Law does not exist in the list. If it exists, it attempts to delete it.
   * Used for test setup/cleanup.
   * @param {string} areaOfLawName - The name of the area of law to ensure is deleted.
   */
  async ensureAreaOfLawDoesNotExist(areaOfLawName) {
    await this.waitForPageLoad();
    await this.page.waitForLoadState('networkidle');

    if (await this.isAreaOfLawVisible(areaOfLawName)) {
      console.log(`Cleanup: Area of Law "${areaOfLawName}" found. Attempting deletion.`);
      await this.clickDeleteAreaOfLaw(areaOfLawName);
      const deleteResponsePromise = this.waitForDeleteResponse();
      await this.clickConfirmDelete();
      try {
        const response = await deleteResponsePromise;
        if (response.status() === 200) {
          await this.getSuccessMessage(); // Wait for success message UI update
          console.log(`Cleanup: Successfully deleted "${areaOfLawName}".`);
          await expect(this.page.locator(this.areaOfLawRow(areaOfLawName))).toBeHidden({ timeout: 5000 });
        } else if (response.status() === 409) {
          console.warn(`Cleanup: Cannot delete "${areaOfLawName}" as it is in use (409 Conflict). Test may fail if it relies on this being absent.`);
          await this.getFirstErrorSummaryListItemText(); // Consume the error message
          await this.clickCancelDelete(); // Go back to list
        } else {
          const body = await response.text().catch(() => 'unknown error');
          console.error(`Cleanup: Unexpected status ${response.status()} when deleting "${areaOfLawName}". Body: ${body}`);
          await this.clickCancelDelete(); // Try to recover
        }
      } catch (e) {
        console.error(`Cleanup: Error during deletion of "${areaOfLawName}": ${e.message}`);
        if (await this.page.locator(this.cancelDeleteButton).isVisible({ timeout: 1000 })) {
          await this.clickCancelDelete();
        }
        await expect(this.page.locator(this.areaOfLawRow(areaOfLawName))).toBeHidden({ timeout: 5000 });
      }
    } else {
      console.log(`Cleanup: Area of Law "${areaOfLawName}" not found. No cleanup needed.`);
    }
    await this.waitForPageLoad();
  }
}

module.exports = { AreasOfLawPage };
