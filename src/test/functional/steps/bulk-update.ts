import { Then, When } from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import { expect } from 'chai';


When('I click bulk update', async () => {
  await I.click('#bulk-update');
});

Then('I am on the {string} page', async (title: string) => {
  const el = await I.getElement('h1');
  const pageTitle = await I.getElementText(el);
  expect(pageTitle).equal(title);
});

When('I select court {string}', async (court: string) => {
  await I.click(`input[value="${court}"]`);
});
