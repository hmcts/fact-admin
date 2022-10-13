import * as I from '../utlis/puppeteer.util';
import {Then, When} from 'cucumber';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

async function populateField(selector: string, value: string) {
  const appProgressionSelector = '#applicationProgressionTab fieldset';
  await I.isElementVisible(appProgressionSelector, 3000);
  const numFieldSets = await I.countElement(appProgressionSelector);
  const entryFormIdx = numFieldSets - 2;

  expect(await I.isElementVisible(selector, 3000)).equal(true);
  expect(await I.checkElement(selector)).equal(true);
  await I.setElementValueAtIndex(selector, entryFormIdx, value, 'input');
}

Then('I click the application progression tab', async () => {
  const selector = '#tab_application-progression';
  expect(await I.isElementVisible(selector, 3000)).equal(true);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I remove all existing application types entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#application-progression', 'deleteUpdate', 'saveUpdate');
});

Then('a green update message Application progression updated {string}', async (message: string) => {
  const selector = '#applicationProgressionContent > div > h1';
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});

Then('I entered {string} in Type TextBox', async (applicationType: string) => {
  const typeSelector = '#applicationProgressionTab input[name$="[type]"]';
  await I.isElementVisible(typeSelector, 3000);
  await populateField(typeSelector, applicationType);
});

Then('I entered {string} in welsh type TexTBox', async (applicationType: string) => {
  const typeSelector = '#applicationProgressionTab input[name$="[type_cy]"]';
  await I.isElementVisible(typeSelector, 3000);
  await populateField(typeSelector, applicationType);
});

Then('I entered {string} in Email TextBox', async (email: string) => {
  const typeSelector = '#applicationProgressionTab input[name$="[email]"]';
  await I.isElementVisible(typeSelector, 3000);
  await populateField(typeSelector, email);
});

Then('I entered {string} in External link TextBox', async (externalLink: string) => {
  const typeSelector = '#applicationProgressionTab input[name$="[external_link]"]';
  await I.isElementVisible(typeSelector, 3000);
  await populateField(typeSelector, externalLink);
});


Then('I entered {string} in External link description TextBox', async (externalLinkDec: string) => {
  const typeSelector = '#applicationProgressionTab input[name$="[external_link_description]"]';
  await I.isElementVisible(typeSelector, 3000);
  await populateField(typeSelector, externalLinkDec);
});

Then('I entered {string} in External link welsh description TextBox', async (externalLinkDec: string) => {
  const typeSelector = '#applicationProgressionTab input[name$="[external_link_description_cy]"]';
  await I.isElementVisible(typeSelector, 3000);
  await populateField(typeSelector, externalLinkDec);
});


Then('I click application progression save button', async () => {
  await FunctionalTestHelpers.clickButton('#application-progression', 'saveUpdate');
});

Then('I click on add new application progression',async () => {
  await FunctionalTestHelpers.clickButton('#application-progression', 'addNewUpdate');
});

Then('a green update message showing Application progression updated', async (message: string) =>  {
  const selector = '#applicationProgressionContent > div > h1';
  expect(await I.isElementVisible(selector, 3000)).equal(true);
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});

Then('the second last Email is {string}', async (email: string) => {
  const fieldsetSelector = '#applicationProgressionTab fieldset';
  await I.isElementVisible(fieldsetSelector, 3000);
  const numEmail = await I.countElement(fieldsetSelector);
  const secondLastIndex = numEmail - 4;

  const expEmail = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[email]"]`, secondLastIndex);
  expect(expEmail).equal(email);
});

Then('the last email is {string}', async (lastEmail: string) => {

  const fieldsetSelector = '#applicationProgressionTab fieldset';
  await I.isElementVisible(fieldsetSelector, 3000);
  const numApplicationType = await I.countElement(fieldsetSelector);
  const lastIndex = numApplicationType - 3;

  const expEmail = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[email]"]`, lastIndex);
  expect(expEmail).equal(lastEmail);

});

Then('An error is displayed for application progression with summary {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('#error-summary-title');
  expect(errorTitle).equal(true);

  const selector = '#applicationProgressionContent > div > div > ul > li';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});
