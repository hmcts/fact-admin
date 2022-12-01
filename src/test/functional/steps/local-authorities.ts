import {Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I hover over local authorities nav element', async () => {
  const selector = '#nav';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.hover(selector);
});


When('I will make sure Family court type is selected', async () => {
  const selector = '#court_types-2';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  const elementChecked = await I.isElementChecked(selector);
  if (!elementChecked) {
    await I.click(selector);
    await I.fillField('#familyCourtCode', '123');
  }
  if (await I.isElementVisible('#familyCourtCode-error', 5000)) {
    await I.fillField('#familyCourtCode', '123');
  }
});

Then('I make sure there is no area of law selected', async () => {

  const courtHtmlElement: [string] = await I.getTextFromSelector('#casesHearCheckboxes > div > div > div > div > input');
  expect(courtHtmlElement.length > 0).equal(true);

  for (let i = 0; i < courtHtmlElement.length; ++i) {
    const selectorIdName = courtHtmlElement[i].toLowerCase().replace(/ /g, '-');
    if (await I.isElementChecked('#' + selectorIdName)) {
      await I.click('#' + selectorIdName);
    }
  }
});

When('I click the local authorities tab', async () => {
  const selector = '#tab_local-authorities';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I select area of law {string}', async (areaOfLaw: string) => {
  const selector = '#courtAreasOfLaw';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.selectItem(selector, areaOfLaw);
});

When('I select {string}', async (areaOfLaw: string) => {
  const selector = '#\\33 97353';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  const elementChecked = await I.isElementChecked(selector);
  if (!elementChecked) {
    await I.click(selector);
  }
});

When('I click on local authorities save button', async () => {
  await FunctionalTestHelpers.clickButton('#localAuthoritiesTab', 'saveLocalAuthorities');
});

Then('Success message is displayed for local authorities with summary {string}', async (successMsg: string) => {
  const selector = '#localAuthoritiesContent > div.govuk-panel.govuk-panel--confirmation > h1';
  const successTitleElement = await I.getElement(selector);
  expect(await I.getElementText(successTitleElement)).equal(successMsg);
});

Then('An error is displayed for local authorities with title {string} and summery {string}', async (errorTitle: string, errorSummery: string) => {
  const errorTitleSelector = '#error-summary-title';
  const errorSummerySelector = '#localAuthoritiesContent > div > div > ul > li';

  expect(await I.checkElement(errorTitleSelector)).equal(true);
  expect(await I.checkElement(errorSummerySelector)).equal(true);

  const errorTitleElement = await I.getElement(errorTitleSelector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  const errorSummeryElement = await I.getElement(errorSummerySelector);
  expect(await I.getElementText(errorSummeryElement)).equal(errorSummery);
});

When('I will make sure Family court type is not selected', async () => {
  const selectorFamilyCourt = '#court_types-2';
  const elementFamilyCourtExist = await I.checkElement(selectorFamilyCourt);
  expect(elementFamilyCourtExist).equal(true);
  const elementFamilyCourtChecked = await I.isElementChecked(selectorFamilyCourt);
  if (elementFamilyCourtChecked) {
    await I.click(selectorFamilyCourt);
  }
});

Then('The local authorities tab should be disabled', async () => {

  const selector = '#tab_local-authorities.disable-tab';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
});
