import {Given} from "cucumber";
import * as I from "../utlis/puppeteer.util";
import {expect} from "chai";

Given('It is {string} that the {string} tab is visible', async (isPresent: string, selector: string) => {
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(isPresent === 'true');
});
