import {Given, Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';

async function populateField(fieldElement: string, value: string) {
  expect(await I.checkElement(fieldElement, 30000)).equal(true);
  await I.setElementValueForInputField(fieldElement, value);
}

When('I hover over general nav element', async () => {
  const selector = '#nav';
  const elementExist = await I.checkElement(selector, 30000);
  expect(elementExist).equal(true);
  await I.hover(selector);
});

When('I click the general tab', async () => {
  const selector = '#tab_general';
  const elementExist = await I.checkElement(selector, 30000);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the urgent notices', async () => {
  const urgentNoticesExist = await I.checkElement('#generalInfoTab #urgent-notice', 30000);
  const welshUrgentNoticesExist = await I.checkElement('#generalInfoTab #urgent-notice-welsh', 30000);
  expect(urgentNoticesExist).equal(true);
  expect(welshUrgentNoticesExist).equal(true);
});

Then('I can view the PUAS flag', async () => {
  expect(await I.checkElement('#generalInfoTab #access_scheme', 30000)).equal(true);
});

Then('I cannot view super admin content', async () => {
  expect(await I.isElementVisible('#generalInfoTab #open', 3000)).equal(false);
  expect(await I.isElementVisible('#generalInfoTab #info', 3000)).equal(false);
  expect(await I.isElementVisible('#generalInfoTab #info_cy', 3000)).equal(false);
});

Then('I can view the open checkbox', async () => {
  const openCheckboxExists = await I.checkElement('#generalInfoTab #open', 30000);
  expect(openCheckboxExists).equal(true);
});

Then('I can view the access scheme checkbox', async () => {
  const accessSchemeCheckboxExists = await I.checkElement('#generalInfoTab #access_scheme', 30000);
  expect(accessSchemeCheckboxExists).equal(true);
});

Then('I can view common platform flag checkbox', async () => {
  const commonPlatformCheckboxExists = await I.checkElement('#common_platform', 30000);
  expect(commonPlatformCheckboxExists).equal(true);
});

Then('I can view the additional information notices', async () => {
  const additionalInfoExists = await I.checkElement('#generalInfoTab #info', 30000);
  const welshAdditionalInfoExists = await I.checkElement('#generalInfoTab #info_cy', 30000);
  expect(additionalInfoExists).equal(true);
  expect(welshAdditionalInfoExists).equal(true);
});

Then('a success message is displayed on the general info tab {string}', async (successMsg: string) => {
  const selector = '#generalInfoContent > div.govuk-panel.govuk-panel--confirmation > h1';
  const successTitleElement = await I.getElement(selector);
  expect(await I.getElementText(successTitleElement)).equal(successMsg);
});

Given('I click the general info save button', async () => {
  await I.click('#saveGeneralInfoBtn');
  await new Promise(f => setTimeout(f, 10000));
});

Then('I enter {string} in the Name textbox', async (name: string) => {
  const selector = '#edit-name';
  await populateField(selector, name);
});

Then('The error message displays for general info {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('#error-summary-title', 30000);
  expect(errorTitle).equal(true);

  const selector = '#generalInfoContent > div.govuk-error-summary > div > ul > li';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Given('I click on continue button', async () => {
  await I.click('#redirectBtnId');
});

Then('I edit common platform checkbox', async () => {
  const commonPlatformCheckboxExists = await I.checkElement('#common_platform', 30000);
  expect(commonPlatformCheckboxExists).equal(true);
  await I.click('#common_platform');
});
