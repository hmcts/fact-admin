import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';


When('I click the facilities tab', async () => {
  const selector = '#tab_court-facilities';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the existing facilities', async () => {
  const elementExist = await I.isElementVisible('#courtFacilitiesForm');
  expect(elementExist).equal(true);
});

When('I remove all existing facility entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#courtFacilitiesTab', 'deleteFacility', 'saveFacilities');
});

Then('a green message is displayed for updated facilities {string}', async (msgUpdated: string) => {
  const elementExist = await I.checkElement('#courtFacilitiesTab .govuk-panel--confirmation');
  expect(elementExist).equal(true);

  const element = await I.getElement('#courtFacilitiesTab .govuk-panel--confirmation');
  const updateText = await I.getElementText(element);
  expect(updateText).equal(msgUpdated);
});

When('I enter new facility by selecting at the index {int} and enter description in english {string} and welsh {string}', async (facilityInex: number, englishDescription: string, welshDescription: string) => {
  const numFieldsets = await I.countElement('#courtFacilitiesTab fieldset');
  const entryFormIdx = numFieldsets - 2;

  // The facilityIndex select element contains an empty entry in the 'add new' form only. We add 1 here
  // to keep the indexing the same as the select elements in the existing facility, where the
  // select element doesn't contain an empty entry.
  facilityInex += 1;
  const selectorIndex =entryFormIdx+1;

  //const facilitySelector = '#courtFacilitiesTab select[name$="courtFacilities[1][name]"]';
  const facilitySelector = '#courtFacilitiesTab .govuk-select';

  const englishDescriptionSelector = '#description-'+selectorIndex;
  const welshDescriptionSelector = '#descriptionCy-'+selectorIndex;

  await I.setElementValueAtIndex(facilitySelector, entryFormIdx, facilityInex, 'select');
  await I.fillFieldInIframe(englishDescriptionSelector, englishDescription);
  await I.fillFieldInIframe(welshDescriptionSelector, welshDescription);
});

When('I click on add new facility', async () => {
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#courtFacilitiesTab', 'addFacility');
});

When('I click save in the facilities tab', async () => {

  await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'saveFacilities');

});

Then('the facility entry in second last position has index {int} description in english and welsh description {string}', async (index: number, englishDescription: string) => {
  const fieldsetSelector = '#courtFacilitiesTab fieldset';
  const numFacilities = await I.countElement(fieldsetSelector);
  const secondLastIndex = numFacilities - 4; // we deduct one each for zero-based index, hidden template fieldset, new facility fieldset and the last entry.

  const facilityIdx = await I.getSelectedIndexAtIndex(`${fieldsetSelector} select[name$="[type_id]"]`, secondLastIndex);
  expect(facilityIdx).equal(index);
});

When('the facility entry in last position has index {int} description in english and welsh description {string}', async (index: number, englishDescription: string) => {
  const fieldsetSelector = '#courtFacilitiesTab fieldset';
  const numFacilities = await I.countElement(fieldsetSelector);
  const lastIndex = numFacilities - 3; // we deduct one each for zero-based index, hidden template fieldset and new facility fieldset.

  const facilityIdx = await I.getSelectedIndexAtIndex(`${fieldsetSelector} select[name$="[type_id]"]`, lastIndex);
  expect(facilityIdx).equal(index);
});

When('I click the remove button under newly added facility entries', async () => {
  const numFacilities = await I.countElement('#courtFacilitiesTab fieldset');
  await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'deleteFacility');

  const updatedNumFacilities = await I.countElement('#courtFacilitiesTab fieldset');
  expect(numFacilities - updatedNumFacilities).equal(1);
});

Then('there are no facility entries', async () => {
  const numberOfFieldsets = await I.countElement('#courtFacilitiesTab fieldset');
  const numFacilities = numberOfFieldsets - 2; // we deduct the hidden template and the new facilities form
  expect(numFacilities).to.equal(0);
});

When('An error is displayed for facilities with summary {string} and description field message {string}', async (summary: string, message: string) => {
  const errorTitle = 'There is a problem';
  let selector = '#error-summary-title';
  expect(await I.checkElement(selector)).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#courtFacilitiesContent > div > div > ul > li';
  expect(await I.checkElement(selector)).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(summary);

  selector = '#Lift-error';
  expect(await I.checkElement(selector)).equal(true);
  const descriptionErrorElement = await I.getElement(selector);
  expect(await I.getElementText(descriptionErrorElement)).contains(message);
});


