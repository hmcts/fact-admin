import { I } from '../utlis/codecept-util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';
//import { test } from '@playwright/test';
//import { test } from '@playwright/test';
//import {test} from '@playwright/test';

//import { defineConfig } from '@playwright/test';


// export default defineConfig({
//   // Give failing tests 3 retry attempts
//   retries: 3,
// });

// BeforeSuite(async (test) => {
//   const retryCount = 3;
//   test.
//   test.retries(retryCount);
// });
//
// Before((test) => {
//   const retryCount = 1;
//   test.I.retry(retryCount);
// });

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
  expect(true).equals(false);
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#openingTimesTab', 'addOpeningTime');
});

Then('I click save', async () => {
  await FunctionalTestHelpers.clickButton('#openingTimesTab', 'saveOpeningTime');
});

Then('a green update message is displayed in the opening hours tab', async () => {
  I.seeElement('#openingTimesTab .govuk-panel--confirmation');
});

// Then('the second last opening hours is displayed with description at index {int} and hours {string}', async (index: number, hoursText: string) => {
//   const fieldsetSelector = '#openingTimesTab fieldset';
//   const numOpeningTimes = await I.countElement(fieldsetSelector);
//   const secondLastIndex = numOpeningTimes - 4; // we deduct one each for zero-based index, hidden template fieldset, new opening hours fieldset and the last entry.
//
//   const typeIdx = await I.getSelectedIndexAtIndex(`${fieldsetSelector} select[name$="[type_id]"]`, secondLastIndex);
//   expect(typeIdx).equal(index);
//
//   const hours = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[hours]"]`, secondLastIndex);
//   expect(hours).equal(hoursText);
// });
//
// Then('the last opening hours is displayed with description at index {int} and hours {string}', async (index: number, hoursText: string) => {
//   const fieldsetSelector = '#openingTimesTab fieldset';
//   const numOpeningTimes = await I.countElement(fieldsetSelector);
//   const lastIndex = numOpeningTimes - 3; // we deduct one each for zero-based index, hidden template fieldset and new opening hours fieldset.
//
//   const typeIdx = await I.getSelectedIndexAtIndex(`${fieldsetSelector} select[name$="[type_id]"]`, lastIndex);
//   expect(typeIdx).equal(index);
//
//   const hours = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[hours]"]`, lastIndex);
//   expect(hours).equal(hoursText);
// });
//
// When('I enter an incomplete opening hour description', async () => {
//   const numFieldsets = await I.countElement('#openingTimesTab fieldset');
//   const entryFormIdx = numFieldsets - 2; // we deduct one each for zero-based index and hidden template field
//
//   // Ensure last entry is for new opening hours and the description is unselected
//   const selectedDescription = await I.getElementValueAtIndex('#openingTimesTab select[name$="[type_id]"]', entryFormIdx);
//   expect(selectedDescription).equal('');
//
//   await I.setElementValueAtIndex('#openingTimesTab input[name$="[hours]"', entryFormIdx, '10:00am to 4:00pm', 'input');
// });
//
// When('I left the opening hours blank and select description at index {int}', async (typeId: number) => {
//   const numFieldsets = await I.countElement('#openingTimesTab fieldset');
//   const entryFormIdx = numFieldsets - 2; // we deduct one each for zero-based index and hidden template field
//
//   const typeSelector = '#openingTimesTab select[name$="[type_id]"]';
//   const hoursSelector = '#openingTimesTab input[name$="[hours]"]';
//
//   await I.setElementValueAtIndex(typeSelector, entryFormIdx, typeId, 'select');
//   await I.setElementValueAtIndex(hoursSelector, entryFormIdx, '', 'input');
//   await I.clearField(hoursSelector);
//
// });
//
// When('I enter duplicated opening hour description', async () => {
//   const numFieldsets = await I.countElement('#openingTimesTab fieldset');
//   const entryFormIdx = numFieldsets - 2; // we deduct one each for zero-based index and hidden template field
//
//   const typeSelector = '#openingTimesTab select[name$="[type_id]"]';
//   const hoursSelector = '#openingTimesTab input[name$="[hours]"]';
//
//   await I.setElementValueAtIndex(typeSelector, entryFormIdx, 3, 'select');
//   await I.setElementValueAtIndex(hoursSelector, entryFormIdx, '9:00am to 4:00pm', 'input');
//
//   await I.setElementValueAtIndex(typeSelector, entryFormIdx + 1, 3, 'select');
//   await I.setElementValueAtIndex(hoursSelector, entryFormIdx + 1, '10:00am to 5:00pm', 'input');
// });
//
// Then('An error is displayed for opening hours with summary {string} and description field message {string}', async (summary: string, message: string) => {
//   const errorTitle = 'There is a problem';
//   let selector = '.govuk-error-summary__title';
//   expect(await I.checkElement(selector)).equal(true);
//   const errorTitleElement = await I.getElement(selector);
//   expect(await I.getElementText(errorTitleElement)).equal(errorTitle);
//
//   selector = '#openingTimesContent > div > div > div > ul > li';
//   expect(await I.checkElement(selector)).equal(true);
//   const errorListElement = await I.getElement(selector);
//   expect(await I.getElementText(errorListElement)).equal(summary);
//
//   const numFieldsets = await I.countElement('#openingTimesTab fieldset');
//   const fieldsetErrorIndex = numFieldsets - 1;  // The last field set is the hidden template fieldset
//   selector = '#description-' + fieldsetErrorIndex + '-error';
//   expect(await I.checkElement(selector)).equal(true);
//   const descriptionErrorElement = await I.getElement(selector);
//   expect(await I.getElementText(descriptionErrorElement)).contains(message);
// });
//
// Then('An error is displayed for opening hours with summary {string} and hours field message {string}', async (summary: string, message: string) => {
//   const errorTitle = 'There is a problem';
//   let selector = '.govuk-error-summary__title';
//   expect(await I.checkElement(selector)).equal(true);
//   const errorTitleElement = await I.getElement(selector);
//   expect(await I.getElementText(errorTitleElement)).equal(errorTitle);
//
//   selector = '#openingTimesContent > div > div > div > ul > li';
//   expect(await I.checkElement(selector)).equal(true);
//   const errorListElement = await I.getElement(selector);
//   expect(await I.getElementText(errorListElement)).equal(summary);
//
//   const numFieldsets = await I.countElement('#openingTimesTab fieldset');
//   const fieldsetErrorIndex = numFieldsets - 1;  // The last field set is the hidden template fieldset
//   selector = '#hours-' + fieldsetErrorIndex + '-error';
//   expect(await I.checkElement(selector)).equal(true);
//   const hoursErrorElement = await I.getElement(selector);
//   expect(await I.getElementText(hoursErrorElement)).contains(message);
// });
//
// When('I click the remove button under an opening hours entry', async () => {
//   const numOpeningTimes = await I.countElement('#openingTimesTab fieldset');
//   await FunctionalTestHelpers.clickButton('#openingTimesTab', 'deleteOpeningHours');
//
//   const updatedNumOpeningTimes = await I.countElement('#openingTimesTab fieldset');
//   expect(numOpeningTimes - updatedNumOpeningTimes).equal(1);
// });
//
// When('I click the move up button on the last opening hours entry', async () => {
//   const fieldsetSelector = '#openingTimesTab fieldset.can-reorder';
//   const numEntries = await I.countElement('#openingTimesTab fieldset.can-reorder');
//   const lastOpeningHrsIdx = numEntries - 3; // we deduct one each for zero-based indexing, the hidden form template and the new entry form.
//
//   // Click the move up button
//   await I.clickElementAtIndex(`${fieldsetSelector} button[name="moveUp"]`, lastOpeningHrsIdx);
// });
//
// When('I click the move down button on the second last opening hours entry', async () => {
//   const fieldsetSelector = '#openingTimesTab fieldset.can-reorder';
//   const numEntries = await I.countElement('#openingTimesTab fieldset.can-reorder');
//   // We deduct one each for zero-based indexing, the hidden form template, the new entry form and the last opening hours entry.
//   const secondLastOpeningHrsIdx = numEntries - 4;
//
//   // Click the move down button
//   await I.clickElementAtIndex(`${fieldsetSelector} button[name="moveDown"]`, secondLastOpeningHrsIdx);
// });
//
// Then('there are no opening hours entries', async () => {
//   const numberOfFieldsets = await I.countElement('#openingTimesTab fieldset.can-reorder');
//   const numberOfOpeningHours = numberOfFieldsets - 2; // we deduct the hidden template and the new opening hours form
//   expect(numberOfOpeningHours).to.equal(0);
// });
