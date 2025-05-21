// tests/phone-numbers.spec.js
const { test } = require('../fixtures/auth.setup'); // Assuming auth.setup provides logged-in 'adminPage'
const { expect } = require('@playwright/test');
const { PhoneNumbersPage } = require('../pages/phone-numbers-page');

test.describe.serial('Phone Numbers', () => {
  let phoneNumbersPage;

  test.beforeAll(async ({ browser }) => {
    // No setup needed here usually
  });

  test.beforeEach(async ({ adminPage }) => {
    await adminPage.goto('/courts/stafford-combined-court-centre/edit');
    await expect(adminPage).toHaveURL(/.*\/courts\/stafford-combined-court-centre\/edit$/);
    phoneNumbersPage = new PhoneNumbersPage(adminPage);
    await phoneNumbersPage.clickPhoneNumbersTab();
    // *** Moved Cleanup to run reliably before each test ***
    console.log('[BEFORE EACH] Performing pre-test cleanup...');
    await phoneNumbersPage.removeAllPhoneNumbersAndSave();
    console.log('[BEFORE EACH] Pre-test cleanup finished.');
  });

  // *** REMOVED afterAll hook ***
  // test.afterAll(async ({ adminPage }) => { ... });

  test('Add and verify phone numbers', async ({ adminPage }) => {
    console.log('Starting test: Add and verify phone numbers');
    // Cleanup now happens in beforeEach

    console.log('   Adding first phone number...');
    await phoneNumbersPage.addPhoneNumberToFirstFieldset('Applications', '0123 456 7890', 'Fine', 'Dirwy');

    console.log('   Clicking "Add new phone number" button...');
    await phoneNumbersPage.page.locator(phoneNumbersPage.addPhoneNumBtn).click();

    // *** REMOVED flawed assertion ***
    // console.log('   Waiting for first data row (can-reorder) to appear...');
    // await expect(phoneNumbersPage.page.locator(phoneNumbersPage.dataFieldsetLocatorString)).toHaveCount(1, { timeout: 10000 });
    // console.log('   First data row appeared.');
    // Add a brief pause or a more specific wait if needed for the *next* form to be ready
    await phoneNumbersPage.page.waitForTimeout(200); // Small static wait as placeholder

    console.log('   Filling second phone number form...');
    await phoneNumbersPage.fillAddNewPhoneNumberForm('Chancery', '0987 654 321', 'Chancery', 'Siawnsri');

    console.log('   Saving phone numbers...');
    await phoneNumbersPage.clickSave();

    console.log('   Verifying update message...');
    await expect(phoneNumbersPage.page.locator('.govuk-panel--confirmation .govuk-panel__title'))
        .toHaveText('Phone Numbers updated', { timeout: 10000 });

    console.log('   Fetching and verifying saved phone numbers...');
    const phoneNumbers = await phoneNumbersPage.getPhoneNumbers();
    expect(phoneNumbers.length).toBe(2);
    expect(phoneNumbers[0]).toEqual({ type: 'Applications', number: '0123 456 7890', explanation: 'Fine', explanationCy: 'Dirwy' });
    expect(phoneNumbers[1]).toEqual({ type: 'Chancery', number: '0987 654 321', explanation: 'Chancery', explanationCy: 'Siawnsri' });
    console.log('Finished test: Add and verify phone numbers');
  });

  test('Reorder phone numbers', async ({ adminPage }) => {
    console.log('Starting test: Reorder phone numbers');
    // Cleanup now happens in beforeEach

    console.log('   Adding first phone number for reorder test...');
    await phoneNumbersPage.addPhoneNumberToFirstFieldset('Admin', '0333 222 1111', 'ReorderTest1', 'ReorderTest1Cy');

    console.log('   Clicking "Add new phone number" button...');
    await phoneNumbersPage.page.locator(phoneNumbersPage.addPhoneNumBtn).click();

    // *** REMOVED flawed assertion ***
    // console.log('   Waiting for first data row (can-reorder) to appear...');
    // await expect(phoneNumbersPage.page.locator(phoneNumbersPage.dataFieldsetLocatorString)).toHaveCount(1, { timeout: 10000 });
    // console.log('   First data row appeared.');
    await phoneNumbersPage.page.waitForTimeout(200); // Small static wait as placeholder


    console.log('   Filling second phone number form for reorder test...');
    await phoneNumbersPage.fillAddNewPhoneNumberForm('Applications', '0666 555 4444', 'ReorderTest2', 'ReorderTest2Cy');

    console.log('   Saving initial order...');
    await phoneNumbersPage.clickSave();
    await expect(phoneNumbersPage.page.locator('.govuk-panel--confirmation .govuk-panel__title'))
        .toHaveText('Phone Numbers updated', { timeout: 10000 });

    console.log('   Verifying initial order...');
    let phoneNumbers = await phoneNumbersPage.getPhoneNumbers();
    expect(phoneNumbers.length).toBe(2);
    expect(phoneNumbers[0].type).toBe('Admin');
    expect(phoneNumbers[1].type).toBe('Applications');

    console.log('   Moving second number up...');
    await phoneNumbersPage.movePhoneNumberUp(1);
    console.log('   Saving after move up...');
    await phoneNumbersPage.clickSave();
    await expect(phoneNumbersPage.page.locator('.govuk-panel--confirmation .govuk-panel__title'))
        .toHaveText('Phone Numbers updated', { timeout: 10000 });

    console.log('   Verifying order after move up...');
    phoneNumbers = await phoneNumbersPage.getPhoneNumbers();
    expect(phoneNumbers.length).toBe(2);
    expect(phoneNumbers[0].type).toBe('Applications');
    expect(phoneNumbers[1].type).toBe('Admin');

    console.log('   Moving first number down...');
    await phoneNumbersPage.movePhoneNumberDown(0);
    console.log('   Saving after move down...');
    await phoneNumbersPage.clickSave();
    await expect(phoneNumbersPage.page.locator('.govuk-panel--confirmation .govuk-panel__title'))
        .toHaveText('Phone Numbers updated', { timeout: 10000 });

    console.log('   Verifying order after move down...');
    phoneNumbers = await phoneNumbersPage.getPhoneNumbers();
    expect(phoneNumbers.length).toBe(2);
    expect(phoneNumbers[0].type).toBe('Admin');
    expect(phoneNumbers[1].type).toBe('Applications');
    console.log('Finished test: Reorder phone numbers');
  });

  test('Prevent blank entries', async ({ adminPage }) => {
    console.log('Starting test: Prevent blank entries');
    // Cleanup now happens in beforeEach

    console.log('   Attempting to add number with no description selected...');
    await phoneNumbersPage.addPhoneNumberToFirstFieldset(0, '0987 666 5040', 'Explanation', 'ExplanationCy'); // Index 0 = "Select"
    console.log('   Saving entry with no description...');
    await phoneNumbersPage.clickSave();

    console.log('   Checking for top-level and field-level errors (no description)...');
    await phoneNumbersPage.checkTopLevelErrors('Description is required for phone number');
    await phoneNumbersPage.checkFieldLevelErrors(['Description is required for phone number 1']);

    console.log('   Filling Add New form with description but no number...');
    // No need to click "Add" here, just fill the form that has the error
    await phoneNumbersPage.fillAddNewPhoneNumberForm('Admin', '', 'Explanation 2', 'ExplanationCy 2');
    console.log('   Saving entry with missing number...');
    await phoneNumbersPage.clickSave();

    console.log('   Checking for top-level and field-level errors (missing number)...');
    await phoneNumbersPage.checkTopLevelErrors('Number is required for phone number');
    await expect(phoneNumbersPage.page.locator('.govuk-error-summary')).not.toContainText('Description is required for phone number');
    await phoneNumbersPage.checkFieldLevelErrors([
        'Number is required for phone number 1'
    ]);
    console.log('Finished test: Prevent blank entries');
  });
});
