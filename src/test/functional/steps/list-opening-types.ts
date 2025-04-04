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
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Given('I click edit opening type {string}', async (contactType: string) => {
  const tableRow = await getFirstTableRowIndexContainingText('#openingTypesListContent', 1, contactType);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#openingTypesListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(2) > a`;
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I am redirected to the opening type {string} form', async (editContactType: string) => {
  const selector = '#openingTypesListContent > h2';
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
  await populateField(selector, name);
});

Then('I enter {string} in opening type welsh name textbox', async (nameCy: string) => {
  const selector = '#ct-type-cy';
  await populateField(selector, nameCy);
});

When('I click Opening Type save button', async () => {
  const selector = '#saveOpeningTypeBtn';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('A green message is displayed for the updated Opening Type {string}', async (message: string) => {
  const selector = '#openingTypesListContent > div.govuk-panel.govuk-panel--confirmation > h2';
  expect(await I.checkElement(selector)).equal(true);
  const messageUpdate = await I.getElement(selector);
  expect(await I.getElementText(messageUpdate)).equal(message);
});

Then('I click on Add new Opening Type',async () => {
  const selector = '#openingTypesListContent > div > a';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('The error message displays for a Opening type {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('.govuk-error-summary__title');
  expect(errorTitle).equal(true);
  const selector = '#openingTypesListContent > div.govuk-error-summary > div > div > ul > li';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('I will make sure there is no test entry {string} in the list {string}',async (testEntry: string, listContent: string) => {
  const selector = listContent + '> table > tbody > tr > td:nth-child(1)';
  const courtHtmlElement: string[] = await I.getTextFromElements(selector);
  expect(courtHtmlElement.length > 0).equal(true);
  let isEqual = true;
  for (let i = 0; i < courtHtmlElement.length && isEqual; i++) {
    isEqual = courtHtmlElement[i] !== testEntry;
    if(!isEqual) {
      await I.click(listContent + `> table > tbody > tr:nth-child(${i + 1}) > td:nth-child(3) > a`);
      await I.click('#confirmDelete');
    }
  }
});


Then('I click {string} delete Opening type button',async (contactTypeTest: string) => {
  const tableRow = await getFirstTableRowIndexContainingText('#openingTypesListContent', 1, contactTypeTest);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#openingTypesListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(3) > a`;
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});
