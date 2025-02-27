import {Given, Then, When} from 'cucumber';
import {expect} from 'chai';
import * as I from '../utlis/puppeteer.util';
import {FunctionalTestHelpers} from '../utlis/helpers';

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
  const elementExist = await I.checkElement('#edit-' + courtSlug);
  expect(elementExist).equal(true);
  await I.click('#edit-' + courtSlug);
});

Then('I am redirected to the Edit Court page for the {string}', async (courtName: string) => {
  const pageTitle = await I.getPageTitle();
  const editCourtHeading = await I.getElement('#court-name');
  const editCourtHeadingText = await I.getElementText(editCourtHeading);
  expect(pageTitle).equal('Edit Court - ' + courtName + ' - ' + FunctionalTestHelpers.DEPARTMENT_SERVICE);
  expect(editCourtHeadingText).equal('Editing - ' + courtName);
  await I.checkElementIsAnchor('#courts');
  await I.checkElementIsAnchor('#my-account');
  await I.checkElementIsAnchor('#logout');
  await I.checkElementIsAnchor('#view-in-new-window');
  await I.checkElementIsAnchor('#general');
});

Then('I am redirected to the Details page for the {string}', async (courtName: string) => {
  const pageTitle = await I.getPageTitle();
  const editCourtHeading = await I.getElement('#court-name');
  const editCourtHeadingText = await I.getElementText(editCourtHeading);
  expect(pageTitle).equal('Details - ' + courtName + ' - ' + FunctionalTestHelpers.DEPARTMENT_SERVICE);
  expect(editCourtHeadingText).equal('Details - ' + courtName);
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
