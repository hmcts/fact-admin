import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';


When('I click the types tab', async () => {
  const selector = '#tab_court-types';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I can view the existing court types', async () => {
  const elementExist = await I.checkElement('#courtTypesForm');
  expect(elementExist).equal(true);

  const tabClosed = await I.checkElement('#court-types.govuk-tabs__panel--hidden');
  expect(tabClosed).equal(false);
});


When('I check a court type', async () => {
  const selector = '#court_types-3';
  const elementExist = await I.checkElement('#court_types-3');
  expect(elementExist).equal(true);

  await I.click(selector);

});

Then('I click on save court type', async () => {

  await FunctionalTestHelpers.clickButton('#courtTypesTab', 'saveCourtTypes');
});

Then('a green update message is displayed showing Court Types updated', async () => {
  const elementExist = await I.checkElement('#courtTypesTab .govuk-panel--confirmation');
  expect(elementExist).equal(true);
});

When('I uncheck a court type', async () => {
  const selector = '#court_types-3';
  await I.click(selector);

  const checked = await I.isElementChecked('#court_types-3');
  expect(checked).equal(false);
});

Then('a court types error message is displayed', async () => {
  const elementExist = await I.checkElement('#courtTypesTab .govuk-error-summary');
  expect(elementExist).equal(true);

});

When('I check a court type which has code associated with it', async () => {
  const selector = '#court_types';
  const elementExist = await I.checkElement('#court_types');
  expect(elementExist).equal(true);

  await I.click(selector);

});

