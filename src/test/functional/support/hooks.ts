import {BeforeAll, AfterAll, After, setDefaultTimeout, Before} from 'cucumber';
import puppeteer from 'puppeteer';
import { puppeteerConfig } from '../puppeteer.config';
import {FeatureFlagHelper} from '../utlis/feature-flag-helper';
import {
  FACT_ADMIN_TAB_OPENING_HOURS,
  // FACT_ADMIN_TAB_ADDITIONAL_LINKS,
  // FACT_ADMIN_TAB_CASES_HEARD
} from '../../../main/app/feature-flags/flags';

const scope = require('./scope');

export const launchBrowser = async () => {
  scope.browser = await puppeteer.launch(puppeteerConfig);
};
const f = new FeatureFlagHelper();
export const flagy = async () => {
  await f.init();
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

Before(async (scenario) => {
  console.log(scenario.pickle.tags);
  scenario.pickle.tags.forEach(function (obj){
    if(obj.name == '@opening_hours' && !f.getLocalFlag(FACT_ADMIN_TAB_OPENING_HOURS)){
      console.log('----- skipped '+obj.name+' ----');
      return 'skipped' as any;
    }
    else
    {
      console.log('----- ran '+obj.name+' ----');
    }
  });
  //remove else statement when done

});
