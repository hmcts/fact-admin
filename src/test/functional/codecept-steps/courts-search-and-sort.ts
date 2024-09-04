
import { I } from '../utlis/codecept-util';
import {expect} from 'chai';

When('I enter {string} into search textbox', async (searchText: string) => {
  const selector = '#searchCourts';
  I.seeElement(selector);
  await I.fillField(selector, searchText);
});

Then('All courts that include {string} should be displayed sorted by name', async (searchText: string) => {
  const selector = 'tr:not(.courtTableRowHidden) .govuk-table__cell.courtTableColumnName';
  const courtHtmlElement: string[] = await I.grabHTMLFromAll(selector);
  expect(courtHtmlElement.length > 0).equal(true);

  courtHtmlElement.forEach(courtName => expect(courtName.toLocaleLowerCase().includes(searchText)).equal(true));
  const courtHtmlElementToSort: string[] = await I.grabHTMLFromAll(selector);

  const sortedCourtNames: string[] = courtHtmlElementToSort.sort();
  let isEqual = true;
  for (let i = 0; i < courtHtmlElement.length && isEqual; i++) {
    isEqual = courtHtmlElement[i] === sortedCourtNames[i];
  }
  expect(isEqual).equal(true);
});


When('I select Include closed courts', async () => {
  const selector = '#toggle-closed-courts-display';
  I.seeElement(selector);
  I.checkOption(selector);

});

Then('All courts that include {string} should be displayed including closed clourts {string}', async (searchText: string, closedCourt: string) => {
  const courtHtmlElement: string[] = await I.grabHTMLFromAll('tr:not(.courtTableRowHidden) .govuk-table__cell.courtTableColumnName');
  expect(courtHtmlElement.length > 0).equal(true);

  expect(courtHtmlElement.some(courtName => courtName.trim() === closedCourt.trim())).equal(true);
  courtHtmlElement.forEach(courtName => expect(courtName.toLocaleLowerCase().includes(searchText)).equal(true));
});

When('I click on name to sort in a descending order', async () => {
  const selector = '#tableCourtsName';
  I.seeElement(selector);
  await I.click(selector);
});

Then('Then All courts should be displayed sorted by name in a descending order', async () => {
  const selector = 'tr:not(.courtTableRowHidden) .govuk-table__cell.courtTableColumnName';
  const courtHtmlElement: string[] = await I.grabHTMLFromAll(selector);
  expect(courtHtmlElement.length > 0).equal(true);

  const courtHtmlElementToSort: string[] = await I.grabHTMLFromAll(selector);
  const sortedCourtNames = courtHtmlElementToSort.sort().reverse();
  let isEqual = true;
  for (let i = 0; i < courtHtmlElement.length && isEqual; i++) {
    isEqual = courtHtmlElement[i] === sortedCourtNames[i];
  }
  expect(isEqual).equal(true);
});

Then('I should be able to see the message {string} correct number of {string}', async (firstHalfMsg: string, secondHalfMsg: string) => {
  const selectorCourts = 'tr:not(.courtTableRowHidden) .govuk-table__cell.courtTableColumnName';
  const selectorNumOfResults = '#numberOfCourts';

  const courtHtmlElement: string[] = await I.grabHTMLFromAll(selectorCourts);
  const numberOfResults = courtHtmlElement.length;

  I.seeElement(selectorNumOfResults);
  expect(await I.grabTextFrom(selectorNumOfResults)).equal(firstHalfMsg + numberOfResults + secondHalfMsg);
});

When('I click on last updated to sort ascending', async () => {
  const selector = '#tableCourtsUpdated';
  I.seeElement(selector);
  await I.click(selector);
});

Then('Then All courts should be displayed in a ascending order', async () => {

  const selector = 'tr:not(.courtTableRowHidden) .govuk-table__cell.courtTableColumnLastUpdated';
  const courtHtmlElement: string[] = await I.grabHTMLFromAll(selector);
  expect(courtHtmlElement.length > 0).equal(true);

  const courtHtmlElementToSort: string[] = await I.grabHTMLFromAll(selector);
  const sortedCourts = courtHtmlElementToSort.sort(function (a: string, b:string) {
    return new Date(b).getTime() - new Date(a).getTime();
  });
  let isEqual = true;
  for (let i = 0; i < courtHtmlElement.length && isEqual; i++) {
    isEqual = courtHtmlElement[i] == sortedCourts[i];

  }
  expect(isEqual).equal(true);
});

When('I click on last updated to sort descending', async () => {
  const selector = '#tableCourtsUpdated';
  await I.seeElement(selector);
  //This click is to sort in ascending order
  await I.click(selector);
  //This click is to sort in descending order
  await I.click(selector);
});

Then('Then All courts should be displayed in a descending order', async () => {
  const selector = 'tr:not(.courtTableRowHidden) .govuk-table__cell.courtTableColumnLastUpdated';
  const courtHtmlElement: string[] = await I.grabHTMLFromAll(selector);
  expect(courtHtmlElement.length > 0).equal(true);

  const courtHtmlElementToSort: string[] = await I.grabHTMLFromAll(selector);
  const sortedCourts = courtHtmlElementToSort .sort(function (a: string, b: string) {
    return new Date(a).getTime() - new Date(b).getTime();
  });
  let isEqual = true;
  for (let i = 0; i < courtHtmlElement.length && isEqual; i++) {
    isEqual = courtHtmlElement[i] == sortedCourts[i];
  }
  expect(isEqual).equal(true);
});