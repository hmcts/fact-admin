import { Then, When } from 'cucumber';
import { expect } from 'chai';

import * as I from '../utlis/puppeteer.util';

When('I click edit next to a chosen court or tribunal', async () => {
  const elementExist = await I.checkElement('#courts > tbody > tr > td:nth-child(4) > a');
  expect(elementExist).equal(true);
  await I.click('#courts > tbody > tr > td:nth-child(4) > a');
});

Then('I am redirected to the Edit Court page for the chosen court', async () => {
  const pageTitle = await I.getPageTitle();
  expect(pageTitle).equal('Court Details');
});
