import { I } from '../utlis/codecept-util';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I hover over nav element', async () => {
  const selector = '#nav';
  I.seeElement(selector);
  I.moveCursorTo(selector);
});

When('I click the photo tab', async () => {
  const selector = '#tab_photo';
  I.seeElement(selector);
  await I.click(selector);
});

Then('I can view the existing court photo form', async () => {
  I.waitForVisible('#photoForm', 3000)
});

When('I check for existing photo then delete it',  async () => {
  const selector = '#photoContent > h2:nth-child(2)';
  const photoContent = await I.grabNumberOfVisibleElements(selector);
  if(photoContent)
  {
    const selector = 'button[name="deletePhoto"]';
    I.seeElement(selector);
    await I.click(selector);
    const confirmDeleteSelector = '#confirmDelete';
    I.seeElement(confirmDeleteSelector);
    await I.click(confirmDeleteSelector);
  }
});

When('I upload new photo',  async () => {
  const fileSelector = '#court-photo-file-upload';
  const filePath = '../functional/SampleJPGImage_100kbmb (1).jpg';
  await I.attachFile(fileSelector,filePath);
});

When('I click update photo button', async () => {
  const selector = 'button[name="updatePhoto"]';
  I.seeElement(selector);
  await I.click(selector);
});

Then('A green message is displayed for {string}', async (message: string) => {
  const selector = '#photoContent > div.govuk-panel.govuk-panel--confirmation > h1';
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});

