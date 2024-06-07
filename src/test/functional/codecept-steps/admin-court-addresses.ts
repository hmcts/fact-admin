import {I} from '../utlis/codecept-util';
import {FunctionalTestHelpers} from '../utlis/helpers';
import {expect} from 'chai';

Then('I am redirected to the Edit Court page for the chosen court', async () => {
  const pageTitle = await I.grabTitle();
  expect(pageTitle).equal('Edit Court');
});

Then('I click the Addresses tab', async () => {
  const selector = '#tab_addresses';
  I.seeElement(selector);
  I.click(selector);
});

Given('I will make sure to clear all entries of the primary address', async () => {
  await checkAndClearAddressField('#primaryAddressLines');
  await checkAndClearAddressField('#primaryAddressWelsh');
  await checkAndClearAddressField('#primaryAddressTown');
  await checkAndClearAddressField('#primaryAddressTownWelsh');
  await checkAndClearAddressField('#primaryAddressPostcode');
});

When('I will make sure to clear all entries for secondary addresses', async () => {
  const secondaryAddress1RemoveButton = 'button[name="removeSecondaryAddress1"]';
  I.seeElement(secondaryAddress1RemoveButton);
  I.click(secondaryAddress1RemoveButton);

  const secondaryAddress2Remove = 'button[name="removeSecondaryAddress2"]';
  I.seeElement(secondaryAddress2Remove);
  I.click(secondaryAddress2Remove);
});

Given('I will make sure to remove entries for secondary address {string}', async (secondAddressNumber: string) => {
  const selector = '#removeSecondAddressBtn' + secondAddressNumber;
  I.seeElement(selector);
  I.click(selector);
});

When('I select the Address Type {string}', async (addressType: string) => {
  const selector = '#primaryAddressType';
  I.seeElement(selector);
  I.selectOption(selector, addressType);
});

Then('I enter {string} in the Town textbox', async (town: string) => {
  await FunctionalTestHelpers.populateField('#primaryAddressTown', town);
});

Then('I select the primary County {string}', async (county: string) => {
  const selector = '#primaryAddressCounty';
  I.seeElement(selector);
  I.selectOption(selector, county);
});

Then('I enter {string} in the postcode textbox', async (postcode: string) => {
  await FunctionalTestHelpers.populateField('#primaryAddressPostcode', postcode);
});

When('I select the secondary address {string} type as {string}', async (secondaryAddressNumber: number, addressType: string) => {
  const selector = '#type_id-' + (secondaryAddressNumber - 1);
  I.seeElement(selector);
  I.selectOption(selector, addressType);
});

Then('I enter {string} in the secondary address {string} Address textbox', async (address: string, secondaryAddressNumber: number) => {
  const selector = '#address_lines-' + (secondaryAddressNumber - 1);
  await FunctionalTestHelpers.populateField(selector, address);
});

Then('I enter {string} in the Address textbox', async (address: string) => {
  const selector = '#primaryAddressLines';
  await FunctionalTestHelpers.populateField(selector, address);
});

Then('I enter {string} in the secondary address {string} Town textbox', async (town: string, secondaryAddressNumber: number) => {
  const selector = '#town-' + (secondaryAddressNumber - 1);
  await FunctionalTestHelpers.populateField(selector, town);
});

Then('I enter {string} in the secondary address {string} Postcode textbox', async (postcode: string, secondaryAddressNumber: number) => {
  const selector = '#postcode-' + (secondaryAddressNumber - 1);
  await FunctionalTestHelpers.populateField(selector, postcode);
});

Then('I select {string} as the secondary address {string} County', async (county: string, secondaryAddressNumber: number) => {
  const selector = '#county_id-' + (secondaryAddressNumber - 1);
  I.seeElement(selector);
  I.selectOption(selector, county);
});

Then('I click the Save Addresses button', async () => {
  const selector = 'button[name="saveAddresses"]';
  I.seeElement(selector);
  I.click(selector);
});

Then('The error message display is {string} {string} {string}', async (errPrimaryAdd: string, errSecondaryTown: string, errSecondaryPostcode: string) => {
  const errorTitle = 'There is a problem';
  const selector = '.govuk-error-summary__title';
  const errorMsg = await I.grabTextFrom(selector);
  expect(errorMsg.trim()).equal(errorTitle);

  const selectorErrPrimaryAdd = '#addressesContent > div.govuk-error-summary > div > div > ul > li:nth-child(1)';
  const selectorErrPrimaryAddError = await I.grabTextFrom(selectorErrPrimaryAdd);
  expect(selectorErrPrimaryAddError.trim()).equal(errPrimaryAdd);

  const selectorErrSecondaryTown = '#addressesContent > div.govuk-error-summary > div > div > ul > li:nth-child(2)';
  const selectorErrSecondaryTownError = await I.grabTextFrom(selectorErrSecondaryTown);
  expect(selectorErrSecondaryTownError.trim()).equal(errSecondaryTown);

  const selectorErrSecondaryPostcode = '#addressesContent > div.govuk-error-summary > div > div > ul > li:nth-child(3)';
  const selectorErrSecondaryPostcodeError = await I.grabTextFrom(selectorErrSecondaryPostcode);
  expect(selectorErrSecondaryPostcodeError.trim()).equal(errSecondaryPostcode);
});

Then('The error message display is {string}', async (expErrMessage: string) => {
  const errorTitle = 'There is a problem';
  const titleSelector = '.govuk-error-summary__title';
  const errorMsg = await I.grabTextFrom(titleSelector);
  expect(errorMsg.trim()).equal(errorTitle);

  const selector = '#addressesContent > div.govuk-error-summary > div  > div > ul > li';
  const errorMessageText = await I.grabTextFrom(selector);
  expect(errorMessageText.trim()).equal(expErrMessage);
});

Then('A green message is displayed for the updated address {string}', async (message: string) => {
  const selector = '#addressesContent > div > h1';
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});


async function checkAndClearAddressField(addressFieldElement: string) {
  I.seeElement(addressFieldElement);
  I.fillField(addressFieldElement, '');
  I.clearField(addressFieldElement);
}
