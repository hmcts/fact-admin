// src/test/e2e/pages/home-page.js
const { BasePage } = require('./base-page');

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
  }

  async isSuperAdmin() {
    // Check for both audits and add court link for robustness
    const hasAudits = await this.page.isVisible(this.auditsSelector);
    const hasAddCourt = await this.page.isVisible(this.addCourtNavLink);
    return hasAudits && hasAddCourt;
  }

  async isAdmin() {
    const hasEditLink = await this.page.isVisible(this.exampleCourtEditSelector);
    const hasAudits = await this.page.isVisible(this.auditsSelector);
    const hasAddCourt = await this.page.isVisible(this.addCourtNavLink);
    return hasEditLink && !hasAudits && !hasAddCourt; // Admins shouldn't see Add Court
  }

  async isViewer() {
    const detailsLink = await this.page.$(this.exampleCourtEditSelector);
    if (!detailsLink) return false;
    const text = await detailsLink.innerText();
    // Viewers shouldn't see Add Court either
    const hasAddCourt = await this.page.isVisible(this.addCourtNavLink);
    return text.trim() === 'details' && !hasAddCourt;
  }

  async logout() {
    try {
      const logoutButton = await this.page.$('#logout');
      if (logoutButton) {
        await logoutButton.click();
        // Just wait a bit without expecting navigation
        await this.page.waitForTimeout(2000);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  // Court region functionality methods
  async selectIncludeClosedCourts() {
    await this.page.waitForLoadState('domcontentloaded');
    const checkbox = await this.page.locator(this.includeClosedCourtsCheckbox);

    // Check if checkbox exists
    if (await checkbox.count() > 0) {
      // Only click if not already checked
      const isChecked = await checkbox.isChecked();
      if (!isChecked) {
        await checkbox.click();
        // Wait for potential AJAX updates after checkbox click
        await this.page.waitForTimeout(500);
      }
    } else {
      console.log('Include closed courts checkbox not found.');
    }
  }

  async isRegionSelectorVisible() {
    await this.page.waitForSelector(this.regionSelector, { timeout: 10000 });
    return await this.page.isVisible(this.regionSelector);
  }

  async selectRegion(regionValue) {
    await this.page.waitForSelector(this.regionSelector, { state: 'visible' });
    await this.page.selectOption(this.regionSelector, regionValue);

    // Wait for AJAX to complete after region selection
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(500); // Additional safety timeout
  }

  async isCourtVisible(courtSlug) {
    const courtSelector = `#edit-${courtSlug}`;
    // Increase timeout slightly for potentially longer lists
    await this.page.waitForSelector(this.courtListContainer, { timeout: 10000 });
    // Check visibility within the container
    return await this.page.locator(this.courtListContainer).locator(courtSelector).isVisible({ timeout: 5000 });
  }

  // Helper method to check multiple courts at once
  async areMultipleCourtsVisible(courtSlugs) {
    const results = {};
    for (const slug of courtSlugs) {
      results[slug] = await this.isCourtVisible(slug);
    }
    return results;
  }

  // Click Add New Court Nav Link
  async clickAddCourtNav() {
    await expect(this.page.locator(this.addCourtNavLink)).toBeVisible();
    await this.page.locator(this.addCourtNavLink).click();
  }
}

module.exports = { BasePage, HomePage };
