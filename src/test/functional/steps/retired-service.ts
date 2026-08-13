import {expect} from 'chai';
import {Then} from 'cucumber';

import * as I from '../utlis/puppeteer.util';

Then('I am directed to the retired service page', async () => {
  const pageUrl = new URL(I.getPageUrl());

  expect(pageUrl.pathname).equal('/use-new-service');
  expect(await I.getPageTitle()).equal(
    'This version of Find a Court or Tribunal is no longer in use - GOV.UK'
  );

  const heading = await I.getElement('h1');
  expect(await I.getElementText(heading)).equal(
    'This version of Find a Court or Tribunal is no longer in use.'
  );
  expect(await I.checkElement('a[href*="fact-admin-frontend"]')).equal(true);
  expect(await I.checkElement('#logout')).equal(true);
});
