import { I } from '../utlis/codecept-util';
import {expect} from 'chai';


Then('I can view the courts or tribunals in a list format', async () => {
  I.seeElement('#courts');
});

Given('they are in alphabetical order', async () => {
  const courts = await I.grabTextFromAll('#courts > tbody > tr > td:first-child');
  console.log('courts');
  expect(courts).not.equal([]);
  expect(courts).equals(courts.sort());
});

Then('test', async () => {

  // I.executeScript(() => {
  //   console.log('This is a console log message');
  // });
  //
  // I.wait(1000);

  // I.say('mmmmmmmmmmmmmmmmmmm');
  //
  // const event = require('codeceptjs').event;
  //
  // module.exports = function() {
  //
  //   event.dispatcher.on(event.test.before, function (test) {
  //
  //     console.log('--- I am before test --');
  //
  //   });
  // }
  //
  //
  const output = require('codeceptjs').output;

  output.log('..................test................');

  I.wait(1000);
  // console.log('..................test puppeeteer................');

});

When('I click edit next to court with {string}', async (courtSlug: string) => {
  I.seeElement('#edit-' + courtSlug);
  I.click('#edit-' + courtSlug);
});

Then('I am redirected to the Edit Court page for the {string}', async (courtName: string) => {
  const pageTitle = await I.grabTitle();
  const editCourtHeadingText = await I.grabTextFrom('#court-name');
  expect(pageTitle).equal('Edit Court');
  expect(editCourtHeadingText.trim()).equal('Editing - ' + courtName);
  await I.seeElement('#courts');
  await I.seeElement('#my-account');
  await I.seeElement('#logout');
  await I.seeElement('#view-in-new-window');
  await I.seeElement('#general');
});

When('I click view next to court with {string}', async (courtSlug: string) => {
  const selector = '#view-' + courtSlug;
  I.seeElement(selector);
  await I.click(selector);
});

Then('I am redirected to the View Court page for the {string}', async (courtName: string) => {
  const selector = '#main-content > div > div > h1';
  I.seeElement(selector);
  expect((await I.grabTextFrom(selector)).trim()).equal(courtName);
});
