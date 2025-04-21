// tests/phone-numbers.spec.js
const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { PhoneNumbersPage } = require('../pages/phone-numbers-page');

test.describe.serial('Phone Numbers', () => {
  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/courts/stafford-combined-court-centre/edit');
    await expect(adminPage).toHaveURL(/.*\/courts\/stafford-combined-court-centre\/edit$/);
    const phoneNumbersPage = new PhoneNumbersPage(adminPage);
    await phoneNumbersPage.clickPhoneNumbersTab();
  });

  test.afterEach(async ({adminPage}) => {
    const phoneNumbersPage = new PhoneNumbersPage(adminPage);
    await phoneNumbersPage.removeAllPhoneNumbersAndSave();
  });

  test('Add and verify phone numbers', async ({ adminPage }) => {
    const phoneNumbersPage = new PhoneNumbersPage(adminPage);

    // Cleanup moved *inside* the test
    await phoneNumbersPage.removeAllPhoneNumbersAndSave();

    await phoneNumbersPage.addPhoneNumberToFirstFieldset(5, '0123 456 7890', 'Fine', 'Dirwy');
    await phoneNumbersPage.addPhoneNumber(9, '0987 654 321', 'Chancery', 'Siawnsri');
    await phoneNumbersPage.clickSave();
    await phoneNumbersPage.page.waitForSelector('.govuk-panel--confirmation .govuk-panel__title:has-text("Phone Numbers updated")'); // More robust wait
    expect(await phoneNumbersPage.getUpdateMessage()).toContain('Phone Numbers updated');

    const phoneNumbers = await phoneNumbersPage.getPhoneNumbers();
    expect(phoneNumbers.length).toBe(2);
    expect(phoneNumbers[0]).toEqual({ type: 'Applications', number: '0123 456 7890', explanation: 'Fine', explanationCy: 'Dirwy' });
    expect(phoneNumbers[1]).toEqual({ type: 'Chancery', number: '0987 654 321', explanation: 'Chancery', explanationCy: 'Siawnsri' });
  });

  test('Reorder phone numbers', async ({ adminPage }) => {
    const phoneNumbersPage = new PhoneNumbersPage(adminPage);

    // Cleanup moved *inside* the test
    await phoneNumbersPage.removeAllPhoneNumbersAndSave();

    await phoneNumbersPage.addPhoneNumberToFirstFieldset(2, '0333 222 1111', 'ReorderTest1', 'ReorderTest1Cy');
    await phoneNumbersPage.addPhoneNumber(3, '0666 555 4444', 'ReorderTest2', 'ReorderTest2Cy');
    await phoneNumbersPage.clickSave();
    await phoneNumbersPage.page.waitForSelector('.govuk-panel--confirmation .govuk-panel__title:has-text("Phone Numbers updated")'); // More robust wait

    let phoneNumbers = await phoneNumbersPage.getPhoneNumbers();
    expect(phoneNumbers[0].type).toBe('Admin');
    expect(phoneNumbers[1].type).toBe('Applications');

    await phoneNumbersPage.movePhoneNumberUp(1);
    await phoneNumbersPage.clickSave();
    await phoneNumbersPage.page.waitForSelector('.govuk-panel--confirmation .govuk-panel__title:has-text("Phone Numbers updated")'); // More robust wait
    phoneNumbers = await phoneNumbersPage.getPhoneNumbers();
    expect(phoneNumbers[0].type).toBe('Applications');
    expect(phoneNumbers[1].type).toBe('Admin');

    await phoneNumbersPage.movePhoneNumberDown(0);
    await phoneNumbersPage.clickSave();
    await phoneNumbersPage.page.waitForSelector('.govuk-panel--confirmation .govuk-panel__title:has-text("Phone Numbers updated")'); // More robust wait
    phoneNumbers = await phoneNumbersPage.getPhoneNumbers();
    expect(phoneNumbers[0].type).toBe('Admin');
    expect(phoneNumbers[1].type).toBe('Applications');
  });

  test('Prevent blank entries', async ({ adminPage }) => {
    console.log('Starting Prevent blank entries test...');

    const phoneNumbersPage = new PhoneNumbersPage(adminPage);
    await phoneNumbersPage.removeAllPhoneNumbersAndSave();

    // Add a number with no description
    console.log('Adding a number with no description...');
    await phoneNumbersPage.addPhoneNumberToFirstFieldset(-1, '0987 666 5040', 'Explanation', 'ExplanationCy');
    await phoneNumbersPage.clickSave();
    new Promise(r => setTimeout(r, 500));
    console.log('Getting error summary messages...');
    // Wait for the error summary to appear (adjust timeout if needed)
    await phoneNumbersPage.checkTopLevelErrors('Description is required for phone number');
    let expectedErrors = [
      'Description is required for phone number 1.'
    ];
    await phoneNumbersPage.checkFieldLevelErrors(expectedErrors);
    // Add entry with a description, but no number
    console.log('Adding entry with a description, but no number...');
    await phoneNumbersPage.addPhoneNumber(4, '', 'Explanation', 'ExplanationCy');
    await phoneNumbersPage.clickSave();

    console.log('Getting error summary messages...');
    await phoneNumbersPage.checkTopLevelErrors('Number is required for phone number');

    console.log('Getting field-level error message...');
    expectedErrors = [
      'Description is required for phone number 1.',
      'Number is required for phone number 2.'
    ];
    await phoneNumbersPage.checkFieldLevelErrors(expectedErrors);
  });
});
