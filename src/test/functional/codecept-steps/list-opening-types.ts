import {expect} from 'chai';
import { I } from '../utlis/codecept-util';

async function populateField(fieldElement: string, value: string) {
  I.seeElement(fieldElement);
  I.fillField(fieldElement, value);
}

When('I click on Opening type list', async () => {
  const selector = '#tab_opening-types';
  I.seeElement(selector);
  I.click(selector);
});

Given('I click edit opening type {string}', async (contactType: string) => {
  const selectorContactType = '#openingTypesListContent table tr td:nth-child(1)';
  const courtHtmlElement: string[] = await I.grabTextFromAll(selectorContactType);
  const tableRow  = courtHtmlElement.indexOf(contactType);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#openingTypesListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(2) > a`;
  I.seeElement(selector);
  I.click(selector);
});

Then('I am redirected to the opening type {string} form', async (editContactType: string) => {
  const selector = '#openingTypesListContent > h2';
  const formTitle = await I.grabTextFrom(selector);
  expect(formTitle).equal(editContactType);
});

Given('I will make sure to clear entries for the opening Type', async () => {
  I.seeElement('#ct-type-cy');
  I.clearField('#ct-type-cy');
  I.seeElement('#ct-type');
  I.clearField('#ct-type');
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
  I.seeElement(selector);
  I.click(selector);
});

Then('A green message is displayed for the updated Opening Type {string}', async (message: string) => {
  const selector = '#openingTypesListContent > div.govuk-panel.govuk-panel--confirmation > h1';
  I.seeElement(selector);
  const messageUpdate = await I.grabTextFrom(selector);
  expect(messageUpdate.trim()).equal(message);
});

Then('I click on Add new Opening Type',async () => {
  const selector = '#openingTypesListContent > div > a';
  I.seeElement(selector);
  I.click(selector);
});

Then('The error message displays for a Opening type {string}', async (errMessage: string) => {
  I.seeElement('.govuk-error-summary__title');
  const selector = '#openingTypesListContent > div.govuk-error-summary > div > div > ul > li';
  const eleErrMessage = await I.grabTextFrom(selector);
  expect(eleErrMessage.trim()).equal(errMessage);
});

Then('I will make sure there is no test entry {string} in the list {string}',async (testEntry: string, listContent: string) => {
  const selector = listContent + '> table > tbody > tr > td:nth-child(1)';
  const courtHtmlElement: string[] = await I.grabTextFromAll(selector);
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
  const selectorContactType = '#openingTypesListContent table tr td:nth-child(1)';
  const courtHtmlElement: string[] = await I.grabTextFromAll(selectorContactType);
  const tableRow  = courtHtmlElement.indexOf(contactTypeTest);
  expect(tableRow).greaterThan(-1);
  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selector = `#openingTypesListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(3) > a`;
  I.seeElement(selector);
  I.click(selector);
});
