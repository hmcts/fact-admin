import {BeforeAll, AfterAll, After, setDefaultTimeout} from 'cucumber';
import puppeteer from 'puppeteer';
import { puppeteerConfig } from '../puppeteer.config';
// import {FeatureFlagHelper} from "../utlis/feature-flag-helper";
// import {FACT_ADMIN_TAB_OPENING_HOURS} from "../../../main/app/feature-flags/flags";

const scope = require('./scope');

export const launchBrowser = async () => {
  scope.browser = await puppeteer.launch(puppeteerConfig);
};

setDefaultTimeout(puppeteerConfig.defaultTimeout);

BeforeAll(async () => {
  puppeteerConfig.username = process.env.OAUTH_USER;
  puppeteerConfig.superUsername = process.env.OAUTH_SUPER_USER;
  puppeteerConfig.password = process.env.OAUTH_USER_PASSWORD;
  await launchBrowser();
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

// Before( { tags: '@ignore' }, function () {
//   return 'skipped' as any;
// });

// Before(async () => {
//   const f = new FeatureFlagHelper();
//   await f.init();
//   f.getLocalFlag(FACT_ADMIN_TAB_OPENING_HOURS);
//   if(f.getLocalFlag(FACT_ADMIN_TAB_OPENING_HOURS)) {
//     console.log("-------------------------beforeAll.................");
//     return 'skipped' as any;
//   }
//});
