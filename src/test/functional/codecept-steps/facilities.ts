
import {FunctionalTestHelpers} from '../utlis/helpers';
import {I} from '../utlis/codecept-util';

When('I click the facilities tab', () => {
  const selector = '#tab_court-facilities';
  I.moveCursorTo(selector);
  I.click(selector);
  I.moveCursorTo('#court-name'); //move away from the tab list
});

When('I remove all existing facility entries and save', async () => {
  await FunctionalTestHelpers.clearFieldsetsAndSave('#courtFacilitiesTab', 'deleteFacility', 'saveFacilities');
});

Then('a green message is displayed for updated facilities {string}', (msgUpdated: string) => {
  const selector = '//*[@id="courtFacilitiesContent"]/div/h1';
  I.seeElement(selector);
  I.see(msgUpdated, selector);
});

When('I enter facility {string} and enter description in english {string} and welsh {string}', async (facility: string, englishDescription: string, welshDescription: string) => {
  const numFieldsets = await I.grabNumberOfVisibleElements('#courtFacilitiesTab fieldset');
  const entryFormIdx = numFieldsets - 1;
  let facilityIdx = 0;
  const selectorIndex = entryFormIdx + 1;

  const facilityOptionSelector = '//select[@id="name-1"]';
  I.seeElement(facilityOptionSelector);
  //use grabHTMLFrom to get the innerHTML of the select element
  //then use regex to create an array of all facilites
  //then shift to remove the first one because it is blank
  const courtFacilities: string = await I.grabHTMLFrom(facilityOptionSelector);
  const arrayofcourtFacilities = courtFacilities.match(/(?<=>)(.*?)(?=<)/g) ?? [];
  arrayofcourtFacilities.shift();

  while (arrayofcourtFacilities[facilityIdx] != facility)
    facilityIdx++;

  if(entryFormIdx > 0 )
    facilityIdx += 1;

  I.selectOption('//select[@id="name-' + selectorIndex + '"]', facility);
  I.doubleClick('//*[@id="description-' + selectorIndex + '_ifr"]');
  I.type(englishDescription);
  I.doubleClick('//*[@id="descriptionCy-'+selectorIndex+'_ifr"]');
  I.type(welshDescription);
});

When('I enter description in english {string}', async (englishDescription: string) => {

  const numFieldsets = await I.grabNumberOfVisibleElements('#courtFacilitiesTab fieldset');
  const entryFormIdx = numFieldsets - 1;

  // to keep the indexing the same as the select elements in the existing facility, where the
  // select element doesn't contain an empty entry.

  const selectorIndex = entryFormIdx + 1;
  I.doubleClick('//*[@id="description-'+selectorIndex+'_ifr"]');
  I.type(englishDescription);
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

Then('the facility entry in last position has index {string} description in english {string} and welsh {string}', async (value: string, englishDescription: string, welshDescription: string) => {
  const fieldsetSelector = '#courtFacilitiesTab fieldset';
  const numFacilities = await I.grabNumberOfVisibleElements(fieldsetSelector);
  const lastIndex = numFacilities - 2; // we deduct one each for zero-based index, hidden template fieldset and new facility fieldset.
  const selectorIndex = lastIndex + 1;

  const englishDescriptionSelector = '//*[@id="description-' + selectorIndex + '_ifr"]';
  const welshDescriptionSelector = '//*[@id="descriptionCy-' + selectorIndex + '_ifr"]';

  I.doubleClick(englishDescriptionSelector);
  within({frame: englishDescriptionSelector}, () => {
    I.seeElement('#tinymce');
    I.see(englishDescription);
  });
  I.doubleClick(welshDescriptionSelector);
  within({frame: welshDescriptionSelector}, () => {
    I.seeElement('#tinymce');
    I.see(welshDescription);
  });

  const facilityOptionSelector = '//select[@id="name-'+selectorIndex+'"]';
  //use grabHTMLFrom to get the innerHTML of the select element
  //then use regex to create an array of all facility values
  //then shift to remove the first one because it is blank
  const courtFacilities: string = await I.grabHTMLFrom(facilityOptionSelector);
  const arrayofcourtFacilities = courtFacilities.match(/(?<=value=")(.*?)(?=")/g) ?? [];
  arrayofcourtFacilities.shift();
  //expect(arrayofcourtFacilities[selectorIndex]).toEqual(value);

});

Then('there are no facility entries', async () => {
  I.dontSeeElement('//select[@id="name-2"]');
});

When('An error is displayed for facilities with summary {string} and field message {string}', (summary: string, message: string) => {
  const titleSelector = '//*[@id="courtFacilitiesContent"]/div/div/h2';
  I.seeElement(titleSelector);
  I.seeTextEquals('There is a problem', titleSelector);

  const summarySelector = '//*[@id="courtFacilitiesContent"]/div/div/div/ul/li';
  I.seeElement(summarySelector);
  I.seeTextEquals(summary, summarySelector);

  const feildErrorSelector = '//*[@id="name-1-error"]';
  I.seeElement(feildErrorSelector);
  I.see(message, feildErrorSelector);
  const secondfeildErrorSelector = '//*[@id="name-2-error"]';
  I.seeElement(secondfeildErrorSelector);
  I.see(message, secondfeildErrorSelector);

});

When('An error is displayed for facilities with summary {string} and description field message {string}', (summary: string, message: string) => {
  const titleSelector = '//*[@id="courtFacilitiesContent"]/div/div/h2';
  I.seeElement(titleSelector);
  I.seeTextEquals('There is a problem', titleSelector);

  const summarySelector = '//*[@id="courtFacilitiesContent"]/div/div/div/ul/li';
  I.seeElement(summarySelector);
  I.seeTextEquals(summary, summarySelector);

  const feildErrorSelector = '//*[@id="description-1-error"]';
  I.seeElement(feildErrorSelector);
  I.see(message, feildErrorSelector);
});

When('An error is displayed for facilities with summary {string} and name field message {string}', (summary: string, message: string) => {
  const titleSelector = '//*[@id="courtFacilitiesContent"]/div/div/h2';
  I.seeElement(titleSelector);
  I.seeTextEquals('There is a problem', titleSelector);

  const summarySelector = '//*[@id="courtFacilitiesContent"]/div/div/div/ul/li';
  I.seeElement(summarySelector);
  I.seeTextEquals(summary, summarySelector);

  const feildErrorSelector = '//*[@id="name-1-error"]';
  I.seeElement(feildErrorSelector);
  I.see(message, feildErrorSelector);
});
