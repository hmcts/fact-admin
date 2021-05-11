import {Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';

When('I click the Emails tab', async () => {
  const selector = '#tab_emails';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the existing emails', async () => {
  const elementExist = await I.checkElement('#emailsContent');
  expect(elementExist).equal(true);
});

When('I click on Add new Email', async () => {
  const selector = 'button[name=\'addEmail\']';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I add Description from the dropdown {string} and Address {string} and Explanation {string} and Welsh Explanation {string}',
  async (id: string, email: string, explanation: string, explanationCy: string) => {

    const selectSelector = '#newEmailDescription';
    const addressInputSelector = '#newEmailAddress';
    const expInputSelector = '#newEmailExplanation';
    const expCyInputSelector = '#newEmailExplanationCy';

    const selectSelectorExists = await I.checkElement(selectSelector);
    expect(selectSelectorExists).equal(true);
    const addressInputSelectorExists = await I.checkElement(addressInputSelector);
    expect(addressInputSelectorExists).equal(true);
    const expInputSelectorExists = await I.checkElement(expInputSelector);
    expect(expInputSelectorExists).equal(true);
    const expCyInputSelectorExists = await I.checkElement(expCyInputSelector);
    expect(expCyInputSelectorExists).equal(true);

    await I.selectItem(selectSelector, id);
    await I.fillField(addressInputSelector, email);
    await I.fillField(expInputSelector, explanation);
    await I.fillField(expCyInputSelector, explanationCy);
  });

When('I click save button', async () => {
  const selector = 'button[name=\'saveEmail\']';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('a green update message showing email updated is displayed', async () => {
  const elementExist = await I.checkElement('div[class=\'govuk-panel govuk-panel--confirmation\']');
  expect(elementExist).equal(true);
});

When('I leave adminId blank', async () => {
  const selectSelector = '#newEmailDescription';
  const selectSelectorExists = await I.checkElement(selectSelector);
  expect(selectSelectorExists).equal(true);
  await I.clearField(selectSelector);
});

When('I leave Address blank', async () => {
  const addressInputSelector = '#newEmailAddress';
  const addressInputSelectorExists = await I.checkElement(addressInputSelector);
  expect(addressInputSelectorExists).equal(true);
  await I.clearField(addressInputSelector);
});


Then('A red error message display', async () => {
  const elementExist = await I.checkElement('#error-summary-title');
  expect(elementExist).equal(true);
});

When('I click the remove button below a email section', async () => {
  const numEmailAdd = await I.countElement('#emailsTab fieldset');

  const selector = 'button[name=\'deleteEmails\']';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);

  const updatedEmailAdd = await I.countElement('#emailsTab fieldset');
  expect(numEmailAdd - updatedEmailAdd).equal(1);
});

When('I add Description from the dropdown {string} and wrong Email-Address {string}',
  async (id: string, email: string) => {

    const selectSelector = '#newEmailDescription';
    const addressInputSelector = '#newEmailAddress';

    expect(await I.checkElement(selectSelector)).equal(true);
    expect(await I.checkElement(addressInputSelector)).equal(true);

    await I.selectItem(selectSelector, id);
    await I.fillField(addressInputSelector, email);
  });

Then('An error message is displayed with the text {string}', async (msg: string) => {
  expect(await I.checkElement('#error-summary-title')).equal(true);
  expect(await I.checkElement('#emailsContent > div > div > ul > li')).equal(true);
  expect(
    await I.getElementText(                                                // Get Text for the element below
      await I.getElement('#emailsContent > div > div > ul > li'))) // Get the element for the error
    .equal(msg);
});
