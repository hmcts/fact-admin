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
    await this.page.waitForTimeout(500);
    await this.page.click(this.applicationProgressionLink);

    await this.page.waitForFunction(() => {
      return document.querySelectorAll('#applicationProgressionTab fieldset').length >= 2;
    });
  }

  async removeAllApplicationTypesAndSave() {
    // Click the "deleteUpdate" buttons first using page.evaluate
    await this.page.evaluate(() => {
      const deleteButtons = document.querySelectorAll('#application-progression button[name="deleteUpdate"][data-module="govuk-button"].govuk-button.govuk-button--secondary.deleteUpdate');
      deleteButtons.forEach((button) => {
        button.click();
      });
    });

    // Click the "clearUpdate" buttons using the same page.evaluate approach
    await this.page.evaluate(() => {
      const clearButtons = document.querySelectorAll('#application-progression button[name="clearUpdate"]');
      clearButtons.forEach((button) => {
        button.click();
      });
    });

    const saveButton = await this.page.locator(`${this.applicationProgressionSection} button[name="saveUpdate"]`);
    await saveButton.click();
  }

  async getFieldsetCount() {
    return await this.page.evaluate(() => {
      return document.querySelectorAll('#applicationProgressionTab fieldset').length;
    });
  }

  async enterType(text) {
    const numFieldsets = await this.getFieldsetCount();
    const entryFormIdx = numFieldsets - 2;

    const typeSelector = '#applicationProgressionTab input[name$="[type]"]';
    const inputs = await this.page.locator(typeSelector).all();
    await inputs[entryFormIdx].fill(text);
  }

  async enterEmail(email) {
    const numFieldsets = await this.getFieldsetCount();
    const entryFormIdx = numFieldsets - 2;

    const emailSelector = '#applicationProgressionTab input[name$="[email]"]';
    const inputs = await this.page.locator(emailSelector).all();
    await inputs[entryFormIdx].fill(email);
  }

  async enterWelshType(text) {
    // Check if the Welsh type input field exists
    const welshInputExists = await this.page.locator('#type_cy-1').count() > 0;

    if (welshInputExists) {
      await this.page.locator('#type_cy-1').fill(text);
    } else {
      console.warn('Welsh type input field not found. Skipping.');
    }
  }

  async enterExternalLink(link) {
    const numFieldsets = await this.getFieldsetCount();
    const entryFormIdx = numFieldsets - 2;

    const linkSelector = '#applicationProgressionTab input[name$="[external_link]"]';
    const inputs = await this.page.locator(linkSelector).all();
    await inputs[entryFormIdx].fill(link);
  }

  async enterExternalLinkDescription(description) {
    const numFieldsets = await this.getFieldsetCount();
    const entryFormIdx = numFieldsets - 2;

    const descriptionSelector = '#applicationProgressionTab input[name$="[external_link_description]"]';
    const inputs = await this.page.locator(descriptionSelector).all();
    await inputs[entryFormIdx].fill(description);
  }

  async enterExternalLinkWelshDescription(welshDescription) {
    const numFieldsets = await this.getFieldsetCount();
    const entryFormIdx = numFieldsets - 2;
    const welshDescriptionSelector = '#applicationProgressionTab input[name$="[external_link_description_cy]"]'; //Welsh
    const inputs = await this.page.locator(welshDescriptionSelector).all();
    await inputs[entryFormIdx].fill(welshDescription);
  }

  async clickAddNew() {
    const addNewSelector = `${this.applicationProgressionSection} button[name="addNewUpdate"]`;

    // Replicate checkElement behavior

    await this.page.mouse.move(1000, 40); // Ensure element is in viewport
    await this.page.waitForSelector(addNewSelector);



    const initialCount = await this.getFieldsetCount();


    await this.page.$eval(addNewSelector, (elem) => elem.click());


    await this.page.waitForFunction((initialCount) => {
      return document.querySelectorAll('#applicationProgressionTab fieldset').length > initialCount;
    }, initialCount);
    console.log('New fieldset added.'); // Logging
  }

  async clickSave() {
    await this.page.click(`${this.applicationProgressionSection} button[name="saveUpdate"]`);
  }

  async getUpdateMessage() {
    const selector = '#applicationProgressionContent > div > h1';
    return await this.page.textContent(selector);
  }

  async getSecondLastEmail() {
    const fieldsetSelector = '#applicationProgressionTab fieldset';
    const numEmail = await this.getFieldsetCount();
    const secondLastIndex = numEmail - 3;

    const emailSelector = `${fieldsetSelector} input[name$="[email]"]`;
    const inputs = await this.page.locator(emailSelector).all();
    return await inputs[secondLastIndex].inputValue();
  }

  async getLastEmail() {
    const fieldsetSelector = '#applicationProgressionTab fieldset';
    const numEmail = await this.getFieldsetCount();
    const lastIndex = numEmail - 2;

    const emailSelector = `${fieldsetSelector} input[name$="[email]"]`;
    const inputs = await this.page.locator(emailSelector).all();
    return await inputs[lastIndex].inputValue();
  }
}

module.exports = { EditCourtPage };
