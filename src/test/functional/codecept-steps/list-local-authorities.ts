import {expect} from 'chai';
import { I } from '../utlis/codecept-util';
import {FunctionalTestHelpers} from '../utlis/helpers';


When('I click on lists link', async () => {
  const selector = '#lists';
  I.seeElement(selector);
  I.click(selector);
});

Then('I am redirected to the {string} page', async (editListTitle: string) => {
  const selector = '#main-content > h1';
  expect(await I.grabTextFrom(selector)).equal(editListTitle);
});

When('I hover over the tab title', async () => {
  const selector = '#nav';
  I.seeElement(selector);
  I.moveCursorTo(selector);
});

When('I click on local authorities list', async () => {
  const selector = '#tab_local-authorities';
  I.seeElement(selector);
  I.click(selector);
});

Then('I should land in {string} page', async (editLocalAuthorityTitle: string) => {
  const selector = '#localAuthoritiesListContent > h2';
  expect(await I.grabTextFrom(selector)).equal(editLocalAuthorityTitle);
});

When('I select local authority {string}', async (localAuthorityId: string) => {
  const selector = '#' + localAuthorityId;
  I.seeElement(selector);
  I.click(selector);
});

When('I edit the local authority {string}', async (newLocalAuthority: string) => {
  const selector = '#local-authority';
  I.fillField(selector, newLocalAuthority);
});

When('I click on save local authority list', async () => {
  await FunctionalTestHelpers.clickButton('#localAuthoritiesListTab', 'saveLocalAuthoritiesList');
});

Then('Success message is displayed for local authorities list with summary {string}', async (successMsg: string) => {
  const selector = '#localAuthoritiesListContent > div.govuk-panel.govuk-panel--confirmation > h1';
  expect((await I.grabTextFrom(selector)).trim()).equal(successMsg);
});

Then('An error is displayed for edit local authorities with title {string} and summary {string}', async (errorTitle: string, errorSummery: string) => {
  const errorTitleSelector = '.govuk-error-summary__title';
  const errorSummerySelector = '#localAuthoritiesListContent > div.govuk-error-summary > div > div > ul > li';

  I.seeElement(errorTitleSelector);
  I.seeElement(errorSummerySelector);

  expect((await I.grabTextFrom(errorTitleSelector)).trim()).equal(errorTitle);
  expect((await I.grabTextFrom(errorSummerySelector)).trim()).equal(errorSummery);
});
