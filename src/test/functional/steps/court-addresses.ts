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

Then('I select the primary County {string}', async (county: string) => {
  const selector = '#primaryAddressCounty';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.selectItem(selector,county);
});

Then('I enter secondary address description {string} in Description textbox', async (desc: string) => {
  const selector = '#secondaryAddressDescription';
  await populateField(selector, desc);
});


Then ('I enter secondary address welsh description {string} in Welsh Description textbox', async (welshDesc: string) => {
  const selector = '#secondaryAddressDescriptionWelsh';
  await populateField(selector, welshDesc);
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

Then('I select the secondary County {string}', async (county: string) => {
  const selector = '#secondaryAddressCounty';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.selectItem(selector,county);
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

Given('I will make sure to clear all entries of third address', async () => {
  const elementExist = await I.checkElement('button[name="removeThirdAddress"]');
  expect(elementExist).equal(true);
  await I.click('button[name="removeThirdAddress"]');
});

Then('I enter third address description {string} in Description textbox', async (desc: string) => {
  const selector = '#thirdAddressDescription';
  await populateField(selector, desc);
});

Then('I enter third address welsh description {string} in Welsh Description textbox', async (welshDesc: string) => {
  const selector = '#thirdAddressDescriptionWelsh';
  await populateField(selector, welshDesc);
});

Then('I enter third address address {string} in the Address textbox', async (address: string) => {
  const selector = '#thirdAddressLines';
  await populateField(selector, address);
});

Then('I enter third address welsh address {string} in the Address Welsh textbox', async (welshAdd: string) => {
  const selector = '#thirdAddressLinesWelsh';
  await populateField(selector, welshAdd);
});

Then('I enter third address {string} in the Town textbox', async (town: string) => {
  const selector = '#thirdAddressTown';
  await populateField(selector, town);
});

Then('I enter third address {string} in the town Welsh textbox', async (welshtown: string) => {
  const selector = '#thirdAddressTownWelsh';
  await populateField(selector, welshtown);
});

Then('I select the third County {string}', async (county: string) => {
  const selector = '#thirdAddressCounty';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.selectItem(selector,county);
});

Then('I enter third address {string} in the postcode textbox', async (postcode: string) => {
  const selector = '#thirdAddressPostcode';
  await populateField(selector, postcode);
});

When('I select the third address type {string}', async (addressType: string) => {
  const selector = '#thirdAddressType';
  //const elementExist = await I.checkElement(selector);
  expect(await I.checkElement(selector)).equal(true);
  await I.selectItem(selector,addressType);
});

Given('I will make sure to remove entries for first secondary address', async () => {
  const selector = '#removeSecondAddressBtn';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I enter secondary address description {string}', async (description: string) => {
  const selector = '#secondaryAddressDescription';
  await populateField(selector, description);
});

Then('I enter secondary address description welsh {string}', async (descriptionCy: string) => {
  const selector = '#secondaryAddressDescriptionWelsh';
  await populateField(selector, descriptionCy);
});

Then('I enter the secondary address town welsh {string}', async (townCy: string) => {
  const selector = '#secondaryAddressTownWelsh';
  await populateField(selector, townCy);
});

Then('I select yes for area of law and court type', async () => {
  const selector = '#secondaryFieldsOfLawRadio';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I select children and civil from area of law and county court for court type', async () => {
  const selectorAolChildren = '#\\33 4249';
  const selectorAolCivil = '#\\33 4271';
  const selectorCounyCourt = '#\\31 1419';
  expect(await I.checkElement(selectorAolChildren)).equal(true);
  await I.click(selectorAolChildren);
  expect(await I.checkElement(selectorAolCivil)).equal(true);
  await I.click(selectorAolCivil);
  expect(await I.checkElement(selectorCounyCourt)).equal(true);
  await I.click(selectorCounyCourt);
});

Then('I click the link view court in new tab to validate the label generated', async () => {
  const selector = '#view-in-new-window';
  console.log(await I.checkElement(selector));
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);

  await I.goTo('http://localhost:3100/courts/amersham-law-courts');

  const label = 'Children, Civil or County Court cases';
  const selectorLabel = '#main-content > div > div > div.govuk-grid-column-two-thirds > div:nth-child(1) > div:nth-child(2) > h2.govuk-heading-s';
  console.log(await I.checkElement(selectorLabel));

  const labelElement = await I.getElement(selectorLabel);
  expect(await I.getElementText(labelElement)).equal(label);

});

Then('I select yes for second secondary court area of law and court type', async () => {
  const selector = '#thirdFieldsOfLawRadio';
  expect(await I.checkElement(selector)).equal(true);
  await I.click(selector);
});

Then('I select children and civil for second secondary court area of law and county court for court type', async () => {
  const selectorAolChildren = "input[name='thirdAddressAOLItems'][id='34249']";
  const selectorCountyCourt = "input[name='thirdAddressCourtItems'][id='11419']";
  expect(await I.checkElement(selectorAolChildren)).equal(true);
  await I.click(selectorAolChildren);
  expect(await I.checkElement(selectorCountyCourt)).equal(true);
  await I.click(selectorCountyCourt);
});
