import { I } from '../utlis/codecept-util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I hover over emails nav element', async () => {
  const selector = '#nav';
  I.seeElement(selector);
  I.moveCursorTo(selector);;
});

Then('I click the Emails tab', async () => {
  const selector = '#tab_emails';
  await I.click(selector);
});

When('I remove all existing email entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#emailsTab', 'deleteEmail', 'saveEmail');
});

When('I click on Add new Email', async () => {
  await FunctionalTestHelpers.clickButton('#emailsTab', 'addEmail');
});

When('I enter new email entry by selecting description {string} and Address {string} and Explanation {string} and Welsh Explanation {string}',
  async (description: string, email: string, explanation: string, explanationCy: string) => {

    const numFieldsets = await I.grabNumberOfVisibleElements('#emailsTab fieldset');
    I.selectOption('#emails-' + numFieldsets , description);
    I.fillField('#address-' + numFieldsets , email);
    I.fillField('#explanation-' + numFieldsets , explanation);
    I.fillField('#explanation-cy-' + numFieldsets , explanationCy);

  });

When('I click save button', async () => {
  await FunctionalTestHelpers.clickButton('#emailsTab', 'saveEmail');
});

Then('a green update message showing email updated is displayed', async () => {

  const selector = 'div[class=\'govuk-panel govuk-panel--confirmation\']';
  I.seeElement(selector);
});

Then('the email entry in second last position has description value {string} email {string} Explanation {string} and Welsh Explanation {string}', async (descriptionValue: string, email: string, explanation: string, explanationCy: string) => {
  let numFieldsets = await I.grabNumberOfVisibleElements('#emailsTab fieldset');
  numFieldsets -= 2;

  const descriptionText = await I.grabAttributeFrom(('#emails-' + numFieldsets), 'value');
  expect(descriptionText).equal(descriptionValue);

  const numberText = await I.grabAttributeFrom(('#address-' + numFieldsets), 'value');
  expect(numberText).equal(email);

  const explanationText = await I.grabAttributeFrom(('#explanation-' + numFieldsets), 'value');
  expect(explanationText).equal(explanation);

  const explanationTextCy = await I.grabAttributeFrom(('#explanation-cy-' + numFieldsets), 'value');
  expect(explanationTextCy).equal(explanationCy);

});

Then('the email entry in last position has description value {string} email {string} Explanation {string} and Welsh Explanation {string}', async (descriptionValue: string, email: string, explanation: string, explanationCy: string) => {
  let numFieldsets = await I.grabNumberOfVisibleElements('#emailsTab fieldset');
  numFieldsets -= 1;

  const descriptionText = await I.grabAttributeFrom(('#emails-' + numFieldsets), 'value');
  expect(descriptionText).equal(descriptionValue);

  const numberText = await I.grabAttributeFrom(('#address-' + numFieldsets), 'value');
  expect(numberText).equal(email);

  const explanationText = await I.grabAttributeFrom(('#explanation-' + numFieldsets), 'value');
  expect(explanationText).equal(explanation);

  const explanationTextCy = await I.grabAttributeFrom(('#explanation-cy-' + numFieldsets), 'value');
  expect(explanationTextCy).equal(explanationCy);

});


//
// When('I leave adminId blank', async () => {
//   const numFieldsets = await I.countElement('#emailsTab fieldset');
//   const entryFormIdx = numFieldsets - 2; // we deduct one each for zero-based indexing and the hidden template fieldset
//   const descriptionSelectSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
//   await I.setElementValueAtIndex(descriptionSelectSelector, entryFormIdx, 0, 'select');
// });
//
// When('I add address {string}', async (address: string) => {
//   const numFieldsets = await I.countElement('#emailsTab fieldset');
//   const entryFormIdx = numFieldsets - 2; // we deduct one each for zero-based indexing and the hidden template fieldset
//   const addressSelector = '#emailsTab input[name$="[address]"]';
//   await I.setElementValueAtIndex(addressSelector, entryFormIdx, address);
// });
//
Then('A red error message display', async () => {
  I.seeElement('.govuk-error-summary__title');
});
//
// When('I click the remove button below a email section', async () => {
//   const numEmailAdd = await I.countElement('#emailsTab fieldset');
//   await FunctionalTestHelpers.clickButton('#emailsTab', 'deleteEmail');
//   const updatedEmailAdd = await I.countElement('#emailsTab fieldset');
//   expect(numEmailAdd - updatedEmailAdd).equal(1);
// });
//
// When('I add Description from the dropdown {int} and wrong Email-Address {string}',
//   async (id: number, email: string) => {
//     const numFieldsets = await I.countElement('#emailsTab fieldset');
//     const entryFormIdx = numFieldsets - 2; // we deduct one for zero-based indexing and the hidden template fieldset
//
//     const descriptionSelectSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
//     const addressInputSelector = '#emailsTab input[name$="[address]"]';
//
//     await I.setElementValueAtIndex(descriptionSelectSelector, entryFormIdx, id, 'select');
//     await I.setElementValueAtIndex(addressInputSelector, entryFormIdx, email, 'input');
//   });
//
// Then('An error message is displayed with the text {string}', async (msg: string) => {
//   expect(await I.checkElement('#.govuk-error-summary__title')).equal(true);
//   expect(await I.checkElement('#emailsContent > div > div > div > ul > li')).equal(true);
//   expect(
//     await I.getElementText(                                                // Get Text for the element below
//       await I.getElement('#emailsContent > div > div > div > ul > li'))) // Get the element for the error
//     .equal(msg);
// });
//
//
// let entryFormInedx = 0;
//
// When('I add Description from the dropdown {int}', async (description: number) => {
//   const numFieldsets = await I.countElement('#emailsTab fieldset');
//   const descriptionSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
//   if (numFieldsets > 0) {
//     entryFormInedx = numFieldsets - 2;
//   }
//   await I.setElementValueAtIndex(descriptionSelector, entryFormInedx, description, 'select');
// });
//
// When('I enter email address {string}', async (address: string) => {
//   const emailAddressSelector = '#emailsTab input[name$="[address]"]';
//   await I.setElementValueAtIndex(emailAddressSelector, entryFormInedx, address, 'input');
// });
//
// When('I click on add another button', async () => {
//   await FunctionalTestHelpers.clickButton('#emailsTab', 'addEmail');
//
// });
//
// When('I click on any description {int}', async (description: number) => {
//   const descriptionSelector = '#emailsTab select[name$="[adminEmailTypeId]"]';
//   await I.setElementValueAtIndex(descriptionSelector, entryFormInedx + 1, description, 'select');
// });
//
// When('I enter the same email address {string}', async (address: string) => {
//   const emailAddressSelector = '#emailsTab input[name$="[address]"]';
//   await I.setElementValueAtIndex(emailAddressSelector, entryFormInedx + 1, address, 'input');
// });
//
// When('I click Save button', async () => {
//   await FunctionalTestHelpers.clickButton('#emailsTab', 'saveEmail');
// });
//
Then('An error is displayed for email address with summary {string} and address field message {string}', async (summaryErrMsg: string, fieldErrMsg: string) => {
  const errorTitle = 'There is a problem';
  let selector = '.govuk-error-summary__title';

  const errorMsg = await I.grabTextFrom(selector);
  expect(errorMsg.trim()).equal(errorTitle);

  selector = '#emailsContent > div > div > div > ul > li';
  const errorMsgSummary = await I.grabTextFrom(selector);
  expect(errorMsgSummary.trim()).equal(summaryErrMsg);

  const numFieldsets = await I.grabNumberOfVisibleElements('#phoneNumbersTab fieldset');
  const entryFormIdx = numFieldsets + 1;

  // I.executeScript(() => {
  //     console.log('This is a console log message' + numFieldsets);
  //   });
  // I.wait(1000);

  selector = '#address-' + entryFormIdx + '-error';
  const errorMessage = await I.grabTextFrom(selector);
  expect(errorMessage.trim()).equal(fieldErrMsg);

});

//
When('I click the move up button on the last entry', async () => {
  I.seeElement('//*[@id="emailsContent"]/fieldset[2]/div[5]/div[2]/button[1]')
  await I.click('//*[@id="emailsContent"]/fieldset[2]/div[5]/div[2]/button[1]');
});

When('I click the move down button on the second last entry', async () => {
  I.seeElement('//*[@id="emailsContent"]/fieldset[1]/div[5]/div[2]/button[2]');
  I.click('//*[@id="emailsContent"]/fieldset[1]/div[5]/div[2]/button[2]');
});
