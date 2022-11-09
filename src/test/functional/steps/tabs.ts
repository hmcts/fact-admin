import {Given} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';

Given('It is {string} that the {string} tab is visible', async (isPresent: string, selector: string) => {
  const elementExist = await I.checkElement(selector, 30000);
  expect(elementExist).equal(isPresent === 'true');
});
