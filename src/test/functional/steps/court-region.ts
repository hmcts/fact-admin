import {Then, When} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';

Then('I can view the courts regions', async () => {
  const elementExist = await I.checkElement('#regionSelector');
  expect(elementExist).equal(true);
});

When('I select the region Yorkshire and the Humber {string}', async (region: string) => {
  const selector = '#regionSelector';
  expect(await I.checkElement(selector)).equal(true);
  await I.selectItem(selector, region);
});

Then( 'I can see the courts {string} and {string} in the list', async (bradfordCourt: string,leedsCourt: string) => {
  const elementExist1 = await I.checkElement('#edit-' + bradfordCourt);
  const elementExist2 = await I.checkElement('#edit-' + leedsCourt);
  expect(elementExist1).equal(true) && expect(elementExist2).equal(true);
});
