import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I hover over Additional Links nav element', async () => {
  const selector = '#nav';
  expect(await I.isElementVisible(selector, 3000)).equal(true);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.hover(selector);
});

Then('I click the Additional Links tab', async () => {
  const selector = '#tab_additional-links';
  expect(await I.isElementVisible(selector, 3000)).equal(true);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I remove all existing Additional Links entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#additionalLinksTab', 'deleteAdditionalLink', 'saveAdditionalLink');
});

Then('a green update message is displayed in the Additional Links tab {string}', async (successMsg: string) => {
  const selector = '#additionalLinksContent > div > h1';
  expect(await I.isElementVisible(selector, 3000)).equal(true);
  const successTitleElement = await I.getElement(selector);
  expect(await I.getElementText(successTitleElement)).equal(successMsg);
});

When('I enter a new Additional Links entry by adding URL {string} display name {string} and welsh display name {string}', async (url: string, englishDescriptio: string, welshDisplayName: string) => {
  const numFieldsets = await I.countElement('#additionalLinksTab fieldset');
  const entryFormIdx = numFieldsets - 2;

  const urlSelector = '#additionalLinksTab input[name$="[url]"]';
  const englishDisplayNameSelector = '#additionalLinksTab input[name$="[display_name]"]';
  const welshDisplayNameSelector = '#additionalLinksTab input[name$="[display_name_cy]"]';

  expect(await I.isElementVisible(urlSelector, 3000)).equal(true);
  expect(await I.isElementVisible(englishDisplayNameSelector, 3000)).equal(true);
  expect(await I.isElementVisible(welshDisplayNameSelector, 3000)).equal(true);

  await I.setElementValueAtIndex(urlSelector, entryFormIdx, url, 'input');
  await I.setElementValueAtIndex(englishDisplayNameSelector, entryFormIdx, englishDescriptio, 'input');
  await I.setElementValueAtIndex(welshDisplayNameSelector, entryFormIdx, welshDisplayName, 'input');
});

When('I click the Add new additional link button in the Additional Links tab', async () => {
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#additionalLinksTab', 'addAdditionalLink');
});

When('I click save Additional Links', async () => {
  await FunctionalTestHelpers.clickButton('#additionalLinksTab', 'saveAdditionalLink');
});

Then('the second last Additional link is displayed with URL {string} display name {string} and welsh display name {string}', async (url: string, englishDisplayName: string, welshDisplayName: string) => {
  const fieldsetSelector = '#additionalLinksTab fieldset';
  await I.isElementVisible(fieldsetSelector, 3000);
  const numAdditionalLinks = await I.countElement(fieldsetSelector);
  const secondLastIndex = numAdditionalLinks - 4; // we deduct one each for zero-based index, hidden template fieldset, new additional links fieldset and the last entry.

  const getURL = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[url]"]`, secondLastIndex);
  expect(getURL).equal(url);

  const getDisplayName = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[display_name]"]`, secondLastIndex);
  expect(getDisplayName).equal(englishDisplayName);

  const getWelshDisplayName = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[display_name_cy]"]`, secondLastIndex);
  expect(getWelshDisplayName).equal(welshDisplayName);
});

Then('the last Additional link is displayed with URL {string} display name {string} and welsh display name {string}', async (url: string, englishDisplayName: string, welshDisplayName: string) => {
  const fieldsetSelector = '#additionalLinksTab fieldset';
  const numAdditionalLinks = await I.countElement(fieldsetSelector);
  const lastIndex = numAdditionalLinks - 3; // we deduct one each for zero-based index, hidden template fieldset and new additional links fieldset.

  const getURL = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[url]"]`, lastIndex);
  expect(getURL).equal(url);

  const getDisplayName = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[display_name]"]`, lastIndex);
  expect(getDisplayName).equal(englishDisplayName);

  const getWelshDisplayName = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[display_name_cy]"]`, lastIndex);
  expect(getWelshDisplayName).equal(welshDisplayName);
});

When('I click the remove button under an Additional link entry', async () => {
  const numAdditionalLinks = await I.countElement('#additionalLinksTab fieldset');
  await FunctionalTestHelpers.clickButton('#additionalLinksTab', 'deleteAdditionalLink');

  const updatedNumAdditionalLinks = await I.countElement('#additionalLinksTab fieldset');
  expect(numAdditionalLinks - updatedNumAdditionalLinks).equal(1);
});

Then('there are no  Additional Link entries', async () => {
  const numberOfFieldsets = await I.countElement('#additionalLinksTab fieldset.can-reorder');
  const numberOfAdditionalLinks = numberOfFieldsets - 2; // we deduct the hidden template and the new additional links form
  expect(numberOfAdditionalLinks).to.equal(0);
});

When('I click the move up button on the last additional links entry', async () => {
  const fieldsetSelector = '#additionalLinksTab fieldset.can-reorder';
  const numEntries = await I.countElement(fieldsetSelector);
  const lastIndex = numEntries - 3; // we deduct one each for zero-based indexing, the hidden form template and the new entry form.

  // Click the move up button
  await I.clickElementAtIndex(`${fieldsetSelector} button[name="moveUp"]`, lastIndex);
});

When('I click the move down button on the second last additional links entry', async () => {
  const fieldsetSelector = '#additionalLinksTab fieldset.can-reorder';
  const numEntries = await I.countElement(fieldsetSelector);
  // We deduct one each for zero-based indexing, the hidden form template, the new entry form and the last additional links entry.
  const secondLastIndex = numEntries - 4;

  // Click the move down button
  await I.clickElementAtIndex(`${fieldsetSelector} button[name="moveDown"]`, secondLastIndex);
});

When('When I enter a new Additional Links entry by adding URL {string} and leave display name field blank', async (url: string) => {
  const numFieldsets = await I.countElement('#additionalLinksTab fieldset');
  const entryFormIdx = numFieldsets - 2;
  const urlSelector = '#additionalLinksTab input[name$="[url]"]';
  await I.setElementValueAtIndex(urlSelector, entryFormIdx, url, 'input');
});

Then('An error is displayed for additional links with summary {string} and display name field message {string}', async (msgSummery: string, errorMsg: string) => {
  const errorTitle = 'There is a problem';
  let selector = '#error-summary-title';
  expect(await I.checkElement(selector)).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#additionalLinksContent > div > div > ul > li';
  expect(await I.checkElement(selector)).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(msgSummery);

  const numFieldsets = await I.countElement('#additionalLinksTab fieldset');
  const fieldsetErrorIndex = numFieldsets - 1;  // The last field set is the hidden template fieldset
  selector = '#display_name-' + fieldsetErrorIndex + '-error';
  expect(await I.checkElement(selector)).equal(true);
  const displayNameErrorElement = await I.getElement(selector);
  expect(await I.getElementText(displayNameErrorElement)).contains(errorMsg);
});


When('When I enter a new Additional Links entry by adding english display name {string} and leave URL field blank', async (displayName: string) => {
  const numFieldsets = await I.countElement('#additionalLinksTab fieldset');
  const entryFormIdx = numFieldsets - 2;
  const englishDisplyNameSelector = '#additionalLinksTab input[name$="[display_name]"]';
  await I.setElementValueAtIndex(englishDisplyNameSelector, entryFormIdx, displayName, 'input');
});


Then('An error is displayed for additional links with summary {string} and URL field message {string}', async (msgSummery: string, errorMsg: string) => {
  const errorTitle = 'There is a problem';
  let selector = '#error-summary-title';
  expect(await I.checkElement(selector)).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#additionalLinksContent > div > div > ul > li';
  expect(await I.checkElement(selector)).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(msgSummery);

  const numFieldsets = await I.countElement('#additionalLinksTab fieldset');
  const fieldsetErrorIndex = numFieldsets - 1;  // The last field set is the hidden template fieldset
  selector = '#url-' + fieldsetErrorIndex + '-error';
  expect(await I.checkElement(selector)).equal(true);
  const urlErrorElement = await I.getElement(selector);
  expect(await I.getElementText(urlErrorElement)).contains(errorMsg);
});

When('I clear additional link fields', async () => {
  await FunctionalTestHelpers.clickButton('#additionalLinksTab', 'clearAdditionalLink');
});


Then('An error is displayed for additional links with summary {string} and URL field messages {string}', async (msgSummery: string, errorMsg: string) => {
  const errorTitle = 'There is a problem';
  let selector = '#error-summary-title';
  expect(await I.checkElement(selector)).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#additionalLinksContent > div > div > ul > li';
  expect(await I.checkElement(selector)).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(msgSummery);

  selector = '#url-1-error';
  expect(await I.checkElement(selector)).equal(true);
  const urlErrorElement = await I.getElement(selector);
  expect(await I.getElementText(urlErrorElement)).contains(errorMsg);

  selector = '#url-2-error';
  expect(await I.checkElement(selector)).equal(true);
  const url2ErrorElement = await I.getElement(selector);
  expect(await I.getElementText(url2ErrorElement)).contains(errorMsg);
});


Then('An error is displayed for additional links with summary {string} and display name field messages {string}', async (msgSummery: string, errorMsg: string) => {
  const errorTitle = 'There is a problem';
  let selector = '#error-summary-title';
  await I.isElementVisible(selector, 30000);
  expect(await I.checkElement(selector)).equal(true);
  const errorTitleElement = await I.getElement(selector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  selector = '#additionalLinksContent > div > div > ul > li';
  await I.isElementVisible(selector, 30000);
  expect(await I.checkElement(selector)).equal(true);
  const errorListElement = await I.getElement(selector);
  expect(await I.getElementText(errorListElement)).equal(msgSummery);

  selector = '#display_name-1-error';
  await I.isElementVisible(selector, 30000);
  expect(await I.checkElement(selector)).equal(true);
  const displayNameErrorElement = await I.getElement(selector);
  expect(await I.getElementText(displayNameErrorElement)).contains(errorMsg);

  selector = '#display_name-2-error';
  expect(await I.checkElement(selector)).equal(true);
  const displayName2ErrorElement = await I.getElement(selector);
  expect(await I.getElementText(displayName2ErrorElement)).contains(errorMsg);
});







