import { I } from '../utlis/codecept-util';
Then('the {string} tab is visible', async (selector: string) => {
  I.seeElement(selector);
});

Then('the {string} tab is not visible', async (selector: string) => {
  I.dontSeeElement(selector);
});
