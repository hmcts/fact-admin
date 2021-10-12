import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';

let start: Date;
let end: Date;

When('I click on audits link', async () => {
  const selector = '#audits';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

When('I click on courts link', async () => {
  const selector = '#courts';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I check action start time', async () => {
  start = new Date();
});

Then('I check action end time', async () => {
  end = new Date();
});

When('I select {string} from courts', async (court: string) => {
  const selector = '#searchLocation';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.selectItem(selector, court);
});

Then('I click search audit button', async () => {
  const selector = '#searchAuditsBtn';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);

  //it takes half a second for a javascript to load new audits
  await new Promise(f => setTimeout(f, 10000));
});

Then('I enter between and end date', async () => {
  const selectorDateFrom = '#searchDateFrom';
  const elementExistFrom = await I.checkElement(selectorDateFrom);
  expect(elementExistFrom).equal(true);

  const selectorDateTo = '#searchDateTo';
  const elementExistTO = await I.checkElement(selectorDateTo);
  expect(elementExistTO).equal(true);

  // two zeros are require to put the date correctly
  const startTime = start.getDate() + '/' + (start.getMonth() + 1) + '/00' + start.getFullYear() + 'T' + start.getHours() + ':' + start.getMinutes();

  console.log('\nstart time: ' + startTime);

  const endTime = end.getDate() + '/' + (end.getMonth() + 1) + '/00' + end.getFullYear() + 'T' + (end.getHours() + 1) + ':' + (end.getMinutes());

  console.log('\nEnd time: ' + endTime);

  await I.fillField(selectorDateFrom,startTime);
  await I.fillField(selectorDateTo,endTime);

  console.log('\ncourt selected: ' + await I.getElementText('#searchLocation'));
  console.log('\nstart time element: ' + await I.getElementText(selectorDateFrom));
  console.log('\nend time element: ' + await I.getElementText(selectorDateTo));

});

When('I can see the expected audits', async () => {
  const rows = (await I.getTextFromElements('#auditResults > tbody > tr > td:nth-child(5)')) as string[];
  const size = rows.length;
  console.log('.................size: ' + size);
  const lastActionCreatedTime = Date.parse(rows[size-1]);
  console.log('.................last row: ' + rows[size-1]);

  expect((lastActionCreatedTime > start.getTime()) && (lastActionCreatedTime < end.getTime())).equal(true);

  const selectorAction = '#auditResults > tbody > tr:nth-child(' + (size-1) + ') > td:nth-child(2)';
  expect(await I.checkElement(selectorAction)).equal(true);
  const actionName = await I.getElement(selectorAction);
  expect(await I.getElementText(actionName)).equal('Update court opening times');

  const selectorLocation = '#auditResults > tbody > tr:nth-child(' + (size-1) + ') > td:nth-child(3)';
  expect(await I.checkElement(selectorLocation)).equal(true);
  const locationName = await I.getElement(selectorLocation);
  expect(await I.getElementText(locationName)).equal('havant-justice-centre');
});
