import {After, AfterAll, Before, BeforeAll, setDefaultTimeout} from 'cucumber';
import puppeteer from 'puppeteer';
import {puppeteerConfig} from '../puppeteer.config';
import {FeatureFlagHelper} from '../utlis/feature-flag-helper';

const scope = require('./scope');

export const launchBrowser = async () => {
  scope.browser = await puppeteer.launch(puppeteerConfig);
};
const f = new FeatureFlagHelper();
let allFlags: { [p: string]: boolean } | void;
export const flagy = async () => {
  await f.init();
};

setDefaultTimeout(puppeteerConfig.defaultTimeout);

BeforeAll(async () => {
  puppeteerConfig.username = process.env.OAUTH_USER;
  puppeteerConfig.superUsername = process.env.OAUTH_SUPER_USER;
  puppeteerConfig.password = process.env.OAUTH_USER_PASSWORD;
  await launchBrowser();
  await f.init();
  allFlags = f.getAllFlags();
});

After(async () => {
  if (scope.page && scope.page.currentPage) {
    scope.page.currentPage.close();
  }
});

AfterAll(async () => {
  if (scope.browser) {
    await scope.browser.close();
  }

});

Before(async (scenario) => {

  const tagName = scenario.pickle.tags.length > 0 ? scenario.pickle.tags[0].name.replace('@', '') : 'no tag found'

  // Note: all together in one
  // @ts-ignore
  return (!allFlags[tagName] && tagName !== 'no tag found') ? 'skipped': 'run';

  // Note: can uncomment below for console logs
  // if (!allFlags[tagName] && tagName !== 'no tag found') {
  //   console.log('Skipped tests in: ' + scenario.sourceLocation.uri + ' for tag: ' + tagName);
  //   return 'skipped' as any;
  // }
  // else {
  //   console.log('Running tests in: ' + scenario.sourceLocation.uri + ' for tag: ' + tagName);
  //   return 'run' as any;
  // }

});

// Before(async () =>  {
//   const f = new FeatureFlagHelper();
//   f.init();
//   f.getLocalFlag(FACT_ADMIN_TAB_OPENING_HOURS);
//   if(!f.getLocalFlag(FACT_ADMIN_TAB_OPENING_HOURS))
//   {console.log('>>> skipped');
//     return 'run' as any;}
// });

// Before(async (scenario) => {
//
//   console.log(scenario.pickle.tags);
//   scenario.pickle.tags.forEach(function (obj){
//     if(obj.name == '@opening_hours' && !f.getLocalFlag(FACT_ADMIN_TAB_OPENING_HOURS)){
//       console.log('----- skipped '+obj.name+' ----');
//       return 'skipped' as any;
//     }
//     else
//     {
//       console.log('----- ran '+obj.name+' ----');
//     }
//   });
//   //remove else statement when done
//
// });
