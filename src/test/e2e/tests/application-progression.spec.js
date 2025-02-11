const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { EditCourtPage } = require('../pages/edit-court-page');

test.describe('Application Progression', () => {
  test('Add and remove application types for Email', async ({ superAdminPage }) => {
    const editCourtPage = new EditCourtPage(superAdminPage);

    console.log('Starting test...'); // Logging

    await superAdminPage.goto('/courts/probate-service-centre/edit');
    await superAdminPage.waitForLoadState('networkidle');

    console.log('Navigated to page.'); // Logging

    await editCourtPage.clickApplicationProgressionTab();

    console.log('Clicked Application Progression tab.'); // Logging

    await editCourtPage.removeAllApplicationTypesAndSave();
    console.log('Removed all application types and saved.'); // Logging

    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    console.log('Verified update message.'); // Logging

    await editCourtPage.enterType('Get an update');
    console.log('Entered "Get an update" in Type TextBox.'); // Logging

    await editCourtPage.enterEmail('test@gmail.com');
    console.log('Entered "test@gmail.com" in Email TextBox.'); // Logging

    await editCourtPage.enterWelshType('welsh test');
    console.log('Entered "welsh test" in Welsh Type TextBox.'); // Logging

    await editCourtPage.clickAddNew();
    console.log('Clicked "Add new application progression" button.'); // Logging

    await editCourtPage.enterType('Get an update');
    console.log('Entered "Get an update" in Type TextBox.'); // Logging

    await editCourtPage.enterEmail('test2@gmail.com');
    console.log('Entered "test2@gmail.com" in Email TextBox.'); // Logging

    await editCourtPage.enterWelshType('welsh test2');
    console.log('Entered "welsh test2" in Welsh Type TextBox.'); // Logging

    await editCourtPage.clickSave();
    console.log('Clicked "Save" button.'); // Logging

    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    console.log('Verified update message.'); // Logging

    expect(await editCourtPage.getSecondLastEmail()).toBe('test@gmail.com');
    console.log('Verified second last email.'); // Logging

    expect(await editCourtPage.getLastEmail()).toBe('test2@gmail.com');
    console.log('Verified last email.'); // Logging
  });
});
