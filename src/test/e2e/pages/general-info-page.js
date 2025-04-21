// src/test/e2e/pages/general-info-page.js
const { expect } = require('@playwright/test'); // Import expect for assertions within methods
const { BasePage } = require('./base-page');

class GeneralInfoPage extends BasePage {
  constructor(page) {
    super(page);
    // Main container for the General Info tab content
    this.generalInfoTabContent = '#generalInfoContent'; // More specific container

    // --- Selectors within the General Info Tab ---
    // Using '#general' prefix assumes the panel has id="general" when active
    this.urgentNoticeIframe = '#general #urgent-notice_ifr'; // Target the iframe for urgent notice
    this.urgentNoticeWelshIframe = '#general #urgent-notice-welsh_ifr'; // Target the iframe for Welsh urgent notice
    this.infoNoticeIframe = '#general #info_ifr'; // Target the iframe for general info notice
    this.infoNoticeWelshIframe = '#general #info_cy_ifr'; // Target the iframe for Welsh general info notice

    // Checkboxes
    this.openCourtCheckbox = '#general #open'; // Specific selector for the 'Open' checkbox (Super Admin)
    this.accessSchemeCheckbox = '#general #access_scheme'; // Checkbox for 'Participates in access scheme' (Super Admin/Admin) - Gherkin calls this PUAS flag
    this.commonPlatformCheckbox = '#general #common_platform'; // Checkbox for 'Common Platform' (Admin)

    // Save Button
    this.saveButton = '#saveGeneralInfoBtn';

    // Messages
    this.updateMessageContainer = `${this.generalInfoTabContent} > .govuk-panel--confirmation`;
    this.updateMessageTitle = `${this.updateMessageContainer} > .govuk-panel__title`; // Targets the h2 title within the confirmation panel
    this.errorSummaryList = `${this.generalInfoTabContent} .govuk-error-summary__list`; // Targets the list within the error summary
    this.errorSummaryListItem = `${this.errorSummaryList} li`; // Targets individual error items

    // Super Admin only content identifiers (used for visibility checks)
    // Use more specific selectors if possible, these are based on original general-info.ts
    this.superAdminContentSelectors = [
      this.openCourtCheckbox,
      this.infoNoticeIframe,      // Check for the iframe itself
      this.infoNoticeWelshIframe // Check for the iframe itself
    ];
  }

  // --- Visibility Checks ---

  /**
   * Checks if the TinyMCE iframe for Urgent Notice is visible.
   * @returns {Promise<boolean>}
   */
  async isUrgentNoticeVisible() {
    // Wait briefly for potential dynamic loading, then check visibility
    await this.page.waitForSelector(this.urgentNoticeIframe, { state: 'visible', timeout: 5000 }).catch(() => false);
    return await this.page.locator(this.urgentNoticeIframe).isVisible();
  }

  /**
   * Checks if the "Open" court checkbox is visible (Super Admin only).
   * @returns {Promise<boolean>}
   */
  async isOpenCourtCheckboxVisible() {
    // Wait briefly for potential dynamic loading, then check visibility
    await this.page.waitForSelector(this.openCourtCheckbox, { state: 'visible', timeout: 5000 }).catch(() => false);
    return await this.page.locator(this.openCourtCheckbox).isVisible();
  }

  /**
   * Checks if the "Participates in access scheme" checkbox is visible.
   * @returns {Promise<boolean>}
   */
  async isAccessSchemeCheckboxVisible() {
    // Wait briefly for potential dynamic loading, then check visibility
    await this.page.waitForSelector(this.accessSchemeCheckbox, { state: 'visible', timeout: 5000 }).catch(() => false);
    return await this.page.locator(this.accessSchemeCheckbox).isVisible();
  }

  /**
   * Checks if the "Common Platform" checkbox is visible.
   * @returns {Promise<boolean>}
   */
  async isCommonPlatformCheckboxVisible() {
    // Wait briefly for potential dynamic loading, then check visibility
    await this.page.waitForSelector(this.commonPlatformCheckbox, { state: 'visible', timeout: 5000 }).catch(() => false);
    return await this.page.locator(this.commonPlatformCheckbox).isVisible();
  }

  /**
   * Checks if any known Super Admin specific content elements are visible.
   * @returns {Promise<boolean>}
   */
  async isSuperAdminContentVisible() {
    for (const selector of this.superAdminContentSelectors) {
      // Use a short timeout for each check, as we only need one to be visible
      if (await this.page.locator(selector).isVisible({ timeout: 1500 })) {
        return true; // Found at least one super admin element
      }
    }
    return false; // None of the super admin elements were found
  }

  // --- Set Field Values ---

  /**
   * Sets the content of the Urgent Notice TinyMCE editor.
   * @param {string} text - The text content to set.
   */
  async setUrgentNotice(text) {
    await expect(this.page.locator(this.urgentNoticeIframe)).toBeVisible();
    const frame = this.page.frameLocator(this.urgentNoticeIframe);
    await frame.locator('body#tinymce').fill(text);
  }

  /**
   * Sets the content of the Welsh Urgent Notice TinyMCE editor.
   * @param {string} text - The text content to set.
   */
  async setUrgentNoticeWelsh(text) {
    await expect(this.page.locator(this.urgentNoticeWelshIframe)).toBeVisible();
    const frame = this.page.frameLocator(this.urgentNoticeWelshIframe);
    await frame.locator('body#tinymce').fill(text);
  }

  /**
   * Sets the checked state of the "Open" court checkbox (Super Admin only).
   * Clicks the checkbox only if its current state differs from the desired state.
   * @param {boolean} checked - True to check the box, false to uncheck it.
   */
  async setOpenCourtFlag(checked) {
    const checkboxLocator = this.page.locator(this.openCourtCheckbox);
    await expect(checkboxLocator).toBeVisible(); // Ensure it exists first
    const isCurrentlyChecked = await checkboxLocator.isChecked();
    if (checked !== isCurrentlyChecked) {
      await checkboxLocator.click(); // Use click() which toggles the state
    }
  }

  /**
   * Sets the checked state of the "Participates in access scheme" checkbox.
   * Clicks the checkbox only if its current state differs from the desired state.
   * @param {boolean} checked - True to check the box, false to uncheck it.
   */
  async setAccessSchemeFlag(checked) {
    const checkboxLocator = this.page.locator(this.accessSchemeCheckbox);
    await expect(checkboxLocator).toBeVisible(); // Ensure it exists first
    const isCurrentlyChecked = await checkboxLocator.isChecked();
    if (checked !== isCurrentlyChecked) {
      await checkboxLocator.click(); // Use click() which toggles the state
    }
  }

  /**
   * Sets the checked state of the "Common Platform" checkbox.
   * Clicks the checkbox only if its current state differs from the desired state.
   * @param {boolean} checked - True to check the box, false to uncheck it.
   */
  async setCommonPlatformFlag(checked) {
    const checkboxLocator = this.page.locator(this.commonPlatformCheckbox);
    await expect(checkboxLocator).toBeVisible(); // Ensure it exists first
    const isCurrentlyChecked = await checkboxLocator.isChecked();
    if (checked !== isCurrentlyChecked) {
      await checkboxLocator.click(); // Use click() which toggles the state
    }
  }

  // --- Actions ---

  /**
   * Clicks the 'Save General Information' button.
   */
  async clickSave() {
    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeEnabled(); // Ensure it's clickable
    await saveButtonLocator.click();
  }

  /**
   * Waits for the save PUT request to complete successfully (200 OK).
   * Assumes the URL pattern ends with '/general-info'.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponse(options = { timeout: 15000 }) {
    // Assuming the PUT request goes to the '/general-info' endpoint relative to the court edit URL
    return this.page.waitForResponse(
      response =>
        response.url().endsWith('/general-info') &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
      options
    );
  }

  // --- Get Messages ---

  /**
   * Gets the text content of the success update message title.
   * Waits for the success panel to be visible first.
   * @param {object} [options={ timeout: 10000 }] - Options like timeout.
   * @returns {Promise<string>} The success message text.
   */
  async getUpdateMessage(options = { timeout: 10000 }) {
    const messageLocator = this.page.locator(this.updateMessageTitle);
    // Wait for the confirmation panel container first
    await expect(this.page.locator(this.updateMessageContainer)).toBeVisible(options);
    // Then wait for the title itself and get text
    await expect(messageLocator).toBeVisible(options);
    return (await messageLocator.textContent()).trim();
  }

  /**
   * Gets the text content of the first error message in the error summary list.
   * Waits for the error summary list to be visible first.
   * @param {object} [options={ timeout: 10000 }] - Options like timeout.
   * @returns {Promise<string>} The first error message text.
   */
  async getErrorSummaryMessage(options = { timeout: 10000 }) {
    const errorItemLocator = this.page.locator(this.errorSummaryListItem).first();
    // Wait for the list container first
    await expect(this.page.locator(this.errorSummaryList)).toBeVisible(options);
    // Then wait for the first item and get text
    await expect(errorItemLocator).toBeVisible(options);
    return (await errorItemLocator.textContent()).trim();
  }
}

module.exports = { GeneralInfoPage };
