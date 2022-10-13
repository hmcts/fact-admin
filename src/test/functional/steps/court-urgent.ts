import {Given, Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';
import {config} from '../../config';

Then('I am redirected to the Edit Court page for the chosen court', async () => {
  const pageTitle = await I.getPageTitle();
  expect(pageTitle).equal('Edit Court');
});

When('I add an {string} in the field provided {string}', async (message: string, id: string) => {
  expect(await I.checkElement(id)).equal(true);
  await I.clearField(id);
  await I.fillField(id, message);
});

When('I add an {string} in the rich editor field provided {string}', async (message: string, id: string) => {
  expect(await I.checkElement(id)).equal(true);
  await I.clearField(id);
  await I.fillFieldInIframe(id, message);
});

Given('I click the update button', async () => {
  await I.click('#update');
});

Then('a message is displayed on the page', async () => {
  const selector = '#updated-message';

  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
});

When('I have added the {string} in the Urgent Notice Welsh field', async (welshMessage: string) => {
  const selector = '#generalInfoTab #urgent-notice-welsh';

  await I.clearField(selector);
  await I.fillFieldInIframe(selector, welshMessage);
});

When('I click the open checkbox', async () => {
  const selectorOpen = '#generalInfoTab #open';
  await I.isElementVisible(selectorOpen, 10000);

  const elementOpenCheckboxExist = await I.checkElement(selectorOpen);
  expect(elementOpenCheckboxExist).equal(true);

  const elementOpenChkboxChecked = await I.isElementChecked(selectorOpen);
  if (!elementOpenChkboxChecked) {
    await I.click(selectorOpen);
  }
});

When('I click the close checkbox', async () => {
  const selectorOpen = '#generalInfoTab #open';
  await I.isElementVisible(selectorOpen, 10000);

  const elementOpenCheckboxExist = await I.checkElement(selectorOpen);
  expect(elementOpenCheckboxExist).equal(true);

  const elementOpenChkboxChecked = await I.isElementChecked(selectorOpen);
  if (elementOpenChkboxChecked) {
    await I.click(selectorOpen);
  }
});

When('I click the Participates in access scheme checkbox', async () => {
  const selectorParticipantsAccessSchemeChkbox = '#generalInfoTab #access_scheme';
  await I.isElementVisible(selectorParticipantsAccessSchemeChkbox, 10000);

  const elementParticipantsAccessSchemeChkboxExist = await I.checkElement(selectorParticipantsAccessSchemeChkbox);
  expect(elementParticipantsAccessSchemeChkboxExist).equal(true);

  const elementParticipantsAccessSchemeChkboxChecked = await I.isElementChecked(selectorParticipantsAccessSchemeChkbox);
  if (!elementParticipantsAccessSchemeChkboxChecked) {
    await I.click(selectorParticipantsAccessSchemeChkbox);
  }
});

When('I unclick the Participates in access scheme checkbox', async () => {
  const selectorParticipantsAccessSchemeChkbox = '#generalInfoTab #access_scheme';
  await I.isElementVisible(selectorParticipantsAccessSchemeChkbox, 10000);

  const elementParticipantsAccessSchemeChkboxExist = await I.checkElement(selectorParticipantsAccessSchemeChkbox);
  expect(elementParticipantsAccessSchemeChkboxExist).equal(true);

  const elementParticipantsAccessSchemeChkboxChecked = await I.isElementChecked(selectorParticipantsAccessSchemeChkbox);
  if (elementParticipantsAccessSchemeChkboxChecked) {
    await I.click(selectorParticipantsAccessSchemeChkbox);
  }
});

Then('I click the link view court in new tab to validate urgent notice label generated', async () => {
  const selector = '#view-in-new-window';

  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);

  await I.goTo(config.FRONTEND_URL + '/courts/administrative-court');
  const label = 'Urgent Notice';
  const selectorLabel = '#main-content > div > div > div.govuk-grid-column-two-thirds > div.urgent-message > div:nth-child(2) > strong';

  const labelElement = await I.getElement(selectorLabel);
  expect(await I.getElementText(labelElement)).equal(label);
});
