import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';


When('I click bulk update', async () => {
  await I.click('#bulk-update');
});

Then('I am on the {string} page', async (title: string) => {
  await I.isElementVisible('h1', 3000);
  const el = await I.getElement('h1');
  const pageTitle = await I.getElementText(el);
  expect(pageTitle).equal(title);
});

When('I select court {string}', async (court: string) => {
  const selector = `input[value="${court}"]`;
  await I.isElementVisible(selector, 3000);
  await I.click(`input[value="${court}"]`);
});

When('I check include closed checkbox', async () => {
  const selector = '#toggle-closed-courts-display';
  await I.isElementVisible(selector, 3000);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});
