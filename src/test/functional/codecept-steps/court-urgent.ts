import {expect} from 'chai';
import { I } from '../utlis/codecept-util';
import {config} from '../../config';

Then('I am redirected to the Edit Court page for the chosen court', async () => {
  const pageTitle = await I.grabTitle();
  expect(pageTitle).equal('Edit Court');
});

When('I add an {string} in the field provided {string}', async (message: string, id: string) => {
  I.seeElement(id);
  I.clearField(id);
  I.fillField(id, message);
});

When('I add an {string} in the rich editor field provided {string}', async (message: string, id: string) => {
  I.seeElement(id);
  within({frame: id}, () => {
    I.seeElement('#tinymce');
    I.clearField('#tinymce');
    // I.fillField('#tinymce', "");
    I.fillField('#tinymce', message);
  });
});

Given('I click the update button', async () => {
  await I.click('#update');
});
//
// Then('a message is displayed on the page', async () => {
//   const elementExist = await I.checkElement('#updated-message');
//   expect(elementExist).equal(true);
// });
//
When('I have added the {string} in the Urgent Notice Welsh field', async (welshMessage: string) => {
  const selector = '#generalInfoTab #urgent-notice-welsh_ifr';
  I.seeElement(selector);
  within({frame: selector}, () => {
    I.seeElement('#tinymce');
    I.clearField('#tinymce');
    I.fillField('#tinymce', welshMessage);
  });
});
//
// When('I click the open checkbox', async () => {
//   const selectorOpen = '#generalInfoTab #open';
//
//   const elementOpenCheckboxExist = await I.checkElement(selectorOpen);
//   expect(elementOpenCheckboxExist).equal(true);
//
//   const elementOpenChkboxChecked = await I.isElementChecked(selectorOpen);
//   if (!elementOpenChkboxChecked) {
//     await I.click(selectorOpen);
//   }
// });


When('I select the open checkbox', async () => {
  const selector = '#open';
  I.checkOption(selector);
});

When('I unselect the open checkbox', async () => {
  const selector = '#open';
  I.uncheckOption(selector);
});

// When('I click the close checkbox', async () => {
//   const selectorOpen = '#generalInfoTab #open';
//
//   const elementOpenCheckboxExist = await I.checkElement(selectorOpen);
//   expect(elementOpenCheckboxExist).equal(true);
//
//   const elementOpenChkboxChecked = await I.isElementChecked(selectorOpen);
//   if (elementOpenChkboxChecked) {
//     await I.click(selectorOpen);
//   }
// });

When('I select the Participates in access scheme checkbox', async () => {
  const selector = '#access_scheme';
  I.checkOption(selector);
});

// When('I click the Participates in access scheme checkbox', async () => {
//   const selectorParticipantsAccessSchemeChkbox = '#generalInfoTab #access_scheme';
//
//   const elementParticipantsAccessSchemeChkboxExist = await I.checkElement(selectorParticipantsAccessSchemeChkbox);
//   expect(elementParticipantsAccessSchemeChkboxExist).equal(true);
//
//   const elementParticipantsAccessSchemeChkboxChecked = await I.isElementChecked(selectorParticipantsAccessSchemeChkbox);
//   if (!elementParticipantsAccessSchemeChkboxChecked) {
//     await I.click(selectorParticipantsAccessSchemeChkbox);
//   }
// });

When('I unselect the Participates in access scheme checkbox', async () => {
  const selector = '#access_scheme';
  I.uncheckOption(selector);
});

// When('I unclick the Participates in access scheme checkbox', async () => {
//   const selectorParticipantsAccessSchemeChkbox = '#generalInfoTab #access_scheme';
//
//   const elementParticipantsAccessSchemeChkboxExist = await I.checkElement(selectorParticipantsAccessSchemeChkbox);
//   expect(elementParticipantsAccessSchemeChkboxExist).equal(true);
//
//   const elementParticipantsAccessSchemeChkboxChecked = await I.isElementChecked(selectorParticipantsAccessSchemeChkbox);
//   if (elementParticipantsAccessSchemeChkboxChecked) {
//     await I.click(selectorParticipantsAccessSchemeChkbox);
//   }
// });
//
