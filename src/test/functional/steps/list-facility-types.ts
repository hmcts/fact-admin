import {Given, Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {getFirstTableRowIndexContainingText} from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

async function checkAndClearField (FieldElement: string) {
  expect(await I.checkElement(FieldElement)).equal(true);
  await I.clearField(FieldElement);
}

async function populateField(fieldElement: string, value: string) {
  expect(await I.checkElement(fieldElement)).equal(true);
  await I.setElementValueForInputField(fieldElement, value);
}

When('I click on facility types list', async () => {
  const selector = '#tab_facilities';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I should see {string} facility type page', async (facilityType: string) => {
  const selector = '#facilityTypesListContent > h2';
  const pageTitleElement = await I.getElement(selector);
  expect(await I.getElementText(pageTitleElement)).equal(facilityType);
});

Then('I click on Add new facility type',async () => {
  const selector = '#facilityTypesListContent > div:nth-child(4) > a';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I am redirected to the {string} facility type form', async (facilityType: string) => {
  const selector = '#facilityTypesListContent > h2';

  const formTitle = await I.getElementText(await I.getElement(selector));
  expect(formTitle).equal(facilityType);
});

Then('I enter {string} in facility name textbox', async (displayName: string) => {
  const selector = '#facility-type-name';
  await populateField(selector, displayName);
});

Then('I enter {string} in facility welsh name textbox', async (displayNameCy: string) => {
  const selector = '#facility-type-name-cy';
  await populateField(selector, displayNameCy);
});

When('I click facility type save button', async () => {
  const selector = '#saveFacilityType';
  await I.isElementVisible(selector, 10000);
  await I.click(selector);
});

Then('The error message displays for facility type {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('#error-summary-title');
  expect(errorTitle).equal(true);

  const selector = '#facilityTypesListContent > div.govuk-error-summary > div > ul > li';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('I click delete button for facility type {string}',async (facilityType: string) => {
  const tableRow = await getFirstTableRowIndexContainingText('#facilityTypesListContent', 1, facilityType);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#facilityTypesListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(3) > a`;
  await I.isElementVisible(selector, 10000);
  await I.click(selector);
});

Then('A green message is displayed {string}', async (message: string) => {
  const selector = '#facilityTypesListContent > div.govuk-panel.govuk-panel--confirmation > h1';
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});

Given('I click edit facility type {string}', async (facilityType: string) => {
  const tableRow = await getFirstTableRowIndexContainingText('#facilityTypesListContent', 1, facilityType);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#facilityTypesListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(2) > a`;
  await I.isElementVisible(selector, 10000);
  await I.click(selector);
});

Given('I will make sure to clear all entries for the facility type', async () => {
  await checkAndClearField('#facility-type-name');
  await checkAndClearField('#facility-type-name-cy');
});
