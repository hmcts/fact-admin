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
    await this.page.click(this.applicationProgressionLink, { force: true });
    // Wait for a *specific* element INSIDE the visible tab content.
    await this.page.waitForSelector('#application-progression button[name="addNewUpdate"]', { state: 'visible', timeout: 15000 });
  }

  async removeAllApplicationTypesAndSave() {
    // Use a while loop and continuously check for delete buttons.
    while (true) {
      const deleteButton = await this.page.$('#application-progression button[name="deleteUpdate"]');
      if (!deleteButton) {
        break; // No more delete buttons, exit the loop
      }

      await deleteButton.evaluate(button => {
        const fieldset = button.closest('fieldset');
        if (fieldset) {
          fieldset.remove(); // Remove the fieldset directly from the DOM.
        }
      });
      // Short wait after removing
      await this.page.waitForTimeout(250);
    }
    const saveButton = await this.page.locator(`${this.applicationProgressionSection} button[name="saveUpdate"]`);
    await saveButton.click();
    //Wait for page update and specific message
    await this.page.waitForFunction(() => {
        const selector = '#applicationProgressionContent > div > h1';
        const element = document.querySelector(selector)
        return element && element.textContent.includes('Application Progressions updated')
      },
      { timeout: 20000 }
    );
  }

  async getFieldsetCount() {
    return await this.page.evaluate(() => {
      return document.querySelectorAll('#applicationProgressionTab fieldset').length;
    });
  }

  async enterType(text) {
    await this.page.locator('#applicationProgressionTab input[name$="[type]"]:visible').last().fill(text);
  }

  async enterEmail(email) {
    await this.page.locator('#applicationProgressionTab input[name$="[email]"]:visible').last().fill(email);
  }
  async enterWelshType(text) {
    await this.page.locator('#applicationProgressionTab input[name$="[type_cy]"]:visible').last().fill(text);
  }

  async enterExternalLink(link) {
    await this.page.locator('#applicationProgressionTab input[name$="[external_link]"]:visible').last().fill(link);
  }

  async enterExternalLinkDescription(description) {
    await this.page.locator('#applicationProgressionTab input[name$="[external_link_description]"]:visible').last().fill(description);
  }

  async enterExternalLinkWelshDescription(welshDescription) {
    await this.page.locator('#applicationProgressionTab input[name$="[external_link_description_cy]"]:visible').last().fill(welshDescription);
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
    // Wait for page update and specific message
    await this.page.waitForFunction(() => {
        const selector = '#applicationProgressionContent > div > h1';
        const element = document.querySelector(selector)
        return element && element.textContent.includes('Application Progressions updated')
      },
      { timeout: 20000 }
    );
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
