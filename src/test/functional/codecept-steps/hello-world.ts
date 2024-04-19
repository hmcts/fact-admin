import { config as testConfig } from '../../config';
import { expect } from 'chai';
import { I } from '../utlis/codecept-util';

export const iAmOnPage = (text: string): void => {
  const url = new URL(text, testConfig.TEST_URL);
  if (!url.searchParams.has('lng')) {
    url.searchParams.set('lng', 'en');
  }
  I.amOnPage(url.toString());
};

Given('I am on FACT homepage {string}', iAmOnPage);

Then('I expect the page header to be {string}', async function(title: string) {
  const pageTitle = await I.grabTitle();
  expect(pageTitle).equal(title);
});
