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
  expect(pageTitle).equal('Edit Court');
});

When('I add an {string} in the field provided {string}', async (message: string, id: string) => {
  await I.clearField(id);
  await I.fillField(id, message);
});

When('I add an {string} in the rich editor field provided {string}', async (message: string, id: string) => {
  await I.fillFieldInIframe(id, message);
});

Given('I click the update button', async () => {
  await I.click('#update');
});

Then('a message is displayed on the page', async () => {
  const elementExist = await I.checkElement('#updated-message');
  expect(elementExist).equal(true);
});

When('I have added the {string} in the Urgent Notice Welsh field', async (welshMessage: string) => {
  const selector = '#generalInfoTab #urgent-notice-welsh';
  await I.clearField(selector);
  await I.fillField(selector, welshMessage);
});

When('I click the open checkbox', async () => {
  await I.click('#generalInfoTab #open');
});

When('I click the Participates in access scheme checkbox', async () => {
  await I.click('#generalInfoTab #access_scheme');
});
