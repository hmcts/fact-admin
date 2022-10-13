import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';


When('I hover over types nav element', async () => {
  const selector = '#nav';
  await I.isElementVisible(selector, 5000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.hover(selector);
});


When('I click the types tab', async () => {
  const selector = '#tab_court-types';
  await I.isElementVisible(selector, 5000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I check a court type', async () => {
  const selector = '#court_types-3';
  await I.isElementVisible(selector, 5000);
  const elementExist = await I.checkElement('#court_types-3');
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I click on save court type', async () => {
  await FunctionalTestHelpers.clickButton('#courtTypesTab', 'saveCourtTypes');
});

Then('a green update message is displayed showing Court Types updated', async () => {
  const selector = '#courtTypesTab .govuk-panel--confirmation';
  await I.isElementVisible(selector, 5000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
});

When('I uncheck a court type', async () => {
  const selector = '#court_types-3';
  await I.isElementVisible(selector, 5000);
  await I.click(selector);

  const checked = await I.isElementChecked('#court_types-3');
  expect(checked).equal(false);
});

Then('a court types error message is displayed', async () => {
  const selector = '#courtTypesContent > div.govuk-error-summary > div > ul > li';
  await I.isElementVisible(selector, 5000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
});

When('I check a court type which has code associated with it', async () => {
  const selector = '#court_types';
  await I.isElementVisible(selector, 5000);
  const elementExist = await I.checkElement('#court_types');
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I will make sure that one of the court type is selected', async () => {
  const selector = '#court_types-2';
  await I.isElementVisible(selector, 5000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);

  const elementChecked = await I.isElementChecked(selector);
  if (!elementChecked) {
    await I.click(selector);
  }
});

Then('I will clear the existing gbs code and enter new the one {string}', async (gbCode: string) => {
  const selector = 'input[name=gbsCode]';
  await I.isElementVisible(selector, 5000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);

  await I.clearField(selector);
  await I.setElementValueForInputField(selector, gbCode);
});

When('I remove all existing DX Codes entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#courtTypesTab', 'deleteDxCode', 'saveCourtTypes');
});

Then('I click add new Dx Code button', async () => {
  const selector = 'button[name=addDxCode]';
  await I.isElementVisible(selector, 5000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I enter a new DX Code {string} explanation {string} and explanation Cy {string}', async (dxCode: string, explanation: string, explanationCy: string ) => {

  const numFieldsets = await I.countElement('#courtTypesTab fieldset');
  const entryFormIdx = numFieldsets - 2;

  const selectorCode = '#courtTypesTab input[name$="[code]"]';
  const selectorExp = '#courtTypesTab input[name$="[explanation]"]';
  const selectorExpCy = '#courtTypesTab input[name$="[explanationCy]"]';

  await I.isElementVisible(selectorCode, 5000);
  const elementExistCode = await I.checkElement(selectorCode);
  expect(elementExistCode).equal(true);

  await I.isElementVisible(selectorExp, 5000);
  const elementExistExp = await I.checkElement(selectorExp);
  expect(elementExistExp).equal(true);

  await I.isElementVisible(selectorExpCy, 5000);
  const elementExistExpCy = await I.checkElement(selectorExpCy);
  expect(elementExistExpCy).equal(true);

  await I.setElementValueAtIndex(selectorCode, entryFormIdx, dxCode, 'input');
  await I.setElementValueAtIndex(selectorExp, entryFormIdx, explanation, 'input');
  await I.setElementValueAtIndex(selectorExpCy, entryFormIdx, explanationCy, 'input');
});
