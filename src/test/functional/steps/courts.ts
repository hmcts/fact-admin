import { Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import * as I from '../utlis/puppeteer.util';

Then('I can view the courts or tribunals in a list format', async () => {
  const elementExist = await I.checkElement('#courts');
  expect(elementExist).equal(true);
});

Given('they are in alphabetical order', async () => {
  const courts = await I.getTextFromList('#courts > tbody > tr > td:first-child');
  expect(courts).not.equal([]);
  expect(courts).equals(courts.sort());
});

When('I click view next to court with {string}', async (courtSlug: string) => {
  const elementExist = await I.checkElement('#view-' + courtSlug);
  expect(elementExist).equal(true);
  await I.click('#view-' + courtSlug);
});

When('I click edit next to court with {string}', async (courtSlug: string) => {
  const elementExist = await I.checkElement('#edit-' + courtSlug);
  expect(elementExist).equal(true);
  await I.click('#edit-' + courtSlug);
});

Then('I am directed to the court profile page', async () => {
  const pageTitle = await I.getPageTitle();
  expect(pageTitle).equal('Court Details');
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
