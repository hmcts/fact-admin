import {I} from '../utlis/codecept-util';
import {expect} from 'chai';

Then ('I can see the court postcodes appear in alpha numeric order', async ()=> {
  const selector = '//*[@id="postcodesList"]';
  I.seeElement(selector);

  const courtPostcodes = await I.grabHTMLFrom(selector);
  let arrayOfPostcodes = courtPostcodes.match(/(?<=for=")(.*?)(?=">)/g);
  if(arrayOfPostcodes == null){
    arrayOfPostcodes = [];
  }
  const arrayOfPostcodesToSort = [...arrayOfPostcodes];

  const isTheSame = arrayOfPostcodesToSort.sort().join() === arrayOfPostcodes.join();
  expect(isTheSame).equal(true);
});
