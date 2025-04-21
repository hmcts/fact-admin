// pages/phone-numbers-page.js
const { expect } = require('@playwright/test');

class PhoneNumbersPage {
  constructor(page) {
    this.page = page;
    this.phoneNumbersTab = '#tab_phone-numbers';
    this.phoneNumbersContent = '#phoneNumbersTab';
    this.addPhoneNumBtn = '#phoneNumbersTab button[name="addPhoneNumber"]';
    this.savePhoneNumBtn = '#phoneNumbersTab button[name="savePhoneNumbers"]';
  }

  async clickPhoneNumbersTab() {
    await this.page.waitForLoadState('networkidle');
    await this.page.locator('#nav').hover();
    await this.page.click(this.phoneNumbersTab);
    await this.page.locator(this.phoneNumbersContent).waitFor({ state: 'visible', timeout: 15000 });
  }

  async removeAllPhoneNumbersAndSave() {
    while (await this.page.locator('#phoneNumbersTab button[name="deletePhoneNumber"]:visible').count() > 0) {
      await this.page.locator('#phoneNumbersTab button[name="deletePhoneNumber"]:visible').first().click();
    }
    await this.clickSave();
  }

  async addPhoneNumberToFirstFieldset(descriptionIndex, number, explanation, explanationCy) {
    // Select the first fieldset using its heading text
    const fieldset = this.page.locator('#phoneNumbersTab fieldset.can-reorder:first-of-type');
    await fieldset.waitFor({ state: 'visible' });

    const selectElement = fieldset.locator('select');

    // Select the option directly using its value (no index adjustment)
    await selectElement.selectOption({ index: descriptionIndex });
    await fieldset.locator('#contactNumber-1').fill(number);
    await fieldset.locator('#contactExplanation-1').fill(explanation);
    await fieldset.locator('#contactExplanationCy-1').fill(explanationCy);
  }

  async addPhoneNumber(descriptionIndex, number, explanation, explanationCy) {
    await this.page.locator(this.addPhoneNumBtn).click();
    const fieldsets = await this.page.locator('#phoneNumbersTab fieldset.can-reorder:visible');
    const count = await fieldsets.count();
    const fieldset = fieldsets.nth(count - 1);

    await fieldset.locator('select').selectOption({ index: descriptionIndex + 1 });
    await fieldset.locator('input[type="text"]').nth(0).fill(number);
    await fieldset.locator('input[type="text"]').nth(1).fill(explanation);
    await fieldset.locator('input[type="text"]').nth(2).fill(explanationCy);
  }


  async clickSave() {
    await this.page.locator(this.savePhoneNumBtn).click();
    await this.page.waitForLoadState('networkidle');
  }

  async getUpdateMessage() {
    return await this.page.locator('.govuk-panel--confirmation .govuk-panel__title').innerText();
  }

  async getPhoneNumbers() {
    const phoneNumbers = [];
    const fieldsets = await this.page.locator('#phoneNumbersTab fieldset.can-reorder:visible');
    const count = await fieldsets.count();

    for (let i = 0; i < count; i++) {
      const fieldset = fieldsets.nth(i);
      const type = await fieldset.locator('select').evaluate(select => select.options[select.selectedIndex].text);
      const number = await fieldset.locator('input[type="text"]').nth(0).inputValue();
      const explanation = await fieldset.locator('input[type="text"]').nth(1).inputValue();
      const explanationCy = await fieldset.locator('input[type="text"]').nth(2).inputValue();
      phoneNumbers.push({ type, number, explanation, explanationCy });
    }
    return phoneNumbers;
  }

  async movePhoneNumberUp(index) {
    const fieldset = this.page.locator('#phoneNumbersTab fieldset.can-reorder:visible').nth(index);
    await fieldset.locator('button[name="moveUp"]').click();
  }

  async movePhoneNumberDown(index) {
    const fieldset = this.page.locator('#phoneNumbersTab fieldset.can-reorder:visible').nth(index);
    await fieldset.locator('button[name="moveDown"]').click();
  }

  async checkTopLevelErrors(expectedErrorMessage) {
    const errorSummarySelector = this.page.locator('.govuk-error-summary');
    await errorSummarySelector.waitFor({ state: 'visible', timeout: 5000 });

    // Use expect to assert that the error message is present
    await expect(errorSummarySelector).toContainText(expectedErrorMessage);
  }

  async checkFieldLevelErrors(expectedErrorMessages) {
    // Okay, this is a bit bonkers but I am basically trying to get around the issues with inconsistent indexing
    // by just getting all grid rows with govuk-error-message class within and then basically checking that the right
    // text is in there really.
    const errorMessages = this.page.locator('.govuk-error-message');
    const count = await errorMessages.count();
    console.log(`Number of error messages: ${count}`);

    // Find all govuk-grid-rows that contain an error message
    const errorRows = this.page.locator('.govuk-grid-row:has(.govuk-error-message)');

    // Assert that each expected error message exists within those rows
    for (const expectedError of expectedErrorMessages) { // Iterate through expected errors
      let found = false;
      for (let i = 0; i < await errorRows.count(); i++) {
        const rowText = await errorRows.nth(i).innerText();
        if (rowText.includes(expectedError)) {
          found = true;
          break;
        }
      }

      expect(found, `Expected error message not found: ${expectedError}`).toBe(true); // Improved error message
    }
  }

}

module.exports = { PhoneNumbersPage };
