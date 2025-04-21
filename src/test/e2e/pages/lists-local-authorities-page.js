// src/test/e2e/pages/lists-local-authorities-page.js
const { expect } = require('@playwright/test');

class LocalAuthoritiesPage {
  constructor(page) {
    this.page = page;

    this.listsNavLink = '#lists';
    this.pageTitleLists = 'h1:has-text("Edit A List")';
    this.tabsContainer = 'div[data-module="fact-tabs"]';
    this.visibleTabTitle = `${this.tabsContainer} .fact-tabs-title`;
    this.localAuthoritiesTabLink = 'a.fact-tabs-tab[href="#local-authorities"]';
    this.localAuthoritiesPanel = 'div.fact-tabs-panel#local-authorities';
    this.localAuthoritiesContent = `${this.localAuthoritiesPanel} #localAuthoritiesListContent`;

    this.localAuthoritiesListTitle = `${this.localAuthoritiesContent} h2:has-text("Edit Local Authorities")`;
    this.localAuthoritiesForm = '#localAuthoritiesListForm';
    this.localAuthorityRadioById = (id) => `${this.localAuthoritiesContent} input[type="radio"]#${id}`;
    this.selectedLocalAuthorityHiddenInput = `${this.localAuthoritiesForm} input[type="hidden"][name="localAuthorities"]`;
    this.editContainer = `${this.localAuthoritiesContent} #edit`;
    this.editLabel = `${this.editContainer} #selected`;
    this.nameInput = `${this.editContainer} #local-authority`;
    this.saveButton = `${this.localAuthoritiesForm} button[name="saveLocalAuthoritiesList"]`;

    this.successPanel = `${this.localAuthoritiesContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successPanel} > h2.govuk-panel__title`;
    this.errorSummary = `${this.localAuthoritiesContent} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryListItem = `${this.errorSummaryList} li`;
  }

  async clickListsNavLink() {
    await this.page.locator(this.listsNavLink).click();
    await expect(this.page.locator(this.pageTitleLists)).toBeVisible({ timeout: 10000 });
  }

  async clickLocalAuthoritiesTab() {
    await expect(this.page.locator(this.visibleTabTitle)).toBeVisible({ timeout: 5000 });
    await this.page.locator(this.visibleTabTitle).hover();
    const localAuthoritiesLink = this.page.locator(this.localAuthoritiesTabLink);
    await expect(localAuthoritiesLink).toBeVisible({ timeout: 5000 });

    const listLoadResponsePromise = this.page.waitForResponse(
      response => response.url().includes('/lists/local-authorities-list') && response.request().method() === 'GET' && response.status() === 200,
      { timeout: 15000 }
    );
    await localAuthoritiesLink.click();
    await this.page.locator('h1').hover();

    try {
      await listLoadResponsePromise;
    } catch (e) {
      console.warn(`Timeout or error waiting for GET /lists/local-authorities-list response: ${e.message}. Content might be stale.`);
      await this.page.waitForTimeout(1000);
    }

    await expect(this.page.locator(this.localAuthoritiesPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });
    await expect(this.page.locator(this.localAuthoritiesContent)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.localAuthoritiesListTitle)).toBeVisible({ timeout: 10000 });
  }

  async waitForPageLoad() {
    await expect(this.page.locator(this.localAuthoritiesContent)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.localAuthoritiesListTitle)).toBeVisible({ timeout: 5000 });

    const firstRadioButtonLocator = this.page.locator(`${this.localAuthoritiesContent} input[type="radio"]`).first();
    await expect(firstRadioButtonLocator).toBeVisible({ timeout: 10000 });

    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => console.warn('Network idle timeout exceeded in waitForPageLoad, but continuing.'));
  }

  async selectLocalAuthorityById(localAuthorityId, expectedNameInLabel) {
    const radioLocator = this.page.locator(this.localAuthorityRadioById(localAuthorityId));
    await expect(radioLocator).toBeVisible({ timeout: 10000 });
    await radioLocator.check();

    await expect(this.page.locator(this.editContainer)).toBeVisible({ timeout: 5000 });
    await expect(this.page.locator(this.editLabel)).toContainText(`Edit ${expectedNameInLabel}`, { timeout: 5000 });
    await expect(this.page.locator(this.nameInput)).toHaveValue(expectedNameInLabel, { timeout: 5000 });
  }

  async fillLocalAuthorityName(name) {
    const inputLocator = this.page.locator(this.nameInput);
    await expect(inputLocator).toBeVisible();
    await inputLocator.fill(name);
  }

  async clickSave() {
    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeEnabled({ timeout: 5000 });
    await saveButtonLocator.click();
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

  async getErrorSummaryTitleText() {
    await this.waitForErrorSummary();
    return (await this.page.locator(this.errorSummaryTitle).textContent()).trim();
  }

  async getErrorSummaryMessage() {
    await this.waitForErrorSummary();
    const firstItem = this.page.locator(this.errorSummaryListItem).first();
    await firstItem.waitFor({ state: 'visible', timeout: 3000 });
    return (await firstItem.textContent()).trim();
  }

  async waitForSaveResponse(options = { timeout: 15000 }) {
    const urlPattern = /.*\/lists\/local-authorities-list/;
    return this.page.waitForResponse(
      response => urlPattern.test(response.url()) && response.request().method() === 'PUT',
      options
    );
  }
}

module.exports = { LocalAuthoritiesPage };
