import {Then} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';

Then ('I can see the court postcodes appear in alpha numeric order', async ()=> {
  const selector = '#postcodesList > div > div > div > div > label';
  expect(await I.isElementVisible(selector, 10000)).equal(true);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  const courtPostcodes: string[] = await I.getHtmlFromElements(selector);
  expect(courtPostcodes.length > 0).equal(true);
  const courtPostcodesToSort: string[] = await I.getHtmlFromElements(selector);
  const isTheSame =   courtPostcodesToSort.sort().join() === courtPostcodes.join();
  expect(isTheSame).equal(true);
});
