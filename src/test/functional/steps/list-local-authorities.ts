import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I click on lists link', async () => {
  const selector = '#lists';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I am redirected to the {string} page', async (editListTitle: string) => {
  const selector = '#main-content > h1';
  const pageTitleElement = await I.getElement(selector);
  expect(await I.getElementText(pageTitleElement)).equal(editListTitle);
});

When('I hover over the tab title', async () => {
  const selector = '#nav';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.hover(selector);
});

When('I click on local authorities list', async () => {
  const selector = '#tab_local-authorities';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I should land in {string} page', async (editLocalAuthorityTitle: string) => {
  const selector = '#localAuthoritiesListContent > h2';
  const pageTitleElement = await I.getElement(selector);
  expect(await I.getElementText(pageTitleElement)).equal(editLocalAuthorityTitle);
});

When('I select local authority {string}', async (localAuthorityId: string) => {
  const selector = '#' + localAuthorityId;
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  const elementChecked = await I.isElementChecked(selector);
  if (!elementChecked) {
    await I.click(selector);
  }
});

When('I edit the local authority {string}', async (newLocalAuthority: string) => {
  const selector = '#local-authority';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.setElementValueForInputField(selector, newLocalAuthority);
});

When('I click on save local authority list', async () => {
  await FunctionalTestHelpers.clickButton('#localAuthoritiesListTab', 'saveLocalAuthoritiesList');
});

Then('Success message is displayed for local authorities list with summary {string}', async (successMsg: string) => {
  const selector = '#localAuthoritiesListContent > div.govuk-panel.govuk-panel--confirmation > h1';
  const successTitleElement = await I.getElement(selector);
  expect(await I.getElementText(successTitleElement)).equal(successMsg);
});

Then('An error is displayed for edit local authorities with title {string} and summary {string}', async (errorTitle: string, errorSummery: string) => {
  const errorTitleSelector = '#error-summary-title';
  const errorSummerySelector = '#localAuthoritiesListContent > div.govuk-error-summary > div > div > ul > li';

  expect(await I.checkElement(errorTitleSelector)).equal(true);
  expect(await I.checkElement(errorSummerySelector)).equal(true);

  const errorTitleElement = await I.getElement(errorTitleSelector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  const errorSummeryElement = await I.getElement(errorSummerySelector);
  expect(await I.getElementText(errorSummeryElement)).equal(errorSummery);
});





