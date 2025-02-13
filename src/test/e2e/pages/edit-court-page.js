// edit-court-page.js
const { BasePage } = require('./base-page');

class EditCourtPage extends BasePage {
  constructor(page) {
    super(page);
    this.generalDropdown = '.fact-tabs-title';
    this.applicationProgressionLink = '#tab_application-progression';
    this.applicationProgressionContent = '#applicationProgressionContent';
    this.applicationProgressionSection = '#application-progression';
  }

  async clickApplicationProgressionTab() {
    await this.page.waitForLoadState('networkidle');
    await this.page.hover(this.generalDropdown);
    await this.page.waitForTimeout(500); // Keep this for stability
    await this.page.click(this.applicationProgressionLink);
    await this.page.waitForSelector('#applicationProgressionTab fieldset'); // Wait for at least one fieldset
  }

  async removeAllApplicationTypesAndSave() {
    // Get all "deleteUpdate" buttons *before* clicking any.
    const deleteButtons = await this.page.$$('#application-progression button[name="deleteUpdate"]');

    // Iterate and wait for each element to be *detached* from the DOM.
    for (const button of deleteButtons) {
      const fieldset = await button.evaluateHandle(el => el.closest('fieldset')); // Get the parent fieldset
      await button.click();
      await fieldset.waitForElementState('hidden'); // Wait for the fieldset to be detached/hidden
    }
    const saveButton = await this.page.locator(`${this.applicationProgressionSection} button[name="saveUpdate"]`);
    await saveButton.click();
    //Wait for page update
    const selector = '#applicationProgressionContent > div > h1';
    await this.page.waitForSelector(selector, { timeout: 20000 });
  }

  async getFieldsetCount() {
    return await this.page.evaluate(() => {
      return document.querySelectorAll('#applicationProgressionTab fieldset').length;
    });
  }

  async enterType(text) {
    await this.page.locator('#applicationProgressionTab input[type="text"][name*="[type]"]:visible:last-of-type').fill(text);
  }

  async enterEmail(email) {
    await this.page.locator('#applicationProgressionTab input[type="text"][name*="[email]"]:visible:last-of-type').fill(email);
  }
  async enterWelshType(text) {
    await this.page.locator('#applicationProgressionTab input[type="text"][name*="[type_cy]"]:visible:last-of-type').fill(text);
  }

  async enterExternalLink(link) {
    await this.page.locator('#applicationProgressionTab input[type="text"][name*="[external_link]"]:visible:last-of-type').fill(link);
  }

  async enterExternalLinkDescription(description) {
    await this.page.locator('#applicationProgressionTab input[type="text"][name*="[external_link_description]"]:visible:last-of-type').fill(description);
  }

  async enterExternalLinkWelshDescription(welshDescription) {
    await this.page.locator('#applicationProgressionTab input[type="text"][name*="[external_link_description_cy]"]:visible:last-of-type').fill(welshDescription);
  }

  async clickAddNew() {
    const addNewSelector = `${this.applicationProgressionSection} button[name="addNewUpdate"]`;
    await this.page.waitForSelector(addNewSelector);
    await this.page.$eval(addNewSelector, (elem) => elem.click());
  }

  async clickSave() {
    const saveButtonSelector = `${this.applicationProgressionSection} button[name="saveUpdate"]`;
    await this.page.waitForSelector(saveButtonSelector, { state: 'visible' });
    await this.page.click(saveButtonSelector);
    //Wait for page update
    const selector = '#applicationProgressionContent > div > h1';
    await this.page.waitForSelector(selector, { timeout: 20000 });
  }

  async getUpdateMessage() {
    const selector = '#applicationProgressionContent > div > h1';
    await this.page.waitForSelector(selector);
    return await this.page.textContent(selector);
  }

  async getErrorSummaryMessage() {
    const selector = '.govuk-error-summary__list li';
    await this.page.waitForSelector(selector);
    return await this.page.textContent(selector);
  }
}

module.exports = { EditCourtPage };
