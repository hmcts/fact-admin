import {Given, Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';

async function populateField(fieldElement: string, value: string) {
  expect(await I.isElementVisible(fieldElement, 3000)).equal(false);
  expect(await I.checkElement(fieldElement)).equal(true);
  await I.setElementValueForInputField(fieldElement, value);
}

When('I click on add new court link', async () => {
  const selector = '#add-court-nav';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I am redirected to the add new court {string} page', async (addNewCourt: string) => {
  const selector = '#addNewCourtForm > h1';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const formTitle = await I.getElementText(await I.getElement(selector));
  expect(formTitle).equal(addNewCourt);
});

Given('I entered the new court name as {string} in the name text box', async (name: string) => {
  const selector = '#newCourtName';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  await populateField(selector, name);
});

Then('I entered the longitude {string}', async (longitude: string) => {
  const selector = '#lon';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  await populateField(selector, longitude);
});

Then('I entered the latitude {string}', async (latitude: string) => {
  const selector = '#lat';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  await populateField(selector, latitude);
});

Then('I select yes for the court be service centre', async () => {
  const selector = '#serviceCentre';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I click on add new court button', async () => {
  const selector = '#saveNewCourtBtn';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('The error message displays for a existing court name {string}', async (errMessage: string) => {
  let selector = '#error-summary-title';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const errorTitle = await I.checkElement(selector);
  expect(errorTitle).equal(true);

  selector = '#addNewCourtForm > div.govuk-error-summary > div > ul > li';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('The error message displays for invalid name {string}', async (errMessage: string) => {
  const selector = '#newCourtName-error';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal('Error:\n' + errMessage);
});

Then('The error message displays for not adding service area {string}', async (errMessage: string) => {
  const selector = '#addNewCourtForm > div.govuk-error-summary > div > ul > li';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const eleErrMessage = await I.getElement(selector);
  expect(await I.getElementText(eleErrMessage)).equal(errMessage);
});

Then('I select no for the court be service centre', async () => {
  const selector = '#serviceCentre-2';
  expect(await I.isElementVisible(selector, 3000)).equal(false);
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});
