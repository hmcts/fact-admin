// tests/general-info.spec.js
const { test, logWithColor } = require('../fixtures/auth.setup');
const { expect } = require('@playwright/test');
const { GeneralInfoPage } = require('../pages/general-info-page');

test.describe('General Info', () => {
  test('Admin user can view and update urgent notices and PUAS flag', async ({ adminPage }, testInfo) => {
    const generalInfoPage = new GeneralInfoPage(adminPage);

    await adminPage.goto('/courts/stafford-combined-court-centre/edit', { waitUntil: 'domcontentloaded' });

    // Debugging lines
    console.log('Current URL:', adminPage.url());
    await expect(adminPage).toHaveURL(/.*\/courts\/stafford-combined-court-centre\/edit$/);
    const title = await adminPage.title();
    console.log('Page Title:', title);

    logWithColor(testInfo, 'Starting test and Navigated to page.');

    // Wait for the ACTUAL form content to load. Wait for iframe
    await adminPage.waitForSelector('#general #urgent-notice_ifr');

    // View assertions
    expect(await generalInfoPage.isUrgentNoticeVisible()).toBe(true);
    logWithColor(testInfo, 'Verified urgent notice visibility.');
    expect(await generalInfoPage.isPUASFlagVisible()).toBe(true);
    logWithColor(testInfo, 'Verified PUAS flag visibility.');
    expect(await generalInfoPage.isCommonPlatformCheckboxVisible()).toBe(true);
    logWithColor(testInfo, 'Verified common platform checkbox visibility.');
    expect(await generalInfoPage.isSuperAdminContentVisible()).toBe(false);
    logWithColor(testInfo, 'Verified super admin content not visible.');

    //Update assertions
    await generalInfoPage.setUrgentNotice('Test Urgent Notice');
    await generalInfoPage.setUrgentNoticeWelsh('Welsh Test Urgent Notice');
    await generalInfoPage.setPUASFlag(true);
    await generalInfoPage.setCommonPlatformFlag(true);

    //Crucially, wait for the POST request to complete.
    const [response] = await Promise.all([
      adminPage.waitForResponse(resp => resp.url().includes('/general-info') && resp.status() === 200),
      generalInfoPage.clickSave() //This needs to be second
    ]);

    logWithColor(testInfo, 'Set values for fields and clicked save');

    expect(await generalInfoPage.getUpdateMessage()).toContain('General Information updated');
    logWithColor(testInfo, 'Checked for updated message');

    //Revert changes for idempotency
    await generalInfoPage.setUrgentNotice('');
    await generalInfoPage.setUrgentNoticeWelsh('');
    await generalInfoPage.setPUASFlag(false);
    await generalInfoPage.setCommonPlatformFlag(false);
    //Crucially, wait for the POST request to complete.
    const [response2] = await Promise.all([
      adminPage.waitForResponse(resp => resp.url().includes('/general-info') && resp.status() === 200),
      generalInfoPage.clickSave() //This needs to be second
    ]);
    expect(await generalInfoPage.getUpdateMessage()).toContain('General Information updated');
  });
});
