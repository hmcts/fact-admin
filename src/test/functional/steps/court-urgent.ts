import { Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import * as I from '../utlis/puppeteer.util';

When('I click edit next to a chosen court or tribunal', async () => {
  const elementExist = await I.checkElement('#courts > tbody > tr > td:nth-child(4) > a');
  expect(elementExist).equal(true);
  await I.click('#courts > tbody > tr > td:nth-child(4) > a');
});

Then('I am redirected to the Edit Court page for the chosen court', async () => {
  const pageTitle = await I.getPageTitle();
  expect(pageTitle).equal('Court Details');
});

When('I add an {string} in the field provided', async (message: string) => {
  await I.fillField('#urgent-notice', message);
});

Given('I click the update button', async () => {
  await I.click('.govuk-button');
});

Then('a message is displayed on the page', async () => {
  const elementExist = await I.checkElement('#updated-message');
  expect(elementExist).equal(true);
});

When('I leave the Urgent Notice field blank', async () => {
  await I.fillField('#urgent-notice', '');
});

Then('nothing is displayed on the page', async () => {
  const elementExist = await I.checkElement('#updated-message');
  expect(elementExist).equal(false);
});

When('I have added the {string} in the Urgent Notice Welsh field', async (welshMessage: string) => {
  await I.fillField('#urgent-notice-welsh', welshMessage);
});
