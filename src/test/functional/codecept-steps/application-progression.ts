import { I } from '../utlis/codecept-util';
import {FunctionalTestHelpers} from '../utlis/helpers';
import {expect} from 'chai';

async function populateField(fieldElement: string, value: string) {
  I.seeElement(fieldElement);
  I.fillField(fieldElement, value);
}

Then('I click the application progression tab', async () => {
  const selector = '#tab_application-progression';
  I.seeElement(selector);
  I.click(selector);
});

When('I remove all existing application types entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#application-progression', 'deleteUpdate', 'saveUpdate');
});

Then('a green update message Application progression updated {string}', async (message: string) => {
  const selector = '#applicationProgressionContent > div > h1';
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});

Then('I entered {string} in Type TextBox', async (applicationType: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#applicationProgressionTab fieldset');
  await populateField('#type-' + numFieldsets , applicationType);
});

Then('I entered {string} in Email TextBox', async (email: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#applicationProgressionTab fieldset');
  await populateField('#email-' + numFieldsets , email);
});

Then('I entered {string} in welsh type TextBox', async (applicationType: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#applicationProgressionTab fieldset');
  await populateField('#type_cy-' + numFieldsets , applicationType);
});

Then('I click on add new application progression',async () => {
  await FunctionalTestHelpers.clickButton('#application-progression', 'addNewUpdate');
});

Then('I click application progression save button', async () => {
  await FunctionalTestHelpers.clickButton('#application-progression', 'saveUpdate');
});

Then('the second last Email is {string}', async (email: string) => {
  let numFieldsets = await I.grabNumberOfVisibleElements('#applicationProgressionTab fieldset');
  console.log('numfieldsets before concatenantion' + ' ' + numFieldsets);
  numFieldsets -= 2;
  const expEmail = await I.grabAttributeFrom(('#email-' + numFieldsets), 'value');
  expect(expEmail).equal(email);
});
Then('the last email is {string}', async (email: string) => {
  let numFieldsets = await I.grabNumberOfVisibleElements('#applicationProgressionTab fieldset');
  console.log('numfieldsets before concatenantion' + ' ' + numFieldsets);
  numFieldsets -= 1;
  const expEmail = await I.grabAttributeFrom(('#email-' + numFieldsets), 'value');
  expect(expEmail).equal(email);
});

Then('I entered {string} in External link TextBox', async (externalLink: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#applicationProgressionTab fieldset');
  await populateField('#external_link-' + numFieldsets , externalLink);
});

Then('I entered {string} in External link description TextBox', async (externalLinkDec: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#applicationProgressionTab fieldset');
  await populateField('#external_link_description-' + numFieldsets , externalLinkDec);
});
Then('I entered {string} in External link welsh description TextBox', async (externalLinkDec: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#applicationProgressionTab fieldset');
  await populateField('#external_link_description_cy-' + numFieldsets , externalLinkDec);
});

Then('An error is displayed for application progression with summary {string}', async (expErrMessage: string) => {
  const errorTitle = 'There is a problem';
  let selector = '.govuk-error-summary__title';
  const errorMsg = await I.grabTextFrom(selector);
  expect(errorMsg.trim()).equal(errorTitle);

  // const numFieldsets = await I.grabNumberOfVisibleElements('#applicationProgressionTab fieldset');
  selector = '.govuk-error-summary__body';
  const errorMessage = await I.grabTextFrom(selector);
  expect(errorMessage.trim()).equal(expErrMessage);
});
