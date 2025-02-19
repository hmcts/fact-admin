// tests/application-progression.spec.js
const { test, logWithColor } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { EditCourtPage } = require('../pages/edit-court-page');

// Force tests within this file to run serially. optional response to flakiness!
// test.describe.configure({ mode: 'serial' });

test.describe('Application Progression', () => {

  test('Add and remove application types for Email', async ({ superAdminPage }, testInfo) => {
    const editCourtPage = new EditCourtPage(superAdminPage);
    const uniqueSuffix = `${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}`;

    logWithColor(testInfo, 'Starting test...');
    // Navigate *within* the test, *after* the fixture has run.
    await superAdminPage.goto('/courts/probate-service-centre/edit', { waitUntil: 'domcontentloaded' });
    logWithColor(testInfo, 'Navigated to page.');
    // Add these lines for debugging:
    console.log('Current URL:', superAdminPage.url());
    await expect(superAdminPage).toHaveURL(/.*\/courts\/probate-service-centre\/edit$/);
    const title = await superAdminPage.title();
    console.log('Page Title:', title);
    await editCourtPage.clickApplicationProgressionTab();
    logWithColor(testInfo, 'Clicked Application Progression tab.');
    await editCourtPage.removeAllApplicationTypesAndSave();
    logWithColor(testInfo, 'Removed all application types and saved.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');

    // Add two entries, using unique data.
    await editCourtPage.enterType(`Get an update-${uniqueSuffix}`);
    logWithColor(testInfo, 'Entered Type in Type TextBox.');
    await editCourtPage.enterEmail(`test-${uniqueSuffix}@gmail.com`);
    logWithColor(testInfo, 'Entered Email in Email TextBox.');
    await editCourtPage.enterWelshType(`welsh test-${uniqueSuffix}`);
    logWithColor(testInfo, 'Entered Welsh Type in Welsh Type TextBox.');
    await editCourtPage.clickAddNew();
    logWithColor(testInfo, 'Clicked \'Add new application progression\' button.');
    await editCourtPage.enterType(`Get an update-2-${uniqueSuffix}`);
    logWithColor(testInfo, 'Entered Type in Type TextBox.');
    await editCourtPage.enterEmail(`test2-${uniqueSuffix}@gmail.com`);
    logWithColor(testInfo, 'Entered Email in Email TextBox.');
    await editCourtPage.enterWelshType(`welsh test2-${uniqueSuffix}`);
    logWithColor(testInfo, 'Entered Welsh Type in Welsh Type TextBox.');
    await editCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked \'Save\' button.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');
  });

  test('Add and remove application types for External link', async ({ superAdminPage }, testInfo) => {
    const editCourtPage = new EditCourtPage(superAdminPage);
    const uniqueSuffix = `${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}`;

    logWithColor(testInfo, 'Starting test for External Link...');
    // Navigate *within* the test, *after* the fixture has run.
    await superAdminPage.goto('/courts/probate-service-centre/edit', { waitUntil: 'domcontentloaded' });
    logWithColor(testInfo, 'Navigated to page.');

    // Add these lines for debugging:
    console.log('Current URL:', superAdminPage.url());
    await expect(superAdminPage).toHaveURL(/.*\/courts\/probate-service-centre\/edit$/);
    const title = await superAdminPage.title();
    console.log('Page Title:', title);
    await editCourtPage.clickApplicationProgressionTab();
    logWithColor(testInfo, 'Clicked Application Progression tab.');
    await editCourtPage.removeAllApplicationTypesAndSave();
    logWithColor(testInfo, 'Removed all application types and saved.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');

    // Add a single entry, using unique data.
    await editCourtPage.enterType(`Get an update-${uniqueSuffix}`);
    logWithColor(testInfo, 'Entered Type in Type TextBox.');
    await editCourtPage.enterExternalLink(`www.testlink${uniqueSuffix}.com`);
    logWithColor(testInfo, 'Entered External link in External link TextBox.');
    await editCourtPage.enterExternalLinkDescription(`test description-${uniqueSuffix}`);
    logWithColor(testInfo, 'Entered External link description in External link description TextBox.');
    await editCourtPage.enterExternalLinkWelshDescription(`welsh test-${uniqueSuffix}`);
    logWithColor(testInfo, 'Entered External link welsh description in External link welsh description TextBox.');
    await editCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked \'Save\' button.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');
  });

  test('Prevent blank entries being added', async ({ superAdminPage }, testInfo) => {
    const editCourtPage = new EditCourtPage(superAdminPage);
    const uniqueSuffix = `${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}`;


    logWithColor(testInfo, 'Starting test for preventing blank entries...');
    // Navigate *within* the test, *after* the fixture has run.
    await superAdminPage.goto('/courts/probate-service-centre/edit', { waitUntil: 'domcontentloaded' });
    logWithColor(testInfo, 'Navigated to page.');
    // Add these lines for debugging:
    console.log('Current URL:', superAdminPage.url());
    await expect(superAdminPage).toHaveURL(/.*\/courts\/probate-service-centre\/edit$/);
    const title = await superAdminPage.title();
    console.log('Page Title:', title);
    await editCourtPage.clickApplicationProgressionTab();
    logWithColor(testInfo, 'Clicked Application Progression tab.');
    await editCourtPage.removeAllApplicationTypesAndSave();
    logWithColor(testInfo, 'Removed all application types and saved.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');

    await editCourtPage.enterType(`Get an update-${uniqueSuffix}`);
    logWithColor(testInfo, 'Entered Type in Type TextBox.');
    await editCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked \'Save\' button.');

    // Wait for the error message *here*, not in clickSave().
    await editCourtPage.page.waitForFunction(
      () => {
        const element = document.querySelector('.govuk-error-summary__list li');
        return element && element.textContent.includes('Enter an email address or an external link');
      },
      { timeout: 10000 }
    );
    const errorText1 = await editCourtPage.getErrorSummaryMessage();
    expect(errorText1).toContain('Enter an email address or an external link');
    logWithColor(testInfo, 'Verified first error message.');

    await editCourtPage.enterExternalLink(`www.testlink${uniqueSuffix}.com`);
    logWithColor(testInfo, 'Entered External link in External link TextBox.');
    await editCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked \'Save\' button.');

    // Wait for the *second* error message.
    await editCourtPage.page.waitForFunction(
      () => {
        const element = document.querySelector('.govuk-error-summary__list li');
        return element && element.textContent.includes('Description and link are required to add an external link');
      },
      { timeout: 10000 }
    );
    const errorText2 = await editCourtPage.getErrorSummaryMessage();
    expect(errorText2).toContain('Description and link are required to add an external link');
    logWithColor(testInfo, 'Verified second error message.');
  });

  test('Prevent duplicated entries being added', async ({ superAdminPage }, testInfo) => {
    const editCourtPage = new EditCourtPage(superAdminPage);
    const uniqueSuffix = `${testInfo.title.replace(/\s+/g, '-')}-${Date.now()}`;
    const uniqueEmail = `test-${uniqueSuffix}@gmail.com`; // Define the unique email *once*.

    logWithColor(testInfo, 'Starting test for preventing duplicate entries...');
    // Navigate *within* the test, *after* the fixture has run.
    await superAdminPage.goto('/courts/probate-service-centre/edit', { waitUntil: 'domcontentloaded' });    logWithColor(testInfo, 'Navigated to page.');
    console.log('Current URL:', superAdminPage.url());
    await expect(superAdminPage).toHaveURL(/.*\/courts\/probate-service-centre\/edit$/);
    const title = await superAdminPage.title();
    console.log('Page Title:', title);
    await editCourtPage.clickApplicationProgressionTab();
    logWithColor(testInfo, 'Clicked Application Progression tab.');
    await editCourtPage.removeAllApplicationTypesAndSave();
    logWithColor(testInfo, 'Removed all application types and saved.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, 'Verified update message.');

    // Add the FIRST entry
    await editCourtPage.enterType(`Get an update-${uniqueSuffix}`);
    logWithColor(testInfo, 'Entered Type in Type TextBox.');
    await editCourtPage.enterEmail(uniqueEmail); // Use the unique email.
    logWithColor(testInfo, 'Entered Email in Email TextBox.');
    await editCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked \'Save\' button.');
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');  // Wait for success
    logWithColor(testInfo, 'Verified update message.');

    // Add the DUPLICATE entry
    await editCourtPage.clickAddNew();
    logWithColor(testInfo, 'Clicked \'Add new application progression\' button.');
    await editCourtPage.enterType(`Get an update-${uniqueSuffix}`);
    logWithColor(testInfo, 'Entered Type in Type TextBox.');
    await editCourtPage.enterEmail(uniqueEmail); // Use the *same* unique email.
    logWithColor(testInfo, 'Entered duplicate Email in Email TextBox.');
    await editCourtPage.clickSave();
    logWithColor(testInfo, 'Clicked \'Save\' button.');

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
    logWithColor(testInfo, 'Verified duplicate entry error message.');
  });
});
