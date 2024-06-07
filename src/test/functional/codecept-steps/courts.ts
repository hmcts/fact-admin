import {expect} from 'chai';
import {NewCourt} from '../../../main/types/NewCourt';
import {generateCourtName} from '../utlis/dataGenerator';
const container = require('codeceptjs').container;

const { I } = inject();

Then('I can view the courts or tribunals in a list format', async () => {
  I.seeElement('#courts');
});

Given('they are in alphabetical order', async () => {
  const courts = await I.grabTextFromAll('#courts > tbody > tr > td:first-child');
  console.log('courts');
  expect(courts).not.equal([]);
  expect(courts).equals(courts.sort());
});

When('I click edit next to court with {string}', async (courtSlug: string) => {
  I.seeElement('#edit-' + courtSlug);
  I.click('#edit-' + courtSlug);
});

Then('I am redirected to the Edit Court page for the {string}', async (courtName: string) => {
  const pageTitle = await I.grabTitle();
  const editCourtHeadingText = await I.grabTextFrom('#court-name');
  expect(pageTitle).equal('Edit Court');
  expect(editCourtHeadingText.trim()).equal('Editing - ' + courtName);
  await I.seeElement('#courts');
  await I.seeElement('#my-account');
  await I.seeElement('#logout');
  await I.seeElement('#view-in-new-window');
  await I.seeElement('#general');
});

When('I click view next to court with {string}', async (courtSlug: string) => {
  const selector = '#view-' + courtSlug;
  I.seeElement(selector);
  await I.click(selector);
});

Then('I am redirected to the View Court page for the {string}', async (courtName: string) => {
  const selector = '#main-content > div > div > h1';
  I.seeElement(selector);
  expect((await I.grabTextFrom(selector)).trim()).equal(courtName);
});

When('a court is created through the API', async() => {
  const court = await I.createCourtThroughApi({
    'new_court_name': generateCourtName(),
    'service_centre': false,
    lon: -1.826323,
    lat: 51.178844,
    'service_areas': []
  } as NewCourt);

  await container.share({court}, {local: true});
});

When('a service centre court is created through the API', async() => {
  const court = await I.createCourtThroughApi({
    'new_court_name': generateCourtName(),
    'service_centre': true,
    lon: -1.826323,
    lat: 51.178844,
    'service_areas': ['Money claims']
  } as NewCourt);

  await container.share({court}, {local: true});
});

When('I click edit next to the test court', () => {
  const { court } = inject() as any;
  I.seeElement('#edit-' + court.slug);
  I.click('#edit-' + court.slug);
});

Then('the court is cleaned up through the API', async () => {
  const { court } = inject() as any;
  await I.deleteCourtThroughApi(court.slug);
});

When('I select test court from courts', async () => {
  const { court } = inject() as any;
  const selector = '#searchLocation';
  I.seeElement(selector);
  I.selectOption(selector, court.slug);
});
