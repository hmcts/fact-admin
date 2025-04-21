// src/test/e2e/pages/photo-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');
const path = require('path');

class PhotoPage extends BasePage {
  constructor(page) {
    super(page);

    // Locators
    this.mainContent = 'main#main-content';
    this.navContainer = '#nav';
    this.photoTabLink = '#tab_photo';
    this.photoPanel = 'div.fact-tabs-panel#photo';
    this.photoForm = `${this.photoPanel} #photoForm`;
    this.photoContent = `${this.photoForm} #photoContent`;
    this.currentPhotoImage = `${this.photoContent} #current-court-photo`;
    this.fileUploadInput = `${this.photoForm} #court-photo-file-upload`;
    this.updatePhotoButton = `${this.photoForm} button[name="updatePhoto"]`;
    this.deletePhotoButton = `${this.photoContent} button[name="deletePhoto"]`;
    this.confirmDeleteButton = `${this.photoPanel} #confirmDelete`;
    this.cancelDeleteButton = `${this.photoPanel} #cancelDeletePhotoBtn`;
    this.successPanel = `${this.photoContent} div.govuk-panel--confirmation`;
    this.successPanelTitle = `${this.successPanel} > h2.govuk-panel__title`;
    this.errorSummary = `${this.photoContent} .govuk-error-summary`;
    this.fieldError = `${this.photoForm} p.govuk-error-message`;
  }

  async clickPhotoTab() {
    await this.page.locator(this.navContainer).hover();
    await this.page.locator(this.photoTabLink).click();
    await this.page.locator(this.mainContent).hover();
    await expect(this.page.locator(this.photoPanel)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.photoPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });
    await expect(this.page.locator(this.photoForm)).toBeVisible({ timeout: 15000 });
    await expect(this.page.locator(this.fileUploadInput)).toBeVisible({ timeout: 5000 });
  }

  async deleteExistingPhotoIfExists() {
    const photoLocator = this.page.locator(this.currentPhotoImage);
    const deleteButtonLocator = this.page.locator(this.deletePhotoButton);
    const confirmButtonLocator = this.page.locator(this.confirmDeleteButton);
    const successTitleLocator = this.page.locator(this.successPanelTitle);

    if (await photoLocator.isVisible({ timeout: 2000 }) && await deleteButtonLocator.isVisible({ timeout: 1000 })) {
      console.log('Existing photo found. Attempting deletion...');

      // Define the URL pattern for the confirmation request
      const confirmUrlPattern = /\/photo\/.*\/confirm-delete/;

      // Start waiting for the response *before* clicking
      const waitResponsePromise = this.page.waitForResponse(
        response => confirmUrlPattern.test(response.url()) && response.status() === 200,
        { timeout: 10000 } // Timeout for the confirmation load
      );

      await deleteButtonLocator.click();
      console.log('Initial delete button clicked. Waiting for confirmation view...');

      // Wait for the AJAX call loading the confirmation view to complete
      try {
        await waitResponsePromise;
        console.log('Confirmation view loaded successfully.');
      } catch (e) {
        console.error('Error waiting for delete confirmation view response:', e);
        throw new Error('Failed to load the delete confirmation view.');
      }

      // Now wait for the confirm button to be visible in the newly loaded content
      await expect(confirmButtonLocator).toBeVisible({ timeout: 5000 });
      console.log('Confirmation delete button visible. Clicking...');
      await confirmButtonLocator.click();

      // Wait for deletion confirmation (image hidden)
      await expect(photoLocator).toBeHidden({ timeout: 10000 });
      console.log('Photo deleted successfully (image element is hidden).');
      await expect(successTitleLocator).toHaveText('Photo deleted', { timeout: 5000 });
      console.log('Verified "Photo deleted" success message is present.');
    } else {
      console.log('No existing photo found or delete button not present. Skipping deletion.');
      await expect(successTitleLocator).toBeHidden({ timeout: 1000 });
    }
  }

  async uploadPhoto(relativeFilePath) {
    const absolutePath = path.resolve(relativeFilePath);
    console.log(`Attempting to upload file from: ${absolutePath} using setInputFiles`);
    const fileInputLocator = this.page.locator(this.fileUploadInput);
    await expect(fileInputLocator).toBeVisible();
    await fileInputLocator.setInputFiles(absolutePath);
    console.log(`File input set with: ${absolutePath}`);
  }

  async clickUpdatePhoto() {
    const updateButtonLocator = this.page.locator(this.updatePhotoButton);
    await expect(updateButtonLocator).toBeEnabled();
    await updateButtonLocator.click();
  }

  async waitForSuccessMessage(expectedMessage, options = { timeout: 15000 }) {
    const messageLocator = this.page.locator(this.successPanelTitle);
    await expect(this.page.locator(this.successPanel)).toBeVisible(options);
    await expect(messageLocator).toHaveText(expectedMessage, { timeout: options.timeout });
    await expect(messageLocator).toBeVisible(options);
  }

  async verifyNewPhotoIsDisplayed(options = { timeout: 10000 }) {
    await expect(this.page.locator(this.currentPhotoImage)).toBeVisible(options);
  }

  async waitForErrorSummary(options = { timeout: 10000 }) {
    await expect(this.page.locator(this.errorSummary)).toBeVisible(options);
  }

  async getFieldErrorMessage(options = { timeout: 5000 }) {
    const errorLocator = this.page.locator(this.fieldError).first();
    await expect(errorLocator).toBeVisible(options);
    return (await errorLocator.textContent()).trim();
  }
}

module.exports = { PhotoPage };
