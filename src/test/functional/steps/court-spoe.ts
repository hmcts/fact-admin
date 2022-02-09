import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I click spoe tab', async () => {
  const selector = '#tab_spoe';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the spoe areas of law listed', async () => {
  const elementExist = await I.isElementVisible('#spoeForm');
  expect(elementExist).equal(true);
});

When('I select spoe areas of law {string} and {string}', async (areaOfLaw1: string, areaOfLaw2: string) => {
  const selectorAolAdoption = '#' + areaOfLaw1;
  const selectorAolChildren = '#' + areaOfLaw2;
  const element1Exist = await I.checkElement(selectorAolAdoption);
  expect(element1Exist).equal(true);
  const element1Checked = await I.isElementChecked(selectorAolAdoption);

  console.log('..............................element1check boolean...........' + element1Checked);

  if (!element1Checked) {
    await I.click(selectorAolAdoption);
  }
  const element2Exist = await I.checkElement(selectorAolChildren);
  expect(element2Exist).equal(true);
  const element2Checked = await I.isElementChecked(selectorAolChildren);

  console.log('..............................element2check boolean...........' + element2Checked);
  if (!element2Checked) {
    await I.click(selectorAolChildren);
  }
});

When('I click spoe update', async () => {
  await FunctionalTestHelpers.clickButton('#spoeTab', 'saveSpoe');
});

Then('Success message is displayed for spoe with summary {string}', async (successMsg: string) => {
  const selector = '#spoeContent > div.govuk-panel.govuk-panel--confirmation > h1';
  const successTitleElement = await I.getElement(selector);
  expect(await I.getElementText(successTitleElement)).equal(successMsg);
});

Then('spoe area of law  {string} and {string} should be selected', async (areaOfLaw1: string, areaOfLaw2: string) => {
  const selector1 = '#' + areaOfLaw1;
  const selector2 = '#' + areaOfLaw2;
  const element1Exist = await I.checkElement(selector1);
  expect(element1Exist).equal(true);
  const element1Checked = await I.isElementChecked(selector1);
  expect(element1Checked).equal(true);
  const element2Exist = await I.checkElement(selector2);
  expect(element2Exist).equal(true);
  const element2Checked = await I.isElementChecked(selector2);
  expect(element2Checked).equal(true);
});

When('I unselect spoe area of law {string} and {string}', async (areaOfLaw1: string, areaOfLaw2: string) => {
  const selector1 = '#' + areaOfLaw1;
  const selector2 = '#' + areaOfLaw2;
  const element1Exist = await I.checkElement(selector1);
  expect(element1Exist).equal(true);
  const element1Checked = await I.isElementChecked(selector1);
  if (element1Checked) {
    await I.click(selector1);
  }
  const element2Exist = await I.checkElement(selector2);
  expect(element2Exist).equal(true);
  const element2Checked = await I.isElementChecked(selector2);
  if (element2Checked) {
    await I.click(selector2);
  }
});

Then('spoe areas of law {string} and {string} should be unselected', async (areaOfLaw1: string, areaOfLaw2: string) => {
  const selector1 = '#' + areaOfLaw1;
  const selector2 = '#' + areaOfLaw2;
  const element1Exist = await I.checkElement(selector1);
  expect(element1Exist).equal(true);
  const element1Checked = await I.isElementChecked(selector1);
  expect(element1Checked).equal(false);
  const element2Exist = await I.checkElement(selector2);
  expect(element2Exist).equal(true);
  const element2Checked = await I.isElementChecked(selector2);
  expect(element2Checked).equal(false);
});
