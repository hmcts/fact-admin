import { I } from '../utlis/codecept-util';
import {expect} from 'chai';

async function populateField(fieldElement: string, value: string) {
  I.seeElement(fieldElement);
  await I.fillField(fieldElement, value);
}

When('I click on add new court link', async () => {
  const selector = '#add-court-nav';
  I.seeElement(selector);
  await I.click(selector);
});

Then('I am redirected to the add new court {string} page', async (addNewCourt: string) => {
  const selector = '#addNewCourtForm > h1';
  const formTitle = await I.grabTextFrom(selector);
  expect(formTitle.trim()).equal(addNewCourt);
});

Given('I entered the new court name as {string} in the name text box', async (name: string) => {
  const selector = '#newCourtName';
  await populateField(selector, name);
});

Then('I entered the longitude {string}', async (longitude: string) => {
  const selector = '#lon';
  await populateField(selector, longitude);
});

Then('I entered the latitude {string}', async (latitude: string) => {
  const selector = '#lat';
  await populateField(selector, latitude);
});

Then('I select yes for the court be service centre', async () => {
  const selector = '#serviceCentre';
  I.seeElement(selector);
  await I.click(selector);
});

Then('I click on add new court button', async () => {
  const selector = '#saveNewCourtBtn';
  I.seeElement(selector);
  await I.click(selector);
});

Then('The error message displays for a existing court name {string}', async (errMessage: string) => {
  I.seeElement('.govuk-error-summary__title');
  const selector = '#addNewCourtForm > div.govuk-error-summary > div > div >  ul > li';
  expect((await I.grabTextFrom(selector)).trim()).equal(errMessage);
});

Then('The error message displays for invalid name {string}', async (errMessage: string) => {
  const selector = '#newCourtName-error';
  expect((await I.grabTextFrom(selector)).trim()).contains(errMessage);
});

Then('The error message displays for not adding service area {string}', async (errMessage: string) => {
  const selector = '#addNewCourtForm > div.govuk-error-summary > div > div > ul > li';
  expect((await I.grabTextFrom(selector)).trim()).equal(errMessage);
});

Then('I select no for the court be service centre', async () => {
  const selector = '#serviceCentre-2';
  I.seeElement(selector);
  await I.click(selector);
});
