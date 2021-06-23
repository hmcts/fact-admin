import * as I from '../utlis/puppeteer.util';
import {Then, When} from 'cucumber';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I click the phone numbers tab', async () => {
  const selector = '#tab_phone-numbers';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the existing phone numbers', async () => {
  const elementExist = await I.checkElement('#phoneNumbersForm');
  expect(elementExist).equal(true);

  const tabClosed = await I.checkElement('#phone-numbers.govuk-tabs__panel--hidden');
  expect(tabClosed).equal(false);
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

Then('a green message is displayed for updated entries {string}', async(message: string) => {
  const selector = '#phoneNumbersContent > div > h1';
  expect(await I.checkElement(selector)).equal(true);

  const messageUpdate = await I.getElement('#phoneNumbersContent > div > h1');
  expect(await I.getElementText(messageUpdate)).equal(message);
});

When('I enter an incomplete phone number entry', async () => {
  const numFieldsets = await I.countElement('#phoneNumbersTab fieldset');
  const entryFormIdx = numFieldsets - 2;

  // Ensure last entry is for new number and the description is unselected
  const selectedDescription = await I.getLastElementValue('select[name$="[type_id]"');
  expect(selectedDescription).equal('');

  await I.setElementValueAtIndex('input[name$="[number]"', entryFormIdx, '0987 666 5040');
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
