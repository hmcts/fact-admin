import {Given, Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {getFirstTableRowIndexContainingText} from '../utlis/puppeteer.util';
import {expect} from 'chai';

async function populateField(fieldElement: string, value: string) {
  expect(await I.checkElement(fieldElement)).equal(true);
  await I.setElementValueForInputField(fieldElement, value);
}

When('I click on contact type list', async () => {
  const selector = '#tab_contact-types';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Given('I click edit contact type {string}', async (contactType: string) => {
  const tableRow = await getFirstTableRowIndexContainingText('#contactTypeListContent', 1, contactType);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#contactTypeListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(2) > a`;
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I am redirected to the contact type {string} form', async (editContactType: string) => {
  const selector = '#contactTypeListContent > h2';
  const formTitle = await I.getElementText(await I.getElement(selector));
  expect(formTitle).equal(editContactType);
});

Given('I will make sure to clear entries for the Contact Type', async () => {
  expect(await I.checkElement('#ct-type-cy')).equal(true);
  await I.clearField('#ct-type-cy');

  expect(await I.checkElement('#ct-type')).equal(true);
  await I.clearField('#ct-type');
});

Then('I enter {string} in name textbox', async (name: string) => {
  const selector = '#ct-type';
  await populateField(selector, name);
});

Then('I enter {string} in name welsh textbox', async (nameCy: string) => {
  const selector = '#ct-type-cy';
  await populateField(selector, nameCy);
});

When('I click Contact Type save button', async () => {
  const selector = '#saveContactTypeBtn';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('A green message is displayed for the updated Contact Type {string}', async (message: string) => {
  const selector = '#contactTypeListContent > div.govuk-panel.govuk-panel--confirmation > h1';
  expect(await I.checkElement(selector)).equal(true);
  const messageUpdate = await I.getElement(selector);
  expect(await I.getElementText(messageUpdate)).equal(message);
});

Then('I click on Add new Contact Type',async () => {
  const selector = '#contactTypeListContent > div > a';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('The error message displays for a Contact type {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('#error-summary-title');
  expect(errorTitle).equal(true);

  const selector = '#contactTypeListContent > div.govuk-error-summary > div > div > ul > li';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('I click {string} delete Contact type button',async (contactTypeTest: string) => {
  const tableRow = await getFirstTableRowIndexContainingText('#contactTypeListContent', 1, contactTypeTest);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#contactTypeListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(3) > a`;
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});
