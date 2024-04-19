import {expect} from 'chai';
import { I } from '../utlis/codecept-util';

async function populateField(fieldElement: string, value: string) {
  I.seeElement(fieldElement);
  I.fillField(fieldElement, value);
}

When('I click on contact type list', async () => {
  const selector = '#tab_contact-types';
  I.seeElement(selector);
  I.click(selector);
});

Given('I click edit contact type {string}', async (contactType: string) => {
  const selectorContactType = '#contactTypeListContent table tr td:nth-child(1)';
  const courtHtmlElement: string[] = await I.grabTextFromAll(selectorContactType);
  const tableRow  = courtHtmlElement.indexOf(contactType);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#contactTypeListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(2) > a`;
  I.seeElement(selector);
  I.click(selector);
});

Then('I am redirected to the contact type {string} form', async (editContactType: string) => {
  const selector = '#contactTypeListContent > h2';
  const formTitle = await I.grabTextFrom(selector);
  expect(formTitle).equal(editContactType);
});

Given('I will make sure to clear entries for the Contact Type', async () => {
  I.seeElement('#ct-type-cy');
  I.clearField('#ct-type-cy');
  I.seeElement('#ct-type');
  I.clearField('#ct-type');
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
  I.seeElement(selector);
  I.click(selector);
});

Then('A green message is displayed for the updated Contact Type {string}', async (message: string) => {
  const selector = '#contactTypeListContent > div.govuk-panel.govuk-panel--confirmation > h1';
  I.seeElement(selector);
  const messageUpdate = await I.grabTextFrom(selector);
  expect(messageUpdate.trim()).equal(message);
});

Then('I click on Add new Contact Type',async () => {
  const selector = '#contactTypeListContent > div > a';
  I.seeElement(selector);
  I.click(selector);
});

Then('The error message displays for a Contact type {string}', async (errMessage: string) => {
  I.seeElement('.govuk-error-summary__title');
  const selector = '#contactTypeListContent > div.govuk-error-summary > div > div > ul > li';
  const eleErrMessage = await I.grabTextFrom(selector);
  expect(eleErrMessage.trim()).equal(errMessage);
});

Then('I click {string} delete Contact type button',async (contactTypeTest: string) => {
  const selectorContactType = '#contactTypeListContent table tr td:nth-child(1)';
  const courtHtmlElement: string[] = await I.grabTextFromAll(selectorContactType);
  const tableRow  = courtHtmlElement.indexOf(contactTypeTest);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#contactTypeListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(3) > a`;
  I.seeElement(selector);
  I.click(selector);
});
