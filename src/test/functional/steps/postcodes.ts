import {Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';

When('I click the postcodes tab', async () => {
  const selector = '#tab_postcodes';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('A green message is displayed for the postcodes {string}', async (message: string) => {
  const selector = '#postcodesContent > div.govuk-panel.govuk-panel--confirmation > h1';
  await I.isElementVisible(selector, 10000);
  expect(await I.checkElement(selector)).equal(true);
  const messageUpdate = await I.getElement('#postcodesContent > div.govuk-panel.govuk-panel--confirmation > h1');
  expect(await I.getElementText(messageUpdate)).equal(message);
});

Then('I click the select all', async () => {
  const selector = '#postcodes-select-all';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I click the delete all selected button', async () => {
  const selector = 'button[name="deletePostcodes"]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I add new postcodes {string}', async (postcodes: string) => {
  const postcodeInputSelector = '#addNewPostcodes';
  const elementExist = await I.checkElement(postcodeInputSelector);
  expect(elementExist).equal(true);
  await I.setElementValueForInputField(postcodeInputSelector, postcodes);
});

Then('I click the add postcode button', async () => {
  const buttonSelector = 'button[name="addPostcodes"]';
  const elementExist = await I.checkElement(buttonSelector);
  expect(elementExist).equal(true);
  await I.click(buttonSelector);
});

Then('The error message display for the postcodes {string}', async (errorMessage: string) => {
  const errorTitle = await I.checkElement('#error-summary-title');
  expect(errorTitle).equal(true);

  const selector = '#postcodesContent > div.govuk-error-summary > div > ul';
  const errorList = await I.getElement(selector);
  expect(await I.getElementText(errorList)).equal(errorMessage);
});

When('I choose the postcodes {string} and {string} to move them from the source court to the destination court', async (firstPostcode: string,secondPostcode: string) => {
  const firstPostcodeSelector = '#'+firstPostcode;
  const secondPostcodeSelector = '#'+secondPostcode;

  const elementExistFirstPostcode = await I.checkElement(firstPostcodeSelector);
  expect(elementExistFirstPostcode).equal(true);
  const elementExistSecondPostcode = await I.checkElement(secondPostcodeSelector);
  expect(elementExistSecondPostcode).equal(true);

  await I.click(firstPostcodeSelector);
  await I.click(secondPostcodeSelector);
});

Then('I choose the destination court as {string}',async (destinationCourt: string) => {
  const selector = '#movePostcodesSelect';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.selectItem(selector, destinationCourt);
});

When('I will make sure County court type is selected', async () => {
  const selector = '#court_types-4';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  const elementChecked = await I.isElementChecked(selector);

  const codeSelector = await I.checkElement('#countyCourtCode');
  expect(codeSelector).equal(true);

  if (!elementChecked) {
    await I.click(selector);
    await I.setElementValueForInputField('#countyCourtCode','123');
  }
});

When('I will make sure to delete the existing postcodes', async () => {
  const selector = '#postcodes-select-all';
  const selectorDelete = 'button[name="deletePostcodes"]';
  const elementExist = await I.checkElement(selector);
  if (elementExist) {
    await I.click(selector);
    await I.click(selectorDelete);
  }
});

Then('I click the move button', async () => {
  const buttonSelector = 'button[name="movePostcodesButton"]';
  const elementExist = await I.checkElement(buttonSelector);
  expect(elementExist).equal(true);
  await I.click(buttonSelector);
});

Then ('I go back to the editing postcodes for source court {string}', async (destinationCourt: string)=> {
  await I.click('#courts');
  await I.click('#edit-' + destinationCourt);
  await I.click('#tab_postcodes');
});

Then('I will make sure to delete the existing postcodes for the court {string}', async (courtName: string) => {
  await I.click('#courts');

  const elementExist = await I.checkElement('#edit-' + courtName);
  expect(elementExist).equal(true);

  await I.click('#edit-' + courtName);
  await I.click('#tab_postcodes');

  const selector = '#postcodes-select-all';
  const selectorDelete = 'button[name="deletePostcodes"]';
  const selectAllElementExist = await I.checkElement(selector);
  if (selectAllElementExist) {
    await I.click(selector);
    await I.click(selectorDelete);
  }
});
