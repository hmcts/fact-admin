import { I } from '../utlis/codecept-util';
import {expect} from 'chai';


let start: Date;
let end: Date;

When('I click on audits link', async () => {
  const selector = '#audits';
  I.seeElement(selector);
  await I.click(selector);
});

When('I click on courts link', async () => {
  const selector = '#courts';
  I.seeElement(selector);
  await I.click(selector);
});

Then('I check action start time', async () => {
  start = new Date();
});

Then('I check action end time', async () => {
  end = new Date();
});

Then('I click search audit button', async () => {
  const selector = '#searchAuditsBtn';
  I.seeElement(selector);
  await I.click(selector);
  //it takes half a second for a javascript to load new audits
  await new Promise(f => setTimeout(f, 10000));
});

Then('I enter between and end date', async () => {
  const selectorDateFrom = '#searchDateFrom';
  I.seeElement(selectorDateFrom);
  const selectorDateTo = '#searchDateTo';
  I.seeElement(selectorDateTo);

  const startTime = start.getDate() + '-' + (start.getMonth() + 1) + '-' + '00' + (start.getFullYear()) + 'T' + start.getHours() + ':' + start.getMinutes();
  const endTime = end.getDate() + '-' + (end.getMonth() + 1) + '-' + '00' + (end.getFullYear()) + 'T' + end.getHours() + ':' + (end.getMinutes() + 2);

  I.fillField(selectorDateFrom, startTime);
  I.fillField(selectorDateTo, endTime);
});

When('I can see the expected audits', async () => {
  const { court } = inject() as any;
  const rows = (await I.grabTextFromAll('#auditResults > tbody > tr > td:nth-child(5)')) as string[];
  const size = rows.length;
  const lastActionCreatedTime = Date.parse(rows[1]);
  expect((lastActionCreatedTime > start.getTime()) && (lastActionCreatedTime < end.getTime())).equal(true);
  const selectorLocation = '#auditResults > tbody > tr:nth-child(' + (size-1) + ') > td:nth-child(3)';
  I.seeElement(selectorLocation);
  //const locationName = await I.grabTextFrom(selectorLocation);
  expect(await I.grabTextFrom(selectorLocation)).equal(court.slug);
});

