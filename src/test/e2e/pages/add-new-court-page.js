// src/test/e2e/pages/add-new-court-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

class AddNewCourtPage extends BasePage {
  constructor(page) {
    super(page);

    // Page locators
    this.pageTitle = 'h1:has-text("Add new court")'; // Corrected case
    this.form = '#addNewCourtForm';
    this.courtNameInput = '#newCourtName';
    this.longitudeInput = '#lon';
    this.latitudeInput = '#lat';
    this.serviceCentreYesRadio = '#serviceCentre';
    this.serviceCentreNoRadio = '#serviceCentre-2';
    this.serviceAreasContainer = '#serviceAreasContainer';
    // Use a selector targeting the item container to then find label and input
    this.serviceAreaItem = `${this.serviceAreasContainer} .govuk-checkboxes__item`;
    this.saveButton = '#saveNewCourtBtn'; // The button that triggers the save/redirect

    // Error locators
    this.errorSummary = '.govuk-error-summary';
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryItems = `${this.errorSummaryList} li a`; // Target the links within the list items

    // Field-specific error messages (assuming standard govuk pattern)
    this.courtNameError = '#newCourtName-error';
    this.longitudeError = '#lon-error';
    this.latitudeError = '#lat-error';
    // Service area error is often linked to the summary or a general form group error near the checkboxes

    // Success state (based on controller/JS logic)
    // The JS redirects using the href attribute of the save button after success
    this.saveButtonWithRedirectHref = '#saveNewCourtBtn[href^="/courts/"]';
  }

  async goto() {
    // Super Admin users see 'Add New Court' link in nav
    await this.page.locator('#add-court-nav').click();
    await this.waitForPageLoad();
  }

  async waitForPageLoad() {
    await expect(this.page.locator(this.pageTitle)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.form)).toBeVisible();
    await expect(this.page.locator(this.saveButton)).toBeVisible();
  }

  async getPageTitleText() {
    return await this.page.locator(this.pageTitle).textContent();
  }

  async fillCourtName(name) {
    await this.page.locator(this.courtNameInput).fill(name);
  }

  async fillLongitude(lon) {
    await this.page.locator(this.longitudeInput).fill(String(lon)); // Ensure it's a string
  }

  async fillLatitude(lat) {
    await this.page.locator(this.latitudeInput).fill(String(lat)); // Ensure it's a string
  }

  async selectServiceCentreYes() {
    await this.page.locator(this.serviceCentreYesRadio).check();
    await expect(this.page.locator(this.serviceAreasContainer)).toBeVisible();
  }

  async selectServiceCentreNo() {
    await this.page.locator(this.serviceCentreNoRadio).check();
    await expect(this.page.locator(this.serviceAreasContainer)).toBeHidden();
  }

  async selectServiceAreaByIndex(index) {
    // Selecting by index might still be useful sometimes, kept for completeness
    // Ensure the container is visible first if selecting by index
    await expect(this.page.locator(this.serviceAreasContainer)).toBeVisible();
    const checkbox = this.page.locator(`${this.serviceAreaItem} input[type="checkbox"]`).nth(index);
    await checkbox.check();
  }

  async selectServiceAreaByName(name) {
    // *** REVISED STRATEGY ***
    // 1. Ensure the container holding the checkboxes is visible.
    await expect(this.page.locator(this.serviceAreasContainer)).toBeVisible({ timeout: 10000 });

    // 2. Locate the specific checkbox item container that contains the label with the desired text.
    //    This assumes the structure <div class="govuk-checkboxes__item"> <input> <label>Text</label> </div>
    const itemContainer = this.page.locator(this.serviceAreaItem)
      .filter({ has: this.page.locator(`label:has-text("${name}")`) });

    // 3. Within that container, find the input checkbox.
    const checkbox = itemContainer.locator('input[type="checkbox"]');

    // 4. Check the checkbox. Use a reasonable timeout.
    await checkbox.check({ timeout: 10000 }); // Added timeout to check itself
  }

  async clickSave() {
    await this.page.locator(this.saveButton).click();
  }

  async waitForErrorSummary(options = { timeout: 5000 }) {
    const timeout = options.timeout || 5000;
    await expect(this.page.locator(this.errorSummary)).toBeVisible({ timeout });
    await expect(this.page.locator(this.errorSummaryTitle)).toBeVisible({ timeout });
  }

  async getErrorSummaryMessages() {
    await this.waitForErrorSummary();
    const items = this.page.locator(this.errorSummaryItems);
    return await items.allTextContents();
  }

  async getFieldErrorText(fieldErrorLocator) {
    await expect(this.page.locator(fieldErrorLocator)).toBeVisible();
    return await this.page.locator(fieldErrorLocator).textContent();
  }

  async checkErrorSummaryContains(expectedErrors, exactMatch = false) {
    await this.waitForErrorSummary();
    const actualErrors = await this.getErrorSummaryMessages();
    const cleanedActualErrors = actualErrors.map(e => e.trim()).filter(Boolean);

    if (exactMatch) {
      // Sort both arrays for exact comparison
      expect(cleanedActualErrors.sort()).toEqual(expectedErrors.sort());
    } else {
      // Check if actualErrors contains all expectedErrors
      expect(cleanedActualErrors).toEqual(expect.arrayContaining(expectedErrors));
      // Optionally, check if the lengths are also equal if no extra errors are allowed
      // expect(cleanedActualErrors.length).toEqual(expectedErrors.length);
    }
  }


  async checkFieldError(fieldErrorLocator, expectedError) {
    const actualError = await this.getFieldErrorText(fieldErrorLocator);
    expect(actualError.trim()).toContain(expectedError);
  }

  async waitForSuccessfulSaveRedirect(expectedSlugPart) {
    // Wait for the save button to get the 'href' attribute populated by the JS
    await expect(this.page.locator(this.saveButtonWithRedirectHref)).toBeVisible({ timeout: 10000 });

    // Wait for the navigation triggered by the client-side JS redirect
    const expectedUrlPattern = new RegExp(`/courts/${expectedSlugPart}/edit#general$`);
    await this.page.waitForURL(expectedUrlPattern, { timeout: 15000 });
    await expect(this.page).toHaveURL(expectedUrlPattern);
  }
}

module.exports = { AddNewCourtPage };
