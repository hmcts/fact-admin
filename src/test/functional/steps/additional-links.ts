import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I hover over Additional Links nav element', async () => {
  const selector = '#nav';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.hover(selector);
});

Then('I click the Additional Links tab', async () => {
  const selector = '#tab_additional-links';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the existing Additional Links', async () => {
  const elementExist = await I.isElementVisible('#additionalLinksForm');
  expect(elementExist).equal(true);
});

When('I remove all existing Additional Links entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#additionalLinksTab', 'deleteAdditionalLink', 'saveAdditionalLink');
});

Then('a green update message is displayed in the Additional Links tab {string}', async (successMsg: string) => {
  const selector = '#additionalLinksContent > div > h1';
  const successTitleElement = await I.getElement(selector);
  expect(await I.getElementText(successTitleElement)).equal(successMsg);
});

When('I enter a new Additional Links entry by adding URL {string} display name {string} and welsh display name {string}', async (url: string, englishDescriptio: string, welshDescription: string) => {
  const numFieldsets = await I.countElement('#additionalLinksTab fieldset');
  const entryFormIdx = numFieldsets - 2;

  const urlSelector = '#additionalLinksTab input[name$="[url]"]';
  const englishDescriptionSelector = '#additionalLinksTab input[name$="[display_name]"]';
  const welshDescriptionSelector = '#additionalLinksTab input[name$="[display_name_cy]"]';

  await I.setElementValueAtIndex(urlSelector, entryFormIdx, url, 'input');
  await I.setElementValueAtIndex(englishDescriptionSelector, entryFormIdx, englishDescriptio, 'input');
  await I.setElementValueAtIndex(welshDescriptionSelector, entryFormIdx, welshDescription, 'input');
});

When('I click the Add new additional link button in the Additional Links tab', async () => {
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#additionalLinksTab', 'addAdditionalLink');
});

When('I click save Additional Links', async () => {
  await FunctionalTestHelpers.clickButton('#additionalLinksTab', 'saveAdditionalLink');
});

Then('the second last Additional link is displayed with URL {string} display name {string} and welsh display name {string}', async (url: string, englishDescription: string, welshDescription: string) => {
  const fieldsetSelector = '#additionalLinksTab fieldset';
  const numAdditionalLinks = await I.countElement(fieldsetSelector);
  const secondLastIndex = numAdditionalLinks - 4; // we deduct one each for zero-based index, hidden template fieldset, new additional links fieldset and the last entry.

  const getURL = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[url]"]`, secondLastIndex);
  expect(getURL).equal(url);

  const getDescription = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[display_name]"]`, secondLastIndex);
  expect(getDescription).equal(englishDescription);

  const getWelshDescription = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[display_name_cy]"]`, secondLastIndex);
  expect(getWelshDescription).equal(welshDescription);
});

Then('the last Additional link is displayed with URL {string} display name {string} and welsh display name {string}', async (url: string, englishDescription: string, welshDescription: string) => {
  const fieldsetSelector = '#additionalLinksTab fieldset';
  const numAdditionalLinks = await I.countElement(fieldsetSelector);
  const lastIndex = numAdditionalLinks - 3; // we deduct one each for zero-based index, hidden template fieldset and new additional links fieldset.

  const getURL = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[url]"]`, lastIndex);
  expect(getURL).equal(url);

  const getDescription = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[display_name]"]`, lastIndex);
  expect(getDescription).equal(englishDescription);

  const getWelshDescription = await I.getElementValueAtIndex(`${fieldsetSelector} input[name$="[display_name_cy]"]`, lastIndex);
  expect(getWelshDescription).equal(welshDescription);
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

