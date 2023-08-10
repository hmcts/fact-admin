
import { I } from '../utlis/codecept-util';
import {expect} from 'chai';

 Then('An error is displayed for court lock with title {string} and summery {string}', async (errorTitle: string, errorSummery: string) => {
  const errorTitleSelector = '.govuk-error-summary__title';
  const errorSummerySelector = '#main-content > div.govuk-error-summary > div > div  > ul > li';

  I.seeElement(errorTitleSelector);
  I.seeElement(errorSummerySelector);
  expect(await I.grabTextFrom(errorTitleSelector)).equal(errorTitle);
  expect(await I.grabTextFrom(errorSummerySelector)).equal(errorSummery);




  // expect(await I.checkElement(errorTitleSelector)).equal(true);
  // expect(await I.checkElement(errorSummerySelector)).equal(true);
  //
  // const errorTitleElement = await I.getElement(errorTitleSelector);
  // expect(await I.getElementText(errorTitleElement)).equal(errorTitle);
  //
  // const errorSummeryElement = await I.getElement(errorSummerySelector);
 // expect(await I.getElementText(errorSummeryElement)).equal(errorSummery);
});
