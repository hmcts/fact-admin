// pages/edit-court-page.js
const {BasePage} = require('./base-page');

class EditCourtPage extends BasePage {
  constructor(page) {
    super(page);
    this.generalDropdown = '.fact-tabs-title';
    this.applicationProgressionLink = '#tab_application-progression';
    this.applicationProgressionContent = '#applicationProgressionContent';
    this.applicationProgressionSection = '#application-progression';
    // CORRECTED SELECTOR: Target Add New, exclude template.
    this.addNewFieldsetSelector = '#applicationProgressionTab fieldset:has(h3:has-text("Add New Application Progression")):not(#newUpdateTemplate)';
  }

  async clickApplicationProgressionTab() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.hover(this.generalDropdown);
    console.log('Clicking Application Progression Tab');
    await this.page.click(this.applicationProgressionLink, {force: true});
    console.log('Waiting for \'Add New\' button');
    await this.page.waitForSelector('#application-progression button[name="addNewUpdate"]', {
      state: 'visible',
      timeout: 15000
    });
    console.log('Tab content loaded.');
    await this.page.waitForTimeout(500); // Keep the wait.
  }

  async removeAllApplicationTypesAndSave() {
    console.log('Entering removeAllApplicationTypesAndSave');

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const deleteButton = await this.page.$('#application-progression button[name="deleteUpdate"]');
      if (!deleteButton) {
        console.log('No more delete buttons found. Exiting loop.');
        break;
      }

      await deleteButton.evaluate(button => {
        const fieldset = button.closest('fieldset');
        if (fieldset) {
          fieldset.remove();
        }
      });
      console.log('Clicked delete and removed fieldset.');
      await this.page.waitForTimeout(250); // Short timeout
    }
    const saveButton = await this.page.locator(`${this.applicationProgressionSection} button[name="saveUpdate"]`);
    await saveButton.click();
    await this.page.waitForFunction(() => {
      const selector = '#applicationProgressionContent > div > h1';
      const element = document.querySelector(selector);
      return element && element.textContent.includes('Application Progressions updated');
    },
    {timeout: 20000}
    );
    console.log('Exiting removeAllApplicationTypesAndSave');
  }

  async getFieldsetCount() {
    return await this.page.locator('#applicationProgressionTab fieldset:not(#newUpdateTemplate)').count();
  }

  // Helper method to get the *last* "Add New" fieldset.
  async getLastAddNewFieldset() {
    return this.page.locator(this.addNewFieldsetSelector).last();
  }

  // Use locator().fill() directly, with timeout option, and improved ID selector
  async enterType(text) {
    const fieldset = await this.getLastAddNewFieldset();
    const locator = fieldset.locator('input[name*="[type]"][id^="type-"]');
    await locator.fill(text, {timeout: 5000});
  }

  async enterEmail(email) {
    const fieldset = await this.getLastAddNewFieldset();
    const locator = fieldset.locator('input[name*="[email]"][id^="email-"]');
    await locator.fill(email, {timeout: 5000});
  }

  async enterWelshType(text) {
    const fieldset = await this.getLastAddNewFieldset();
    const locator = fieldset.locator('input[name*="[type_cy]"][id^="type_cy-"]');

    // Check if the element exists before attempting to fill it.
    if (await locator.count() > 0) {
      await locator.fill(text, {timeout: 5000});
    } else {
      console.log('Welsh Type field not present, skipping.');
    }
  }

  async enterExternalLink(link) {
    const fieldset = await this.getLastAddNewFieldset();
    const locator = fieldset.locator('input[name*="[external_link]"][id^="external_link-"]');
    await locator.fill(link, {timeout: 5000});
  }

  async enterExternalLinkDescription(description) {
    const fieldset = await this.getLastAddNewFieldset();
    const locator = fieldset.locator('input[name*="[external_link_description]"][id^="external_link_description-"]');
    await locator.fill(description, {timeout: 5000});
  }

  async enterExternalLinkWelshDescription(welshDescription) {
    const fieldset = await this.getLastAddNewFieldset();
    const locator = fieldset.locator('input[name*="[external_link_description_cy]"][id^="external_link_description_cy-"]');
    await locator.fill(welshDescription, {timeout: 5000});
  }

  async clickAddNew() {
    const addNewSelector = `${this.applicationProgressionSection} button[name="addNewUpdate"]`;
    await this.page.waitForSelector(addNewSelector);
    await this.page.$eval(addNewSelector, (elem) => elem.click());
    await this.page.waitForTimeout(500); // Keep this.
  }

  async clickSave() {
    const saveButtonSelector = `${this.applicationProgressionSection} button[name="saveUpdate"]`;
    await this.page.waitForSelector(saveButtonSelector, {state: 'visible'});
    await this.page.click(saveButtonSelector);
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

module.exports = {EditCourtPage};
