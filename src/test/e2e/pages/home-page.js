// src/test/e2e/pages/home-page.js
// src/test/e2e/pages/home-page.js
const { BasePage } = require('./base-page');
const { expect } = require('@playwright/test'); // expect is needed here for assertions within methods

class HomePage extends BasePage {
  constructor(page) {
    super(page);
    // Original selectors
    this.auditsSelector = '#audits';
    this.exampleCourtEditSelector = '#edit-aberdeen-tribunal-hearing-centre';

    // Court region selectors
    this.regionSelector = '#regionSelector';
    this.includeClosedCourtsCheckbox = '#toggle-closed-courts-display';
    this.courtListContainer = '#courtResults';

    // Add New Court Link (Visible to Super Admin)
    this.addCourtNavLink = '#add-court-nav';

    // Bulk Update Link (Visible to Super Admin) - Added
    this.bulkUpdateLink = '#bulk-update';
  }

  async isSuperAdmin() {
    // Check for both audits and add court link for robustness
    const hasAudits = await this.page.locator(this.auditsSelector).isVisible();
    const hasAddCourt = await this.page.locator(this.addCourtNavLink).isVisible();
    // Also check for bulk update link
    const hasBulkUpdate = await this.page.locator(this.bulkUpdateLink).isVisible();
    return hasAudits && hasAddCourt && hasBulkUpdate;
  }

  async isAdmin() {
    const hasEditLink = await this.page.locator(this.exampleCourtEditSelector).isVisible();
    const hasAudits = await this.page.locator(this.auditsSelector).isVisible();
    const hasAddCourt = await this.page.locator(this.addCourtNavLink).isVisible();
    const hasBulkUpdate = await this.page.locator(this.bulkUpdateLink).isVisible();
    // Admins shouldn't see Add Court or Bulk Update
    return hasEditLink && !hasAudits && !hasAddCourt && !hasBulkUpdate;
  }

  async isViewer() {
    // Use locator instead of $ for Playwright best practices
    const detailsLink = this.page.locator(this.exampleCourtEditSelector);
    if (!(await detailsLink.isVisible())) return false; // Check visibility directly
    const text = await detailsLink.innerText();
    // Viewers shouldn't see Add Court or Bulk Update either
    const hasAddCourt = await this.page.locator(this.addCourtNavLink).isVisible();
    const hasBulkUpdate = await this.page.locator(this.bulkUpdateLink).isVisible();
    return text.trim().toLowerCase() === 'details' && !hasAddCourt && !hasBulkUpdate;
  }

  async logout() {
    try {
      const logoutButton = this.page.locator('#logout');
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        // Just wait a bit without expecting navigation
        await this.page.waitForTimeout(2000);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Don't fail the test if logout fails, just log it.
    }
  }

  // Court region functionality methods
  async selectIncludeClosedCourts() {
    await this.page.waitForLoadState('domcontentloaded');
    const checkbox = this.page.locator(this.includeClosedCourtsCheckbox);

    // Use Playwright's built-in checks
    await expect(checkbox).toBeVisible({ timeout: 10000 }); // Ensure it's visible first

    // Only click if not already checked
    if (!(await checkbox.isChecked())) {
      await checkbox.check(); // Use check() for clarity
      // Wait for potential AJAX updates after checkbox click - networkidle is more reliable here
      await this.page.waitForLoadState('networkidle', { timeout: 10000 });
    } else {
      console.log('Include closed courts checkbox was already checked.');
    }
  }

  async isRegionSelectorVisible() {
    const selector = this.page.locator(this.regionSelector);
    await expect(selector).toBeVisible({ timeout: 10000 });
    return true; // If expect passes, it's visible
  }

  async selectRegion(regionValue) {
    const selector = this.page.locator(this.regionSelector);
    await expect(selector).toBeVisible({ timeout: 5000 });
    await selector.selectOption(regionValue);

    // Wait for AJAX to complete after region selection
    await this.page.waitForLoadState('networkidle', { timeout: 15000 }); // Wait for network activity to cease
  }

  async isCourtVisible(courtSlug) {
    const courtSelector = `#edit-${courtSlug}`;
    const courtList = this.page.locator(this.courtListContainer);
    await expect(courtList).toBeVisible({ timeout: 10000 }); // Ensure container is loaded
    // Check visibility within the container
    return await courtList.locator(courtSelector).isVisible({ timeout: 5000 });
  }

  // Helper method to check multiple courts at once for performance
  async areMultipleCourtsVisible(courtSlugs) {
    const results = {};
    const courtList = this.page.locator(this.courtListContainer);
    await expect(courtList).toBeVisible({ timeout: 10000 }); // Wait for container once

    for (const slug of courtSlugs) {
      const courtSelector = `#edit-${slug}`;
      // Use shorter timeout per check as container is already loaded
      results[slug] = await courtList.locator(courtSelector).isVisible({ timeout: 2000 });
    }
    return results;
  }

  // Click Add New Court Nav Link
  async clickAddCourtNav() {
    const link = this.page.locator(this.addCourtNavLink);
    await expect(link).toBeVisible();
    await link.click();
  }

  // --- Added for Bulk Update ---
  /**
   * Clicks the Bulk Update link and waits for navigation.
   * Assumes this navigates to the bulk update page.
   */
  async clickBulkUpdate() {
    const link = this.page.locator(this.bulkUpdateLink);
    await expect(link).toBeVisible();
    // Click and wait for the navigation to the bulk update page to start and finish
    await Promise.all([
      this.page.waitForNavigation({ url: '**/bulk-update', timeout: 15000, waitUntil: 'domcontentloaded' }), // Wait for navigation to bulk update page
      link.click()
    ]);
  }
  // --- End Added for Bulk Update ---
}

// Make sure BasePage is also exported if it wasn't already assumed
module.exports = { BasePage, HomePage };
