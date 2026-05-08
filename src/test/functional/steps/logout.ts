import {expect} from 'chai';
import {Given, Then} from 'cucumber';
import {config} from '../../config';

import * as I from '../utlis/puppeteer.util';

Given('that I am a logged-in admin or super admin user', async () => {
  let element = await I.checkElement('#logout');
  if (!element) {
    await I.click('#login');
    element = await I.checkElement('#logout');
  }
  expect(element).equal(true);
});

Then('I am logged out if I am a super admin', async () => {
  const title = await I.getPageTitle();
  if (title !== 'Enter your email address - HMCTS Access' && await I.isElementVisible('#audits', 30000)) {
    console.log('logging out as super user');
    await I.click('#logout');
    await I.goTo(config.TEST_URL);
  }
});

Then('I am logged out if I am an admin user', async () => {
  await new Promise(f => setTimeout(f, 30000));
  if (await I.getPageTitle() !== 'Enter your email address - HMCTS Access' && !(await I.isElementVisible('#audits', 30000))) {
    console.log('logging out as an admin user');
    await I.click('#logout');
    await I.goTo(config.TEST_URL);
  }
});

Given('I click the Logout link', async () => {
  if (await I.getPageTitle() !== 'Enter your email address - HMCTS Access') {
    await I.click('#logout');
    await I.goTo(config.TEST_URL);
  }
});

Then('the system will log me out', async () => {
  const element = await I.getPageTitle();
  expect(element).equal('Enter your email address - HMCTS Access');
});
