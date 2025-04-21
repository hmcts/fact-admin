// src/test/e2e/pages/facilities-page.js
const { expect } = require('@playwright/test');
const { BasePage } = require('./base-page');

/**
 * Page Object Model for the 'Facilities' tab within the Edit Court page.
 */
class FacilitiesPage extends BasePage {
  constructor(page) {
    super(page);

    this.navContainer = '#nav';
    this.facilitiesTabLink = '#tab_court-facilities';
    this.facilitiesPanel = 'div.fact-tabs-panel#court-facilities';
    this.facilitiesForm = `${this.facilitiesPanel} #courtFacilitiesForm`;
    this.facilitiesContent = `${this.facilitiesForm} #courtFacilitiesContent`;
    this.mainContentArea = 'main#main-content';

    this.addButton = `${this.facilitiesPanel} button.addFacility`;
    this.saveButton = `${this.facilitiesPanel} button[name="saveFacilities"]`;
    this.hiddenTemplateFieldset = `${this.facilitiesContent} #newFacilityTemplate`;
    // Selects fieldsets that are *not* the hidden template and are currently visible
    this.visibleFieldsets = `${this.facilitiesContent} fieldset:visible:not(#newFacilityTemplate)`;
    // Selects fieldsets that contain a remove button (i.e., saved or dynamically added)
    this.removableFieldsets = `${this.visibleFieldsets}:has(button.deleteFacility)`;
    // Specific selector for the *visible* remove buttons within removable fieldsets
    this.visibleRemoveButton = `${this.removableFieldsets} button.deleteFacility:visible`;
    // Selector for *all* visible fieldsets, including the template/new row, used for accurate indexing
    this.allVisibleFieldsetsSelector = `${this.facilitiesContent} fieldset:visible`;

    // Elements within a Fieldset (relative selectors)
    this.nameSelect = 'select[name$="[id]"]';
    this.descriptionEnglishIframe = (index) => `#description-${index}_ifr`;
    this.descriptionWelshIframe = (index) => `#descriptionCy-${index}_ifr`;
    this.tinyMceBody = 'body#tinymce'; // TinyMCE editor body inside iframe
    this.removeButton = 'button.deleteFacility';
    this.clearButton = 'button.clearFacility';

    // Messages & Errors
    this.successMessageContainer = `${this.facilitiesContent} > div.govuk-panel--confirmation`;
    this.successMessageTitle = `${this.successMessageContainer} > h2.govuk-panel__title`;
    this.errorSummary = `${this.facilitiesContent} .govuk-error-summary`;
    this.errorSummaryTitle = `${this.errorSummary} .govuk-error-summary__title`;
    this.errorSummaryList = `${this.errorSummary} .govuk-error-summary__list`;
    this.errorSummaryItems = `${this.errorSummaryList} li`;
    this.nameFieldError = 'p[id^="name-"][id$="-error"]';
    this.descriptionFieldError = 'p[id^="description-"][id$="-error"]';
  }

  /**
   * Clicks the 'Facilities' tab and waits for the panel and essential buttons to load.
   */
  async clickFacilitiesTab() {
    await this.page.locator(this.navContainer).hover();
    await this.page.locator(this.facilitiesTabLink).click();
    await this.page.locator(this.mainContentArea).hover(); // Move mouse away

    await expect(this.page.locator(this.facilitiesPanel)).toBeVisible({ timeout: 10000 });
    await expect(this.page.locator(this.facilitiesPanel)).not.toHaveClass(/fact-tabs-panel--hidden/, { timeout: 5000 });

    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeVisible({ timeout: 15000 });
    await expect(saveButtonLocator).toBeEnabled({ timeout: 5000 });
    await expect(this.page.locator(this.addButton)).toBeVisible({ timeout: 5000 });
  }

  /**
   * Waits for the AJAX request that loads the facility entries to complete.
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   */
  async waitForFacilitiesAjaxLoad(courtSlug, options = { timeout: 15000 }) {
    const getUrlPattern = `/courts/${courtSlug}/facilities`;
    console.log(`Waiting for AJAX response: GET ${getUrlPattern}`);
    try {
      await this.page.waitForResponse(
        response => response.url().includes(getUrlPattern) && response.request().method() === 'GET' && response.status() === 200,
        options
      );
      console.log(`AJAX response received: GET ${getUrlPattern}`);
    } catch (e) {
      console.warn(`Timeout or error waiting for GET ${getUrlPattern} response: ${e.message}. Proceeding with caution.`);
    }
    await this.page.waitForLoadState('domcontentloaded', { timeout: 2000 }).catch(() => console.warn('Timeout waiting for domcontentloaded after facilities AJAX load.'));
  }

  /**
   * Clicks the 'Facilities' tab and waits for both the tab structure AND the AJAX content to load.
   * @param {string} courtSlug - The slug of the court being edited.
   */
  async clickFacilitiesTabAndWaitForLoad(courtSlug) {
    await this.clickFacilitiesTab();
    await this.waitForFacilitiesAjaxLoad(courtSlug);
  }

  /**
   * Removes all existing facility entries using a loop and clicking the remove button.
   * Saves the changes, reloads the page, and verifies the state for idempotency.
   * @param {string} courtSlug - The slug of the court being edited.
   */
  async removeAllFacilitiesAndSave(courtSlug) {
    await expect(this.page.locator(this.addButton)).toBeVisible(); // Ensure tab is ready

    const removeButtonLocator = this.page.locator(this.visibleRemoveButton);
    let removedCount = 0;
    const maxRemoveClicks = 30; // Safety break

    console.log(`removeAllFacilitiesAndSave: Starting remove loop.`);
    while (await removeButtonLocator.count() > 0 && removedCount < maxRemoveClicks) {
      await removeButtonLocator.first().click();
      removedCount++;
      await this.page.waitForTimeout(100); // Pause for DOM update
    }

    if (removedCount >= maxRemoveClicks) {
      console.error(`removeAllFacilitiesAndSave: Exceeded max remove clicks (${maxRemoveClicks}). Potential issue.`);
    }

    if (removedCount > 0) {
      console.log(`removeAllFacilitiesAndSave: Clicked remove ${removedCount} times. Saving removal attempt...`);
      await Promise.all([
        this.waitForSaveResponse(courtSlug),
        this.clickSave()
      ]);
      console.log(`removeAllFacilitiesAndSave: Save PUT request completed.`);
      await this.waitForUpdateMessage('Court Facilities updated');
      console.log(`removeAllFacilitiesAndSave: Initial success message verified.`);
    } else {
      console.log(`removeAllFacilitiesAndSave: No deletable facility entries found to click remove on.`);
      await expect(this.page.locator(this.allVisibleFieldsetsSelector)).toHaveCount(1, { timeout: 3000 });
    }

    // Reload page and re-activate tab to get actual server state
    console.log(`removeAllFacilitiesAndSave: Reloading page to verify persisted state...`);
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    console.log(`removeAllFacilitiesAndSave: Page reloaded. Re-activating Facilities tab...`);
    await this.clickFacilitiesTabAndWaitForLoad(courtSlug); // Includes AJAX wait
    console.log(`removeAllFacilitiesAndSave: Facilities tab re-activated and AJAX load awaited.`);

    // Final check: Ensure only one fieldset (the empty template) remains
    console.log(`removeAllFacilitiesAndSave: Performing final check for 1 visible fieldset...`);
    const finalFieldsetsLocator = this.page.locator(this.allVisibleFieldsetsSelector);
    await expect(finalFieldsetsLocator).toHaveCount(1, { timeout: 10000 });
    console.log(`removeAllFacilitiesAndSave: Cleanup check complete. Verified 1 visible fieldset remains.`);
  }

  /**
   * Clicks the 'Add new facility' button and waits for a new fieldset to appear.
   */
  async clickAddNewFacility() {
    const fieldsetsLocator = this.page.locator(this.allVisibleFieldsetsSelector);
    const initialCount = await fieldsetsLocator.count();
    await this.page.locator(this.addButton).click();
    await expect(fieldsetsLocator).toHaveCount(initialCount + 1, { timeout: 7000 });
  }

  /**
   * Helper to determine the 1-based index of a fieldset among *all* visible fieldsets
   * by comparing element handles. This index usually corresponds to the IDs used
   * in the iframe selectors (e.g., description-1_ifr).
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the specific fieldset.
   * @returns {Promise<number>} The 1-based index.
   * @throws {Error} If the fieldset cannot be found in the list of visible fieldsets.
   */
  async _get1BasedIndex(fieldsetLocator) {
    console.log(`_get1BasedIndex: Attempting to find index for the provided fieldset locator.`);
    const targetElementHandle = await fieldsetLocator.elementHandle();
    if (!targetElementHandle) {
      throw new Error('_get1BasedIndex: Could not get element handle for the target fieldset locator. It might not be visible or attached.');
    }
    console.log(`_get1BasedIndex: Target element handle obtained.`);

    const allFieldsetLocators = this.page.locator(this.allVisibleFieldsetsSelector);
    const count = await allFieldsetLocators.count();
    console.log(`_get1BasedIndex: Found ${count} total visible fieldsets to iterate through.`);

    for (let i = 0; i < count; i++) {
      const currentFieldsetLocator = allFieldsetLocators.nth(i);
      let currentElementHandle = null; // Initialize handle
      try {
        currentElementHandle = await currentFieldsetLocator.elementHandle();
        if (!currentElementHandle) {
          console.warn(`_get1BasedIndex: Could not get element handle for fieldset at index ${i}. Skipping comparison.`);
          continue;
        }

        const areSame = await this.page.evaluate(([target, current]) => target === current,
          [targetElementHandle, currentElementHandle]);

        if (areSame) {
          const oneBasedIndex = i + 1;
          console.log(`_get1BasedIndex: Match found at index ${i}. Returning 1-based index: ${oneBasedIndex}`);
          await targetElementHandle.dispose(); // Dispose target handle on success
          await currentElementHandle.dispose();
          return oneBasedIndex;
        }
        // Dispose current handle if it didn't match
        await currentElementHandle.dispose();
      } catch (comparisonError) {
        console.warn(`_get1BasedIndex: Error during comparison at index ${i}: ${comparisonError.message}`);
        // Ensure handle is disposed even if comparison fails
        if(currentElementHandle) await currentElementHandle.dispose();
      }
    }

    console.error('_get1BasedIndex: Could not find the target fieldset within the list of all visible fieldsets using element handle comparison.');
    await targetElementHandle.dispose(); // Dispose target handle if loop finishes without success
    throw new Error('Could not determine the 1-based index for the provided fieldset locator.');
  }

  /**
   * Fills the details for a facility entry within a specific fieldset.
   * Handles TinyMCE iframe interactions using the dynamically determined index.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the specific fieldset.
   * @param {object} data - Object containing facility data { nameLabel?, englishDescription?, welshDescription? }.
   *                        `nameLabel` is the visible text of the option to select in the dropdown.
   */
  async fillFacilityDetails(fieldsetLocator, data) {
    await expect(fieldsetLocator).toBeVisible();

    if (data.nameLabel !== undefined && data.nameLabel !== null) {
      const selectElement = fieldsetLocator.locator(this.nameSelect);
      await expect(selectElement).toBeVisible();
      await selectElement.selectOption({ label: data.nameLabel });
    }

    const fieldsetIndex = await this._get1BasedIndex(fieldsetLocator);

    if (data.englishDescription !== undefined && data.englishDescription !== null) {
      const iframeSelector = this.descriptionEnglishIframe(fieldsetIndex);
      try {
        await expect(this.page.locator(iframeSelector)).toBeVisible({ timeout: 7000 });
        const frame = this.page.frameLocator(iframeSelector);
        await expect(frame.locator(this.tinyMceBody)).toBeVisible({ timeout: 7000 });
        await frame.locator(this.tinyMceBody).fill(data.englishDescription);
      } catch (e) {
        console.error(`Error interacting with English description iframe (${iframeSelector}) for fieldset index ${fieldsetIndex}: ${e}`);
        throw e;
      }
    }

    if (data.welshDescription !== undefined && data.welshDescription !== null) {
      const iframeSelector = this.descriptionWelshIframe(fieldsetIndex);
      try {
        await expect(this.page.locator(iframeSelector)).toBeVisible({ timeout: 7000 });
        const frame = this.page.frameLocator(iframeSelector);
        await expect(frame.locator(this.tinyMceBody)).toBeVisible({ timeout: 7000 });
        await frame.locator(this.tinyMceBody).fill(data.welshDescription);
      } catch (e) {
        console.error(`Error interacting with Welsh description iframe (${iframeSelector}) for fieldset index ${fieldsetIndex}: ${e}`);
        throw e;
      }
    }
  }

  /**
   * Retrieves the current values from the input/select fields within a given facility fieldset.
   * Handles TinyMCE iframe interactions using the dynamically determined index.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the fieldset.
   * @returns {Promise<object>} Object containing { nameValue, nameLabel, englishDescription, welshDescription }.
   */
  async getFacilityDetails(fieldsetLocator) {
    await expect(fieldsetLocator).toBeVisible();

    const selectElement = fieldsetLocator.locator(this.nameSelect);
    const nameValue = await selectElement.inputValue();
    const nameLabel = await selectElement.locator('option:checked').textContent();

    const fieldsetIndex = await this._get1BasedIndex(fieldsetLocator);

    let englishDescription = '';
    const engIframeSelector = this.descriptionEnglishIframe(fieldsetIndex);
    try {
      if (await this.page.locator(engIframeSelector).isVisible({ timeout: 2000 })) {
        const engFrame = this.page.frameLocator(engIframeSelector);
        await expect(engFrame.locator(this.tinyMceBody)).toBeVisible({ timeout: 5000 });
        englishDescription = await engFrame.locator(this.tinyMceBody).textContent();
      } else {
        console.warn(`English description iframe (${engIframeSelector}) for index ${fieldsetIndex} not visible when getting details.`);
      }
    } catch (e) {
      console.warn(`Error accessing English description iframe (${engIframeSelector}) for index ${fieldsetIndex} when getting details: ${e}`);
    }

    let welshDescription = '';
    const welshIframeSelector = this.descriptionWelshIframe(fieldsetIndex);
    try {
      if (await this.page.locator(welshIframeSelector).isVisible({ timeout: 2000 })) {
        const welshFrame = this.page.frameLocator(welshIframeSelector);
        await expect(welshFrame.locator(this.tinyMceBody)).toBeVisible({ timeout: 5000 });
        welshDescription = await welshFrame.locator(this.tinyMceBody).textContent();
      } else {
        console.warn(`Welsh description iframe (${welshIframeSelector}) for index ${fieldsetIndex} not visible when getting details.`);
      }
    } catch (e) {
      console.warn(`Error accessing Welsh description iframe (${welshIframeSelector}) for index ${fieldsetIndex} when getting details: ${e}`);
    }

    return {
      nameValue: nameValue,
      nameLabel: nameLabel.trim(),
      englishDescription: englishDescription.trim(),
      welshDescription: welshDescription.trim()
    };
  }

  /**
   * Clicks the 'Remove' button within a specific fieldset.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the fieldset.
   */
  async clickRemoveFacility(fieldsetLocator) {
    const removeButton = fieldsetLocator.locator(this.removeButton);
    await expect(removeButton).toBeVisible();
    await removeButton.click();
  }

  /**
   * Clicks the 'Clear' button within a specific fieldset.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the fieldset.
   */
  async clickClearFacility(fieldsetLocator) {
    const clearButton = fieldsetLocator.locator(this.clearButton);
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    await this.page.waitForTimeout(250); // Pause for potential TinyMCE reset
  }

  /**
   * Clicks the main 'Save Facilities' button.
   */
  async clickSave() {
    const saveButtonLocator = this.page.locator(this.saveButton);
    await expect(saveButtonLocator).toBeEnabled();
    await saveButtonLocator.click();
  }

  /**
   * Waits for the Facilities update PUT request to complete successfully (200 OK).
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponse(courtSlug, options = { timeout: 15000 }) {
    const updateUrlPattern = `/courts/${courtSlug}/facilities`;
    return this.page.waitForResponse(
      response =>
        response.url().includes(updateUrlPattern) &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
      options
    );
  }

  /**
   * Waits for the Facilities update PUT request to complete *with an error* (non-200).
   * @param {string} courtSlug - The slug of the court being edited.
   * @param {object} [options={ timeout: 15000 }] - Options like timeout.
   * @returns {Promise<import('@playwright/test').Response>} The Playwright Response object.
   */
  async waitForSaveResponseWithError(courtSlug, options = { timeout: 15000 }) {
    const updateUrlPattern = `/courts/${courtSlug}/facilities`;
    return this.page.waitForResponse(
      response =>
        response.url().includes(updateUrlPattern) &&
        response.request().method() === 'PUT' &&
        response.status() !== 200, // Expecting non-200 status
      options
    );
  }

  /**
   * Waits for the success confirmation panel to appear and verifies its title.
   * @param {string} expectedMessage - The expected text content of the success message title.
   * @param {object} [options={ timeout: 10000 }] - Options like timeout.
   */
  async waitForUpdateMessage(expectedMessage, options = { timeout: 10000 }) {
    const messageLocator = this.page.locator(this.successMessageTitle);
    await expect(this.page.locator(this.successMessageContainer)).toBeVisible(options);
    await expect(messageLocator).toContainText(expectedMessage, { timeout: options.timeout });
    await expect(messageLocator).toBeVisible(options);
  }

  /**
   * Waits for the error summary panel to be visible.
   * @param {object} [options={ timeout: 5000 }] - Options like timeout.
   */
  async waitForErrorSummary(options = { timeout: 5000 }) {
    await expect(this.page.locator(this.errorSummary)).toBeVisible(options);
    await expect(this.page.locator(this.errorSummaryTitle)).toBeVisible(options);
  }

  /**
   * Gets all error messages from the visible error summary list.
   * @returns {Promise<string[]>} An array of trimmed error message strings.
   */
  async getErrorSummaryMessages() {
    await this.waitForErrorSummary();
    const items = this.page.locator(this.errorSummaryItems);
    await items.first().waitFor({ state: 'visible', timeout: 3000 });
    const texts = await items.allTextContents();
    return texts.map(text => text.trim()).filter(Boolean);
  }

  /**
   * Checks if the visible error summary list contains exactly the expected error messages (order-independent).
   * @param {string[]} expectedErrors - An array of expected error message strings.
   */
  async checkErrorSummaryExact(expectedErrors) {
    await this.waitForErrorSummary();
    const actualErrors = await this.getErrorSummaryMessages();
    expect(actualErrors.sort()).toEqual(expectedErrors.sort());
  }

  /**
   * Gets the field-level error message associated with a specific input/select within a fieldset.
   * Targets error messages based on their specific ID patterns or relative position.
   * @param {import('@playwright/test').Locator} fieldsetLocator - The locator for the fieldset.
   * @param {'name' | 'description'} fieldType - The type of field to check ('name' or 'description').
   * @returns {Promise<string>} The trimmed error message text.
   */
  async getFieldError(fieldsetLocator, fieldType) {
    let errorLocator;
    if (fieldType === 'name') {
      // Find the select element first, then locate the error relative to its form group
      const selectElement = fieldsetLocator.locator(this.nameSelect);
      const formGroup = selectElement.locator('xpath=ancestor::div[contains(@class, "govuk-form-group")]');
      errorLocator = formGroup.locator(this.nameFieldError);

    } else if (fieldType === 'description') {
      // Find error message within the fieldset, specifically targeting description errors
      // This assumes the error message is within the same form group as the iframe/textarea
      const fieldsetIndex = await this._get1BasedIndex(fieldsetLocator);
      const iframeSelector = this.descriptionEnglishIframe(fieldsetIndex); // Use English as reference
      const iframeElement = this.page.locator(iframeSelector);
      const formGroup = iframeElement.locator('xpath=ancestor::div[contains(@class, "govuk-form-group")]');
      errorLocator = formGroup.locator(this.descriptionFieldError);

    } else {
      throw new Error(`Unknown fieldType "${fieldType}" provided to getFieldError.`);
    }

    await expect(errorLocator).toBeVisible({ timeout: 5000 });
    return (await errorLocator.textContent()).trim();
  }


  /**
   * Gets the Locator for the nth visible facility fieldset (0-based index).
   * Uses the selector that includes the template.
   * @param {number} index - The zero-based index.
   * @returns {import('@playwright/test').Locator}
   */
  getNthVisibleFieldset(index) {
    return this.page.locator(this.allVisibleFieldsetsSelector).nth(index);
  }

  /**
   * Gets the Locator for the last visible facility fieldset.
   * Uses the selector that includes the template.
   * @returns {import('@playwright/test').Locator}
   */
  getLastVisibleFieldset() {
    return this.page.locator(this.allVisibleFieldsetsSelector).last();
  }

  /**
   * Gets the number of currently visible facility fieldsets.
   * Uses the selector that includes the template.
   * @returns {Promise<number>}
   */
  async getVisibleFieldsetCount() {
    return await this.page.locator(this.allVisibleFieldsetsSelector).count();
  }
}

module.exports = { FacilitiesPage };
