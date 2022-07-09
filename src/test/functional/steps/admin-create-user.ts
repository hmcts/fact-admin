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
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I am redirected to the page {string}', async (inviteUser: string) => {
  const selector = '#inviteUserSearchContent > h2';
  const pageTitleElement = await I.getElement(selector);
  expect(await I.getElementText(pageTitleElement)).equal(inviteUser);
});

When('I enter Email {string}', async (email: string) => {
  const selector = '#user-email';
  await populateField(selector, email);
});

When('I enter Last Name {string} to create new user', async (lastName: string) => {
  const selector = '#invite-surname';
  await I.clearField(selector);
  await populateField(selector, lastName);
});

When('I enter First Name {string} to create new user', async (firstName: string) => {
  const selector = '#invite-forename';
  await I.clearField(selector);
  await populateField(selector, firstName);
});

Then('I select the user role as fact-admin for new user', async () => {
  const selector = '#inviteUserRoles';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I select the user role as fact-admin to update user', async () => {
  const selector = '#userRole';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I click create search user button', async () => {
  const selector = 'button[name="searchUserCreate"]';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I click create user button', async () => {
  const selector = 'button[name="inviteUser"]';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

When('I enter Password {string}', async (password: string) => {
  const selector = '#password';
  await populateField(selector, password);
});

Then('I click confirm button', async () => {
  const selector = 'button[name="confirmInvite"]';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I can see green success message {string}', async (message: string) => {
  const selector = '#inviteUserSearchContent > div.govuk-panel.govuk-panel--confirmation > h1';
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});

Then('The error message display for creating user {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('#error-summary-title');
  expect(errorTitle).equal(true);
  const selector = '#inviteUserSearchContent > div > div > ul > li';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('The text message display for creating user {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('#inviteUserSearchContent > div.govuk-form-group.govuk-form-group--error > label');
  expect(errorTitle).equal(true);
  const selector = '#user-email-error';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal('Error:\n' + errMessage);
});

When('I click continue button', async () => {
  const selector = '#searchUserEditBtn';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

When('I click on edit user', async () => {
  const selector = '#tab_edit-user';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

When('I enter User Email {string}', async (email: string) => {
  const selector = '#search-user-email';
  await populateField(selector, email);
});

Then('I click search user button', async () => {
  const selector = 'button[name="searchUser"]';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I click edit user button', async () => {
  const selector = 'button[name="editUser"]';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I select the user role as fact-super-admin', async () => {
  const selector = '#userRole-2';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I change the test user role', async () => {
  const selectorSuper = '#userRole-2';
  const selectorAdmin = '#userRole';
  expect(await I.checkElement(selectorSuper)).equal(true);
  expect(await I.checkElement(selectorAdmin)).equal(true);
  if (await I.isElementChecked(selectorSuper))
    await I.click(selectorAdmin);
  else
    await I.click(selectorSuper);
});

Then('I can see user details updated message {string}', async (message: string) => {
  const selector = '#searchUserContent > div.govuk-panel.govuk-panel--confirmation > h1';
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});

Then('I click remove role button', async () => {
  const selector = '#deleteUserRolesBtn';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

When('I click on confirm remove role button', async () => {
  const selector = '#confirmDeleteUserRolesBtn';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

When('I enter Last Name {string} to update user', async (lastName: string) => {
  const selector = '#edit-surname';
  await I.clearField(selector);
  await populateField(selector, lastName);
});

When('I enter First Name {string} to update user', async (lastName: string) => {
  const selector = '#edit-forename';
  await I.clearField(selector);
  await populateField(selector, lastName);
});

Then('I make sure both of the roles are unchecked for test user', async () => {
  const selectorAdmin = '#userRole';
  const selectorSuper = '#userRole-2';
  expect(await I.checkElement(selectorAdmin)).equal(true);
  expect(await I.checkElement(selectorSuper)).equal(true);
  expect(await I.isElementChecked(selectorAdmin)).equal(false) && expect(await I.isElementChecked(selectorSuper)).equal(false);
});
