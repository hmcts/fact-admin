// pages/phone-numbers-page.js
const { expect } = require('@playwright/test');

class PhoneNumbersPage {
  constructor(page) {
    this.page = page;
    this.phoneNumbersTab = '#tab_phone-numbers';
    this.phoneNumbersContent = '#phoneNumbersTab'; // Main container for the tab content
    this.addPhoneNumBtn = '#phoneNumbersTab button[name="addPhoneNumber"]';
    this.savePhoneNumBtn = '#phoneNumbersTab button[name="savePhoneNumbers"]';
    this.visibleFieldsetLocatorString = `${this.phoneNumbersContent} fieldset:visible`;
    this.dataFieldsetLocatorString = `${this.phoneNumbersContent} fieldset:visible:not(#newPhoneNumberTemplate):has(button[aria-label^="remove phone number "])`;
    this.removeButtonLocatorString = `${this.phoneNumbersContent} button[aria-label^="remove phone number "]`;
    this.clearButtonInLastVisibleFieldset = `${this.visibleFieldsetLocatorString}:last-of-type button[aria-label^="clear phone number "]`;
 }

  async clickPhoneNumbersTab() {
    await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    await this.page.locator('#nav').hover();
    await this.page.click(this.phoneNumbersTab);
    await this.page.locator(this.phoneNumbersContent).waitFor({ state: 'visible', timeout: 15000 });
    await this.page.locator(this.savePhoneNumBtn).waitFor({ state: 'visible', timeout: 10000 });
  }

  async removeAllPhoneNumbersAndSave() {
    const removeButtonLocator = this.page.locator(this.removeButtonLocatorString);
    console.log(`Checking for existing remove buttons ('${this.removeButtonLocatorString}')...`);

    while (await removeButtonLocator.count() > 0) {
      const currentCount = await removeButtonLocator.count();
      console.log(`Remove buttons remaining: ${currentCount}. Clicking the first one.`);
      try {
        await removeButtonLocator.first().click({ timeout: 5000 });
        console.log('"Remove" button clicked.');
        console.log('   Waiting for remove button count to decrease...');
        await expect(removeButtonLocator).toHaveCount(currentCount - 1, { timeout: 7000 });
        console.log('   Remove button count decreased.');
      } catch (error) {
        console.error(`Error clicking remove button or waiting for count decrease: ${error}. Stopping removal loop.`);
        const countOnError = await removeButtonLocator.count();
        console.error(`   Remove button count at time of error: ${countOnError}`);
        break;
      }
    }
    const finalCount = await removeButtonLocator.count();
    console.log(`Finished removing phone numbers via buttons. Final button count: ${finalCount}.`);

    console.log('Checking for "Clear" phone number button in the last visible fieldset (the Add New form)...');
    const clearButtonLocator = this.page.locator(this.clearButtonInLastVisibleFieldset);

    const lastVisibleFieldset = this.page.locator(this.visibleFieldsetLocatorString).last();
    const numberInLastForm = lastVisibleFieldset.locator('input[name$="[number]"]');

    if (await clearButtonLocator.isVisible({timeout: 2000})) {
      const descriptionInLastForm = lastVisibleFieldset.locator('select[name$="[type_id]"]');
      const explanationInLastForm = lastVisibleFieldset.locator('input[name$="[explanation]"]');
      const explanationCyInLastForm = lastVisibleFieldset.locator('input[name$="[explanation_cy]"]');

      const descValue = await descriptionInLastForm.isVisible({timeout:1000}) ? await descriptionInLastForm.inputValue() : "";
      const numValue = await numberInLastForm.isVisible({timeout:1000}) ? await numberInLastForm.inputValue() : "";
      const expValue = await explanationInLastForm.isVisible({timeout:1000}) ? await explanationInLastForm.inputValue() : "";
      const expCyValue = await explanationCyInLastForm.isVisible({timeout:1000}) ? await explanationCyInLastForm.inputValue() : "";

      if (descValue !== "" || numValue !== "" || expValue !== "" || expCyValue !== "") {
        console.log(`Found "Clear" button and Add New form has data. Clicking "Clear"...`);
        try {
            await clearButtonLocator.click({ timeout: 3000 });
            console.log('Clicked clear button.');
        } catch (error) {
            console.error(`Error clicking clear button: ${error}.`);
        }
      } else {
        console.log('"Clear" button found, but Add New form appears empty. Skipping clear.');
      }
    } else {
      console.log('No "Clear" phone number button found in the last visible fieldset, or it was not visible.');
    }

    console.log('Proceeding to save changes after cleanup attempt.');
    await this.page.locator(this.savePhoneNumBtn).click();
    await this.page.locator('.govuk-panel--confirmation').waitFor({ state: 'visible', timeout: 20000});
    await this.page.waitForLoadState('networkidle', { timeout: 20000 });
    console.log('Cleanup save completed.');
  }

  async _selectOptionRobustly(selectElementLocator, optionToSelect) {
    await selectElementLocator.waitFor({ state: 'visible', timeout: 7000 });
    await selectElementLocator.locator('option').first().waitFor({ state: 'attached', timeout: 7000 });

    if (optionToSelect.label) {
      console.log(`   Attempting to select option by label: "${optionToSelect.label}"`);
      // Try to click the option directly
      const optionElement = selectElementLocator.locator(`option:text-is("${optionToSelect.label}")`);
      if (await optionElement.isVisible({timeout: 3000})){ // Check if the specific option is visible
        await optionElement.click(); // Click the option element
        console.log(`   Clicked option with label: "${optionToSelect.label}"`);
         // Verify selection by checking the select element's value
        await expect(selectElementLocator).toHaveValue(
            await optionElement.getAttribute('value'),
            { timeout: 5000 }
        );
        console.log(`   Verified select value after clicking option by label.`);
      } else {
        console.warn(`   Option with label "${optionToSelect.label}" not found or not visible to click. Falling back to selectOption.`);
        await selectElementLocator.selectOption(optionToSelect); // Fallback to Playwright's selectOption
        await expect(selectElementLocator).toHaveValue(
            await selectElementLocator.locator(`option:text-is("${optionToSelect.label}")`).getAttribute('value'),
            { timeout: 5000 }
        );
      }
    } else if (optionToSelect.index !== undefined) {
      console.log(`   Attempting to select option by index: ${optionToSelect.index}`);
      await selectElementLocator.selectOption(optionToSelect);
      console.log(`   Selected option by index ${optionToSelect.index}. Value verification skipped for index selection.`);
    }
    await this.page.waitForTimeout(200); // Increased pause slightly
  }

  async addPhoneNumberToFirstFieldset(descriptionLabelOrIndex, number, explanation, explanationCy) {
    console.log(`Adding phone number via the initial "Add New" form (label/index: ${descriptionLabelOrIndex})...`);
    const addNewFormLocator = this.page.locator(this.visibleFieldsetLocatorString).first();
    await addNewFormLocator.waitFor({ state: 'visible', timeout: 5000 });

    const selectElement = addNewFormLocator.locator('select[name$="[type_id]"]');
    const optionToSelect = typeof descriptionLabelOrIndex === 'string' ? { label: descriptionLabelOrIndex } : { index: descriptionLabelOrIndex };
    await this._selectOptionRobustly(selectElement, optionToSelect);

    const numberInput = addNewFormLocator.locator('input[name$="[number]"]');
    await numberInput.waitFor({ state: 'visible', timeout: 3000 });
    await numberInput.fill(number);

    const explanationInput = addNewFormLocator.locator('input[name$="[explanation]"]');
    await explanationInput.waitFor({ state: 'visible', timeout: 3000 });
    await explanationInput.fill(explanation);

    const explanationCyInput = addNewFormLocator.locator('input[name$="[explanation_cy]"]');
    await explanationCyInput.waitFor({ state: 'visible', timeout: 3000 });
    await explanationCyInput.fill(explanationCy);

    console.log('Filled details for the initial "Add New" form.');
  }

  async fillAddNewPhoneNumberForm(descriptionLabelOrIndex, number, explanation, explanationCy) {
    console.log(`Filling 'Add New' form details (label/index: ${descriptionLabelOrIndex})...`);
    const visibleFieldsetsLocator = this.page.locator(this.visibleFieldsetLocatorString);
    const addNewFormLocator = visibleFieldsetsLocator.last();
    console.log(`Targeting the last visible fieldset as the 'Add New' form.`);

    const selectElement = addNewFormLocator.locator('select[name$="[type_id]"]');
     try {
         await expect(selectElement).toHaveValue('', { timeout: 5000 });
         console.log('Add New form select appears reset (value is empty).');
     } catch (e) {
         console.warn('Add New form select did not have empty value within timeout, proceeding anyway...');
     }

    const optionToSelect = typeof descriptionLabelOrIndex === 'string' ? { label: descriptionLabelOrIndex } : { index: descriptionLabelOrIndex };
    await this._selectOptionRobustly(selectElement, optionToSelect);

    const numberInput = addNewFormLocator.locator('input[name$="[number]"]');
    await numberInput.waitFor({ state: 'visible', timeout: 3000 });
    await numberInput.fill(number);

    const explanationInput = addNewFormLocator.locator('input[name$="[explanation]"]');
    await explanationInput.waitFor({ state: 'visible', timeout: 3000 });
    await explanationInput.fill(explanation);

    const explanationCyInput = addNewFormLocator.locator('input[name$="[explanation_cy]"]');
    await explanationCyInput.waitFor({ state: 'visible', timeout: 3000 });
    await explanationCyInput.fill(explanationCy);

    console.log(`Filled details for the current 'Add New' form.`);
  }


  async clickSave() {
    await this.page.locator(this.savePhoneNumBtn).click();
    await this.page.waitForSelector(`${this.phoneNumbersContent} .govuk-panel--confirmation, ${this.phoneNumbersContent} .govuk-error-summary`, { state: 'visible', timeout: 20000 });
    await this.page.waitForLoadState('networkidle', { timeout: 20000 });
  }


  async getUpdateMessage() {
    const successPanelTitle = this.page.locator('.govuk-panel--confirmation .govuk-panel__title');
    await successPanelTitle.waitFor({state: 'visible', timeout: 5000});
    return await successPanelTitle.innerText();
  }

  async getPhoneNumbers() {
    console.log('Fetching current phone numbers (reading data rows)...');
    const phoneNumbers = [];
    const dataFieldsetLocator = this.page.locator(this.dataFieldsetLocatorString);

    try {
        await dataFieldsetLocator.first().waitFor({ state: 'visible', timeout: 5000 });
    } catch (e) {
        console.log('No data fieldsets (matching refined selector) found or timed out waiting for the first one.');
    }

    const count = await dataFieldsetLocator.count();
    console.log(`Found ${count} visible 'data' phone number fieldsets (using refined selector: :has remove button).`);

    if (count === 0) {
        return phoneNumbers;
    }

    for (let i = 0; i < count; i++) {
      console.log(`   Processing data fieldset index ${i}...`);
      const fieldset = dataFieldsetLocator.nth(i);

      const selectElement = fieldset.locator('select[name$="[type_id]"]');
      await selectElement.waitFor({state: 'visible', timeout: 3000});
      const type = await selectElement.evaluate(select => select.options[select.selectedIndex].text);

      const numberInput = fieldset.locator('input[name$="[number]"]');
      await numberInput.waitFor({state:'visible', timeout: 3000});
      const number = await numberInput.inputValue();

      const explanationInput = fieldset.locator('input[name$="[explanation]"]');
      await explanationInput.waitFor({state:'visible', timeout: 3000});
      const explanation = await explanationInput.inputValue();

      const explanationCyInput = fieldset.locator('input[name$="[explanation_cy]"]');
      await explanationCyInput.waitFor({state:'visible', timeout: 3000});
      const explanationCy = await explanationCyInput.inputValue();

      if (type === '' && number === '' && explanation === '' && explanationCy === '') {
          console.warn(`      WARNING: Read blank data for fieldset index ${i} despite using refined selector.`);
      } else {
        console.log(`      Data found: type=${type}, number=${number}, exp=${explanation}, exp_cy=${explanationCy}`);
      }

      phoneNumbers.push({ type, number, explanation, explanationCy });
    }
    console.log('Finished fetching phone numbers:', JSON.stringify(phoneNumbers, null, 2));
    return phoneNumbers;
  }

  async movePhoneNumberUp(index) {
    const fieldset = this.page.locator(this.dataFieldsetLocatorString).nth(index);
    await fieldset.locator('button[name$="[moveUp]"]').click();
    await this.page.waitForTimeout(500);
  }

  async movePhoneNumberDown(index) {
    const fieldset = this.page.locator(this.dataFieldsetLocatorString).nth(index);
    await fieldset.locator('button[name$="[moveDown]"]').click();
    await this.page.waitForTimeout(500);
  }

  async checkTopLevelErrors(expectedErrorMessage) {
    const errorSummarySelector = this.page.locator('.govuk-error-summary');
    await errorSummarySelector.waitFor({ state: 'visible', timeout: 7000 });
    await expect(errorSummarySelector).toContainText(expectedErrorMessage);
  }

  _normalizeText(text) {
    if (typeof text !== 'string') return '';
    return text
      .replace(/\n+/g, ' ')
      .replace(/\s\s+/g, ' ')
      .trim()
      .replace(/^Error:\s*/, '')
      .trim();
  }

  async checkFieldLevelErrors(expectedErrorMessages) {
    const errorMessages = this.page.locator(`${this.phoneNumbersContent} .govuk-error-message`);
    const count = await errorMessages.count();
    console.log(`Found ${count} field-level error message elements.`);

    if (expectedErrorMessages.length > 0 && count > 0) {
        await errorMessages.first().waitFor({ state: 'visible', timeout: 5000 });
    } else if (expectedErrorMessages.length > 0 && count === 0) {
        console.warn('Expected field-level errors but found no .govuk-error-message elements.');
    }

    const visibleErrorTexts = await errorMessages.allInnerTexts();
    console.log('Raw visible field-level error texts:', JSON.stringify(visibleErrorTexts));

    const normalizedVisibleErrorTexts = visibleErrorTexts.map(text => this._normalizeText(text));
    console.log('Normalized visible field-level error texts:', JSON.stringify(normalizedVisibleErrorTexts));


    for (const expectedError of expectedErrorMessages) {
        const normalizedExpectedError = this._normalizeText(expectedError);
        console.log(`   Comparing normalized expected: "${normalizedExpectedError}"`);

        const found = normalizedVisibleErrorTexts.some(normVisibleText => {
          console.log(`      with normalized actual: "${normVisibleText}"`);
          return normVisibleText.includes(normalizedExpectedError);
        });

        expect(found, `Expected field-level error message containing "${normalizedExpectedError}" not found in actual messages: [${normalizedVisibleErrorTexts.join(' |')}]`).toBe(true);
    }
  }
}

module.exports = { PhoneNumbersPage };
