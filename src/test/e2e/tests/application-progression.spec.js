const { test, logWithColor } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { EditCourtPage } = require('../pages/edit-court-page');

test.describe('Application Progression', () => {
  test('Add and remove application types for Email', async ({ superAdminPage }, testInfo) => { // Add testInfo
    const editCourtPage = new EditCourtPage(superAdminPage);

    logWithColor(testInfo, "Starting test...");

    await superAdminPage.goto('/courts/probate-service-centre/edit');
    await superAdminPage.waitForLoadState('networkidle');
    logWithColor(testInfo, "Navigated to page.");
    await editCourtPage.clickApplicationProgressionTab();
    logWithColor(testInfo, "Clicked Application Progression tab.");
    await editCourtPage.removeAllApplicationTypesAndSave();
    logWithColor(testInfo, "Removed all application types and saved.");
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, "Verified update message.");
    await editCourtPage.enterType('Get an update');
    logWithColor(testInfo, "Entered 'Get an update' in Type TextBox.");
    await editCourtPage.enterEmail('test@gmail.com');
    logWithColor(testInfo, "Entered 'test@gmail.com' in Email TextBox.");
    await editCourtPage.enterWelshType('welsh test');
    logWithColor(testInfo, "Entered 'welsh test' in Welsh Type TextBox.");
    await editCourtPage.clickAddNew();
    logWithColor(testInfo, "Clicked 'Add new application progression' button.");
    await editCourtPage.enterType('Get an update');
    logWithColor(testInfo, "Entered 'Get an update' in Type TextBox.");
    await editCourtPage.enterEmail('test2@gmail.com');
    logWithColor(testInfo, "Entered 'test2@gmail.com' in Email TextBox.");
    await editCourtPage.enterWelshType('welsh test2');
    logWithColor(testInfo, "Entered 'welsh test2' in Welsh Type TextBox.");
    await editCourtPage.clickSave();
    logWithColor(testInfo, "Clicked 'Save' button.");
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    logWithColor(testInfo, "Verified update message.");
    expect(await editCourtPage.getSecondLastEmail()).toBe('test@gmail.com');
    logWithColor(testInfo, "Verified second last email.");
    expect(await editCourtPage.getLastEmail()).toBe('test2@gmail.com');
    logWithColor(testInfo, "Verified last email.");
  });
});
