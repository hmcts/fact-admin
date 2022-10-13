import {Given, Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {getFirstTableRowIndexContainingText} from '../utlis/puppeteer.util';
import {expect} from 'chai';

async function populateField(fieldElement: string, value: string) {
  expect(await I.checkElement(fieldElement)).equal(true);
  await I.setElementValueForInputField(fieldElement, value);
}

When('I click on Opening type list', async () => {
  const selector = '#tab_opening-types';
  await I.isElementVisible(selector, 5000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Given('I click edit opening type {string}', async (contactType: string) => {
  const tableRow = await getFirstTableRowIndexContainingText('#openingTypesListContent', 1, contactType);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#openingTypesListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(2) > a`;
  await I.isElementVisible(selector, 5000);
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I am redirected to the opening type {string} form', async (editContactType: string) => {
  const selector = '#openingTypesListContent > h2';
  await I.isElementVisible(selector, 5000);
  const formTitle = await I.getElementText(await I.getElement(selector));
  expect(formTitle).equal(editContactType);
});

Given('I will make sure to clear entries for the opening Type', async () => {
  expect(await I.checkElement('#ct-type-cy')).equal(true);
  await I.clearField('#ct-type-cy');

  expect(await I.checkElement('#ct-type')).equal(true);
  await I.clearField('#ct-type');
});


Then('I enter {string} in opening type name textbox', async (name: string) => {
  const selector = '#ct-type';
  await I.isElementVisible(selector, 5000);
  await populateField(selector, name);
});

Then('I enter {string} in opening type welsh name textbox', async (nameCy: string) => {
  const selector = '#ct-type-cy';
  await I.isElementVisible(selector, 5000);
  await populateField(selector, nameCy);
});

When('I click Opening Type save button', async () => {
  const selector = '#saveOpeningTypeBtn';
  await I.isElementVisible(selector, 5000);
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('A green message is displayed for the updated Opening Type {string}', async (message: string) => {
  const selector = '#openingTypesListContent > div.govuk-panel.govuk-panel--confirmation > h1';
  await I.isElementVisible(selector, 5000);
  expect(await I.checkElement(selector)).equal(true);
  const messageUpdate = await I.getElement(selector);
  expect(await I.getElementText(messageUpdate)).equal(message);
});

Then('I click on Add new Opening Type',async () => {
  const selector = '#openingTypesListContent > div > a';
  await I.isElementVisible(selector, 5000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('The error message displays for a Opening type {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('#error-summary-title');
  expect(errorTitle).equal(true);

  const selector = '#openingTypesListContent > div.govuk-error-summary > div > ul > li';
  await I.isElementVisible(selector, 5000);
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('I click {string} delete Opening type button',async (contactTypeTest: string) => {
  const tableRow = await getFirstTableRowIndexContainingText('#openingTypesListContent', 1, contactTypeTest);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#openingTypesListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(3) > a`;
  await I.isElementVisible(selector, 5000);
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});
