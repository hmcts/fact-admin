import * as I from './puppeteer.util';
import {expect} from 'chai';

export class FunctionalTestHelpers {

  public static async clickButtonAndCheckFieldsetAdded(containerId: string, buttonName: string, fieldsetClass = '') {
    const fieldsetSelector = `${containerId} fieldset${fieldsetClass}`;
    const numFieldsets = await I.countElement(fieldsetSelector);
    await this.clickButton(containerId, buttonName);

    const updatedNumFieldsets = await I.countElement(fieldsetSelector);
    expect(updatedNumFieldsets - numFieldsets).equal(1);
  }

  public static async clearFieldsetsAndSave(containerId: string, deleteButtonName: string, saveButtonName: string) {
    const fieldsetSelector = `${containerId} fieldset`;
    const fieldsetCount = await I.countElement(fieldsetSelector);
    // Remove all fieldsets except the empty new one and the template
    for (let i = fieldsetCount; i > 2; i--) {
      await this.clickButton(containerId, deleteButtonName);
      const updatedFieldsetCount = await I.countElement(fieldsetSelector);
      expect(i - updatedFieldsetCount).equal(1);
    }
    await this.clickButton(containerId, saveButtonName);
  }

  public static async clickButton(containerId: string, buttonName: string) {
    const selector = `${containerId} button[name="${buttonName}"]`;
    const elementExist = await I.checkElement(selector);
    expect(elementExist).equal(true);
    await I.click(selector);
  }

  public static async checkGreenMessageSuccess(selector: string, message: string)  {
    expect(await I.checkElement(selector)).equal(true);
    const messageUpdate = await I.getElement(selector);
    expect(await I.getElementText(messageUpdate)).equal(message);
  }
}
