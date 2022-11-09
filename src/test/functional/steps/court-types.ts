import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';


When('I hover over types nav element', async () => {
  const selector = '#nav';
  const elementExist = await I.checkElement(selector, 30000);
  expect(elementExist).equal(true);
  await I.hover(selector);
});


When('I click the types tab', async () => {
  const selector = '#tab_court-types';
  const elementExist = await I.checkElement(selector, 30000);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I check a court type', async () => {
  const selector = '#court_types-3';
  const elementExist = await I.checkElement('#court_types-3', 30000);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I click on save court type', async () => {
  await FunctionalTestHelpers.clickButton('#courtTypesTab', 'saveCourtTypes');
});

Then('a green update message is displayed showing Court Types updated', async () => {
  const elementExist = await I.checkElement('#courtTypesTab .govuk-panel--confirmation', 30000);
  expect(elementExist).equal(true);
});

When('I uncheck a court type', async () => {
  const selector = '#court_types-3';
  await I.click(selector);

  const checked = await I.isElementChecked('#court_types-3');
  expect(checked).equal(false);
});

Then('a court types error message is displayed', async () => {
  const elementExist = await I.checkElement('#courtTypesContent > div.govuk-error-summary > div > ul > li', 30000);
  expect(elementExist).equal(true);
});

When('I check a court type which has code associated with it', async () => {
  const selector = '#court_types';
  const elementExist = await I.checkElement('#court_types', 30000);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I will make sure that one of the court type is selected', async () => {
  const selector = '#court_types-2';
  const elementExist = await I.checkElement(selector, 30000);
  expect(elementExist).equal(true);

  const elementChecked = await I.isElementChecked(selector);
  if (!elementChecked) {
    await I.click(selector);
  }
});

Then('I will clear the existing gbs code and enter new the one {string}', async (gbCode: string) => {
  const selector = 'input[name=gbsCode]';
  const elementExist = await I.checkElement(selector, 30000);
  expect(elementExist).equal(true);

  await I.clearField(selector);
  await I.setElementValueForInputField(selector, gbCode);
});

When('I remove all existing DX Codes entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#courtTypesTab', 'deleteDxCode', 'saveCourtTypes');
});

Then('I click add new Dx Code button', async () => {
  const selector = 'button[name=addDxCode]';
  const elementExist = await I.checkElement(selector, 30000);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I enter a new DX Code {string} explanation {string} and explanation Cy {string}', async (dxCode: string, explanation: string, explanationCy: string ) => {

  const numFieldsets = await I.countElement('#courtTypesTab fieldset');
  const entryFormIdx = numFieldsets - 2;

  const selectorCode = '#courtTypesTab input[name$="[code]"]';
  const selectorExp = '#courtTypesTab input[name$="[explanation]"]';
  const selectorExpCy = '#courtTypesTab input[name$="[explanationCy]"]';

  const elementExistCode = await I.checkElement(selectorCode, 30000);
  expect(elementExistCode).equal(true);

  const elementExistExp = await I.checkElement(selectorExp, 30000);
  expect(elementExistExp).equal(true);

  const elementExistExpCy = await I.checkElement(selectorExpCy, 30000);
  expect(elementExistExpCy).equal(true);

  await I.setElementValueAtIndex(selectorCode, entryFormIdx, dxCode, 'input');
  await I.setElementValueAtIndex(selectorExp, entryFormIdx, explanation, 'input');
  await I.setElementValueAtIndex(selectorExpCy, entryFormIdx, explanationCy, 'input');
});
