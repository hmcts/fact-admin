import {expect} from 'chai';
import {Given, Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {puppeteerConfig} from '../puppeteer.config';

async function fillInEmail(email: string) {
  const usernameEl = await I.checkElement('#email');
  expect(usernameEl).equal(true);
  await I.setElementValueForInputField('#email', email);
}

async function fillInPassword(password: string) {
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
  const title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access') {
    const element = await I.getElement('h1');
    const text = await I.getElementText(element);
    expect(text).equal('Enter your email address');
  }
});

When('I fill in the Username and Password fields with my authenticated credentials', async () => {
  let title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access') {
    const username = puppeteerConfig.username;
    await fillInEmail(username);
    await I.click('#main-content > div > div > form > div.govuk-button-group > button');
  }
  title = await I.getPageTitle();
  if (title == 'Enter your password - HMCTS Access') {
    const password = puppeteerConfig.password;
    await fillInPassword(password);
  }
});

When('I fill in the email field with my authenticated username', async () => {
  const title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access') {
    const username = puppeteerConfig.username;
    await fillInEmail(username);
  }
});

When('I fill in the password field', async () => {
  const title = await I.getPageTitle();
  if (title == 'Enter your password - HMCTS Access') {
    const password = puppeteerConfig.password;
    await fillInPassword(password);
  }
});

When('I fill in the Username and Password fields with test user credentials with no role', async () => {
  let title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access') {
    const username = puppeteerConfig.testUsername;
    await fillInEmail(username);
    await I.click('#main-content > div > div > form > div.govuk-button-group > button');
  }
  title = await I.getPageTitle();
  if (title == 'Enter your password - HMCTS Access') {
    const password = puppeteerConfig.password;
    await fillInPassword(password);
  }
});

When('I fill in the email field with my test user email with no role', async () => {
  const title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access') {
    const username = puppeteerConfig.testUsername;
    await fillInEmail(username);
  }
});

When('I fill in the Username and Password fields with my super user authenticated credentials', async () => {
  let title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access') {
    const username = puppeteerConfig.superUsername;
    await fillInEmail(username);
    await I.click('#main-content > div > div > form > div.govuk-button-group > button');
  }
  title = await I.getPageTitle();
  if (title == 'Enter your password - HMCTS Access') {
    const password = puppeteerConfig.password;
    await fillInPassword(password);
  }
});

When('I fill in the email field with my super user authenticated username', async () => {
  const title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access') {
    const username = puppeteerConfig.superUsername;
    await fillInEmail(username);
  }
});

When('I fill in the Username and Password fields with my viewer authenticated credentials', async () => {
  let title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access') {
    const username = puppeteerConfig.viewerUsername;
    await fillInEmail(username);
    await I.click('#main-content > div > div > form > div.govuk-button-group > button');
  }
  title = await I.getPageTitle();
  if (title == 'Enter your password - HMCTS Access') {
    const password = puppeteerConfig.password;
    await fillInPassword(password);
  }
});

When('I fill in the email field with my viewer authenticated username', async () => {
  const title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access') {
    const username = puppeteerConfig.viewerUsername;
    await fillInEmail(username);
  }
});

When('I fill in the Username and Password fields with my incorrect authenticated credentials {string} {string}',
  async (username: string, password: string) => {
    let title = await I.getPageTitle();
    if (title == 'Enter your email address - HMCTS Access') {
      await fillInEmail(username);
      await I.click('#main-content > div > div > form > div.govuk-button-group > button');
    }
    title = await I.getPageTitle();
    if (title == 'Enter your password - HMCTS Access') {
      await fillInPassword(password);
    }
  });

When('I fill in the email field with my incorrect authenticated credentials {string}', async (username: string) => {
  const title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access') {
    await fillInEmail(username);
  }
});

When('I fill in the password field with my incorrect authenticated password {string}', async (password: string) => {
  const title = await I.getPageTitle();
  if (title == 'Enter your password - HMCTS Access') {
    await fillInPassword(password);
  }
});

Given('click the Sign In button', async () => {
  const title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access' || title == 'Enter your password - HMCTS Access' ) {
    await I.click('#main-content > div > div > form > div.govuk-button-group > button');
  }
});

Then('the system will sign me in', async () => {
  const title = await I.getPageTitle();
  if (title == 'Courts and tribunals – Find a Court or Tribunal Admin Service – GOV.UK') {
    const element = await I.checkElement('#logout');
    expect(element).equal(true);
  }
});

Then('an error message is shown', async () => {
  const title = await I.getPageTitle();
  if (title == 'Enter your email address - HMCTS Access') {
    const element = await I.checkElement('.error-summary');
    expect(element).equal(true);
  }
});

Then('an error message is shown {string}', async (errmsg: string) => {
  const element = await I.checkElement('.govuk-error-summary');
  expect(element).equal(true);
  const elementErr = await  I.getElement('#main-content > div.govuk-error-summary > div > div > ul > li');
  expect(errmsg).equal(await I.getElementText(elementErr));
});


