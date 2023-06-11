import {expect} from 'chai';
import { I } from '../utlis/codecept-util';


export class FunctionalTestHelpers {

  public static async clickButtonAndCheckFieldsetAdded(containerId: string, buttonName: string, fieldsetClass = '') {
    const fieldsetSelector = `${containerId} fieldset${fieldsetClass}`;
    const numFieldsets = await I.grabNumberOfVisibleElements(fieldsetSelector);
    await this.clickButton(containerId, buttonName);

    const updatedNumFieldsets = await I.grabNumberOfVisibleElements(fieldsetSelector);
    expect(updatedNumFieldsets - numFieldsets).equal(1);
  }

  public static async clearFieldsetsAndSave(containerId: string, deleteButtonName: string, saveButtonName: string) {
    const fieldsetSelector = `${containerId} fieldset`;
    const fieldsetCount = await I.grabNumberOfVisibleElements(fieldsetSelector);
    // Remove all fieldsets except the empty new one and the template
    for (let i = fieldsetCount; i > 1; i--) {
      await this.clickButton(containerId, deleteButtonName);
      const updatedFieldsetCount = await I.grabNumberOfVisibleElements(fieldsetSelector);
      expect(i - updatedFieldsetCount).equal(1);
    }
    await this.clickButton(containerId, saveButtonName);
  }

  public static async clickButton(containerId: string, buttonName: string) {
    const selector = `${containerId} button[name="${buttonName}"]`;
    I.seeElement(selector);
    await I.click(selector);
  }

  public static async checkGreenMessageSuccess(selector: string, message: string)  {
    I.seeElement(selector);
    const messageUpdate = await I.grabTextFrom(selector);
    expect(messageUpdate.trim()).equal(message);
  }
}
