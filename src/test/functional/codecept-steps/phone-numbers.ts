import { I } from '../utlis/codecept-util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I hover over phone numbers nav element', async () => {
  const selector = '#nav';
  I.seeElement(selector);
  I.moveCursorTo(selector);
});

Then('I click the phone numbers tab', async () => {
  const selector = '#tab_phone-numbers';
  await I.click(selector);
});

When('I enter new phone number entry by selecting description {string} and entering {string}, ' +
  '{string} and {string}', async (description: string, number: string, explanation: string, explanationCy: string) => {

  const numFieldsets = await I.grabNumberOfVisibleElements('#phoneNumbersTab fieldset');
  I.selectOption('#contactDescription-' + numFieldsets , description);
  I.fillField('#contactNumber-' + numFieldsets , number);
  I.fillField('#contactExplanation-' + numFieldsets , explanation);
  I.fillField('#contactExplanationCy-' + numFieldsets , explanationCy);
});

Then('the phone number entry in second last position has description value {string} number {string} ' +
  'explanation {string} and welsh explanation {string}', async (descriptionValue: string, number: string, explanation: string, explanationCy: string) => {
  let numFieldsets = await I.grabNumberOfVisibleElements('#phoneNumbersTab fieldset');
  numFieldsets -= 2;

  const descriptionText = await I.grabAttributeFrom(('#contactDescription-' + numFieldsets), 'value');
  expect(descriptionText).equal(descriptionValue);

  const numberText = await I.grabAttributeFrom(('#contactNumber-' + numFieldsets), 'value');
  expect(numberText).equal(number);

  const explanationText = await I.grabAttributeFrom(('#contactExplanation-' + numFieldsets), 'value');
  expect(explanationText).equal(explanation);

  const explanationTextCy = await I.grabAttributeFrom(('#contactExplanationCy-' + numFieldsets), 'value');
  expect(explanationTextCy).equal(explanationCy);
});

Then('the phone number entry in last position has description value {string} number {string} ' +
  'explanation {string} and welsh explanation {string}', async (descriptionValue: number, number: string, explanation: string, explanationCy: string) => {
  let numFieldsets = await I.grabNumberOfVisibleElements('#phoneNumbersTab fieldset');
  numFieldsets -= 1;

  const descriptionText = await I.grabAttributeFrom(('#contactDescription-' + numFieldsets), 'value');
  expect(descriptionText).equal(descriptionValue);

  const numberText = await I.grabAttributeFrom(('#contactNumber-' + numFieldsets), 'value');
  expect(numberText).equal(number);

  const explanationText = await I.grabAttributeFrom(('#contactExplanation-' + numFieldsets), 'value');
  expect(explanationText).equal(explanation);

  const explanationTextCy = await I.grabAttributeFrom(('#contactExplanationCy-' + numFieldsets), 'value');
  expect(explanationTextCy).equal(explanationCy);
});

Then('a green message is displayed for updated entries {string}', async (message: string) => {
  const selector = '#phoneNumbersContent > div > h1';
  I.seeElement(selector);

  const messageUpdate = await I.grabTextFrom('#phoneNumbersContent > div > h1');
  expect(messageUpdate.trim()).equal(message);
});

When('I left description entry blank in phone number tab and enter phone number {string}', async (number: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#phoneNumbersTab fieldset');
  I.fillField('#contactNumber-' + numFieldsets , number);
});

When('I left the phone number entry blank and select description {string}', async (description: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#phoneNumbersTab fieldset');
  I.fillField('#contactNumber-' + numFieldsets , '');
  I.selectOption('#contactDescription-' + numFieldsets , description);
});


Then('an error message is displayed for phone number tab with summary {string} and description field message {string}', async (summary: string, message: string) => {
  const errorTitle = 'There is a problem';
  let selector = '.govuk-error-summary__title';

  const errorMsg = await I.grabTextFrom(selector);
  expect(errorMsg.trim()).equal(errorTitle);

  selector = '#phoneNumbersContent > div > div > div > ul > li';
  const errorMsgSummary = await I.grabTextFrom(selector);
  expect(errorMsgSummary.trim()).equal(summary);

  const numFieldsets = await I.grabNumberOfVisibleElements('#phoneNumbersTab fieldset');
  selector = '#contactDescription-' + numFieldsets + '-error';
  const errorMessage = await I.grabTextFrom(selector);
  expect(errorMessage.trim()).equal(message);
});

Then('an error message is displayed for phone number tab with summary {string} and number field message {string}', async (summary: string, message: string) => {
  const errorTitle = 'There is a problem';
  let selector = '.govuk-error-summary__title';

  const errorMsg = await I.grabTextFrom(selector);
  expect(errorMsg.trim()).equal(errorTitle);

  selector = '#phoneNumbersContent > div > div > div > ul > li';
  const errorMsgSummary = await I.grabTextFrom(selector);
  expect(errorMsgSummary.trim()).equal(summary);

  const numFieldsets = await I.grabNumberOfVisibleElements('#phoneNumbersTab fieldset');
  selector = '#contactNumber-' + numFieldsets + '-error';
  const errorMessage = await I.grabTextFrom(selector);
  expect(errorMessage.trim()).equal(message);
});

Then('I click the Add button in the phone number tab', async () => {
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#phoneNumbersTab', 'addPhoneNumber');
});

Then('I click save in the phone number tab', async () => {
  const selector = '#phoneNumbersTab button[name="savePhoneNumbers"]';
  I.seeElement(selector);
  await I.click(selector);
});

When('I remove all existing phone number entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#phoneNumbersTab', 'deletePhoneNumber', 'savePhoneNumbers');
});

When('I click the move down button on the second last phone number entry', async () => {
  I.seeElement('//*[@id="phoneNumbersContent"]/fieldset[1]/div[5]/div[2]/button[2]');
  I.click('//*[@id="phoneNumbersContent"]/fieldset[1]/div[5]/div[2]/button[2]');
  I.wait(10);
});

When('I click the move up button on the last phone number entry', async () => {
  I.seeElement('//*[@id="phoneNumbersContent"]/fieldset[2]/div[5]/div[2]/button[1]');
  I.click('//*[@id="phoneNumbersContent"]/fieldset[2]/div[5]/div[2]/button[1]');
});
