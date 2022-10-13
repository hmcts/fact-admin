import {Given, Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';

async function populateField(fieldElement: string, value: string) {
  expect(await I.checkElement(fieldElement)).equal(true);
  await I.setElementValueForInputField(fieldElement, value);
}

When('I hover over general nav element', async () => {
  const selector = '#nav';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.hover(selector);
});

When('I click the general tab', async () => {
  const selector = '#tab_general';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the urgent notices', async () => {
  const selector1 = '#generalInfoTab #urgent-notice';
  const selector2 = '#generalInfoTab #urgent-notice-welsh';
  await I.isElementVisible(selector1, 3000);
  await I.isElementVisible(selector2, 3000);
  const urgentNoticesExist = await I.checkElement(selector1);
  const welshUrgentNoticesExist = await I.checkElement(selector2);
  expect(urgentNoticesExist).equal(true);
  expect(welshUrgentNoticesExist).equal(true);
});

Then('I can view the PUAS flag', async () => {
  const selector = '#generalInfoTab #access_scheme';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  expect(await I.checkElement(selector)).equal(true);
});

Then('I cannot view super admin content', async () => {
  expect(await I.isElementVisible('#generalInfoTab #open', 3000)).equal(false);
  expect(await I.isElementVisible('#generalInfoTab #info', 3000)).equal(false);
  expect(await I.isElementVisible('#generalInfoTab #info_cy', 3000)).equal(false);
});

Then('I can view the open checkbox', async () => {
  const selector = '#generalInfoTab #open';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const openCheckboxExists = await I.checkElement(selector);
  expect(openCheckboxExists).equal(true);
});

Then('I can view the access scheme checkbox', async () => {
  const selector = '#generalInfoTab #access_scheme';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const accessSchemeCheckboxExists = await I.checkElement(selector);
  expect(accessSchemeCheckboxExists).equal(true);
});

Then('I can view common platform flag checkbox', async () => {
  const selector = '#common_platform';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const commonPlatformCheckboxExists = await I.checkElement(selector);
  expect(commonPlatformCheckboxExists).equal(true);
});

Then('I can view the additional information notices', async () => {
  const selector1 = '#generalInfoTab #info';
  const selector2 = '#generalInfoTab #info_cy';
  await I.isElementVisible(selector1, 3000);
  await I.isElementVisible(selector2, 3000);
  const additionalInfoExists = await I.checkElement(selector1);
  const welshAdditionalInfoExists = await I.checkElement(selector2);
  expect(additionalInfoExists).equal(true);
  expect(welshAdditionalInfoExists).equal(true);
});

Then('a success message is displayed on the general info tab {string}', async (successMsg: string) => {
  const selector = '#generalInfoContent > div.govuk-panel.govuk-panel--confirmation > h1';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const successTitleElement = await I.getElement(selector);
  expect(await I.getElementText(successTitleElement)).equal(successMsg);
});

Given('I click the general info save button', async () => {
  await I.click('#saveGeneralInfoBtn');
  await new Promise(f => setTimeout(f, 10000));
});

Then('I enter {string} in the Name textbox', async (name: string) => {
  const selector = '#edit-name';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  await populateField(selector, name);
});

Then('The error message displays for general info {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('#error-summary-title');
  expect(errorTitle).equal(true);

  const selector = '#generalInfoContent > div.govuk-error-summary > div > ul > li';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Given('I click on continue button', async () => {
  await I.click('#redirectBtnId');
});

Then('I edit common platform checkbox', async () => {
  const commonPlatformCheckboxExists = await I.checkElement('#common_platform');
  expect(commonPlatformCheckboxExists).equal(true);
  await I.click('#common_platform');
});
