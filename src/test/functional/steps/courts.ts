import {Given, Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';
import {puppeteerConfig} from '../puppeteer.config';

Then('I can view the courts or tribunals in a list format', async () => {
  const elementExist = await I.checkElement('#courts');
  expect(elementExist).equal(true);
});

Given('they are in alphabetical order', async () => {
  const courts = await I.getTextFromList('#courts > tbody > tr > td:first-child');
  expect(courts).not.equal([]);
  expect(courts).equals(courts.sort());
});

When('I click edit next to court with {string}', async (courtSlug: string) => {
  console.log('court slug: ' + courtSlug);

  console.log('sign in button');
  console.log(await I.checkElement('#authorizeCommand > div.form-section > div.login-list > input.button'));

  console.log('puppeteerConfig');
  console.log(puppeteerConfig);

  const elementExist = await I.checkElement('#edit-' + courtSlug);
  console.log('element exists: ' + elementExist);

  console.log('dump element:');
  const selector = '#edit-bexley-magistrates-court';
  const viewCourtName = await I.getElement(selector);
  console.log('court name: ' + await I.getElementText(viewCourtName));

  console.log('tableCourtsName:');
  console.log(await I.getElement('#tableCourtsName'));

  console.log('numberOfCourts:');
  console.log(await I.getElement('#numberOfCourts'));

  console.log('main-content > h1:');
  console.log(await I.getElement('#main-content > h1'));

  console.log('tableCourtsUpdated:');
  console.log(await I.getElement('#tableCourtsUpdated'));

  console.log('body > div...:');
  console.log(await I.getElement('body > div > div > div.govuk-grid-column-three-quarters > a:nth-child(2)'));
  expect(elementExist).equal(true);
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
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I am redirected to the View Court page for the {string}', async (courtName: string) => {
  const selector = '#main-content > div > div > h1';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  const viewCourtHeading = await I.getElement(selector);
  expect(await I.getElementText(viewCourtHeading)).equal(courtName);
});
