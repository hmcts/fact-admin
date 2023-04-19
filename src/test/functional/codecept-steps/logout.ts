
import { expect } from 'chai';
import { I } from '../utlis/codecept-util';
//import * as I from '../utlis/puppeteer.util';

Given('that I am a logged-in admin or super admin user', async () => {
 I.dontSeeElementInDOM('#logout')
});

Then('I am logged out if I am a super admin', async () => {
  if (await I.grabTitle() !== 'Sign in - HMCTS Access - GOV.UK') {
    console.log('logging out as super user');
    I.click('#logout');
  }
});

Then('I am logged out if I am an admin user', async () => {
  if (await I.grabTitle() !== 'Sign in - HMCTS Access - GOV.UK') {
    console.log('logging out as an admin user');
    I.click('#logout');
  }
});

Given('I click the Logout link', async () => {
  if (await I.grabTitle() !== 'Sign in - HMCTS Access - GOV.UK') {
     I.click('#logout');
  }
});

Then('the system will log me out', async () => {
  const element = await I.grabTitle();
  expect(element).equal('Sign in - HMCTS Access - GOV.UK');
});
