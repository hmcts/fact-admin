import {When,Then} from 'cucumber';
import { expect } from 'chai';

import * as I from '../utlis/puppeteer.util';

When('I click the postcodes tab', async () => {
  const selector = '#tab_postcodes';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('A green message is displayed for the postcodes {string}', async (message: string) => {
  const selector = '#postcodesContent > div.govuk-panel.govuk-panel--confirmation > h1';
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

When('I choose the postcodes bd4 and bd2 to move them from the source court to the destination court', async () => {
  const postcode1 = '#BD4';
  const postcode2 = '#BD2';

  const elementExist1 = await I.checkElement(postcode1);
  expect(elementExist1).equal(true);
  const elementExist2 = await I.checkElement(postcode2);
  expect(elementExist2).equal(true);

  await I.click(postcode1);
  await I.click(postcode2);
});

Then('I choose the destination court as {string}',async (destinationCourt: string) => {
  const selector = '#movePostcodesSelect';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);

  await I.selectItem(selector, destinationCourt);
  await I.click('button[name="movePostcodesButton"]');
});

Then('I click the move button', async () => {
  const buttonSelector = 'button[name="movePostcodesButton"]';
  const elementExist = await I.checkElement(buttonSelector);
  expect(elementExist).equal(true);
  await I.click(buttonSelector);
  //deleting destination court postcodes for next test run
  await I.click('#courts');
  await I.click('#edit-aldridge-magistrates-court');
  await I.click('#tab_postcodes');
  await I.click('#postcodes-select-all');
  await I.click('button[name="deletePostcodes"]');
});
