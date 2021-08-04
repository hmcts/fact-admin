import {Then, Given, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';



async function checkAndClearAddressField (addressFieldElement: string) {
  expect(await I.checkElement(addressFieldElement)).equal(true);
  await I.clearField(addressFieldElement);
}
async function populateField(fieldElement: string, value: string) {
  expect(await I.checkElement(fieldElement)).equal(true);
  await I.setElementValueForInputField(fieldElement, value);
}

Then('I click the Addresses tab', async () => {
  const selector = '#tab_addresses';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Given('I will make sure to clear all entries of the primary address', async () => {
  await checkAndClearAddressField('#primaryAddressLines');
  await checkAndClearAddressField('#primaryAddressWelsh');
  await checkAndClearAddressField('#primaryAddressTown');
  await checkAndClearAddressField('#primaryAddressTownWelsh');
  await checkAndClearAddressField('#primaryAddressPostcode');
});

When('I select the Address Type {string}', async (addressType: string) => {
  const selector = '#primaryAddressType';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.selectItem(selector,addressType);
});

Then('I enter court {string} in the Address textbox', async (address: string) => {
  const selector = '#primaryAddressLines';
  await populateField(selector, address);
});

Then('I enter {string} in the Address Welsh textbox', async (welshAddress: string) => {
  const selector = '#primaryAddressWelsh';
  await populateField(selector, welshAddress);

});

Then('I enter {string} in the Town textbox', async (town: string) => {
  const selector = '#primaryAddressTown';
  await populateField(selector, town);
});

Then('I enter {string} in the town Welsh textbox', async (welshTown: string) => {
  const selector = '#primaryAddressTownWelsh';
  await populateField(selector, welshTown);
});

Then('I enter {string} in the postcode textbox', async (postcode: string) => {
  const selector = '#primaryAddressPostcode';
  await populateField(selector, postcode);
});

Then('I click the Save Addresses button', async () => {
  const selector = 'button[name="saveAddresses"]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('A green message is displayed for the updated address {string}', async (message: string) => {
  const selector = '#addressesContent > div.govuk-panel.govuk-panel--confirmation > h1';
  expect(await I.checkElement(selector)).equal(true);
  const messageUpdate = await I.getElement(selector);
  expect(await I.getElementText(messageUpdate)).equal(message);
});

When('I will make sure to clear all entries for secondary address', async () => {
  const selector = 'button[name="removeSecondaryAddress"]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I select the secondary address type as {string}', async (addressType: string) => {
  const selector = '#secondaryAddressType';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.selectItem(selector,addressType);
});

Then('I enter the secondary court address {string} in the Address textbox', async (address: string) => {
  const selector = '#secondaryAddressLines';
  await populateField(selector, address);
});

Then('I enter the secondary address town {string}', async (town: string) => {
  const selector = '#secondaryAddressTown';
  await populateField(selector, town);
});

Then('I enter the secondary address postcode {string}', async (postcode: string) => {
  const selector = '#secondaryAddressPostcode';
  await populateField(selector, postcode);
});

Then('The error message display is {string} {string} {string}', async (errPrimaryAdd: string, errSecondaryTown: string, errSecondaryPostcode: string ) => {
  const errorTitle = await I.checkElement('#error-summary-title');
  expect(errorTitle).equal(true);

  const selectorErrPrimaryAdd = '#addressesContent > div.govuk-error-summary > div > ul > li:nth-child(1)';
  const eleErrPrimarAdd = await I.getElement(selectorErrPrimaryAdd);
  expect(await I.getElementText(eleErrPrimarAdd)).equal(errPrimaryAdd);

  const selectorErrSecondaryTown = '#addressesContent > div.govuk-error-summary > div > ul > li:nth-child(2)';
  const eleErrSecondaryTown = await I.getElement(selectorErrSecondaryTown);
  expect(await I.getElementText(eleErrSecondaryTown)).equal(errSecondaryTown);

  const selectorErrSecondaryPostcode = '#addressesContent > div.govuk-error-summary > div > ul > li:nth-child(3)';
  const eleErrSecondaryPostcode = await I.getElement(selectorErrSecondaryPostcode);
  expect(await I.getElementText(eleErrSecondaryPostcode)).equal(errSecondaryPostcode);
});

Then('The error message display is {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('#error-summary-title');
  expect(errorTitle).equal(true);

  const selector = '#addressesContent > div.govuk-error-summary > div > ul > li';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});
