import { Then, When } from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import { expect } from 'chai';


When('I click bulk update', async () => {
  await I.goTo('/bulk-update');
});

Then('I am on the {string} page', async (title: string) => {
  const pageTitle = await I.getPageTitle();
  expect(pageTitle).equal(title);
});

When('I select court {string}', async (court: string) => {
  await I.checkElement(`input[value=${court}]`);
});
