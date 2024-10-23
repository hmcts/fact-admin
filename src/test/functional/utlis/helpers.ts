import { I } from '../utlis/codecept-util';

export class FunctionalTestHelpers {

  public static async clickButton(containerId: string, buttonName: string) {
    const selector = `${containerId} button[name="${buttonName}"]`;
    I.seeElement(selector);
    await I.click(selector);
  }
}
