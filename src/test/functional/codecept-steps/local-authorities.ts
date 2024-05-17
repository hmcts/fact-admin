import { I } from '../utlis/codecept-util';
import {FunctionalTestHelpers} from '../utlis/helpers';

When('I hover over local authorities element', async () => {
  const selector = '#tab_local-authorities';
  I.seeElement(selector);
  I.moveCursorTo(selector);
});

Then('I click the local authorities tab', async () => {
  const selector = '#tab_local-authorities';
  I.moveCursorTo(selector);
  I.click(selector);
  I.moveCursorTo('#court-name'); //move away from the tab list
});

When('I will make sure Family court type is selected', async () => {
  const selector = '#court_types-2';
  const checked = await I.grabAttributeFrom(selector, 'aria-expanded');
  if(checked == 'false') {
    I.checkOption(selector);
  }
   I.fillField('#familyCourtCode', '123');
});

Then('I make sure there is no area of law selected', async () => {
   I.seeNumberOfVisibleElements('//*[@name="casesHeardItems"]', 23);
  const casesHeardIDs = await I.grabAttributeFromAll('//*[@name="casesHeardItems"]', 'id');
  for (let i = 0; i < casesHeardIDs.length; ++i) {
    I.uncheckOption('//*[@id="'+casesHeardIDs[i]+'"]');
  }
});


When('I select area of law {string}', async (areaOfLaw: string) => {
  const selector = '#courtAreasOfLaw';
  I.seeElement(selector);
  I.selectOption('Select a area of law', areaOfLaw);
});

When('I click edit next to court with {string}', async (courtSlug: string) => {
  I.seeElement('#edit-' + courtSlug);
  I.click('#edit-' + courtSlug);
});

When('I select {string}', async (areaOfLaw: string) => {
  const selector = '//*[@id="397353"]';
   I.seeElement(selector);
   I.checkOption(selector);
});

When('I deselect {string}', async (areaOfLaw: string) => {
  const selector = '//*[@id="397353"]';
  I.seeElement(selector);
  I.uncheckOption(selector);
});

When('I click on local authorities save button', async () => {
  await FunctionalTestHelpers.clickButton('#localAuthoritiesTab', 'saveLocalAuthorities');
});

Then('Success message is displayed for local authorities with summary {string}', async (successMsg: string) => {
  const selector = '//*[@id="localAuthoritiesContent"]/div[1]/h1';
  I.seeElement(selector);
  I.seeTextEquals(successMsg, selector);
});

Then('An error is displayed for local authorities with title {string} and summery {string}', async (errorTitle: string, errorSummary: string) => {
  const titleSelector = '//*[@id="localAuthoritiesContent"]/div/div/h2';
   I.seeElement(titleSelector);
   I.seeTextEquals(errorTitle, titleSelector);

  const summarySelector = '//*[@id="localAuthoritiesContent"]/div/div/div/ul/li';
   I.seeElement(summarySelector);
   I.seeTextEquals(errorSummary, summarySelector);
});

When('I will make sure Family court type is not selected', async () => {
  const selector = '#court_types-2';
  const checked = await I.grabAttributeFrom(selector, 'aria-expanded');
  if(checked == 'true') {
     I.uncheckOption(selector);
  }
});

Then('The local authorities tab should be disabled', async () => {
  const selector = '//*[@id="localAuthoritiesTab"]';
  I.seeAttributesOnElements(selector,{class: 'disable-tab'});
});
