// import {Then, When} from 'cucumber';
//import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';

import {I} from '../utlis/codecept-util';

When('I click the facilities tab', async () => {
  const selector = '#tab_court-facilities';
  await I.moveCursorTo(selector);
  await I.click(selector);
  await I.moveCursorTo('#court-name'); //move away from the tab list
});

When('I remove all existing facility entries and save', async () => {
  const numFacilities = await I.grabNumberOfVisibleElements('//button[@name="deleteFacility"]');
  if(numFacilities > 0) {
    await I.click('//button[@name="deleteFacility"]');
    await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'saveFacilities');
  }
});

Then('a green message is displayed for updated facilities {string}', async (msgUpdated: string) => {
  const selector = '//*[@id="courtFacilitiesContent"]/div/h1';
  await I.seeElement(selector);
  await I.see(msgUpdated, selector);
});

When('I enter facility {string} and enter description in english {string} and welsh {string}', async (facility: string, englishDescription: string, welshDescription: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#courtFacilitiesTab fieldset');
  const entryFormIdx = numFieldsets - 1;
  let facilityIdx = 0;
  const selectorIndex = entryFormIdx + 1;

  const facilityOptionSelector = '//select[@id="name-1"]';
  await I.seeElement(facilityOptionSelector);
  //use grabHTMLFrom to get the innerHTML of the select element
  //then use regex to create an array of all facilites
  //then shift to remove the first one because it is blank
  const courtFacilities: string = await I.grabHTMLFrom(facilityOptionSelector);
  let arrayofcourtFacilities = courtFacilities.match(/(?<=>)(.*?)(?=<)/g);
  if(arrayofcourtFacilities == null){
    arrayofcourtFacilities = [];
  }
  arrayofcourtFacilities.shift();

  while (arrayofcourtFacilities[facilityIdx] != facility)
    facilityIdx++;

  if(entryFormIdx > 0 )
    facilityIdx += 1;

  await I.selectOption('//select[@id="name-'+selectorIndex+'"]', facility);
  await I.doubleClick('//*[@id="description-'+selectorIndex+'_ifr"]');
  await I.type(englishDescription);
  await I.doubleClick('//*[@id="descriptionCy-'+selectorIndex+'_ifr"]');
  await I.type(welshDescription);


});

When('I enter description in english {string}', async (englishDescription: string) => {

  const numFieldsets = await I.grabNumberOfVisibleElements('#courtFacilitiesTab fieldset');
  const entryFormIdx = numFieldsets - 1;

  // to keep the indexing the same as the select elements in the existing facility, where the
  // select element doesn't contain an empty entry.

  const selectorIndex = entryFormIdx + 1;
  await I.doubleClick('//*[@id="description-'+selectorIndex+'_ifr"]');
  await I.type(englishDescription);
});

When('I click on add new facility', async () => {
  await FunctionalTestHelpers.clickButtonAndCheckFieldsetAdded('#courtFacilitiesTab', 'addFacility');
});

When('I click save in the facilities tab', async () => {
  await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'saveFacilities');
});

When('I click clear in the facilities tab', async () => {
  await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'clearFacility');
});
//
// Then('the facility entry in second last position has value {string} description in english {string} and welsh {string}', async (value: number, englishDescription: string, welshDescription: string) => {
//   const fieldsetSelector = '#courtFacilitiesTab fieldset';
//   const numFacilities = await I.countElement(fieldsetSelector);
//   const secondLastIndex = numFacilities - 3; // we deduct one each for zero-based index, hidden template fieldset, new facility fieldset and the last entry.
//   const selectorIndex = secondLastIndex + 1;
//
//   const englishDescriptionSelector = '#description-' + selectorIndex + '_ifr';
//   const welshDescriptionSelector = '#descriptionCy-' + selectorIndex + '_ifr';
//
//   const englishDescriptionTxt = await I.getIframeContent(englishDescriptionSelector);
//   expect(englishDescriptionTxt).equal(englishDescription);
//
//   const welshDescriptionTxt = await I.getIframeContent(welshDescriptionSelector);
//   expect(welshDescriptionTxt).equal(welshDescription);
//
//   const facilityValue = await I.getElementValueAtIndex(`${fieldsetSelector} .govuk-select`, secondLastIndex);
//   expect(facilityValue).equal(value);
// });
//
Then('the facility entry in last position has index {string} description in english {string} and welsh {string}', async (value: string, englishDescription: string, welshDescription: string) => {
  const fieldsetSelector = '#courtFacilitiesTab fieldset';
  const numFacilities = await I.grabNumberOfVisibleElements(fieldsetSelector);
  const lastIndex = numFacilities - 2; // we deduct one each for zero-based index, hidden template fieldset and new facility fieldset.
  const selectorIndex = lastIndex + 1;

  const englishDescriptionSelector = '//*[@id="description-' + selectorIndex + '_ifr"]';
  const welshDescriptionSelector = '//*[@id="descriptionCy-' + selectorIndex + '_ifr"]';

  await I.doubleClick(englishDescriptionSelector);
  within({frame: englishDescriptionSelector}, () => {
    I.seeElement('#tinymce');
    I.see(englishDescription);
  });
  await I.doubleClick(welshDescriptionSelector);
  within({frame: welshDescriptionSelector}, () => {
    I.seeElement('#tinymce');
    I.see(welshDescription);
  });

  const facilityOptionSelector = '//select[@id="name-'+selectorIndex+'"]';
  //use grabHTMLFrom to get the innerHTML of the select element
  //then use regex to create an array of all facility values
  //then shift to remove the first one because it is blank
  const courtFacilities: string = await I.grabHTMLFrom(facilityOptionSelector);
  let arrayofcourtFacilities = courtFacilities.match(/(?<=value=")(.*?)(?=")/g);
  if(arrayofcourtFacilities == null){
    arrayofcourtFacilities = [];
  }
  arrayofcourtFacilities.shift();
  //expect(arrayofcourtFacilities[selectorIndex]).toEqual(value);

});

When('I click the remove button under newly added facility entries', async () => {
  await FunctionalTestHelpers.clickButton('#courtFacilitiesTab', 'clearFacility');
  const numFacilities = await I.grabNumberOfVisibleElements('//button[@name="deleteFacility"]');
  if(numFacilities > 0) {
    await I.click('//button[@name="deleteFacility"]');
  }
});

Then('there are no facility entries', async () => {
  await I.dontSeeElement('//select[@id="name-2"]');
});

When('An error is displayed for facilities with summary {string} and field message {string}', async (summary: string, message: string) => {
  const titleSelector = '//*[@id="courtFacilitiesContent"]/div/div/h2';
  await I.seeElement(titleSelector);
  await I.seeTextEquals('There is a problem', titleSelector);

  const summarySelector = '//*[@id="courtFacilitiesContent"]/div/div/div/ul/li';
  await I.seeElement(summarySelector);
  await I.seeTextEquals(summary, summarySelector);

  const feildErrorSelector = '//*[@id="name-1-error"]';
  await I.seeElement(feildErrorSelector);
  await I.see(message, feildErrorSelector);
  const secondfeildErrorSelector = '//*[@id="name-2-error"]';
  await I.seeElement(secondfeildErrorSelector);
  await I.see(message, secondfeildErrorSelector);

});

When('An error is displayed for facilities with summary {string} and description field message {string}', async (summary: string, message: string) => {
  const titleSelector = '//*[@id="courtFacilitiesContent"]/div/div/h2';
  await I.seeElement(titleSelector);
  await I.seeTextEquals('There is a problem', titleSelector);

  const summarySelector = '//*[@id="courtFacilitiesContent"]/div/div/div/ul/li';
  await I.seeElement(summarySelector);
  await I.seeTextEquals(summary, summarySelector);

  const feildErrorSelector = '//*[@id="description-1-error"]';
  await I.seeElement(feildErrorSelector);
  await I.see(message, feildErrorSelector);
});

When('An error is displayed for facilities with summary {string} and name field message {string}', async (summary: string, message: string) => {
  const titleSelector = '//*[@id="courtFacilitiesContent"]/div/div/h2';
  await I.seeElement(titleSelector);
  await I.seeTextEquals('There is a problem', titleSelector);

  const summarySelector = '//*[@id="courtFacilitiesContent"]/div/div/div/ul/li';
  await I.seeElement(summarySelector);
  await I.seeTextEquals(summary, summarySelector);

  const feildErrorSelector = '//*[@id="name-1-error"]';
  await I.seeElement(feildErrorSelector);
  await I.see(message, feildErrorSelector);
});
