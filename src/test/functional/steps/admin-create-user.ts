import {When,Then} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

async function populateField(fieldElement: string, value: string) {
  expect(await I.checkElement(fieldElement)).equal(true);
  await I.setElementValueForInputField(fieldElement, value);
}

When('I click on my account link', async () => {
  const selector = '#users';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I am redirected to the page {string}', async (inviteUser: string) => {
  const selector = '#inviteUserContent > h2';
  const pageTitleElement = await I.getElement(selector);
  expect(await I.getElementText(pageTitleElement)).equal(inviteUser);
});

When('I enter Email {string}', async (email: string) => {
  const selector = '#email';
  await populateField(selector, email);
});

When('I enter Last Name {string}', async (lastName: string) => {
  const selector = '#lastName';
  await populateField(selector, lastName);
});

When('I enter First Name {string}', async (firstName: string) => {
  const selector = '#firstName';
  await populateField(selector, firstName);
});

Then('I select the user role as fact-admin', async () => {
  const selector = '#account\\[roles\\]\\[\\]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I click create user button', async () => {
  const selector = 'button[name="inviteUser"]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I enter Password {string}', async (password: string) => {
  const selector = '#password';
  await populateField(selector, password);
});

Then('I click confirm button', async () => {
  const selector = 'button[name="confirmInvite"]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can see green success message {string}', async (message: string) => {
  const selector = '#inviteUserContent > div.govuk-panel.govuk-panel--confirmation > h1';
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});

Then('The error message display for creating user {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('#error-summary-title');
  expect(errorTitle).equal(true);

  const selector = '#inviteUserContent > div > div > ul > li';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});
