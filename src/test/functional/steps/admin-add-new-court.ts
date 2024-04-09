import {Given, Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';

async function populateField(fieldElement: string, value: string) {
  expect(await I.checkElement(fieldElement)).equal(true);
  await I.setElementValueForInputField(fieldElement, value);
}

When('I click on add new court link', async () => {
  const selector = '#add-court-nav';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I am redirected to the add new court {string} page', async (addNewCourt: string) => {
  const selector = '#addNewCourtForm > h1';
  const formTitle = await I.getElementText(await I.getElement(selector));
  expect(formTitle).equal(addNewCourt);
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
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I click on add new court button', async () => {
  const selector = '#saveNewCourtBtn';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('The error message displays for a existing court name {string}', async (errMessage: string) => {
  const errorTitle = await I.checkElement('.govuk-error-summary__title');
  expect(errorTitle).equal(true);

  const selector = '#addNewCourtForm > div.govuk-error-summary > div > div > ul > li:nth-child(1) > a';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('The error message displays for invalid name {string}', async (errMessage: string) => {
  expect(await I.checkElement('#newCourtName-error')).equal(true);
  const selector = '#addNewCourtForm > div.govuk-error-summary > div > div > ul > li:nth-child(1) > a';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('The error message displays for not adding service area {string}', async (errMessage: string) => {
  const selector = '#addNewCourtForm > div.govuk-error-summary > div > div > ul > li:nth-child(4) > a';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('the error message displays for latitude: {string}', async (errMessage: string) => {
  expect(await I.checkElement('#lat-error')).equal(true);
  const selector = '#addNewCourtForm > div.govuk-error-summary > div > div > ul > li:nth-child(3) > a';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('the error message displays for longitude: {string}', async (errMessage: string) => {
  expect(await I.checkElement('#lon-error')).equal(true);
  const selector = '#addNewCourtForm > div.govuk-error-summary > div > div > ul > li:nth-child(2) > a';
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('I select no for the court be service centre', async () => {
  const selector = '#serviceCentre-2';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

