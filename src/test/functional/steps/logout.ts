import { expect } from 'chai';
import { Given, Then } from 'cucumber';

import * as I from '../utlis/puppeteer.util';

Given('that I am a logged-in admin or super admin user', async function() {
  let element = await I.checkElement('#logout');
  if (!element) {
    await I.click('#login');
    element = await I.checkElement('#logout');
  }
  expect(element).equal(true);
});

Given('I click the Logout link', async () => {
  await I.click('#logout');
});

Then('the system will log me out', async function() {
  const element = await I.checkElement('#login');
  expect(element).equal(true);
});
