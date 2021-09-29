import { When,Then } from 'cucumber';
import * as I from '../utlis/puppeteer.util';
import { expect } from 'chai';


When('I click on audits link', async () => {
  const selector = '#audits';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);

  // const btnselector = '#searchAuditsBtn';
  // const elementExistbtn = await I.checkElement(btnselector);
  // expect(elementExistbtn).equal(true);
  // await I.click(btnselector);
});

When('I click on courts link', async () => {
  const selector = '#courts';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);

});
Then('I will save action start time', async () => {
  const startTime = new Date();
  console.log(".............test start time............" + startTime.toLocaleTimeString());
  //console.log(".............test end time............" + startTime.getSeconds());

});
Then('I will save action end time', async () => {
  const startTime = new Date();
  console.log(".............test end time............" + startTime.toLocaleTimeString());
  //console.log(".............test end time............" + startTime.getSeconds());

  //startTime.getTime().toLocaleString().localeCompare()
  //assertThat(LocalDateTime.now().minusSeconds(5).isBefore(lastAuditTime)).isEqualTo(true);
});

When('I select {string} from courts', async (court: string) => {
  const selector = '#searchLocation';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.selectItem(selector, court);
});

When('I click search button', async () => {
  const selector = '#searchAuditsBtn';
  const elementExist = await I.checkElement(selector);
  expect(elementExist).equal(true);
  await I.click(selector);
});


When('I count table rows', async () => {
  const startTime = new Date();
  const numOfRows = (await I.getTextFromElements('#auditResults > tbody > tr > td:nth-child(5)')) as string[];
  const size = numOfRows.length;

  console.log("number of rows ..................." + numOfRows[size-1]);

  console.log(".............test end time............" + startTime.toLocaleTimeString());


  const selector = '#tableContainer > div > p';
  let elementExist = await I.checkElement(selector);

  const selectorNext = '#auditNext';
  const elementExistNext = await I.checkElement(selectorNext);
  expect(elementExistNext).equal(true);

  const selectorPrevious = '#auditPrevious';
  const elementExistPrevious = await I.checkElement(selectorPrevious);
  expect(elementExistPrevious).equal(true);

  while (elementExist == false)
  {
    await I.click(selectorNext);
    elementExist = await I.checkElement(selector);
  }
  await I.click(selectorPrevious);

  // const numOfRows = (await I.getTextFromElements('#auditResults > tbody > tr > td:nth-child(5)')) as string[];
  // const size = numOfRows.length;
  //
  // console.log("number of rows ..................." + numOfRows[size-1]);


});


//#tableContainer > div > p
//const areasOfLaw = (await I.getHtmlFromElements('#areasOfLawListContent > table > tbody > tr > td:nth-child(1)')) as string[];
//#auditResults > tbody > tr:nth-child(2) > td:nth-child(2)
//let index = areasOfLaw.findIndex(aol => aol.toLowerCase() === pageLink.toLowerCase());
