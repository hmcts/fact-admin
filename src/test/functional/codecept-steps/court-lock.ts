
import { I } from '../utlis/codecept-util';
import {expect} from 'chai';

Then('An error is displayed for court lock with title {string} and summery {string}', async (errorTitle: string, errorSummery: string) => {
  const errorTitleSelector = '.govuk-error-summary__title';
  const errorSummerySelector = '#main-content > div.govuk-error-summary > div > div  > ul > li';
  I.seeElement(errorTitleSelector);
  I.seeElement(errorSummerySelector);
  expect((await I.grabTextFrom(errorTitleSelector)).trim()).equal(errorTitle);
  expect((await I.grabTextFrom(errorSummerySelector)).trim()).equal(errorSummery);
});

Then ('I wait for log out to finish', async() => {
  I.wait(20);
});
