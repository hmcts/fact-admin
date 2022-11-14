import {Given, Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';

Then('I can view the courts or tribunals in a list format', async () => {
  await I.isElementVisible('#courts', 10000);
});

Given('they are in alphabetical order', async () => {
  const courts = await I.getTextFromList('#courts > tbody > tr > td:first-child');
  expect(courts).not.equal([]);
  expect(courts).equals(courts.sort());
});

When('I click edit next to court with {string}', async (courtSlug: string) => {
  await I.isElementVisible('#edit-' + courtSlug, 10000);
  await I.click('#edit-' + courtSlug);
});

When('I click edit next to court with {string}', async (courtSlug: string) => {
  await I.isElementVisible('#edit-' + courtSlug, 10000);
  await I.click('#edit-' + courtSlug);
});

Then('I am redirected to the Edit Court page for the {string}', async (courtName: string) => {
  const pageTitle = await I.getPageTitle();
  const editCourtHeading = await I.getElement('#court-name');
  const editCourtHeadingText = await I.getElementText(editCourtHeading);
  expect(pageTitle).equal('Edit Court');
  expect(editCourtHeadingText).equal('Editing - ' + courtName);
  await I.checkElementIsAnchor('#courts');
  await I.checkElementIsAnchor('#my-account');
  await I.checkElementIsAnchor('#logout');
  await I.checkElementIsAnchor('#view-in-new-window');
  await I.checkElementIsAnchor('#general');
});

When('I click view next to court with {string}', async (courtSlug: string) => {
  const selector = '#view-' + courtSlug;
  await I.isElementVisible(selector, 10000);
  await I.click(selector);
});

When('I go to the courts page', async () => {
  await I.click('#courts');
});

Then('I am redirected to the View Court page for the {string}', async (courtName: string) => {
  const selector = '#main-content > div > div > h1';
  await I.isElementVisible(selector, 10000);
  const viewCourtHeading = await I.getElement(selector);
  expect(await I.getElementText(viewCourtHeading)).equal(courtName);
});
