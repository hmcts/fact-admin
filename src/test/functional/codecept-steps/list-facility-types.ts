import {expect} from 'chai';
import { I } from '../utlis/codecept-util';
import {FunctionalTestHelpers} from '../utlis/helpers';


async function checkAndClearField (FieldElement: string) {
  I.seeElement(FieldElement);
  await I.clearField(FieldElement);
}

async function populateField(fieldElement: string, value: string) {
  I.seeElement(fieldElement);
  I.fillField(fieldElement, value);
}

When('I click on facility types list', async () => {
  const selector = '#tab_facilities';
  I.seeElement(selector);
  I.click(selector);
});

Then('I should see {string} facility type page', async (facilityType: string) => {
  const selector = '#facilityTypesListContent > h2';
  expect(await I.grabTextFrom(selector)).equal(facilityType);
});

Then('I click on Add new facility type',async () => {
  const selector = '#facilityTypesListContent > div:nth-child(4) > a';
  I.seeElement(selector);
  I.click(selector);
});

Then('I am redirected to the {string} facility type form', async (facilityType: string) => {
  const selector = '#facilityTypesListContent > h2';
  const formTitle = await I.grabTextFrom(selector);
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
  I.seeElement(selector);
  I.click(selector);
});

Then('The error message displays for facility type {string}', async (errMessage: string) => {
  I.seeElement('.govuk-error-summary__title');
  const selector = '#facilityTypesListContent > div.govuk-error-summary > div > div > ul > li';
  const eleErrMessage = await I.grabTextFrom(selector);
  expect(eleErrMessage.trim()).equal(errMessage);
});

Then('I click delete button for facility type {string}',async (facilityType: string) => {
  const selectorFacilityTypes = '#facilityTypesListContent table tr td:nth-child(1)';
  const courtHtmlElement: string[] = await I.grabTextFromAll(selectorFacilityTypes);
  const tableRow  = courtHtmlElement.indexOf(facilityType);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#facilityTypesListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(3) > a`;
  I.seeElement(selector);
  I.click(selector);
});

Then('A green message is displayed {string}', async (message: string) => {
  const selector = '#facilityTypesListContent > div.govuk-panel.govuk-panel--confirmation > h1';
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});

Given('I click edit facility type {string}', async (facilityType: string) => {
  const selectorFacilityTypes = '#facilityTypesListContent table tr td:nth-child(1)';
  const courtHtmlElement: string[] = await I.grabTextFromAll(selectorFacilityTypes);
  const tableRow  = courtHtmlElement.indexOf(facilityType);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#facilityTypesListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(2) > a`;
  I.seeElement(selector);
  I.click(selector);
});

Given('I will make sure to clear all entries for the facility type', async () => {
  await checkAndClearField('#facility-type-name');
  await checkAndClearField('#facility-type-name-cy');
});
