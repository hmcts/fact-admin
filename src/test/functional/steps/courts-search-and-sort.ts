import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';

When('I enter {string} into search textbox', async (searchText: string) => {
  const selector = '#searchCourts';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.fillField(selector, searchText);
});

Then('All courts that include {string} should be displayed sorted by name', async (searchText: string) => {
  const selector = 'tr:not(.courtTableRowHidden) .govuk-table__cell.courtTableColumnName';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const courtHtmlElement: string[] = await I.getHtmlFromElements(selector);
  expect(courtHtmlElement.length > 0).equal(true);

  courtHtmlElement.forEach(courtName => expect(courtName.toLocaleLowerCase().includes(searchText)).equal(true));
  const courtHtmlElementToSort: string[] = await I.getHtmlFromElements(selector);

  const sortedCourtNames: string[] = courtHtmlElementToSort.sort();
  let isEqual = true;
  for (let i = 0; i < courtHtmlElement.length && isEqual; i++) {
    isEqual = courtHtmlElement[i] === sortedCourtNames[i];
  }
  expect(isEqual).equal(true);
});

When('I select Include closed courts', async () => {
  const selector = '#toggle-closed-courts-display';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  const elementChecked = await I.isElementChecked(selector);
  if (!elementChecked) {
    await I.click(selector);
  }
});

Then('All courts that include {string} should be displayed including closed clourts {string}', async (searchText: string, closedCourt: string) => {
  const courtHtmlElement: string[] = await I.getHtmlFromElements('tr:not(.courtTableRowHidden) .govuk-table__cell.courtTableColumnName');
  expect(courtHtmlElement.length > 0).equal(true);

  expect(courtHtmlElement.some(courtName => courtName.trim() === closedCourt.trim())).equal(true);
  courtHtmlElement.forEach(courtName => expect(courtName.toLocaleLowerCase().includes(searchText)).equal(true));
});

When('I click on name to sort in a descending order', async () => {
  const selector = '#tableCourtsName';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('Then All courts should be displayed sorted by name in a descending order', async () => {
  const selector = 'tr:not(.courtTableRowHidden) .govuk-table__cell.courtTableColumnName';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const courtHtmlElement: string[] = await I.getHtmlFromElements(selector);
  expect(courtHtmlElement.length > 0).equal(true);

  const courtHtmlElementToSort: string[] = await I.getHtmlFromElements(selector);
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

  const courtHtmlElement: string[] = await I.getHtmlFromElements(selectorCourts);
  const numberOfResults = courtHtmlElement.length;

  const elementExist = await I.checkElement(selectorNumOfResults);
  expect(elementExist).equal(true);
  const numOfResultsElement = await I.getElement(selectorNumOfResults);
  expect(await I.getElementText(numOfResultsElement)).equal(firstHalfMsg + numberOfResults + secondHalfMsg);
});

When('I click on last updated to sort ascending', async () => {
  const selector = '#tableCourtsUpdated';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('Then All courts should be displayed in a ascending order', async () => {
  const selector = 'tr:not(.courtTableRowHidden) .govuk-table__cell.courtTableColumnLastUpdated';
  const courtHtmlElement: Date[] = await I.getHtmlFromElements(selector);
  expect(courtHtmlElement.length > 0).equal(true);

  const courtHtmlElementToSort: Date[] = await I.getHtmlFromElements(selector);
  const sortedCourts = courtHtmlElementToSort.sort(function (a: Date, b: Date) {
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
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  //This click is to sort in ascending order
  await I.click(selector);
  //This click is to sort in descending order
  await I.click(selector);
});

Then('Then All courts should be displayed in a descending order', async () => {
  const selector = 'tr:not(.courtTableRowHidden) .govuk-table__cell.courtTableColumnLastUpdated';
  const courtHtmlElement: Date[] = await I.getHtmlFromElements(selector);
  expect(courtHtmlElement.length > 0).equal(true);

  const courtHtmlElementToSort: Date[] = await I.getHtmlFromElements(selector);
  const sortedCourts = courtHtmlElementToSort.sort(function (a: Date, b: Date) {
    return new Date(a).getTime() - new Date(b).getTime();
  });
  let isEqual = true;
  for (let i = 0; i < courtHtmlElement.length && isEqual; i++) {
    isEqual = courtHtmlElement[i] == sortedCourts[i];
  }
  expect(isEqual).equal(true);
});





