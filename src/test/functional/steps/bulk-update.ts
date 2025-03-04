import { Then, When } from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import { expect } from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';


When('I click bulk update', async () => {
  await I.click('#bulk-update');
});

Then('I am on the {string} page', async (title: string) => {
  const el = await I.getElement('h1');
  const pageHeading = await I.getElementText(el);
  const pageTitle = await I.getPageTitle();
  expect(pageHeading).equal(title);
  expect(pageTitle).equal(title + ' - ' + FunctionalTestHelpers.DEPARTMENT_SERVICE);
});

When('I select court {string}', async (court: string) => {
  await I.click(`input[value="${court}"]`);
});

When('I check include closed checkbox', async () => {
  const selector = '#toggle-closed-courts-display';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});
