import {expect} from 'chai';
import { I } from '../utlis/codecept-util';


async function populateField(fieldElement: string, value: string) {
  I.seeElement(fieldElement);
  I.fillField(fieldElement, value);
}

When('I hover over general nav element', async () => {
  const selector = '#nav';
  I.seeElement(selector);
  I.moveCursorTo(selector);
});

When('I click the general tab', async () => {
  const selector = '#tab_general';
  I.seeElement(selector);
  await I.click(selector);
});

Then('I can view the urgent notices', async () => {
  I.seeElementInDOM('#urgent-notice');
  I.seeElementInDOM('#generalInfoTab #urgent-notice-welsh');
});

Then('I can view the PUAS flag', async () => {
  I.seeElement('#generalInfoTab #access_scheme');
});

Then('I cannot view super admin content', async () => {
  I.dontSee('#generalInfoTab #open');
  I.dontSee('#generalInfoTab #info');
  I.dontSee('#generalInfoTab #info_cy');

});

Then('I can view the open checkbox', async () => {
  I.seeElement('#generalInfoTab #open');
});

Then('I can view the access scheme checkbox', async () => {
  I.seeElement('#generalInfoTab #access_scheme');
});

Then('I can view common platform flag checkbox', async () => {
  I.seeElement('#common_platform');
});

Then('I can view the additional information notices', async () => {
  I.seeElement('#generalInfoTab #info');
  I.seeElement('#generalInfoTab #info_cy');
});

Then('a success message is displayed on the general info tab {string}', async (successMsg: string) => {
  const selector = '#generalInfoContent > div.govuk-panel.govuk-panel--confirmation > h1';
  const successTitleElement = await I.grabTextFrom(selector);
  expect(successTitleElement.trim()).equal(successMsg);
});

Given('I click the general info save button', async () => {
  await I.click('#saveGeneralInfoBtn');
  await new Promise(f => setTimeout(f, 10000));
});

Then('I enter {string} in the Name textbox', async (name: string) => {
  const selector = '#edit-name';
  await populateField(selector, name);
});

// Then('The error message displays for general info {string}', async (errMessage: string) => {
//   const errorTitle = await I.checkElement('.govuk-error-summary__title');
//   expect(errorTitle).equal(true);
//
//   const selector = '#generalInfoContent > div.govuk-error-summary > div > div > ul > li';
//   const eleErrMessage = await I.getElement(selector);
//   expect(await I.getElementText(eleErrMessage)).equal(errMessage);
// });
//
// Given('I click on continue button', async () => {
//   await I.click('#redirectBtnId');
// });
//
// Then('I edit common platform checkbox', async () => {
//   const commonPlatformCheckboxExists = await I.checkElement('#common_platform');
//   expect(commonPlatformCheckboxExists).equal(true);
//   await I.click('#common_platform');
// });