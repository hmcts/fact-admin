import {expect} from 'chai';
import {Given, Then} from 'cucumber';

import * as I from '../utlis/puppeteer.util';

Given('that I am a logged-in admin or super admin user', async () => {
  let element = await I.checkElement('#logout');
  if (!element) {
    await I.click('#login');
    element = await I.checkElement('#logout');
  }
  expect(element).equal(true);
});

Given('I click the Logout link', async () => {
  if (await I.getPageTitle() !== 'Sign in - HMCTS Access - GOV.UK') {
    await I.click('#logout');
  }
});

Then('the system will log me out', async () => {
  const element = await I.getPageTitle();
  expect(element).equal('Sign in - HMCTS Access - GOV.UK');
});
