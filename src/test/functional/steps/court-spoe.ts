import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I click spoe tab', async () => {
  const selector = '#tab_spoe';
  await I.isElementVisible(selector, 10000);
  await I.click(selector);
});

When('I select spoe areas of law {string} and {string}', async (areaOfLaw1: string, areaOfLaw2: string) => {
  const selectorAolAdoption = '#' + areaOfLaw1;
  const selectorAolChildren = '#' + areaOfLaw2;
  expect(await I.checkElement(selectorAolAdoption)).equal(true);
  const element1Checked = await I.isElementChecked(selectorAolAdoption);

  if (!element1Checked) {
    await I.click(selectorAolAdoption);
  }
  expect(await I.checkElement(selectorAolChildren)).equal(true);
  const element2Checked = await I.isElementChecked(selectorAolChildren);

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
  expect(await I.checkElement(selector1)).equal(true);
  expect(await I.isElementChecked(selector1)).equal(true);
  expect(await I.checkElement(selector2)).equal(true);
  expect(await I.isElementChecked(selector2)).equal(true);
});

When('I unselect spoe area of law {string} and {string}', async (areaOfLaw1: string, areaOfLaw2: string) => {
  const selector1 = '#' + areaOfLaw1;
  const selector2 = '#' + areaOfLaw2;
  expect(await I.checkElement(selector1)).equal(true);
  const element1Checked = await I.isElementChecked(selector1);
  if (element1Checked) {
    await I.click(selector1);
  }
  expect(await I.checkElement(selector2)).equal(true);
  const element2Checked = await I.isElementChecked(selector2);
  if (element2Checked) {
    await I.click(selector2);
  }
});

Then('spoe areas of law {string} and {string} should be unselected', async (areaOfLaw1: string, areaOfLaw2: string) => {
  const selector1 = '#' + areaOfLaw1;
  const selector2 = '#' + areaOfLaw2;

  expect(await I.checkElement(selector1)).equal(true);
  expect(await I.isElementChecked(selector1)).equal(false);
  expect(await I.checkElement(selector2)).equal(true);
  expect(await I.isElementChecked(selector2)).equal(false);
});
