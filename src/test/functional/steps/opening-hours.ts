import { Then, When } from 'cucumber';
import { expect } from 'chai';

import * as I from '../utlis/puppeteer.util';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I click the opening hours tab', async () => {
  const selector = '#tab_opening-hours';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the existing opening hours', async () => {
  const elementExist = await I.checkElement('#openingTimesForm');
  expect(elementExist).equal(true);

  const tabClosed = await I.checkElement('#opening-hours.govuk-tabs__panel--hidden');
  expect(tabClosed).equal(false);
});

When('I remove all existing opening hours entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsets('#openingTimesTab', 'deleteOpeningHours');
  await FunctionalTestHelpers.clickSaveButton('#openingTimesTab', 'saveOpeningTime');
});

When('I enter new opening hours entry by selecting type at index {int} and adding text {string}', async (typeIdx: number, text: string) => {
  const numFieldsets = await I.countElement('#openingTimesTab fieldset');
  const entryFormIdx = numFieldsets - 2;

  // The type select element contains an empty entry in the 'add new' form only. We add 1 here
  // to keep the indexing the same as the select elements in the existing opening hours, where the
  // select element doesn't contain an empty entry.
  typeIdx += 1;

  const typeSelector = '#openingTimesTab select[name$="[type_id]"]';
  const hoursSelector = '#openingTimesTab input[name$="[hours]"]';

  await I.setElementValueAtIndex(typeSelector, entryFormIdx, typeIdx, 'select');
  await I.setElementValueAtIndex(hoursSelector, entryFormIdx, text, 'input');
});

When('I click the Add button in the opening hours tab', async () => {
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#openingTimesTab', 'addOpeningTime');
});

Then('I click save', async () => {
  await FunctionalTestHelpers.clickSaveButton('#openingTimesTab', 'saveOpeningTime');
});

Then('a green update message is displayed in the opening hours tab', async () => {
  const elementExist = await I.checkElement('#openingTimesTab .govuk-panel--confirmation');
  expect(elementExist).equal(true);
});

Then('the second last opening time is displayed as expected with type shown as selected index {int} and hours as {string}', async (index: number, hoursText: string) => {
  const fieldsetSelector = '#openingTimesTab fieldset';
  const numOpeningTimes = await I.countElement(fieldsetSelector);
  const secondLastIndex = numOpeningTimes - 4; // we deduct one each for zero-based index, hidden template fieldset, new opening hours fieldset and the last entry.

  const typeIdx = await I.getSelectedIndexAtIndex(`${fieldsetSelector} select[name$="[type_id]"]`, secondLastIndex);
  expect(typeIdx).equal(index);

  const hours = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[hours]"]`, secondLastIndex);
  expect(hours).equal(hoursText);
});

Then('the last opening time is displayed as expected with type shown as selected index {int} and hours as {string}', async (index: number, hoursText: string) => {
  const fieldsetSelector = '#openingTimesTab fieldset';
  const numOpeningTimes = await I.countElement(fieldsetSelector);
  const lastIndex = numOpeningTimes - 3; // we deduct one each for zero-based index, hidden template fieldset and new opening hours fieldset.

  const typeIdx = await I.getSelectedIndexAtIndex(`${fieldsetSelector} select[name$="[type_id]"]`, lastIndex);
  expect(typeIdx).equal(index);

  const hours = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[hours]"]`, lastIndex);
  expect(hours).equal(hoursText);
});

When('I enter an incomplete opening hour description', async () => {
  const numFieldsets = await I.countElement('#openingTimesTab fieldset');
  const entryFormIdx = numFieldsets - 2; // we deduct one each for zero-based index and hidden template field

  // Ensure last entry is for new opening hours and the description is unselected
  const selectedDescription = await I.getElementValueAtIndex('#openingTimesTab select[name$="[type_id]"]', entryFormIdx);
  expect(selectedDescription).equal('');

  await I.setElementValueAtIndex('#openingTimesTab input[name$="[hours]"', entryFormIdx, '10:00am to 4:00pm', 'input');
});

When('I enter duplicated opening hour description', async () => {
  const numFieldsets = await I.countElement('#openingTimesTab fieldset');
  const entryFormIdx = numFieldsets - 2; // we deduct one each for zero-based index and hidden template field

  const typeSelector = '#openingTimesTab select[name$="[type_id]"]';
  const hoursSelector = '#openingTimesTab input[name$="[hours]"]';

  await I.setElementValueAtIndex(typeSelector, entryFormIdx, 3, 'select');
  await I.setElementValueAtIndex(hoursSelector, entryFormIdx, '9:00am to 4:00pm', 'input');

  await I.setElementValueAtIndex(typeSelector, entryFormIdx + 1, 3, 'select');
  await I.setElementValueAtIndex(hoursSelector, entryFormIdx + 1, '10:00am to 5:00pm', 'input');
});

Then('An error is displayed for opening hours with summary {string} and description field message {string}', async (summary: string, message: string) => {
  const errorTitle = 'There is a problem';
  let selector = '#error-summary-title';
  expect(await I.checkElement(selector)).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#openingTimesContent > div > div > ul > li';
  expect(await I.checkElement(selector)).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(summary);

  const numFieldsets = await I.countElement('#openingTimesTab fieldset');
  const fieldsetErrorIndex = numFieldsets - 1;  // The last field set is the hidden template fieldset
  selector = '#opening_times-' + fieldsetErrorIndex + '-error';
  expect(await I.checkElement(selector)).equal(true);
  const descriptionErrorElement = await I.getElement(selector);
  expect(await I.getElementText(descriptionErrorElement)).contains(message);

  expect(await I.checkElement('#hours-' + fieldsetErrorIndex + '-error')).equal(false);
});

When('I click the remove button under an opening hours entry', async () => {
  const numOpeningTimes = await I.countElement('#openingTimesTab fieldset');

  const selector = '#openingTimesTab button[name="deleteOpeningHours"]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);

  const updatedNumOpeningTimes = await I.countElement('#openingTimesTab fieldset');
  expect(numOpeningTimes - updatedNumOpeningTimes).equal(1);
});
