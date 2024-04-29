// import {Then, When} from 'cucumber';
import {I} from '../utlis/codecept-util';
import {FunctionalTestHelpers} from '../utlis/helpers';
// import {expect} from 'chai';
// import {FunctionalTestHelpers} from '../utlis/helpers';
//
When('I click the cases heard tab', async () => {
  const selector = '#tab_cases-heard';
  await I.moveCursorTo(selector);
  await I.click(selector);
  await I.moveCursorTo('#court-name'); //move away from the tab list
});

When('I will make sure Adoption is selected', async () => {
  const selector = '#adoption';
  const checked = await I.grabAttributeFrom(selector, 'aria-checked');
  if(checked == 'false') {
    await I.checkOption(selector);
  }
});

Then('I click on update on cases heard', async () => {
  await FunctionalTestHelpers.clickButton('#casesHeardTab', 'updateCasesHeard');
});
//
// When('I select areas of law {string} and {string}', async (areaOfLaw1: number, areaOfLaw2: number) => {
//   const selector1 = '#' + areaOfLaw1;
//   const selector2 = '#' + areaOfLaw2;
//   const element1Exist = await I.checkElement(selector1);
//   expect(element1Exist).equal(true);
//   const element1Checked = await I.isElementChecked(selector1);
//   if (!element1Checked) {
//     await I.click(selector1);
//   }
//   const element2Exist = await I.checkElement(selector2);
//   expect(element2Exist).equal(true);
//   const element2Checked = await I.isElementChecked(selector2);
//   if (!element2Checked) {
//     await I.click(selector2);
//   }
// });
//
// When('And I click on update cases heard', async () => {
//   await FunctionalTestHelpers.clickButton('#casesHeardTab', 'updateCasesHeard');
// });
//
// Then('Success message is displayed for cases heard with summary {string}', async (successMsg: string) => {
//   const selector = '#casesHeardContent > div.govuk-panel.govuk-panel--confirmation > h1';
//   const successTitleElement = await I.getElement(selector);
//   expect(await I.getElementText(successTitleElement)).equal(successMsg);
// });
//
// When('I reload the page', async () => {
//   await I.reloadPage();
// });
//
// Then('areas of law {string} and {string} should be selected', async (areaOfLaw1: number, areaOfLaw2: number) => {
//   const selector1 = '#' + areaOfLaw1;
//   const selector2 = '#' + areaOfLaw2;
//   const element1Exist = await I.checkElement(selector1);
//   expect(element1Exist).equal(true);
//   const element1Checked = await I.isElementChecked(selector1);
//   expect(element1Checked).equal(true);
//   const element2Exist = await I.checkElement(selector2);
//   expect(element2Exist).equal(true);
//   const element2Checked = await I.isElementChecked(selector2);
//   expect(element2Checked).equal(true);
// });
//
// When('I unselect area of law {string} and {string}', async (areaOfLaw1: number, areaOfLaw2: number) => {
//   const selector1 = '#' + areaOfLaw1;
//   const selector2 = '#' + areaOfLaw2;
//   const element1Exist = await I.checkElement(selector1);
//   expect(element1Exist).equal(true);
//   const element1Checked = await I.isElementChecked(selector1);
//   if (element1Checked) {
//     await I.click(selector1);
//   }
//   const element2Exist = await I.checkElement(selector2);
//   expect(element2Exist).equal(true);
//   const element2Checked = await I.isElementChecked(selector2);
//   if (element2Checked) {
//     await I.click(selector2);
//   }
// });
//
// Then('areas of law {string} and {string} should be unselected', async (areaOfLaw1: number, areaOfLaw2: number) => {
//   const selector1 = '#' + areaOfLaw1;
//   const selector2 = '#' + areaOfLaw2;
//   const element1Exist = await I.checkElement(selector1);
//   expect(element1Exist).equal(true);
//   const element1Checked = await I.isElementChecked(selector1);
//   expect(element1Checked).equal(false);
//   const element2Exist = await I.checkElement(selector2);
//   expect(element2Exist).equal(true);
//   const element2Checked = await I.isElementChecked(selector2);
//   expect(element2Checked).equal(false);
// });
//
//

