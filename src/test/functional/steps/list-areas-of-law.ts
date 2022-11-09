import {Given, Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {getFirstTableRowIndexContainingText} from '../utlis/puppeteer.util';
import {expect} from 'chai';

async function checkAndClearField (aofFieldElement: string) {
  expect(await I.checkElement(aofFieldElement)).equal(true);
  await I.clearField(aofFieldElement);
}

async function populateField(fieldElement: string, value: string) {
  expect(await I.checkElement(fieldElement)).equal(true);
  await I.setElementValueForInputField(fieldElement, value);
}

When('I click on areas of law list', async () => {
  const selector = '#tab_areas-of-law';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I should see {string} page', async (editAreaofLawTitle: string) => {
  const selector = '#areasOfLawListContent > h2';
  const pageTitleElement = await I.getElement(selector);
  expect(await I.getElementText(pageTitleElement)).equal(editAreaofLawTitle);
});

Given('I click edit {string}', async (areaOfLawName: string) => {
  const tableRow = await getFirstTableRowIndexContainingText('#areasOfLawListContent', 1, areaOfLawName);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#areasOfLawListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(2) > a`;
  await I.isElementVisible(selector, 10000);
  await I.click(selector);
});

Then('I am redirected to the {string} form', async (editFinancialRemedy: string) => {
  const selector = '#areasOfLawListContent > h2';
  const formTitle = await I.getElementText(await I.getElement(selector));
  expect(formTitle).equal(editFinancialRemedy);
});

Given('I will make sure to clear all entries for the Area of law', async () => {
  await checkAndClearField('#aol-display-name');
  await checkAndClearField('#aol-display-name-cy');
  await checkAndClearField('#aol-alt-name');
  await checkAndClearField('#aol-alt-name-cy');
  await checkAndClearField('#aol-external-link');
  await checkAndClearField('#aol-external-link-desc');
  await checkAndClearField('#aol-external-link-desc-cy');
  await checkAndClearField('#aol-display-external-link');
});

Then('I enter {string} in Display Name textbox', async (displayName: string) => {
  const selector = '#aol-display-name';
  await populateField(selector, displayName);
});

When('I click Area Of Law save button', async () => {
  const selector = '#saveAreaOfLawBtn';
  await I.isElementVisible(selector, 10000);
  await I.click(selector);
});

Then('I enter {string} in external link desc textbox', async (externalLinkDesc: string) => {
  const selector = '#aol-external-link-desc';
  await populateField(selector, externalLinkDesc);
});

Then('I enter {string} in Display Name Cy textbox', async (displayNameCy: string) => {
  const selector = '#aol-display-name-cy';
  await populateField(selector, displayNameCy);
});

Then('I enter {string} in alternative name textbox', async (altName: string) => {
  const selector = '#aol-alt-name';
  await populateField(selector, altName);
});

Then('I enter {string} in alternative Name Cy textbox', async (altNameCy: string) => {
  const selector = '#aol-alt-name-cy';
  await populateField(selector, altNameCy);
});

Then('I enter {string} in external link textbox', async (extLink: string) => {
  const selector = '#aol-external-link';
  await populateField(selector, extLink);
});

Then('I enter {string} in external link desc Cy textbox', async (extLinkCy: string) => {
  const selector = '#aol-external-link-desc-cy';
  await populateField(selector, extLinkCy);
});

Then('I enter {string} in Display external link textbox', async (displayExtlink: string) => {
  const selector = '#aol-display-external-link';
  await populateField(selector, displayExtlink);
});

Then('A green message is displayed for the updated Area Of Law {string}', async (message: string) => {
  const selector = '#areasOfLawListContent > div.govuk-panel.govuk-panel--confirmation > h1';
  await I.isElementVisible(selector, 10000);
  const messageUpdate = await I.getElement(selector);
  expect(await I.getElementText(messageUpdate)).equal(message);
});

Then('I click on Add new Area of law',async () => {
  const selector = '#areasOfLawListContent > div > a';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I enter {string} in Name textbox', async (newName: string) => {
  const selector = '#aol-name';
  await populateField(selector, newName);
});

When('I click confirm delete button',async () => {
  const selector = '#confirmDelete';
  await I.isElementVisible(selector, 10000);
  await I.click(selector);
});

Then('I click {string} delete button',async (aolTest: string) => {
  const tableRow = await getFirstTableRowIndexContainingText('#areasOfLawListContent', 1, aolTest);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#areasOfLawListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(3) > a`;
  await I.isElementVisible(selector, 10000);
  await I.click(selector);
});

When('I click delete button for Area of law {string}',async (aolName: string) => {
  const tableRow = await getFirstTableRowIndexContainingText('#areasOfLawListContent', 1, aolName);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#areasOfLawListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(3) > a`;
  await I.isElementVisible(selector, 10000);
  await I.click(selector);
});

Then('The error message displays {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('#error-summary-title');
  expect(errorTitle).equal(true);

  const selector = '#areasOfLawListContent > div.govuk-error-summary > div > ul > li';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});
