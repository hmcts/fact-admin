const {BasePage} = require('./base-page');

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
    console.log('Clicking Application Progression Tab');
    await this.page.click(this.applicationProgressionLink, {force: true});
    console.log('Waiting for \'Add New\' button');
    // Wait for a *specific* element INSIDE the visible tab content.
    await this.page.waitForSelector('#application-progression button[name="addNewUpdate"]', {
      state: 'visible',
      timeout: 15000
    });
    console.log('Tab content loaded.');
  }

  async removeAllApplicationTypesAndSave() {
    console.log('Entering removeAllApplicationTypesAndSave');

    // eslint-disable-next-line no-constant-condition
    while (true) {
      const deleteButton = await this.page.$('#application-progression button[name="deleteUpdate"]');
      if (!deleteButton) {
        console.log('No more delete buttons found. Exiting loop.');
        break; // No more delete buttons, exit the loop
      }

      // Instead of relying on IDs, using evaluate to remove the *entire fieldset*
      // that contains the button.  This is MUCH more reliable.
      await deleteButton.evaluate(button => {
        const fieldset = button.closest('fieldset');
        if (fieldset) {
          fieldset.remove(); // Remove the fieldset directly from the DOM.
        }
      });
      console.log('Clicked delete and removed fieldset.');

      await this.page.waitForTimeout(250); // Short timeout
    }
    const saveButton = await this.page.locator(`${this.applicationProgressionSection} button[name="saveUpdate"]`);
    await saveButton.click();
    //Wait for page update and specific message
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
    await this.page.waitForSelector(saveButtonSelector, {state: 'visible'});
    await this.page.click(saveButtonSelector);
    // Wait for page update and specific message
    await this.page.waitForFunction(() => {
      const selector = '#applicationProgressionContent > div > h1';
      const element = document.querySelector(selector);
      return element && element.textContent.includes('Application Progressions updated');
    },
    {timeout: 20000}
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

module.exports = {EditCourtPage};
