import {Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I click the Emails tab', async () => {
  const selector = '#tab_emails';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the existing emails', async () => {
  const elementExist = await I.checkElement('#emailsContent');
  expect(elementExist).equal(true);
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

    await I.setElementValueAtIndex(descriptionSelectSelector, entryFormIdx, descriptionIndex, 'select');
    await I.setElementValueAtIndex(addressInputSelector, entryFormIdx, email, 'input');
    await I.setElementValueAtIndex(expInputSelector, entryFormIdx, explanation, 'input');
    await I.setElementValueAtIndex(expCyInputSelector, entryFormIdx, explanationCy, 'input');
  });

When('I click save button', async () => {
  await FunctionalTestHelpers.clickButton('#emailsTab', 'saveEmail');
});

Then('a green update message showing email updated is displayed', async () => {
  const elementExist = await I.checkElement('div[class=\'govuk-panel govuk-panel--confirmation\']');
  expect(elementExist).equal(true);
});

Then('the second last email address is displayed with description at index {int} Address {string} Explanation {string} and Welsh Explanation {string}', async (id: number, email: string, explanation: string, explanationCy: string) => {
  const numFieldsets = await I.countElement('#emailsTab fieldset');
  const secondLastEmailIdx = numFieldsets - 4; // we deduct one for zero-based indexing, the hidden template, the 'add new' form and the last entry

  const descriptionSelectSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
  const addressInputSelector = '#emailsTab input[name$="[address]"]';
  const expInputSelector = '#emailsTab input[name$="[explanation]"]';
  const expCyInputSelector = '#emailsTab input[name$="[explanationCy]"]';

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



let entryFormIdx = 0;
const descriptionSelector = '#emailsTab select[name$="[adminEmailTypeId]]"]';
const addressSelector = '#emailsTab input[name$="[address]"]';

When('I select email description {string}', async (description: string)=> {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#emailsTab', 'deleteEmail', 'saveEmail');
  const numFieldsets = await I.countElement('#emailsTab fieldset');

  if(numFieldsets>0)
  {
    entryFormIdx = numFieldsets - 2;
  }
  await I.setElementValueAtIndex(descriptionSelector, entryFormIdx, description, 'select');
});

When('I enter email address {string}', async (address: string)=>{

  await I.setElementValueAtIndex(addressSelector, entryFormIdx, 'address', 'input');
});

When('I click on add another button', async () =>{
  await FunctionalTestHelpers.clickButton('#emailsTab', 'addEmail');

});

When('I click on any description {string}', async (description: string) => {

  await I.setElementValueAtIndex(descriptionSelector, entryFormIdx, description, 'select');
});

When('I enter the same email address {string}', async (address: string) =>{

  await I.setElementValueAtIndex(addressSelector, entryFormIdx, 'address', 'input');
});

When('I click Save button', async () => {
  await FunctionalTestHelpers.clickButton('#emailsTab', 'saveEmail');
});

Then('An error is displayed for email address with summary {string} and description field message {string}', async (summaryErrMsg: string, fieldErrMsg: string) => {
  const errorTitle = 'There is a problem';
  let selector = '#error-summary-title';
  expect(await I.checkElement(selector)).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#emailContent > div > div > ul > li';
  expect(await I.checkElement(selector)).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(summaryErrMsg);

  const numFieldsets = await I.countElement('#emailTab fieldset');
  const fieldsetErrorIndex = numFieldsets - 1;  // The last field set is the hidden template fieldset
  selector = '#email-' + fieldsetErrorIndex + '-error';
  expect(await I.checkElement(selector)).equal(true);
  const descriptionErrorElement = await I.getElement(selector);
  expect(await I.getElementText(descriptionErrorElement)).contains(fieldErrMsg);

  expect(await I.checkElement('#address-' + fieldsetErrorIndex + '-error')).equal(false);
});


