import { I } from '../utlis/codecept-util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I click bulk update', async () => {
  I.click('#bulk-update');
});

Then('I am on the {string} page', async (title: string) => {
  const selector = '#main-content > h1';
  expect(await I.grabTextFrom(selector)).equal(title);
  console.log();
});

When('I check include closed checkbox', async () => {
  const selector = '#toggle-closed-courts-display';
  I.checkOption(selector);
});

When('I add an {string} in the rich editor field provided {string}', async (message: string, id: string) => {
  I.seeElement(id);
  I.clearField('#tinymce');
  within({frame: id}, () => {
    I.seeElement('#tinymce');
    I.clearField('#tinymce');
    I.fillField('#tinymce', message);
  });
});

When('I select court {string}', async (court: string) => {
  I.see(court);
  I.checkOption(`input[aria-label="${court}"]`);
});

Given('I click the update button', async () => {
  await I.click('#update');
});

Then('the message {string} is displayed on the page', async (message: string) => {
  const selector = '#main-content > div > h2';
  await  FunctionalTestHelpers.checkGreenMessageSuccess(selector, message);
});
