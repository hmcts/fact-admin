import {Then, When} from 'cucumber';
import {expect} from 'chai';
import * as I from '../utlis/puppeteer.util';
import {FunctionalTestHelpers} from '../utlis/helpers';
//const scope = require('../support/scope');

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
  const elementExist = await I.isElementVisible('#photoForm', 10000);
  expect(elementExist).equal(true);
});

When('I check for existing photo then delete it',  async () => {
  const selector = '#photoContent > h2:nth-child(2)';
  if(await I.checkElement(selector))
  {
    const selector = 'button[name="deletePhoto"]';
    await I.isElementVisible(selector, 10000);
    await I.click(selector);
    const confirmDeleteSelector = '#confirmDelete';
    expect(await I.checkElement(confirmDeleteSelector)).equal(true);
    await I.click(confirmDeleteSelector);
  }
});

When('I upload new photo',  async () => {
  const fileSelector = '#court-photo-file-upload';
  expect(await I.checkElement(fileSelector)).equal(true);
  const filePath = 'src/test/functional/SampleJPGImage_100kbmb (1).jpg';
  await I.uploadFile(fileSelector,filePath);
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
