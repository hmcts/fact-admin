import { Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import * as I from '../utlis/puppeteer.util';

Then('I can view the courts or tribunals in a list format', async () => {
  const elementExist = await I.checkElement('#courts');
  expect(elementExist).equal(true);
});

Given('they are in alphabetical order', async () => {
  const elements = await I.getElements('#courts > li');
  const courts = await I.getTextFromList(elements);
  expect(courts).not.equal([]);
  expect(courts).equals(courts.sort());
});

When('I click view next to a court', async () => {
  await I.click('#courts > li > a');
});

Then('I am directed to the court profile page', async () => {
  const pageTitle = await I.getPageTitle();
  expect(pageTitle).equal('Courts');
});
