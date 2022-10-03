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
    console.log('goes into after');
    scope.page.currentPage.close();
  }
});

AfterAll(async () => {
  if (scope.browser) {
    console.log('goes into after all, in the if');
    await scope.browser.close();
  } else {
    console.log('goes into after all, in the else');
  }

});

Before(async (scenario) => {

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const falseTagValues = scenario.pickle.tags.filter(item => !allFlags[item.name.replace('@', '')]);
  return falseTagValues.length > 0 ? 'skipped' : 'run';

});
