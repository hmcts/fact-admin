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

When('I enter new phone number entry by selecting description and entering {string}, ' +
  '{string} and {string}', async (number: string, explanation: string, explanationCy: string) => {
  const selectSelector = 'select[name="newPhoneNumberDescription"]';
  const numberInputSelector = '#newPhoneNumber';
  const explanationInputSelector = '#newPhoneNumberExplanation';
  const explanationCyInputSelector = '#newPhoneNumberExplanationCy';

  expect(await I.checkElement(selectSelector)).equal(true);
  expect(await I.checkElement(numberInputSelector)).equal(true);
  expect(await I.checkElement(explanationInputSelector)).equal(true);
  expect(await I.checkElement(explanationCyInputSelector)).equal(true);

  const id = await I.getLastElementValue(selectSelector + ' option:nth-child(4)');
  await I.selectItem(selectSelector, id);
  await I.fillField(numberInputSelector, number);
  await I.fillField(explanationInputSelector, explanation);
  await I.fillField(explanationCyInputSelector, explanationCy);
});

Then('the new phone number entry is displayed as expected with number {string} ' +
  'explanation {string} and welsh explanation {string}', async (number: string, explanation: string, explanationCy: string) => {
  const lastNumberText = await I.getLastElementValue('#phoneNumbersTab fieldset input[name$="[number]"]');
  expect(lastNumberText).equal(number);

  const lastExplanationText = await I.getLastElementValue('#phoneNumbersTab fieldset input[name$="[explanation]"]');
  expect(lastExplanationText).equal(explanation);

  const lastExplanationCyText = await I.getLastElementValue('#phoneNumbersTab fieldset input[name$="[explanation_cy]"]');
  expect(lastExplanationCyText).equal(explanationCy);
});

Then('a green update message is displayed in the phone numbers tab', async() => {
  const elementExist = await I.checkElement('#phoneNumbersTab .govuk-panel--confirmation');
  expect(elementExist).equal(true);
});

When('I enter a blank phone number entry', async () => {
  const selectSelector = 'select[name="newPhoneNumberDescription"]';
  const inputSelector = '#newPhoneNumber';

  const selectElementExists = await I.checkElement(selectSelector);
  expect(selectElementExists).equal(true);
  const inputElementExists = await I.checkElement(inputSelector);
  expect(inputElementExists).equal(true);

  await I.clearField(inputSelector);
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
