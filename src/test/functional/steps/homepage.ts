import { Given, Then } from 'cucumber';
import { expect } from 'chai';

import { config } from '../../config';
import * as I from '../utlis/puppeteer.util';

Given('I am on FACT homepage', async function() {
  await I.newPage();
  await I.goTo(config.TEST_URL);
});

Given('I am on new browser', async function() {
  await I.newBrowser();
});

Then('I expect the page header to be {string}', async function(title: string) {
  const pageTitle = await I.getPageTitle();
  expect(pageTitle).equal(title);
});
