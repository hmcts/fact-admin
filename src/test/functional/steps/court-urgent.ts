import {Given, Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';

Then('I am redirected to the Edit Court page for the chosen court', async () => {
  const pageTitle = await I.getPageTitle();
  expect(pageTitle).equal('Edit Court');
});

When('I add an {string} in the field provided {string}', async (message: string, id: string) => {
  await I.clearField(id);
  await I.fillField(id, message);
});

When('I add an {string} in the rich editor field provided {string}', async (message: string, id: string) => {
  await I.fillFieldInIframe(id, message);
});

Given('I click the update button', async () => {
  await I.click('#update');
});

Then('a message is displayed on the page', async () => {
  const elementExist = await I.checkElement('#updated-message');
  expect(elementExist).equal(true);
});

When('I have added the {string} in the Urgent Notice Welsh field', async (welshMessage: string) => {
  const selector = '#generalInfoTab #urgent-notice-welsh';
  await I.clearField(selector);
  await I.fillField(selector, welshMessage);
});

When('I click the open checkbox', async () => {
  const selectorOpen = '#generalInfoTab #open';

  const elementOpenCheckboxExist = await I.checkElement(selectorOpen);
  expect(elementOpenCheckboxExist).equal(true);

  const elementOpenChkboxChecked = await I.isElementChecked(selectorOpen);
  if (!elementOpenChkboxChecked) {
    await I.click(selectorOpen);
  }
});

When('I click the close checkbox', async () => {
  const selectorOpen = '#generalInfoTab #open';

  const elementOpenCheckboxExist = await I.checkElement(selectorOpen);
  expect(elementOpenCheckboxExist).equal(true);

  const elementOpenChkboxChecked = await I.isElementChecked(selectorOpen);
  if (elementOpenChkboxChecked) {
    await I.click(selectorOpen);
  }
});

When('I click the Participates in access scheme checkbox', async () => {
  const selectorParticipantsAccessSchemeChkbox = '#generalInfoTab #access_scheme';

  const elementParticipantsAccessSchemeChkboxExist = await I.checkElement(selectorParticipantsAccessSchemeChkbox);
  expect(elementParticipantsAccessSchemeChkboxExist).equal(true);

  const elementParticipantsAccessSchemeChkboxChecked = await I.isElementChecked(selectorParticipantsAccessSchemeChkbox);
  if (!elementParticipantsAccessSchemeChkboxChecked) {
    await I.click(selectorParticipantsAccessSchemeChkbox);
  }
});

When('I unclick the Participates in access scheme checkbox', async () => {
  const selectorParticipantsAccessSchemeChkbox = '#generalInfoTab #access_scheme';

  const elementParticipantsAccessSchemeChkboxExist = await I.checkElement(selectorParticipantsAccessSchemeChkbox);
  expect(elementParticipantsAccessSchemeChkboxExist).equal(true);

  const elementParticipantsAccessSchemeChkboxChecked = await I.isElementChecked(selectorParticipantsAccessSchemeChkbox);
  if (elementParticipantsAccessSchemeChkboxChecked) {
    await I.click(selectorParticipantsAccessSchemeChkbox);
  }
});
