import {expect} from 'chai';
import {FunctionalTestHelpers} from '../utlis/helpers';
import {I} from '../utlis/codecept-util';

When('I click the postcodes tab', async () => {
  const selector = '#tab_postcodes';
  I.moveCursorTo(selector);
  I.click(selector);
  I.moveCursorTo('#court-name'); //move away from the tab list
  I.waitForElement('#postcodesTab');
  I.wait(Math.floor(Math.random() * (20 - 1 + 1) + 1)); //1-20 seconds
  //wait a random time to avoid the mapit call spam and get blocked
});

When('I click the types tab', async () => {
  const selector = '#tab_court-types';
  I.moveCursorTo(selector);
  I.click(selector);
  I.moveCursorTo('#court-name'); //move away from the tab list
});

Then('I click on save court type', async () => {
  await FunctionalTestHelpers.clickButton('#courtTypesTab', 'saveCourtTypes');
});

When('I click the cases heard tab', () => {
  const selector = '#tab_cases-heard';
  I.moveCursorTo(selector);
  I.click(selector);
  I.moveCursorTo('#court-name'); //move away from the tab list
});

Then('I click on update on cases heard', async () => {
  await FunctionalTestHelpers.clickButton('#casesHeardTab', 'updateCasesHeard');
});

Then('A green message is displayed for the postcodes {string}', async (message: string) => {
  const selector = '//*[@id="postcodesContent"]/div/h1';
  I.seeElement(selector);
  I.see(message, selector);
});
//
// Then('I click the select all', async () => {
//   const selector = '#postcodes-select-all';
//   const elementExist = await I.checkElement(selector);
//   expect(elementExist).equal(true);
//   await I.click(selector);
// });
//
// When('I click the delete all selected button', async () => {
//   const selector = 'button[name="deletePostcodes"]';
//   const elementExist = await I.checkElement(selector);
//   expect(elementExist).equal(true);
//   await I.click(selector);
// });
Then('I click the add postcode button and wait for success', async () => {
  await FunctionalTestHelpers.clickButton('#postcodesTab', 'addPostcodes');
  //warning is wrong, it needs await for mapit call time
  await I.waitForVisible('//*[@id="postcodesContent"]/h2[2]', 15);
});

Then('I click the add postcode button and wait for failure', async () => {
  await FunctionalTestHelpers.clickButton('#postcodesTab', 'addPostcodes');
  //warning is wrong, it needs await.
  await I.wait(15);
});

Then('I add new postcodes {string}', async (postcodes: string) => {
  const postcodeInputSelector = '//*[@id="addNewPostcodes"]';
  I.seeElement(postcodeInputSelector);
  await I.fillField(postcodeInputSelector, postcodes);
});

Then('The error message display for the postcodes {string}', async (errorMessage: string) => {
  const titleSelector = '//*[@id="postcodesContent"]/div[1]/div/h2';
  I.seeElement(titleSelector);
  I.seeTextEquals('There is a problem', titleSelector);

  const selector = '//*[@id="postcodesContent"]/div[1]/div/div/ul/li';
  I.seeElement(selector);
  I.seeTextEquals(errorMessage, selector);
});
//
// When('I choose the postcodes {string} and {string} to move them from the source court to the destination court', async (firstPostcode: string,secondPostcode: string) => {
//   const firstPostcodeSelector = '#'+firstPostcode;
//   const secondPostcodeSelector = '#'+secondPostcode;
//
//   const elementExistFirstPostcode = await I.checkElement(firstPostcodeSelector);
//   expect(elementExistFirstPostcode).equal(true);
//   const elementExistSecondPostcode = await I.checkElement(secondPostcodeSelector);
//   expect(elementExistSecondPostcode).equal(true);
//
//   await I.click(firstPostcodeSelector);
//   await I.click(secondPostcodeSelector);
// });
//
// Then('I choose the destination court as {string}',async (destinationCourt: string) => {
//   const selector = '#movePostcodesSelect';
//   const elementExist = await I.checkElement(selector);
//   expect(elementExist).equal(true);
//   await I.selectItem(selector, destinationCourt);
// });

When('I will make sure County court type is selected', async () => {
  const selector = '#court_types-4';
  const checked = await I.grabAttributeFrom(selector, 'aria-expanded');
  if(checked == 'false') {
    await I.checkOption(selector);
  }
  await I.fillField('#countyCourtCode', '123');
});

When('I will make sure Money claims is selected', async () => {
  const selector = '#money-claims';
  const checked = await I.grabAttributeFrom(selector, 'aria-checked');
  if(checked == 'false') {
    await I.checkOption(selector);
  }
});

When('I will make sure to delete the existing postcodes', async () => {
  const selector = '//*[@id="postcodes-select-all"]';
  const selectorDelete = '//*[@id="postcodesContent"]/button[2]';
  await I.checkOption(selector);
  await I.click(selectorDelete);
});

Then ('I can see the court postcodes appear in alpha numeric order', async ()=> {
  const selector = '//*[@id="postcodesList"]';
  I.seeElement(selector);

  const courtPostcodes = await I.grabHTMLFrom(selector);
  const arrayOfPostcodes = courtPostcodes.match(/(?<=for=")(.*?)(?=">)/g) ?? [];
  const arrayOfPostcodesToSort = [...arrayOfPostcodes];

  const isTheSame = arrayOfPostcodesToSort.sort().join() === arrayOfPostcodes.join();
  expect(isTheSame).equal(true);
});
//
// Then('I click the move button', async () => {
//   const buttonSelector = 'button[name="movePostcodesButton"]';
//   const elementExist = await I.checkElement(buttonSelector);
//   expect(elementExist).equal(true);
//   await I.click(buttonSelector);
// });
//
// Then ('I go back to the editing postcodes for source court {string}', async (destinationCourt: string)=> {
//   await I.click('#courts');
//   await I.click('#edit-' + destinationCourt);
//   await I.click('#tab_postcodes');
// });
//
// Then('I will make sure to delete the existing postcodes for the court {string}', async (courtName: string) => {
//   await I.click('#courts');
//
//   const elementExist = await I.checkElement('#edit-' + courtName);
//   expect(elementExist).equal(true);
//
//   await I.click('#edit-' + courtName);
//   await I.click('#tab_postcodes');
//
//   const selector = '#postcodes-select-all';
//   const selectorDelete = 'button[name="deletePostcodes"]';
//   const selectAllElementExist = await I.checkElement(selector);
//   if (selectAllElementExist) {
//     await I.click(selector);
//     await I.click(selectorDelete);
//   }
// });
