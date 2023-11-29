import {expect} from 'chai';
import { I } from '../utlis/codecept-util';

async function checkAndClearField (aofFieldElement: string) {
  I.seeElement(aofFieldElement);
  await I.clearField(aofFieldElement);
}

async function populateField(fieldElement: string, value: string) {
  I.seeElement(fieldElement);
  I.fillField(fieldElement, value);
 }

When('I click on areas of law list', async () => {
  const selector = '#tab_areas-of-law';
  I.seeElement(selector);
  await I.click(selector);
});

Then('I should see {string} page', async (editAreaofLawTitle: string) => {
  const selector = '#areasOfLawListContent > h2';
  expect(await I.grabTextFrom(selector)).equal(editAreaofLawTitle);
});

Given('I click edit {string}', async (areaOfLawName: string) => {
  const selector = '#areasOfLawListContent table tr td:nth-child(1)';
  const courtHtmlElement: string[] = await I.grabTextFromAll(selector);
  const tableRow  = courtHtmlElement.indexOf(areaOfLawName);

  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selectorEdit = `#areasOfLawListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(2) > a`;
  I.seeElement(selectorEdit);
  I.click(selectorEdit);
});

Then('I am redirected to the {string} form', async (editFinancialRemedy: string) => {
  const selector = '#areasOfLawListContent > h2';
  expect(await I.grabTextFrom(selector)).equal(editFinancialRemedy);
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
  I.seeElement(selector);
  I.click(selector);
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
  I.seeElement(selector);
  expect((await I.grabTextFrom(selector)).trim()).equal(message);
});

Then('I click on Add new Area of law',async () => {
  const selector = '#areasOfLawListContent > div > a';
  I.seeElement(selector);
  I.click(selector);
});

Then('I enter {string} in Name textbox', async (newName: string) => {
  const selector = '#aol-name';
  await populateField(selector, newName);
});

When('I click confirm delete button',async () => {
  const selector = '#confirmDelete';
  I.seeElement(selector);
  I.click(selector);
});


Then('I click {string} delete button',async (aolTest: string) => {
  const selector = '#areasOfLawListContent table tr td:nth-child(1)';
  const courtHtmlElement: string[] = await I.grabTextFromAll(selector);
  const tableRow  = courtHtmlElement.indexOf(aolTest);

  // The table row index returned is zero-based but nth-child works on a 1-based index so we add one.
  const selectorEdit = `#areasOfLawListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(3) > a`;
  I.seeElement(selectorEdit);
  I.click(selectorEdit);
});

When('I click delete button for Area of law {string}',async (aolName: string) => {
  const selector = '#areasOfLawListContent table tr td:nth-child(1)';
  const courtHtmlElement: string[] = await I.grabTextFromAll(selector);
  const tableRow  = courtHtmlElement.indexOf(aolName);
  const selectorDelete = `#areasOfLawListContent > table > tbody > tr:nth-child(${tableRow + 1}) > td:nth-child(3) > a`;
  I.seeElement(selectorDelete);
  I.click(selectorDelete);
});

Then('The error message displays {string}', async (errMessage: string) => {
  I.seeElement('.govuk-error-summary__title');
  const selector = '#areasOfLawListContent > div.govuk-error-summary > div > div > ul > li';
  expect((await I.grabTextFrom(selector)).trim()).equal(errMessage);
});
