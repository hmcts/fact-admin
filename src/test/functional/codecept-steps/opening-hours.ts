import { I } from '../utlis/codecept-util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I hover over opening hours nav element', async () => {
  const selector = '#nav';
  I.seeElement(selector);
  await I.moveCursorTo(selector);

});

When('I click the opening hours tab', async () => {
  const selector = '#tab_opening-hours';
  await I.click(selector);
});

When('I remove all existing opening hours entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#openingTimesTab', 'deleteOpeningHours', 'saveOpeningTime');
});

When('I enter a new opening hours entry by selecting description {string} and adding hours {string}', async (description: string, text: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#openingTimesTab fieldset');
  I.selectOption('#description-' + numFieldsets , description);
  I.fillField('#hours-' + numFieldsets , text);
});

When('I click the Add button in the opening hours tab', async () => {
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#openingTimesTab', 'addOpeningTime');
});

Then('I click save', async () => {
  await FunctionalTestHelpers.clickButton('#openingTimesTab', 'saveOpeningTime');
});

Then('a green update message is displayed in the opening hours tab', async () => {
  I.seeElement('#openingTimesTab .govuk-panel--confirmation');
});

Then('the phone number entry in last position has description value {string} number {string} ' +
  'explanation {string} and welsh explanation {string}', async (descriptionValue: number, number: string, explanation: string, explanationCy: string) => {
  let numFieldsets = await I.grabNumberOfVisibleElements('#phoneNumbersTab fieldset');
  numFieldsets -= 1;

  const descriptionText = await I.grabValueFrom('#contactDescription-' + numFieldsets);
  expect(descriptionText).equal(descriptionValue);

  const numberText = await I.grabAttributeFrom(('#contactNumber-' + numFieldsets), 'value');
  expect(numberText).equal(number);

  const explanationText = await I.grabAttributeFrom(('#contactExplanation-' + numFieldsets), 'value');
  expect(explanationText).equal(explanation);

  const explanationTextCy = await I.grabAttributeFrom(('#contactExplanationCy-' + numFieldsets), 'value');
  expect(explanationTextCy).equal(explanationCy);
});

Then('the second last opening hours is displayed with description value {string} and hours {string}', async (description: string, hoursText: string) => {
  const fieldsetSelector = '#openingTimesTab fieldset';
  let numOpeningTimes = await I.grabNumberOfVisibleElements(fieldsetSelector);
  numOpeningTimes -= 2; // we deduct one each for zero-based index, hidden template fieldset, new opening hours fieldset and the last entry.

  const typeIdx = await I.grabValueFrom('#description-' + numOpeningTimes);
  expect(typeIdx).equal(description);

  const hours = await I.grabAttributeFrom(`${fieldsetSelector} input[name$="[hours]"]`, 'value');
  expect(hours).equal(hoursText);

});

Then('the last opening hours is displayed with description value {string} and hours {string}', async (index: number, hoursText: string) => {
  const fieldsetSelector = '#openingTimesTab fieldset';
  let numOpeningTimes = await I.grabNumberOfVisibleElements(fieldsetSelector);
  numOpeningTimes -= 1; // we deduct one each for zero-based index, hidden template fieldset and new opening hours fieldset.

  const typeIdx = await I.grabValueFrom('#description-' + numOpeningTimes);
  expect(typeIdx).equal(index);

  const hours = await I.grabAttributeFrom('#hours-' + numOpeningTimes, 'value');
  expect(hours).equal(hoursText);
});

Then('An error is displayed for opening hours with summary {string} and description field message {string}', async (summary: string, message: string) => {
  const errorTitle = 'There is a problem';
  let selector = '.govuk-error-summary__title';
  const errorMsg = await I.grabTextFrom(selector);
  expect(errorMsg.trim()).equal(errorTitle);

  selector = '#openingTimesContent > div > div > div > ul > li';
  const errorMsgSummary = await I.grabTextFrom(selector);
  expect(errorMsgSummary.trim()).equal(summary);

  const numFieldsets = await I.grabNumberOfVisibleElements('#openingTimesTab fieldset');
  selector = '#description-' + numFieldsets + '-error';
  const errorMessage = await I.grabTextFrom(selector);
  expect(errorMessage.trim()).equal(message);

});

Then('An error is displayed for opening hours with summary {string} and hours field message {string}', async (summary: string, message: string) => {
  const errorTitle = 'There is a problem';
  let selector = '.govuk-error-summary__title';
  const errorMsg = await I.grabTextFrom(selector);
  expect(errorMsg.trim()).equal(errorTitle);

  selector = '#openingTimesContent > div > div > div > ul > li';
  const errorMsgSummary = await I.grabTextFrom(selector);
  expect(errorMsgSummary.trim()).equal(summary);

  const numFieldsets = await I.grabNumberOfVisibleElements('#openingTimesTab fieldset');
  selector = '#hours-' + numFieldsets + '-error';
  const errorMessage = await I.grabTextFrom(selector);
  expect(errorMessage.trim()).equal(message);
});

When('I click the move up button on the last opening hours entry', async () => {
  I.seeElement('//*[@id="openingTimesContent"]/fieldset[2]/div[3]/div[2]/button[1]');
  I.click('//*[@id="openingTimesContent"]/fieldset[2]/div[3]/div[2]/button[1]');
});

When('I click the move down button on the second last opening hours entry', async () => {
  I.seeElement('//*[@id="openingTimesContent"]/fieldset[1]/div[3]/div[2]/button[2]');
  I.click('//*[@id="openingTimesContent"]/fieldset[1]/div[3]/div[2]/button[2]');
});
