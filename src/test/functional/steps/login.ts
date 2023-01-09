import {expect} from 'chai';
import {Given, Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {puppeteerConfig} from '../puppeteer.config';


async function fillInUsernameAndPassword(username: string, password: string) {
  const usernameEl = await I.checkElement('#username');
  expect(usernameEl).equal(true);
  await I.setElementValueForInputField('#username', username);

  const passwordEl = await I.checkElement('#password');
  expect(passwordEl).equal(true);

  await I.setElementValueForInputField('#password', password);
}

Given('that I am a logged-out admin or super admin user', async () => {
  const element = await I.checkElement('#login');
  expect(element).equal(true);
});

Given('I click the Login link', async () => {
  await I.click('#login');
});

Given('I am on the admin portal sign in page', async () => {
  if (await I.getPageTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    const element = await I.getElement('h1');
    const text = await I.getElementText(element);
    expect(text).equal('Sign in');
  }
});

When('I fill in the Username and Password fields with my authenticated credentials', async () => {
  if (await I.getPageTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    const username = puppeteerConfig.username;
    const password = puppeteerConfig.password;
    await fillInUsernameAndPassword(username, password);
  }
});

When('I fill in the Username and Password fields with my super user authenticated credentials', async () => {
  if (await I.getPageTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    const username = puppeteerConfig.superUsername;
    const password = puppeteerConfig.password;
    await fillInUsernameAndPassword(username, password);
  }
});

When('I fill in the Username and Password fields with my viewer authenticated credentials', async () => {
  if (await I.getPageTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    const username = puppeteerConfig.viewerUsername;
    const password = puppeteerConfig.password;
    await fillInUsernameAndPassword(username, password);
  }
});

When('I fill in the Username and Password fields with my incorrect authenticated credentials {string} {string}',
  async (username: string, password: string) => {
    if (await I.getPageTitle() == 'Sign in - HMCTS Access - GOV.UK') {
      await fillInUsernameAndPassword(username, password);
    }
  });

Given('click the Sign In button', async () => {
  if (await I.getPageTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    await I.click('.button');
  }
});

Then('the system will sign me in', async () => {
  if (await I.getPageTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    const element = await I.checkElement('#logout');
    expect(element).equal(true);
  }
});

Then('an error message is shown', async () => {
  if (await I.getPageTitle() == 'Sign in - HMCTS Access - GOV.UK') {
    const element = await I.checkElement('.error-summary');
    expect(element).equal(true);
  }
});
