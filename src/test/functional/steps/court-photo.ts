import { Then, When } from 'cucumber';
import { expect } from 'chai';
import * as I from '../utlis/puppeteer.util';
import {FunctionalTestHelpers} from '../utlis/helpers';
const scope = require('../support/scope');

When('I hover over nav element', async () => {
  const selector = '#nav';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.hover(selector);
});

When('I click the photo tab', async () => {
  const selector = '#tab_photo';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the existing court photo form', async () => {
  const elementExist = await I.isElementVisible('#photoForm');
  expect(elementExist).equal(true);
});

When('I check for existing photo then delete it',  async () => {
  const selector = '#photoContent > h2:nth-child(2)';
  if(await I.checkElement(selector))
  {
    const selector = 'button[name="deletePhoto"]';
    expect(await I.checkElement(selector)).equal(true);
    await I.click(selector);
  }
});

When('I upload new photo',  async () => {
  const fileSelector = '#court-photo-file-upload';
  expect(await I.checkElement(fileSelector)).equal(true);
  //await I.click(fileSelector);
  const [fileChooser] = await Promise.all([
    scope.page.waitForFileChooser(),
    scope.page.click(fileSelector)
  ]);
  //await I.click('button[name="updatePhoto"]');
  await fileChooser.accept(['src/test/SampleJPGImage_100kbmb (1).jpg']);
});

When('I click update photo button', async () => {
  const selector = 'button[name="updatePhoto"]';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('A green message is displayed for {string}', async (message: string) => {
  const selector = '#photoContent > div.govuk-panel.govuk-panel--confirmation > h1';
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});
