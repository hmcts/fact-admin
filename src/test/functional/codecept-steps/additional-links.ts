import { I } from '../utlis/codecept-util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I hover over Additional Links nav element', async () => {
  const selector = '#nav';
  I.seeElement(selector);
  await I.moveCursorTo(selector);
});

Then('I click the Additional Links tab', async () => {
  const selector = '#tab_additional-links';
  I.seeElement(selector);
  await I.click(selector);
});

When('I remove all existing Additional Links entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#additionalLinksTab', 'deleteAdditionalLink', 'saveAdditionalLink');
});

Then('a green update message is displayed in the Additional Links tab {string}', async (successMsg: string) => {
  const selector = '#additionalLinksContent > div > h1';
  expect((await I.grabTextFrom(selector)).trim()).equal(successMsg);
});

When('I enter a new Additional Links entry by adding URL {string} display name {string} and welsh display name {string}', async (url: string, englishDescriptio: string, welshDisplayName: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#additionalLinksTab fieldset');
  await I.fillField('#url-' + numFieldsets, url);
  await I.fillField('#display_name-' + numFieldsets, englishDescriptio);
  await I.fillField('#display_name_cy-' + numFieldsets, welshDisplayName,);
});

When('I click the Add new additional link button in the Additional Links tab', async () => {
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#additionalLinksTab', 'addAdditionalLink');
});

When('I click save Additional Links', async () => {
  await FunctionalTestHelpers.clickButton('#additionalLinksTab', 'saveAdditionalLink');
});

Then('the second last Additional link is displayed with URL {string} display name {string} and welsh display name {string}', async (url: string, englishDisplayName: string, welshDisplayName: string) => {
  const fieldsetSelector = '#additionalLinksTab fieldset';
  let numAdditionalLinks = await I.grabNumberOfVisibleElements(fieldsetSelector);
  numAdditionalLinks -= 2;

  const getURL = await I.grabAttributeFrom('#url-' + numAdditionalLinks, 'value');
  expect(getURL).equal(url);

  const getDisplayName = await I.grabAttributeFrom('#display_name-' + numAdditionalLinks, 'value');
  expect(getDisplayName).equal(englishDisplayName);

  const getWelshDisplayName = await I.grabAttributeFrom('#display_name_cy-' + numAdditionalLinks, 'value');
  expect(getWelshDisplayName).equal(welshDisplayName);
});

Then('the last Additional link is displayed with URL {string} display name {string} and welsh display name {string}', async (url: string, englishDisplayName: string, welshDisplayName: string) => {
  const fieldsetSelector = '#additionalLinksTab fieldset';
  let numAdditionalLinks = await I.grabNumberOfVisibleElements(fieldsetSelector);
  numAdditionalLinks -= 1;

  const getURL = await I.grabAttributeFrom('#url-' + numAdditionalLinks, 'value');
  expect(getURL).equal(url);

  const getDisplayName = await I.grabAttributeFrom('#display_name-' + numAdditionalLinks, 'value');
  expect(getDisplayName).equal(englishDisplayName);

  const getWelshDisplayName = await I.grabAttributeFrom('#display_name_cy-' + numAdditionalLinks, 'value');
  expect(getWelshDisplayName).equal(welshDisplayName);
});
//`#display_name_cy-`
When('I click the remove button under an Additional link entry', async () => {
  const numAdditionalLinks = await I.grabNumberOfVisibleElements('#additionalLinksTab fieldset');
  await FunctionalTestHelpers.clickButton('#additionalLinksTab', 'deleteAdditionalLink');

  const updatedNumAdditionalLinks = await I.grabNumberOfVisibleElements('#additionalLinksTab fieldset');
  expect(numAdditionalLinks - updatedNumAdditionalLinks).equal(1);
});

When('I click the move up button on the last additional links entry', async () => {
  I.seeElement('//*[@id="additionalLinksContent"]/fieldset[2]/div[4]/div[2]/button[1]');
  await I.click('//*[@id="additionalLinksContent"]/fieldset[2]/div[4]/div[2]/button[1]');
});

When('I click the move down button on the second last additional links entry', async () => {
  I.seeElement('//*[@id="additionalLinksContent"]/fieldset[1]/div[4]/div[2]/button[2]');
  I.click('//*[@id="additionalLinksContent"]/fieldset[1]/div[4]/div[2]/button[2]');
});

Then('An error is displayed for additional links with summary {string} and display name field message {string}', async (summaryErrMsg: string, fieldErrMsg: string) => {
  const errorTitle = 'There is a problem';
  let selector = '.govuk-error-summary__title';

  const errorMsg = await I.grabTextFrom(selector);
  expect(errorMsg.trim()).equal(errorTitle);

  selector = '#additionalLinksContent > div > div > div > ul > li';
  const errorMsgSummary = await I.grabTextFrom(selector);
  expect(errorMsgSummary.trim()).equal(summaryErrMsg);

  const numFieldsets = await I.grabNumberOfVisibleElements('#additionalLinksTab fieldset');
  const entryFormIdx = numFieldsets;

  selector = '#display_name-' + entryFormIdx + '-error';
  const errorMessage = await I.grabTextFrom(selector);
  expect(errorMessage.trim()).equal(fieldErrMsg);

});

Then('An error is displayed for additional links with summary {string} and URL field message {string}', async (summaryErrMsg: string, fieldErrMsg: string) => {
  const errorTitle = 'There is a problem';
  let selector = '.govuk-error-summary__title';

  const errorMsg = await I.grabTextFrom(selector);
  expect(errorMsg.trim()).equal(errorTitle);

  selector = '#additionalLinksContent > div > div > div > ul > li';
  const errorMsgSummary = await I.grabTextFrom(selector);
  expect(errorMsgSummary.trim()).equal(summaryErrMsg);

  const numFieldsets = await I.grabNumberOfVisibleElements('#additionalLinksTab fieldset');
  const entryFormIdx = numFieldsets;

  selector = '#url-' + entryFormIdx + '-error';
  const errorMessage = await I.grabTextFrom(selector);
  expect(errorMessage.trim()).equal(fieldErrMsg);

});

Then('An error is displayed for additional links with summary {string} and display name field messages {string}', async (summaryErrMsg: string, fieldErrMsg: string) => {

  const errorTitle = 'There is a problem';
  let selector = '.govuk-error-summary__title';

  const errorMsg = await I.grabTextFrom(selector);
  expect(errorMsg.trim()).equal(errorTitle);

  selector = '#additionalLinksContent > div > div > div > ul > li';
  const errorMsgSummary = await I.grabTextFrom(selector);
  expect(errorMsgSummary.trim()).equal(summaryErrMsg);

  const numFieldsets = await I.grabNumberOfVisibleElements('#additionalLinksTab fieldset');
  const entryFormIdx = numFieldsets;

  selector = '#display_name-' + entryFormIdx + '-error';
  const errorMessage = await I.grabTextFrom(selector);
  expect(errorMessage.trim()).equal(fieldErrMsg);

});
