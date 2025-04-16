// src/test/e2e/pages/superadmin-general-info-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page'); // Assuming BasePage provides basic navigation/waits

/**
 * Page Object Model for the 'General Information' tab specifically for SUPER ADMIN interactions.
 * This separates Super Admin concerns from the standard Admin view/actions.
 */
class SuperAdminGeneralInfoPage extends BasePage {
  constructor(page) {
    super(page);

    // --- Main Containers & Tab ---
    this.navContainer = '#nav'; // Navigation container for hovering
    this.generalInfoTabLink = '#tab_general'; // The clickable 'General' tab
    this.generalInfoPanel = 'div.fact-tabs-panel#general'; // The main content panel for this tab
    this.generalInfoForm = `${this.generalInfoPanel} #generalInfoForm`; // The form within the panel
    this.generalInfoContent = `${this.generalInfoForm} #generalInfoContent`; // Specific content area
    this.mainContentArea = 'main#main-content'; // Locator for main content area to hover over

    // --- Super Admin Specific Fields ---
    this.courtNameInput = `${this.generalInfoForm} #edit-name`;
    this.openCourtCheckbox = `${this.generalInfoForm} #open`;
    this.infoNoticeIframe = `${this.generalInfoForm} #info_ifr`; // Iframe for 'Additional Information'
    this.infoNoticeWelshIframe = `${this.generalInfoForm} #info_cy_ifr`; // Iframe for Welsh 'Additional Information'
    this.introParagraphIframe = `${this.generalInfoForm} #sc_intro_paragraph_ifr`; // Iframe for Intro Para (Service Centre)
    this.introParagraphWelshIframe = `${this.generalInfoForm} #sc_intro_paragraph_cy_ifr`; // Iframe for Welsh Intro Para (Service Centre)
    this.tinyMceBody = 'body#tinymce'; // TinyMCE editor body selector (used within iframe contexts)

    // --- Shared Fields (also used by Admin) ---
    this.accessSchemeCheckbox = `${this.generalInfoForm} #access_scheme`; // 'PUAS' flag
    this.commonPlatformCheckbox = `${this.generalInfoForm} #common_platform`;
    this.urgentNoticeIframe = `${this.generalInfoForm} #urgent-notice_ifr`; // Urgent notice iframe
    this.urgentNoticeWelshIframe = `${this.generalInfoForm} #urgent-notice-welsh_ifr`; // Welsh urgent notice iframe

    // --- Action Buttons ---
    this.saveButton = `${this.generalInfoForm} #saveGeneralInfoBtn`;

    // --- Messages & Errors ---
    this.successMessageContainer = `${this.generalInfoContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successMessageContainer} > h2.govuk-panel__title`;
    this.errorSummary = `${this.generalInfoContent} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryItems = `${this.errorSummaryList} li a`; // Links within the summary list items
    this.fieldError = 'p.govuk-error-message'; // Generic field error selector relative to form group
    this.courtNameFieldError = '#edit-name-error'; // Specific field error for court name
  }

  /**
   * Clicks the 'General' tab and waits for the panel and save button to be visible and enabled.
   * Performance: Waits specifically for the save button as the primary indicator of AJAX load completion.
   */
  async clickGeneralInfoTab() {
    await this.page.locator(this.navContainer).hover();
    await this.page.locator(this.generalInfoTabLink).click();
    await this.page.locator(this.mainContentArea).hover(); // Move mouse away to prevent nav issues

    await expect(this.page.locator(this.generalInfoPanel)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.generalInfoPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });

    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeVisible({ timeout: 15000 });
    await expect(saveButtonLocator).toBeEnabled({ timeout: 5000 });
  }

  /**
   * Fills the Court Name input field.
   * @param {string} name - The court name to enter.
   */
  async fillCourtName(name) {
    const inputLocator = this.page.locator(this.courtNameInput);
    await expect(inputLocator).toBeVisible();
    await inputLocator.fill(name);
  }

  /**
   * Clears the Court Name input field.
   */
  async clearCourtName() {
    const inputLocator = this.page.locator(this.courtNameInput);
    await expect(inputLocator).toBeVisible();
    await inputLocator.fill('');
  }

  /**
   * Sets the checked state of the "Open" court checkbox.
   * Clicks the checkbox only if its current state differs from the desired state.
   * @param {boolean} checked - True to check the box, false to uncheck it.
   */
  async setOpenCourtFlag(checked) {
    const checkboxLocator = this.page.locator(this.openCourtCheckbox);
    await expect(checkboxLocator).toBeVisible();
    const isCurrentlyChecked = await checkboxLocator.isChecked();
    if (checked !== isCurrentlyChecked) {
      await checkboxLocator.click(); // Use simple click for toggling
    }
  }

  /**
   * Sets the checked state of the "Participates in access scheme" checkbox.
   * @param {boolean} checked - True to check the box, false to uncheck it.
   */
  async setAccessSchemeFlag(checked) {
    const checkboxLocator = this.page.locator(this.accessSchemeCheckbox);
    await expect(checkboxLocator).toBeVisible();
    const isCurrentlyChecked = await checkboxLocator.isChecked();
    if (checked !== isCurrentlyChecked) {
      await checkboxLocator.click();
    }
  }

  /**
   * Sets the checked state of the "Common Platform" checkbox.
   * @param {boolean} checked - True to check the box, false to uncheck it.
   */
  async setCommonPlatformFlag(checked) {
    const checkboxLocator = this.page.locator(this.commonPlatformCheckbox);
    await expect(checkboxLocator).toBeVisible();
    const isCurrentlyChecked = await checkboxLocator.isChecked();
    if (checked !== isCurrentlyChecked) {
      await checkboxLocator.click();
    }
  }

  /**
   * Fills the English Introduction Paragraph TinyMCE editor (for Service Centres).
   * @param {string} text - The content to enter.
   */
  async fillIntroParagraphEnglish(text) {
    const iframeLocator = this.page.locator(this.introParagraphIframe);
    await expect(iframeLocator).toBeVisible({ timeout: 7000 });
    const frame = this.page.frameLocator(this.introParagraphIframe);
    await expect(frame.locator(this.tinyMceBody)).toBeVisible({ timeout: 7000 });
    await frame.locator(this.tinyMceBody).fill(text);
  }

  /**
   * Fills the Welsh Introduction Paragraph TinyMCE editor (for Service Centres).
   * @param {string} text - The content to enter.
   */
  async fillIntroParagraphWelsh(text) {
    const iframeLocator = this.page.locator(this.introParagraphWelshIframe);
    await expect(iframeLocator).toBeVisible({ timeout: 7000 });
    const frame = this.page.frameLocator(this.introParagraphWelshIframe);
    await expect(frame.locator(this.tinyMceBody)).toBeVisible({ timeout: 7000 });
    await frame.locator(this.tinyMceBody).fill(text);
  }

  /**
   * Clicks the 'Save General Information' button.
   * Ensures TinyMCE content is saved before clicking.
   */
  async clickSave() {
    // Ensure TinyMCE content is saved to the underlying textareas before form submission
    await this.page.evaluate(() => {
      if (window.tinymce) {
        window.tinymce.triggerSave();
      }
    });
    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeEnabled();
    await saveButtonLocator.click();
  }

  /**
   * Waits for the General Info update PUT request to complete successfully (200 OK).
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponse(courtSlug, options = { timeout: 15000 }) {
    const updateUrlPattern = `/courts/${courtSlug}/general-info`;
    return this.page.waitForResponse(
      response =>
        response.url().includes(updateUrlPattern) &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
      options
    );
  }

  /**
   * Waits for the General Info update PUT request to complete *with an error* (non-200).
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponseWithError(courtSlug, options = { timeout: 15000 }) {
    const updateUrlPattern = `/courts/${courtSlug}/general-info`;
    return this.page.waitForResponse(
      response =>
        response.url().includes(updateUrlPattern) &&
        response.request().method() === 'PUT' &&
        response.status() !== 200, // Expecting non-200 status
      options
    );
  }

  /**
   * Waits for the success confirmation panel to appear and verifies its title.
   * @param {string} expectedMessage - The expected text content of the success message title.
   * @param {object} [options={ timeout: 10000 }] - Options like timeout.
   */
  async waitForUpdateMessage(expectedMessage, options = { timeout: 10000 }) {
    const messageLocator = this.page.locator(this.successMessageTitle);
    await expect(this.page.locator(this.successMessageContainer)).toBeVisible(options);
    await expect(messageLocator).toContainText(expectedMessage, { timeout: options.timeout });
    await expect(messageLocator).toBeVisible(options);
  }

  /**
   * Waits for the error summary panel to be visible.
   * @param {object} [options={ timeout: 5000 }] - Options like timeout.
   */
  async waitForErrorSummary(options = { timeout: 5000 }) {
    await expect(this.page.locator(this.errorSummary)).toBeVisible(options);
    await expect(this.page.locator(this.errorSummaryTitle)).toBeVisible(options);
  }

  /**
   * Gets all error messages (links text) from the visible error summary list.
   * @returns {Promise<string[]>} An array of trimmed error message strings.
   */
  async getErrorSummaryMessages() {
    await this.waitForErrorSummary();
    const items = this.page.locator(this.errorSummaryItems);
    await items.first().waitFor({ state: 'visible', timeout: 3000 });
    const texts = await items.allTextContents();
    return texts.map(text => text.trim()).filter(Boolean);
  }

  /**
   * Checks if the visible error summary list contains exactly the expected error messages (order-independent).
   * @param {string[]} expectedErrors - An array of expected error message strings.
   */
  async checkErrorSummaryExact(expectedErrors) {
    await this.waitForErrorSummary();
    const actualErrors = await this.getErrorSummaryMessages();
    expect(actualErrors.sort()).toEqual(expectedErrors.sort());
  }

  /**
   * Checks if the visible error summary list contains the specified error message text (from the link).
   * @param {string} expectedError - The expected error message string.
   */
  async checkErrorSummaryContains(expectedError) {
    await this.waitForErrorSummary();
    const actualErrors = await this.getErrorSummaryMessages();
    expect(actualErrors).toContain(expectedError);
  }

  /**
   * Gets the field-level error message associated with the court name input.
   * @returns {Promise<string>} The trimmed error message text.
   */
  async getNameFieldError() {
    const errorLocator = this.page.locator(this.courtNameFieldError);
    await expect(errorLocator).toBeVisible({ timeout: 5000 });
    return (await errorLocator.textContent()).trim();
  }
}

module.exports = { SuperAdminGeneralInfoPage };
