const { test } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { EditCourtPage } = require('../pages/edit-court-page');

test.describe('Application Progression', () => {
  test('Add and remove application types for Email', async ({ superAdminPage }) => {
    const editCourtPage = new EditCourtPage(superAdminPage);

    console.log(`[${test.info().title}] Starting test...`);

    await superAdminPage.goto('/courts/probate-service-centre/edit');
    await superAdminPage.waitForLoadState('networkidle');
    console.log(`[${test.info().title}] Navigated to page.`);
    await editCourtPage.clickApplicationProgressionTab();
    console.log(`[${test.info().title}] Clicked Application Progression tab.`);
    await editCourtPage.removeAllApplicationTypesAndSave();
    console.log(`[${test.info().title}] Removed all application types and saved.`);
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    console.log(`[${test.info().title}] Verified update message.`);
    await editCourtPage.enterType('Get an update');
    console.log(`[${test.info().title}] Entered "Get an update" in Type TextBox.`);
    await editCourtPage.enterEmail('test@gmail.com');
    console.log(`[${test.info().title}] Entered "test@gmail.com" in Email TextBox.`);
    await editCourtPage.enterWelshType('welsh test');
    console.log(`[${test.info().title}] Entered "welsh test" in Welsh Type TextBox.`);
    await editCourtPage.clickAddNew();
    console.log(`[${test.info().title}] Clicked "Add new application progression" button.`);
    await editCourtPage.enterType('Get an update');
    console.log(`[${test.info().title}] Entered "Get an update" in Type TextBox.`);
    await editCourtPage.enterEmail('test2@gmail.com');
    console.log(`[${test.info().title}] Entered "test2@gmail.com" in Email TextBox.`);
    await editCourtPage.enterWelshType('welsh test2');
    console.log(`[${test.info().title}] Entered "welsh test2" in Welsh Type TextBox.`);
    await editCourtPage.clickSave();
    console.log(`[${test.info().title}] Clicked "Save" button.`);
    expect(await editCourtPage.getUpdateMessage()).toContain('Application Progressions updated');
    console.log(`[${test.info().title}] Verified update message.`);
    expect(await editCourtPage.getSecondLastEmail()).toBe('test@gmail.com');
    console.log(`[${test.info().title}] Verified second last email.`);
    expect(await editCourtPage.getLastEmail()).toBe('test2@gmail.com');
    console.log(`[${test.info().title}] Verified last email.`);
  });
});
