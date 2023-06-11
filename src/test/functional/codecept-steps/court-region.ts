import { I } from '../utlis/codecept-util';

Then('I can view the courts regions', async () => {
  I.seeElement('#regionSelector');
});

When('I select the region Yorkshire and the Humber {string}', async (region: string) => {
  const selector = '#regionSelector';
  I.seeElement(selector);
  await I.selectOption(selector, region);
});

Then( 'I can see the courts {string} and {string} in the list', async (bradfordCourt: string,leedsCourt: string) => {
  I.seeElement('#edit-' + bradfordCourt);
  I.seeElement('#edit-' + leedsCourt);
});
