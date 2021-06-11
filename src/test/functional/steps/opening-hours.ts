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
  const selector = '#openingTimesTab button[name="saveOpeningTime"]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
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

When('I enter an incomplete opening hours entry', async () => {
  const numFieldsets = await I.countElement('#openingTimesTab fieldset');
  const entryFormIdx = numFieldsets - 2; // we deduct one each for zero-based index and hidden template field

  // Ensure last entry is for new opening hours and the description is unselected
  const selectedDescription = await I.getElementValueAtIndex('#openingTimesTab select[name$="[type_id]"]', entryFormIdx);
  expect(selectedDescription).equal('');

  await I.setElementValueAtIndex('#openingTimesTab input[name$="[hours]"', entryFormIdx, '10:00am to 4:00pm', 'input');
});

Then('an error message is displayed', async () => {
  const elementExist = await I.checkElement('#openingTimesTab .govuk-error-summary');
  expect(elementExist).equal(true);
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

When('I click the move up button on the last opening hours entry which has id {string} and hours {string}',
  async (id: string, hours: string) => {
    const numEntries = await I.countElement('#openingTimesTab fieldset.can-reorder');

    // Ensure last entry is as expected
    const lastEntrySelectValue = await I.getElementValueAtIndex('#openingTimesTab fieldset.can-reorder select', numEntries - 1);
    const lastEntryInputValue = await I.getElementValueAtIndex('#openingTimesTab fieldset.can-reorder input', numEntries - 1);
    expect(lastEntrySelectValue).equal(id);
    expect(lastEntryInputValue).equal(hours);

    // Click the move up button
    await I.clickElementAtIndex('#openingTimesTab fieldset.can-reorder button[name="moveUp"]', numEntries - 1);
  });

When('I click the move down button on the second last opening hours entry which has id {string} and hours {string}',
  async (id: string, hours: string) => {
    const numEntries = await I.countElement('#openingTimesTab fieldset.can-reorder');

    // Ensure second-last entry is as expected
    const secondLastEntrySelectValue = await I.getElementValueAtIndex('#openingTimesTab fieldset.can-reorder select', numEntries - 2);
    const secondLastEntryInputValue = await I.getElementValueAtIndex('#openingTimesTab fieldset.can-reorder input', numEntries - 2);
    expect(secondLastEntrySelectValue).equal(id);
    expect(secondLastEntryInputValue).equal(hours);

    // Click the move down button
    await I.clickElementAtIndex('#openingTimesTab fieldset.can-reorder button[name="moveDown"]', numEntries - 2);
  });

Then('The opening hours entry with id {string} and hours {string} is in second last position',
  async(id: string, hours: string) => {
    const numEntries = await I.countElement('#openingTimesTab fieldset.can-reorder');
    const secondLastIdx = numEntries - 2;

    const secondLastEntrySelectValue = await I.getElementValueAtIndex(
      '#openingTimesTab fieldset.can-reorder select', secondLastIdx);
    const secondLastEntryInputValue = await I.getElementValueAtIndex(
      '#openingTimesTab fieldset.can-reorder input', secondLastIdx);
    expect(secondLastEntrySelectValue).equal(id);
    expect(secondLastEntryInputValue).equal(hours);
  });

Then('The opening hours entry with id {string} and hours {string} is in last position',
  async(id: string, hours: string) => {
    const numEntries = await I.countElement('#openingTimesTab fieldset.can-reorder');
    const lastIdx = numEntries - 1;

    const lastEntrySelectValue = await I.getElementValueAtIndex(
      '#openingTimesTab fieldset.can-reorder select', lastIdx);
    const lastEntryInputValue = await I.getElementValueAtIndex(
      '#openingTimesTab fieldset.can-reorder input', lastIdx);
    expect(lastEntrySelectValue).equal(id);
    expect(lastEntryInputValue).equal(hours);
  });
