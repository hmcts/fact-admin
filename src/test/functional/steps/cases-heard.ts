import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I click the cases heard tab', async () => {
  const selector = '#tab_cases-heard';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the areas of law listed', async () => {
  const elementExist = await I.isElementVisible('#casesHeardForm');
  expect(elementExist).equal(true);
});

When('I select area of law with id {int} and {int}', async (areaOfLaw1: number, areaOfLaw2: number) => {
  const selector1 = '#\\33 4255';
  const selector2 = '#\\33 4247';
  const element1Exist = await I.checkElement(selector1);
  expect(element1Exist).equal(true);
  const element1Checked = await I.isElementChecked(selector1);
  if (!element1Checked) {
    await I.click(selector1);
  }
  const element2Exist = await I.checkElement(selector2);
  expect(element2Exist).equal(true);
  const element2Checked = await I.isElementChecked(selector2);
  if (!element2Checked) {
    await I.click(selector2);
  }
});

When('And I click on update cases heard', async () => {
  await FunctionalTestHelpers.clickButton('#casesHeardTab', 'updateCasesHeard');
});

Then('Success message is displayed for cases heard with summary {string}', async (successMsg: string) => {
  const selector = '#casesHeardContent > div.govuk-panel.govuk-panel--confirmation > h1';
  const successTitleElement = await I.getElement(selector);
  expect(await I.getElementText(successTitleElement)).equal(successMsg);
});

When('I reload the page', async () => {
  await I.reloadPage();
});

Then('area of law with id {int} and {int} should be selected', async (areaOfLaw1: number, areaOfLaw2: number) => {
  const selector1 = '#\\33 4255';
  const selector2 = '#\\33 4247';
  const element1Exist = await I.checkElement(selector1);
  expect(element1Exist).equal(true);
  const element1Checked = await I.isElementChecked(selector1);
  expect(element1Checked).equal(true);
  const element2Exist = await I.checkElement(selector2);
  expect(element2Exist).equal(true);
  const element2Checked = await I.isElementChecked(selector2);
  expect(element2Checked).equal(true);
});

When('I unselect area of law with id {int} and {int}', async (areaOfLaw1: number, areaOfLaw2: number) => {
  const selector1 = '#\\33 4255';
  const selector2 = '#\\33 4247';
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

Then('area of law with id {int} and {int} should be unselected', async (areaOfLaw1: number, areaOfLaw2: number) => {
  const selector1 = '#\\33 4255';
  const selector2 = '#\\33 4247';
  const element1Exist = await I.checkElement(selector1);
  expect(element1Exist).equal(true);
  const element1Checked = await I.isElementChecked(selector1);
  expect(element1Checked).equal(false);
  const element2Exist = await I.checkElement(selector2);
  expect(element2Exist).equal(true);
  const element2Checked = await I.isElementChecked(selector2);
  expect(element2Checked).equal(false);
});





