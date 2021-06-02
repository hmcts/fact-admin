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

When('I enter new opening hours entry by selecting id {string} and adding text {string}', async (id: string, text: string) => {
  const inputSelector = '#newOpeningTimeHours';
  const selectSelector = 'select[name="newOpeningTimeDescription"]';

  const selectElementExists = await I.checkElement(selectSelector);
  expect(selectElementExists).equal(true);
  const inputElementExists = await I.checkElement(inputSelector);
  expect(inputElementExists).equal(true);

  await I.selectItem(selectSelector, id);
  await I.fillField(inputSelector, text);
});

When('I click the Add button', async () => {
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#openingTimesTab', 'addOpeningTime');
});

Then('I click save', async () => {
  const selector = 'button[name="saveOpeningTime"]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('a green update message is displayed', async () => {
  const elementExist = await I.checkElement('#openingTimesTab .govuk-panel--confirmation');
  expect(elementExist).equal(true);
});

Then('the new opening time is displayed as expected with id {string} and text {string}', async (id: string, hoursText: string) => {
  const lastTypeId = await I.getLastElementValue('#openingTimesTab fieldset select[name$="[type_id]"]');
  const lastHoursText = await I.getLastElementValue('#openingTimesTab fieldset input[name$="[hours]"]');

  expect(lastTypeId.toString()).equal(id);
  expect(hoursText).equal(lastHoursText);
});

When('I enter a blank opening hours entry', async () => {
  const inputSelector = '#newOpeningTimeHours';
  const selectSelector = 'select[name="newOpeningTimeDescription"]';

  const selectElementExists = await I.checkElement(selectSelector);
  expect(selectElementExists).equal(true);
  const inputElementExists = await I.checkElement(inputSelector);
  expect(inputElementExists).equal(true);

  await I.clearField(inputSelector);
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
