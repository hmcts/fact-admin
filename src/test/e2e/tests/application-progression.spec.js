// application-progression.spec.js
const { test, logWithColor } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { EditCourtPage } = require('../pages/edit-court-page');

test.describe('Application Progression', () => {
  // Use beforeEach to ensure a clean state before EACH test.
  test.beforeEach(async ({ superAdminPage }, testInfo) => {
    await superAdminPage.goto('/courts/probate-service-centre/edit');
    await superAdminPage.waitForLoadState('networkidle');
    logWithColor(testInfo, 'Navigated to page.');
    const editCourtPage = new EditCourtPage(superAdminPage);
    await editCourtPage.clickApplicationProgressionTab();
    logWithColor(testInfo, 'Clicked Application Progression tab.');
    await editCourtPage.removeAllApplicationTypesAndSave();
    logWithColor(testInfo, 'Removed all application types and saved.');
    // No need to check the update message here; it's checked in removeAllApplicationTypesAndSave
  });

  test('Add and remove application types for Email', async ({ superAdminPage }, testInfo) => {
    const editCourtPage = new EditCourtPage(superAdminPage);
    const uniqueSuffix = `${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}`;

    logWithColor(testInfo, 'Starting test...');

    // Add two entries.
    await editCourtPage.enterType('Get an update');
    await editCourtPage.enterEmail(`test-${uniqueSuffix}@gmail.com`);
    await editCourtPage.enterWelshType('welsh test');
    await editCourtPage.clickAddNew();
    await editCourtPage.enterType('Get an update');
    await editCourtPage.enterEmail(`test2-${uniqueSuffix}@gmail.com`);
    await editCourtPage.enterWelshType('welsh test2');
    await editCourtPage.clickSave();
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');
  });

  test('Add and remove application types for External link', async ({ superAdminPage }, testInfo) => {
    const editCourtPage = new EditCourtPage(superAdminPage);
    const uniqueSuffix = `${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}`;

    logWithColor(testInfo, 'Starting test for External Link...');

    // Add a single entry.
    await editCourtPage.enterType('Get an update');
    await editCourtPage.enterExternalLink(`www.testlink${uniqueSuffix}.com`);
    await editCourtPage.enterExternalLinkDescription('test description');
    await editCourtPage.enterExternalLinkWelshDescription('welsh test');
    await editCourtPage.clickSave();
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');
  });

  test('Prevent blank entries being added', async ({ superAdminPage }, testInfo) => {
    const editCourtPage = new EditCourtPage(superAdminPage);

    logWithColor(testInfo, 'Starting test for preventing blank entries...');

    await editCourtPage.enterType('Get an update');
    await editCourtPage.clickSave();

    await editCourtPage.page.waitForFunction(
      () => {
        const element = document.querySelector('.govuk-error-summary__list li');
        return element && element.textContent.includes('Enter an email address or an external link');
      },
      { timeout: 10000 }
    );
    const errorText1 = await editCourtPage.getErrorSummaryMessage();
    expect(errorText1).toContain('Enter an email address or an external link');

    await editCourtPage.enterExternalLink('www.testlink.com');
    await editCourtPage.clickSave();

    await editCourtPage.page.waitForFunction(
      () => {
        const element = document.querySelector('.govuk-error-summary__list li');
        return element && element.textContent.includes('Description and link are required to add an external link');
      },
      { timeout: 10000 }
    );
    const errorText2 = await editCourtPage.getErrorSummaryMessage();
    expect(errorText2).toContain('Description and link are required to add an external link');
  });

  test('Prevent duplicated entries being added', async ({ superAdminPage }, testInfo) => {
    const editCourtPage = new EditCourtPage(superAdminPage);
    const uniqueSuffix = `${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}`;

    logWithColor(testInfo, 'Starting test for preventing duplicate entries...');

    // Add the FIRST entry
    await editCourtPage.enterType('Get an update');
    await editCourtPage.enterEmail(`test-${uniqueSuffix}@gmail.com`);
    await editCourtPage.clickSave();
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');

    // Add the DUPLICATE entry
    await editCourtPage.clickAddNew();
    await editCourtPage.enterType('Get an update');
    await editCourtPage.enterEmail(`test-${uniqueSuffix}@gmail.com`); // Duplicate
    await editCourtPage.clickSave();

    // Wait for the error message.
    await editCourtPage.page.waitForFunction(
      () => {
        const element = document.querySelector('.govuk-error-summary__list li');
        return element && element.textContent.includes('All email addresses must be unique');
      },
      { timeout: 15000 }
    );
    const errorText = await editCourtPage.getErrorSummaryMessage();
    expect(errorText).toContain('All email addresses must be unique');
  });
});
