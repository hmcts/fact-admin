import {Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I hover over emails nav element', async () => {
  const selector = '#nav';
  await I.isElementVisible(selector, 3000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.hover(selector);
});

Then('I click the Emails tab', async () => {
  const selector = '#tab_emails';
  await I.isElementVisible(selector, 3000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I remove all existing email entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#emailsTab', 'deleteEmail', 'saveEmail');
});

When('I click on Add new Email', async () => {
  await FunctionalTestHelpers.clickButton('#emailsTab', 'addEmail');
});

When('I add Description from the dropdown at index {int} and Address {string} and Explanation {string} and Welsh Explanation {string}',
  async (descriptionIndex: number, email: string, explanation: string, explanationCy: string) => {
    const numFieldsets = await I.countElement('#emailsTab fieldset');
    const entryFormIdx = numFieldsets - 2; // we deduct one for zero-based indexing and the hidden template fieldset

    // The description select element contains an empty entry in the 'add new' form only. We add 1 here
    // to keep the indexing the same as the select elements in the existing email addresses, where the
    // select element doesn't contain an empty entry.
    descriptionIndex += 1;

    const descriptionSelectSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
    const addressInputSelector = '#emailsTab input[name$="[address]"]';
    const expInputSelector = '#emailsTab input[name$="[explanation]"]';
    const expCyInputSelector = '#emailsTab input[name$="[explanationCy]"]';

    await I.isElementVisible(descriptionSelectSelector, 3000);
    await I.isElementVisible(addressInputSelector, 3000);
    await I.isElementVisible(expInputSelector, 3000);
    await I.isElementVisible(expCyInputSelector, 3000);

    await I.setElementValueAtIndex(descriptionSelectSelector, entryFormIdx, descriptionIndex, 'select');
    await I.setElementValueAtIndex(addressInputSelector, entryFormIdx, email, 'input');
    await I.setElementValueAtIndex(expInputSelector, entryFormIdx, explanation, 'input');
    await I.setElementValueAtIndex(expCyInputSelector, entryFormIdx, explanationCy, 'input');
  });

When('I click save button', async () => {
  await FunctionalTestHelpers.clickButton('#emailsTab', 'saveEmail');
});

Then('a green update message showing email updated is displayed', async () => {
  const selector = 'div[class=\'govuk-panel govuk-panel--confirmation\']';
  await I.isElementVisible(selector, 3000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
});

Then('the second last email address is displayed with description at index {int} Address {string} Explanation {string} and Welsh Explanation {string}', async (id: number, email: string, explanation: string, explanationCy: string) => {
  const numFieldsets = await I.countElement('#emailsTab fieldset');
  const secondLastEmailIdx = numFieldsets - 4; // we deduct one for zero-based indexing, the hidden template, the 'add new' form and the last entry

  const descriptionSelectSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
  const addressInputSelector = '#emailsTab input[name$="[address]"]';
  const expInputSelector = '#emailsTab input[name$="[explanation]"]';
  const expCyInputSelector = '#emailsTab input[name$="[explanationCy]"]';

  await I.isElementVisible(descriptionSelectSelector, 3000);
  await I.isElementVisible(addressInputSelector, 3000);
  await I.isElementVisible(expInputSelector, 3000);
  await I.isElementVisible(expCyInputSelector, 3000);

  expect(await I.getSelectedIndexAtIndex(descriptionSelectSelector, secondLastEmailIdx)).equal(id);
  expect(await I.getElementValueAtIndex(addressInputSelector, secondLastEmailIdx)).equal(email);
  expect(await I.getElementValueAtIndex(expInputSelector, secondLastEmailIdx)).equal(explanation);
  expect(await I.getElementValueAtIndex(expCyInputSelector, secondLastEmailIdx)).equal(explanationCy);
});

Then('the last email address is displayed with description at index {int} Address {string} Explanation {string} and Welsh Explanation {string}', async (id: number, email: string, explanation: string, explanationCy: string) => {
  const numFieldsets = await I.countElement('#emailsTab fieldset');
  const secondLastEmailIdx = numFieldsets - 3; // we deduct one for zero-based indexing, the hidden template and the 'add new' form

  const descriptionSelectSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
  const addressInputSelector = '#emailsTab input[name$="[address]"]';
  const expInputSelector = '#emailsTab input[name$="[explanation]"]';
  const expCyInputSelector = '#emailsTab input[name$="[explanationCy]"]';

  expect(await I.getSelectedIndexAtIndex(descriptionSelectSelector, secondLastEmailIdx)).equal(id);
  expect(await I.getElementValueAtIndex(addressInputSelector, secondLastEmailIdx)).equal(email);
  expect(await I.getElementValueAtIndex(expInputSelector, secondLastEmailIdx)).equal(explanation);
  expect(await I.getElementValueAtIndex(expCyInputSelector, secondLastEmailIdx)).equal(explanationCy);
});

When('I leave adminId blank', async () => {
  const numFieldsets = await I.countElement('#emailsTab fieldset');
  const entryFormIdx = numFieldsets - 2; // we deduct one each for zero-based indexing and the hidden template fieldset
  const descriptionSelectSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
  await I.setElementValueAtIndex(descriptionSelectSelector, entryFormIdx, 0, 'select');
});

When('I add address {string}', async (address: string) => {
  const numFieldsets = await I.countElement('#emailsTab fieldset');
  const entryFormIdx = numFieldsets - 2; // we deduct one each for zero-based indexing and the hidden template fieldset
  const addressSelector = '#emailsTab input[name$="[address]"]';
  await I.setElementValueAtIndex(addressSelector, entryFormIdx, address);
});

Then('A red error message display', async () => {
  const elementExist = await I.checkElement('#error-summary-title');
  expect(elementExist).equal(true);
});

When('I click the remove button below a email section', async () => {
  const numEmailAdd = await I.countElement('#emailsTab fieldset');
  await FunctionalTestHelpers.clickButton('#emailsTab', 'deleteEmail');
  const updatedEmailAdd = await I.countElement('#emailsTab fieldset');
  expect(numEmailAdd - updatedEmailAdd).equal(1);
});

When('I add Description from the dropdown {int} and wrong Email-Address {string}',
  async (id: number, email: string) => {
    const numFieldsets = await I.countElement('#emailsTab fieldset');
    const entryFormIdx = numFieldsets - 2; // we deduct one for zero-based indexing and the hidden template fieldset

    const descriptionSelectSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
    const addressInputSelector = '#emailsTab input[name$="[address]"]';

    await I.setElementValueAtIndex(descriptionSelectSelector, entryFormIdx, id, 'select');
    await I.setElementValueAtIndex(addressInputSelector, entryFormIdx, email, 'input');
  });

Then('An error message is displayed with the text {string}', async (msg: string) => {
  expect(await I.checkElement('#error-summary-title')).equal(true);
  expect(await I.checkElement('#emailsContent > div > div > ul > li')).equal(true);
  expect(
    await I.getElementText(                                                // Get Text for the element below
      await I.getElement('#emailsContent > div > div > ul > li'))) // Get the element for the error
    .equal(msg);
});


let entryFormInedx = 0;

When('I add Description from the dropdown {int}', async (description: number) => {
  const numFieldsets = await I.countElement('#emailsTab fieldset');
  const descriptionSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
  if (numFieldsets > 0) {
    entryFormInedx = numFieldsets - 2;
  }
  await I.setElementValueAtIndex(descriptionSelector, entryFormInedx, description, 'select');
});

When('I enter email address {string}', async (address: string) => {
  const emailAddressSelector = '#emailsTab input[name$="[address]"]';
  await I.setElementValueAtIndex(emailAddressSelector, entryFormInedx, address, 'input');
});

When('I click on add another button', async () => {
  await FunctionalTestHelpers.clickButton('#emailsTab', 'addEmail');

});

When('I click on any description {int}', async (description: number) => {
  const descriptionSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
  await I.setElementValueAtIndex(descriptionSelector, entryFormInedx + 1, description, 'select');
});

When('I enter the same email address {string}', async (address: string) => {
  const emailAddressSelector = '#emailsTab input[name$="[address]"]';
  await I.setElementValueAtIndex(emailAddressSelector, entryFormInedx + 1, address, 'input');
});

When('I click Save button', async () => {
  await FunctionalTestHelpers.clickButton('#emailsTab', 'saveEmail');
});

Then('An error is displayed for email address with summary {string} and address field message {string}', async (summaryErrMsg: string, fieldErrMsg: string) => {
  const errorTitle = 'There is a problem';
  let selector = '#error-summary-title';
  expect(await I.checkElement(selector)).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#emailsContent > div > div > ul > li';
  expect(await I.checkElement(selector)).equal(true);

  const errorListElement = await I.getElement(selector);

  expect(await I.getElementText(errorListElement)).equal(summaryErrMsg);
  const numFieldsets = await I.countElement('#emailsTab fieldset');

  const fieldsetErrorIndex = numFieldsets - 1;  // The last field set is the hidden template fieldset

  selector = '#address-' + fieldsetErrorIndex + '-error';
  expect(await I.checkElement(selector)).equal(true);
  const descriptionErrorElement = await I.getElement(selector);
  expect(await I.getElementText(descriptionErrorElement)).contains(fieldErrMsg);

});


When('I click the move up button on the last entry', async () => {
  const numFieldsets = await I.countElement('#emailsTab fieldset.can-reorder');
  const lastEmailIdx = numFieldsets - 3;  // we deduct one each for zero-based indexing, the hidden template and the 'add new' form
  await I.clickElementAtIndex('#emailsTab fieldset.can-reorder button.move-up', lastEmailIdx);
});

When('I click the move down button on the second last entry', async () => {
  const numFieldsets = await I.countElement('#emailsTab fieldset.can-reorder');
  // we deduct one for zero-based indexing, the hidden template, the 'add new' form and the last email address entry
  const secondLastEmailIdx = numFieldsets - 4;
  await I.clickElementAtIndex('#emailsTab fieldset.can-reorder button.move-down', secondLastEmailIdx);
});
