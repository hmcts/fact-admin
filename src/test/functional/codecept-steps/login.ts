import { config as testConfig } from '../../config';
import { expect } from 'chai';
import { I } from '../utlis/codecept-util';
import {puppeteerConfig} from '../puppeteer.config';


async function fillInUsernameAndPassword(username: string, password: string) {
  I.seeElement('#username');
  await I.fillField('#username', username);
  await I.seeElement('#password');
  await I.fillField('#password', password);
}

Given('that I am a logged-out admin or super admin user', async function() {
  I.seeElement('#login');
});

Given('I click the Login link', async function() {
  await I.click('#login');
});

Given('I am on the admin portal sign in page', async function() {
  if (await I.grabTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    const text = await I.grabTextFrom('h1');
    expect(text).equal('Sign in');
  }
});

When('I fill in the Username and Password fields with my authenticated credentials', async function() {
  if (await I.grabTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    const username = testConfig.username;
    const password = testConfig.password;
    // @ts-ignore
    await fillInUsernameAndPassword(username, password);
  }
});

When('I fill in the Username and Password fields with my super user authenticated credentials', async () => {
  if (await I.grabTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    const username = testConfig.superUsername;
    const password = testConfig.password;
    // @ts-ignore
    await fillInUsernameAndPassword(username, password);
  }
});

When('I fill in the Username and Password fields with my viewer authenticated credentials', async () => {
  if (await I.grabTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    const username = puppeteerConfig.viewerUsername;
    const password = puppeteerConfig.password;
    await fillInUsernameAndPassword(username, password);
  }
});

When('I fill in the Username and Password fields with my incorrect authenticated credentials {string} {string}',
  async (username: string, password: string) => {
    if (await I.grabTitle() == 'Sign in - HMCTS Access - GOV.UK') {
      await fillInUsernameAndPassword(username, password);
    }
  });

Given('click the Sign In button', async () => {
  if (await I.grabTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    await I.click('.button');
  }
});

Then('the system will sign me in', async () => {
  if (await I.grabTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    await I.seeElement('#logout');
  }
});

Then('an error message is shown', async () => {
  if (await I.grabTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    I.seeElement('.error-summary');
  }
});
