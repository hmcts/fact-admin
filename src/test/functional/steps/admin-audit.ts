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

  // Date time on select picker is yyyy-mm-ddThh:mm
  const startTime = start.getFullYear() + '-' + (start.getMonth() + 1) + '-' + start.getDate() + 'T' + start.getHours() + ':' + start.getMinutes();
  const endTime = end.getFullYear() + '-' + (end.getMonth() + 1) + '-' + end.getDate() + 'T' + end.getHours() + ':' + (end.getMinutes() + 2);

  await I.setInputField(selectorDateFrom, startTime);
  await I.setInputField(selectorDateTo, endTime);
});

When('I can see the expected audits', async () => {
  const rows = (await I.getTextFromElements('#auditResults > tbody > tr > td:nth-child(5)')) as string[];
  const size = rows.length;
  const lastActionCreatedTime = Date.parse(rows[1]);
  expect((lastActionCreatedTime > start.getTime()) && (lastActionCreatedTime < end.getTime())).equal(true);

  const selectorAction = '#auditResults > tbody > tr:nth-child(' + (size-2) + ') > td:nth-child(2)';
  expect(await I.checkElement(selectorAction)).equal(true);
  const actionName = await I.getElement(selectorAction);
  expect(await I.getElementText(actionName)).equal('Update court opening times');

  const selectorLocation = '#auditResults > tbody > tr:nth-child(' + (size-1) + ') > td:nth-child(3)';
  expect(await I.checkElement(selectorLocation)).equal(true);
  const locationName = await I.getElement(selectorLocation);
  expect(await I.getElementText(locationName)).equal('havant-justice-centre');
});
