import * as I from './puppeteer.util';
import {expect} from 'chai';

export class FunctionalTestHelpers {

  public static async clickButtonAndCheckFieldsetAdded(containerId: string, buttonName: string, fieldsetClass = '') {
    const fieldsetSelector = `${containerId} fieldset${fieldsetClass}`;
    const numFieldsets = await I.countElement(fieldsetSelector);

    const selector = `button[name="${buttonName}"]`;
    const elementExist = await I.checkElement(selector);
    expect(elementExist).equal(true);
    await I.click(selector);

    const updatedNumFieldsets = await I.countElement(fieldsetSelector);
    expect(updatedNumFieldsets - numFieldsets).equal(1);
  }

  public static async clearFieldsets(containerId: string, deleteButtonName: string, saveButtonName: string) {
    const fieldsetSelector = `${containerId} fieldset`;
    const fieldsetCount = await I.countElement(fieldsetSelector);
    // Remove all fieldsets except the empty new one and the template
    for (let i = fieldsetCount; i > 2; i--) {
      const deleteButtonSelector = `${containerId} button[name="${deleteButtonName}"]`;
      const elementExist = await I.checkElement(deleteButtonSelector);
      expect(elementExist).equal(true);
      await I.click(deleteButtonSelector);

      const updatedFieldsetCount = await I.countElement(fieldsetSelector);
      expect(i - updatedFieldsetCount).equal(1);
    }
    await this.save(containerId, saveButtonName);
  }

  public static async save(containerId: string, buttonName: string) {
    const selector = `${containerId} button[name="${buttonName}"]`;
    const elementExist = await I.checkElement(selector);
    expect(elementExist).equal(true);
    await I.click(selector);
  }
}
