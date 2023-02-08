import {Then} from 'cucumber';
import {expect} from 'chai';

import * as I from '../utlis/puppeteer.util';

Then('An error is displayed for court lock with title {string} and summery {string}', async (errorTitle: string, errorSummery: string) => {
  const errorTitleSelector = '#error-summary-title';
  const errorSummerySelector = '#main-content > div.govuk-error-summary > div > div  > ul > li';

  expect(await I.checkElement(errorTitleSelector)).equal(true);
  expect(await I.checkElement(errorSummerySelector)).equal(true);

  const errorTitleElement = await I.getElement(errorTitleSelector);
  expect(await I.getElementText(errorTitleElement)).equal(errorTitle);

  const errorSummeryElement = await I.getElement(errorSummerySelector);
  expect(await I.getElementText(errorSummeryElement)).equal(errorSummery);
});
