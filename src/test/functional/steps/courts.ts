import { Given, Then, When } from 'cucumber';
import { expect } from 'chai';

import * as I from '../utlis/puppeteer.util';

Then('I can view the courts or tribunals in a list format', async () => {
  const elementExist = await I.checkElement('#courts');
  expect(elementExist).equal(true);
});

Given('they are in alphabetical order', async () => {
  const elements = await I.getElements('#courts > tbody > tr > td');
  const courts = await I.getTextFromList(elements);
  expect(courts).not.equal([]);
  expect(courts).equals(courts.sort());
});

When('I click view next to a court', async () => {
  const elementExist = await I.checkElement('#courts > tbody > tr > td > a');
  expect(elementExist).equal(true);
  await I.click('#courts > tbody > tr > td > a');
});

Then('I am directed to the court profile page', async () => {
  const pageTitle = await I.getPageTitle();
  expect(pageTitle).equal('Court Details');
});
