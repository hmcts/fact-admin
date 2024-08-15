import { I } from '../utlis/codecept-util';
import {expect} from 'chai';

When('I click on users link', async () => {
  const selector = '#users';
  I.seeElement(selector);
  await I.click(selector);
});

When('I am redirected to the IDAM User dashboard', async () => {
  const pageTitle = await I.grabTitle();
  expect(pageTitle).equal('Add or Manage User - IDAM User Dashboard - GOV.UK');
});
