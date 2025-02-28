// pages/general-info-page.js
const { BasePage } = require('./base-page');

class GeneralInfoPage extends BasePage {
  constructor(page) {
    super(page);
    // Selectors within the active General Info Tab.
    this.urgentNoticeIframe = '#general #urgent-notice_ifr'; // Target the iframe
    this.urgentNoticeWelshIframe = '#general #urgent-notice-welsh_ifr'; //Target welsh frame
    this.puasFlagCheckbox = '#general #access_scheme';
    this.commonPlatformCheckbox = '#general #common_platform';
    this.superAdminContentSelectors = [
      '#generalInfoTab #open',  // Potentially `#general #open`
      '#generalInfoTab #info',   // Potentially `#general #info`
      '#generalInfoTab #info_cy',  // Potentially `#general #info_cy`
    ];
    this.saveButton = '#saveGeneralInfoBtn';
    // Corrected, again.  Targets the h2 WITHIN the confirmation div.
    this.updateMessage = '#generalInfoContent > .govuk-panel--confirmation > .govuk-panel__title';
    this.errorSummary = '.govuk-error-summary__list li';
  }

  async isUrgentNoticeVisible() {
    return await this.page.isVisible(this.urgentNoticeIframe);
  }

  async isPUASFlagVisible() {
    return await this.page.isVisible(this.puasFlagCheckbox);
  }

  async isCommonPlatformCheckboxVisible() {
    return await this.page.isVisible(this.commonPlatformCheckbox);
  }

  async isSuperAdminContentVisible() {
    for (const selector of this.superAdminContentSelectors) {
      if (await this.page.isVisible(selector, { timeout: 3000 })) {
        return true;
      }
    }
    return false;
  }

  async setUrgentNotice(text) {
    const frame = await this.page.frameLocator(this.urgentNoticeIframe);
    await frame.locator('body').fill(text);
  }

  async setUrgentNoticeWelsh(text) {
    const frame = await this.page.frameLocator(this.urgentNoticeWelshIframe);
    await frame.locator('body').fill(text);
  }

  async setPUASFlag(checked) {
    const isCurrentlyChecked = await this.page.isChecked(this.puasFlagCheckbox);
    if (checked !== isCurrentlyChecked) {
      await this.page.click(this.puasFlagCheckbox); // Use click() for checkboxes
    }
  }

  async setCommonPlatformFlag(checked) {
    const isCurrentlyChecked = await this.page.isChecked(this.commonPlatformCheckbox);
    if (checked !== isCurrentlyChecked) {
      await this.page.click(this.commonPlatformCheckbox); // Use click() for checkboxes
    }
  }

  async clickSave() {
    await this.page.click(this.saveButton);
  }

  async getUpdateMessage() {
    await this.page.waitForSelector(this.updateMessage);
    return await this.page.textContent(this.updateMessage);
  }

  async getErrorSummaryMessage() {
    await this.page.waitForSelector(this.errorSummary);
    return await this.page.textContent(this.errorSummary);
  }
}

module.exports = { GeneralInfoPage };
