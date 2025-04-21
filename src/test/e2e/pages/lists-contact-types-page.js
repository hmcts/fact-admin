// src/test/e2e/pages/lists-contact-types-page.js
const { expect } = require('@playwright/test');

/**
 * Page Object Model for the Contact Types list page within the Admin Lists section.
 * Handles interactions with the contact types list, add/edit forms, and delete confirmations.
 */
class ContactTypesPage {
  constructor(page) {
    this.page = page;

    // --- Main Page & Tab Locators ---
    this.listsNavLink = '#lists';
    this.pageTitleLists = 'h1:has-text("Edit A List")';
    this.tabsContainer = 'div[data-module="fact-tabs"]';
    this.visibleTabTitle = `${this.tabsContainer} .fact-tabs-title`;
    this.contactTypesTabLink = 'a.fact-tabs-tab[href="#contact-types"]';
    this.contactTypesPanel = 'div.fact-tabs-panel#contact-types';
    this.contactTypesContent = `${this.contactTypesPanel} #contactTypeListContent`; // Main container for list/form content
    this.contactTypesListTitle = `${this.contactTypesContent} > h2:has-text("Contact Types")`;
    this.contactTypesTable = `${this.contactTypesContent} table`;
    this.contactTypesTableBody = `${this.contactTypesTable} tbody`;
    this.contactTypesTableRows = `${this.contactTypesTableBody} tr`;

    // --- Action Buttons/Links ---
    this.addNewButton = `${this.contactTypesPanel} a:has-text("Add Contact Type")`;
    this.saveButton = '#saveContactTypeBtn';
    this.confirmDeleteButton = '#confirmDelete';
    this.cancelDeleteButton = '#cancelDeleteContactTypeBtn';
    this.cancelEditButton = '#cancelContactTypeChangesBtn';

    // --- Form Locators ---
    this.addFormTitle = `${this.contactTypesContent} h2:has-text("Add New Contact Type")`;
    this.editFormTitleRegex = /Editing Contact Type: .*/;
    this.deleteFormTitleRegex = /Delete Contact Type: .*/;
    this.nameInput = '#ct-type';
    this.nameWelshInput = '#ct-type-cy';

    // --- Messages and Errors ---
    this.successPanel = `${this.contactTypesContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successPanel} > h2.govuk-panel__title`;
    this.errorSummary = `${this.contactTypesContent} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryListItem = `${this.errorSummaryList} li`;
    this.nameError = '#ct-type-error';

    // --- Row Locators ---
    // Use :text-is() for exact match to avoid strict mode violations on partial matches
    this.contactTypeRow = (name) => `${this.contactTypesTableBody} tr:has(td:nth-child(1):text-is("${name}"))`;
    this.editButtonForRow = (name) => `${this.contactTypeRow(name)} > td:nth-child(2) > a`;
    this.deleteButtonForRow = (name) => `${this.contactTypeRow(name)} > td:nth-child(3) > a`;
  }

  // --- Navigation Methods ---

  async clickListsNavLink() {
    await this.page.locator(this.listsNavLink).click();
    await expect(this.page.locator(this.pageTitleLists)).toBeVisible({ timeout: 10000 });
  }

  async clickContactTypesTab() {
    await expect(this.page.locator(this.visibleTabTitle)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.visibleTabTitle).hover();
    const contactTypesLink = this.page.locator(this.contactTypesTabLink);
    await expect(contactTypesLink).toBeVisible({ timeout: 5000 });

    const listLoadResponsePromise = this.page.waitForResponse(
      response => response.url().includes('/lists/contact-types') && response.request().method() === 'GET' && response.status() === 200,
      { timeout: 15000 }
    );
    await contactTypesLink.click();
    await this.page.locator('h1').hover(); // Stop hovering

    try {
      await listLoadResponsePromise;
    } catch (e) {
      console.warn(`Timeout or error waiting for GET /lists/contact-types response: ${e.message}`);
    }

    await expect(this.page.locator(this.contactTypesPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });
    await expect(this.page.locator(this.contactTypesContent)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.contactTypesListTitle)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Waits for the main Contact Types list view to be fully loaded.
   * Checks for the list title, the Add New button, and the table body.
   * Includes a network idle wait for increased stability.
   */
  async waitForPageLoad() {
    await expect(this.page.locator(this.contactTypesContent)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.contactTypesListTitle)).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator(this.contactTypesTableBody)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.contactTypesTableBody).locator('tr').first()).toBeVisible({timeout: 5000});
    await expect(this.page.locator(this.addNewButton)).toBeVisible({ timeout: 5000 });
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => console.warn('Network idle timeout exceeded in waitForPageLoad, but continuing.'));
  }

  // --- Action Methods ---

  async clickAddNewContactType() {
    await expect(this.page.locator(this.addNewButton)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.addNewButton).click();
    await expect(this.page.locator(this.addFormTitle)).toBeVisible({ timeout: 10000 });
  }

  async clickEditContactType(contactTypeName) {
    const editButtonLocator = this.page.locator(this.editButtonForRow(contactTypeName));
    await expect(editButtonLocator).toBeVisible({ timeout: 10000 });
    await editButtonLocator.click(); // Rely on Playwright's built-in scroll/visibility
    await expect(this.page.locator('h2').filter({ hasText: this.editFormTitleRegex })).toBeVisible({ timeout: 10000 });
  }

  async clickDeleteContactType(contactTypeName) {
    const deleteButtonLocator = this.page.locator(this.deleteButtonForRow(contactTypeName));
    await expect(deleteButtonLocator).toBeVisible({ timeout: 10000 });
    await deleteButtonLocator.click(); // Rely on Playwright's built-in scroll/visibility
    await expect(this.page.locator('h2').filter({ hasText: this.deleteFormTitleRegex })).toBeVisible({ timeout: 10000 });
  }

  async clickSave() {
    await expect(this.page.locator(this.saveButton)).toBeEnabled();
    await this.page.locator(this.saveButton).click();
  }

  async clickConfirmDelete() {
    await expect(this.page.locator(this.confirmDeleteButton)).toBeEnabled();
    await this.page.locator(this.confirmDeleteButton).click();
  }

  async clickCancelEdit() {
    await this.page.locator(this.cancelEditButton).click();
    await this.waitForPageLoad();
  }

  async clickCancelDelete() {
    await this.page.locator(this.cancelDeleteButton).click();
    await this.waitForPageLoad();
  }

  // --- Form Filling Methods ---

  async clearForm() {
    await expect(this.page.locator(this.addFormTitle).or(this.page.locator('h2').filter({ hasText: this.editFormTitleRegex }))).toBeVisible();
    await this.page.locator(this.nameInput).clear();
    await this.page.locator(this.nameWelshInput).clear();
  }

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

  async verifyFormTitle(expectedTitle) {
    const titleLocator = typeof expectedTitle === 'string'
      ? this.page.locator(`${this.contactTypesContent} h2:has-text("${expectedTitle}")`)
      : this.page.locator('h2').filter({ hasText: expectedTitle });
    await expect(titleLocator).toBeVisible({ timeout: 10000 });
  }

  async getSuccessMessage(options = { timeout: 10000 }) {
    await expect(this.page.locator(this.successPanel)).toBeVisible(options);
    const titleLocator = this.page.locator(this.successMessageTitle);
    await expect(titleLocator).toBeVisible(options);
    const textContent = await titleLocator.textContent();
    return textContent.trim();
  }

  async waitForErrorSummary(options = { timeout: 5000 }) {
    await expect(this.page.locator(this.errorSummary)).toBeVisible(options);
    await expect(this.page.locator(this.errorSummaryTitle)).toBeVisible(options);
  }

  async getErrorSummaryMessages() {
    await this.waitForErrorSummary();
    const items = this.page.locator(this.errorSummaryListItem);
    await items.first().waitFor({ state: 'visible', timeout: 3000 });
    const texts = await items.allTextContents();
    return texts.map(text => text.trim()).filter(Boolean);
  }

  async getFirstErrorSummaryMessage() {
    await this.waitForErrorSummary();
    const firstItem = this.page.locator(this.errorSummaryListItem).first();
    await firstItem.waitFor({ state: 'visible', timeout: 3000 });
    return (await firstItem.textContent()).trim();
  }

  async getNameFieldError() {
    const errorLocator = this.page.locator(this.nameError);
    await expect(errorLocator).toBeVisible({ timeout: 5000 });
    return (await errorLocator.textContent()).trim();
  }

  async isContactTypeVisible(contactTypeName) {
    const rowLocator = this.page.locator(this.contactTypeRow(contactTypeName));
    await expect(rowLocator).toBeVisible({ timeout: 5000 });
    return true; // If expect passes, it's visible
  }

  async waitForSaveResponse(options = { timeout: 15000 }) {
    const urlPattern = /.*\/lists\/contact-type/;
    return this.page.waitForResponse(
      response => urlPattern.test(response.url()) && response.request().method() === 'PUT',
      options
    );
  }

  async waitForDeleteResponse(options = { timeout: 15000 }) {
    const urlPattern = /.*\/lists\/contact-type\/\d+/;
    return this.page.waitForResponse(
      response => urlPattern.test(response.url()) && response.request().method() === 'DELETE',
      options
    );
  }

  /**
   * Ensures a specific Contact Type does not exist in the list. If it exists, it attempts to delete it.
   * Used for test setup/cleanup. Handles potential 'in-use' errors gracefully.
   * @param {string} contactTypeName - The name of the contact type to ensure is deleted.
   */
  async ensureContactTypeDoesNotExist(contactTypeName) {
    await this.waitForPageLoad();

    const rowLocator = this.page.locator(this.contactTypeRow(contactTypeName));
    const rowCount = await rowLocator.count();

    if (rowCount > 0) {
      console.log(`Cleanup: Contact Type "${contactTypeName}" found. Attempting deletion.`);
      await expect(this.page.locator(this.deleteButtonForRow(contactTypeName))).toBeVisible({ timeout: 5000 });
      await this.clickDeleteContactType(contactTypeName);
      const deleteResponsePromise = this.waitForDeleteResponse();
      await this.clickConfirmDelete();
      try {
        const response = await deleteResponsePromise;
        if (response.status() === 200) {
          await this.getSuccessMessage();
          console.log(`Cleanup: Successfully deleted "${contactTypeName}".`);
          await expect(rowLocator).toBeHidden({ timeout: 5000 });
        } else if (response.status() === 409) {
          console.warn(`Cleanup: Cannot delete "${contactTypeName}" as it might be in use (409 Conflict). Test may proceed, but verify assumptions.`);
          await this.getFirstErrorSummaryMessage();
          await this.clickCancelDelete(); // Go back to list
        } else {
          const body = await response.text().catch(() => 'unknown error');
          console.error(`Cleanup: Unexpected status ${response.status()} when deleting "${contactTypeName}". Body: ${body}`);
          await this.clickCancelDelete(); // Try to recover
        }
      } catch (e) {
        console.error(`Cleanup: Error during deletion of "${contactTypeName}": ${e.message}`);
        if (await this.page.locator(this.cancelDeleteButton).isVisible({ timeout: 1000 })) {
          await this.clickCancelDelete();
        }
        await expect(rowLocator).toBeHidden({ timeout: 5000 });
      }
    } else {
      console.log(`Cleanup: Contact Type "${contactTypeName}" not found. No cleanup needed.`);
    }
    await this.waitForPageLoad();
  }
}

module.exports = { ContactTypesPage };
