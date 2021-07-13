import {Then, When} from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import {expect} from 'chai';

When('I click on lists link', async () => {

  const selector = '#lists';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I am redirected to the {string} page', async (editListTitle: string) => {
  const selector = '#main-content > h1';
  const pageTitleElement = await I.getElement(selector);
  expect(await I.getElementText(pageTitleElement)).equal(editListTitle);
});

When('I hover over the tab title', async () => {
  const selector = '#nav';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.hover(selector);
});

When('I click the local authorities list', async () => {
  const selector = '#tab_local-authorities';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});

Then('I should land in {string} page', async (editLocalAuthorityTitle: string) => {

  const selector = '#localAuthoritiesListContent > h2';
  const pageTitleElement = await I.getElement(selector);
  expect(await I.getElementText(pageTitleElement)).equal(editLocalAuthorityTitle);

});

When('I select local authority {string}', async (localAuthority: string) => {

  const selector = '#\\33 97243';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  const elementChecked = await I.isElementChecked(selector);
  if (!elementChecked) {
    await I.click(selector);
  }

});


