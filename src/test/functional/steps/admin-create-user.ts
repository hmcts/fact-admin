import {When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';

When('I click on users link', async () => {
  const selector = '#users';

  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I am redirected to the IDAM User dashboard', async () => {
  const pageTitle = await I.getPageTitle();
  expect(pageTitle).equal('Add or Manage User - IDAM User Dashboard - GOV.UK');
});
