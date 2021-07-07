import {Given, Then, When} from 'cucumber';
import { expect } from 'chai';

import * as I from '../utlis/puppeteer.util';

When('I hover over general nav element', async () => {
  const selector = '#nav';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.hover(selector);
});

When('I click the general tab', async () => {
  const selector = '#tab_general';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the urgent notices', async () => {
  const urgentNoticesExist = await I.checkElement('#generalInfoTab #urgent-notice');
  const welshUrgentNoticesExist = await I.checkElement('#generalInfoTab #urgent-notice-welsh');
  expect(urgentNoticesExist).equal(true);
  expect(welshUrgentNoticesExist).equal(true);
});

Then('I cannot view super admin content', async() => {
  expect(await I.isElementVisible('#generalInfoTab #open')).equal(false);
  expect(await I.isElementVisible('#generalInfoTab #access_scheme')).equal(false);
  expect(await I.isElementVisible('#generalInfoTab #info')).equal(false);
  expect(await I.isElementVisible('#generalInfoTab #info_cy')).equal(false);
});

Then('I can view the open checkbox', async () => {
  const openCheckboxExists = await I.checkElement('#generalInfoTab #open');
  expect(openCheckboxExists).equal(true);
});

Then('I can view the access scheme checkbox', async () => {
  const accessSchemeCheckboxExists = await I.checkElement('#generalInfoTab #access_scheme');
  expect(accessSchemeCheckboxExists).equal(true);
});

Then('I can view the Covid-19 notices', async () => {
  const covidNoticeExists = await I.checkElement('#generalInfoTab #info');
  const welshCovidNoticeExists = await I.checkElement('#generalInfoTab #info_cy');
  expect(covidNoticeExists).equal(true);
  expect(welshCovidNoticeExists).equal(true);
});

Then('a success message is displayed on the tab', async () => {
  const elementExist = await I.checkElement('#generalInfoTab .govuk-panel--confirmation');
  expect(elementExist).equal(true);
});

Given('I click the save button', async () => {
  await I.click('#saveGeneralInfoBtn');
});
