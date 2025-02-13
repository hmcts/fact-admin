// application-progression.spec.js
const { test, logWithColor } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { EditCourtPage } = require('../pages/edit-court-page');

test.describe('Application Progression', () => {
  test('Add and remove application types for Email', async ({ superAdminPage }, testInfo) => {
    const editCourtPage = new EditCourtPage(superAdminPage);

    logWithColor(testInfo, 'Starting test...');

    await superAdminPage.goto('/courts/probate-service-centre/edit');
    await superAdminPage.waitForLoadState('networkidle');
    logWithColor(testInfo, 'Navigated to page.');
    await editCourtPage.clickApplicationProgressionTab();
    logWithColor(testInfo, 'Clicked Application Progression tab.');
    await editCourtPage.removeAllApplicationTypesAndSave();
    logWithColor(testInfo, 'Removed all application types and saved.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');
    await editCourtPage.enterType('Get an update');
    logWithColor(testInfo, 'Entered \'Get an update\' in Type TextBox.');
    await editCourtPage.enterEmail('test@gmail.com');
    logWithColor(testInfo, 'Entered \'test@gmail.com\' in Email TextBox.');
    await editCourtPage.enterWelshType('welsh test');
    logWithColor(testInfo, 'Entered \'welsh test\' in Welsh Type TextBox.');
    await editCourtPage.clickAddNew();
    logWithColor(testInfo, 'Clicked \'Add new application progression\' button.');
    await editCourtPage.enterType('Get an update');
    logWithColor(testInfo, 'Entered \'Get an update\' in Type TextBox.');
    await editCourtPage.enterEmail('test2@gmail.com');
    logWithColor(testInfo, 'Entered \'test2@gmail.com\' in Email TextBox.');
    await editCourtPage.enterWelshType('welsh test2');
    logWithColor(testInfo, 'Entered \'welsh test2\' in Welsh Type TextBox.');
    await editCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked \'Save\' button.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    expect(await editCourtPage.getSecondLastEmail()).toBe('test@gmail.com');
    logWithColor(testInfo, 'Verified second last email.');
    expect(await editCourtPage.getLastEmail()).toBe('test2@gmail.com');
    logWithColor(testInfo, 'Verified last email.');
  });

  test('Add and remove application types for External link', async ({ superAdminPage }, testInfo) => {
    const editCourtPage = new EditCourtPage(superAdminPage);

    logWithColor(testInfo, 'Starting test for External Link...');

    await superAdminPage.goto('/courts/probate-service-centre/edit');
    await superAdminPage.waitForLoadState('networkidle');
    logWithColor(testInfo, 'Navigated to page.');
    await editCourtPage.clickApplicationProgressionTab();
    logWithColor(testInfo, 'Clicked Application Progression tab.');
    await editCourtPage.removeAllApplicationTypesAndSave();
    logWithColor(testInfo, 'Removed all application types and saved.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');

    await editCourtPage.enterType('Get an update');
    logWithColor(testInfo, 'Entered \'Get an update\' in Type TextBox.');
    await editCourtPage.enterExternalLink('www.testlink.com');
    logWithColor(testInfo, 'Entered \'www.testlink.com\' in External link TextBox.');
    await editCourtPage.enterExternalLinkDescription('test description');
    logWithColor(testInfo, 'Entered \'test description\' in External link description TextBox.');
    await editCourtPage.enterExternalLinkWelshDescription('welsh test');
    logWithColor(testInfo, 'Entered \'welsh test\' in External link welsh description TextBox.');
    await editCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked \'Save\' button.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');
  });

  test('Prevent blank entries being added', async ({ superAdminPage }, testInfo) => {
    const editCourtPage = new EditCourtPage(superAdminPage);

    logWithColor(testInfo, 'Starting test for preventing blank entries...');

    await superAdminPage.goto('/courts/probate-service-centre/edit');
    await superAdminPage.waitForLoadState('networkidle');
    logWithColor(testInfo, 'Navigated to page.');
    await editCourtPage.clickApplicationProgressionTab();
    logWithColor(testInfo, 'Clicked Application Progression tab.');
    await editCourtPage.removeAllApplicationTypesAndSave();
    logWithColor(testInfo, 'Removed all application types and saved.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');

    await editCourtPage.enterType('Get an update');
    logWithColor(testInfo, 'Entered \'Get an update\' in Type TextBox.');
    await editCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked \'Save\' button.');
    // Use waitForFunction to wait for the *first* error message
    await editCourtPage.page.waitForFunction(
      () => {
        const element = document.querySelector('.govuk-error-summary__list > li');
        return element && element.textContent.includes('Enter an email address or an external link');
      },
      { timeout: 10000 }
    );
    const errorText1 = await editCourtPage.getErrorSummaryMessage();
    expect(errorText1).toContain('Enter an email address or an external link');
    logWithColor(testInfo, 'Verified first error message.');

    await editCourtPage.enterExternalLink('www.testlink.com');
    logWithColor(testInfo, 'Entered \'www.testlink.com\' in External link TextBox.');
    await editCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked \'Save\' button.');

    // Use waitForFunction to wait for the *second* error message
    await editCourtPage.page.waitForFunction(
      () => {
        const element = document.querySelector('.govuk-error-summary__list > li');
        return element && element.textContent.includes('Description and link are required to add an external link');
      },
      { timeout: 10000 }
    );
    const errorText2 = await editCourtPage.getErrorSummaryMessage(); // Re-fetch the text.  Crucially, *after* the wait.
    expect(errorText2).toContain('Description and link are required to add an external link');
    logWithColor(testInfo, 'Verified second error message.');
  });
});
