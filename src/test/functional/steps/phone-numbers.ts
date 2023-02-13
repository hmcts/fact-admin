import * as I from '../utlis/puppeteer.util';
import {Then, When} from 'cucumber';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I hover over phone numbers nav element', async () => {
  const selector = '#nav';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.hover(selector);
});

Then('I click the phone numbers tab', async () => {
  const selector = '#tab_phone-numbers';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I enter new phone number entry by selecting description at index {int} and entering {string}, ' +
  '{string} and {string}', async (index: number, number: string, explanation: string, explanationCy: string) => {
  const numFieldsets = await I.countElement('#phoneNumbersTab fieldset');
  const entryFormIdx = numFieldsets - 2;

  // The 'description' select element includes an initial empty value in the 'add new' forms only
  // (so that there is no initial selection). We add one here so that the indexing matches that of
  // existing entries, where the select element doesn't contain an initial empty value.
  index += 1;

  const selectSelector = '#phoneNumbersTab select[name$="[type_id]"]';
  const numberInputSelector = '#phoneNumbersTab input[name$="[number]"]';
  const explanationInputSelector = '#phoneNumbersTab input[name$="[explanation]"]';
  const explanationCyInputSelector = '#phoneNumbersTab input[name$="[explanation_cy]"]';

  await I.setElementValueAtIndex(selectSelector, entryFormIdx, index, 'select');
  await I.setElementValueAtIndex(numberInputSelector, entryFormIdx, number);
  await I.setElementValueAtIndex(explanationInputSelector, entryFormIdx, explanation);
  await I.setElementValueAtIndex(explanationCyInputSelector, entryFormIdx, explanationCy);
});

Then('the phone number entry in second last position has description at index {int} number {string} ' +
  'explanation {string} and welsh explanation {string}', async (descriptionIndex: number, number: string, explanation: string, explanationCy: string) => {
  const numPhoneNumbers = await I.countElement('#phoneNumbersTab fieldset');

  // We deduct 1 each for zero-based indexing, hidden template fieldset, 'add new' fieldset and last entry
  const secondLastIndex = numPhoneNumbers - 4;

  const typeIndex = await I.getSelectedIndexAtIndex('#phoneNumbersTab fieldset select[name$="[type_id]"]', secondLastIndex);
  expect(typeIndex).equal(descriptionIndex);

  const numberText = await I.getElementValueAtIndex('#phoneNumbersTab fieldset input[name$="[number]"]', secondLastIndex);
  expect(numberText).equal(number);

  const explanationText = await I.getElementValueAtIndex('#phoneNumbersTab fieldset input[name$="[explanation]"]', secondLastIndex);
  expect(explanationText).equal(explanation);

  const explanationCyText = await I.getElementValueAtIndex('#phoneNumbersTab fieldset input[name$="[explanation_cy]"]', secondLastIndex);
  expect(explanationCyText).equal(explanationCy);
});

Then('the phone number entry in last position has description at index {int} number {string} ' +
  'explanation {string} and welsh explanation {string}', async (descriptionIndex: number, number: string, explanation: string, explanationCy: string) => {
  const numPhoneNumbers = await I.countElement('#phoneNumbersTab fieldset');

  // We deduct 1 each for zero-based indexing, hidden template fieldset and 'add new' fieldset
  const lastIndex = numPhoneNumbers - 3;

  const lastTypeIndex = await I.getSelectedIndexAtIndex('#phoneNumbersTab fieldset select[name$="[type_id]"]', lastIndex);
  expect(lastTypeIndex).equal(descriptionIndex);

  const lastNumberText = await I.getElementValueAtIndex('#phoneNumbersTab fieldset input[name$="[number]"]', lastIndex);
  expect(lastNumberText).equal(number);

  const lastExplanationText = await I.getElementValueAtIndex('#phoneNumbersTab fieldset input[name$="[explanation]"]', lastIndex);
  expect(lastExplanationText).equal(explanation);

  const lastExplanationCyText = await I.getElementValueAtIndex('#phoneNumbersTab fieldset input[name$="[explanation_cy]"]', lastIndex);
  expect(lastExplanationCyText).equal(explanationCy);
});

Then('a green message is displayed for updated entries {string}', async (message: string) => {
  const selector = '#phoneNumbersContent > div > h1';
  expect(await I.checkElement(selector)).equal(true);

  const messageUpdate = await I.getElement('#phoneNumbersContent > div > h1');
  expect(await I.getElementText(messageUpdate)).equal(message);
});

When('I left description entry blank in phone number tab and enter phone number {string}', async (number: string) => {
  const numFieldsets = await I.countElement('#phoneNumbersTab fieldset');
  const entryFormIdx = numFieldsets - 2;

  // Ensure last entry is for new number and the description is unselected
  const selectedDescription = await I.getLastElementValue('#phoneNumbersTab select[name$="[type_id]"');
  expect(selectedDescription).equal('');

  await I.setElementValueAtIndex('#phoneNumbersTab input[name$="[number]"', entryFormIdx, number);
});

When('I left the phone number entry blank and select description at index {int}', async (descriptinIndex: number) => {
  const numFieldsets = await I.countElement('#phoneNumbersTab fieldset');
  const entryFormIdx = numFieldsets - 2;

  const selectSelector = '#phoneNumbersTab select[name$="[type_id]"]';
  const numbersSelector = '#phoneNumbersTab input[name$="[number]"]';

  await I.setElementValueAtIndex(selectSelector, entryFormIdx, descriptinIndex, 'select');
  await I.setElementValueAtIndex(numbersSelector, entryFormIdx, '', 'input');
});


Then('an error message is displayed for phone number tab with summary {string} and description field message {string}', async (summary: string, message: string) => {
  const errorTitle = 'There is a problem';
  let selector = '.govuk-error-summary__title';
  expect(await I.checkElement(selector)).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#phoneNumbersContent > div > div > div > ul > li';
  expect(await I.checkElement(selector)).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(summary);

  const numFieldsets = await I.countElement('#phoneNumbersTab fieldset');
  const fieldsetErrorIndex = numFieldsets - 1;  // The last field set is the hidden template fieldset
  selector = '#contactDescription-' + fieldsetErrorIndex + '-error';
  expect(await I.checkElement(selector)).equal(true);
  const descriptionErrorElement = await I.getElement(selector);
  expect(await I.getElementText(descriptionErrorElement)).contains(message);
});


Then('an error message is displayed for phone number tab with summary {string} and number field message {string}', async (summary: string, message: string) => {
  const errorTitle = 'There is a problem';
  let selector = '.govuk-error-summary__title';
  expect(await I.checkElement(selector)).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#phoneNumbersContent > div > div > div > ul > li';
  expect(await I.checkElement(selector)).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(summary);

  const numFieldsets = await I.countElement('#phoneNumbersTab fieldset');
  const fieldsetErrorIndex = numFieldsets - 1;  // The last field set is the hidden template fieldset
  selector = '#contactNumber-' + fieldsetErrorIndex + '-error';
  expect(await I.checkElement(selector)).equal(true);
  const descriptionErrorElement = await I.getElement(selector);
  expect(await I.getElementText(descriptionErrorElement)).contains(message);
});

Then('I click the Add button in the phone number tab', async () => {
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#phoneNumbersTab', 'addPhoneNumber');
});

Then('I click save in the phone number tab', async () => {
  const selector = '#phoneNumbersTab button[name="savePhoneNumbers"]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('an error message is displayed in the phone number tab', async () => {
  const elementExist = await I.checkElement('#phoneNumbersTab .govuk-error-summary');
  expect(elementExist).equal(true);
});

When('I click the remove button under a phone number entry', async () => {
  const numPhoneNumbers = await I.countElement('#phoneNumbersTab fieldset');

  const selector = '#phoneNumbersTab button[name="deletePhoneNumber"]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);

  const updatedNumPhoneNumbers = await I.countElement('#phoneNumbersTab fieldset');
  expect(numPhoneNumbers - updatedNumPhoneNumbers).equal(1);
});

When('I remove all existing phone number entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#phoneNumbersTab', 'deletePhoneNumber', 'savePhoneNumbers');
});

Then('there are no phone number entries', async () => {
  const numberOfFieldsets = await I.countElement('#phoneNumbersTab fieldset.can-reorder');
  const numberOfPhoneNumbers = numberOfFieldsets - 2; // we deduct the hidden template and the new opening hours form
  expect(numberOfPhoneNumbers).to.equal(0);
});

When('I click the move down button on the second last phone number entry', async () => {
  const fieldsetSelector = '#phoneNumbersTab fieldset.can-reorder';
  const numEntries = await I.countElement(fieldsetSelector);
  // We deduct one each for zero-based indexing, the hidden form template, the new entry form and the last opening hours entry.
  const secondLastOpeningHrsIdx = numEntries - 4;

  // Click the move down button
  await I.clickElementAtIndex(`${fieldsetSelector} button[name="moveDown"]`, secondLastOpeningHrsIdx);
});

When('I click the move up button on the last phone number entry', async () => {
  const fieldsetSelector = '#phoneNumbersTab fieldset.can-reorder';
  const numEntries = await I.countElement(fieldsetSelector);
  const lastOpeningHrsIdx = numEntries - 3; // we deduct one each for zero-based indexing, the hidden form template and the new entry form.

  // Click the move up button
  await I.clickElementAtIndex(`${fieldsetSelector} button[name="moveUp"]`, lastOpeningHrsIdx);
});
