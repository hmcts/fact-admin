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

When('I remove all existing facility entries and save', async () => {

  const fieldsetSelector = '#courtFacilitiesContent > fieldset';
  const fieldsetCount = await I.countElement(fieldsetSelector);
  // Remove all fieldsets except the empty new one
  for (let i = fieldsetCount; i > 1; i--) {
    await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'deleteFacility');
    const updatedFieldsetCount = await I.countElement(fieldsetSelector);
    expect(i - updatedFieldsetCount).equal(1);
  }
  await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'saveFacilities');
});

Then('a green message is displayed for updated facilities {string}', async (msgUpdated: string) => {
  const elementExist = await I.checkElement('#courtFacilitiesTab .govuk-panel--confirmation');
  expect(elementExist).equal(true);
  const element = await I.getElement('#courtFacilitiesTab .govuk-panel--confirmation');
  const updateText = await I.getElementText(element);
  expect(updateText).equal(msgUpdated);
});

When('I enter facility {string} and enter description in english {string} and welsh {string}', async (facility: string, englishDescription: string, welshDescription: string) => {
  const numFieldsets = await I.countElement('#courtFacilitiesTab fieldset');
  const entryFormIdx = numFieldsets - 1;
  let facilityIdx = 0;

  const selectorIndex = entryFormIdx + 1;
  const facilitySelector = '#courtFacilitiesTab .govuk-select';

  const englishDescriptionSelector = '#description-' + selectorIndex;
  const welshDescriptionSelector = '#descriptionCy-' + selectorIndex;

  const facilityOptionSelector = '#name-1 > option';
  const elementExist = await I.checkElement(facilityOptionSelector);
  expect(elementExist).equal(true);

  const courtFacilities: string[] = await I.getHtmlFromElements(facilityOptionSelector);

  while (courtFacilities[facilityIdx] != facility)
    facilityIdx++;

  if(entryFormIdx > 0 )
    facilityIdx += 1;

  await I.setElementValueAtIndex(facilitySelector, entryFormIdx, facilityIdx, 'select');
  await I.fillFieldInIframe(englishDescriptionSelector, englishDescription);
  await I.fillFieldInIframe(welshDescriptionSelector, welshDescription);

});

When('I enter description in english {string}', async (englishDescription: string) => {

  const numFieldsets = await I.countElement('#courtFacilitiesTab fieldset');
  const entryFormIdx = numFieldsets - 1;

  // to keep the indexing the same as the select elements in the existing facility, where the
  // select element doesn't contain an empty entry.

  const selectorIndex = entryFormIdx + 1;
  const englishDescriptionSelector = '#description-' + selectorIndex;
  await I.fillFieldInIframe(englishDescriptionSelector, englishDescription);
});

When('I click on add new facility', async () => {
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#courtFacilitiesTab', 'addFacility');
});

When('I click save in the facilities tab', async () => {
  await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'saveFacilities');
});

When('I click clear in the facilities tab', async () => {
  await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'clearFacility');
});

Then('the facility entry in second last position has value {string} description in english {string} and welsh {string}', async (value: number, englishDescription: string, welshDescription: string) => {
  const fieldsetSelector = '#courtFacilitiesTab fieldset';
  const numFacilities = await I.countElement(fieldsetSelector);
  const secondLastIndex = numFacilities - 3; // we deduct one each for zero-based index, hidden template fieldset, new facility fieldset and the last entry.
  const selectorIndex = secondLastIndex + 1;

  const englishDescriptionSelector = '#description-' + selectorIndex + '_ifr';
  const welshDescriptionSelector = '#descriptionCy-' + selectorIndex + '_ifr';

  const englishDescriptionTxt = await I.getIframeContent(englishDescriptionSelector);
  expect(englishDescriptionTxt).equal(englishDescription);

  const welshDescriptionTxt = await I.getIframeContent(welshDescriptionSelector);
  expect(welshDescriptionTxt).equal(welshDescription);

  const facilityValue = await I.getElementValueAtIndex(`${fieldsetSelector} .govuk-select`, secondLastIndex);
  expect(facilityValue).equal(value);
});

Then('the facility entry in last position has index {string} description in english {string} and welsh {string}', async (value: string, englishDescription: string, welshDescription: string) => {
  const fieldsetSelector = '#courtFacilitiesTab fieldset';
  const numFacilities = await I.countElement(fieldsetSelector);
  const lastIndex = numFacilities - 2; // we deduct one each for zero-based index, hidden template fieldset and new facility fieldset.

  const selectorIndex = lastIndex + 1;

  const englishDescriptionSelector = '#description-' + selectorIndex + '_ifr';
  const welshDescriptionSelector = '#descriptionCy-' + selectorIndex + '_ifr';

  const englishDescriptionTxt = await I.getIframeContent(englishDescriptionSelector);
  expect(englishDescriptionTxt).equal(englishDescription);

  const welshDescriptionTxt = await I.getIframeContent(welshDescriptionSelector);
  expect(welshDescriptionTxt).equal(welshDescription);

  const facilityValue = await I.getElementValueAtIndex(`${fieldsetSelector} .govuk-select`, lastIndex);
  expect(facilityValue).equal(value);

});

When('I click the remove button under newly added facility entries', async () => {
  const numFacilities = await I.countElement('#courtFacilitiesTab fieldset');
  await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'deleteFacility');
  await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'clearFacility');
  const updatedNumFacilities = await I.countElement('#courtFacilitiesTab fieldset');
  expect(numFacilities - updatedNumFacilities).equal(1);
});

Then('there are no facility entries', async () => {
  const numberOfFieldsets = await I.countElement('#courtFacilitiesTab fieldset');
  const numFacilities = numberOfFieldsets - 1; // we deduct the hidden template and the new facilities form
  expect(numFacilities).to.equal(0);
});

When('An error is displayed for facilities with summary {string} and field message {string}', async (summary: string, message: string) => {
  const errorTitle = 'There is a problem';
  let selector = '#error-summary-title';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#courtFacilitiesContent > div > div > ul > li';
  const elementExist2 = await I.checkElement(selector);
  expect(elementExist2).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(summary);

  selector = '#name-1-error';
  const elementExist3 = await I.checkElement(selector);
  expect(elementExist3).equal(true);
  const descriptionErrorElement = await I.getElement(selector);
  expect(await I.getElementText(descriptionErrorElement)).contains(message);

  selector = '#name-2-error';
  const elementExist4 = await I.checkElement(selector);
  expect(elementExist4).equal(true);
  const descriptionErrorElement2 = await I.getElement(selector);
  expect(await I.getElementText(descriptionErrorElement2)).contains(message);
});

When('An error is displayed for facilities with summary {string} and description field message {string}', async (summary: string, message: string) => {
  const errorTitle = 'There is a problem';
  let selector = '#error-summary-title';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#courtFacilitiesContent > div > div > ul > li';
  const elementExist2 = await I.checkElement(selector);
  expect(elementExist2).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(summary);

  selector = '#description-1-error';
  const elementExist3 = await I.checkElement(selector);
  expect(elementExist3).equal(true);
  const descriptionErrorElement = await I.getElement(selector);
  expect(await I.getElementText(descriptionErrorElement)).contains(message);
});

When('An error is displayed for facilities with summary {string} and name field message {string}', async (summary: string, message: string) => {
  const errorTitle = 'There is a problem';
  let selector = '#error-summary-title';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#courtFacilitiesContent > div > div > ul > li';
  const elementExist2 = await I.checkElement(selector);
  expect(elementExist2).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(summary);

  selector = '#name-1-error';
  const elementExist3 = await I.checkElement(selector);
  expect(elementExist3).equal(true);
  const descriptionErrorElement = await I.getElement(selector);
  expect(await I.getElementText(descriptionErrorElement)).contains(message);
});
